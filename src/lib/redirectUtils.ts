/**
 * Utilidades para manejar URLs de redirección en diferentes entornos
 */

export const getRedirectUrl = (): string => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const currentPort = window.location.port;
  
  if (isLocalhost) {
    // Para desarrollo local, usar la URL actual
    return `http://localhost:${currentPort || '8080'}/auth/callback`;
  }
  
  // Para producción, usar la URL configurada
  return 'https://app.evently.blog/auth/callback';
};

export const getBaseUrl = (): string => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const currentPort = window.location.port;
  
  if (isLocalhost) {
    return `http://localhost:${currentPort || '8080'}`;
  }
  
  return 'https://app.evently.blog';
};

export const isProductionEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

export const getLoginRedirectPath = (userRole: string): string => {
  switch (userRole) {
    case 'owner':
      return '/dashboard';
    case 'superadmin':
      return '/superadmin/dashboard';
    default:
      return '/';
  }
};