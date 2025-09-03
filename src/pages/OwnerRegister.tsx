import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, AlertCircle, Building2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/authClient";
import authBackground from "@/assets/auth-background.jpg";

const OwnerRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    businessDescription: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

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

    if (!formData.businessName.trim()) {
      newErrors.businessName = "El nombre del negocio es requerido";
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "La dirección es requerida";
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = "La descripción del negocio es requerida";
    } else if (formData.businessDescription.length < 50) {
      newErrors.businessDescription = "La descripción debe tener al menos 50 caracteres";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
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
    
    try {
      const result = await authClient.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'owner'
      });

      if (result.error) {
        if (result.error.includes('User already registered') || result.error.includes('already')) {
          setErrors({
            email: "Este email ya está registrado. Intenta iniciar sesión."
          });
        } else {
          setErrors({
            general: result.error
          });
        }
      } else if (result.success && result.user) {
        toast({
          title: "¡Cuenta de propietario creada!",
          description: "Tu cuenta ha sido creada exitosamente.",
        });
        navigate("/dashboard");
      } else {
        setErrors({
          general: "Error al crear la cuenta. Inténtalo de nuevo."
        });
      }
    } catch (error: any) {
      setErrors({
        general: error.message || "Error de conexión. Inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Espacio de eventos elegante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-indigo-400/10"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Haz crecer tu negocio</h2>
            <p className="text-lg text-white/90">Registra tu negocio y comparte tus espacios con miles de clientes</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link to="/register-selection" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar tipo de usuario
          </Link>

          <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Registro - Propietario</CardTitle>
            <CardDescription>
              Crea tu cuenta para publicar espacios
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Por favor corrige los errores en el formulario</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Como propietario, tu cuenta será revisada antes de la activación por seguridad.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Salón de Eventos Los Girasoles"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    className={`pl-10 transition-colors ${errors.businessName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Dirección del negocio</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="businessAddress"
                    type="text"
                    placeholder="Calle 15 #25-30, Armenia, Quindío"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                    className={`pl-10 transition-colors ${errors.businessAddress ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.businessAddress && (
                  <p className="text-sm text-destructive">{errors.businessAddress}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Descripción del negocio</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="Describe tu negocio, los tipos de espacios que ofreces, servicios incluidos, etc."
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                  className={`min-h-[100px] transition-colors ${errors.businessDescription ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.businessDescription.length}/50 caracteres mínimo
                </p>
                {errors.businessDescription && (
                  <p className="text-sm text-destructive">{errors.businessDescription}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 transition-colors ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                    minLength={8}
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
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    className={`mt-1 transition-colors ${errors.acceptTerms ? 'border-destructive data-[state=checked]:bg-destructive' : ''}`}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                    Acepto los{" "}
                    <Link to="/terms" className="text-primary hover:underline transition-colors">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link to="/privacy" className="text-primary hover:underline transition-colors">
                      política de privacidad
                    </Link>. También entiendo que mi cuenta será revisada antes de la activación.
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">{errors.acceptTerms}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full shadow-md hover:shadow-lg transition-all duration-200" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta de Propietario"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login/owner" className="text-primary hover:underline font-medium transition-colors">
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

export default OwnerRegister;