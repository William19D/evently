import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient, type AuthUser, type TOTPSetupResponse, type TOTPVerifyResponse, type TOTPStatusResponse, type TOTPBackupCodesResponse, type RegisterRequest } from '@/lib/authClient';
import { logAuthStep, logAuthError } from '@/lib/authDebug';
import { getDisplayError } from '@/utils/errorMessages';
import { toast } from 'sonner';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isMfaEnabled: boolean;
  // Estado del flujo MFA
  isMfaPending: boolean;
  signIn: (email: string, password: string, recaptchaToken?: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  register: (data: RegisterRequest, recaptchaToken?: string) => Promise<{ success: boolean; error?: string }>;
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
  // Helper para verificar si el usuario está completamente autenticado
  isFullyAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempMfaToken, setTempMfaToken] = useState<string | null>(null);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  // 🔧 Estado para tracking del flujo MFA
  const isMfaPending = !!tempMfaToken && !!user && !authClient.isAuthenticated();

  // 🔧 Helper para verificar autenticación completa
  const isFullyAuthenticated = (): boolean => {
    const hasUser = !!user;
    const hasTokens = authClient.isAuthenticated();
    const notPendingMfa = !tempMfaToken;
    
    const isFullyAuth = hasUser && hasTokens && notPendingMfa;
    
    console.log('🔍 Authentication status check:', {
      hasUser,
      hasTokens,
      notPendingMfa,
      isMfaPending,
      isFullyAuth
    });
    
    return isFullyAuth;
  };

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
        
        // Usar el sistema de manejo de errores user-friendly
        const friendlyError = getDisplayError(result.error);
        console.log('📢 User-friendly MFA setup error:', friendlyError);
        
        // Mostrar el error al usuario
        toast.error('Error en configuración MFA', {
          description: friendlyError
        });
      }

      return result;
    } catch (error) {
      logAuthError('SETUP_MFA_ERROR', error);
      
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly MFA setup catch error:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error inesperado', {
        description: friendlyError
      });
      
      return { error: friendlyError };
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
        
        // Usar el sistema de manejo de errores user-friendly
        const friendlyError = getDisplayError(result.error);
        console.log('📢 User-friendly MFA setup verification error:', friendlyError);
        
        // Mostrar el error al usuario
        toast.error('Error en verificación MFA', {
          description: friendlyError
        });
      }

      return result;
    } catch (error) {
      logAuthError('VERIFY_MFA_SETUP_ERROR', error);
      
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly MFA setup verification exception:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error inesperado', {
        description: friendlyError
      });
      
      return { error: friendlyError };
    }
  };

  const verifyMFALogin = async (code?: string, backupCode?: string): Promise<TOTPVerifyResponse> => {
    try {
      if (!tempMfaToken) {
        return { error: 'Token temporal de MFA no encontrado. Inicia sesión nuevamente.' };
      }

      logAuthStep('VERIFY_MFA_LOGIN_START', { 
        hasTempToken: !!tempMfaToken,
        hasCode: !!code,
        hasBackupCode: !!backupCode
      });

      const result = await authClient.verifyMFALogin(tempMfaToken, code, backupCode);
      
      console.log('🔍 AuthContext verifyMFALogin result:', {
        success: result.success,
        hasData: !!result.data,
        method: result.data?.method,
        error: result.error
      });
      
      if (result.success) {
        // 🎉 VERIFICACIÓN MFA EXITOSA - COMPLETAR LOGIN
        console.log('🎉 MFA verification successful - completing login process');
        
        // Limpiar el token temporal después de verificación exitosa
        setTempMfaToken(null);
        
        // Obtener el usuario actualizado después de login exitoso con tokens completos
        const currentUser = authClient.getCurrentUser();
        if (currentUser) {
          console.log('👤 Updating user data after successful MFA verification');
          setUser(currentUser);
          setIsMfaEnabled(true); // MFA está habilitado si llegamos aquí
        } else {
          console.error('⚠️ No user data available after MFA verification');
          return { error: 'Error obteniendo datos del usuario después de MFA' };
        }
        
        logAuthStep('VERIFY_MFA_LOGIN_SUCCESS', { 
          method: result.data?.method,
          userUpdated: !!currentUser,
          loginCompleted: true
        });
        
        // Verificar que los tokens se guardaron correctamente
        const hasAccessToken = !!authClient.getAccessToken();
        const hasRefreshToken = !!authClient.getRefreshToken();
        
        console.log('🔐 Post-MFA token status:', {
          hasAccessToken,
          hasRefreshToken,
          userAuthenticated: authClient.isAuthenticated()
        });
        
        if (!hasAccessToken || !hasRefreshToken) {
          console.error('⚠️ Missing tokens after MFA verification');
          return { error: 'Error en autenticación post-MFA - tokens faltantes' };
        }
        
      } else {
        logAuthError('VERIFY_MFA_LOGIN_FAILED', { error: result.error });
        console.log('❌ MFA verification failed:', result.error);
        
        // Usar el sistema de manejo de errores user-friendly
        const friendlyError = getDisplayError(result.error);
        console.log('📢 User-friendly MFA error:', friendlyError);
        
        // Mostrar el error al usuario
        toast.error('Error en verificación MFA', {
          description: friendlyError
        });
      }

      return result;
    } catch (error) {
      logAuthError('VERIFY_MFA_LOGIN_ERROR', error);
      console.error('❌ Exception in verifyMFALogin:', error);
      
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly MFA exception error:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error inesperado', {
        description: friendlyError
      });
      
      return { error: friendlyError };
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
        const currentUser = authClient.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Con el nuevo sistema de banderas, verificar MFA status del usuario actual
          try {
            const mfaStatus = await getMFAStatus();
            if (mfaStatus.success && mfaStatus.data) {
              setIsMfaEnabled(mfaStatus.data.enabled || false);
              console.log('🔧 MFA status initialized with flag system:', {
                userId: currentUser.id.substring(0, 8) + '***',
                mfaEnabled: mfaStatus.data.enabled
              });
            }
          } catch (mfaError) {
            console.warn('⚠️ Could not check MFA status during initialization:', mfaError);
            // No bloquear la inicialización si falla la verificación MFA
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth with flag system:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string, recaptchaToken?: string): Promise<{ success: boolean; mfaRequired?: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Limpiar cualquier token temporal previo
      setTempMfaToken(null);
      
      const response = await authClient.signIn(email, password, recaptchaToken);
      
      // Debug logging para el sistema de banderas MFA mejorado
      console.log('🔍 AuthContext signIn response with enhanced MFA flag system:', {
        success: response.success,
        requiresMFA: response.requiresMFA,
        mfaRequired: response.mfaRequired,
        hasTempToken: !!response.tempToken,
        hasUser: !!response.user,
        sessionStatus: response.sessionStatus,
        message: response.message,
        nextStep: response.nextStep,
        error: response.error
      });
      
      // 🚨 VERIFICACIÓN CRÍTICA: Si hay MFA requerido, NO permitir acceso hasta verificación
      if (response.requiresMFA || response.mfaRequired) {
        console.log('🔐 MFA REQUIRED - User MUST complete 6-digit verification before access');
        
        // Validar que tenemos todo lo necesario para el flujo MFA
        if (!response.tempToken) {
          console.error('❌ MFA required but no tempToken provided');
          return { success: false, error: 'Error en configuración MFA - token temporal faltante' };
        }
        
        if (!response.user) {
          console.error('❌ MFA required but no user data provided');
          return { success: false, error: 'Error en configuración MFA - datos de usuario faltantes' };
        }
        
        // Verificar que el estado sea correcto
        if (response.sessionStatus?.loginStep !== 'mfa_pending') {
          console.warn('⚠️ Expected loginStep to be mfa_pending, got:', response.sessionStatus?.loginStep);
        }
        
        console.log('� Storing MFA session data for verification flow');
        
        // Almacenar el token temporal para verificación MFA
        setTempMfaToken(response.tempToken);
        
        // Establecer datos del usuario para el flujo MFA (pero sin autenticar completamente)
        setUser(response.user);
        setIsMfaEnabled(true);
        
        console.log('🔄 AuthContext returning MFA required - blocking access until 6-digit verification');
        return { 
          success: false, // ¡IMPORTANTE! success=false porque no está completo hasta MFA
          mfaRequired: true 
        };
      }
      
      // Error en el login
      if (response.error) {
        console.log('❌ Login error:', response.error);
        return { success: false, error: response.error };
      }

      // Login exitoso sin MFA (usuario no tiene MFA habilitado)
      if (response.success && response.user) {
        console.log('✅ Login successful without MFA - complete access granted');
        setUser(response.user);
        
        // Actualizar estado MFA basado en sessionStatus
        if (response.sessionStatus) {
          setIsMfaEnabled(response.sessionStatus.mfaRequired || false);
          
          // Verificar que el login_step sea 'completed'
          if (response.sessionStatus.loginStep !== 'completed') {
            console.warn('⚠️ Unexpected loginStep for non-MFA user:', response.sessionStatus.loginStep);
          }
        }
        
        return { success: true };
      }

      console.log('⚠️ Unexpected login state - neither MFA nor complete success');
      return { success: false, error: 'Estado de login inesperado' };
    } catch (error: any) {
      console.error('❌ Sign in error with enhanced MFA flag system:', error);
      
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly sign in error:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error en inicio de sesión', {
        description: friendlyError
      });
      
      return { success: false, error: friendlyError };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authClient.signOut();
      
      // Limpiar todo el estado relacionado con autenticación y MFA
      setUser(null);
      setIsMfaEnabled(false);
      setTempMfaToken(null);
      
      console.log('✅ Sign out completed with flag system cleanup');
    } catch (error) {
      console.error('❌ Sign out error with flag system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest, recaptchaToken?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await authClient.register(data, recaptchaToken);
      
      if (response.error) {
        // Usar el sistema de manejo de errores user-friendly
        const friendlyError = getDisplayError(response.error);
        console.log('📢 User-friendly register error:', friendlyError);
        
        // Mostrar el error al usuario
        toast.error('Error en registro', {
          description: friendlyError
        });
        
        return { success: false, error: friendlyError };
      }
      
      return { success: true };
    } catch (error: any) {
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly register exception:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error inesperado', {
        description: friendlyError
      });
      
      return { success: false, error: friendlyError };
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification functions
  const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authClient.verifyEmail({ email, verificationCode: code });
      
      if (result.error) {
        // Usar el sistema de manejo de errores user-friendly
        const friendlyError = getDisplayError(result.error);
        console.log('📢 User-friendly email verification error:', friendlyError);
        
        // Mostrar el error al usuario
        toast.error('Error en verificación de email', {
          description: friendlyError
        });
        
        return { success: false, error: friendlyError };
      }
      
      return { success: true };
    } catch (error: any) {
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly email verification exception:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error inesperado', {
        description: friendlyError
      });
      
      return { success: false, error: friendlyError };
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authClient.resendVerification({ email });
      
      if (result.error) {
        // Usar el sistema de manejo de errores user-friendly
        const friendlyError = getDisplayError(result.error);
        console.log('📢 User-friendly resend verification error:', friendlyError);
        
        // Mostrar el error al usuario
        toast.error('Error al reenviar verificación', {
          description: friendlyError
        });
        
        return { success: false, error: friendlyError };
      }
      
      return { success: true };
    } catch (error: any) {
      // Usar el sistema de manejo de errores user-friendly
      const friendlyError = getDisplayError(error);
      console.log('📢 User-friendly resend verification exception:', friendlyError);
      
      // Mostrar el error al usuario
      toast.error('Error inesperado', {
        description: friendlyError
      });
      
      return { success: false, error: friendlyError };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isMfaEnabled,
    isMfaPending,
    signIn,
    signOut,
    register,
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
    resendVerification,
    // Helper function
    isFullyAuthenticated
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
