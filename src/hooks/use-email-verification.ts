import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getLoginRedirectPath } from '@/lib/redirectUtils';

/**
 * Hook para manejar la verificación automática de email cuando el usuario
 * llega desde un enlace de confirmación de Supabase
 */
export const useEmailVerificationHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Verificar si estamos en una URL de callback de Supabase
        const currentUrl = window.location.href;
        const isCallbackUrl = currentUrl.includes('#access_token=') || 
                              currentUrl.includes('?access_token=') ||
                              window.location.hash.includes('access_token');

        if (!isCallbackUrl) {
          return;
        }

        console.log('🔄 useEmailVerificationHandler: Detected callback URL', {
          currentUrl: currentUrl.substring(0, 100) + '...',
          hasHash: !!window.location.hash,
          hashLength: window.location.hash.length
        });

        // Procesar los parámetros de autenticación de Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ useEmailVerificationHandler: Error getting session', error);
          toast.error('Error en verificación', {
            description: 'Hubo un problema al verificar tu email. Intenta nuevamente.'
          });
          return;
        }

        if (data.session && data.session.user) {
          console.log('✅ useEmailVerificationHandler: Session found', {
            userId: data.session.user.id,
            email: data.session.user.email,
            confirmed: !!data.session.user.email_confirmed_at,
            role: data.session.user.user_metadata?.role
          });

          // Limpiar la URL de los parámetros de callback
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);

          // Mostrar mensaje de éxito
          toast.success('¡Verificación exitosa!', {
            description: '¡Bienvenido! Tu email ha sido verificado.',
            duration: 5000
          });

          // Redirigir según el rol del usuario después de mostrar el mensaje
          const userRole = data.session.user.user_metadata?.role || 'member';
          const redirectPath = getLoginRedirectPath(userRole);
          
          console.log('🔄 useEmailVerificationHandler: Redirecting user', { 
            userRole, 
            redirectPath 
          });

          setTimeout(() => {
            navigate(redirectPath);
          }, 2000);

        } else {
          console.warn('⚠️ useEmailVerificationHandler: No session found in callback URL');
        }

      } catch (error) {
        console.error('💥 useEmailVerificationHandler: Exception during verification', error);
        toast.error('Error inesperado', {
          description: 'Hubo un problema procesando la verificación de email.'
        });
      }
    };

    // Ejecutar inmediatamente
    handleEmailVerification();

    // También escuchar cambios en el hash (por si el usuario navega)
    const handleHashChange = () => {
      handleEmailVerification();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigate]);
};

export default useEmailVerificationHandler;