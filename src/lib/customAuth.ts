import { supabase } from '@/integrations/supabase/client';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth`;

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface VerifyResponse {
  valid: boolean;
  user: {
    id: string;
    role: string;
  };
}

class CustomAuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('evently_access_token');
    this.refreshToken = localStorage.getItem('evently_refresh_token');
    const userData = localStorage.getItem('evently_user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearTokens();
      }
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string, user: any) {
    localStorage.setItem('evently_access_token', accessToken);
    localStorage.setItem('evently_refresh_token', refreshToken);
    localStorage.setItem('evently_user', JSON.stringify(user));
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }

  private clearTokens() {
    localStorage.removeItem('evently_access_token');
    localStorage.removeItem('evently_refresh_token');
    localStorage.removeItem('evently_user');
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        action: 'signin',
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.saveTokensToStorage(data.accessToken, data.refreshToken, data.user);
    return data;
  }

  // Sign in with Google OAuth
  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Handle Google callback
  async handleGoogleCallback(supabaseToken: string): Promise<AuthResponse> {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        action: 'google-callback',
        token: supabaseToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google login failed');
    }

    const data: AuthResponse = await response.json();
    this.saveTokensToStorage(data.accessToken, data.refreshToken, data.user);
    return data;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'refresh',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.accessToken = data.accessToken;
      localStorage.setItem('evently_access_token', data.accessToken);
      
      // Update user role if it changed
      if (this.user && data.role) {
        this.user.role = data.role;
        localStorage.setItem('evently_user', JSON.stringify(this.user));
      }

      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  // Verify current token
  async verifyToken(): Promise<VerifyResponse | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'verify',
          token: this.accessToken,
        }),
      });

      if (!response.ok) {
        // Try to refresh token if verification fails
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.verifyToken(); // Retry with new token
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'logout',
          refresh_token: this.refreshToken,
          token: this.accessToken,
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get access token
  getAccessToken() {
    return this.accessToken;
  }

  // Get refresh token
  getRefreshToken() {
    return this.refreshToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.accessToken && this.user);
  }
}

export const customAuth = new CustomAuthClient();
export type { AuthResponse, VerifyResponse };
