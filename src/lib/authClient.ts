// Edge Function URL
// Environment variables
const AUTH_FUNCTION_URL = import.meta.env.VITE_AUTH_FUNCTION_URL || 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/auth';
const MFA_FUNCTION_URL = import.meta.env.VITE_MFA_FUNCTION_URL || 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/mfa-totp';

// Import debugging utilities
import { logAuthStep, logAuthError, checkEnvVars } from './authDebug';
import { getCallbackUrl, logEnvironmentInfo } from './environmentUtils';

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
  requiresMFA?: boolean;
  needsMFA?: boolean;
  tempToken?: string;
  error?: string;
  success?: boolean;
  sessionStatus?: {
    loginStep: string;
    mfaVerified: boolean;
    mfaRequired: boolean;
    tempTokenId?: string;
    verifiedAt?: string;
  };
  message?: string;
  nextStep?: string;
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

// TOTP MFA Interfaces
export interface TOTPSetupResponse {
  success?: boolean;
  error?: string;
  data?: {
    secret?: string;
    qrCodeURL?: string;
    backupCodes?: string[];
    setupComplete?: boolean;
    enabled?: boolean;
  };
  message?: string;
}

export interface TOTPVerifyResponse {
  success?: boolean;
  error?: string;
  data?: {
    enabled?: boolean;
    verified?: boolean;
    verifiedAt?: string;
    method?: string;
    warning?: string;
  };
  message?: string;
}

export interface TOTPStatusResponse {
  success?: boolean;
  error?: string;
  data?: {
    configured?: boolean;
    enabled?: boolean;
    backupCodesCount?: number;
    lastUpdated?: string;
  };
  message?: string;
}

export interface TOTPBackupCodesResponse {
  success?: boolean;
  error?: string;
  data?: {
    backupCodes?: string[];
    generatedAt?: string;
    warning?: string;
  };
  message?: string;
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
  role?: 'member' | 'owner';
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface ResendVerificationRequest {
  email: string;
}

class AuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;

  // Normalize error objects/messages into a clean string for UIs
  private formatError(error: any): string {
    try {
      // If it's already a string
      if (typeof error === 'string') return error;

      // If it's an Error instance
      if (error instanceof Error && typeof (error as any).message === 'string') {
        // Try to pull JSON embedded in the message
        const msg = (error as any).message;
        try {
          const parsed = JSON.parse(msg);
          if (parsed?.error) return parsed.error;
        } catch (_) {
          // not JSON - continue
        }
        return msg;
      }

      // If it's an object returned from fetch errorText JSON
      if (error && typeof error === 'object') {
        if (typeof error.error === 'string') return error.error;
        if (typeof error.message === 'string') {
          // handle embedded JSON in message
          try {
            const parsed = JSON.parse(error.message);
            if (parsed?.error) return parsed.error;
          } catch (_) {
            return error.message;
          }
        }
      }

      // Fallback to JSON stringify
      return JSON.stringify(error);
    } catch (e) {
      return String(error);
    }
  }

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

