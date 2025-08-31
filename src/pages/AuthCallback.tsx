import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 Processing auth callback...');
      console.log('🔄 Current URL:', window.location.href);
      console.log('🔄 Hash:', window.location.hash);
      
      try {
        // Supabase debería procesar automáticamente el hash fragment
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔄 Session after callback:', { hasSession: !!session, error });
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          toast({
            title: "Error de autenticación",
            description: "Hubo un problema al procesar el login. Inténtalo de nuevo.",
            variant: "destructive"
          });
          navigate('/login/client');
          return;
        }

        if (session) {
          console.log('✅ Auth callback successful:', session.user.email);
          toast({
            title: "¡Bienvenido!",
            description: `Has iniciado sesión correctamente como ${session.user.email}`,
          });
          
          // Limpiar el hash de la URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          navigate('/');
        } else {
          console.log('⚠️ No session found after callback');
          navigate('/login/client');
        }
      } catch (error) {
        console.error('❌ Auth callback exception:', error);
        toast({
          title: "Error de autenticación",
          description: "Hubo un problema al procesar el login. Inténtalo de nuevo.",
          variant: "destructive"
        });
        navigate('/login/client');
      }
    };

    // Solo procesar si hay hash fragment con tokens
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    } else {
      // Si no hay tokens, redirigir a login
      navigate('/login/client');
    }
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-muted-foreground">
          Procesando autenticación...
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Esto solo tomará un momento
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
