import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get URL parameters (both query params and hash params)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Check for authorization code (OAuth code flow)
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Also check hash params as fallback
        const accessToken = hashParams.get('access_token');
        const hashError = hashParams.get('error');
        const hashErrorDescription = hashParams.get('error_description');

        // Check for errors first
        if (error || hashError) {
          console.error('Auth error:', error || hashError, errorDescription || hashErrorDescription);
          setError(errorDescription || hashErrorDescription || 'Error en la autenticación');
          setIsProcessing(false);
          setTimeout(() => navigate('/login-selection'), 3000);
          return;
        }

        // Handle authorization code flow (preferred)
        if (code) {
          console.log('Processing OAuth callback with authorization code...');
          
          const result = await handleGoogleCallback(code);

          if (result.success) {
            console.log('Google authentication successful');
            
            // Clean the URL by replacing the current history entry
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Wait a moment for the auth context to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Navigate to the main page
            navigate('/', { replace: true });
          } else {
            console.error('Google authentication failed:', result.error);
            setError(result.error || 'Error al procesar la autenticación con Google');
            setIsProcessing(false);
            setTimeout(() => navigate('/login-selection'), 3000);
          }
        }
        // Handle legacy implicit flow (fallback)
        else if (accessToken) {
          console.log('Processing OAuth callback with access token (legacy flow)...');
          
          const result = await handleGoogleCallback(accessToken);

          if (result.success) {
            console.log('Google authentication successful');
            
            // Clean the URL by replacing the current history entry
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Wait a moment for the auth context to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Navigate to the main page
            navigate('/', { replace: true });
          } else {
            console.error('Google authentication failed:', result.error);
            setError(result.error || 'Error al procesar la autenticación con Google');
            setIsProcessing(false);
            setTimeout(() => navigate('/login-selection'), 3000);
          }
        } else {
          console.log('No authorization code or access token found, redirecting to login...');
          navigate('/login-selection', { replace: true });
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setError('Error inesperado en la autenticación');
        setIsProcessing(false);
        setTimeout(() => navigate('/login-selection'), 3000);
      }
    };

    processCallback();
  }, [navigate, handleGoogleCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <p className="text-sm text-gray-500">Redirigiendo al login en unos momentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando Autenticación</h2>
          <p className="text-gray-600">Estamos configurando tu sesión con tu sistema personalizado...</p>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500">Esto solo tomará unos segundos</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;