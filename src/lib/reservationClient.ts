// Client para manejar reservas de espacios
import { authClient } from './authClient';

// URL directa de la edge function desplegada
const RESERVATIONS_ENDPOINT = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/reservation';

export interface CreateReservationRequest {
  spaceId: number;
  startDate: string;
  endDate: string;
  estimatedCapacity: number;
}

export interface ReservationResponse {
  id: number;
  spaceId: number;
  spaceName: string;
  startDate: string;
  endDate: string;
  estimatedCapacity: number;
  status: string;
  createdAt: string;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  status: string;
  method: string;
}

export interface CostInfo {
  durationHours: number;
  pricePerHour: number;
  totalCost: number;
  formattedCost: string;
}

export interface CreateReservationResponse {
  success: boolean;
  reservation: ReservationResponse;
  payment: PaymentResponse;
  cost: CostInfo;
  space: {
    id: number;
    name: string;
    maxCapacity: number;
  };
  notifications: {
    ownerNotified: boolean;
    userNotified: boolean;
    ownerEmail: string | null;
    userEmail: string;
  };
}

export interface UserReservation {
  id: number;
  space: {
    id: number;
    name: string;
    location: string;
    pricePerHour: number;
  };
  reservationDate: string;
  startDate: string;
  endDate: string;
  estimatedCapacity: number;
  status: string;
  payment: {
    id: number;
    amount: number;
    status: string;
    method: string;
    date: string;
  } | null;
}

export interface GetReservationsResponse {
  success: boolean;
  data: UserReservation[];
  count: number;
}

class ReservationClient {
  private async makeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    try {
      const token = authClient.getAccessToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🔄 Making reservation request:', {
        endpoint,
        method: options.method,
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + '...'
      });

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          ...options.headers,
        },
      });

      const data = await response.json();

      console.log('📡 Edge function response:', {
        status: response.status,
        ok: response.ok,
        success: data.success,
        hasData: !!data.data,
        dataStructure: data.data ? Object.keys(data.data) : 'no data',
        fullResponse: data
      });

      if (!response.ok) {
        console.error('❌ Edge function error:', {
          status: response.status,
          error: data.error,
          message: data.message,
          requestId: data.requestId
        });
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Reservation request failed:', {
        error: error.message,
        endpoint,
        method: options.method
      });
      throw error;
    }
  }

  /**
   * Crear una nueva reserva
   */
  async createReservation(reservationData: CreateReservationRequest): Promise<CreateReservationResponse> {
    console.log('🔄 Creating reservation:', {
      spaceId: reservationData.spaceId,
      startDate: reservationData.startDate,
      endDate: reservationData.endDate,
      estimatedCapacity: reservationData.estimatedCapacity
    });

    const response = await this.makeRequest<any>(RESERVATIONS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...reservationData
      })
    });

    console.log('✅ Raw edge function response:', response);

    // Verificar la estructura de la respuesta de la edge function
    if (!response.success || !response.data) {
      throw new Error('Respuesta inválida de la edge function');
    }

    const result = response.data;

    console.log('✅ Reservation created successfully:', {
      reservationId: result.reservation?.id,
      totalCost: result.cost?.formattedCost,
      status: result.reservation?.status
    });

    return result as CreateReservationResponse;
  }

  /**
   * Obtener todas las reservas del usuario
   */
  async getUserReservations(): Promise<UserReservation[]> {
    console.log('🔄 Fetching user reservations');

    const response = await this.makeRequest<GetReservationsResponse>(RESERVATIONS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        action: 'get'
      })
    });

    console.log('✅ User reservations retrieved:', {
      count: response.count
    });

    return response.data;
  }

  /**
   * Validar datos de reserva antes de enviar
   */
  validateReservationData(data: CreateReservationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar spaceId
    if (!data.spaceId || data.spaceId <= 0) {
      errors.push('ID del espacio es requerido');
    }

    // Validar fechas
    if (!data.startDate) {
      errors.push('Fecha de inicio es requerida');
    }

    if (!data.endDate) {
      errors.push('Fecha de fin es requerida');
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const now = new Date();

      if (start <= now) {
        errors.push('La fecha de inicio debe ser futura');
      }

      if (end <= start) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      // Validar que no sea más de 1 año en el futuro
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (start > oneYearFromNow) {
        errors.push('No se pueden hacer reservas con más de un año de anticipación');
      }
    }

    // Validar capacidad
    if (!data.estimatedCapacity || data.estimatedCapacity <= 0) {
      errors.push('La capacidad estimada debe ser mayor a 0');
    }

    if (data.estimatedCapacity > 10000) {
      errors.push('La capacidad estimada parece demasiado alta');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcular duración en horas entre dos fechas
   */
  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Formatear fecha para mostrar al usuario
   */
  formatDateForDisplay(dateString: string): string {
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

  /**
   * Obtener fecha y hora actual para formularios
   */
  getCurrentDateTime(): string {
    const now = new Date();
    // Agregar una hora para que sea una fecha futura válida
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:MM
  }

  /**
   * Validar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return authClient.isAuthenticated();
  }
}

// Instancia singleton
export const reservationClient = new ReservationClient();

// Export por defecto
export default reservationClient;