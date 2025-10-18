import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getLoginRedirectPath, isProductionEnvironment } from '@/lib/redirectUtils';

interface AuthCallbackProps {}

const AuthCallback: React.FC<AuthCallbackProps> = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Detectar si estamos en desarrollo local
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentUrl = window.location.href;
        
        console.log('🔄 AuthCallback: Processing auth callback', {
          isLocalhost,
          currentUrl,
          hostname: window.location.hostname,
          port: window.location.port
        });

        // Para localhost, primero intentar obtener la sesión actual de Supabase
        if (isLocalhost) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session && session.user && !sessionError) {
            console.log('✅ AuthCallback: Active session found on localhost', {
              userId: session.user.id,
              email: session.user.email,
              confirmed: !!session.user.email_confirmed_at
            });

            setUserData(session.user);
            setStatus('success');
            setMessage('¡Email verificado y autenticación completada exitosamente!');
            
            toast.success('¡Autenticación exitosa!', {
              description: '¡Bienvenido! Tu email ha sido verificado y has iniciado sesión automáticamente.'
            });

            // Redirigir según el rol del usuario después de 2 segundos
            setTimeout(() => {
              const userRole = session.user.user_metadata?.role || 'member';
              console.log('🔄 AuthCallback: Redirecting user', { userRole });
              
              const redirectPath = getLoginRedirectPath(userRole);
              navigate(redirectPath);
            }, 2000);
            
            return;
          } else {
            console.log('⚠️ AuthCallback: No active session on localhost, checking URL hash');
          }
        }

        // Verificar si tenemos datos en el hash de la URL (común en callbacks de Supabase)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('token_type');

        if (hashAccessToken && hashRefreshToken) {
          console.log('✅ AuthCallback: Tokens found in URL hash', { tokenType });
          
          try {
            // Establecer la sesión usando los tokens del hash
            const { data, error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken
            });

            if (error) {
              console.error('❌ AuthCallback: Error setting session from hash', error);
              setStatus('error');
              setMessage('Error al establecer la sesión de usuario');
              return;
            }

            if (data.user) {
              console.log('✅ AuthCallback: Session established successfully from hash');
              setUserData(data.user);
              setStatus('success');
              setMessage('¡Email verificado y autenticación completada exitosamente!');
              
              toast.success('¡Autenticación exitosa!', {
                description: '¡Bienvenido! Tu email ha sido verificado y has iniciado sesión automáticamente.'
              });

              // Redirigir según el rol del usuario después de 2 segundos
              setTimeout(() => {
                const userRole = data.user.user_metadata?.role || 'member';
                console.log('🔄 AuthCallback: Redirecting user', { userRole });
                
                const redirectPath = getLoginRedirectPath(userRole);
                navigate(redirectPath);
              }, 2000);
              
              return;
            }
          } catch (sessionError) {
            console.error('💥 AuthCallback: Exception setting session from hash', sessionError);
          }
        }
        // Obtener parámetros de la URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const paramsAccessToken = searchParams.get('access_token');
        const paramsRefreshToken = searchParams.get('refresh_token');

        console.log('🔄 AuthCallback: Processing auth callback', {
          hasToken: !!token,
          type,
          hasError: !!error,
          hasAccessToken: !!paramsAccessToken,
          hasRefreshToken: !!paramsRefreshToken
        });

        // Si hay un error en los parámetros
        if (error) {
          console.error('❌ AuthCallback: Error in URL parameters', { error, errorDescription });
          setStatus('error');
          setMessage(errorDescription || 'Error en la verificación de email');
          return;
        }

        // Si ya tenemos tokens de acceso (usuario ya autenticado por Supabase)
        if (paramsAccessToken && paramsRefreshToken) {
          console.log('✅ AuthCallback: User already authenticated by Supabase');
          
          // Obtener información del usuario actual
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.error('❌ AuthCallback: Error getting user data', userError);
            setStatus('error');
            setMessage('Error obteniendo datos del usuario');
            return;
          }

          console.log('👤 AuthCallback: User data obtained', {
            userId: user.id,
            email: user.email,
            confirmed: !!user.email_confirmed_at
          });

          setUserData(user);
          setStatus('success');
          setMessage('¡Email verificado y autenticación completada exitosamente!');
          
          // Mostrar mensaje de éxito
          toast.success('¡Autenticación exitosa!', {
            description: '¡Bienvenido! Tu email ha sido verificado y has iniciado sesión automáticamente.'
          });

          // Redirigir según el rol del usuario después de 2 segundos
          setTimeout(() => {
            const userRole = user.user_metadata?.role || 'member';
            console.log('🔄 AuthCallback: Redirecting user', { userRole });
            
            const redirectPath = getLoginRedirectPath(userRole);
            navigate(redirectPath);
          }, 2000);
          
          return;
        }

        // Manejo de verificación manual por token (método legacy)
        if (token && type === 'signup') {
          console.log('🔄 AuthCallback: Processing manual token verification');
          
          // Verificar el token usando Supabase
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (verifyError) {
            console.error('❌ AuthCallback: Error verifying token', verifyError);
            setStatus('error');
            setMessage('Error al verificar el enlace. El enlace puede haber expirado.');
            return;
          }

          if (data.user) {
            console.log('✅ AuthCallback: Token verified successfully');
            setUserData(data.user);
            setStatus('success');
            setMessage('¡Email verificado exitosamente!');
            
            toast.success('¡Email verificado exitosamente!', {
              description: 'Tu cuenta ha sido verificada. Ya puedes iniciar sesión.'
            });

            // Redirigir al login apropiado después de 3 segundos
            setTimeout(() => {
              const userRole = data.user.user_metadata?.role || 'member';
              const loginPath = userRole === 'owner' ? '/login/owner' : '/login/client';
              navigate(loginPath, {
                state: {
                  emailVerified: true,
                  message: 'Email verificado exitosamente. Ya puedes iniciar sesión.'
                }
              });
            }, 3000);
          } else {
            setStatus('error');
            setMessage('Error al procesar la verificación de email');
          }
          return;
        }

        // Si no hay parámetros válidos
        console.warn('⚠️ AuthCallback: No valid parameters found');
        setStatus('error');
        setMessage('Enlace de verificación inválido o expirado');

      } catch (error: any) {
        console.error('💥 AuthCallback: Exception during processing', error);
        setStatus('error');
        setMessage('Error de conexión al procesar la verificación');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    if (status === 'success' && userData) {
      const userRole = userData.user_metadata?.role || 'member';
      const redirectPath = getLoginRedirectPath(userRole);
      navigate(redirectPath);
    } else {
      navigate('/');
    }
  };

  const handleGoToLogin = () => {
    if (userData) {
      const userRole = userData.user_metadata?.role || 'member';
      const loginPath = userRole === 'owner' ? '/login/owner' : '/login/client';
      navigate(loginPath, {
        state: {
          emailVerified: true,
          message: 'Email verificado exitosamente. Ya puedes iniciar sesión.'
        }
      });
    } else {
      navigate('/login-selection');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {status === 'loading' && (
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-semibold">
            {status === 'loading' && 'Procesando verificación...'}
            {status === 'success' && '¡Verificación Exitosa!'}
            {status === 'error' && 'Error de Verificación'}
          </CardTitle>

          <CardDescription className="text-center">
            {status === 'loading' && 'Verificando tu email y procesando autenticación...'}
            {status === 'success' && 'Tu cuenta ha sido verificada y activada exitosamente'}
            {status === 'error' && 'Hubo un problema al verificar tu email'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Esto puede tomar unos momentos...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                  {message}
                </p>
                {userData && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      <strong>Email:</strong> {userData.email}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      <strong>Tipo:</strong> {userData.user_metadata?.role || 'member'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Serás redirigido automáticamente en unos segundos...</p>
              </div>
              
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 text-center">
                  {message}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                  Ir a Iniciar Sesión
                </Button>
                <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                  Ir al Inicio
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;