// Edge Function URL - update this to your deployed function URL
const AUTH_FUNCTION_URL = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/auth';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  error?: string;
}

export interface MFAFactor {
  id: string;
  friendly_name: string;
  factor_type: 'totp' | 'phone';
  status: 'verified' | 'unverified';
}

export interface MFAEnrollResponse {
  factor: {
    id: string;
    totp: {
      qr_code: string;
      secret: string;
    };
  };
}

export interface MFAChallengeResponse {
  challenge: {
    id: string;
  };
}

class AuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private async makeRequest(body: any, requireAuth: boolean = true): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Only add Authorization header if auth is required and we have a token
    if (requireAuth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    console.log('🌐 Making request to:', AUTH_FUNCTION_URL);
    console.log('📦 Request body:', body);
    console.log('🔑 Require auth:', requireAuth);
    console.log('📋 Headers:', headers);

    const response = await fetch(AUTH_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error response:', error);
      throw new Error(error.error || 'Network error');
    }

    const result = await response.json();
    console.log('✅ Success response:', result);
    return result;
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'signin',
        email,
        password
      }, false); // Don't require auth for sign in

      if (result.accessToken && result.refreshToken) {
        this.setTokens(result.accessToken, result.refreshToken);
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async signInWithGoogle(): Promise<{ data?: any; error?: string }> {
    try {
      // For now, let's directly use Supabase's OAuth URL generation
      // Since the Edge Function approach isn't working properly
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://xchgmvpzygpenccnidtq.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaGdtdnB6eWdwZW5jY25pZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5OTE1NjEsImV4cCI6MjA0MTU2NzU2MX0.6gcG7fFqX2Gf6bLM1JtUHBYv6n6qI5-qFAD7VQxY9F4';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: (error as Error).message };
    }
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'google-callback',
        code
      }, false); // Don't require auth for callback

      if (result.accessToken && result.refreshToken) {
        this.setTokens(result.accessToken, result.refreshToken);
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async refreshAccessToken(): Promise<{ accessToken?: string; error?: string }> {
    if (!this.refreshToken) {
      return { error: 'No refresh token available' };
    }

    try {
      const result = await this.makeRequest({
        action: 'refresh',
        refresh_token: this.refreshToken
      });

      if (result.accessToken) {
        this.accessToken = result.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', result.accessToken);
        }
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async verifyToken(token?: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'verify',
        token: token || this.accessToken
      });

      return result;
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.makeRequest({
        action: 'logout',
        refresh_token: this.refreshToken,
        token: this.accessToken
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // MFA Methods
  async enrollMFA(): Promise<{ factor?: MFAEnrollResponse['factor']; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-enroll'
      });

      return { factor: result.factor };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async listMFAFactors(): Promise<{ factors?: { totp: MFAFactor[]; phone: MFAFactor[] }; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-list-factors'
      });

      return { factors: result.factors };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async createMFAChallenge(factorId: string): Promise<{ challenge?: { id: string }; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-challenge',
        factorId
      });

      return { challenge: result.challenge };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async verifyMFA(factorId: string, challengeId: string, code: string): Promise<{ accessToken?: string; user?: any; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-verify',
        factorId,
        challengeId,
        code
      });

      if (result.accessToken) {
        this.accessToken = result.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', result.accessToken);
        }
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async unenrollMFA(factorId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      await this.makeRequest({
        action: 'mfa-unenroll',
        factorId
      });

      return { success: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  getCurrentUser(): AuthUser | null {
    if (!this.accessToken) return null;

    try {
      // Decode JWT payload (basic decode, not verification)
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email || '',
        role: payload.role
      };
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}

export const authClient = new AuthClient();
