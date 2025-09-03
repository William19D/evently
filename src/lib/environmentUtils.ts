// Environment detection utilities
export const getBaseUrl = (): string => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for SSR or other environments
  return 'http://localhost:8080';
};

export const getCallbackUrl = (): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/auth/callback`;
};

export const isProduction = (): boolean => {
  return getBaseUrl().includes('vercel.app') || getBaseUrl().includes('eventlyuq');
};

export const isDevelopment = (): boolean => {
  return getBaseUrl().includes('localhost') || getBaseUrl().includes('127.0.0.1');
};

// Log environment info for debugging
export const logEnvironmentInfo = () => {
  const baseUrl = getBaseUrl();
  const callbackUrl = getCallbackUrl();
  const isProd = isProduction();
  const isDev = isDevelopment();
  
  console.log('🌍 Environment Info:', {
    baseUrl,
    callbackUrl,
    isProduction: isProd,
    isDevelopment: isDev,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
  });
  
  return {
    baseUrl,
    callbackUrl,
    isProduction: isProd,
    isDevelopment: isDev
  };
};
