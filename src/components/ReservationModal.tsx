import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarCheck, Users, Clock, DollarSign, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { reservationClient, type CreateReservationRequest, type CreateReservationResponse } from '@/lib/reservationClient';
import { toast } from 'sonner';
import { type PublicSpace } from '@/lib/publicSpacesClient';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: PublicSpace;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, space }) => {
  const [formData, setFormData] = useState<CreateReservationRequest>({
    spaceId: space.id,
    startDate: '',
    endDate: '',
    estimatedCapacity: 1
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [reservationResult, setReservationResult] = useState<CreateReservationResponse | null>(null);

  // Resetear formulario cuando se abre/cierra el modal
  React.useEffect(() => {
    if (isOpen) {
      const currentDateTime = reservationClient.getCurrentDateTime();
      setFormData({
        spaceId: space.id,
        startDate: currentDateTime,
        endDate: '',
        estimatedCapacity: 1
      });
      setValidationErrors([]);
      setReservationResult(null);
    }
  }, [isOpen, space.id]);

  const handleInputChange = (field: keyof CreateReservationRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const calculateEstimatedCost = (): number | null => {
    if (!formData.startDate || !formData.endDate) return null;
    
    try {
      const duration = reservationClient.calculateDuration(formData.startDate, formData.endDate);
      if (duration <= 0) return null;
      
      return Math.round(duration * space.price_per_hour);
    } catch {
      return null;
    }
  };

  const estimatedCost = calculateEstimatedCost();
  const duration = formData.startDate && formData.endDate 
    ? reservationClient.calculateDuration(formData.startDate, formData.endDate) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const validation = reservationClient.validateReservationData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Validar capacidad contra el máximo del espacio
    if (formData.estimatedCapacity > space.capacity) {
      setValidationErrors([`La capacidad no puede exceder ${space.capacity} personas`]);
      return;
    }

    setIsLoading(true);
    setValidationErrors([]);

    try {
      console.log('📝 Submitting reservation data:', formData);
      const result = await reservationClient.createReservation(formData);
      
      console.log('✅ Reservation result received:', result);
      setReservationResult(result);
      
      toast.success('¡Reserva creada exitosamente!', {
        description: `Tu reserva para ${space.name} está pendiente de confirmación.`
      });

    } catch (error: any) {
      console.error('❌ Error creating reservation:', {
        error: error.message,
        stack: error.stack,
        formData
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
          // Formulario de reserva
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha y Hora de Inicio *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={reservationClient.getCurrentDateTime()}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha y Hora de Fin *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || reservationClient.getCurrentDateTime()}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCapacity">Número de Invitados *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="estimatedCapacity"
                  type="number"
                  value={formData.estimatedCapacity}
                  onChange={(e) => handleInputChange('estimatedCapacity', parseInt(e.target.value) || 0)}
                  min={1}
                  max={space.capacity}
                  placeholder={`Máximo ${space.capacity} personas`}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-gray-500">
                Capacidad máxima del espacio: {space.capacity} personas
              </p>
            </div>

            {duration > 0 && estimatedCost && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-[#f1893f]/20">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Resumen de Costos
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duración:
                    </span>
                    <span>{duration.toFixed(1)} horas</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio por hora:</span>
                    <span>${space.price_formatted}/hora</span>
                  </div>
                  
                  <div className="border-t border-[#f1893f]/20 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Estimado:</span>
                      <span className="text-lg font-bold text-[#f1893f]">
                        ${estimatedCost.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit"
                className="bg-[#f1893f] hover:bg-[#e17a36]"
                disabled={isLoading || !formData.startDate || !formData.endDate || formData.estimatedCapacity <= 0}
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