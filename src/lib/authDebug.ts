// Temporary debugging configuration
// Remove this file after fixing the auth issues

export const debugConfig = {
  // Enable detailed logging
  enableLogging: true,
  
  // Log all requests and responses
  logRequests: true,
  
  // Log auth flow steps
  logAuthFlow: true
};

// Helper function to log auth steps
export const logAuthStep = (step: string, data?: any) => {
  if (debugConfig.logAuthFlow) {
    console.log(`🔍 AUTH DEBUG [${step}]:`, data || 'No additional data');
  }
};

// Helper function to log errors with more context
export const logAuthError = (context: string, error: any) => {
  console.error(`🚨 AUTH ERROR [${context}]:`, {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
    cause: error?.cause,
    fullError: error
  });
};

// Helper to check environment variables
export const checkEnvVars = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('🚨 Missing environment variables:', missing);
    return false;
  }

  console.log('✅ All required environment variables are present');
  return true;
};
