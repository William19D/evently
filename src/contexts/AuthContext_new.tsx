import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient, type AuthUser, type TOTPSetupResponse, type TOTPVerifyResponse, type TOTPStatusResponse, type TOTPBackupCodesResponse } from '@/lib/authClient';
import { logAuthStep, logAuthError } from '@/lib/authDebug';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isMfaEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  // TOTP MFA functions
  checkMfaStatus: () => Promise<boolean>;
  setupMFA: () => Promise<TOTPSetupResponse>;
  verifyMFASetup: (code: string) => Promise<TOTPVerifyResponse>;
  verifyMFALogin: (code?: string, backupCode?: string) => Promise<TOTPVerifyResponse>;
  getMFAStatus: () => Promise<TOTPStatusResponse>;
  disableMFA: (code: string) => Promise<TOTPVerifyResponse>;
  generateBackupCodes: (code: string) => Promise<TOTPBackupCodesResponse>;
  // Email verification functions
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  // TOTP MFA functions
  const setupMFA = async (): Promise<TOTPSetupResponse> => {
    try {
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      logAuthStep('SETUP_MFA_START', { userId: user.id });

      const result = await authClient.setupMFA(user.id, user.email || '');
      
      if (result.success) {
        logAuthStep('SETUP_MFA_SUCCESS', { userId: user.id });
      } else {
        logAuthError('SETUP_MFA_FAILED', { error: result.error });
      }

      return result;
    } catch (error) {
      logAuthError('SETUP_MFA_ERROR', error);
      return { error: 'Error configurando MFA' };
    }
  };

  const verifyMFASetup = async (code: string): Promise<TOTPVerifyResponse> => {
    try {
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      logAuthStep('VERIFY_MFA_SETUP_START', { userId: user.id });

      const result = await authClient.verifyMFASetup(user.id, code);
      
      if (result.success) {
        logAuthStep('VERIFY_MFA_SETUP_SUCCESS', { userId: user.id });
        setIsMfaEnabled(true);
      } else {
        logAuthError('VERIFY_MFA_SETUP_FAILED', { error: result.error });
      }

      return result;
    } catch (error) {
      logAuthError('VERIFY_MFA_SETUP_ERROR', error);
      return { error: 'Error verificando configuración MFA' };
    }
  };

  const verifyMFALogin = async (code?: string, backupCode?: string): Promise<TOTPVerifyResponse> => {
    try {
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      logAuthStep('VERIFY_MFA_LOGIN_START', { userId: user.id });

      const result = await authClient.verifyMFALogin(user.id, code, backupCode);
      
      if (result.success) {
        logAuthStep('VERIFY_MFA_LOGIN_SUCCESS', { userId: user.id });
      } else {
        logAuthError('VERIFY_MFA_LOGIN_FAILED', { error: result.error });
      }

      return result;
    } catch (error) {
      logAuthError('VERIFY_MFA_LOGIN_ERROR', error);
      return { error: 'Error verificando MFA para login' };
    }
  };

  const getMFAStatus = async (): Promise<TOTPStatusResponse> => {
    try {
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      logAuthStep('GET_MFA_STATUS_START', { userId: user.id });

      const result = await authClient.getMFAStatus(user.id);
      
      if (result.success) {
        logAuthStep('GET_MFA_STATUS_SUCCESS', { userId: user.id });
        if (result.data) {
          setIsMfaEnabled(result.data.enabled || false);
        }
      } else {
        logAuthError('GET_MFA_STATUS_FAILED', { error: result.error });
      }

      return result;
    } catch (error) {
      logAuthError('GET_MFA_STATUS_ERROR', error);
      return { error: 'Error obteniendo estado MFA' };
    }
  };

  const disableMFA = async (code: string): Promise<TOTPVerifyResponse> => {
    try {
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      logAuthStep('DISABLE_MFA_START', { userId: user.id });

      const result = await authClient.disableMFA(user.id, code);
      
      if (result.success) {
        logAuthStep('DISABLE_MFA_SUCCESS', { userId: user.id });
        setIsMfaEnabled(false);
      } else {
        logAuthError('DISABLE_MFA_FAILED', { error: result.error });
      }

      return result;
    } catch (error) {
      logAuthError('DISABLE_MFA_ERROR', error);
      return { error: 'Error deshabilitando MFA' };
    }
  };

  const generateBackupCodes = async (code: string): Promise<TOTPBackupCodesResponse> => {
    try {
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      logAuthStep('GENERATE_BACKUP_CODES_START', { userId: user.id });

      const result = await authClient.generateBackupCodes(user.id, code);
      
      if (result.success) {
        logAuthStep('GENERATE_BACKUP_CODES_SUCCESS', { userId: user.id });
      } else {
        logAuthError('GENERATE_BACKUP_CODES_FAILED', { error: result.error });
      }

      return result;
    } catch (error) {
      logAuthError('GENERATE_BACKUP_CODES_ERROR', error);
      return { error: 'Error generando códigos de respaldo' };
    }
  };

  // MFA functions defined before useEffect
  const checkMfaStatus = async (): Promise<boolean> => {
    try {
      const result = await getMFAStatus();
      
      if (result.error) {
        console.error('Error checking MFA status:', result.error);
        return false;
      }

      const isEnabled = result.data?.enabled ?? false;
      setIsMfaEnabled(isEnabled);
      return isEnabled;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  };

  // Initialize user session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionData = await authClient.getCurrentUser();
        
        if (sessionData.user && !sessionData.error) {
          setUser({
            id: sessionData.user.id,
            email: sessionData.user.email || '',
            name: sessionData.user.user_metadata?.name || sessionData.user.user_metadata?.full_name || '',
            role: sessionData.user.user_metadata?.role || 'member'
          });
          
          await checkMfaStatus();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; mfaRequired?: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authClient.signIn(email, password);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.user) {
        setUser(response.user);
        
        if (response.mfaRequired) {
          return { success: true, mfaRequired: true };
        }
        
        await checkMfaStatus();
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authClient.signOut();
      setUser(null);
      setIsMfaEnabled(false);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification functions
  const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authClient.verifyEmail({ email, verificationCode: code });
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Error verifying email" };
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authClient.resendVerification({ email });
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Error resending verification" };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isMfaEnabled,
    signIn,
    signOut,
    checkMfaStatus,
    // New TOTP MFA functions
    setupMFA,
    verifyMFASetup,
    verifyMFALogin,
    getMFAStatus,
    disableMFA,
    generateBackupCodes,
    // Email verification functions
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
