import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CreditCard, Shield, Clock } from "lucide-react";
import { Event } from "@/types/event";
import { useToast } from "@/hooks/use-toast";

interface EventBookingProps {
  event: Event;
  selectedDate?: Date;
}

export const EventBooking = ({ event, selectedDate }: EventBookingProps) => {
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const basePrice = event.price;
  const serviceFee = basePrice * 0.1; // 10% service fee
  const taxes = (basePrice + serviceFee) * 0.19; // 19% IVA
  const totalPrice = basePrice + serviceFee + taxes;

  const handleBooking = async () => {
    if (!selectedDate) {
      toast({
        title: "Selecciona una fecha",
        description: "Por favor selecciona una fecha disponible para tu evento.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      toast({
        title: "¡Reserva exitosa!",
        description: "Tu reserva ha sido confirmada. Recibirás un email con los detalles.",
      });
    }, 2000);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Reservar evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            ${basePrice.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Precio base por evento</p>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha seleccionada
          </Label>
          {selectedDate ? (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">
                {selectedDate.toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.time}
              </p>
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Selecciona una fecha en el calendario
              </p>
            </div>
          )}
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <Label htmlFor="guests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Número de invitados
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
            >
              -
            </Button>
            <Input
              id="guests"
              type="number"
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Math.min(event.capacity, parseInt(e.target.value) || 1)))}
              min={1}
              max={event.capacity}
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setGuests(Math.min(event.capacity, guests + 1))}
              disabled={guests >= event.capacity}
            >
              +
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Máximo {event.capacity} personas
          </p>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium">Desglose de precios</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Precio base</span>
              <span>${basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tarifa de servicio</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (19%)</span>
              <span>${taxes.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Booking Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleBooking}
          disabled={isBooking || !selectedDate}
        >
          {isBooking ? "Procesando..." : "Reservar ahora"}
        </Button>

        {/* Guarantees */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Pago 100% seguro</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Cancelación gratuita hasta 48h antes</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">Métodos de pago aceptados:</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">Visa</Badge>
            <Badge variant="outline" className="text-xs">Mastercard</Badge>
            <Badge variant="outline" className="text-xs">PSE</Badge>
            <Badge variant="outline" className="text-xs">Nequi</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
