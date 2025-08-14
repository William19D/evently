import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, Globe } from "lucide-react";
import { Event } from "@/types/event";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EventLocationProps {
  event: Event;
}

export const EventLocation = ({ event }: EventLocationProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView(
        [event.location.coordinates.lat, event.location.coordinates.lng],
        15
      );

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add custom marker
      const customIcon = L.divIcon({
        html: `<div class="bg-primary text-white p-2 rounded-full shadow-lg">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                 </svg>
               </div>`,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([event.location.coordinates.lat, event.location.coordinates.lng], {
        icon: customIcon,
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${event.title}</h3>
            <p class="text-sm text-gray-600">${event.location.address}</p>
          </div>
        `);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [event]);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`;
    window.open(url, "_blank");
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${event.location.coordinates.lat},${event.location.coordinates.lng}`;
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Info */}
        <div className="space-y-2">
          <h3 className="font-semibold">{event.location.address}</h3>
          <p className="text-sm text-muted-foreground">
            {event.location.city}, {event.location.department}
          </p>
        </div>

        {/* Map */}
        <div className="w-full h-64 rounded-lg overflow-hidden border">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={getDirections}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Cómo llegar
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={openInGoogleMaps}
          >
            <Globe className="h-4 w-4 mr-2" />
            Ver en Maps
          </Button>
        </div>

        {/* Transportation Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Información de transporte</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>🚗 Parqueadero disponible</p>
            <p>🚌 Estación de TransMilenio más cercana: Portal El Dorado</p>
            <p>🚕 Acceso fácil para Uber/Taxi</p>
            <p>🚶‍♂️ 5 min caminando desde la estación</p>
          </div>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>¿Problemas para llegar? Llama al (601) 123-4567</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
