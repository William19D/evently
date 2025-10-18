import { useCallback, useState } from 'react';

// Get the reCAPTCHA site key from environment variables
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Debug log to check if the key is loaded
console.log('🔧 reCAPTCHA Configuration Debug:', {
  siteKey: RECAPTCHA_SITE_KEY ? `${RECAPTCHA_SITE_KEY.substring(0, 15)}...` : 'NOT FOUND',
  siteKeyLength: RECAPTCHA_SITE_KEY?.length || 0,
  siteKeyFull: RECAPTCHA_SITE_KEY, // Para debugging
  envKeys: Object.keys(import.meta.env).filter(key => key.includes('RECAPTCHA')),
  allViteKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
  nodeEnv: import.meta.env.NODE_ENV,
  mode: import.meta.env.MODE
});

// Validate reCAPTCHA site key format
const isValidSiteKey = (key: string | undefined): boolean => {
  if (!key) return false;
  // reCAPTCHA v3 site keys should start with specific prefixes
  return key.startsWith('6L') && key.length >= 40;
};

interface UseRecaptchaReturn {
  executeRecaptcha: (action: string) => Promise<string>;
  loadRecaptcha: () => Promise<void>;
  isConfigured: boolean;
  error: string | null;
}

export const useRecaptcha = (): UseRecaptchaReturn => {
  const [error, setError] = useState<string | null>(null);
  
  // 🚫 BYPASS: Siempre configurado durante el bypass
  const isConfigured = true;

  const loadRecaptcha = useCallback(async (): Promise<void> => {
    console.log('🚫 reCAPTCHA BYPASS: loadRecaptcha called with bypass mode');
    setError(null);
    return Promise.resolve();
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    console.log('� reCAPTCHA BYPASS: executeRecaptcha called with bypass mode', {
      action,
      bypassEnabled: true
    });

    // 🚫 BYPASS: Retornar un token falso sin hacer verificación real
    setError(null);
    return Promise.resolve('bypass-token-' + Date.now());
  }, []);

  return {
    executeRecaptcha,
    loadRecaptcha,
    isConfigured,
    error
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
