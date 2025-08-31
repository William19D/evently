import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debugMfaConnection, debugMfaEnrollment, debugMfaChallenge, debugMfaVerify } from '@/utils/mfaDebug';

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
    // Detectar y manejar hash fragments de OAuth SOLO si estamos en una ruta de callback o si hay tokens
    const handleOAuthCallback = () => {
      const isCallbackRoute = window.location.pathname.includes('/auth/callback');
      const hasOAuthTokens = window.location.hash.includes('access_token');
      
      if (hasOAuthTokens && (isCallbackRoute || window.location.hash.includes('type=recovery'))) {
        console.log('🔄 OAuth callback detected, processing...', { 
          isCallbackRoute, 
          hasOAuthTokens,
          path: window.location.pathname,
          hash: window.location.hash.substring(0, 50) + '...'
        });
        
        // Supabase procesará automáticamente el hash fragment
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error) {
            console.error('❌ OAuth processing error:', error);
          } else if (session) {
            console.log('✅ OAuth session established:', session.user.email);
            // Limpiar hash de la URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      }
    };

    // Ejecutar al cargar la página
    handleOAuthCallback();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', { hasSession: !!session, hasUser: !!session?.user });
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
        console.log('🔄 AuthContext - Auth state change:', { 
          event, 
          hasSession: !!session,
          userEmail: session?.user?.email,
          provider: session?.user?.app_metadata?.provider
        });
        
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
    console.log('🔍 === CHECKING MFA STATUS ===');
    
    try {
      // Primero verificar diagnósticos
      const diagnostics = await debugMfaConnection();
      if (!diagnostics.success) {
        console.log('❌ MFA diagnostics failed:', diagnostics.error);
        setIsMfaEnabled(false);
        return false;
      }

      const { factors } = diagnostics;
      const verifiedFactor = factors?.totp?.find((factor: any) => factor.status === 'verified');
      const hasVerifiedMfa = !!verifiedFactor;
      
      console.log('🔍 MFA Status:', { 
        hasVerifiedMfa, 
        totalFactors: factors?.totp?.length || 0,
        verifiedFactor: verifiedFactor?.id 
      });
      
      setIsMfaEnabled(hasVerifiedMfa);
      return hasVerifiedMfa;
    } catch (error) {
      console.error('❌ Error checking MFA status:', error);
      setIsMfaEnabled(false);
      return false;
    }
  };

  const enrollMfa = async (): Promise<{ qrCode: string; secret: string; factorId: string } | null> => {
    console.log('🔍 === STARTING MFA ENROLLMENT ===');
    
    try {
      // Primero verificar diagnósticos
      const diagnostics = await debugMfaConnection();
      if (!diagnostics.success) {
        console.error('❌ Cannot enroll MFA - diagnostics failed:', diagnostics.error);
        return null;
      }

      // Limpiar factores no verificados existentes
      console.log('🧹 Cleaning up existing unverified factors...');
      const { factors } = diagnostics;
      if (factors?.totp) {
        const unverifiedFactors = factors.totp.filter((factor: any) => factor.status === 'unverified');
        console.log('🧹 Found unverified factors:', unverifiedFactors.length);
        
        for (const factor of unverifiedFactors) {
          try {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
            console.log('✅ Cleaned up unverified factor:', factor.id);
          } catch (cleanupError) {
            console.warn('⚠️ Could not clean up factor:', factor.id, cleanupError);
          }
        }
      }

      // Enrollment con debug
      console.log('📱 Starting MFA enrollment...');
      const enrollmentResult = await debugMfaEnrollment();
      
      if (!enrollmentResult.success) {
        console.error('❌ MFA enrollment failed:', enrollmentResult.error);
        return null;
      }

      const { data } = enrollmentResult;
      console.log('✅ MFA enrolled successfully:', {
        factorId: data.id,
        hasQrCode: !!data.totp?.qr_code,
        hasSecret: !!data.totp?.secret
      });

      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      };
    } catch (error) {
      console.error('❌ Error in enrollMfa:', error);
      return null;
    }
  };

  const verifyAndEnableMfa = async (code: string, factorId: string): Promise<boolean> => {
    console.log('🔍 === VERIFYING AND ENABLING MFA ===');
    console.log('🔍 Input params:', { codeLength: code.length, factorId });
    
    try {
      if (code.length !== 6) {
        console.error('❌ Invalid code length:', code.length);
        return false;
      }
      
      // Crear challenge con debug
      console.log('🎯 Creating MFA challenge...');
      const challengeResult = await debugMfaChallenge(factorId);
      
      if (!challengeResult.success) {
        console.error('❌ Failed to create challenge:', challengeResult.error);
        return false;
      }

      const { data: challengeData } = challengeResult;
      console.log('✅ Challenge created:', challengeData.id);

      // Verificar código con debug
      console.log('🔐 Verifying MFA code...');
      const verifyResult = await debugMfaVerify(factorId, challengeData.id, code);
      
      if (!verifyResult.success) {
        console.error('❌ MFA verification failed:', verifyResult.error);
        return false;
      }

      console.log('✅ MFA verification successful');
      
      // Actualizar estado MFA
      await checkMfaStatus();
      return true;

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
      console.log('🔐 Starting sign in process for:', email);
      
      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔐 Sign in response:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session, 
        error: error?.message 
      });

      if (error) {
        console.error('🔐 Authentication error:', error.message);
        return { requiresMfa: false, error: error.message };
      }

      if (!data.user) {
        console.error('🔐 No user returned from authentication');
        return { requiresMfa: false, error: "Authentication failed" };
      }

      // Si tenemos usuario Y sesión, el login está completo (usuario sin MFA)
      if (data.user && data.session) {
        console.log('✅ Login successful with session - no MFA required');
        return { requiresMfa: false };
      }

      // Si tenemos usuario pero NO sesión, el usuario tiene MFA habilitado
      if (data.user && !data.session) {
        console.log('🔐 User authenticated but no session - checking MFA requirement');
        
        // Get MFA factors for this user
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        
        console.log('🔐 MFA factors check:', { 
          hasFactors: !!factorsData?.totp?.length, 
          factorCount: factorsData?.totp?.length || 0,
          factorsError: factorsError?.message 
        });
        
        if (!factorsError && factorsData?.totp?.length > 0) {
          const verifiedFactor = factorsData.totp.find(factor => factor.status === 'verified');
          
          if (verifiedFactor) {
            console.log('🔐 Found verified TOTP factor, creating challenge for factor:', verifiedFactor.id);
            
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
              factorId: verifiedFactor.id
            });

            if (challengeError) {
              console.error('🔐 Challenge creation error:', challengeError.message);
              return { requiresMfa: false, error: "Error creating MFA challenge" };
            }

            console.log('✅ MFA challenge created successfully');
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
        
        // Usuario autenticado pero sin factores MFA válidos
        console.log('⚠️ User authenticated but no valid MFA factors found');
        return { requiresMfa: false, error: "MFA setup required but not properly configured" };
      }

      // Caso inesperado
      console.error('🔐 Unexpected authentication state');
      return { requiresMfa: false, error: "Unexpected authentication state" };
      
    } catch (error) {
      console.error('🔐 Exception in signInWithMfa:', error);
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
