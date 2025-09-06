import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Lock, 
  LogIn, 
  RefreshCw, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MfaLogin from '@/components/MfaLogin';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Login component - calling signIn...');
      const result = await signIn(formData.email, formData.password);
      console.log('🔍 Login component - signIn result:', {
        success: result.success,
        mfaRequired: result.mfaRequired,
        error: result.error
      });
      
      if (result.success) {
        // Check if MFA is required
        if (result.mfaRequired) {
          console.log('🔐 Login component - MFA required, showing dialog');
          setShowMfaDialog(true);
          console.log('🔐 Login component - showMfaDialog set to true');
          toast({
            title: "Verificación Requerida",
            description: "Ingresa tu código de autenticación de dos factores",
          });
        } else {
          // Regular login success
          toast({
            title: "Bienvenido",
            description: "Has iniciado sesión exitosamente",
          });
          
          // Redirect based on user role (user is now in context)
          // We'll navigate after a short delay to ensure context is updated
          setTimeout(() => {
            if (user?.role === 'superadmin') {
              navigate('/superadmin/dashboard');
            } else if (user?.role === 'owner') {
              navigate('/owner/dashboard');
            } else {
              navigate('/');
            }
          }, 100);
        }
      } else {
        // Handle login errors
        if (result.error?.includes('Invalid login credentials')) {
          toast({
            title: "Error de acceso",
            description: "Email o contraseña incorrectos",
            variant: "destructive",
          });
        } else if (result.error?.includes('Email not confirmed')) {
          toast({
            title: "Email no confirmado",
            description: "Revisa tu email y confirma tu cuenta",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Error al iniciar sesión",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    setShowMfaDialog(false);
    toast({
      title: "Bienvenido",
      description: "Has iniciado sesión exitosamente",
    });
    
    // Navigate based on role (we should get this from auth context)
    navigate('/');
  };

  const handleMfaCancel = () => {
    setShowMfaDialog(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">Accede a tu cuenta de Evently</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Acceso</span>
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Tu contraseña"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link 
                  to="/register-selection" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Regístrate aquí
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MFA Dialog */}
        <MfaLogin
          onMfaSuccess={handleMfaSuccess}
          onCancel={handleMfaCancel}
          isOpen={showMfaDialog}
        />

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
