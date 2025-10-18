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
  // 🚫 BYPASS: No mostrar badge de reCAPTCHA durante el bypass
  return null;
};

export default RecaptchaBadge;
