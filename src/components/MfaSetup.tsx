import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  QrCode, 
  Key, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MfaSetup = () => {
  const { getMFAStatus, setupMFA, verifyMFASetup, disableMFA, generateBackupCodes } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStatus, setMfaStatus] = useState({ configured: false, enabled: false, backupCodesCount: 0 });
  const [setupData, setSetupData] = useState<{
    secret?: string;
    qrCodeURL?: string;
    backupCodes?: string[];
  }>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [currentStep, setCurrentStep] = useState<'status' | 'setup' | 'verify' | 'complete'>('status');

  const loadMFAStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getMFAStatus();
      if (result.success && result.data) {
        setMfaStatus({
          configured: result.data.configured || false,
          enabled: result.data.enabled || false,
          backupCodesCount: result.data.backupCodesCount || 0
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el estado de MFA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load MFA status on component mount
  useEffect(() => {
    loadMFAStatus();
  }, []);

  const handleSetupMFA = async () => {
    setIsLoading(true);
    try {
      const result = await setupMFA();
      if (result.success && result.data) {
        setSetupData({
          secret: result.data.secret,
          qrCodeURL: result.data.qrCodeURL,
          backupCodes: result.data.backupCodes
        });
        setCurrentStep('setup');
        toast({
          title: "MFA Configurado",
          description: "Escanea el código QR con Google Authenticator",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo configurar MFA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al configurar MFA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el código de verificación",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyMFASetup(verificationCode);
      if (result.success) {
        setCurrentStep('complete');
        setMfaStatus(prev => ({ ...prev, enabled: true }));
        toast({
          title: "¡MFA Habilitado!",
          description: "Tu cuenta ahora está protegida con autenticación de dos factores",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Código de verificación inválido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error verificando el código",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!disableCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el código TOTP actual para deshabilitar MFA",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await disableMFA(disableCode);
      if (result.success) {
        setMfaStatus(prev => ({ ...prev, enabled: false }));
        setCurrentStep('status');
        setDisableCode('');
        toast({
          title: "MFA Deshabilitado",
          description: "La autenticación de dos factores ha sido deshabilitada",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo deshabilitar MFA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deshabilitando MFA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa tu código TOTP actual",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateBackupCodes(verificationCode);
      if (result.success && result.data) {
        setNewBackupCodes(result.data.backupCodes || []);
        setVerificationCode('');
        toast({
          title: "Códigos Generados",
          description: "Nuevos códigos de respaldo generados exitosamente",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudieron generar los códigos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error generando códigos de respaldo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `Códigos de Respaldo - Evently MFA
Generados: ${new Date().toLocaleString()}

IMPORTANTE: Guarda estos códigos en un lugar seguro. 
Cada código solo puede usarse una vez.

${codes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

¿Cómo usar estos códigos?
- Usa un código de respaldo cuando no tengas acceso a tu app de autenticación
- Cada código solo funciona una vez
- Genera nuevos códigos cuando se agoten
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evently-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading && currentStep === 'status') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando estado de MFA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
            <Badge variant={mfaStatus.enabled ? "default" : "secondary"}>
              {mfaStatus.enabled ? "Habilitado" : "Deshabilitado"}
            </Badge>
          </div>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta usando Google Authenticator
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!mfaStatus.configured && currentStep === 'status' && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendado:</strong> Habilita la autenticación de dos factores para mayor seguridad.
                  Necesitarás Google Authenticator o una app compatible.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleSetupMFA} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Configurar MFA
                  </>
                )}
              </Button>
            </div>
          )}

          {currentStep === 'setup' && setupData.qrCodeURL && (
            <div className="space-y-6">
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  <strong>Paso 1:</strong> Escanea este código QR con Google Authenticator
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="qr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qr">Código QR</TabsTrigger>
                  <TabsTrigger value="manual">Configuración Manual</TabsTrigger>
                </TabsList>
                
                <TabsContent value="qr" className="space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={setupData.qrCodeURL} 
                      alt="QR Code para MFA" 
                      className="border rounded-lg"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Clave secreta:</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={setupData.secret} 
                        readOnly 
                        type={showSecret ? "text" : "password"}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(setupData.secret || '')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Paso 2:</strong> Ingresa el código de 6 dígitos que aparece en tu app
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="verification">Código de verificación:</Label>
                  <Input
                    id="verification"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-lg font-mono"
                    maxLength={6}
                  />
                </div>

                <Button onClick={handleVerifySetup} disabled={isLoading || verificationCode.length !== 6} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verificar y Habilitar MFA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>¡MFA Habilitado Exitosamente!</strong> Tu cuenta ahora está protegida con autenticación de dos factores.
                </AlertDescription>
              </Alert>

              {setupData.backupCodes && setupData.backupCodes.length > 0 && (
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <Key className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      <strong>Importante:</strong> Guarda estos códigos de respaldo en un lugar seguro. 
                      Puedes usarlos si pierdes acceso a tu app de autenticación.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                    {setupData.backupCodes.map((code, index) => (
                      <div key={index} className="text-center py-1">
                        {code}
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => downloadBackupCodes(setupData.backupCodes || [])}
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Códigos de Respaldo
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => {
                  setCurrentStep('status');
                  loadMFAStatus();
                }} 
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          )}

          {mfaStatus.enabled && currentStep === 'status' && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  MFA está habilitado y activo. Tu cuenta está protegida.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generar Nuevos Códigos
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generar Códigos de Respaldo</DialogTitle>
                      <DialogDescription>
                        Esto invalidará los códigos anteriores y generará nuevos.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Código TOTP actual:</Label>
                        <Input
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="text-center font-mono"
                          maxLength={6}
                        />
                      </div>
                      <Button 
                        onClick={handleGenerateBackupCodes} 
                        disabled={isLoading || verificationCode.length !== 6}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          'Generar Códigos'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Deshabilitar MFA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deshabilitar MFA</DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro? Esto reducirá la seguridad de tu cuenta.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Código TOTP actual:</Label>
                        <Input
                          value={disableCode}
                          onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="text-center font-mono"
                          maxLength={6}
                        />
                      </div>
                      <Button 
                        onClick={handleDisableMFA} 
                        disabled={isLoading || disableCode.length !== 6}
                        variant="destructive"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Deshabilitando...
                          </>
                        ) : (
                          'Deshabilitar MFA'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {mfaStatus.backupCodesCount > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  Tienes {mfaStatus.backupCodesCount} códigos de respaldo disponibles
                </div>
              )}
            </div>
          )}

          {newBackupCodes.length > 0 && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Key className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Nuevos códigos generados:</strong> Los códigos anteriores han sido invalidados.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                {newBackupCodes.map((code, index) => (
                  <div key={index} className="text-center py-1">
                    {code}
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => downloadBackupCodes(newBackupCodes)}
                variant="outline" 
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Códigos de Respaldo
              </Button>

              <Button 
                onClick={() => setNewBackupCodes([])}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaSetup;
