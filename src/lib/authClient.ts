// Edge Function URL
const AUTH_FUNCTION_URL = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/auth';

// Import debugging utilities
import { logAuthStep, logAuthError, checkEnvVars } from './authDebug';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthResponse {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  needsMFA?: boolean;
  error?: string;
  success?: boolean;
}

export interface MFAFactor {
  id: string;
  type: string;
  status: string;
  friendly_name?: string;
  totp?: {
    qr_code: string;
    secret: string;
  };
}

export interface MFAEnrollResponse {
  factor?: MFAFactor;
  qrCode?: string;
  secret?: string;
  error?: string;
}

export interface MFAChallengeResponse {
  challenge?: {
    id: string;
  };
  challengeId?: string;
  error?: string;
}

export interface MFAListResponse {
  factors?: {
    totp: MFAFactor[];
    phone?: MFAFactor[];
  };
  hasVerifiedFactors?: boolean;
  error?: string;
}

export interface MFAVerifyResponse {
  success?: boolean;
  accessToken?: string;
  user?: {
    id: string;
    role: string;
  };
  aal?: string;
  error?: string;
}

export interface VerifyResponse {
  valid: boolean;
  user?: {
    id: string;
    role: string;
    aal?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'owner';
}

class AuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage();
    }
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

  private saveTokensToStorage(accessToken: string, refreshToken: string, user: AuthUser) {
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

  private async makeRequest(body: any, requireAuth: boolean = true): Promise<any> {
    // Check environment variables first
    checkEnvVars();
    
    logAuthStep('REQUEST_START', {
      action: body.action,
      requireAuth,
      hasAccessToken: !!this.accessToken,
      url: AUTH_FUNCTION_URL
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };

    if (requireAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      logAuthStep('AUTH_HEADER_ADDED', { tokenLength: this.accessToken.length });
    }

    try {
      const response = await fetch(AUTH_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      logAuthStep('RESPONSE_RECEIVED', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        logAuthError('REQUEST_FAILED', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      logAuthStep('REQUEST_SUCCESS', {
        action: body.action,
        hasResult: !!result,
        resultKeys: Object.keys(result || {})
      });
      
      return result;
    } catch (error) {
      logAuthError('REQUEST_EXCEPTION', error);
      throw error;
    }
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'signin',
        email,
        password
      }, false);

      if (result.accessToken && result.refreshToken && result.user) {
        this.saveTokensToStorage(result.accessToken, result.refreshToken, result.user);
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'register',
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'user'
      }, false);

      if (result.accessToken && result.refreshToken && result.user) {
        this.saveTokensToStorage(result.accessToken, result.refreshToken, result.user);
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async signInWithGoogle(): Promise<{ data?: any; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'google-signin'
      }, false);

      if (result.data && result.data.url) {
        // Redirect to Google OAuth
        window.location.href = result.data.url;
        return { data: result.data };
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return { data: { url: result.redirectUrl } };
      } else {
        return { error: 'No OAuth URL received' };
      }
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      logAuthStep('GOOGLE_CALLBACK_START', {
        codeLength: code.length,
        codePreview: code.substring(0, 20) + '...'
      });
      
      const result = await this.makeRequest({
        action: 'google-callback',
        code
      }, false);

      logAuthStep('GOOGLE_CALLBACK_RESPONSE', {
        success: result.success,
        hasUser: !!result.user,
        hasTokens: !!(result.accessToken && result.refreshToken),
        error: result.error,
        userEmail: result.user?.email,
        userRole: result.user?.role
      });

      if (result.accessToken && result.refreshToken && result.user) {
        logAuthStep('SAVING_TOKENS', {
          userEmail: result.user.email,
          userRole: result.user.role,
          userId: result.user.id
        });
        this.saveTokensToStorage(result.accessToken, result.refreshToken, result.user);
      }

      return result;
    } catch (error) {
      logAuthError('GOOGLE_CALLBACK_EXCEPTION', error);
      return { error: (error as Error).message };
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await this.makeRequest({
        action: 'refresh',
        refresh_token: this.refreshToken
      }, false);

      if (result.accessToken) {
        this.accessToken = result.accessToken;
        localStorage.setItem('evently_access_token', result.accessToken);
        return result.accessToken;
      }

      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  async verifyToken(): Promise<VerifyResponse | null> {
    try {
      if (!this.accessToken) {
        return null;
      }

      const result = await this.makeRequest({
        action: 'verify',
        token: this.accessToken
      }, false);

      return result;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.makeRequest({
        action: 'logout',
        refresh_token: this.refreshToken,
        token: this.accessToken
      }, false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // MFA Methods
  async enrollMFA(): Promise<MFAEnrollResponse> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-enroll'
      });

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async createMFAChallenge(factorId: string): Promise<MFAChallengeResponse> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-challenge',
        factorId
      });

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async verifyMFA(factorId: string, challengeId: string, verificationCode: string): Promise<MFAVerifyResponse> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-verify',
        factorId,
        challengeId,
        verificationCode
      });

      // Update access token if provided
      if (result.accessToken) {
        this.accessToken = result.accessToken;
        localStorage.setItem('evently_access_token', result.accessToken);
      }

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async listMFAFactors(): Promise<MFAListResponse> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-list-factors'
      });

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async unenrollMFA(factorId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      const result = await this.makeRequest({
        action: 'mfa-unenroll',
        factorId
      });

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Getters
  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.user);
  }
}

export const authClient = new AuthClient();
