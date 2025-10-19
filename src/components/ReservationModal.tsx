import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Users, Clock, DollarSign, Loader2, AlertCircle, CheckCircle, Calendar, MapPin, Sparkles } from 'lucide-react';
import { reservationClient, type CreateReservationRequest, type CreateReservationResponse } from '@/lib/reservationClient';
import { MonthlyTimeBlockSelector } from './MonthlyTimeBlockSelector';
import { toast } from 'sonner';
import { type PublicSpace } from '@/lib/publicSpacesClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: PublicSpace;
}

// Tipos de eventos disponibles
const EVENT_TYPES = [
  { value: 'conference', label: '📊 Conferencia / Reunión', duration: [1, 8] },
  { value: 'wedding', label: '💒 Boda', duration: [4, 12] },
  { value: 'birthday', label: '🎂 Cumpleaños', duration: [2, 8] },
  { value: 'corporate', label: '🏢 Evento Corporativo', duration: [2, 10] },
  { value: 'workshop', label: '🎓 Taller / Workshop', duration: [2, 6] },
  { value: 'presentation', label: '🎤 Presentación', duration: [1, 4] },
  { value: 'party', label: '🎉 Fiesta / Celebración', duration: [3, 10] },
  { value: 'graduation', label: '🎓 Graduación', duration: [2, 6] },
  { value: 'exhibition', label: '🖼️ Exposición', duration: [4, 12] },
  { value: 'other', label: '✨ Otro evento', duration: [1, 12] }
];

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, space }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [estimatedCapacity, setEstimatedCapacity] = useState(1);
  const [eventType, setEventType] = useState<string>('');
  const [eventDescription, setEventDescription] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [reservationResult, setReservationResult] = useState<CreateReservationResponse | null>(null);
  
  // Obtener el tipo de evento seleccionado
  const selectedEventType = EVENT_TYPES.find(type => type.value === eventType);
  const maxDuration = selectedEventType ? selectedEventType.duration[1] : 12;

  // Resetear formulario cuando se abre/cierra el modal
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setStartTime(null);
      setEndTime(null);
      setEstimatedCapacity(1);
      setEventType('');
      setEventDescription('');
      setSpecialRequests('');
      setValidationErrors([]);
      setReservationResult(null);
    }
  }, [isOpen, space.id]);

  // Manejar cambios en el selector de tiempo
  const handleTimeChange = (start: Date | null, end: Date | null) => {
    setStartTime(start);
    setEndTime(end);
    
    // Limpiar errores cuando el usuario haga cambios
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const calculateEstimatedCost = (): number | null => {
    if (!startTime || !endTime) return null;
    
    try {
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (duration <= 0) return null;
      
      return Math.round(duration * space.price_per_hour);
    } catch {
      return null;
    }
  };

  const calculateDuration = (): number => {
    if (!startTime || !endTime) return 0;
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  };

  const estimatedCost = calculateEstimatedCost();
  const duration = calculateDuration();

  // Validaciones personalizadas para eventos
  const validateReservation = (): string[] => {
    const errors: string[] = [];

    if (!selectedDate) {
      errors.push('Selecciona una fecha para tu evento');
    }

    if (!startTime) {
      errors.push('Selecciona la hora de inicio');
    }

    if (!endTime) {
      errors.push('Selecciona la hora de fin');
    }

    if (estimatedCapacity < 1) {
      errors.push('Debe haber al menos 1 invitado');
    }

    if (estimatedCapacity > space.capacity) {
      errors.push(`La capacidad no puede exceder ${space.capacity} personas`);
    }

    if (!eventType) {
      errors.push('Selecciona el tipo de evento');
    }

    if (!eventDescription.trim()) {
      errors.push('Describe brevemente tu evento');
    }

    if (duration > 0) {
      if (duration < 1) {
        errors.push('La duración mínima es de 1 hora');
      }

      if (duration > maxDuration) {
        errors.push(`La duración máxima para este tipo de evento es ${maxDuration} horas`);
      }

      // Validación específica por tipo de evento
      if (selectedEventType) {
        const [minDuration, maxEventDuration] = selectedEventType.duration;
        if (duration < minDuration) {
          errors.push(`Para ${selectedEventType.label}, la duración mínima recomendada es ${minDuration} horas`);
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validateReservation();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!startTime || !endTime) {
      setValidationErrors(['Por favor completa todos los campos requeridos']);
      return;
    }

    setIsLoading(true);
    setValidationErrors([]);

    try {
      // Preparar datos para envío
      const reservationData: CreateReservationRequest = {
        spaceId: space.id,
        startDate: startTime.toISOString(),
        endDate: endTime.toISOString(),
        estimatedCapacity
      };

      console.log('📝 Submitting reservation data:', {
        ...reservationData,
        eventType,
        eventDescription,
        specialRequests,
        duration: duration + ' hours'
      });

      const result = await reservationClient.createReservation(reservationData);
      
      console.log('✅ Reservation result received:', result);
      setReservationResult(result);
      
      toast.success('¡Reserva creada exitosamente!', {
        description: `Tu reserva para ${space.name} está pendiente de confirmación.`
      });

    } catch (error: any) {
      console.error('❌ Error creating reservation:', {
        error: error.message,
        stack: error.stack,
        reservationData: {
          spaceId: space.id,
          startDate: startTime?.toISOString(),
          endDate: endTime?.toISOString(),
          estimatedCapacity
        }
      });
      
      const errorMessage = error.message || 'Error desconocido al crear la reserva';
      setValidationErrors([errorMessage]);
      
      toast.error('Error al crear la reserva', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return reservationClient.formatDateForDisplay(dateString);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#f1893f]">
            <CalendarCheck className="w-5 h-5" />
            Reservar Espacio
          </DialogTitle>
          <DialogDescription>
            Completa los detalles de tu reserva para <strong>{space.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {reservationResult ? (
          // Vista de confirmación de reserva exitosa
          <div className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>¡Reserva creada exitosamente!</strong><br />
                Tu reserva #{reservationResult.reservation.id} está pendiente de confirmación del propietario.
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-[#f1893f]/20">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">📋 Detalles de tu Reserva</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">🏢 Espacio:</span>
                  <span className="font-medium">{reservationResult.space.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">📅 Inicio:</span>
                  <span className="font-medium">{formatDateForDisplay(reservationResult.reservation.startDate)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">📅 Fin:</span>
                  <span className="font-medium">{formatDateForDisplay(reservationResult.reservation.endDate)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">⏱️ Duración:</span>
                  <span className="font-medium">{reservationResult.cost.durationHours} horas</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">👥 Capacidad:</span>
                  <span className="font-medium">{reservationResult.reservation.estimatedCapacity} personas</span>
                </div>
                
                <div className="border-t border-[#f1893f]/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">💰 Total:</span>
                    <span className="text-xl font-bold text-[#f1893f]">{reservationResult.cost.formattedCost}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📋 Próximos Pasos:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. El propietario revisará tu solicitud</li>
                <li>2. Recibirás una notificación de confirmación por email</li>
                <li>3. Procederás con el pago</li>
                <li>4. ¡Disfruta tu evento!</li>
              </ol>
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={handleClose} className="bg-[#f1893f] hover:bg-[#e17a36]">
                Entendido
              </Button>
            </div>
          </div>
        ) : (
          // Formulario de reserva mejorado
          <form onSubmit={handleSubmit} className="space-y-6">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Información del espacio */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-[#f1893f]/20">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#f1893f] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{space.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{space.location}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Hasta {space.capacity} personas
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${space.price_formatted}/hora
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tipo de evento */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                ¿Qué tipo de evento organizarás? *
              </Label>
              <Select value={eventType} onValueChange={setEventType} disabled={isLoading}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona el tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col items-start">
                        <span>{type.label}</span>
                        <span className="text-xs text-gray-500">
                          Duración recomendada: {type.duration[0]}-{type.duration[1]} horas
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEventType && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                  💡 Para {selectedEventType.label}: duración recomendada entre {selectedEventType.duration[0]} y {selectedEventType.duration[1]} horas
                </div>
              )}
            </div>

            {/* Selector de fecha y horario */}
            <MonthlyTimeBlockSelector
              spaceId={space.id}
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              onDateChange={setSelectedDate}
              onTimeChange={handleTimeChange}
              maxDuration={maxDuration}
            />

            {/* Número de invitados */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCapacity" className="text-base font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Número de invitados *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="estimatedCapacity"
                  type="number"
                  value={estimatedCapacity}
                  onChange={(e) => setEstimatedCapacity(parseInt(e.target.value) || 0)}
                  min={1}
                  max={space.capacity}
                  placeholder={`Máximo ${space.capacity} personas`}
                  className="pl-10 h-12"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-gray-500">
                Capacidad máxima del espacio: {space.capacity} personas
              </p>
            </div>

            {/* Descripción del evento */}
            <div className="space-y-2">
              <Label htmlFor="eventDescription" className="text-base font-semibold">
                Describe tu evento *
              </Label>
              <Textarea
                id="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Ej: Celebración de cumpleaños para 30 personas con catering incluido..."
                className="min-h-[80px]"
                required
                disabled={isLoading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {eventDescription.length}/500 caracteres
              </p>
            </div>

            {/* Solicitudes especiales */}
            <div className="space-y-2">
              <Label htmlFor="specialRequests">
                Solicitudes especiales (opcional)
              </Label>
              <Textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej: Necesito acceso temprano para decoración, requiero micrófono adicional..."
                className="min-h-[60px]"
                disabled={isLoading}
                maxLength={300}
              />
              <p className="text-xs text-gray-500">
                {specialRequests.length}/300 caracteres
              </p>
            </div>

            {/* Resumen de costos */}
            {duration > 0 && estimatedCost && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-[#f1893f]/20">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#f1893f]" />
                  Resumen de tu Reserva
                </h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">📅 Fecha:</span>
                      <span className="font-medium">
                        {selectedDate && format(selectedDate, 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">⏰ Horario:</span>
                      <span className="font-medium">
                        {startTime && endTime && `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">⏱️ Duración:</span>
                      <span className="font-medium">{duration.toFixed(1)} horas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">👥 Invitados:</span>
                      <span className="font-medium">{estimatedCapacity} personas</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#f1893f]/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Precio por hora:</span>
                      <span>${space.price_formatted}/hora</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-semibold text-gray-900">Total Estimado:</span>
                      <span className="text-xl font-bold text-[#f1893f]">
                        ${estimatedCost.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
                className="px-6"
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit"
                className="bg-[#f1893f] hover:bg-[#e17a36] px-6"
                disabled={
                  isLoading || 
                  !selectedDate || 
                  !startTime || 
                  !endTime || 
                  !eventType || 
                  !eventDescription.trim() ||
                  estimatedCapacity <= 0
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando Reserva...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Crear Reserva
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;