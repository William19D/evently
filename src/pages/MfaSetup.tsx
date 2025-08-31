import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Check, X, QrCode, Smartphone, AlertCircle, Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const MfaSetup = () => {
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'complete'>('intro');
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { enrollMfa, verifyAndEnableMfa, user, isMfaEnabled } = useAuth();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      navigate("/login/client");
      return;
    }

    // Redirect if MFA is already enabled
    if (isMfaEnabled) {
      navigate("/");
      return;
    }
  }, [user, isMfaEnabled, navigate]);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError("");

    try {
      const mfaData = await enrollMfa();
      
      if (mfaData) {
        setQrCode(mfaData.qrCode);
        setSecret(mfaData.secret);
        setFactorId(mfaData.factorId);
        setStep('setup');
      } else {
        setError("No se pudo inicializar la configuración de MFA. Inténtalo de nuevo.");
      }
    } catch (error) {
      setError("Error al configurar MFA. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Ingresa el código de 6 dígitos completo");
      return;
    }

    console.log('🔐 Starting verification process with code:', verificationCode);
    console.log('🔐 Code length:', verificationCode.length);
    console.log('🔐 Factor ID:', factorId);
    
    setIsLoading(true);
    setError("");

    try {
      console.log('🔐 Calling verifyAndEnableMfa...');
      const success = await verifyAndEnableMfa(verificationCode, factorId);
      
      console.log('🔐 Verification result:', success);
      
      if (success) {
        console.log('🔐 Success! Moving to complete step');
        setStep('complete');
        toast({
          title: "¡MFA Activado!",
          description: "Tu cuenta ahora está protegida con autenticación de dos factores.",
        });
      } else {
        console.log('🔐 Verification failed');
        setError("Código incorrecto. Verifica que:");
        setTimeout(() => {
          setError("• El código sea el actual de tu app autenticadora\n• Hayas esperado a que se genere un nuevo código\n• La hora de tu dispositivo esté sincronizada");
        }, 100);
        setVerificationCode("");
      }
    } catch (error) {
      console.error('🔐 Error in handleVerifyCode:', error);
      setError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "MFA no configurado",
      description: "Puedes activar MFA más tarde desde tu perfil.",
      variant: "destructive"
    });
    navigate("/");
  };

  const handleComplete = () => {
    navigate("/");
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copiado",
      description: "El código secreto ha sido copiado al portapapeles.",
    });
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Protege tu Cuenta</CardTitle>
            <CardDescription className="text-base">
              Te recomendamos activar la autenticación de dos factores (MFA) para mantener tu cuenta segura.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Seguridad adicional</h4>
                  <p className="text-sm text-muted-foreground">Protege tu cuenta incluso si alguien conoce tu contraseña</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Fácil de usar</h4>
                  <p className="text-sm text-muted-foreground">Solo necesitas tu teléfono y una app autenticadora</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Recomendado</h4>
                  <p className="text-sm text-muted-foreground">Cumple con las mejores prácticas de seguridad</p>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Necesitarás:</strong> Una app como Google Authenticator, Authy, o Microsoft Authenticator en tu teléfono.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleStartSetup}
                className="w-full shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Configurando..." : "Activar MFA"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleSkip}
                className="w-full"
                disabled={isLoading}
              >
                Configurar más tarde
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Escanea el Código QR</CardTitle>
            <CardDescription>
              Usa tu app autenticadora para escanear este código
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {qrCode && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  <img src={qrCode} alt="QR Code para MFA" className="w-48 h-48" />
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pasos:</strong>
                <br />1. Abre tu app autenticadora
                <br />2. Escanea el código QR
                <br />3. Guarda el código de respaldo de abajo
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Código de respaldo:</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecret(!showSecret)}
                  className="h-8 px-2"
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {showSecret ? secret : '••••••••••••••••••••••••••••••••'}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySecret}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Guarda este código en un lugar seguro. Lo necesitarás si pierdes tu teléfono.
              </p>
            </div>

            <Button 
              onClick={() => setStep('verify')}
              className="w-full shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Verifica tu Configuración</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos de tu app autenticadora
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Importante:</strong> El código cambia cada 30 segundos. Usa el código actual de tu app autenticadora.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={(value) => {
                  setVerificationCode(value);
                  setError("");
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyCode}
                className="w-full shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar y Activar MFA"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setStep('setup')}
                className="w-full"
                disabled={isLoading}
              >
                Volver al código QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-green-700">¡MFA Activado!</CardTitle>
            <CardDescription className="text-base">
              Tu cuenta ahora está protegida con autenticación de dos factores.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>¡Excelente!</strong> Ahora necesitarás tu app autenticadora cada vez que inicies sesión.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Inicio de sesión seguro</h4>
                  <p className="text-sm text-muted-foreground">Se te pedirá un código cada vez que inicies sesión</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Código de respaldo guardado</h4>
                  <p className="text-sm text-muted-foreground">No olvides guardar el código de respaldo en un lugar seguro</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleComplete}
              className="w-full shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              Continuar a la aplicación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default MfaSetup;
