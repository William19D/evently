import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Users, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  Car, 
  Music, 
  Camera,
  Coffee,
  Shield,
  MessageCircle
} from "lucide-react";
import { Event } from "@/types/event";

interface EventInfoProps {
  event: Event;
}

export const EventInfo = ({ event }: EventInfoProps) => {
  const amenityIcons: { [key: string]: React.ReactNode } = {
    "WiFi gratuito": <Wifi className="h-4 w-4" />,
    "Parqueadero": <Car className="h-4 w-4" />,
    "Sistema de sonido": <Music className="h-4 w-4" />,
    "Fotografía permitida": <Camera className="h-4 w-4" />,
    "Catering disponible": <Coffee className="h-4 w-4" />,
    "Seguridad privada": <Shield className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Organizer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organizador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
              <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{event.organizer.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{event.organizer.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{event.organizer.events} eventos</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                <Button size="sm" variant="outline">
                  Ver perfil
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's included */}
      <Card>
        <CardHeader>
          <CardTitle>¿Qué incluye?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {event.includes.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios y comodidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {event.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {amenityIcons[amenity] || <CheckCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Normas del evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {event.rules.map((rule, index) => (
              <div key={index} className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{rule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Reseñas ({event.reviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold">{event.rating}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(event.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Basado en {event.reviews} reseñas
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Sample reviews */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">María González</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "Excelente espacio para eventos corporativos. Todo muy bien organizado y el equipo muy profesional."
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Juan Rodríguez</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-3 w-3 text-gray-300" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "Muy buen lugar, solo que el parqueadero es un poco limitado. El resto perfecto."
              </p>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">
            Ver todas las reseñas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
