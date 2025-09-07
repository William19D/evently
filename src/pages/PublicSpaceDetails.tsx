import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Users, 
  Star,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Camera,
  CheckCircle
} from "lucide-react";
import { publicSpacesClient, type PublicSpace } from "@/lib/publicSpacesClient";
import { useToast } from "@/hooks/use-toast";

const PublicSpaceDetails = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<PublicSpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { toast } = useToast();

  // Cargar detalles del espacio
  useEffect(() => {
    const loadSpace = async () => {
      if (!spaceId) return;

      try {
        setIsLoading(true);
        const response = await publicSpacesClient.getPublicSpace(
          parseInt(spaceId), 
          true // incluir reviews
        );
        
        if (response.success) {
          setSpace(response.data);
        } else {
          throw new Error("Espacio no encontrado");
        }
      } catch (error: any) {
        console.error("Error loading space:", error);
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar el espacio",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSpace();
  }, [spaceId, toast]);

  // Renderizar estrellas de rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se encontró el espacio solicitado o no está disponible.
            </AlertDescription>
          </Alert>
          <Link to="/spaces">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Espacios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-6">
          <Link to="/spaces">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Espacios
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Fotos y detalles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de fotos */}
            <Card>
              <CardContent className="p-0">
                {space.photos.length > 0 ? (
                  <div>
                    {/* Foto principal */}
                    <div className="relative">
                      <img
                        src={space.photos[selectedPhotoIndex]?.url}
                        alt={space.name}
                        className="w-full h-96 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800">
                        {space.type}
                      </Badge>
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {selectedPhotoIndex + 1} de {space.photos.length}
                      </div>
                    </div>
                    
                    {/* Thumbnails */}
                    {space.photos.length > 1 && (
                      <div className="p-4 flex gap-2 overflow-x-auto">
                        {space.photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            onClick={() => setSelectedPhotoIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              index === selectedPhotoIndex 
                                ? 'border-purple-500 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={`${space.name} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Sin fotos disponibles</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información principal */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{space.name}</CardTitle>
                    <CardDescription className="text-base">
                      {space.description}
                    </CardDescription>
                  </div>
                  {space.rating.count > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        {renderStars(space.rating.stars)}
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">{space.rating.average.toFixed(1)}</div>
                        <div className="text-gray-600">({space.rating.count} reviews)</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ubicación */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-gray-600">{space.location}</p>
                    </div>
                  </div>

                  {/* Capacidad */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Capacidad</p>
                      <p className="text-sm text-gray-600">Hasta {space.capacity} personas</p>
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Estado</p>
                      <p className="text-sm text-gray-600">Disponible</p>
                    </div>
                  </div>
                </div>
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
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {amenity.icon && (
                          <span className="text-lg">{amenity.icon}</span>
                        )}
                        <span className="text-sm font-medium">
                          {amenity.display_name || amenity.name}
                        </span>
                        {amenity.is_custom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
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
                    Comentarios y Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {space.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.reviewer}</span>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Evento: {formatDate(review.event_date)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                        <p className="text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Precio y reserva */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  {space.price_formatted}
                  <span className="text-base font-normal text-gray-600">/hora</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>¿Interesado en este espacio?</strong>
                    <br />
                    Contáctanos para verificar disponibilidad y hacer tu reserva.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Contactar para Reservar
                  </Button>
                  <Button variant="outline" className="w-full">
                    Guardar en Favoritos
                  </Button>
                </div>

                <div className="pt-4 border-t text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Publicado:</strong> {formatDate(space.availability.published_at)}
                  </p>
                  <p>
                    <strong>Última actualización:</strong> {formatDate(space.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSpaceDetails;
