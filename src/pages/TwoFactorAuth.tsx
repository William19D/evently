import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Shield, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Start countdown when component mounts
  useState(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otp.length !== 6) {
      setError("Ingresa el código de 6 dígitos completo");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") {
        toast({
          title: "Verificación exitosa",
          description: "Has completado la autenticación de dos factores.",
        });
        navigate("/");
      } else {
        setError("Código incorrecto. Inténtalo de nuevo.");
        setOtp("");
      }
    }, 1500);
  };

  const handleResendCode = () => {
    setCanResend(false);
    setCountdown(30);
    setOtp("");
    setError("");
    
    toast({
      title: "Código reenviado",
      description: "Se ha enviado un nuevo código a tu dispositivo.",
    });

    // Restart countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login/client" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al login
        </Link>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Verificación de Seguridad</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos enviado a tu dispositivo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Demo:</strong> Usa el código 123456 para continuar
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
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

              <div className="text-center space-y-4">
                <Button
                  type="submit"
                  className="w-full shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? "Verificando..." : "Verificar Código"}
                </Button>

                <div className="text-sm text-muted-foreground">
                  {canResend ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-primary hover:text-primary/80"
                      onClick={handleResendCode}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reenviar código
                    </Button>
                  ) : (
                    <span>
                      Reenviar código en {countdown}s
                    </span>
                  )}
                </div>
              </div>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              ¿Problemas para recibir el código?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contacta soporte
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactorAuth;