import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  X, 
  MapPin, 
  Users, 
  Calendar, 
  CreditCard, 
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getOwnerReservations,
  acceptReservation,
  rejectReservation,
  filterReservationsByStatus,
  getReservationStats,
  formatReservationDate,
  formatCurrency,
  calculateReservationDuration,
  type OwnerReservation
} from '@/lib/ownerReservationsClient';
import { RejectReservationModal } from './RejectReservationModal';

interface OwnerReservationManagerProps {
  className?: string;
}

export function OwnerReservationManager({ className }: OwnerReservationManagerProps) {
  const [reservations, setReservations] = useState<OwnerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<OwnerReservation | null>(null);

  // Cargar reservas al montar el componente
  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading owner reservations...');
      
      const data = await getOwnerReservations();
      setReservations(data);
      
      console.log('✅ Reservations loaded:', {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length
      });

      toast.success(`${data.length} reservas cargadas correctamente`);
    } catch (error: any) {
      console.error('❌ Error loading reservations:', error);
      toast.error(`Error cargando reservas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReservation = async (reservationId: string) => {
    try {
      setActionLoading(reservationId);
      console.log('✅ Accepting reservation:', { reservationId });

      const result = await acceptReservation(reservationId);
      
      // Actualizar la reserva en el estado local
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'confirmed' as const }
            : reservation
        )
      );

      toast.success(
        `Reserva aceptada correctamente para ${result.reservation.spaceName}`,
        {
          description: result.notification.sent 
            ? 'Se ha enviado la notificación al cliente por email' 
            : 'Reserva aceptada pero no se pudo enviar el email'
        }
      );

      console.log('🎉 Reservation accepted successfully:', {
        reservationId,
        spaceName: result.reservation.spaceName,
        notificationSent: result.notification.sent
      });

    } catch (error: any) {
      console.error('❌ Error accepting reservation:', error);
      toast.error(`Error aceptando reserva: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (reservation: OwnerReservation) => {
    setSelectedReservation(reservation);
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedReservation(null);
  };

  const handleRejectReservation = async (rejectionReason?: string) => {
    if (!selectedReservation) return;

    try {
      setActionLoading(selectedReservation.id);
      console.log('❌ Rejecting reservation:', { 
        reservationId: selectedReservation.id, 
        rejectionReason 
      });

      const result = await rejectReservation(selectedReservation.id, rejectionReason);
      
      // Actualizar la reserva en el estado local
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === selectedReservation.id 
            ? { ...reservation, status: 'cancelled' as const }
            : reservation
        )
      );

      toast.success(
        `Reserva rechazada correctamente para ${result.reservation.spaceName}`,
        {
          description: result.notification.sent 
            ? 'Se ha enviado la notificación al cliente por email' 
            : 'Reserva rechazada pero no se pudo enviar el email'
        }
      );

      console.log('❌ Reservation rejected successfully:', {
        reservationId: selectedReservation.id,
        spaceName: result.reservation.spaceName,
        rejectionReason: result.reservation.rejectionReason,
        notificationSent: result.notification.sent,
        paymentCancelled: result.payment?.cancelled
      });

      // Cerrar modal
      handleCloseRejectModal();

    } catch (error: any) {
      console.error('❌ Error rejecting reservation:', error);
      toast.error(`Error rechazando reserva: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmada</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (payment?: OwnerReservation['payment']) => {
    if (!payment) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">Sin pago</Badge>;
    }
    
    switch (payment.status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pago pendiente</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Pago falló</Badge>;
      default:
        return <Badge variant="outline">{payment.status}</Badge>;
    }
  };

  const ReservationCard = ({ reservation }: { reservation: OwnerReservation }) => {
    const duration = calculateReservationDuration(reservation.startDate, reservation.endDate);
    const isAccepting = actionLoading === reservation.id;
    const isRejecting = actionLoading === reservation.id && rejectModalOpen;

    return (
      <Card key={reservation.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{reservation.space.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {reservation.space.location || 'Ubicación no especificada'}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(reservation.status)}
              {getPaymentStatusBadge(reservation.payment)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Información de fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-[#f1893f]" />
                <span className="font-medium">Inicio:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {formatReservationDate(reservation.startDate)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-[#f1893f]" />
                <span className="font-medium">Fin:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {formatReservationDate(reservation.endDate)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Información de capacidad y pago */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-[#f1893f]" />
              <span className="text-sm">
                <span className="font-medium">{reservation.estimatedCapacity}</span> / {reservation.space.maxCapacity} personas
              </span>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#f1893f]" />
              <span className="text-sm">
                <span className="font-medium">{duration}h</span> de duración
              </span>
            </div>
            
            {reservation.payment && reservation.payment.amount && (
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-[#f1893f]" />
                <span className="text-sm font-medium">
                  {formatCurrency(reservation.payment.amount)}
                </span>
              </div>
            )}
          </div>

          {/* ID de reserva */}
          <div className="text-xs text-muted-foreground">
            ID: {reservation.id}
          </div>

          {/* Acciones */}
          {reservation.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleAcceptReservation(reservation.id)}
                disabled={isAccepting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isAccepting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Aceptando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aceptar Reserva
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleOpenRejectModal(reservation)}
                disabled={actionLoading === reservation.id}
              >
                {isRejecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const StatsCards = () => {
    const stats = getReservationStats(reservations);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#f1893f]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
                <p className="text-xl font-bold text-[#f1893f]">
                  {formatCurrency(stats.confirmedRevenue)}
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-[#f1893f]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[#f1893f] mr-3" />
          <span className="text-lg">Cargando reservas...</span>
        </div>
      </div>
    );
  }

  const pendingReservations = filterReservationsByStatus(reservations, 'pending');
  const confirmedReservations = filterReservationsByStatus(reservations, 'confirmed');
  const cancelledReservations = filterReservationsByStatus(reservations, 'cancelled');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con botón de recarga */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadReservations}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <StatsCards />

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No hay reservas</h3>
                <p className="text-muted-foreground">
                  Aún no tienes reservas en tus espacios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendientes ({pendingReservations.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirmadas ({confirmedReservations.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Rechazadas ({cancelledReservations.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Todas ({reservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <ScrollArea className="h-[600px]">
              {pendingReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      No hay reservas pendientes
                    </div>
                  </CardContent>
                </Card>
              ) : (
                pendingReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <ScrollArea className="h-[600px]">
              {confirmedReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      No hay reservas confirmadas
                    </div>
                  </CardContent>
                </Card>
              ) : (
                confirmedReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <ScrollArea className="h-[600px]">
              {cancelledReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      No hay reservas rechazadas
                    </div>
                  </CardContent>
                </Card>
              ) : (
                cancelledReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <ScrollArea className="h-[600px]">
              {reservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de rechazo */}
      <RejectReservationModal
        isOpen={rejectModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleRejectReservation}
        reservation={selectedReservation}
        isLoading={actionLoading === selectedReservation?.id}
      />
    </div>
  );
}