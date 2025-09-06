import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/authClient";

interface LocationState {
  email?: string;
  role?: string;
  fromRegistration?: boolean;
}

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<{verificationCode?: string, general?: string}>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state as LocationState;
  const email = state?.email;
  const role = state?.role || 'member';
  const fromRegistration = state?.fromRegistration;

  useEffect(() => {
    if (!email) {
      navigate("/register-selection");
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateForm = () => {
    const newErrors: {verificationCode?: string} = {};
    
    if (!verificationCode) {
      newErrors.verificationCode = "El código de verificación es requerido";
    } else if (!/^\d{6}$/.test(verificationCode)) {
      newErrors.verificationCode = "El código debe tener 6 dígitos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm() || !email) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authClient.verifyEmail({
        email,
        verificationCode
      });

      if (result.error) {
        setErrors({
          general: result.error
        });
      } else if (result.success) {
        toast({
          title: "¡Email verificado!",
          description: "Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.",
        });
        
        // Redirigir al login correspondiente según el rol
        const loginPath = role === 'owner' ? '/login/owner' : '/login/client';
        navigate(loginPath, {
          state: {
            email,
            verified: true
          }
        });
      } else {
        setErrors({
          general: "Error al verificar el email. Inténtalo de nuevo."
        });
      }
    } catch (error: any) {
      setErrors({
        general: error.message || "Error de conexión. Inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    setErrors({});
    
    try {
      const result = await authClient.resendVerification({ email });

      if (result.error) {
        setErrors({
          general: result.error
        });
      } else if (result.success) {
        toast({
          title: "Código reenviado",
          description: "Se ha enviado un nuevo código de verificación a tu email.",
        });
        setResendCooldown(60); // 60 segundos de cooldown
        setVerificationCode(""); // Limpiar el código anterior
      } else {
        setErrors({
          general: "Error al reenviar el código. Inténtalo de nuevo."
        });
      }
    } catch (error: any) {
      setErrors({
        general: error.message || "Error de conexión. Inténtalo de nuevo."
      });
    } finally {
      setIsResending(false);
    }
  };

  const getRoleInfo = () => {
    switch (role) {
      case 'owner':
        return {
          title: 'Propietario',
          color: 'emerald',
          icon: '🏢',
          bgColor: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20',
          textColor: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'member':
      default:
        return {
          title: 'Cliente',
          color: 'blue',
          icon: '👤',
          bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20',
          textColor: 'text-blue-700 dark:text-blue-300'
        };
    }
  };

  const roleInfo = getRoleInfo();

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          to="/register-selection" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al registro
        </Link>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Verificar Email</CardTitle>
            <CardDescription>
              Confirma tu cuenta como {roleInfo.title}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Alert className={roleInfo.bgColor}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className={roleInfo.textColor}>
                <strong>¡Registro exitoso!</strong> {roleInfo.icon} Te has registrado como {roleInfo.title}.
                <br />
                <strong>Email:</strong> {email}
              </AlertDescription>
            </Alert>

            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20">
              <Mail className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Hemos enviado un código de verificación de 6 dígitos a tu email. 
                <br />
                <strong>Revisa también tu carpeta de spam.</strong>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Código de verificación</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Solo números
                    if (value.length <= 6) {
                      setVerificationCode(value);
                      if (errors.verificationCode) {
                        setErrors(prev => ({ ...prev, verificationCode: "" }));
                      }
                    }
                  }}
                  className={`text-center text-lg tracking-widest transition-colors ${
                    errors.verificationCode ? 'border-destructive focus-visible:ring-destructive' : ''
                  }`}
                  maxLength={6}
                  required
                />
                {errors.verificationCode && (
                  <p className="text-sm text-destructive">{errors.verificationCode}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Ingresa el código de 6 dígitos que recibiste en tu email
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full shadow-md hover:shadow-lg transition-all duration-200" 
                size="lg"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar Email"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el código?
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                className="transition-all duration-200"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : resendCooldown > 0 ? (
                  `Reenviar en ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reenviar código
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              ¿Ya verificaste tu cuenta?{" "}
              <Link 
                to={role === 'owner' ? '/login/owner' : '/login/client'} 
                className="text-primary hover:underline font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
