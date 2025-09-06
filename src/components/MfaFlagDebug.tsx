import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Key, 
  AlertTriangle,
  RefreshCw,
  User,
  Database
} from 'lucide-react';

export const MfaFlagDebug: React.FC = () => {
  const { user, isMfaEnabled, signIn, verifyMFALogin, getMFAStatus } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [mfaCode, setMfaCode] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const handleTestLogin = async () => {
    setIsLoading(true);
    addLog('🔄 Iniciando test de login con sistema de banderas MFA');
    
    try {
      const result = await signIn(testEmail, testPassword);
      
      addLog(`📊 Resultado del login: ${JSON.stringify(result)}`);
      setDebugInfo(result);
      
      if (result.mfaRequired) {
        addLog('🔐 MFA requerido - esperando código TOTP');
      } else if (result.success) {
        addLog('✅ Login exitoso sin MFA');
      } else {
        addLog(`❌ Error de login: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Excepción en login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaCode) {
      addLog('⚠️ Código MFA requerido');
      return;
    }

    setIsLoading(true);
    addLog(`🔐 Verificando código MFA: ${mfaCode}`);
    
    try {
      const result = await verifyMFALogin(mfaCode);
      
      addLog(`📊 Resultado verificación MFA: ${JSON.stringify(result)}`);
      setDebugInfo(result);
      
      if (result.success) {
        addLog('🎉 Verificación MFA exitosa - login completado');
        setMfaCode('');
      } else {
        addLog(`❌ Error verificación MFA: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Excepción en verificación MFA: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckMFAStatus = async () => {
    if (!user) {
      addLog('⚠️ Usuario no autenticado');
      return;
    }

    setIsLoading(true);
    addLog('🔍 Verificando estado MFA del usuario');
    
    try {
      const result = await getMFAStatus();
      
      addLog(`📊 Estado MFA: ${JSON.stringify(result)}`);
      setDebugInfo(result);
    } catch (error: any) {
      addLog(`❌ Error verificando estado MFA: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setDebugInfo(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mfa_pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'credentials':
        return <Key className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Debug Sistema MFA con Banderas
          </CardTitle>
          <CardDescription>
            Herramienta de debug para el nuevo sistema de autenticación con banderas MFA en auth_tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado del Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuario
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user.email}</p>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No autenticado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Estado MFA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {isMfaEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {isMfaEnabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Última Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo?.sessionStatus && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.sessionStatus.loginStep)}
                      <span className="text-sm">{debugInfo.sessionStatus.loginStep}</span>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={debugInfo.sessionStatus.mfaRequired ? "destructive" : "secondary"} className="text-xs">
                        MFA {debugInfo.sessionStatus.mfaRequired ? 'Requerido' : 'No requerido'}
                      </Badge>
                      <Badge variant={debugInfo.sessionStatus.mfaVerified ? "default" : "outline"} className="text-xs">
                        {debugInfo.sessionStatus.mfaVerified ? 'Verificado' : 'No verificado'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Controles de Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pruebas de Autenticación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email de prueba</label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTestLogin} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Login
              </Button>
              <Button onClick={handleCheckMFAStatus} disabled={isLoading || !user} variant="outline">
                Verificar Estado MFA
              </Button>
            </div>

            {debugInfo?.mfaRequired && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Código MFA (6 dígitos)</label>
                <div className="flex gap-2">
                  <Input
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                  <Button onClick={handleVerifyMFA} disabled={isLoading || !mfaCode}>
                    Verificar MFA
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Información de Debug */}
          {debugInfo && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Información de Debug</h3>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Logs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Logs del Sistema</h3>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Limpiar Logs
              </Button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500">No hay logs...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaFlagDebug;
