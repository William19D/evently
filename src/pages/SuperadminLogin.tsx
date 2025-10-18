import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { authClient } from "@/lib/authClient";
import authBackground from "@/assets/auth-background.jpg";

const SuperadminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, signOut } = useAuth();
  const { executeRecaptcha, loadRecaptcha } = useRecaptcha();

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate("/superadmin/dashboard");
    }
  }, [user, navigate]);

  // Load reCAPTCHA when component mounts
  useEffect(() => {
    loadRecaptcha().catch(console.error);
  }, [loadRecaptcha]);

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
      console.log('🔄 SuperadminLogin: Starting login process with reCAPTCHA...');
      
      // Execute reCAPTCHA before login
      const recaptchaToken = await executeRecaptcha('login');
      console.log('✅ reCAPTCHA token obtained for superadmin login');
      
      const result = await signIn(email, password, recaptchaToken);
      
      if (result.error) {
        // Manejo específico para superadmin
        if (result.error.includes('verificar tu email')) {
          setErrors({
            general: "Esta cuenta necesita ser activada. Contacta al administrador del sistema."
          });
        } else {
          setErrors({
            general: result.error.includes('Invalid') || result.error.includes('inválidas')
              ? "Credenciales incorrectas. Verifica tu email y contraseña." 
              : result.error
          });
        }
      } else if (result.success) {
        // Verificar que el usuario tenga rol de superadmin
        const currentUser = authClient.getCurrentUser();
        if (currentUser && currentUser.role === 'superadmin') {
          // El mensaje de éxito se muestra en AuthContext
          navigate("/superadmin/dashboard");
        } else {
          setErrors({
            general: "Acceso denegado. Este usuario no tiene permisos de superadministrador."
          });
          await signOut(); // Cerrar sesión si no es superadmin
        }
      } else {
        setErrors({
          general: "Error de autenticación. Inténtalo de nuevo."
        });
      }
    } catch (error) {
      console.error('Superadmin login error:', error);
      
      // Manejar errores específicos de reCAPTCHA
      const errorMessage = error instanceof Error ? error.message : String(error);
      let friendlyErrorMessage: string;
      
      if (errorMessage.toLowerCase().includes('recaptcha')) {
        friendlyErrorMessage = "Error de verificación de seguridad. Por favor, intenta nuevamente.";
      } else {
        friendlyErrorMessage = "Error de conexión. Inténtalo de nuevo.";
      }
      
      setErrors({
        general: friendlyErrorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Panel de administración" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-400/10"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Panel de Administración</h2>
            <p className="text-lg text-white/90">Control total sobre la plataforma de espacios</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <Card className="shadow-lg border-0 border-red-200">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-red-800">Superadministrador</CardTitle>
              <CardDescription>
                Acceso restringido al panel de control
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <strong>Zona restringida:</strong> Solo personal autorizado
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
                      placeholder="admin@evently.com"
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

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Verificando acceso..." : "Acceder al Panel"}
                </Button>
              </form>

              <div className="text-center text-xs text-muted-foreground border-t pt-4">
                Panel restringido - Solo personal autorizado
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperadminLogin;