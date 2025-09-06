import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MfaSetup from "@/components/MfaSetup";

const MfaSetupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getMFAStatus } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      navigate("/login");
      return;
    }

    // Check current MFA status
    checkMfaStatus();
  }, [user, navigate]);

  const checkMfaStatus = async () => {
    try {
      const result = await getMFAStatus();
      if (result.success && result.data) {
        setMfaEnabled(result.data.enabled || false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de MFA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Go back to profile or dashboard based on user role
    if (user?.role === 'owner') {
      navigate('/owner/dashboard');
    } else if (user?.role === 'superadmin') {
      navigate('/superadmin/dashboard');
    } else {
      navigate('/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Cargando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
          
          <Badge variant={mfaEnabled ? "default" : "secondary"}>
            {mfaEnabled ? "MFA Habilitado" : "MFA Deshabilitado"}
          </Badge>
        </div>

        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración de MFA
          </h1>
          <p className="text-gray-600">
            Configura la autenticación de dos factores para proteger tu cuenta
          </p>
        </div>

        {/* Main MFA Setup Component */}
        <MfaSetup />

        {/* Additional Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-700">
            <div>
              <h4 className="font-medium">¿Qué es MFA?</h4>
              <p className="text-sm">
                La autenticación multifactor añade una capa extra de seguridad requiriendo 
                un código adicional de tu teléfono al iniciar sesión.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Apps Recomendadas</h4>
              <p className="text-sm">
                Google Authenticator, Microsoft Authenticator, Authy, o cualquier app 
                compatible con TOTP.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Códigos de Respaldo</h4>
              <p className="text-sm">
                Siempre guarda tus códigos de respaldo en un lugar seguro. Te permitirán 
                acceder a tu cuenta si pierdes tu dispositivo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MfaSetupPage;
