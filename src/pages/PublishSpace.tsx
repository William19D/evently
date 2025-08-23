import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, MapPin, Users, Calendar, DollarSign, Star, Camera, Trash2 } from "lucide-react";

const PublishSpace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOwner, setIsOwner] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    capacity: "",
    price: "",
    amenities: [] as string[],
    images: [] as string[]
  });

  // Simulated owner bypass
  const handleOwnerBypass = () => {
    setIsOwner(true);
    toast({
      title: "Acceso concedido",
      description: "Bienvenido propietario, puedes publicar tu espacio."
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = () => {
    // Simulated image upload
    const newImage = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop`;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
    toast({
      title: "Imagen agregada",
      description: "La imagen se ha subido correctamente."
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Espacio publicado!",
      description: "Tu espacio ha sido publicado exitosamente y está en revisión."
    });
    navigate("/");
  };

  if (!isOwner) {
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
                    Solo los propietarios pueden publicar espacios para eventos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleOwnerBypass} className="w-full" size="lg">
                    Soy Propietario - Acceder
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
        <Footer />
      </>
    );
  }

  const amenitiesOptions = [
    "WiFi gratuito", "Aire acondicionado", "Sonido profesional", "Iluminación LED",
    "Proyector", "Cocina equipada", "Baños privados", "Estacionamiento",
    "Seguridad 24/7", "Mobiliario incluido", "Decoración personalizable", "Terraza"
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
                  <CardDescription>
                    Describe tu espacio de manera atractiva para los organizadores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Espacio *</Label>
                      <Input
                        id="name"
                        placeholder="Ej: Salón Elegante Centro Histórico"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Tipo de Espacio *</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salon">Salón de Eventos</SelectItem>
                          <SelectItem value="auditorio">Auditorio</SelectItem>
                          <SelectItem value="terraza">Terraza</SelectItem>
                          <SelectItem value="jardin">Jardín</SelectItem>
                          <SelectItem value="centro-convenciones">Centro de Convenciones</SelectItem>
                          <SelectItem value="galeria">Galería</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidad Máxima *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="capacity"
                          type="number"
                          placeholder="Ej: 150"
                          className="pl-10"
                          value={formData.capacity}
                          onChange={(e) => handleInputChange("capacity", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio por Hora (COP) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="Ej: 250000"
                          className="pl-10"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Ej: Carrera 13 #85-32, Chapinero, Bogotá"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe tu espacio: ambiente, características especiales, qué lo hace único..."
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Servicios y Amenidades */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Servicios y Amenidades
                  </CardTitle>
                  <CardDescription>
                    Selecciona los servicios que incluye tu espacio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesOptions.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <Label htmlFor={amenity} className="text-sm font-normal">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Imágenes */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Imágenes del Espacio
                  </CardTitle>
                  <CardDescription>
                    Agrega fotos atractivas que muestren la belleza de tu espacio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageUpload}
                    className="w-full h-32 border-dashed border-2 hover:border-primary/50"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Haz clic para subir imágenes
                      </p>
                    </div>
                  </Button>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-primary hover:opacity-90"
                  size="lg"
                >
                  Publicar Espacio
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