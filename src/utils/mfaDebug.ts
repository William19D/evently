import { supabase } from "@/integrations/supabase/client";

export const debugMfaConnection = async () => {
  console.log('🔍 === MFA DEBUG DIAGNOSTICS ===');
  
  try {
    // 1. Verificar sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 Current session:', { 
      hasSession: !!sessionData.session, 
      userId: sessionData.session?.user?.id,
      error: sessionError 
    });

    if (!sessionData.session) {
      console.log('❌ No active session found');
      return { success: false, error: 'No active session' };
    }

    // 2. Verificar capacidades MFA
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    console.log('🔍 MFA Factors:', { 
      factors: factorsData, 
      error: factorsError,
      totpCount: factorsData?.totp?.length || 0
    });

    // 3. Verificar configuración de MFA en Supabase
    console.log('🔍 Supabase client config:', {
      hasAuth: !!supabase.auth,
      hasMfa: !!supabase.auth.mfa
    });

    return { 
      success: true, 
      session: sessionData.session,
      factors: factorsData,
      totpFactors: factorsData?.totp || []
    };

  } catch (error) {
    console.error('🔍 MFA Debug error:', error);
    return { success: false, error: error.message };
  }
};

export const debugMfaEnrollment = async () => {
  console.log('🔍 === MFA ENROLLMENT DEBUG ===');
  
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Evently Authenticator'
    });

    console.log('🔍 Enrollment result:', { data, error });
    
    if (error) {
      console.error('❌ Enrollment failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('🔍 Enrollment exception:', error);
    return { success: false, error: error.message };
  }
};

export const debugMfaChallenge = async (factorId: string) => {
  console.log('🔍 === MFA CHALLENGE DEBUG ===');
  console.log('🔍 Factor ID:', factorId);
  
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId
    });

    console.log('🔍 Challenge result:', { data, error });
    
    if (error) {
      console.error('❌ Challenge failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('🔍 Challenge exception:', error);
    return { success: false, error: error.message };
  }
};

export const debugMfaVerify = async (factorId: string, challengeId: string, code: string) => {
  console.log('🔍 === MFA VERIFY DEBUG ===');
  console.log('🔍 Parameters:', { factorId, challengeId, code: code.substring(0, 2) + '****' });
  
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });

    console.log('🔍 Verify result:', { 
      hasData: !!data, 
      hasAccessToken: !!data?.access_token,
      hasUser: !!data?.user,
      error 
    });
    
    if (error) {
      console.error('❌ Verify failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('🔍 Verify exception:', error);
    return { success: false, error: error.message };
  }
};
