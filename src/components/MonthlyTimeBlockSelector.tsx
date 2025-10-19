import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CalendarDays, 
  AlertTriangle, 
  Loader2, 
  MapPin, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format, addMonths, subMonths, addDays, isSameDay, isAfter, isBefore, startOfDay, getHours, setHours, setMinutes, setSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { SpaceAvailabilityClient, MonthlyAvailabilityResponse, DayAvailability, TimeSlot } from '@/lib/spaceAvailabilityClient';
import { useToast } from '@/hooks/use-toast';

interface MonthlyTimeBlockSelectorProps {
  spaceId: number;
  selectedDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (startTime: Date | null, endTime: Date | null) => void;
  maxDuration: number;
  onSpaceInfoLoaded?: (spaceInfo: any) => void;
}

export function MonthlyTimeBlockSelector({
  spaceId,
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onTimeChange,
  maxDuration = 12,
  onSpaceInfoLoaded
}: MonthlyTimeBlockSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState<MonthlyAvailabilityResponse | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const { toast } = useToast();

  // Cargar datos del mes actual
  const loadMonthlyData = async (date: Date, duration: number = 2) => {
    if (!spaceId) return;

    setLoading(true);
    try {
      const data = await SpaceAvailabilityClient.getMonthlyAvailability(
        spaceId,
        date.getFullYear(),
        date.getMonth() + 1,
        duration
      );

      setMonthlyData(data);

      // Si es la primera vez que cargamos, guardar info del espacio
      if (onSpaceInfoLoaded) {
        onSpaceInfoLoaded(data.space);
      }

    } catch (error) {
      console.error('❌ Error loading monthly data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad del mes. Intenta nuevamente.",
        variant: "destructive",
      });
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambie el mes o spaceId
  useEffect(() => {
    if (spaceId) {
      loadMonthlyData(currentMonth);
    }
  }, [spaceId, currentMonth]);

  // Efecto para actualizar datos del día seleccionado
  useEffect(() => {
    if (monthlyData && selectedDate) {
      const day = selectedDate.getDate();
      const selectedDateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // 🔧 DEBUGGING: Buscar por número de día Y por fecha string
      const dayDataByNumber = monthlyData.availability.days.find(d => d.day === day);
      const dayDataByDate = monthlyData.availability.days.find(d => d.date === selectedDateString);
      
      console.log('🔧 DEBUGGING - Selección de día:', {
        selectedDateFull: selectedDate.toString(),
        selectedDateISO: selectedDate.toISOString(),
        selectedDateString,
        selectedDayNumber: day,
        availableDays: monthlyData.availability.days.map(d => ({ day: d.day, date: d.date })),
        foundByNumber: dayDataByNumber ? `Día ${dayDataByNumber.day} (${dayDataByNumber.date})` : 'No encontrado',
        foundByDate: dayDataByDate ? `Día ${dayDataByDate.day} (${dayDataByDate.date})` : 'No encontrado',
        note: 'Verificando si el problema está en el matching de fechas'
      });
      
      // Usar búsqueda por fecha string como prioritaria
      const dayData = dayDataByDate || dayDataByNumber;
      setSelectedDayData(dayData || null);
    }
  }, [monthlyData, selectedDate]);

  // Recargar con nueva duración cuando cambie la selección
  useEffect(() => {
    if (spaceId && startTime && endTime) {
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          loadMonthlyData(currentMonth, Math.round(duration));
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [startTime, endTime]);

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Manejar selección de día
  const handleDayClick = (day: DayAvailability) => {
    const dayDate = new Date(day.date);
    
    console.log('🔧 DEBUGGING - Día clickeado:', {
      clickedDay: day,
      dayDateString: day.date,
      parsedDayDate: dayDate.toString(),
      parsedDayDateISO: dayDate.toISOString(),
      dayNumber: dayDate.getDate(),
      note: 'Verificando si el click genera la fecha correcta'
    });
    
    // No permitir fechas pasadas
    if (isBefore(dayDate, startOfDay(new Date()))) {
      return;
    }

    onDateChange(dayDate);
    onTimeChange(null, null);
    setSelectingStart(true);
  };

  // Manejar selección de bloque de tiempo
  const handleTimeBlockClick = (slot: TimeSlot) => {
    if (!selectedDate || !slot.available) return;

    // 🔧 SOLUCIÓN: Crear fecha local manteniendo la hora exacta del slot
    // En lugar de parsear slot.startDateTime que puede causar conversiones
    // Crear la fecha basada en el día seleccionado y la hora del slot
    const selectedTime = new Date(selectedDate);
    selectedTime.setHours(slot.hour, 0, 0, 0);
    
    console.log('🔧 Time block clicked - DEBUGGING TIMEZONE ISSUE:', {
      slotHour: slot.hour,
      slotStartDateTime: slot.startDateTime,
      selectedDate: selectedDate.toISOString(),
      parsedDateTime: selectedTime.toISOString(),
      parsedLocalTime: selectedTime.toLocaleString('es-CO'),
      parsedGetHours: selectedTime.getHours(),
      parsedGetUTCHours: selectedTime.getUTCHours(),
      timezoneDifference: selectedTime.getHours() - selectedTime.getUTCHours(),
      note: 'VERIFICANDO: Conversión de hora local a UTC puede estar causando 3pm -> 3am'
    });
    
    if (selectingStart) {
      onTimeChange(selectedTime, null);
      setSelectingStart(false);
    } else {
      if (!startTime) return;

      // Manejar horarios que cruzan medianoche (eventos nocturnos)
      let duration: number;
      let isOvernightEvent = false;
      
      if (isBefore(selectedTime, startTime)) {
        // El evento cruza medianoche (ej: 23:00 - 04:00)
        isOvernightEvent = true;
        const endOfStartDay = new Date(startTime);
        endOfStartDay.setHours(24, 0, 0, 0);
        const startOfEndDay = new Date(selectedTime);
        startOfEndDay.setHours(0, 0, 0, 0);
        
        duration = (endOfStartDay.getTime() - startTime.getTime() + selectedTime.getTime() - startOfEndDay.getTime()) / (1000 * 60 * 60);
        
        // Verificar que la hora de fin no sea después de las 4:00 AM
        const endHour = getHours(selectedTime);
        if (endHour > 4 && endHour < 6) {
          toast({
            title: "Horario no permitido",
            description: "Los eventos nocturnos solo pueden extenderse hasta las 4:00 AM del día siguiente.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Evento en el mismo día
        if (selectedTime.getTime() === startTime.getTime()) {
          return; // No se puede seleccionar la misma hora
        }
        duration = (selectedTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      }

      // Verificar duración máxima
      if (duration > maxDuration) {
        toast({
          title: "Duración excesiva",
          description: `La duración máxima permitida es ${maxDuration} horas.`,
          variant: "destructive",
        });
        return;
      }

      // Para eventos nocturnos, necesitamos verificar disponibilidad en ambos días
      if (isOvernightEvent) {
        // Verificar disponibilidad desde startTime hasta medianoche
        const startHour = getHours(startTime);
        for (let h = startHour; h < 24; h++) {
          const blockInRange = selectedDayData?.slots.find(s => s.hour === h);
          if (!blockInRange?.available) {
            toast({
              title: "Conflicto de horario nocturno",
              description: `El horario ${h}:00 no está disponible para el evento.`,
              variant: "destructive",
            });
            return;
          }
        }
        
        // Verificar disponibilidad del día siguiente usando datos reales
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayKey = nextDay.toISOString().split('T')[0];
        const nextDayData = monthlyData?.availability.days.find(d => d.date === nextDayKey);
        
        if (nextDayData) {
          const endHour = getHours(selectedTime);
          // Verificar slots desde medianoche hasta la hora de fin
          for (let h = 0; h <= endHour; h++) {
            // Para hora 0 (medianoche), buscar slot 24 en el día anterior
            const searchHour = h === 0 ? 24 : h;
            const nextDaySlot = nextDayData.slots.find(s => s.hour === searchHour);
            if (nextDaySlot && !nextDaySlot.available) {
              toast({
                title: "Conflicto en día siguiente",
                description: `El horario ${h.toString().padStart(2, '0')}:00 del día siguiente no está disponible.`,
                variant: "destructive",
              });
              return;
            }
          }
        } else {
          // Si no hay datos del día siguiente, mostrar advertencia pero permitir continuar
          console.warn('⚠️ No hay datos del día siguiente, se asume disponibilidad');
          toast({
            title: "Verificación limitada",
            description: "No se pudieron verificar todos los horarios del día siguiente. El evento se guardará pero podría requerir validación adicional.",
            variant: "default",
          });
        }
        
      } else {
        // Verificar que no haya bloques ocupados en el rango (mismo día)
        if (selectedDayData) {
          const startHour = getHours(startTime);
          const endHour = getHours(selectedTime);
          
          for (let h = startHour; h < endHour; h++) {
            const blockInRange = selectedDayData.slots.find(s => s.hour === h);
            if (!blockInRange?.available) {
              toast({
                title: "Conflicto de horario",
                description: `El horario ${h}:00 no está disponible en el rango seleccionado.`,
                variant: "destructive",
              });
              return;
            }
          }
        }
      }

      onTimeChange(startTime, selectedTime);
    }
  };

  // Obtener estado visual del día
  const getDayState = (day: DayAvailability) => {
    const dayDate = new Date(day.date);
    const isPast = isBefore(dayDate, startOfDay(new Date()));
    const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
    
    if (isPast) return 'past';
    if (isSelected) return 'selected';
    if (day.availableCount === 0) return 'unavailable';
    if (day.availableCount < day.slots.length / 3) return 'limited';
    return 'available';
  };

  // Obtener clase CSS para el día
  const getDayClassName = (state: string) => {
    const baseClass = "w-full h-16 text-sm border-2 transition-all duration-200 flex flex-col items-center justify-center";
    
    switch (state) {
      case 'available':
        return `${baseClass} border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100 text-green-800 cursor-pointer`;
      case 'limited':
        return `${baseClass} border-yellow-200 bg-yellow-50 hover:border-yellow-400 hover:bg-yellow-100 text-yellow-800 cursor-pointer`;
      case 'unavailable':
        return `${baseClass} border-red-200 bg-red-50 text-red-500 cursor-not-allowed`;
      case 'selected':
        return `${baseClass} border-[#f1893f] bg-[#f1893f] text-white shadow-md`;
      case 'past':
        return `${baseClass} border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed`;
      default:
        return `${baseClass} border-gray-200 bg-gray-100 text-gray-500`;
    }
  };

  // Obtener estado visual del bloque de tiempo
  const getTimeBlockState = (slot: TimeSlot) => {
    if (!slot.available) return 'occupied';
    
    if (!startTime) return 'available';
    
    const slotTime = new Date(slot.startDateTime);
    
    if (startTime.getTime() === slotTime.getTime()) return 'start';
    if (endTime && endTime.getTime() === slotTime.getTime()) return 'end';
    
    // Manejar eventos nocturnos (que cruzan medianoche)
    if (startTime && endTime) {
      if (endTime < startTime) {
        // Evento nocturno: verificar si el slot está en el rango
        if (isAfter(slotTime, startTime) || (slotTime <= endTime && getHours(slotTime) <= 4)) {
          return 'selected';
        }
      } else {
        // Evento normal en el mismo día
        if (isAfter(slotTime, startTime) && isBefore(slotTime, endTime)) {
          return 'selected';
        }
      }
    }
    
    // Preview para selección de fin
    if (!endTime && startTime) {
      const startHour = getHours(startTime);
      const slotHour = getHours(slotTime);
      
      // Si es tarde (después de 18:00) y el slot es de madrugada, mostrar preview nocturno
      if (startHour >= 18 && slotHour <= 4) {
        const duration = calculateNightDuration(startTime, slotTime);
        if (duration <= maxDuration) return 'preview';
        return 'invalid';
      }
      
      // Preview normal para eventos en el mismo día
      if (isAfter(slotTime, startTime)) {
        const duration = (slotTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        if (duration <= maxDuration) return 'preview';
        return 'invalid';
      }
    }
    
    return 'available';
  };

  // Función auxiliar para calcular duración nocturna
  const calculateNightDuration = (start: Date, end: Date): number => {
    const endOfStartDay = new Date(start);
    endOfStartDay.setHours(24, 0, 0, 0);
    const startOfEndDay = new Date(end);
    startOfEndDay.setHours(0, 0, 0, 0);
    
    return (endOfStartDay.getTime() - start.getTime() + end.getTime() - startOfEndDay.getTime()) / (1000 * 60 * 60);
  };

  // Obtener clase CSS para bloques de tiempo
  const getTimeBlockClassName = (state: string) => {
    const baseClass = "w-full h-12 text-sm font-medium border-2 transition-all duration-200";
    
    switch (state) {
      case 'available':
        return `${baseClass} border-gray-200 bg-white hover:border-[#f1893f] hover:bg-orange-50 text-gray-700 cursor-pointer`;
      case 'start':
      case 'end':
        return `${baseClass} border-[#f1893f] bg-[#f1893f] text-white shadow-md`;
      case 'selected':
        return `${baseClass} border-orange-300 bg-orange-100 text-orange-800`;
      case 'preview':
        return `${baseClass} border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-300 cursor-pointer`;
      case 'occupied':
        return `${baseClass} border-red-200 bg-red-50 text-red-500 cursor-not-allowed`;
      case 'invalid':
        return `${baseClass} border-red-300 bg-red-100 text-red-600 cursor-not-allowed`;
      default:
        return `${baseClass} border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed`;
    }
  };

  const resetSelection = () => {
    onTimeChange(null, null);
    setSelectingStart(true);
  };

  const calculateDuration = (): number => {
    if (!startTime || !endTime) return 0;
    
    // Si endTime es menor que startTime, es un evento nocturno que cruza medianoche
    if (endTime < startTime) {
      const endOfStartDay = new Date(startTime);
      endOfStartDay.setHours(24, 0, 0, 0);
      const startOfEndDay = new Date(endTime);
      startOfEndDay.setHours(0, 0, 0, 0);
      
      return (endOfStartDay.getTime() - startTime.getTime() + endTime.getTime() - startOfEndDay.getTime()) / (1000 * 60 * 60);
    }
    
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  };

  const calculateCost = (): number => {
    if (!monthlyData || !startTime || !endTime) return 0;
    return calculateDuration() * (monthlyData.space.pricePerHour || 0);
  };

  return (
    <div className="space-y-6">
      {/* Información del espacio */}
      {monthlyData && (
        <Card className="bg-gradient-to-r from-[#f1893f]/5 to-orange-100/30 border-[#f1893f]/20">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-800">{monthlyData.space.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{monthlyData.space.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Hasta {monthlyData.space.maxCapacity} personas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${monthlyData.space.pricePerHour?.toLocaleString()} COP/hora</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegador de mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#f1893f]" />
              <span>Selecciona fecha y horario</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[#f1893f]" />}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                disabled={loading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Resumen del mes */}
          {monthlyData && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Mes:</span>
                  <p className="text-gray-600">{monthlyData.availability.monthName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Disponibilidad:</span>
                  <p className="text-gray-600">{monthlyData.availability.summary.availabilityRate}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Slots libres:</span>
                  <p className="text-gray-600">{monthlyData.availability.summary.availableSlots}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total slots:</span>
                  <p className="text-gray-600">{monthlyData.availability.summary.totalSlots}</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendario mensual */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-2 text-[#f1893f]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Cargando disponibilidad...</span>
                </div>
              </div>
            )}

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {monthlyData?.availability.days.map((day) => {
                const state = getDayState(day);
                return (
                  <Button
                    key={day.day}
                    variant="outline"
                    className={getDayClassName(state)}
                    onClick={() => handleDayClick(day)}
                    disabled={loading || state === 'past' || state === 'unavailable'}
                    title={`${day.dayName} ${day.day} - ${day.availableCount}/${day.slots.length} horarios disponibles`}
                  >
                    <span className="font-bold">{day.day}</span>
                    <span className="text-xs">
                      {day.availableCount > 0 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Leyenda del calendario */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-green-200 bg-green-50 rounded"></div>
              <span>Muy disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-yellow-200 bg-yellow-50 rounded"></div>
              <span>Disponibilidad limitada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-red-200 bg-red-50 rounded"></div>
              <span>No disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[#f1893f] bg-[#f1893f] rounded"></div>
              <span>Seleccionado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selector de horario para el día seleccionado */}
      {selectedDate && selectedDayData && (
        <>
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#f1893f]" />
                  <span>Horarios disponibles</span>
                </div>
                {(startTime || endTime) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSelection}
                  >
                    Limpiar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Información del día */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Fecha seleccionada:</span>
                    <p className="text-gray-600">
                      {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Disponibilidad:</span>
                    <p className="text-gray-600">
                      {selectedDayData.availableCount} de {selectedDayData.slots.length} horarios libres
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de selección */}
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

              {/* Horario seleccionado */}
              {startTime && (
                <Card className="bg-orange-50 border-orange-200 mb-4">
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
                          <Label className="text-sm font-medium text-gray-600">
                            Fecha de fin
                            {endTime && endTime < startTime && (
                              <span className="text-amber-600 text-xs ml-1">(día siguiente)</span>
                            )}
                          </Label>
                          <Input
                            type="date"
                            value={endTime && endTime < startTime 
                              ? format(addDays(selectedDate, 1), 'yyyy-MM-dd')
                              : format(endTime || selectedDate, 'yyyy-MM-dd')
                            }
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
                          
                          {/* Indicador de evento nocturno */}
                          {endTime < startTime && (
                            <div className="flex items-center gap-2 p-2 bg-amber-100 border border-amber-300 rounded-lg">
                              <span className="text-lg">🌙</span>
                              <div className="text-sm">
                                <p className="font-medium text-amber-800">Evento nocturno</p>
                                <p className="text-amber-700">
                                  El evento se extiende hasta el día siguiente
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-lg font-semibold text-[#f1893f]">
                            <span>Duración total:</span>
                            <span>{calculateDuration()} horas</span>
                          </div>
                          {monthlyData && (
                            <div className="flex justify-between items-center text-base font-medium text-gray-700">
                              <span>Costo estimado:</span>
                              <span>${calculateCost().toLocaleString()} COP</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advertencia de duración */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <strong>Horarios disponibles:</strong>
                  <br />
                  • <strong>Horario regular:</strong> 6:00 AM - 11:00 PM
                  <br />
                  • <strong>Eventos nocturnos:</strong> Pueden extenderse hasta las 4:00 AM del día siguiente
                  <br />
                  • <strong>Duración máxima:</strong> {maxDuration} horas consecutivas
                </div>
              </div>

            {/* Grid de bloques de tiempo - Horario normal */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Horario normal (6:00 AM - 11:00 PM)
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedDayData.slots.filter(slot => slot.hour >= 6 && slot.hour <= 23).map((slot) => {
                    const state = getTimeBlockState(slot);
                    return (
                      <Button
                        key={slot.hour}
                        variant="outline"
                        className={getTimeBlockClassName(state)}
                        onClick={() => handleTimeBlockClick(slot)}
                        disabled={!slot.available || state === 'invalid'}
                        title={
                          slot.conflictWith 
                            ? `Ocupado - Reserva #${slot.conflictWith.id} (${slot.conflictWith.status})`
                            : slot.available
                            ? 'Disponible para reservar'
                            : 'No disponible'
                        }
                      >
                        {slot.time}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Horarios nocturnos - Solo para eventos que cruzan medianoche */}
              {startTime && getHours(startTime) >= 18 && (
                <div>
                  <Label className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-2">
                    🌙 Extensión nocturna (12:00 AM - 4:00 AM del día siguiente)
                  </Label>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                    <p className="text-xs text-amber-800">
                      <strong>Evento nocturno:</strong> Tu evento puede extenderse hasta las 4:00 AM del día siguiente.
                      Selecciona la hora de finalización en la madrugada.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Generar slots para horas nocturnas (0-4) */}
                    {[0, 1, 2, 3, 4].map((hour) => {
                      // Verificar disponibilidad del día siguiente
                      const nextDay = new Date(selectedDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      const nextDayKey = nextDay.toISOString().split('T')[0];
                      
                      // Buscar el día siguiente en los datos mensuales
                      const nextDayData = monthlyData?.availability.days.find(d => d.date === nextDayKey);
                      
                      // Verificar si la hora está disponible en el día siguiente
                      let nightSlotAvailable = true;
                      let conflictInfo = null;
                      
                      if (nextDayData) {
                        // Convertir hora 0-4 a formato 24 horas para búsqueda
                        const searchHour = hour === 0 ? 24 : hour; // 0 AM = 24:00 del día anterior
                        const nextDaySlot = nextDayData.slots.find(s => s.hour === searchHour);
                        
                        if (nextDaySlot && !nextDaySlot.available) {
                          nightSlotAvailable = false;
                          conflictInfo = nextDaySlot.conflictWith;
                        }
                      }
                      
                      const nightEndTime = new Date(selectedDate);
                      nightEndTime.setDate(nightEndTime.getDate() + 1);
                      nightEndTime.setHours(hour, 0, 0, 0);
                      
                      // Crear slot nocturno con información real de disponibilidad
                      const nightSlot: TimeSlot = {
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        hour,
                        available: nightSlotAvailable,
                        startDateTime: nightEndTime.toISOString(),
                        endDateTime: nightEndTime.toISOString(),
                        duration: 1,
                        conflictWith: conflictInfo
                      };
                      
                      const state = getTimeBlockState(nightSlot);
                      const isSelected = endTime && getHours(endTime) === hour && endTime.getDate() === nextDay.getDate();
                      
                      return (
                        <Button
                          key={`night-${hour}`}
                          variant="outline"
                          className={`${getTimeBlockClassName(isSelected ? 'end' : state)} border-amber-300`}
                          onClick={() => {
                            if (nightSlotAvailable) {
                              handleTimeBlockClick(nightSlot);
                            }
                          }}
                          disabled={!nightSlotAvailable || state === 'invalid'}
                          title={
                            !nightSlotAvailable && conflictInfo
                              ? `Ocupado - Reserva #${conflictInfo.id} (${conflictInfo.status})`
                              : nightSlotAvailable
                              ? `Finalizar evento a las ${nightSlot.time} del día siguiente`
                              : 'No disponible en el día siguiente'
                          }
                        >
                          {nightSlot.time}
                          <span className="text-xs block">+1 día</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Información adicional sobre disponibilidad del día siguiente */}
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <strong>ℹ️ Verificación cruzada:</strong> Se valida la disponibilidad en ambos días (actual y siguiente) 
                    para garantizar que no haya conflictos en eventos nocturnos.
                  </div>
                </div>
              )}
            </div>              {/* Leyenda de horarios */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-4">
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
                  <div className="w-3 h-3 border-2 border-orange-200 bg-orange-50 rounded"></div>
                  <span>Vista previa</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}