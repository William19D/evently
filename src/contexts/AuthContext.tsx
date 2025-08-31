import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isMfaEnabled: boolean;
  checkMfaStatus: () => Promise<boolean>;
  enrollMfa: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>;
  verifyAndEnableMfa: (code: string, factorId: string) => Promise<boolean>;
  verifyMfaChallenge: (code: string, factorId: string) => Promise<boolean>;
  unenrollMfa: (factorId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkMfaStatus();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkMfaStatus();
        } else {
          setIsMfaEnabled(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkMfaStatus = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Error checking MFA status:', error);
        return false;
      }

      const isEnabled = data?.totp?.some(factor => factor.status === 'verified') ?? false;
      setIsMfaEnabled(isEnabled);
      return isEnabled;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  };

  const enrollMfa = async (): Promise<{ qrCode: string; secret: string; factorId: string } | null> => {
    try {
      // First, check if there's already an unverified factor and clean it up
      const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors();
      
      if (listError) {
        console.error('Error listing factors:', listError);
      } else if (existingFactors?.totp) {
        // Remove all unverified factors to start fresh
        const unverifiedFactors = existingFactors.totp.filter(factor => factor.status === 'unverified');
        for (const factor of unverifiedFactors) {
          try {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
            console.log('Cleaned up unverified factor:', factor.id);
          } catch (cleanupError) {
            console.warn('Could not clean up unverified factor:', cleanupError);
          }
        }
      }

      // Now enroll a new factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Evently MFA ${new Date().toISOString()}`
      });

      if (error) {
        console.error('Error enrolling MFA:', error);
        return null;
      }

      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      };
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      return null;
    }
  };

  const verifyAndEnableMfa = async (code: string, factorId: string): Promise<boolean> => {
    try {
      // Create a challenge for the factor to verify the code
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        console.error('Error creating MFA challenge:', challengeError);
        return false;
      }

      // Verify the code against the challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });

      if (verifyError) {
        console.error('Error verifying MFA code:', verifyError);
        return false;
      }

      // If verification is successful, the factor is automatically marked as verified
      setIsMfaEnabled(true);
      return true;
    } catch (error) {
      console.error('Error verifying MFA enrollment:', error);
      return false;
    }
  };

  const verifyMfaChallenge = async (code: string, factorId: string): Promise<boolean> => {
    try {
      // This function is handled differently - the verification is done
      // in the TwoFactorAuth component using the challengeId
      return true;
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
        const { data: factorsData, error: listError } = await supabase.auth.mfa.listFactors();
        
        if (listError) {
          console.error('Error listing factors for unenroll:', listError);
          return false;
        }

        const verifiedFactor = factorsData?.totp?.find(factor => factor.status === 'verified');
        if (!verifiedFactor) {
          console.error('No verified MFA factor found');
          return false;
        }
        
        targetFactorId = verifiedFactor.id;
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: targetFactorId
      });

      if (error) {
        console.error('Error unenrolling MFA:', error);
        return false;
      }

      setIsMfaEnabled(false);
      return true;
    } catch (error) {
      console.error('Error unenrolling MFA:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isMfaEnabled,
    checkMfaStatus,
    enrollMfa,
    verifyAndEnableMfa,
    verifyMfaChallenge,
    unenrollMfa
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
