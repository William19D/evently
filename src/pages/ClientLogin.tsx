import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Chrome, AlertCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MfaLogin from "@/components/MfaLogin";
import authBackground from "@/assets/auth-background.jpg";

const ClientLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  // 🔍 Debug state changes
  useEffect(() => {
    console.log('🔍 ClientLogin: showMfaDialog state changed:', { 
      showMfaDialog, 
      timestamp: new Date().toLocaleTimeString() 
    });
  }, [showMfaDialog]);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {};
    
    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
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
      console.log('🔄 ClientLogin: Starting login process...');
      const result = await signIn(email, password);
      
      console.log('📊 ClientLogin: Login result received:', {
        success: result.success,
        mfaRequired: result.mfaRequired,
        error: result.error
      });
      
      // 🔐 CRITICAL: Check for MFA requirement FIRST
      if (result.mfaRequired) {
        console.log('🔐 ClientLogin: MFA required - redirecting to MFA verification page');
        navigate('/mfa-verification', { replace: true });
        return;
      }

      // ✅ Check for successful login without MFA
      if (result.success && !result.mfaRequired) {
        console.log('✅ ClientLogin: Login successful without MFA');
        toast({
          title: "¡Bienvenido Cliente!",
          description: "Has iniciado sesión correctamente.",
        });
        navigate("/");
        setIsLoading(false);
        return;
      }

      // ❌ Handle errors
      if (result.error) {
        console.log('❌ ClientLogin: Login error:', result.error);
        
        if (result.error.includes("Invalid login credentials") || result.error.includes("Credenciales inválidas")) {
          setErrors({ general: "Correo electrónico o contraseña incorrectos" });
        } else if (result.error.includes("Email not confirmed") || result.error.includes("verificar tu email")) {
          setErrors({ general: "Por favor confirma tu email antes de iniciar sesión" });
        } else {
          setErrors({ general: result.error });
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      // 🤔 Unexpected state
      console.warn('⚠️ ClientLogin: Unexpected login state:', result);
      setErrors({ general: "Estado de login inesperado. Intenta nuevamente." });
      
    } catch (error) {
      console.error('❌ ClientLogin: Exception during login:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      setErrors({ general: "Error de conexión. Intenta nuevamente." });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    setShowMfaDialog(false);
    toast({
      title: "¡Bienvenido Cliente!",
      description: "Has iniciado sesión correctamente.",
    });
    navigate("/");
  };

  const handleMfaCancel = () => {
    setShowMfaDialog(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Espacio de eventos elegante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Encuentra tu espacio perfecto</h2>
            <p className="text-lg text-white/90">Conectamos clientes con los mejores espacios para eventos en Colombia</p>
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

          <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Iniciar Sesión - Cliente</CardTitle>
            <CardDescription>
              Accede a tu cuenta para buscar espacios
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Inicio de sesión:</strong> Usa tu email y contraseña verificados
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
              <Link to="/register/client" className="text-primary hover:underline font-medium transition-colors">
                Regístrate como cliente
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      
      <MfaLogin
        isOpen={showMfaDialog}
        onMfaSuccess={handleMfaSuccess}
        onCancel={handleMfaCancel}
      />
    </div>
  );
};

export default ClientLogin;