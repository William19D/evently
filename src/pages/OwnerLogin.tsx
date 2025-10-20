import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { getParsedError } from "@/utils/errorMessages";
import MfaLogin from "@/components/MfaLogin";
import EnhancedErrorAlert from "@/components/EnhancedErrorAlert";
import RecaptchaBadge from "@/components/RecaptchaBadge";
import RecaptchaConfigError from "@/components/RecaptchaConfigError";
import authBackground from "@/assets/auth-background.jpg";

const OwnerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string, type?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { executeRecaptcha, loadRecaptcha, isConfigured, error: recaptchaError } = useRecaptcha();

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
    setRecaptchaLoading(true);
    
    try {
      console.log('🔄 OwnerLogin: Starting login process with reCAPTCHA...');
      
      // Execute reCAPTCHA before login
      const recaptchaToken = await executeRecaptcha('login');
      setRecaptchaLoading(false);
      setRecaptchaVerified(true);
      console.log('✅ reCAPTCHA token obtained for owner login');
      
      const result = await signIn(email, password, recaptchaToken);
      
      if (result.success) {
        // Check if MFA is required
        if (result.mfaRequired) {
          setShowMfaDialog(true);
          toast({
            title: "Verificación Requerida",
            description: "Ingresa tu código de autenticación de dos factores",
          });
        } else {
          // Regular login success - El mensaje de éxito se muestra en AuthContext
          // Redirect to owner dashboard after a short delay to ensure context is updated
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        }
      } else {
        // Handle login errors with enhanced error parsing
        const parsedError = getParsedError(result.error || result);
        
        setErrors({
          general: parsedError.message,
          type: parsedError.type
        });
        
        // Solo mostrar toast si no es error de verificación
        if (parsedError.type !== 'verification') {
          toast({
            variant: "destructive",
            title: "Error",
            description: parsedError.message,
          });
        }
      }
    } catch (error) {
      console.error('Owner login error:', error);
      
      // Manejar errores específicos de reCAPTCHA
      const errorMessage = error instanceof Error ? error.message : String(error);
      let friendlyErrorMessage: string;
      
      if (errorMessage.toLowerCase().includes('recaptcha')) {
        friendlyErrorMessage = "Error de verificación de seguridad. Por favor, intenta nuevamente.";
      } else {
        friendlyErrorMessage = "Error de conexión. Intenta nuevamente.";
      }
      
      setErrors({
        general: friendlyErrorMessage
      });
    } finally {
      setIsLoading(false);
      setRecaptchaLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    setShowMfaDialog(false);
    // El mensaje de éxito MFA se muestra en AuthContext
    
    // Navigate to owner dashboard
    navigate('/dashboard');
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
              <EnhancedErrorAlert
                error={errors.general}
                type={errors.type as any}
                onRetry={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                onResendVerification={() => {
                  toast({
                    title: "Funcionalidad próximamente",
                    description: "La función de reenvío estará disponible pronto.",
                  });
                }}
              />
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