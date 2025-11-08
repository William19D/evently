import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getClientReservations, 
  filterReservationsByStatus,
  getReservationStats,
  calculateReservationDuration,
  formatReservationDate,
  formatCurrency,
  getStatusColor,
  getStatusText,
  type ClientReservation 
} from '@/lib/clientReservationsClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CreditCard, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ClientReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'pending_payment' | 'confirmed' | 'completed'>('all');
  const [selectedReservation, setSelectedReservation] = useState<ClientReservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const data = await getClientReservations();
      setReservations(data);
      
      if (data.length === 0) {
        toast.info('No tienes reservas aún', {
          description: 'Explora nuestros espacios y haz tu primera reserva'
        });
      }
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      toast.error('Error al cargar reservas', {
        description: error.message || 'Hubo un problema al cargar tus reservas'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredReservations = () => {
    return filterReservationsByStatus(reservations, activeTab);
  };

  const stats = getReservationStats(reservations);

  const ReservationCard = ({ reservation }: { reservation: ClientReservation }) => {
    const duration = reservation.duration.hours;
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">
                {reservation.space?.name || 'Espacio desconocido'}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {reservation.space?.location || 'Ubicación no disponible'}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(reservation.status)}>
              {getStatusText(reservation.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fecha y hora */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Fecha:</span>
              <span>{new Date(reservation.reservationDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Inicio:</span>
              <span>{reservation.dates.start.formatted}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Fin:</span>
              <span>{reservation.dates.end.formatted}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Duración:</span>
              <span>{reservation.duration.formatted}</span>
            </div>
          </div>

          <Separator />

          {/* Capacidad */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Capacidad estimada:</span>
            <span>{reservation.estimatedCapacity} personas</span>
          </div>

          {/* Costo */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Costo base:</span>
              <span>{reservation.cost.formattedBase}</span>
            </div>
            {reservation.services.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium ml-6">Servicios adicionales:</span>
                <span>{reservation.cost.formattedServices}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium ml-6">Total:</span>
              <span className="text-lg font-semibold text-primary">
                {reservation.cost.formattedTotal}
              </span>
            </div>
          </div>

          {/* Pago */}
          {reservation.payment && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Estado del pago:</span>
                  <Badge variant="outline">{reservation.payment.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Método:</span>
                  <span>{reservation.payment.method}</span>
                </div>
              </div>
            </>
          )}

          {/* Servicios adicionales */}
          {reservation.services.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Servicios adicionales:</p>
                <ul className="text-sm space-y-1">
                  {reservation.services.map((service) => (
                    <li key={service.id} className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {service.name} x{service.quantity}
                      </span>
                      <span>${service.totalCost.toLocaleString('es-CO')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Alerta especial para pending_payment */}
          {reservation.status === 'pending_payment' && (
            <>
              <Separator />
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">¡Reserva Aprobada! - Pago Pendiente</AlertTitle>
                <AlertDescription className="text-orange-800">
                  <p className="mb-2">
                    ¡Buenas noticias! El propietario ha aprobado tu reserva por un valor de{' '}
                    <strong className="text-orange-900">{reservation.cost.formattedTotal}</strong>.
                  </p>
                  <p className="text-sm">
                    Para confirmar definitivamente tu reserva, debes completar el pago. 
                    Revisa tu email para el link de pago seguro.
                  </p>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/spaces/${reservation.spaceId}`)}
            >
              Ver Espacio
            </Button>
            {reservation.status === 'confirmed' && (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  setSelectedReservation(reservation);
                  setShowDetailsModal(true);
                }}
              >
                Detalles
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando tus reservas...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const filteredReservations = getFilteredReservations();

  return (
    <>
      <Navigation />
      
      {/* Modal de Detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalles de la Reserva</DialogTitle>
            <DialogDescription>
              Información completa de tu reserva confirmada
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-6 mt-4">
              {/* Espacio */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Espacio</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold">{selectedReservation.space?.name || 'Espacio desconocido'}</h4>
                        <Badge className={getStatusColor(selectedReservation.status)}>
                          {getStatusText(selectedReservation.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedReservation.space?.location || 'Ubicación no disponible'}</span>
                      </div>
                      {selectedReservation.space?.description && (
                        <p className="text-sm text-muted-foreground">{selectedReservation.space.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fotos del Espacio */}
              {selectedReservation.space?.photos && selectedReservation.space.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Fotos del Espacio
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReservation.space.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={photo.url}
                          alt={`Foto ${index + 1} del espacio`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fecha y Hora */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Fecha y Hora</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">Fecha:</span>
                        </div>
                        <p className="text-lg ml-6">{new Date(selectedReservation.reservationDate).toLocaleDateString('es-CO', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">Duración:</span>
                        </div>
                        <p className="text-lg ml-6">{selectedReservation.duration.formatted}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Inicio:</span>
                        </div>
                        <p className="ml-6">{selectedReservation.dates.start.formatted}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Fin:</span>
                        </div>
                        <p className="ml-6">{selectedReservation.dates.end.formatted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Capacidad */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Capacidad</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{selectedReservation.estimatedCapacity}</p>
                        <p className="text-sm text-muted-foreground">personas estimadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Servicios Adicionales */}
              {selectedReservation.services.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Servicios Adicionales</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {selectedReservation.services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">Cantidad: {service.quantity}</p>
                            </div>
                            <p className="font-semibold text-primary">${service.totalCost.toLocaleString('es-CO')}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Desglose de Costos */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Desglose de Costos</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Costo base del espacio:</span>
                        <span className="font-medium">{selectedReservation.cost.formattedBase}</span>
                      </div>
                      {selectedReservation.services.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Servicios adicionales:</span>
                          <span className="font-medium">{selectedReservation.cost.formattedServices}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-primary text-2xl">
                          {selectedReservation.cost.formattedTotal}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Información de Pago */}
              {selectedReservation.payment && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Información de Pago</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Estado del pago:</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedReservation.payment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Método de pago:</span>
                          <span className="font-medium capitalize">{selectedReservation.payment.method}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Botón para ver el espacio */}
              <Button
                className="w-full"
                onClick={() => {
                  setShowDetailsModal(false);
                  navigate(`/spaces/${selectedReservation.spaceId}`);
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver Página del Espacio
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Mis Reservas</h1>
                <p className="text-muted-foreground">
                  Gestiona y revisa todas tus reservas de espacios
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total de Reservas</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Pendientes
                </CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  Pend. Pago
                </CardDescription>
                <CardTitle className="text-3xl text-orange-600">{stats.pending_payment}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Confirmadas
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.confirmed}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-600" />
                  Completadas
                </CardDescription>
                <CardTitle className="text-3xl text-gray-600">{stats.completed}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs y contenido */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-4xl">
              <TabsTrigger value="all">
                Todas ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendientes ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="pending_payment">
                Pend. Pago ({stats.pending_payment})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmadas ({stats.confirmed})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completadas ({stats.completed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {filteredReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          No hay reservas en esta categoría
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {activeTab === 'all' 
                            ? 'Aún no has realizado ninguna reserva'
                            : `No tienes reservas ${getStatusText(activeTab).toLowerCase()}`
                          }
                        </p>
                        <Button onClick={() => navigate('/spaces')}>
                          Explorar Espacios
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Información adicional */}
          {reservations.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Información sobre tus reservas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Las reservas <strong>pendientes</strong> están esperando aprobación del propietario.</p>
                <p>• Las reservas <strong>confirmadas</strong> han sido aprobadas y están listas.</p>
                <p>• Las reservas <strong>rechazadas</strong> no fueron aprobadas por el propietario.</p>
                <p>• Puedes ver los detalles de cada reserva haciendo clic en las tarjetas.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClientReservations;
