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
        setIsMfaEnabled(true);
        logAuthStep('VERIFY_MFA_SETUP_SUCCESS', { userId: user.id });
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

      const result = await authClient.getMFAStatus(user.id);
      
      if (result.success && result.data) {
        setIsMfaEnabled(result.data.enabled || false);
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
        setIsMfaEnabled(false);
        logAuthStep('DISABLE_MFA_SUCCESS', { userId: user.id });
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

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check if user has valid tokens
      const currentUser = authClient.getCurrentUser();
      
      if (currentUser && authClient.getAccessToken()) {
        // Verify token is still valid
        const verification = await authClient.verifyToken();
        
        if (verification && verification.valid) {
          setUser(currentUser);
          // Check MFA status for authenticated user
          await checkMfaStatus();
        } else {
          // Token is invalid, clear state
          setUser(null);
        }
      }
      
      setIsLoading(false);
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


  const enrollMfa = async (): Promise<{ qrCode: string; secret: string; factorId: string } | null> => {
    try {
      const result = await authClient.enrollMFA();
      
      if (result.error || !result.factor) {
        console.error('Error enrolling MFA:', result.error);
        return null;
      }

      return {
        qrCode: result.factor.totp.qr_code,
        secret: result.factor.totp.secret,
        factorId: result.factor.id
      };
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      return null;
    }
  };

  const verifyAndEnableMfa = async (code: string, factorId: string): Promise<boolean> => {
    try {
      console.log('Starting MFA verification with:', { codeLength: code.length, code, factorId });
      
      if (code.length !== 6) {
        console.error('Invalid code length:', code.length);
        return false;
      }
      
      // First create a challenge for the factor
      const challengeResult = await authClient.createMFAChallenge(factorId);

      if (challengeResult.error || !challengeResult.challenge) {
        console.error('Error creating MFA challenge:', challengeResult.error);
        return false;
      }

      console.log('Challenge created:', challengeResult.challenge);

      // Then verify the code against the challenge
      console.log('🔐 About to verify MFA code with challenge ID:', challengeResult.challenge.id);
      
      const verifyResult = await authClient.verifyMFA(factorId, challengeResult.challenge.id, code);

      console.log('🔐 MFA verification response:', verifyResult);

      if (verifyResult.error) {
        console.error('Error verifying MFA code:', verifyResult.error);
        return false;
      }

      console.log('MFA verification successful, updating state');
      
      // If verification is successful, check MFA status
      await checkMfaStatus();
      return true;
    } catch (error) {
      console.error('Error verifying MFA enrollment:', error);
      return false;
    }
  };

  const verifyMfaLogin = async (code: string, factorId: string, challengeId: string): Promise<boolean> => {
    try {
      console.log('🔒 Verifying MFA for login with:', { codeLength: code.length, factorId, challengeId });
      
      if (code.length !== 6) {
        console.error('Invalid code length:', code.length);
        return false;
      }
      
      const verifyResult = await authClient.verifyMFA(factorId, challengeId, code);

      console.log('🔒 MFA login verification response:', verifyResult);

      if (verifyResult.error) {
        console.error('Error verifying MFA login code:', verifyResult.error);
        return false;
      }

      if (verifyResult.accessToken && verifyResult.user) {
        console.log('🔒 MFA login verification successful');
        
        // Update user state with the new token that has aal2
        setUser({
          id: verifyResult.user.id,
          email: user?.email || '',
          role: verifyResult.user.role
        });
        
        return true;
      }

      console.log('🔒 No access token returned');
      return false;
    } catch (error) {
      console.error('Error verifying MFA login:', error);
      return false;
    }
  };

  const verifyMfaChallenge = async (code: string, factorId: string): Promise<boolean> => {
    try {
      // This function creates a challenge and then verifies it
      const challengeResult = await authClient.createMFAChallenge(factorId);
      
      if (challengeResult.error || !challengeResult.challenge) {
        return false;
      }

      const verifyResult = await authClient.verifyMFA(factorId, challengeResult.challenge.id, code);
      return !verifyResult.error;
    } catch (error) {
      console.error('Error verifying MFA challenge:', error);
      return false;
    }
  };

  const unenrollMfa = async (factorId?: string): Promise<boolean> => {
    try {
      let targetFactorId = factorId;
      
      // If no factorId provided, get the first verified factor
      if (!targetFactorId) {
        const factorsResult = await authClient.listMFAFactors();
        
        if (factorsResult.error) {
          console.error('Error listing factors for unenroll:', factorsResult.error);
          return false;
        }

        const verifiedFactor = factorsResult.factors?.totp.find(factor => factor.status === 'verified');
        if (!verifiedFactor) {
          console.error('No verified MFA factor found');
          return false;
        }
        
        targetFactorId = verifiedFactor.id;
      }

      const result = await authClient.unenrollMFA(targetFactorId);

      if (result.error) {
        console.error('Error unenrolling MFA:', result.error);
        return false;
      }

      setIsMfaEnabled(false);
      return true;
    } catch (error) {
      console.error('Error unenrolling MFA:', error);
      return false;
    }
  };

  const signInWithMfa = async (email: string, password: string): Promise<{ requiresMfa: boolean; mfaData?: any; error?: string; needsSetup?: boolean }> => {
    try {
      console.log('🔐 Starting sign in process...');
      
      const result = await authClient.signIn(email, password);
      
      if (result.error) {
        console.error('🔐 Sign in error:', result.error);
        return { requiresMfa: false, error: result.error };
      }

      // Check if MFA is required
      if (result.mfaRequired) {
        console.log('🔐 MFA required for user');
        
        // Get available MFA factors
        const factorsResult = await authClient.listMFAFactors();
        
        if (factorsResult.error) {
          console.error('🔐 Error listing MFA factors:', factorsResult.error);
          return { requiresMfa: false, error: 'Failed to get MFA factors' };
        }

        return { 
          requiresMfa: true, 
          mfaData: {
            factors: factorsResult.factors,
            user: result.user
          }
        };
      }

      // If no MFA required and we have access token, user is signed in
      if (result.accessToken && result.user) {
        console.log('🔐 Sign in successful without MFA');
        setUser({
          id: result.user.id,
          email: result.user.email || email,
          role: result.user.role
        });
        return { requiresMfa: false };
      }

      return { requiresMfa: false, error: 'Unknown error occurred' };
    } catch (error: any) {
      console.error('🔐 Error in signInWithMfa:', error);
      return { requiresMfa: false, error: error.message || "Connection error" };
    }
  };

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
    // Legacy MFA functions (para compatibilidad)
    enrollMfa,
    verifyAndEnableMfa,
    verifyMfaChallenge,
    unenrollMfa,
    signInWithMfa,
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
