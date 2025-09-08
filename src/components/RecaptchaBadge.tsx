import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface RecaptchaBadgeProps {
  isLoading?: boolean;
  isVerified?: boolean;
  className?: string;
}

export const RecaptchaBadge: React.FC<RecaptchaBadgeProps> = ({ 
  isLoading = false, 
  isVerified = false, 
  className = "" 
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Shield className="w-4 h-4 animate-pulse" />
        <span>Verificando seguridad...</span>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span>Verificación de seguridad completada</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Shield className="w-4 h-4" />
      <span>Protegido por reCAPTCHA</span>
    </div>
  );
};

export default RecaptchaBadge;
