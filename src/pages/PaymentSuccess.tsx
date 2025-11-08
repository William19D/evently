import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Home,
  Loader2,
  XCircle,
  Mail,
  CreditCard
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface ReservationDetails {
  id: string;
  spaceName: string;
  spaceLocation: string;
  reservationDate: string;
  startDate: string;
  endDate: string;
  estimatedCapacity: number;
  status: string;
  paymentAmount: number;
  paymentStatus: string;
}

const PaymentSuccess = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservationId) {
      loadReservationDetails();
    }
  }, [reservationId]);

  const loadReservationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Convertir reservationId a número
      const reservationIdNum = parseInt(reservationId || '0', 10);
      if (isNaN(reservationIdNum)) {
        setError('ID de reserva inválido.');
        return;
      }

      // Obtener detalles de la reserva con información del espacio y pago
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          id_reservation,
          reservation_date,
          start_date,
          end_date,
          estimated_capacity,
          status,
          spaces (
            space_name,
            location
          ),
          payments (
            amount,
            payment_status
          )
        `)
        .eq('id_reservation', reservationIdNum)
        .single();

      if (fetchError) {
        console.error('Error fetching reservation:', fetchError);
        setError('No se pudo cargar la información de tu reserva.');
        return;
      }

      if (!data) {
        setError('Reserva no encontrada.');
        return;
      }

      // Payments es un array, tomar el primero
      const payment = Array.isArray(data.payments) && data.payments.length > 0 
        ? data.payments[0] 
        : null;

      setReservation({
        id: data.id_reservation.toString(),
        spaceName: data.spaces?.space_name || 'Espacio desconocido',
        spaceLocation: data.spaces?.location || 'Ubicación no disponible',
        reservationDate: data.reservation_date,
        startDate: data.start_date,
        endDate: data.end_date,
        estimatedCapacity: data.estimated_capacity,
        status: data.status,
        paymentAmount: payment?.amount || 0,
        paymentStatus: payment?.payment_status || 'unknown'
      });

    } catch (err) {
      console.error('Error loading reservation:', err);
      setError('Ocurrió un error al cargar la información.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Verificando tu pago...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !reservation) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-12 h-12 text-red-600" />
                  <div>
                    <CardTitle className="text-2xl text-red-600">Error</CardTitle>
                    <CardDescription>No se pudo cargar la información</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Oops!</AlertTitle>
                  <AlertDescription>
                    {error || 'Ocurrió un error inesperado.'}
                  </AlertDescription>
                </Alert>
                <div className="flex gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Ir al Inicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const duration = calculateDuration(reservation.startDate, reservation.endDate);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Tarjeta principal de éxito */}
          <Card className="border-green-200 shadow-xl mb-6">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">¡Pago Exitoso!</CardTitle>
                  <CardDescription className="text-green-50 text-lg">
                    Tu reserva ha sido confirmada
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <Alert className="bg-green-50 border-green-200 mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-900 text-lg">¡Excelente noticia!</AlertTitle>
                <AlertDescription className="text-green-800">
                  Tu pago ha sido procesado exitosamente. Hemos enviado un email de confirmación 
                  con todos los detalles de tu reserva.
                </AlertDescription>
              </Alert>

              {/* Información de confirmación */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Mail className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Email Enviado</p>
                        <p className="text-sm text-blue-700">Revisa tu bandeja de entrada</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="font-semibold text-purple-900">Pago Confirmado</p>
                        <p className="text-sm text-purple-700">
                          ${reservation.paymentAmount.toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalles de la reserva */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Detalles de tu Reserva
                  </h3>
                  
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      {/* ID de Reserva */}
                      <div className="flex items-center justify-between pb-3 border-b">
                        <span className="text-muted-foreground font-medium">ID de Reserva:</span>
                        <span className="font-mono font-semibold text-primary">
                          #{reservation.id}
                        </span>
                      </div>

                      {/* Espacio */}
                      <div>
                        <div className="flex items-start gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-primary mt-1" />
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-gray-900">
                              {reservation.spaceName}
                            </p>
                            <p className="text-muted-foreground">
                              {reservation.spaceLocation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fecha y hora */}
                      <div className="space-y-3 pt-3 border-t">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha</p>
                            <p className="font-medium">
                              {new Date(reservation.reservationDate).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Horario</p>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                              <div>
                                <p className="text-xs text-muted-foreground">Inicio</p>
                                <p className="font-medium">{formatDate(reservation.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Fin</p>
                                <p className="font-medium">{formatDate(reservation.endDate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-muted-foreground">Duración:</span>
                          <span className="font-semibold">{duration} horas</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Capacidad estimada:</span>
                          <span className="font-semibold">{reservation.estimatedCapacity} personas</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Próximos pasos */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    📝 Próximos Pasos
                  </h3>
                  
                  <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="pt-6">
                      <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                            1
                          </span>
                          <p className="text-gray-700">
                            <strong>Revisa tu email</strong> - Te hemos enviado una confirmación con todos los detalles
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                            2
                          </span>
                          <p className="text-gray-700">
                            <strong>Contacta al propietario</strong> si tienes alguna pregunta adicional
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                            3
                          </span>
                          <p className="text-gray-700">
                            <strong>Prepara tu evento</strong> - ¡Ya está todo listo para tu celebración!
                          </p>
                        </li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    onClick={() => navigate('/my-reservations')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Ver Mis Reservas
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="flex-1"
                    size="lg"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Volver al Inicio
                  </Button>
                </div>

                {/* Información adicional */}
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>¿Necesitas ayuda?</AlertTitle>
                  <AlertDescription>
                    Si tienes alguna pregunta o problema, no dudes en contactarnos en{' '}
                    <a href="mailto:soporte@evently.blog" className="font-semibold text-primary hover:underline">
                      soporte@evently.blog
                    </a>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccess;
