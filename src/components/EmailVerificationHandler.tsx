import React from 'react';
import { useEmailVerificationHandler } from '@/hooks/use-email-verification';

/**
 * Componente que maneja la verificación automática de email
 * Debe colocarse dentro del contexto de React Router
 */
const EmailVerificationHandler: React.FC = () => {
  useEmailVerificationHandler();
  return null; // No renderiza nada visual
};

export default EmailVerificationHandler;