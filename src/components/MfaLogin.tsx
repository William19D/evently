import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Key, 
  RefreshCw, 
  AlertCircle,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MfaLoginProps {
  onMfaSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const MfaLogin = ({ onMfaSuccess, onCancel, isOpen }: MfaLoginProps) => {
  const { verifyMFALogin } = useAuth();
  const { toast } = useToast();
  
  console.log('🔍 MfaLogin component render:', { 
    isOpen, 
    timestamp: new Date().toLocaleTimeString() 
  });
  
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);

  // 🔍 Track when the dialog should open/close
  useEffect(() => {
    console.log('🔍 MfaLogin useEffect - isOpen changed:', { 
      isOpen, 
      previousState: 'tracked',
      timestamp: new Date().toLocaleTimeString() 
    });
    
    if (isOpen) {
      console.log('🔐 MfaLogin: Dialog opening - user needs to enter MFA code');
      // Reset form when dialog opens
      setMfaCode('');
      setUseBackupCode(false);
      setAttemptsRemaining(3);
      setIsBlocked(false);
    } else {
      console.log('🔒 MfaLogin: Dialog closing');
    }
  }, [isOpen]);

  const handleMfaVerification = async () => {
    if (!mfaCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el código de verificación",
        variant: "destructive",
      });
      return;
    }

    console.log('🔐 MfaLogin: Starting MFA verification process...', {
      codeLength: mfaCode.length,
      isBackupCode: useBackupCode,
      timestamp: new Date().toLocaleTimeString()
    });

    setIsLoading(true);
    try {
      const result = await verifyMFALogin(mfaCode, useBackupCode ? mfaCode : undefined);
      
      console.log('📊 MfaLogin: MFA verification result:', {
        success: result.success,
        error: result.error,
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (result.success) {
        console.log('🎉 MfaLogin: MFA verification successful - calling onMfaSuccess');
        toast({
          title: "Acceso Autorizado",
          description: "Has iniciado sesión exitosamente",
        });
        setMfaCode('');
        onMfaSuccess();
      } else {
        console.log('❌ MfaLogin: MFA verification failed:', result.error);
        // Handle different error types
        if (result.error?.includes('attempts')) {
          const remaining = parseInt(result.error.match(/\d+/)?.[0] || '0');
          setAttemptsRemaining(remaining);
          
          if (remaining <= 0) {
            setIsBlocked(true);
            toast({
              title: "Cuenta Bloqueada",
              description: "Demasiados intentos fallidos. Intenta más tarde.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Código Inválido",
              description: `Te quedan ${remaining} intentos`,
              variant: "destructive",
            });
          }
        } else if (result.error?.includes('backup code used')) {
          toast({
            title: "Código Ya Usado",
            description: "Este código de respaldo ya fue utilizado",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Código de verificación inválido",
            variant: "destructive",
          });
        }
        
        setMfaCode('');
      }
    } catch (error) {
      console.error('❌ MfaLogin: Exception during MFA verification:', error);
      toast({
        title: "Error",
        description: "Error de conexión. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isBlocked && mfaCode.length >= 6) {
      handleMfaVerification();
    }
  };

  const handleCancel = () => {
    setMfaCode('');
    setUseBackupCode(false);
    setAttemptsRemaining(3);
    setIsBlocked(false);
    onCancel();
  };

  return (
    <>
      {/* 🔧 DEBUG: Simple overlay for testing */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <Shield className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h2 className="text-xl font-semibold">🔐 Verificación MFA Requerida</h2>
              <p className="text-gray-600 mt-2">
                Ingresa el código de 6 dígitos de tu aplicación autenticadora
              </p>
            </div>

            {isBlocked ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-700 font-medium">Cuenta Temporalmente Bloqueada</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Demasiados intentos fallidos. Espera unos minutos antes de intentar nuevamente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    {useBackupCode ? (
                      <Key className="h-4 w-4 text-blue-600 mr-2" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-blue-600 mr-2" />
                    )}
                    <span className="text-blue-700 text-sm">
                      {useBackupCode 
                        ? "Ingresa uno de tus códigos de respaldo de 8 dígitos"
                        : "Abre Google Authenticator e ingresa el código de 6 dígitos"
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {useBackupCode ? "Código de respaldo:" : "Código de verificación:"}
                  </label>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const maxLength = useBackupCode ? 8 : 6;
                      setMfaCode(value.slice(0, maxLength));
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={useBackupCode ? "12345678" : "123456"}
                    className="w-full text-center text-lg font-mono border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={useBackupCode ? 8 : 6}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {attemptsRemaining < 3 && attemptsRemaining > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-yellow-700 text-sm">
                        <strong>Atención:</strong> Te quedan {attemptsRemaining} intentos antes de que la cuenta se bloquee.
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleMfaVerification} 
                  disabled={
                    isLoading || 
                    isBlocked || 
                    mfaCode.length < (useBackupCode ? 8 : 6)
                  }
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verificar e Iniciar Sesión
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setUseBackupCode(!useBackupCode);
                      setMfaCode('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    {useBackupCode ? (
                      <>
                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                        Usar código de la app
                      </>
                    ) : (
                      <>
                        <Key className="w-3 h-3 inline mr-1" />
                        Usar código de respaldo
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t">
              <button 
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              
              {isBlocked && (
                <button 
                  onClick={() => {
                    setIsBlocked(false);
                    setAttemptsRemaining(3);
                    setMfaCode('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Intentar Nuevamente
                </button>
              )}
            </div>

            {/* Debug info */}
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <strong>Debug:</strong> isOpen={isOpen.toString()}, codeLength={mfaCode.length}
            </div>
          </div>
        </div>
      )}

      {/* Original Dialog - commented out for debugging */}
      {/*
      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-md">
          ... original content ...
        </DialogContent>
      </Dialog>
      */}
    </>
  );
};

export default MfaLogin;
