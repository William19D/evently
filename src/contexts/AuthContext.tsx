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
  verifyMfaLogin: (code: string, factorId: string, challengeId: string) => Promise<boolean>;
  verifyMfaChallenge: (code: string, factorId: string) => Promise<boolean>;
  unenrollMfa: (factorId?: string) => Promise<boolean>;
  signInWithMfa: (email: string, password: string) => Promise<{ requiresMfa: boolean; mfaData?: any; error?: string; needsSetup?: boolean }>;
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
      console.log('Starting MFA verification with:', { codeLength: code.length, code: code, factorId });
      
      if (code.length !== 6) {
        console.error('Invalid code length:', code.length);
        return false;
      }
      
      // First create a challenge for the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        console.error('Error creating MFA challenge:', challengeError);
        return false;
      }

      console.log('Challenge created:', challengeData);

      // Then verify the code against the challenge
      console.log('🔐 About to verify MFA code with challenge ID:', challengeData.id);
      
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });

      console.log('🔐 MFA verification response:', { data: verifyData, error: verifyError });

      if (verifyError) {
        console.error('Error verifying MFA code:', verifyError);
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
      
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      });

      console.log('🔒 MFA login verification response:', { data: verifyData, error: verifyError });

      if (verifyError) {
        console.error('Error verifying MFA login code:', verifyError);
        return false;
      }

      if (verifyData) {
        console.log('🔒 MFA login verification successful, checking session...');
        
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we now have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session after MFA verification:', sessionError);
          return false;
        }
        
        if (session) {
          console.log('🔒 Session established successfully after MFA');
          // Update the auth context state
          setSession(session);
          setUser(session.user);
          return true;
        } else {
          console.error('🔒 No session found after MFA verification');
          return false;
        }
      }

      console.log('🔒 No verification data returned');
      return false;
    } catch (error) {
      console.error('Error verifying MFA login:', error);
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

  const signInWithMfa = async (email: string, password: string): Promise<{ requiresMfa: boolean; mfaData?: any; error?: string; needsSetup?: boolean }> => {
    try {
      console.log('🔐 Starting sign in process...');
      
      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔐 Sign in response:', { data, error });

      if (error) {
        return { requiresMfa: false, error: error.message };
      }

      // Check if the user has MFA enabled and it's enforced
      if (data.user && !data.session) {
        console.log('🔐 No session - user has MFA enabled and must verify');
        
        // Get MFA factors for this user
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        
        console.log('🔐 Factors data:', { factorsData, factorsError });
        
        if (!factorsError && factorsData?.totp?.length > 0) {
          const verifiedFactor = factorsData.totp.find(factor => factor.status === 'verified');
          
          if (verifiedFactor) {
            console.log('🔐 Found verified TOTP factor, creating challenge');
            
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
              factorId: verifiedFactor.id
            });

            if (challengeError) {
              console.error('🔐 Challenge error:', challengeError);
              return { requiresMfa: false, error: "Error creating MFA challenge" };
            }

            return {
              requiresMfa: true,
              mfaData: {
                factorId: verifiedFactor.id,
                challengeId: challengeData.id,
                email: email
              }
            };
          }
        }
      }

      // If we haveg both user and session, login is complete
      if (data.user && data.session) {
        console.log('🔐 Login complete with session');
        return { requiresMfa: false };
      }

      return { requiresMfa: false, error: "Login failed" };
    } catch (error) {
      console.error('🔐 Error in signInWithMfa:', error);
      return { requiresMfa: false, error: "Connection error" };
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
