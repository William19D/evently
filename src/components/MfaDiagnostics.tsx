import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { debugMfaConnection, debugMfaEnrollment } from "@/utils/mfaDebug";
import { useAuth } from "@/contexts/AuthContext";
import { Bug, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const MfaDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isMfaEnabled } = useAuth();

  const runDiagnostics = async () => {
    setIsRunning(true);
    console.log('🔍 Starting MFA diagnostics...');
    
    try {
      const result = await debugMfaConnection();
      setDiagnostics(result);
      console.log('🔍 Diagnostics complete:', result);
    } catch (error) {
      console.error('🔍 Diagnostics error:', error);
      setDiagnostics({ success: false, error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const testEnrollment = async () => {
    console.log('🔍 Testing enrollment...');
    try {
      const result = await debugMfaEnrollment();
      console.log('🔍 Enrollment test result:', result);
    } catch (error) {
      console.error('🔍 Enrollment test error:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          MFA Diagnostics
        </CardTitle>
        <CardDescription>
          Herramientas de diagnóstico para verificar la conexión MFA con Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium">Usuario logueado:</span>
            <Badge variant={user ? "default" : "destructive"} className="ml-2">
              {user ? "Sí" : "No"}
            </Badge>
          </div>
          <div>
            <span className="text-sm font-medium">MFA Habilitado:</span>
            <Badge variant={isMfaEnabled ? "default" : "secondary"} className="ml-2">
              {isMfaEnabled ? "Sí" : "No"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Botones de diagnóstico */}
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Ejecutar Diagnósticos
          </Button>
          
          <Button 
            onClick={testEnrollment} 
            variant="outline"
            disabled={!user}
          >
            Probar Enrollment
          </Button>
        </div>

        {/* Resultados */}
        {diagnostics && (
          <Alert variant={diagnostics.success ? "default" : "destructive"}>
            {diagnostics.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Estado:</strong> {diagnostics.success ? "✅ Conexión exitosa" : "❌ Error de conexión"}
                </div>
                
                {diagnostics.success && diagnostics.session && (
                  <div>
                    <strong>Usuario ID:</strong> {diagnostics.session.user.id}
                  </div>
                )}
                
                {diagnostics.success && diagnostics.totpFactors && (
                  <div>
                    <strong>Factores TOTP:</strong> {diagnostics.totpFactors.length} encontrados
                  </div>
                )}
                
                {diagnostics.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {diagnostics.error}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            <strong>Instrucciones:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Asegúrate de estar logueado antes de ejecutar diagnósticos</li>
              <li>Los logs detallados aparecerán en la consola del navegador</li>
              <li>Usa "Probar Enrollment" para verificar si puedes crear factores MFA</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MfaDiagnostics;
