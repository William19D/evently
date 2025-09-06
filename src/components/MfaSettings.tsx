import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Shield, ShieldCheck, ShieldOff, AlertCircle, QrCode, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const MfaSettings = () => {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const { toast } = useToast();
  const { 
    getMFAStatus, 
    setupMFA, 
    verifyMFASetup, 
    disableMFA,
    user
  } = useAuth();

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const result = await getMFAStatus();
      setIsMfaEnabled(result.data?.enabled || false);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const handleEnableMfa = async () => {
    setIsLoading(true);
    setError("");

    try {
      const mfaData = await setupMFA();
      
      if (mfaData.success && mfaData.data) {
        setQrCode(mfaData.data.qrCodeURL || '');
        setSecret(mfaData.data.secret || '');
        setStep('qr');
        setIsSetupOpen(true);
      } else {
        setError(mfaData.error || "No se pudo inicializar la configuración de MFA.");
      }
    } catch (error) {
      setError("Error al configurar MFA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (verificationCode.length !== 6) {
      setError("Ingresa el código de 6 dígitos completo");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await verifyMFASetup(verificationCode);
      
      if (result.success) {
        toast({
          title: "¡MFA Activado!",
          description: "Tu cuenta ahora está protegida con autenticación de dos factores.",
        });
        setIsSetupOpen(false);
        setVerificationCode("");
        setStep('qr');
        await checkMfaStatus();
      } else {
        setError(result.error || "Código incorrecto. Verifica el código generado por tu aplicación autenticadora.");
        setVerificationCode("");
      }
    } catch (error) {
      setError("Error al verificar el código.");
      setVerificationCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (disableCode.length !== 6) {
      setError("Ingresa el código de 6 dígitos para confirmar");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await disableMFA(disableCode);
      
      if (result.success) {
        toast({
          title: "MFA Desactivado",
          description: "La autenticación de dos factores ha sido desactivada.",
        });
        setIsDisableOpen(false);
        setDisableCode("");
        await checkMfaStatus();
      } else {
        setError(result.error || "No se pudo desactivar MFA. Inténtalo de nuevo.");
        setDisableCode("");
      }
    } catch (error) {
      setError("Error al desactivar MFA.");
      setDisableCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Autenticación de Dos Factores</CardTitle>
          </div>
          {isMfaEnabled ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Activo
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <ShieldOff className="w-3 h-3 mr-1" />
              Inactivo
            </Badge>
          )}
        </div>
        <CardDescription>
          {isMfaEnabled 
            ? "Tu cuenta está protegida con autenticación de dos factores."
            : "Agrega una capa extra de seguridad a tu cuenta."
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isMfaEnabled ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Protegido:</strong> Se requiere un código de tu app autenticadora para iniciar sesión.
              </AlertDescription>
            </Alert>

            <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Desactivar MFA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Desactivar MFA?</DialogTitle>
                  <DialogDescription>
                    Para desactivar la autenticación de dos factores, ingresa un código de tu app autenticadora.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={disableCode}
                      onChange={(value) => {
                        setDisableCode(value);
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

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDisableOpen(false);
                        setDisableCode("");
                        setError("");
                      }}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisableMfa}
                      disabled={isLoading || disableCode.length !== 6}
                      className="flex-1"
                    >
                      {isLoading ? "Desactivando..." : "Desactivar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                <strong>Recomendado:</strong> Activa MFA para proteger tu cuenta de accesos no autorizados.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleEnableMfa}
              className="w-full"
              disabled={isLoading}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isLoading ? "Configurando..." : "Activar MFA"}
            </Button>
          </div>
        )}

        {/* Setup Dialog */}
        <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {step === 'qr' ? 'Escanea el Código QR' : 'Verifica tu Configuración'}
              </DialogTitle>
              <DialogDescription>
                {step === 'qr' 
                  ? 'Usa tu app autenticadora para escanear este código'
                  : 'Ingresa el código de 6 dígitos de tu app autenticadora'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 'qr' && qrCode && (
                <>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg border">
                      <img src={qrCode} alt="QR Code para MFA" className="w-40 h-40" />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setStep('verify')}
                    className="w-full"
                  >
                    Ya escaneé el código
                  </Button>
                </>
              )}

              {step === 'verify' && (
                <>
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

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('qr')}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={handleVerifySetup}
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1"
                    >
                      {isLoading ? "Verificando..." : "Activar"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MfaSettings;
