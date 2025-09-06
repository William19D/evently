import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { 
    user, 
    isLoading, 
    isMfaPending, 
    isFullyAuthenticated 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Checking access permissions', {
      pathname: location.pathname,
      requireAuth,
      hasUser: !!user,
      isLoading,
      isMfaPending,
      isFullyAuthenticated: isFullyAuthenticated(),
      timestamp: new Date().toLocaleTimeString()
    });

    // Skip protection if auth is not required
    if (!requireAuth) {
      console.log('✅ ProtectedRoute: Auth not required, allowing access');
      return;
    }

    // Wait for auth to load
    if (isLoading) {
      console.log('⏳ ProtectedRoute: Auth loading, waiting...');
      return;
    }

    // 🔐 CRITICAL: If user has MFA pending, force MFA verification
    if (isMfaPending && location.pathname !== '/mfa-verification') {
      console.log('🔐 ProtectedRoute: MFA pending - redirecting to verification');
      navigate('/mfa-verification', { replace: true });
      return;
    }

    // If user is not authenticated at all, redirect to login
    if (!user) {
      console.log('❌ ProtectedRoute: No user - redirecting to login selection');
      navigate('/login-selection', { 
        replace: true, 
        state: { from: location.pathname } 
      });
      return;
    }

    // If user is not fully authenticated (has user but not complete tokens)
    if (!isFullyAuthenticated()) {
      console.log('⚠️ ProtectedRoute: User not fully authenticated');
      
      // If they're on MFA verification page, that's fine
      if (location.pathname === '/mfa-verification') {
        console.log('✅ ProtectedRoute: User on MFA page, allowing access');
        return;
      }
      
      // Otherwise, redirect to appropriate place
      if (isMfaPending) {
        console.log('🔐 ProtectedRoute: Redirecting to MFA verification');
        navigate('/mfa-verification', { replace: true });
      } else {
        console.log('🔄 ProtectedRoute: Redirecting to login');
        navigate('/login-selection', { 
          replace: true, 
          state: { from: location.pathname } 
        });
      }
      return;
    }

    // If user is fully authenticated but on MFA verification page, redirect home
    if (isFullyAuthenticated() && location.pathname === '/mfa-verification') {
      console.log('✅ ProtectedRoute: User fully authenticated, leaving MFA page');
      navigate('/', { replace: true });
      return;
    }

    console.log('✅ ProtectedRoute: Access granted');
  }, [
    user, 
    isLoading, 
    isMfaPending, 
    isFullyAuthenticated, 
    requireAuth, 
    location.pathname, 
    navigate
  ]);

  // Show loading state
  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If MFA is pending and not on MFA page, don't render children
  if (requireAuth && isMfaPending && location.pathname !== '/mfa-verification') {
    return null;
  }

  // If user is not fully authenticated and not on MFA page, don't render children
  if (requireAuth && !isFullyAuthenticated() && location.pathname !== '/mfa-verification') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
