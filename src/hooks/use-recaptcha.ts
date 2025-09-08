import { useCallback } from 'react';

// Get the reCAPTCHA site key from environment variables
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Lc7r8ErAAAAAJirukJBKnD_f4SSLWathVhuvln7";

// Debug log to check if the key is loaded
console.log('🔧 reCAPTCHA Configuration Debug:', {
  siteKey: RECAPTCHA_SITE_KEY ? `${RECAPTCHA_SITE_KEY.substring(0, 15)}...` : 'NOT FOUND',
  siteKeyFull: RECAPTCHA_SITE_KEY, // Temporarily show full key for debugging
  envKeys: Object.keys(import.meta.env).filter(key => key.includes('RECAPTCHA')),
  allViteKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
  nodeEnv: import.meta.env.NODE_ENV,
  mode: import.meta.env.MODE
});

interface UseRecaptchaReturn {
  executeRecaptcha: (action: string) => Promise<string>;
  loadRecaptcha: () => Promise<void>;
  isConfigured: boolean;
}

export const useRecaptcha = (): UseRecaptchaReturn => {
  const isConfigured = !!(RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY.trim() !== '');

  const loadRecaptcha = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('reCAPTCHA only works in browser environment'));
        return;
      }

      // Check if reCAPTCHA is already loaded
      if (window.grecaptcha && window.grecaptcha.ready) {
        resolve();
        return;
      }

      // Check if script is already added
      if (document.querySelector('script[src*="recaptcha"]')) {
        // Wait for it to load
        const checkLoaded = () => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Add reCAPTCHA script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          resolve();
        } else {
          reject(new Error('reCAPTCHA failed to load properly'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    console.log('🔍 executeRecaptcha called with:', {
      action,
      siteKey: RECAPTCHA_SITE_KEY ? `${RECAPTCHA_SITE_KEY.substring(0, 15)}...` : 'NOT FOUND',
      siteKeyLength: RECAPTCHA_SITE_KEY?.length || 0
    });

    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY.trim() === '') {
      console.error('❌ reCAPTCHA site key validation failed:', {
        siteKey: RECAPTCHA_SITE_KEY,
        type: typeof RECAPTCHA_SITE_KEY,
        envViteRecaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY
      });
      throw new Error('reCAPTCHA site key not configured. Check VITE_RECAPTCHA_SITE_KEY in .env file');
    }

    if (typeof window === 'undefined') {
      throw new Error('reCAPTCHA only works in browser environment');
    }

    // Ensure reCAPTCHA is loaded
    await loadRecaptcha();

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
          .then((token: string) => {
            if (!token) {
              reject(new Error('reCAPTCHA token generation failed'));
            } else {
              resolve(token);
            }
          })
          .catch((error: any) => {
            reject(new Error(`reCAPTCHA execution failed: ${error.message || error}`));
          });
      });
    });
  }, [loadRecaptcha]);

  return {
    executeRecaptcha,
    loadRecaptcha,
    isConfigured
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
