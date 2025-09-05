import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient, type AuthUser } from '@/lib/authClient';
import { logAuthStep, logAuthError } from '@/lib/authDebug';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isMfaEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkMfaStatus: () => Promise<boolean>;
  enrollMfa: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>;
  verifyAndEnableMfa: (code: string, factorId: string) => Promise<boolean>;
  verifyMfaLogin: (code: string, factorId: string, challengeId: string) => Promise<boolean>;
  verifyMfaChallenge: (code: string, factorId: string) => Promise<boolean>;
  unenrollMfa: (factorId?: string) => Promise<boolean>;
  signInWithMfa: (email: string, password: string) => Promise<{ requiresMfa: boolean; mfaData?: any; error?: string; needsSetup?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  // MFA functions defined before useEffect
  const checkMfaStatus = async (): Promise<boolean> => {
    try {
      const result = await authClient.listMFAFactors();
      
      if (result.error) {
        console.error('Error checking MFA status:', result.error);
        return false;
      }

      const isEnabled = result.factors?.totp?.some(factor => factor.status === 'verified') ?? false;
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

  const value: AuthContextType = {
    user,
    isLoading,
    isMfaEnabled,
    signIn,
    signOut,
    checkMfaStatus,
    enrollMfa,
    verifyAndEnableMfa,
    verifyMfaLogin,
    verifyMfaChallenge,
    unenrollMfa,
    signInWithMfa
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
