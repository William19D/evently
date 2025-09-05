import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailConfirmation = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'member' | 'owner'>('member');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Obtener parámetros de la URL de Supabase
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Si hay un error en los parámetros
        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Error al confirmar el email');
          return;
        }

        // Si no hay token o el type no es signup
        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Link de confirmación inválido o expirado');
          return;
        }

        // Usar Supabase para verificar el token de email
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (verifyError) {
          console.error('Error verificando email:', verifyError);
          setStatus('error');
          setMessage('Error al verificar el email. El enlace puede haber expirado.');
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('¡Tu email ha sido verificado exitosamente!');
          
          // Determinar rol para redirigir correctamente
          const userRole = data.user.user_metadata?.role || 'member';
          setUserRole(userRole as 'member' | 'owner');
          setUserEmail(data.user.email || '');
          
          // Mostrar toast de éxito
          toast({
            title: "¡Email verificado!",
            description: `Tu cuenta como ${userRole} ha sido activada exitosamente.`,
          });

          // Redirigir después de 3 segundos
          setTimeout(() => {
            if (userRole === 'owner') {
              navigate('/login/owner', { 
                state: { 
                  emailVerified: true,
                  message: 'Email verificado exitosamente. Ya puedes iniciar sesión.'
                }
              });
            } else {
              navigate('/login/client', { 
                state: { 
                  emailVerified: true,
                  message: 'Email verificado exitosamente. Ya puedes iniciar sesión.'
                }
              });
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Error al procesar la verificación de email');
        }

      } catch (error: any) {
        console.error('Error confirmando email:', error);
        setStatus('error');
        setMessage('Error de conexión al verificar el email');
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  const handleGoToLogin = () => {
    const loginPath = userRole === 'owner' ? '/login/owner' : '/login/client';
    navigate(loginPath, { 
      state: { 
        emailVerified: true,
        message: 'Email verificado exitosamente. Ya puedes iniciar sesión.'
      }
    });
  };

  const handleGoToOwnerLogin = () => {
    navigate('/login/owner', { 
      state: { 
        emailVerified: true,
        message: 'Email verificado exitosamente. Ya puedes iniciar sesión.'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center">
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
              {status === 'loading' && 'Verificando Email...'}
              {status === 'success' && '¡Email Verificado!'}
              {status === 'error' && 'Error de Verificación'}
            </CardTitle>

            <CardDescription>
              {status === 'loading' && 'Procesando tu confirmación de email'}
              {status === 'success' && 'Tu cuenta ha sido activada exitosamente'}
              {status === 'error' && 'Hubo un problema al verificar tu email'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'loading' && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  Estamos verificando tu email, por favor espera un momento...
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <strong>¡Perfecto!</strong> {message}
                    <br />
                    <br />
                    {userEmail && (
                      <>
                        Cuenta verificada: <strong>{userEmail}</strong>
                        <br />
                        Rol asignado: <strong>{userRole === 'owner' ? 'Propietario' : 'Cliente'}</strong>
                        <br />
                        <br />
                      </>
                    )}
                    Ya puedes acceder a todas las funcionalidades de Evently.
                    <br />
                    <span className="text-sm">Serás redirigido automáticamente en unos segundos...</span>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full shadow-md hover:shadow-lg transition-all duration-200" 
                    size="lg"
                  >
                    {userRole === 'owner' ? 'Iniciar Sesión como Propietario' : 'Iniciar Sesión como Cliente'}
                  </Button>
                  
                  {userRole === 'member' && (
                    <Button 
                      onClick={handleGoToOwnerLogin}
                      variant="outline"
                      className="w-full transition-all duration-200" 
                      size="lg"
                    >
                      Iniciar Sesión como Propietario
                    </Button>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {message}
                    <br />
                    <br />
                    Posibles causas:
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>El link ha expirado (válido por 24 horas)</li>
                      <li>El link ya fue utilizado anteriormente</li>
                      <li>El link está dañado o incompleto</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/register-selection')}
                    className="w-full shadow-md hover:shadow-lg transition-all duration-200" 
                    size="lg"
                  >
                    Registrarse Nuevamente
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/login/client')}
                    variant="outline"
                    className="w-full transition-all duration-200" 
                    size="lg"
                  >
                    Ir al Login
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>
                ¿Necesitas ayuda?{" "}
                <a 
                  href="mailto:eventlysoporte@gmail.com" 
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Contactar soporte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmation;
