import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Heart, Share2, Star } from "lucide-react";
import { Event } from "@/types/event";

interface EventHeaderProps {
  event: Event;
}

export const EventHeader = ({ event }: EventHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Subtle overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="icon" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Event Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground shadow-md">
            {event.category}
          </Badge>
        </div>
      </div>

      {/* Event Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
            <p className="text-lg text-muted-foreground">{event.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-primary">${event.price.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Precio base</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString('es-CO')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Hasta {event.capacity} personas</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{event.rating} ({event.reviews} reseñas)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
