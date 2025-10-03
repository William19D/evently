import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "../components/AuthLayout";
import { z } from "zod";
import { ArrowLeft, CheckCircle } from "lucide-react";

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
      const validatedData = emailSchema.parse({ email });
      
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al enviar el correo de recuperación",
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "¡Correo enviado!",
          description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
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

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Por favor revisa tu bandeja de entrada (y la carpeta de spam) y sigue las instrucciones en el correo.
            </p>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
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

        <Button
          type="submit"
          className="w-full shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio de sesión
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RecoverPassword;
