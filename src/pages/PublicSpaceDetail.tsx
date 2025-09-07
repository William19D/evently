import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Users, 
  Star,
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Wifi,
  Car,
  Coffee,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { publicSpacesClient, type PublicSpace } from "@/lib/publicSpacesClient";
import { useToast } from "@/hooks/use-toast";

const PublicSpaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [space, setSpace] = useState<PublicSpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Cargar detalles del espacio
  useEffect(() => {
    const loadSpaceDetail = async () => {
      if (!id) {
        navigate('/spaces');
        return;
      }

      try {
        setIsLoading(true);
        const response = await publicSpacesClient.getPublicSpace(parseInt(id), true);
        
        if (response.success) {
          setSpace(response.data);
        } else {
          throw new Error("Espacio no encontrado");
        }
      } catch (error: any) {
        console.error("Error loading space detail:", error);
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar el espacio",
          variant: "destructive"
        });
        navigate('/spaces');
      } finally {
        setIsLoading(false);
      }
    };

    loadSpaceDetail();
  }, [id, navigate, toast]);

  // Renderizar estrellas de rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  // Manejar navegación de fotos
  const handlePreviousPhoto = () => {
    if (space?.photos.length) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? space.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = () => {
    if (space?.photos.length) {
      setCurrentPhotoIndex((prev) => 
        prev === space.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Obtener ícono de amenidad
  const getAmenityIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      wifi: Wifi,
      parking: Car,
      coffee: Coffee,
      // Agregar más íconos según necesites
    };
    
    const IconComponent = iconMap[iconName] || Building2;
    return <IconComponent className="w-4 h-4" />;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del espacio...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo encontrar el espacio solicitado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header con navegación */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/spaces">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Espacios
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
              <p className="text-gray-600">{space.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de fotos */}
            <Card>
              <CardContent className="p-0">
                {space.photos.length > 0 ? (
                  <div className="relative">
                    <img
                      src={space.photos[currentPhotoIndex]?.url}
                      alt={`${space.name} - Foto ${currentPhotoIndex + 1}`}
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    
                    {space.photos.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90"
                          onClick={handlePreviousPhoto}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90"
                          onClick={handleNextPhoto}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-sm">
                          {currentPhotoIndex + 1} / {space.photos.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Miniaturas */}
                {space.photos.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {space.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                            index === currentPhotoIndex ? 'border-purple-600' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={`Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {space.description || "Sin descripción disponible."}
                </p>
              </CardContent>
            </Card>

            {/* Amenidades */}
            {space.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {space.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {getAmenityIcon(amenity.icon)}
                        <span className="text-sm">{amenity.display_name}</span>
                        {amenity.is_custom && (
                          <Badge variant="outline" className="text-xs">
                            Personalizado
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {space.reviews && space.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Reseñas Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {space.reviews.map((review) => (
                    <div key={review.id} className="border-l-4 border-l-purple-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          por {review.reviewer}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar de información */}
          <div className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Espacio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <Badge variant="secondary">{space.type}</Badge>
                </div>

                {/* Capacidad */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Capacidad:
                  </span>
                  <span className="font-medium">{space.capacity} personas</span>
                </div>

                {/* Precio */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Precio:
                  </span>
                  <span className="font-bold text-purple-600 text-lg">
                    {space.price_formatted}/hora
                  </span>
                </div>

                {/* Ubicación */}
                <div className="pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación:</p>
                      <p className="font-medium">{space.location}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rating */}
                {space.rating.count > 0 ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {renderStars(space.rating.stars)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {space.rating.average.toFixed(1)} de 5 ({space.rating.count} reseñas)
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Sin reseñas aún</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">¿Te interesa este espacio?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Regístrate para poder reservar este espacio y muchos más.
                </p>
                <div className="space-y-2">
                  <Link to="/register" className="block">
                    <Button className="w-full" size="lg">
                      Registrarse
                    </Button>
                  </Link>
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detalles</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Publicado: {formatDate(space.availability.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Estado: {space.availability.status === 'available' ? 'Disponible' : 'No disponible'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSpaceDetail;
