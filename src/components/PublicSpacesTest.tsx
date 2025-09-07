import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Wifi,
  Building2,
  RefreshCw
} from "lucide-react";
import { publicSpacesClient, type PublicSpace } from "@/lib/publicSpacesClient";
import { useToast } from "@/hooks/use-toast";

const PublicSpacesTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [spaces, setSpaces] = useState<PublicSpace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    connection: 'success' | 'error' | 'pending';
    data: 'success' | 'error' | 'pending';
    count: number;
  }>({
    connection: 'pending',
    data: 'pending',
    count: 0
  });
  const { toast } = useToast();

  const testEdgeFunction = async () => {
    setIsLoading(true);
    setError(null);
    setTestResults({ connection: 'pending', data: 'pending', count: 0 });

    try {
      console.log('🧪 Testing edge function...');
      
      // Test 1: Connection
      const response = await publicSpacesClient.getPublicSpaces({ limit: 5 });
      
      setTestResults(prev => ({ ...prev, connection: 'success' }));
      
      // Test 2: Data structure
      if (response.success && Array.isArray(response.data)) {
        setSpaces(response.data);
        setTestResults(prev => ({ 
          ...prev, 
          data: 'success',
          count: response.data.length 
        }));
        
        toast({
          title: "✅ Prueba exitosa",
          description: `Se obtuvieron ${response.data.length} espacios de la edge function`,
        });
      } else {
        throw new Error('Estructura de datos inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error in test:', error);
      setError(error.message);
      setTestResults(prev => ({ 
        ...prev, 
        connection: error.message.includes('fetch') ? 'error' : 'success',
        data: 'error' 
      }));
      
      toast({
        title: "❌ Error en la prueba",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testEdgeFunction();
  }, []);

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusText = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return 'Exitoso';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Probando...';
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Prueba de Edge Function - Espacios Públicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={testEdgeFunction} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Probando...' : 'Probar Conexión'}
            </Button>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Conexión a Edge Function:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.connection)}
                <Badge className={getStatusColor(testResults.connection)}>
                  {getStatusText(testResults.connection)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Validación de Datos:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.data)}
                <Badge className={getStatusColor(testResults.data)}>
                  {getStatusText(testResults.data)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Info */}
          {testResults.data === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Edge function funcionando correctamente. 
                Se encontraron <strong>{testResults.count}</strong> espacios públicos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Spaces Preview */}
      {spaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa de espacios obtenidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spaces.slice(0, 4).map((space) => (
                <div key={space.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{space.name}</h3>
                    <Badge variant="outline">{space.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {space.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>📍 {space.location}</div>
                    <div>👥 Capacidad: {space.capacity} personas</div>
                    <div>💰 {space.price_formatted}/hora</div>
                    {space.rating.count > 0 && (
                      <div>⭐ {space.rating.average.toFixed(1)} ({space.rating.count} reseñas)</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>URL:</strong> https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/public-space</div>
          <div><strong>Método:</strong> GET</div>
          <div><strong>Autenticación:</strong> No requerida (API pública)</div>
          <div><strong>Estado:</strong> {testResults.connection === 'success' ? '🟢 Activa' : '🔴 Inactiva'}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicSpacesTest;
