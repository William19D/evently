import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MfaLogin from "@/components/MfaLogin";
import authBackground from "@/assets/auth-background.jpg";

const OwnerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {};
    
    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        // Check if MFA is required
        if (result.mfaRequired) {
          setShowMfaDialog(true);
          toast({
            title: "Verificación Requerida",
            description: "Ingresa tu código de autenticación de dos factores",
          });
        } else {
          // Regular login success
          toast({
            title: "¡Bienvenido Propietario!",
            description: "Has iniciado sesión exitosamente",
          });
          
          // Redirect to owner dashboard after a short delay to ensure context is updated
          setTimeout(() => {
            navigate('/owner/dashboard');
          }, 100);
        }
      } else {
        // Handle login errors
        if (result.error?.includes('Credenciales inválidas') || result.error?.includes('Invalid login credentials')) {
          setErrors({
            general: "Credenciales inválidas. Verifica tu email y contraseña."
          });
        } else if (result.error?.includes('Email not confirmed') || result.error?.includes('verificar tu email')) {
          setErrors({
            general: result.error
          });
          // Show option to resend verification
          setTimeout(() => {
            if (window.confirm('¿Quieres que te reenviemos el código de verificación?')) {
              navigate("/verify-email", {
                state: {
                  email: email,
                  role: 'owner',
                  fromLogin: true
                }
              });
            }
          }, 2000);
        } else {
          setErrors({
            general: result.error || "Error al iniciar sesión"
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: "Error de conexión. Intenta nuevamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    setShowMfaDialog(false);
    toast({
      title: "¡Bienvenido Propietario!",
      description: "Has iniciado sesión exitosamente",
    });
    
    // Navigate to owner dashboard
    navigate('/owner/dashboard');
  };

  const handleMfaCancel = () => {
    setShowMfaDialog(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Espacio de eventos elegante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-emerald-400/10"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Comparte tus espacios</h2>
            <p className="text-lg text-white/90">Conecta con clientes y haz crecer tu negocio de eventos</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-muted-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Iniciar Sesión - Propietario</CardTitle>
            <CardDescription>
              Accede a tu cuenta para gestionar tus espacios
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                <strong>Inicio de sesión:</strong> Usa tu email y contraseña verificados
              </AlertDescription>
            </Alert>

            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Como propietario, debes usar tu correo y contraseña para mayor seguridad.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 transition-colors ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 transition-colors ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full shadow-md hover:shadow-lg transition-all duration-200" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link to="/register/owner" className="text-primary hover:underline font-medium transition-colors">
                Regístrate como propietario
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* MFA Dialog */}
      <MfaLogin
        onMfaSuccess={handleMfaSuccess}
        onCancel={handleMfaCancel}
        isOpen={showMfaDialog}
      />
    </div>
  );
};

export default OwnerLogin;