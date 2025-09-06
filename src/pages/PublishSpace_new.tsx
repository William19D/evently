import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { spacesClient } from '../lib/spacesClient';
import { authClient } from '../lib/authClient';
import { toast } from 'sonner';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  DollarSign, 
  Camera, 
  Star, 
  Check,
  X,
  Upload,
  Loader2
} from 'lucide-react';

interface SpaceData {
  spaceName: string;
  spaceType: string;
  maxCapacity: number;
  pricePerHour: number;
  location: string;
  description: string;
  amenities: string[];
  photos?: { data: string; name: string; type: string; }[];
}

const PublishSpace = () => {
  const navigate = useNavigate();
  const { user, isFullyAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    spaceName: "",
    spaceType: "",
    maxCapacity: "",
    pricePerHour: "",
    location: "",
    description: "",
    amenities: [] as string[],
    photos: [] as File[]
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    if (!isFullyAuthenticated()) {
      console.log('⚠️ User not fully authenticated, redirecting to login');
      navigate('/login-selection');
      return;
    }

    // Configurar token en el cliente
    const tokens = authClient.getStoredTokens();
    if (tokens?.access_token) {
      spacesClient.setToken(tokens.access_token);
    }
  }, [user, isFullyAuthenticated, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Algunas imágenes no son válidas', {
        description: 'Solo se permiten imágenes menores a 5MB.'
      });
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles].slice(0, 10) // Máximo 10 fotos
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.spaceName.trim()) {
      newErrors.spaceName = "El nombre del espacio es requerido";
    }

    if (!formData.spaceType) {
      newErrors.spaceType = "El tipo de espacio es requerido";
    }

    if (!formData.maxCapacity || parseInt(formData.maxCapacity) < 1) {
      newErrors.maxCapacity = "La capacidad debe ser al menos 1 persona";
    }

    if (!formData.pricePerHour) {
      newErrors.pricePerHour = "El precio por hora es requerido";
    } else {
      const price = parseFloat(formData.pricePerHour);
      if (isNaN(price) || price < 10000 || price > 10000000) {
        newErrors.pricePerHour = "El precio debe estar entre $10.000 y $10.000.000 COP";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "La ubicación es requerida";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "La descripción debe tener al menos 50 caracteres";
    }

    if (formData.amenities.length === 0) {
      newErrors.amenities = "Selecciona al menos una amenidad";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      // Configurar token actualizado
      const tokens = authClient.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error('No hay token de acceso. Por favor inicia sesión nuevamente.');
      }
      
      spacesClient.setToken(tokens.access_token);

      // Convertir fotos a base64 o URLs
      const processedPhotos = await Promise.all(
        formData.photos.map(async (file) => {
          return new Promise<{data: string, name: string, type: string}>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                data: reader.result as string,
                name: file.name,
                type: file.type
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      // Preparar datos del espacio
      const spaceData: SpaceData = {
        spaceName: formData.spaceName.trim(),
        spaceType: formData.spaceType,
        maxCapacity: parseInt(formData.maxCapacity),
        pricePerHour: parseFloat(formData.pricePerHour),
        location: formData.location.trim(),
        description: formData.description.trim(),
        amenities: formData.amenities,
        photos: processedPhotos
      };

      console.log('📤 Submitting space data:', {
        spaceName: spaceData.spaceName,
        spaceType: spaceData.spaceType,
        maxCapacity: spaceData.maxCapacity,
        pricePerHour: spaceData.pricePerHour,
        amenitiesCount: spaceData.amenities?.length || 0,
        photosCount: spaceData.photos?.length || 0
      });

      // Crear espacio
      const response = await spacesClient.createSpace(spaceData);

      console.log('✅ Space created successfully:', response);

      setIsSubmitted(true);

      toast.success('¡Espacio creado exitosamente!', {
        description: 'Tu espacio está pendiente de aprobación. Te notificaremos cuando esté listo.'
      });

      // Redirigir al dashboard después de un momento
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('❌ Error creating space:', error);
      
      toast.error('Error al crear el espacio', {
        description: error instanceof Error ? error.message : 'Intenta de nuevo en unos momentos.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado condicional
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verificando acceso...</h2>
        </div>
      </div>
    );
  }

  if (!isFullyAuthenticated()) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
              <Card className="shadow-elegant">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-display">Acceso Restringido</CardTitle>
                  <CardDescription>
                    Solo los propietarios verificados pueden publicar espacios para eventos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => navigate('/login-selection')} className="w-full" size="lg">
                    Iniciar Sesión como Propietario
                  </Button>
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/")}
                      className="text-muted-foreground"
                    >
                      Volver al inicio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isSubmitted) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
              <Card className="shadow-elegant">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-display">¡Espacio Enviado!</CardTitle>
                  <CardDescription>
                    Tu espacio ha sido enviado para revisión. Te notificaremos cuando esté aprobado y visible para los clientes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/dashboard')} className="w-full" size="lg">
                    Ir al Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    );
  }

  const amenitiesOptions = [
    "WiFi gratuito", "Aire acondicionado", "Sonido profesional", "Iluminación LED",
    "Proyector", "Cocina equipada", "Baños privados", "Estacionamiento",
    "Seguridad 24/7", "Mobiliario incluido", "Decoración personalizable", "Terraza"
  ];

  const spaceTypes = [
    "Salón de eventos", "Auditorio", "Sala de conferencias", "Terraza",
    "Jardín", "Galería", "Estudio", "Rooftop", "Salón social", "Otro"
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                Publicar Mi Espacio
              </h1>
              <p className="text-muted-foreground text-lg">
                Comparte tu espacio con miles de organizadores de eventos en Colombia
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="spaceName">Nombre del Espacio *</Label>
                      <Input
                        id="spaceName"
                        value={formData.spaceName}
                        onChange={(e) => handleInputChange('spaceName', e.target.value)}
                        placeholder="Ej. Salón Real Garden"
                        className={errors.spaceName ? 'border-red-500' : ''}
                      />
                      {errors.spaceName && (
                        <p className="text-sm text-red-500">{errors.spaceName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spaceType">Tipo de Espacio *</Label>
                      <select
                        id="spaceType"
                        value={formData.spaceType}
                        onChange={(e) => handleInputChange('spaceType', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          errors.spaceType ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Selecciona el tipo</option>
                        {spaceTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.spaceType && (
                        <p className="text-sm text-red-500">{errors.spaceType}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxCapacity">Capacidad Máxima *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="maxCapacity"
                          type="number"
                          min="1"
                          value={formData.maxCapacity}
                          onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                          placeholder="200"
                          className={`pl-10 ${errors.maxCapacity ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.maxCapacity && (
                        <p className="text-sm text-red-500">{errors.maxCapacity}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerHour">Precio por Hora (COP) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="pricePerHour"
                          type="number"
                          min="10000"
                          max="10000000"
                          value={formData.pricePerHour}
                          onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                          placeholder="150000"
                          className={`pl-10 ${errors.pricePerHour ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.pricePerHour && (
                        <p className="text-sm text-red-500">{errors.pricePerHour}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Ej. Carrera 15 #93-47, Bogotá, Colombia"
                        className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe tu espacio: ambientación, características especiales, qué tipo de eventos es ideal..."
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.description.length}/500 caracteres (mínimo 50)
                    </p>
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Amenidades */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Amenidades
                  </CardTitle>
                  <CardDescription>
                    Selecciona las amenidades disponibles en tu espacio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenitiesOptions.map((amenity) => (
                      <Button
                        key={amenity}
                        type="button"
                        variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                        className="justify-start h-auto p-3 text-left"
                        onClick={() => handleAmenityToggle(amenity)}
                      >
                        {formData.amenities.includes(amenity) && (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {amenity}
                      </Button>
                    ))}
                  </div>
                  {errors.amenities && (
                    <p className="text-sm text-red-500 mt-2">{errors.amenities}</p>
                  )}
                </CardContent>
              </Card>

              {/* Fotos */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Fotos del Espacio
                  </CardTitle>
                  <CardDescription>
                    Sube fotos que muestren la belleza y características de tu espacio (máximo 10 fotos, 5MB cada una)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Haz clic para subir fotos o arrastra y suelta
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG hasta 5MB cada una
                      </p>
                    </label>
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botón de envío */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full md:w-auto min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    'Publicar Espacio'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PublishSpace;
