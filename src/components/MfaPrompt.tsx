import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Check, X, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MfaPromptProps {
  onDismiss: () => void;
  onSetup: () => void;
}

const MfaPrompt: React.FC<MfaPromptProps> = ({ onDismiss, onSetup }) => {
  const { user, isMfaEnabled } = useAuth();
  const { toast } = useToast();

  // Don't show if user doesn't exist or already has MFA
  if (!user || isMfaEnabled) {
    return null;
  }

  // Always show for authenticated users without MFA (simplified logic)
  // You can add your own logic here to determine when to show the prompt

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">¡Bienvenido a Evently!</CardTitle>
          <CardDescription className="text-base">
            Para mantener tu cuenta segura, te recomendamos activar la autenticación de dos factores.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Protección adicional</h4>
                <p className="text-sm text-muted-foreground">Tu cuenta estará protegida incluso si alguien descubre tu contraseña</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Configuración rápida</h4>
                <p className="text-sm text-muted-foreground">Solo toma unos minutos configurarlo con tu teléfono</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Altamente recomendado</h4>
                <p className="text-sm text-muted-foreground">Una medida de seguridad esencial para proteger tu información</p>
              </div>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <strong>Necesitarás:</strong> Una app como Google Authenticator, Authy, o Microsoft Authenticator.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              onClick={onSetup}
              className="w-full shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              <Shield className="w-4 h-4 mr-2" />
              Configurar Ahora
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Recordatorio",
                  description: "Puedes configurar MFA más tarde desde tu perfil.",
                });
                onDismiss();
              }}
              className="w-full"
            >
              Configurar Más Tarde
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Puedes activar o desactivar esta función en cualquier momento desde tu perfil
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaPrompt;
