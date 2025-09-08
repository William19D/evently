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
  
  const isConfigured = isValidSiteKey(RECAPTCHA_SITE_KEY);

  const loadRecaptcha = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setError(null);
        
        if (typeof window === 'undefined') {
          const errorMsg = 'reCAPTCHA only works in browser environment';
          setError(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        if (!isConfigured) {
          const errorMsg = `Invalid reCAPTCHA site key: ${RECAPTCHA_SITE_KEY}. Please check your VITE_RECAPTCHA_SITE_KEY in .env file.`;
          setError(errorMsg);
          reject(new Error(errorMsg));
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
            const errorMsg = 'reCAPTCHA failed to load properly';
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        };
        
        script.onerror = () => {
          const errorMsg = 'Failed to load reCAPTCHA script. Check if the site key is valid.';
          setError(errorMsg);
          reject(new Error(errorMsg));
        };

        document.head.appendChild(script);
      } catch (err) {
        const errorMsg = `Error loading reCAPTCHA: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        reject(new Error(errorMsg));
      }
    });
  }, [isConfigured]);

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    console.log('🔍 executeRecaptcha called with:', {
      action,
      siteKey: RECAPTCHA_SITE_KEY ? `${RECAPTCHA_SITE_KEY.substring(0, 15)}...` : 'NOT FOUND',
      siteKeyLength: RECAPTCHA_SITE_KEY?.length || 0,
      isConfigured
    });

    if (!isConfigured) {
      const errorMsg = `reCAPTCHA site key not properly configured. Key: ${RECAPTCHA_SITE_KEY}`;
      console.error('❌ reCAPTCHA site key validation failed:', {
        siteKey: RECAPTCHA_SITE_KEY,
        type: typeof RECAPTCHA_SITE_KEY,
        envViteRecaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        isValid: isValidSiteKey(RECAPTCHA_SITE_KEY)
      });
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (typeof window === 'undefined') {
      const errorMsg = 'reCAPTCHA only works in browser environment';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Ensure reCAPTCHA is loaded
      await loadRecaptcha();

      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY!, { action })
            .then((token: string) => {
              if (!token) {
                const errorMsg = 'reCAPTCHA token generation failed';
                setError(errorMsg);
                reject(new Error(errorMsg));
              } else {
                setError(null);
                resolve(token);
              }
            })
            .catch((error: any) => {
              const errorMsg = `reCAPTCHA execution failed: ${error.message || error}`;
              setError(errorMsg);
              reject(new Error(errorMsg));
            });
        });
      });
    } catch (executeError) {
      const errorMsg = `Error executing reCAPTCHA: ${executeError instanceof Error ? executeError.message : 'Unknown error'}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [loadRecaptcha, isConfigured]);

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
