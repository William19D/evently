// Test script to verify environment variables
console.log('🔧 Environment Variables Test:');
console.log('VITE_RECAPTCHA_SITE_KEY:', import.meta.env.VITE_RECAPTCHA_SITE_KEY);
console.log('All VITE_ variables:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('All environment variables:', import.meta.env);

export const envTest = {
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  hasRecaptcha: !!import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  allViteKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
};
