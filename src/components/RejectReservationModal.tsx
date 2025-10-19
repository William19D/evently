import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { type OwnerReservation } from '@/lib/ownerReservationsClient';

interface RejectReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rejectionReason?: string) => Promise<void>;
  reservation: OwnerReservation | null;
  isLoading?: boolean;
}

export function RejectReservationModal({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isLoading = false
}: RejectReservationModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = async () => {
    try {
      await onConfirm(rejectionReason.trim() || undefined);
      // Reset form
      setRejectionReason('');
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in modal confirm:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setRejectionReason('');
      onClose();
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Rechazar Reserva
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información de la reserva */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Reserva a rechazar:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Espacio:</span> {reservation.space.name}</p>
              <p><span className="font-medium">Fecha:</span> {new Date(reservation.startDate).toLocaleDateString('es-CO')}</p>
              <p><span className="font-medium">Capacidad:</span> {reservation.estimatedCapacity} personas</p>
              <p><span className="font-medium">ID:</span> #{reservation.id}</p>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 mb-1">
                  Esta acción no se puede deshacer
                </p>
                <ul className="text-red-700 space-y-1">
                  <li>• La reserva será marcada como cancelada</li>
                  <li>• El pago será marcado como fallido</li>
                  <li>• Se enviará una notificación al cliente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Campo para motivo de rechazo */}
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">
              Motivo del rechazo (opcional)
            </Label>
            <Textarea
              id="rejectionReason"
              placeholder="Explica por qué no puedes aceptar esta reserva..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {rejectionReason.length}/500 caracteres
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Rechazando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Rechazar Reserva
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}