import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, ArrowLeft, Chrome, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { authClient } from "@/lib/authClient";
import { getDisplayError } from "@/utils/errorMessages";
import RecaptchaBadge from "@/components/RecaptchaBadge";
import RecaptchaConfigError from "@/components/RecaptchaConfigError";
import authBackground from "@/assets/auth-background.jpg";

const ClientRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const { executeRecaptcha, loadRecaptcha, isConfigured, error: recaptchaError } = useRecaptcha();

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }
    
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Ingresa un número de teléfono válido (10 dígitos)";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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
      console.log('🔄 ClientRegister: Starting registration process with reCAPTCHA...');
      
      // Execute reCAPTCHA before registration
      const recaptchaToken = await executeRecaptcha('register');
      setRecaptchaLoading(false);
      setRecaptchaVerified(true);
      console.log('✅ reCAPTCHA token obtained for registration');
      
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'member' // Cliente se registra como 'member'
      }, recaptchaToken);

      if (result.error) {
        if (result.error.includes('User already registered') || result.error.includes('ya está registrado')) {
          setErrors({
            email: "Este email ya está registrado. Intenta iniciar sesión."
          });
        } else {
          const friendly = getDisplayError(result.error);
          setErrors({
            general: friendly
          });
        }
      } else if (result.success) {
        toast({
          title: "¡Registro exitoso!",
          description: "Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.",
        });
        
        // Mostrar mensaje de email enviado
        setRegisteredEmail(formData.email);
        setShowEmailSent(true);
        setErrors({});
      } else {
        // Extraer mensaje específico del servidor si existe
        const errorMessage = getDisplayError(result);
        console.log('📢 User-friendly registration error:', errorMessage);
        
        setErrors({
          general: errorMessage
        });
      }
    } catch (error: any) {
      console.error('❌ Registration exception:', error);
      
      // Manejar errores específicos de reCAPTCHA
      const errorMessage = error instanceof Error ? error.message : String(error);
      let friendlyErrorMessage: string;
      
      if (errorMessage.toLowerCase().includes('recaptcha')) {
        friendlyErrorMessage = "Error de verificación de seguridad. Por favor, intenta nuevamente.";
      } else {
        // Usar el sistema de manejo de errores user-friendly
        friendlyErrorMessage = getDisplayError(error);
      }
      
      console.log('📢 User-friendly registration exception:', friendlyErrorMessage);
      
      setErrors({
        general: friendlyErrorMessage
      });
    } finally {
      setIsLoading(false);
      setRecaptchaLoading(false);
    }
  };

  // Si se ha enviado el email de confirmación, mostrar mensaje
  if (showEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">¡Registro Exitoso!</CardTitle>
              <CardDescription>
                Verifica tu email para completar el registro
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>¡Te has registrado exitosamente como Cliente!</strong>
                  <br />
                  <br />
                  Hemos enviado un email de confirmación a:
                  <br />
                  <strong>{registeredEmail}</strong>
                </AlertDescription>
              </Alert>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <strong>¿Qué hacer ahora?</strong>
                  <br />
                  1. Revisa tu email (incluye la carpeta de spam)
                  <br />
                  2. Haz clic en el enlace "Confirmar mi cuenta"
                  <br />
                  3. ¡Tu cuenta estará lista para usar!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login/client')}
                  className="w-full shadow-md hover:shadow-lg transition-all duration-200" 
                  size="lg"
                >
                  Ir al Login
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowEmailSent(false);
                    setRegisteredEmail('');
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      password: '',
                      confirmPassword: '',
                      acceptTerms: false
                    });
                  }}
                  variant="outline"
                  className="w-full transition-all duration-200" 
                  size="lg"
                >
                  Registrar otra cuenta
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                ¿No recibiste el email?{" "}
                <a 
                  href="mailto:eventlysoporte@gmail.com" 
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Contactar soporte
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Espacio de eventos elegante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-400/10"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Únete a Evently</h2>
            <p className="text-lg text-white/90">Descubre espacios únicos para tus eventos especiales</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/register-selection" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar tipo de usuario
          </Link>

          <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Registro - Cliente</CardTitle>
            <CardDescription>
              Crea tu cuenta para buscar espacios
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error de configuración de reCAPTCHA */}
            {recaptchaError && <RecaptchaConfigError error={recaptchaError} siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} />}
            
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Por favor corrige los errores en el formulario</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Registro como Cliente:</strong> Después del registro recibirás un email de verificación
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`pl-10 transition-colors ${errors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`transition-colors ${errors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 transition-colors ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="316 789 4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`pl-10 transition-colors ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 transition-colors ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 transition-colors ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    className={`transition-colors ${errors.acceptTerms ? 'border-destructive data-[state=checked]:bg-destructive' : ''}`}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-none">
                    Acepto los{" "}
                    <Link to="/terms" className="text-primary hover:underline transition-colors">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link to="/privacy" className="text-primary hover:underline transition-colors">
                      política de privacidad
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">{errors.acceptTerms}</p>
                )}
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
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login/client" className="text-primary hover:underline font-medium transition-colors">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;