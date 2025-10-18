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
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { getDisplayError } from "@/utils/errorMessages";
import MfaLogin from "@/components/MfaLogin";
import RecaptchaBadge from "@/components/RecaptchaBadge";
import { envTest } from "@/lib/envTest";
import authBackground from "@/assets/auth-background.jpg";

const ClientLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { executeRecaptcha, loadRecaptcha, isConfigured, error: recaptchaError } = useRecaptcha();

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

  // Load reCAPTCHA when component mounts
  useEffect(() => {
    loadRecaptcha().catch(console.error);
  }, [loadRecaptcha]);

  // Debug environment variables
  useEffect(() => {
    console.log('🔧 ClientLogin - Environment Test:', envTest);
    console.log('🔧 Direct env access:', {
      VITE_RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
      allViteKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
      isRecaptchaConfigured: isConfigured
    });
    
    if (!isConfigured) {
      console.warn('⚠️ reCAPTCHA not properly configured!');
    }
  }, [isConfigured]);

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
    setRecaptchaLoading(true);
    
    try {
      console.log('🔄 ClientLogin: Starting login process with reCAPTCHA...');
      
      // Execute reCAPTCHA before login
      const recaptchaToken = await executeRecaptcha('login');
      console.log('✅ reCAPTCHA token obtained for login');
      setRecaptchaLoading(false);
      setRecaptchaVerified(true);
      
      const result = await signIn(email, password, recaptchaToken);
      
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
        // El mensaje de éxito se muestra en AuthContext, no duplicar aquí
        navigate("/");
        setIsLoading(false);
        return;
      }

      // ❌ Handle errors
      if (result.error) {
        console.log('❌ ClientLogin: Login error:', result.error);
        
        // Usar el sistema de manejo de errores user-friendly
        const errorMessage = getDisplayError(result.error || result);
        console.log('📢 User-friendly login error:', errorMessage);
        
        setErrors({ general: errorMessage });
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // 🤔 Unexpected state
      console.warn('⚠️ ClientLogin: Unexpected login state:', result);
      setErrors({ general: "Estado de login inesperado. Intenta nuevamente." });
      
    } catch (error) {
      console.error('❌ ClientLogin: Exception during login:', error);
      
      // Manejar errores específicos de reCAPTCHA
      const errorMessage = error instanceof Error ? error.message : String(error);
      let friendlyErrorMessage: string;
      
      if (errorMessage.toLowerCase().includes('recaptcha')) {
        friendlyErrorMessage = "Error de verificación de seguridad. Por favor, intenta nuevamente.";
      } else {
        // Usar el sistema de manejo de errores user-friendly
        friendlyErrorMessage = getDisplayError(error);
      }
      
      console.log('📢 User-friendly login exception:', friendlyErrorMessage);
      
      setErrors({ general: friendlyErrorMessage });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: friendlyErrorMessage,
      });
      
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setRecaptchaLoading(false);
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
            {/* Error de configuración de reCAPTCHA */}
            {recaptchaError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error reCAPTCHA:</strong> {recaptchaError}
                  <br />
                  <small>Verifica tu configuración de VITE_RECAPTCHA_SITE_KEY en el archivo .env</small>
                </AlertDescription>
              </Alert>
            )}
            
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

            {!isConfigured && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Debug:</strong> reCAPTCHA no configurado. Revisa VITE_RECAPTCHA_SITE_KEY en .env
                </AlertDescription>
              </Alert>
            )}

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
                  to="/recover-password" 
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <RecaptchaBadge 
                isLoading={recaptchaLoading}
                isVerified={recaptchaVerified}
                className="justify-center mb-4"
              />

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