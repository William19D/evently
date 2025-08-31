import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, User, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LoginTestHelper = () => {
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false);
  const { toast } = useToast();

  const createTestUser = async () => {
    try {
      setIsCreatingTestUser(true);
      
      const testEmail = "test@evently.com";
      const testPassword = "test123456";
      
      console.log('🧪 Creating test user...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: "Test",
            last_name: "User",
            phone: "1234567890"
          }
        }
      });

      if (error) {
        toast({
          title: "Error creando usuario de prueba",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Usuario de prueba creado",
          description: `Email: ${testEmail} | Password: ${testPassword}`,
        });
        
        console.log('✅ Test user created:', data.user.email);
      }
      
    } catch (error) {
      console.error('Error creating test user:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario de prueba",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTestUser(false);
    }
  };

  const fillLoginForm = (email: string, password: string) => {
    // Helper para llenar el formulario de login
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
    
    // Trigger change events
    if (emailInput) {
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (passwordInput) {
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    toast({
      title: "Formulario llenado",
      description: `Email: ${email}`,
    });
  };

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-6 border-dashed border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TestTube className="w-4 h-4" />
          Testing Helper (Development Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="p-3">
          <AlertDescription className="text-sm">
            <strong>Cuentas de prueba disponibles:</strong><br/>
            • test@evently.com / test123456 (sin MFA)<br/>
            • ¡Crea una cuenta y activa MFA para probar 2FA!
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={createTestUser}
            disabled={isCreatingTestUser}
            className="text-xs"
          >
            <User className="w-3 h-3 mr-1" />
            {isCreatingTestUser ? "Creando..." : "Crear Usuario Test"}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => fillLoginForm("test@evently.com", "test123456")}
            className="text-xs"
          >
            <Key className="w-3 h-3 mr-1" />
            Llenar Login Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginTestHelper;
