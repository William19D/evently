import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Shield, RefreshCw, Info, XCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface EnhancedErrorAlertProps {
  error: string;
  type?: 'validation' | 'auth' | 'network' | 'server' | 'verification' | 'unknown';
  onRetry?: () => void;
  onResendVerification?: () => void;
  className?: string;
}

const EnhancedErrorAlert = ({ 
  error, 
  type = 'unknown', 
  onRetry, 
  onResendVerification,
  className = ""
}: EnhancedErrorAlertProps) => {
  
  const getAlertVariant = () => {
    switch (type) {
      case 'verification':
        return 'default'; // Usaremos un estilo custom para verification
      case 'validation':
        return 'destructive';
      case 'auth':
        return 'destructive';
      case 'network':
        return 'destructive';
      case 'server':
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'verification':
        return <Mail className="h-4 w-4" />;
      case 'validation':
        return <XCircle className="h-4 w-4" />;
      case 'auth':
        return <Shield className="h-4 w-4" />;
      case 'network':
        return <RefreshCw className="h-4 w-4" />;
      case 'server':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'verification':
        return 'Email no verificado';
      case 'validation':
        return 'Error en los datos';
      case 'auth':
        return 'Error de autenticación';
      case 'network':
        return 'Error de conexión';
      case 'server':
        return 'Error del servidor';
      default:
        return 'Error';
    }
  };

  const isVerificationError = type === 'verification';
  const isNetworkError = type === 'network';

  return (
    <Alert 
      variant={getAlertVariant()} 
      className={`${isVerificationError ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : ''} ${className}`}
    >
      {getIcon()}
      <div className="flex-1">
        <div className="font-medium text-sm mb-1">{getTitle()}</div>
        <AlertDescription className={isVerificationError ? 'text-blue-700 dark:text-blue-300' : ''}>
          {error}
        </AlertDescription>
        
        {/* Action buttons based on error type */}
        <div className="flex flex-wrap gap-2 mt-3">
          {isVerificationError && onResendVerification && (
            <Button
              onClick={onResendVerification}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Mail className="w-3 h-3 mr-1" />
              Reenviar correo
            </Button>
          )}
          
          {isVerificationError && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Link to="/email-confirmation">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificar email
              </Link>
            </Button>
          )}

          {(isNetworkError || type === 'server') && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reintentar
            </Button>
          )}

          {type === 'auth' && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Link to="/recover-password">
                <Shield className="w-3 h-3 mr-1" />
                Recuperar contraseña
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default EnhancedErrorAlert;