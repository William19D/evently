import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import { EventHeader } from "@/components/EventDetails/EventHeader";
import { EventCalendar } from "@/components/EventDetails/EventCalendar";
import { EventLocation } from "@/components/EventDetails/EventLocation";
import { EventInfo } from "@/components/EventDetails/EventInfo";
import { EventBooking } from "@/components/EventDetails/EventBooking";
import { getEventById } from "@/data/events";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const event = id ? getEventById(id) : undefined;

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Evento no encontrado</h1>
          <p className="text-muted-foreground">
            Los detalles de eventos estarán disponibles una vez que se complete la integración con la base de datos.
          </p>
          <Link to="/search">
            <Button>Volver a búsqueda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del evento ha sido copiado al portapapeles.",
      });
    }
  };

  const handleFavorite = () => {
    toast({
      title: "Agregado a favoritos",
      description: `${event.title} ha sido agregado a tus favoritos.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/search" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver a búsqueda
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleFavorite}>
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <EventHeader event={event} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <EventCalendar 
                event={event}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
              <EventLocation event={event} />
            </div>
            
            <EventInfo event={event} />
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <EventBooking 
              event={event}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
