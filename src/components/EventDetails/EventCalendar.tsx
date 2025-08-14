import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock } from "lucide-react";
import { Event } from "@/types/event";

interface EventCalendarProps {
  event: Event;
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
}

export const EventCalendar = ({ event, onDateSelect, selectedDate }: EventCalendarProps) => {
  const [month, setMonth] = useState<Date>(new Date());

  // Generate available dates (next 30 days as example)
  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip Mondays as example (day 1)
      if (date.getDay() !== 1) {
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      availableDate => 
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
    );
  };

  const timeSlots = [
    "09:00 AM - 12:00 PM",
    "02:00 PM - 05:00 PM", 
    "06:00 PM - 10:00 PM",
    "10:00 PM - 02:00 AM"
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md w-full flex justify-center"
            classNames={{
              months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
              month: "space-y-4 w-full flex-1",
              table: "w-full h-full",
              head_row: "",
              row: "w-full mt-2"
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today || !isDateAvailable(date);
            }}
            modifiers={{
              available: (date) => isDateAvailable(date)
            }}
            modifiersClassNames={{
              available: "bg-primary/10 text-primary font-medium hover:bg-primary/20"
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-primary/10 border border-primary/20 rounded"></div>
            <span>Fechas disponibles</span>
          </div>
          
          {selectedDate && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horarios disponibles
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-full">
                      <div className="font-medium">{slot}</div>
                      <div className="text-sm text-muted-foreground">
                        Desde ${event.price.toLocaleString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Reserva con 24 horas de anticipación</p>
            <p>• Cancelación gratuita hasta 48 horas antes</p>
            <p>• Precios pueden variar según la fecha</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
