import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lock,
  Unlock,
  AlertTriangle,
  LogIn,
  ShieldCheck
} from 'lucide-react';

export const MfaLoginFlow: React.FC = () => {
  const { 
    user, 
    isLoading, 
    isMfaEnabled, 
    isMfaPending, 
    isFullyAuthenticated,
    signIn, 
    verifyMFALogin, 
    signOut 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('🔄 Starting login process...');
      const result = await signIn(email, password);
      
      console.log('📊 Login result:', result);

      if (result.success && !result.mfaRequired) {
        console.log('✅ Login completed without MFA');
        // Usuario completamente autenticado
      } else if (result.mfaRequired) {
        console.log('🔐 MFA required - user must enter 6-digit code');
        // El usuario debe ingresar código MFA - NO hay acceso hasta completar esto
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Error de login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!mfaCode || mfaCode.length !== 6) {
      setError('Ingresa un código de 6 dígitos');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔐 Verifying MFA code...');
      const result = await verifyMFALogin(mfaCode);
      
      console.log('📊 MFA verification result:', result);

      if (result.success) {
        console.log('🎉 MFA verification successful - login completed');
        setMfaCode('');
        // El usuario ahora tiene acceso completo
      } else {
        setError(result.error || 'Código MFA inválido');
      }
    } catch (error: any) {
      console.error('❌ MFA verification error:', error);
      setError(error.message || 'Error verificando MFA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
      setEmail('');
      setPassword('');
      setMfaCode('');
      setError('');
    } catch (error: any) {
      setError(error.message || 'Error cerrando sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    if (isFullyAuthenticated()) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (isMfaPending) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (isFullyAuthenticated()) {
      return 'Completamente autenticado';
    } else if (isMfaPending) {
      return 'Esperando verificación MFA';
    } else {
      return 'No autenticado';
    }
  };

  const getStatusColor = () => {
    if (isFullyAuthenticated()) {
      return 'default';
    } else if (isMfaPending) {
      return 'secondary';
    } else {
      return 'destructive';
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Login con MFA
          </CardTitle>
          <CardDescription>
            Sistema de autenticación con banderas MFA - 2FA obligatorio para usuarios habilitados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado de Autenticación */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">Estado:</span>
            </div>
            <Badge variant={getStatusColor() as any}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Información del Usuario */}
          {user && (
            <div className="p-3 bg-blue-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Usuario: {user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Rol: {user.role}</span>
                {isMfaEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    MFA Habilitado
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Estados del Flujo */}
          {!user && (
            // Estado 1: No autenticado - Mostrar formulario de login
            <form onSubmit={handleInitialLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Iniciar Sesión
              </Button>
            </form>
          )}

          {isMfaPending && (
            // Estado 2: MFA Pendiente - Mostrar formulario de código 6 dígitos
            <div className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>🔐 Verificación de 2 factores requerida</strong>
                  <br />
                  Ingresa el código de 6 dígitos de tu aplicación autenticadora.
                  <br />
                  <em>No podrás acceder hasta completar esta verificación.</em>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleMfaVerification} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Código de 6 dígitos</label>
                  <Input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo números, 6 dígitos
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || mfaCode.length !== 6}>
                  {isSubmitting ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 mr-2" />
                  )}
                  Verificar Código
                </Button>
              </form>
            </div>
          )}

          {isFullyAuthenticated() && (
            // Estado 3: Completamente autenticado - Mostrar opciones
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>✅ Autenticación completada</strong>
                  <br />
                  Tienes acceso completo a la aplicación.
                </AlertDescription>
              </Alert>

              <Button onClick={handleSignOut} variant="outline" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4 mr-2" />
                )}
                Cerrar Sesión
              </Button>
            </div>
          )}

          {/* Errores */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Debug:</strong> isMfaPending={isMfaPending.toString()}, 
            isFullyAuth={isFullyAuthenticated().toString()}, 
            isMfaEnabled={isMfaEnabled.toString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaLoginFlow;
