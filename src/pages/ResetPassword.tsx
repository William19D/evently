import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "../components/AuthLayout";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, { message: "Debe contener al menos una letra mayúscula" })
    .regex(/[a-z]/, { message: "Debe contener al menos una letra minúscula" })
    .regex(/[0-9]/, { message: "Debe contener al menos un número" })
    .regex(/[^A-Za-z0-9]/, { message: "Debe contener al menos un carácter especial" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [strengthPercentage, setStrengthPercentage] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validar el token de recuperación al cargar la página
  useEffect(() => {
    const validateRecoveryToken = async () => {
      try {
        console.log('🔍 Validating recovery token...');
        
        // Verificar si hay un hash en la URL (común en enlaces de Supabase)
        const hash = window.location.hash;
        console.log('Hash:', hash);
        
        if (hash) {
          // Extraer los parámetros del hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          
          console.log('Token type:', type);
          console.log('Has access token:', !!accessToken);
          
          // Verificar si es un token de recuperación
          if (type === 'recovery' && accessToken) {
            console.log('✅ Valid recovery token detected');
            
            // Establecer la sesión con el token de recuperación
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (error) {
              console.error('❌ Error setting session:', error);
              throw error;
            }
            
            console.log('✅ Session established successfully');
            setTokenValid(true);
            setIsValidatingToken(false);
            return;
          }
        }
        
        // Si no hay hash, verificar si hay una sesión activa de recuperación
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          throw sessionError;
        }
        
        if (session && session.user) {
          console.log('✅ Active recovery session found');
          setTokenValid(true);
        } else {
          console.log('❌ No valid recovery session');
          throw new Error('No hay una sesión de recuperación válida');
        }
        
      } catch (error: any) {
        console.error('💥 Token validation error:', error);
        setTokenValid(false);
        toast({
          title: "Enlace inválido o expirado",
          description: "Este enlace de recuperación no es válido o ya expiró. Por favor, solicita uno nuevo.",
          variant: "destructive",
          duration: 6000,
        });
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateRecoveryToken();
  }, [searchParams, toast]);

  // Calcular la fuerza de la contraseña
  useEffect(() => {
    if (!password) {
      setPasswordStrength('weak');
      setStrengthPercentage(0);
      return;
    }

    let strength = 0;
    let level: PasswordStrength = 'weak';

    // Longitud
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 20;
    
    // Minúsculas
    if (/[a-z]/.test(password)) strength += 20;
    
    // Números
    if (/[0-9]/.test(password)) strength += 15;
    
    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    // Determinar nivel
    if (strength < 40) {
      level = 'weak';
    } else if (strength < 60) {
      level = 'medium';
    } else if (strength < 80) {
      level = 'strong';
    } else {
      level = 'very-strong';
    }

    setPasswordStrength(level);
    setStrengthPercentage(Math.min(strength, 100));
  }, [password]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very-strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
      case 'very-strong':
        return 'Muy Fuerte';
      default:
        return '';
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar las contraseñas
      const validatedData = passwordSchema.parse({ password, confirmPassword });
      
      console.log('🔄 Updating password...');
      
      // Actualizar la contraseña usando Supabase
      const { error } = await supabase.auth.updateUser({
        password: validatedData.password,
      });

      if (error) {
        console.error('❌ Error updating password:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      
      // Mostrar éxito
      setResetSuccess(true);
      
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente.",
        duration: 5000,
      });

      // Cerrar la sesión de recuperación
      await supabase.auth.signOut();

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login-selection", {
          state: {
            message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.",
          },
        });
      }, 3000);

    } catch (error) {
      console.error('💥 Reset password error:', error);
      
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Error de validación",
          description: firstError.message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "No se pudo actualizar la contraseña. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Estado de validación del token
  if (isValidatingToken) {
    return (
      <AuthLayout
        title="Validando enlace"
        subtitle="Verificando tu enlace de recuperación"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-blue-100">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Por favor espera mientras validamos tu enlace...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <AuthLayout
        title="Enlace Inválido"
        subtitle="No pudimos validar tu enlace de recuperación"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-100">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Enlace Inválido o Expirado</AlertTitle>
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>El enlace puede haber expirado (válido por 1 hora)</li>
                <li>Ya fue utilizado anteriormente</li>
                <li>No es un enlace válido de recuperación</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate("/recover-password")}
            >
              Solicitar nuevo enlace
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login-selection")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Éxito
  if (resetSuccess) {
    return (
      <AuthLayout
        title="¡Contraseña Actualizada!"
        subtitle="Tu contraseña ha sido cambiada exitosamente"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-100">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">¡Todo listo!</AlertTitle>
            <AlertDescription className="text-green-800">
              Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Serás redirigido al inicio de sesión automáticamente...
            </p>
            
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate("/login-selection")}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Formulario de nueva contraseña
  return (
    <AuthLayout
      title="Nueva Contraseña"
      subtitle="Crea una contraseña segura para tu cuenta"
    >
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Seguridad:</span>
                <span className={`font-medium ${
                  passwordStrength === 'weak' ? 'text-red-600' :
                  passwordStrength === 'medium' ? 'text-yellow-600' :
                  passwordStrength === 'strong' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {getStrengthText()}
                </span>
              </div>
              <Progress value={strengthPercentage} className="h-2" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertTitle className="text-blue-900 text-sm">Requisitos de Contraseña</AlertTitle>
          <AlertDescription className="text-blue-800 text-xs">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li className={password.length >= 8 ? 'text-green-700' : ''}>
                Mínimo 8 caracteres
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-700' : ''}>
                Al menos una letra mayúscula
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-700' : ''}>
                Al menos una letra minúscula
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-700' : ''}>
                Al menos un número
              </li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-700' : ''}>
                Al menos un carácter especial (!@#$%^&*)
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button
          type="submit"
          className="w-full shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
          disabled={isLoading || !password || !confirmPassword}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Actualizando...
            </>
          ) : (
            "Actualizar Contraseña"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/login-selection")}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
