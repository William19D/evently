import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "../components/AuthLayout";
import { z } from "zod";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { requestPasswordRecovery } from "@/services/passwordRecovery";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Por favor ingresa un email válido" }),
});

const RecoverPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar el formato del email
      const validatedData = emailSchema.parse({ email });
      
      // Llamar a la Edge Function personalizada
      const response = await requestPasswordRecovery(validatedData.email);

      if (response.success) {
        setEmailSent(true);
        toast({
          title: "¡Correo enviado!",
          description: response.message,
          duration: 5000,
        });
      } else {
        // Manejar diferentes tipos de errores
        let errorTitle = "Error";
        let errorDescription = response.message || response.error || "Hubo un problema al enviar el correo de recuperación";
        
        // Personalizar mensajes según el tipo de error
        if (errorDescription.includes("confirmar tu email")) {
          errorTitle = "Email no confirmado";
        } else if (errorDescription.includes("formato del email")) {
          errorTitle = "Email inválido";
        } else if (errorDescription.includes("Configuración")) {
          errorTitle = "Error del servidor";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
          duration: 6000,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
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

  if (emailSent) {
    return (
      <AuthLayout
        title="Revisa tu Email"
        subtitle="Te enviamos un enlace para recuperar tu contraseña"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <CheckCircle className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Enviamos un enlace de recuperación a:
            </p>
            <p className="font-semibold text-foreground">{email}</p>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Importante</AlertTitle>
            <AlertDescription className="text-orange-800">
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>El enlace expira en <strong>1 hora</strong></li>
                <li>Revisa tu carpeta de spam si no lo ves</li>
                <li>El enlace solo puede usarse una vez</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Por favor revisa tu bandeja de entrada y sigue las instrucciones en el correo.
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Enviar a otro correo
              </Button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Ingresa tu email para recibir un enlace de recuperación"
    >
      <form onSubmit={handleRecover} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Te enviaremos un enlace seguro para restablecer tu contraseña
          </p>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Nota de Seguridad</AlertTitle>
          <AlertDescription className="text-blue-800 text-sm">
            Por razones de seguridad, no confirmamos si el email existe en nuestro sistema. 
            Si tu email está registrado, recibirás un enlace de recuperación.
          </AlertDescription>
        </Alert>

        <Button
          type="submit"
          className="w-full shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">Enviando...</span>
              <span className="animate-pulse">📧</span>
            </>
          ) : (
            "Enviar enlace de recuperación"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/login")}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio de sesión
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RecoverPassword;