  private async makeMFARequest(body: any, requireAuth: boolean = true): Promise<any> {
    // Check environment variables first
    checkEnvVars();
    
    logAuthStep('MFA_REQUEST_START', {
      action: body.action,
      requireAuth,
      hasAccessToken: !!this.accessToken,
      url: MFA_FUNCTION_URL
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };

    if (requireAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      logAuthStep('MFA_AUTH_HEADER_ADDED', { tokenLength: this.accessToken.length });
    }

    try {
      const response = await fetch(MFA_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      logAuthStep('MFA_RESPONSE_RECEIVED', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        logAuthError('MFA_REQUEST_FAILED', {
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
      logAuthStep('MFA_REQUEST_SUCCESS', {
        action: body.action,
        hasResult: !!result,
        resultKeys: Object.keys(result || {})
      });
      
      return result;
    } catch (error) {
      logAuthError('MFA_REQUEST_EXCEPTION', error);
      throw error;
    }
  }

  // Authentication methods
  async signIn(email: string, password: string, recaptchaToken?: string): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'signin',
        email,
        password,
        recaptchaToken
      }, false);

      console.log('🔍 AuthClient signIn raw response with MFA flags:', {
        success: result.success,
        requiresMFA: result.requiresMFA,
        mfaRequired: result.mfaRequired,
        hasTempToken: !!result.tempToken,
        hasUser: !!result.user,
        hasAccessToken: !!result.accessToken,
        sessionStatus: result.sessionStatus,
        message: result.message,
        nextStep: result.nextStep,
        error: result.error
      });

      // Si hay token de acceso exitoso (login completo sin MFA)
      if (result.accessToken && result.refreshToken && result.user && !result.requiresMFA) {
        console.log('✅ Complete login without MFA - saving tokens');
        this.saveTokensToStorage(result.accessToken, result.refreshToken, result.user);
      }

      // Mapear ambos mfaRequired y requiresMFA de la respuesta del servidor
      if (result.requiresMFA || result.mfaRequired) {
        console.log('🔐 MFA detected with flag system, setting mfaRequired = true');
        result.mfaRequired = true;
      }

      // Retornar la respuesta completa incluyendo sessionStatus
      return {
        success: result.success,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        mfaRequired: result.mfaRequired,
        requiresMFA: result.requiresMFA,
        tempToken: result.tempToken,
        sessionStatus: result.sessionStatus,
        message: result.message,
        nextStep: result.nextStep,
        error: result.error
      };
    } catch (error) {
      console.error('❌ AuthClient signIn error with flag system:', error);
      return { error: this.formatError(error) };
    }
  }

  async register(data: RegisterRequest, recaptchaToken?: string): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'register',
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'member', // Cambiar default de 'user' a 'member'
        recaptchaToken
      }, false);

      // Para registro, NO guardamos tokens inmediatamente porque necesita verificación por email
      return result;
    } catch (error) {
      return { error: this.formatError(error) };
    }
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'verify-email',
        email: data.email,
        verificationCode: data.verificationCode
      }, false);

      return result;
    } catch (error) {
      return { error: this.formatError(error) };
    }
  }

  async resendVerification(data: ResendVerificationRequest): Promise<AuthResponse> {
    try {
      const result = await this.makeRequest({
        action: 'resend-verification',
        email: data.email
      }, false);

      return result;
    } catch (error) {
      return { error: this.formatError(error) };
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

      console.log('🔍 AuthClient refreshAccessToken response with flag system:', {
        success: result.success,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        hasUser: !!result.user,
        sessionStatus: result.sessionStatus
      });

      if (result.accessToken && result.refreshToken && result.user) {
        // Actualizar todos los tokens y datos del usuario
        this.saveTokensToStorage(result.accessToken, result.refreshToken, result.user);
        
        console.log('✅ Tokens refreshed successfully with flag system');
        return result.accessToken;
      }

      throw new Error(result.error || 'Failed to refresh token');
    } catch (error) {
      console.error('❌ Token refresh failed with flag system:', error);
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

  // TOTP MFA Methods
  async setupMFA(userId: string, email: string): Promise<TOTPSetupResponse> {
    try {
      const result = await this.makeMFARequest({
        action: 'setup-mfa',
        userId,
        email
      }, false);

      return result;
    } catch (error) {
      return { error: this.formatError(error) };
    }
  }

  async verifyMFASetup(userId: string, totpCode: string): Promise<TOTPVerifyResponse> {
    try {
      const result = await this.makeMFARequest({
        action: 'verify-setup',
        userId,
        totpCode
      }, false);

      return result;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async verifyMFALogin(tempToken: string, totpCode?: string, backupCode?: string): Promise<TOTPVerifyResponse> {
    try {
      const result = await this.makeRequest({
        action: 'verify-mfa-login',
        tempToken,
        totpCode,
        backupCode
      }, false);

      console.log('🔍 AuthClient verifyMFALogin response with flag system:', {
        success: result.success,
        hasUser: !!result.user,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        sessionStatus: result.sessionStatus,
        mfaData: result.mfaData,
        message: result.message
      });

      // Si es exitoso y tenemos tokens, guardarlos
      if (result.success && result.accessToken && result.refreshToken && result.user) {
        console.log('✅ MFA verification successful - saving tokens with flag system');
        this.saveTokensToStorage(result.accessToken, result.refreshToken, result.user);
      }

      return {
        success: result.success,
        error: result.error,
        data: {
          method: result.mfaData?.method,
          verifiedAt: result.mfaData?.verifiedAt || result.sessionStatus?.verifiedAt,
          warning: result.mfaData?.warning,
          verified: result.success,
          enabled: true // Si llegamos aquí, el MFA está habilitado
        },
        message: result.message
      };
    } catch (error) {
      console.error('❌ AuthClient verifyMFALogin error with flag system:', error);
      return { error: this.formatError(error) };
    }
  }

  async getMFAStatus(userId: string): Promise<TOTPStatusResponse> {
    try {
      const result = await this.makeMFARequest({
        action: 'get-status',
        userId
      }, false);

      return result;
    } catch (error) {
      return { error: this.formatError(error) };
    }
  }

  async disableMFA(userId: string, totpCode: string): Promise<TOTPVerifyResponse> {
    try {
      const result = await this.makeMFARequest({
        action: 'disable-mfa',
        userId,
        totpCode
      }, false);

      return result;
    } catch (error) {
      return { error: this.formatError(error) };
    }
  }

  async generateBackupCodes(userId: string, totpCode: string): Promise<TOTPBackupCodesResponse> {
    try {
      const result = await this.makeMFARequest({
        action: 'generate-backup-codes',
        userId,
        totpCode
      }, false);

      return result;
    } catch (error) {
      return { error: this.formatError(error) };
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

  getStoredTokens(): { access_token: string | null; refresh_token: string | null } {
    return {
      access_token: this.accessToken,
      refresh_token: this.refreshToken
    };
  }
}

export const authClient = new AuthClient();
