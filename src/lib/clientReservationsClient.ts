// Client Reservations Client - Obtener reservas del usuario cliente usando Edge Function
import { authClient } from './authClient';

const USER_RESERVATIONS_ENDPOINT = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/my-reserve';

// Tipos de datos para reservas del cliente
export interface ClientReservation {
  id: string;
  userId: string;
  spaceId: string;
  reservationDate: string;
  startDate: string;
  endDate: string;
  estimatedCapacity: number;
  status: 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  duration: {
    hours: number;
    formatted: string;
  };
  space: {
    id: string;
    name: string;
    description?: string;
    location: string;
    pricePerHour: number;
    maxCapacity: number;
    type: string;
    ownerId: string;
    photos: Array<{
      url: string;
      isPrimary: boolean;
    }>;
    primaryPhoto: string | null;
  } | null;
  payment: {
    id: string;
    amount: number;
    method: string;
    date: string;
    status: string;
  } | null;
  services: Array<{
    id: string;
    serviceId: string;
    name: string;
    description: string;
    unitCost: number;
    quantity: number;
    totalCost: number;
  }>;
  cost: {
    base: number;
    services: number;
    total: number;
    formattedBase: string;
    formattedServices: string;
    formattedTotal: string;
  };
  dates: {
    start: {
      iso: string;
      formatted: string;
    };
    end: {
      iso: string;
      formatted: string;
    };
  };
}

export interface ReservationStats {
  total: number;
  byStatus: {
    pending: number;
    pending_payment: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  upcoming: number;
  past: number;
  active: number;
}

export interface GetReservationsResponse {
  success: boolean;
  message: string;
  data: {
    reservations: ClientReservation[];
    statistics?: ReservationStats;
    count: number;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    executionTime: number;
    userId: string;
  };
}

// Función auxiliar para hacer requests autenticados
async function makeAuthenticatedRequest(body: any = {}): Promise<GetReservationsResponse> {
  const token = authClient.getAccessToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  console.log('🔄 Making user reservations request:', {
    endpoint: USER_RESERVATIONS_ENDPOINT,
    action: body.action || 'list',
    includeStats: body.includeStats || false,
    hasAuth: !!token
  });

  const response = await fetch(USER_RESERVATIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const responseData = await response.json();
  
  console.log('📥 User reservations response:', {
    status: response.status,
    success: responseData.success,
    count: responseData.data?.count || 0,
    hasStats: !!responseData.data?.statistics
  });

  if (!response.ok) {
    console.error('❌ User reservations request failed:', {
      status: response.status,
      error: responseData.error || 'Error desconocido',
      requestId: responseData.requestId
    });
    throw new Error(responseData.error || `Error del servidor: ${response.status}`);
  }

  return responseData;
}

// Obtener todas las reservas del cliente
export async function getClientReservations(includeStats: boolean = false): Promise<ClientReservation[]> {
  try {
    console.log('📋 Fetching client reservations from Edge Function...');

    const responseData = await makeAuthenticatedRequest({
      action: 'list',
      includeStats
    });

    if (!responseData.success) {
      throw new Error(responseData.message || 'Error obteniendo reservas');
    }

    const reservations = responseData.data.reservations || [];
    
    console.log('✅ Client reservations retrieved:', {
      count: reservations.length,
      statusBreakdown: {
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        completed: reservations.filter(r => r.status === 'completed').length
      }
    });

    return reservations;

  } catch (error: any) {
    console.error('❌ Error fetching client reservations:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Obtener reservas con estadísticas
export async function getClientReservationsWithStats(): Promise<{
  reservations: ClientReservation[];
  stats: ReservationStats;
}> {
  try {
    console.log('📊 Fetching client reservations with statistics...');

    const responseData = await makeAuthenticatedRequest({
      action: 'list',
      includeStats: true
    });

    if (!responseData.success) {
      throw new Error(responseData.message || 'Error obteniendo reservas');
    }

    return {
      reservations: responseData.data.reservations || [],
      stats: responseData.data.statistics || {
        total: 0,
        byStatus: { pending: 0, pending_payment: 0, confirmed: 0, cancelled: 0, completed: 0 },
        upcoming: 0,
        past: 0,
        active: 0
      }
    };

  } catch (error: any) {
    console.error('❌ Error fetching reservations with stats:', {
      message: error.message
    });
    throw error;
  }
}

// Filtrar reservas por estado
export function filterReservationsByStatus(
  reservations: ClientReservation[], 
  status: 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'all' = 'all'
): ClientReservation[] {
  if (status === 'all') {
    return reservations;
  }
  return reservations.filter(reservation => reservation.status === status);
}

// Obtener estadísticas de reservas
export function getReservationStats(reservations: ClientReservation[]) {
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    pending_payment: reservations.filter(r => r.status === 'pending_payment').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    totalSpent: 0,
    confirmedSpent: 0
  };

  // Calcular gastos
  reservations.forEach(reservation => {
    if (reservation.payment && reservation.payment.amount) {
      stats.totalSpent += reservation.payment.amount;
      if (reservation.status === 'confirmed') {
        stats.confirmedSpent += reservation.payment.amount;
      }
    }
  });

  return stats;
}

// Calcular duración en horas de una reserva
export function calculateReservationDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  return Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
}

// Formatear fecha para mostrar
export function formatReservationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatear cantidad de dinero
export function formatCurrency(amount?: number | null): string {
  if (!amount || isNaN(amount)) {
    return 'Monto no disponible';
  }
  return `$${amount.toLocaleString('es-CO')} COP`;
}

// Obtener el color del badge según el estado
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending_payment':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Obtener el texto del estado en español
export function getStatusText(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmada';
    case 'pending':
      return 'Pendiente';
    case 'pending_payment':
      return 'Aprobada - Pendiente de Pago';
    case 'cancelled':
      return 'Cancelada';
    case 'completed':
      return 'Completada';
    default:
      return status;
  }
}
