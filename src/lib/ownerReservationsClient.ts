// Owner Reservations Client - Comunicación con edge function accept-reserve
import { authClient } from './authClient';

const OWNER_RESERVATIONS_ENDPOINT = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/accept-reserve';
const REJECT_RESERVATIONS_ENDPOINT = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/reject-reserve';

// Tipos de datos para reservas del owner
export interface OwnerReservation {
  id: string;
  userId: string;
  space: {
    id: string;
    name: string;
    location: string;
    pricePerHour: number;
    maxCapacity: number;
  };
  reservationDate: string;
  startDate: string;
  endDate: string;
  estimatedCapacity: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment?: {
    id: string;
    amount?: number | null;
    status: string;
    method: string;
    date: string;
  } | null;
}

export interface AcceptReservationResult {
  success: boolean;
  reservation: {
    id: string;
    spaceId: string;
    spaceName: string;
    status: string;
    startDate: string;
    endDate: string;
    estimatedCapacity: number;
    userId: string;
  };
  space: {
    id: string;
    name: string;
    location: string;
    maxCapacity: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
  };
  notification: {
    sent: boolean;
    emailId?: string;
    error?: string;
  };
}

export interface RejectReservationResult {
  success: boolean;
  reservation: {
    id: string;
    spaceId: string;
    spaceName: string;
    status: string;
    startDate: string;
    endDate: string;
    estimatedCapacity: number;
    userId: string;
    rejectionReason?: string | null;
  };
  space: {
    id: string;
    name: string;
    location: string;
    maxCapacity: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
    cancelled: boolean;
  } | null;
  notification: {
    sent: boolean;
    emailId?: string;
    error?: string;
  };
}

// Función auxiliar para hacer requests autenticados
async function makeAuthenticatedRequest(body: any, endpoint: string = OWNER_RESERVATIONS_ENDPOINT): Promise<any> {
  const token = authClient.getAccessToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  console.log('🔄 Making owner reservations request:', {
    endpoint,
    action: body.action,
    hasAuth: !!token
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const responseData = await response.json();
  
  console.log('📥 Owner reservations response:', {
    status: response.status,
    success: responseData.success,
    action: body.action,
    hasData: !!responseData.data
  });

  if (!response.ok) {
    console.error('❌ Owner reservations request failed:', {
      status: response.status,
      error: responseData.error || 'Error desconocido',
      requestId: responseData.requestId
    });
    throw new Error(responseData.error || `Error del servidor: ${response.status}`);
  }

  return responseData;
}

// Obtener todas las reservas del owner
export async function getOwnerReservations(): Promise<OwnerReservation[]> {
  try {
    console.log('📋 Fetching owner reservations...');

    const responseData = await makeAuthenticatedRequest({
      action: 'list'
    });

    if (!responseData.success) {
      throw new Error(responseData.error || 'Error obteniendo reservas');
    }

    const reservations = responseData.data || [];
    
    console.log('✅ Owner reservations retrieved:', {
      count: reservations.length,
      statusBreakdown: {
        pending: reservations.filter((r: OwnerReservation) => r.status === 'pending').length,
        confirmed: reservations.filter((r: OwnerReservation) => r.status === 'confirmed').length,
        cancelled: reservations.filter((r: OwnerReservation) => r.status === 'cancelled').length
      }
    });

    return reservations;

  } catch (error: any) {
    console.error('❌ Error fetching owner reservations:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Aceptar una reserva específica
export async function acceptReservation(reservationId: string): Promise<AcceptReservationResult> {
  try {
    console.log('✅ Accepting reservation:', { reservationId });

    const responseData = await makeAuthenticatedRequest({
      action: 'accept',
      reservationId: reservationId
    });

    if (!responseData.success) {
      throw new Error(responseData.error || 'Error aceptando la reserva');
    }

    const result = responseData.data;
    
    console.log('🎉 Reservation accepted successfully:', {
      reservationId: result.reservation?.id,
      spaceName: result.reservation?.spaceName,
      userEmail: result.user?.email,
      notificationSent: result.notification?.sent,
      emailId: result.notification?.emailId
    });

    return result;

  } catch (error: any) {
    console.error('❌ Error accepting reservation:', {
      reservationId,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Rechazar una reserva específica
export async function rejectReservation(reservationId: string, rejectionReason?: string): Promise<RejectReservationResult> {
  try {
    console.log('❌ Rejecting reservation:', { 
      reservationId, 
      hasReason: !!rejectionReason 
    });

    const responseData = await makeAuthenticatedRequest({
      action: 'reject',
      reservationId: reservationId,
      rejectionReason: rejectionReason || undefined
    }, REJECT_RESERVATIONS_ENDPOINT);

    if (!responseData.success) {
      throw new Error(responseData.error || 'Error rechazando la reserva');
    }

    const result = responseData.data;
    
    console.log('❌ Reservation rejected successfully:', {
      reservationId: result.reservation?.id,
      spaceName: result.reservation?.spaceName,
      userEmail: result.user?.email,
      rejectionReason: result.reservation?.rejectionReason,
      notificationSent: result.notification?.sent,
      paymentCancelled: result.payment?.cancelled,
      emailId: result.notification?.emailId
    });

    return result;

  } catch (error: any) {
    console.error('❌ Error rejecting reservation:', {
      reservationId,
      rejectionReason,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Filtrar reservas por estado
export function filterReservationsByStatus(
  reservations: OwnerReservation[], 
  status: 'pending' | 'confirmed' | 'cancelled' | 'all' = 'all'
): OwnerReservation[] {
  if (status === 'all') {
    return reservations;
  }
  return reservations.filter(reservation => reservation.status === status);
}

// Obtener estadísticas de reservas
export function getReservationStats(reservations: OwnerReservation[]) {
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalRevenue: 0,
    confirmedRevenue: 0
  };

  // Calcular ingresos
  reservations.forEach(reservation => {
    if (reservation.payment && reservation.payment.amount) {
      stats.totalRevenue += reservation.payment.amount;
      if (reservation.status === 'confirmed') {
        stats.confirmedRevenue += reservation.payment.amount;
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
  return Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100; // Redondear a 2 decimales
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