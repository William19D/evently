import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CalendarDays, AlertTriangle, Loader2, MapPin, Users, DollarSign } from 'lucide-react';
import { format, addHours, isSameDay, isAfter, isBefore, startOfDay, addDays, getHours, setHours, setMinutes, setSeconds, parseISO, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { SpaceAvailabilityClient, DayAvailability, TimeSlot } from '@/lib/spaceAvailabilityClient';
import { useToast } from '@/hooks/use-toast';

interface TimeBlock {
  hour: number;
  timeSlot: string;
  isAvailable: boolean;
  isPast: boolean;
  conflictWith?: {
    id: number;
    start: string;
    end: string;
    status: string;
  };
}

interface TimeBlockSelectorProps {
  spaceId: number;
  selectedDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (startTime: Date | null, endTime: Date | null) => void;
  maxDuration: number; // En horas
  onSpaceInfoLoaded?: (spaceInfo: any) => void;
}

export function TimeBlockSelector({
  spaceId,
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onTimeChange,
  maxDuration = 12,
  onSpaceInfoLoaded
}: TimeBlockSelectorProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectingStart, setSelectingStart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [spaceInfo, setSpaceInfo] = useState<any>(null);
  const [dayAvailability, setDayAvailability] = useState<DayAvailability | null>(null);
  const { toast } = useToast();

  // Cargar disponibilidad del espacio para una fecha específica
  const loadDayAvailability = async (date: Date) => {
    if (!spaceId || !date) return;

    setLoading(true);
    try {
      console.log('🔍 Loading availability for date:', format(date, 'yyyy-MM-dd'));
      
      // Calcular duración basada en la selección actual o usar 1 hora por defecto
      let duration = 1;
      if (startTime && endTime) {
        duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      }

      const availability = await SpaceAvailabilityClient.getDayAvailability(spaceId, date, duration);
      
      if (availability) {
        setDayAvailability(availability);
        
        // Si es la primera vez que cargamos, guardar info del espacio
        if (!spaceInfo && onSpaceInfoLoaded && availability) {
          // La información del espacio viene en la respuesta mensual
          try {
            const monthlyData = await SpaceAvailabilityClient.getMonthlyAvailability(
              spaceId, 
              date.getFullYear(),
              date.getMonth() + 1,
              duration
            );
            setSpaceInfo(monthlyData.space);
            onSpaceInfoLoaded(monthlyData.space);
          } catch (error) {
            console.error('Error loading space info:', error);
          }
        }
        
        generateTimeBlocks(date, availability);
      } else {
        // Si no hay disponibilidad, generar bloques vacíos
        generateTimeBlocks(date, null);
      }
    } catch (error) {
      console.error('❌ Error loading day availability:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad del espacio. Intenta nuevamente.",
        variant: "destructive",
      });
      
      // Generar bloques sin disponibilidad en caso de error
      generateTimeBlocks(date, null);
    } finally {
      setLoading(false);
    }
  };

  // Generar bloques de tiempo de 6:00 AM a 11:00 PM
  const generateTimeBlocks = (date: Date, availability: DayAvailability | null) => {
    const blocks: TimeBlock[] = [];
    const now = new Date();
    const isToday = isSameDay(date, now);
    const currentHour = getHours(now);

    for (let hour = 6; hour <= 23; hour++) {
      const blockTime = setSeconds(setMinutes(setHours(date, hour), 0), 0);
      const isPast = isToday && hour <= currentHour;
      
      // Buscar si este horario está ocupado en la disponibilidad
      let isOccupied = false;
      let conflictInfo = undefined;
      
      if (availability) {
        // Buscar en todos los slots del día
        const slot = availability.slots.find(slot => slot.hour === hour);
        if (slot && !slot.available) {
          isOccupied = true;
          conflictInfo = slot.conflictWith;
        } else if (!slot) {
          isOccupied = true; // Si no existe el slot, marcarlo como ocupado
        }
      } else {
        // Si no hay datos de disponibilidad, marcar como no disponible por seguridad
        isOccupied = true;
      }

      blocks.push({
        hour,
        timeSlot: format(blockTime, 'HH:mm', { locale: es }),
        isAvailable: !isPast && !isOccupied,
        isPast,
        conflictWith: conflictInfo
      });
    }

    setTimeBlocks(blocks);
  };

  // Actualizar bloques cuando cambie la fecha o el spaceId
  useEffect(() => {
    if (selectedDate && spaceId) {
      loadDayAvailability(selectedDate);
      
      // Limpiar selecciones si la fecha cambia
      if (!isSameDay(selectedDate, startTime || new Date())) {
        onTimeChange(null, null);
        setSelectingStart(true);
      }
    }
  }, [selectedDate, spaceId]);

  // Recargar disponibilidad si cambia la duración seleccionada
  useEffect(() => {
    if (selectedDate && spaceId && startTime && endTime) {
      // Pequeño delay para evitar demasiadas llamadas
      const timeoutId = setTimeout(() => {
        loadDayAvailability(selectedDate);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [startTime, endTime]);

  // Manejar selección de fecha
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // No permitir fechas pasadas
    if (isBefore(date, startOfDay(new Date()))) {
      return;
    }

    onDateChange(date);
    onTimeChange(null, null);
    setSelectingStart(true);
  };

  // Manejar selección de bloque de tiempo
  const handleTimeBlockClick = (hour: number) => {
    if (!selectedDate) return;

    const selectedTime = setSeconds(setMinutes(setHours(selectedDate, hour), 0), 0);
    
    // Verificar si el bloque está disponible
    const block = timeBlocks.find(b => b.hour === hour);
    if (!block?.isAvailable) return;

    if (selectingStart) {
      // Seleccionar hora de inicio
      onTimeChange(selectedTime, null);
      setSelectingStart(false);
    } else {
      // Seleccionar hora de fin
      if (!startTime) return;

      // Verificar que la hora de fin sea después de la de inicio
      if (isBefore(selectedTime, startTime) || selectedTime.getTime() === startTime.getTime()) {
        return;
      }

      // Verificar duración máxima
      const duration = (selectedTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (duration > maxDuration) {
        return;
      }

      // Verificar que no haya bloques ocupados en el rango
      const startHour = getHours(startTime);
      const endHour = getHours(selectedTime);
      
      for (let h = startHour; h < endHour; h++) {
        const blockInRange = timeBlocks.find(b => b.hour === h);
        if (!blockInRange?.isAvailable) {
          return;
        }
      }

      onTimeChange(startTime, selectedTime);
    }
  };

  // Obtener el estado de un bloque de tiempo
  const getBlockState = (hour: number) => {
    const block = timeBlocks.find(b => b.hour === hour);
    if (!block) return 'unavailable';

    if (!block.isAvailable) {
      return block.isPast ? 'past' : 'occupied';
    }

    if (!startTime) {
      return 'available';
    }

    const blockTime = setSeconds(setMinutes(setHours(selectedDate!, hour), 0), 0);
    
    if (startTime.getTime() === blockTime.getTime()) {
      return 'start';
    }

    if (endTime && blockTime.getTime() === endTime.getTime()) {
      return 'end';
    }

    if (startTime && endTime && isAfter(blockTime, startTime) && isBefore(blockTime, endTime)) {
      return 'selected';
    }

    if (selectingStart) {
      return 'available';
    }

    // Si estamos seleccionando fin, mostrar preview del rango válido
    if (!endTime && isAfter(blockTime, startTime)) {
      const duration = (blockTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (duration <= maxDuration) {
        return 'preview';
      } else {
        return 'invalid';
      }
    }

    return 'available';
  };

  // Obtener clase CSS para el bloque
  const getBlockClassName = (state: string) => {
    const baseClass = "w-full h-10 text-sm font-medium border-2 transition-all duration-200";
    
    switch (state) {
      case 'available':
        return `${baseClass} border-gray-200 bg-white hover:border-[#f1893f] hover:bg-orange-50 text-gray-700`;
      case 'start':
        return `${baseClass} border-[#f1893f] bg-[#f1893f] text-white shadow-md`;
      case 'end':
        return `${baseClass} border-[#f1893f] bg-[#f1893f] text-white shadow-md`;
      case 'selected':
        return `${baseClass} border-orange-300 bg-orange-100 text-orange-800`;
      case 'preview':
        return `${baseClass} border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-300`;
      case 'past':
        return `${baseClass} border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed`;
      case 'occupied':
        return `${baseClass} border-red-200 bg-red-50 text-red-500 cursor-not-allowed`;
      case 'invalid':
        return `${baseClass} border-red-300 bg-red-100 text-red-600 cursor-not-allowed`;
      default:
        return `${baseClass} border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed`;
    }
  };

  const calculateSelectedDuration = () => {
    if (!startTime || !endTime) return 0;
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  };

  const resetSelection = () => {
    onTimeChange(null, null);
    setSelectingStart(true);
  };

  return (
    <div className="space-y-6">
      {/* Información del espacio */}
      {spaceInfo && (
        <Card className="bg-gradient-to-r from-[#f1893f]/5 to-orange-100/30 border-[#f1893f]/20">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-800">{spaceInfo.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{spaceInfo.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Hasta {spaceInfo.maxCapacity} personas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${spaceInfo.pricePerHour?.toLocaleString()} COP/hora</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selector de fecha */}
      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Selecciona la fecha del evento
        </Label>
        <Card className="w-full">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => isBefore(date, startOfDay(new Date())) || isAfter(date, addWeeks(new Date(), 12))}
              locale={es}
              className="w-full"
              fromMonth={new Date()}
              toMonth={addWeeks(new Date(), 12)}
            />
          </CardContent>
        </Card>
      </div>

      {selectedDate && (
        <>
          <Separator />
          
          {/* Selector de horario */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Selecciona el horario
                {loading && <Loader2 className="w-4 h-4 animate-spin text-[#f1893f]" />}
              </Label>
              {(startTime || endTime) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSelection}
                  className="text-gray-600"
                  disabled={loading}
                >
                  Limpiar
                </Button>
              )}
            </div>

            {/* Información de selección */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={selectingStart ? "default" : "secondary"} className="bg-[#f1893f]">
                {selectingStart ? "1. Selecciona hora de inicio" : "✓ Inicio seleccionado"}
              </Badge>
              {startTime && (
                <Badge variant={!endTime ? "default" : "secondary"} className="bg-blue-500">
                  {!endTime ? "2. Selecciona hora de fin" : "✓ Fin seleccionado"}
                </Badge>
              )}
            </div>

            {/* Información de disponibilidad del día */}
            {dayAvailability && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fecha seleccionada:</span>
                  <p className="text-gray-600">{dayAvailability.dayName}, {format(selectedDate, 'dd MMMM yyyy', { locale: es })}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Disponibilidad:</span>
                  <p className="text-gray-600">
                    {dayAvailability.availableCount} de {dayAvailability.slots?.length || 0} horarios libres
                  </p>
                </div>
              </div>
            )}

            {/* Horario seleccionado */}
            {startTime && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Fecha de inicio</Label>
                        <Input
                          type="date"
                          value={format(selectedDate, 'yyyy-MM-dd')}
                          readOnly
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Fecha de fin</Label>
                        <Input
                          type="date"
                          value={format(endTime || selectedDate, 'yyyy-MM-dd')}
                          readOnly
                          className="mt-1 bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Hora de inicio</Label>
                        <Input
                          type="time"
                          value={format(startTime, 'HH:mm')}
                          readOnly
                          className="mt-1 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Hora de fin</Label>
                        <Input
                          type="time"
                          value={endTime ? format(endTime, 'HH:mm') : ''}
                          readOnly
                          className="mt-1 bg-white font-mono"
                          placeholder="Selecciona hora de fin"
                        />
                      </div>
                    </div>

                    {endTime && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center text-lg font-semibold text-[#f1893f]">
                          <span>Duración total:</span>
                          <span>{calculateSelectedDuration()} horas</span>
                        </div>
                        {spaceInfo && (
                          <div className="flex justify-between items-center text-base font-medium text-gray-700">
                            <span>Costo estimado:</span>
                            <span>${(calculateSelectedDuration() * spaceInfo.pricePerHour).toLocaleString()} COP</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advertencia de duración máxima */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Duración máxima:</strong> {maxDuration} horas consecutivas.
                <br />
                Horario disponible: 6:00 AM - 11:00 PM
              </div>
            </div>

            {/* Grid de bloques de tiempo */}
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center gap-2 text-[#f1893f]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Cargando disponibilidad...</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeBlocks.map((block) => {
                  const state = getBlockState(block.hour);
                  return (
                    <Button
                      key={block.hour}
                      variant="outline"
                      className={getBlockClassName(state)}
                      onClick={() => handleTimeBlockClick(block.hour)}
                      disabled={loading || !block.isAvailable || state === 'invalid'}
                      title={
                        block.conflictWith 
                          ? `Ocupado - Reserva #${block.conflictWith.id} (${block.conflictWith.status})`
                          : block.isPast
                          ? 'Horario pasado'
                          : block.isAvailable
                          ? 'Disponible para reservar'
                          : 'No disponible'
                      }
                    >
                      {block.timeSlot}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-200 bg-white rounded"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#f1893f] bg-[#f1893f] rounded"></div>
                <span>Seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-red-200 bg-red-50 rounded"></div>
                <span>Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-100 bg-gray-50 rounded"></div>
                <span>Pasado</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}