import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  RefreshCw, 
  AlertCircle,
  Smartphone,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import authBackground from '@/assets/auth-background.jpg';

const MfaVerification: React.FC = () => {
  const { 
    user, 
    isMfaPending, 
    isFullyAuthenticated,
    verifyMFALogin, 
    signOut 
  } = useAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos

  // 🔐 PROTECCIÓN: Verificar estado de autenticación
  useEffect(() => {
    console.log('🔍 MfaVerification: Checking authentication state', {
      hasUser: !!user,
      isMfaPending,
      isFullyAuthenticated: isFullyAuthenticated(),
      timestamp: new Date().toLocaleTimeString()
    });

    // Si usuario completamente autenticado, redirigir
    if (isFullyAuthenticated()) {
      console.log('✅ MfaVerification: User fully authenticated, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    // Si no hay usuario o no está en estado MFA pendiente, redirigir a login
    if (!user || !isMfaPending) {
      console.log('⚠️ MfaVerification: Invalid state, redirecting to login');
      navigate('/login/client', { replace: true });
      return;
    }

    console.log('🔐 MfaVerification: Valid MFA pending state, showing verification page');
  }, [user, isMfaPending, isFullyAuthenticated, navigate]);

  // ⏱️ Countdown timer para token temporal
  useEffect(() => {
    if (!isMfaPending) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          toast({
            title: "Sesión Expirada",
            description: "El token temporal ha expirado. Inicia sesión nuevamente.",
            variant: "destructive",
          });
          handleSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMfaPending]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMfaVerification = async () => {
    if (!mfaCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el código de verificación",
        variant: "destructive",
      });
      return;
    }

    const codeLength = useBackupCode ? 8 : 6;
    if (mfaCode.length !== codeLength) {
      toast({
        title: "Error",
        description: `El código debe tener ${codeLength} dígitos`,
        variant: "destructive",
      });
      return;
    }

    console.log('🔐 MfaVerification: Starting verification process...', {
      codeLength: mfaCode.length,
      isBackupCode: useBackupCode,
      attemptsRemaining,
      timestamp: new Date().toLocaleTimeString()
    });

    setIsLoading(true);
    try {
      const result = await verifyMFALogin(mfaCode, useBackupCode ? mfaCode : undefined);
      
      console.log('📊 MfaVerification: Verification result:', {
        success: result.success,
        error: result.error,
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (result.success) {
        console.log('🎉 MfaVerification: Verification successful - redirecting to home');
        toast({
          title: "¡Verificación Exitosa!",
          description: "Has iniciado sesión correctamente con MFA",
        });
        // El useEffect se encargará de la redirección
      } else {
        console.log('❌ MfaVerification: Verification failed:', result.error);
        
        // Manejar diferentes tipos de errores
        if (result.error?.includes('attempts') || result.error?.includes('intentos')) {
          const remaining = parseInt(result.error.match(/\d+/)?.[0] || '2');
          setAttemptsRemaining(remaining);
          
          if (remaining <= 0) {
            setIsBlocked(true);
            toast({
              title: "Cuenta Bloqueada",
              description: "Demasiados intentos fallidos. Tu sesión será cerrada.",
              variant: "destructive",
            });
            setTimeout(() => handleSignOut(), 3000);
          } else {
            toast({
              title: "Código Inválido",
              description: `Te quedan ${remaining} intentos`,
              variant: "destructive",
            });
          }
        } else if (result.error?.includes('expirado') || result.error?.includes('expired')) {
          toast({
            title: "Sesión Expirada",
            description: "El token temporal ha expirado. Serás redirigido al login.",
            variant: "destructive",
          });
          setTimeout(() => handleSignOut(), 2000);
        } else {
          toast({
            title: "Código Inválido",
            description: result.error || "Código de verificación incorrecto",
            variant: "destructive",
          });
        }
        
        setMfaCode('');
      }
    } catch (error: any) {
      console.error('❌ MfaVerification: Exception during verification:', error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo verificar el código. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('🔄 MfaVerification: Signing out user');
    try {
      await signOut();
      navigate('/login/client', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Forzar redirección aunque falle el signOut
      navigate('/login/client', { replace: true });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isBlocked && mfaCode.length >= (useBackupCode ? 8 : 6)) {
      handleMfaVerification();
    }
  };

  // No renderizar nada si no está en estado válido
  if (!user || !isMfaPending) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Seguridad MFA" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/10"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Protección Avanzada</h2>
            <p className="text-lg text-white/90">
              Tu cuenta está protegida con autenticación de dos factores para máxima seguridad
            </p>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">Verificación MFA</CardTitle>
              <CardDescription>
                Autenticación de dos factores requerida
              </CardDescription>
              
              {/* User Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm font-medium text-blue-800">{user.email}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    MFA Activado
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Time Remaining */}
              <Alert className="bg-yellow-50 border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Tiempo restante:</strong> {formatTime(timeRemaining)}
                  <br />
                  <span className="text-sm">El token temporal expirará automáticamente</span>
                </AlertDescription>
              </Alert>

              {isBlocked ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cuenta Temporalmente Bloqueada</strong><br />
                    Demasiados intentos fallidos. Tu sesión será cerrada por seguridad.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    {useBackupCode ? (
                      <Key className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-blue-600" />
                    )}
                    <AlertDescription className="text-blue-800">
                      {useBackupCode 
                        ? "Ingresa uno de tus códigos de respaldo de 8 dígitos"
                        : "Abre tu aplicación autenticadora (Google Authenticator, Authy, etc.) e ingresa el código de 6 dígitos"
                      }
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {useBackupCode ? "Código de respaldo" : "Código de verificación"}
                    </label>
                    <Input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const maxLength = useBackupCode ? 8 : 6;
                        setMfaCode(value.slice(0, maxLength));
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder={useBackupCode ? "12345678" : "123456"}
                      className="text-center text-xl font-mono tracking-widest"
                      maxLength={useBackupCode ? 8 : 6}
                      autoComplete="one-time-code"
                      autoFocus
                      disabled={isLoading || isBlocked}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {useBackupCode ? "8 dígitos" : "6 dígitos"} • Solo números
                    </p>
                  </div>

                  {attemptsRemaining < 3 && attemptsRemaining > 0 && (
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>⚠️ Advertencia:</strong> Te quedan {attemptsRemaining} intentos antes de que la cuenta se bloquee.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleMfaVerification} 
                    disabled={
                      isLoading || 
                      isBlocked || 
                      mfaCode.length < (useBackupCode ? 8 : 6)
                    }
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Verificar y Continuar
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={() => {
                        setUseBackupCode(!useBackupCode);
                        setMfaCode('');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                      disabled={isLoading}
                    >
                      {useBackupCode ? (
                        <>
                          <ArrowLeft className="w-3 h-3 inline mr-1" />
                          Usar código de la aplicación
                        </>
                      ) : (
                        <>
                          <Key className="w-3 h-3 inline mr-1" />
                          Usar código de respaldo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cancelar y Cerrar Sesión
                </Button>
              </div>

              {/* Debug Info */}
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Estado:</strong> isMfaPending={isMfaPending.toString()}, 
                timeLeft={formatTime(timeRemaining)}, 
                attempts={attemptsRemaining}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MfaVerification;
