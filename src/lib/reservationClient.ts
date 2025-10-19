// Client para manejar reservas de espacios - Mejorado para eventos
import { authClient } from './authClient';

// URL directa de la edge function desplegada
const RESERVATIONS_ENDPOINT = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/reservation';

// Configuraciones para validaciones de eventos
export const EVENT_CONSTRAINTS = {
  MIN_DURATION_HOURS: 1,
  MAX_DURATION_HOURS: 12,
  MIN_ADVANCE_BOOKING_HOURS: 2, // Mínimo 2 horas de anticipación
  MAX_ADVANCE_BOOKING_DAYS: 90, // Máximo 90 días de anticipación
  OPERATING_HOURS: {
    START: 6, // 6:00 AM
    END: 23,  // 11:00 PM
    NIGHT_END: 4 // 4:00 AM (día siguiente para eventos nocturnos)
  },
  NIGHT_EVENT_MIN_START_HOUR: 18, // Los eventos nocturnos deben empezar después de las 6:00 PM
  BLOCK_SIZE_MINUTES: 60 // Bloques de 1 hora
} as const;

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
   * Validar datos de reserva antes de enviar - Mejorado para eventos
   */
  validateReservationData(data: CreateReservationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar spaceId
    if (!data.spaceId || data.spaceId <= 0) {
      errors.push('ID del espacio es requerido');
    }

    // Validar fechas
    if (!data.startDate) {
      errors.push('Fecha y hora de inicio son requeridas');
    }

    if (!data.endDate) {
      errors.push('Fecha y hora de fin son requeridas');
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const now = new Date();

      // Validar que la fecha de inicio sea futura (con margen de anticipación)
      const minimumStartTime = new Date(now.getTime() + (EVENT_CONSTRAINTS.MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000));
      if (start <= minimumStartTime) {
        errors.push(`La reserva debe hacerse con al menos ${EVENT_CONSTRAINTS.MIN_ADVANCE_BOOKING_HOURS} horas de anticipación`);
      }

      // Validar que no sea más allá del límite de anticipación
      const maxAdvanceTime = new Date(now.getTime() + (EVENT_CONSTRAINTS.MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000));
      if (start > maxAdvanceTime) {
        errors.push(`No se pueden hacer reservas con más de ${EVENT_CONSTRAINTS.MAX_ADVANCE_BOOKING_DAYS} días de anticipación`);
      }

      // Detectar si es un evento nocturno (cruza medianoche)
      const isNightEvent = end < start || (end.getDate() !== start.getDate());
      
      let durationHours: number;
      
      if (isNightEvent) {
        // Calcular duración para eventos nocturnos
        const endOfStartDay = new Date(start);
        endOfStartDay.setHours(24, 0, 0, 0);
        const startOfEndDay = new Date(end);
        startOfEndDay.setHours(0, 0, 0, 0);
        
        durationHours = (endOfStartDay.getTime() - start.getTime() + end.getTime() - startOfEndDay.getTime()) / (1000 * 60 * 60);
        
        // Validaciones específicas para eventos nocturnos
        const startHour = start.getHours();
        const endHour = end.getHours();
        
        if (startHour < EVENT_CONSTRAINTS.NIGHT_EVENT_MIN_START_HOUR) {
          errors.push(`Los eventos nocturnos deben iniciar después de las ${EVENT_CONSTRAINTS.NIGHT_EVENT_MIN_START_HOUR}:00`);
        }
        
        if (endHour > EVENT_CONSTRAINTS.OPERATING_HOURS.NIGHT_END) {
          errors.push(`Los eventos nocturnos no pueden extenderse más allá de las ${EVENT_CONSTRAINTS.OPERATING_HOURS.NIGHT_END}:00 AM`);
        }
        
        // Verificar que el evento termine el día siguiente
        const nextDay = new Date(start);
        nextDay.setDate(nextDay.getDate() + 1);
        if (end.toDateString() !== nextDay.toDateString()) {
          errors.push('Los eventos nocturnos solo pueden extenderse hasta el día siguiente');
        }
        
      } else {
        // Validación normal para eventos en el mismo día
        if (end <= start) {
          errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        
        durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        // Validar horarios de operación normales
        const startHour = start.getHours();
        const endHour = end.getHours();
        
        if (startHour < EVENT_CONSTRAINTS.OPERATING_HOURS.START) {
          errors.push(`Los eventos regulares pueden iniciar a partir de las ${EVENT_CONSTRAINTS.OPERATING_HOURS.START}:00`);
        }
        
        if (endHour > EVENT_CONSTRAINTS.OPERATING_HOURS.END) {
          errors.push(`Los eventos regulares deben terminar antes de las ${EVENT_CONSTRAINTS.OPERATING_HOURS.END}:00 (usa evento nocturno para extender hasta 4:00 AM)`);
        }
      }
      
      // Validaciones comunes de duración
      if (durationHours < EVENT_CONSTRAINTS.MIN_DURATION_HOURS) {
        errors.push(`La duración mínima del evento es ${EVENT_CONSTRAINTS.MIN_DURATION_HOURS} hora(s)`);
      }

      if (durationHours > EVENT_CONSTRAINTS.MAX_DURATION_HOURS) {
        errors.push(`La duración máxima del evento es ${EVENT_CONSTRAINTS.MAX_DURATION_HOURS} horas`);
      }

      // Validar que las horas sean en bloques exactos (cada hora en punto)
      if (start.getMinutes() !== 0 || start.getSeconds() !== 0) {
        errors.push('Las reservas deben comenzar en horas exactas (ej: 14:00, 15:00)');
      }

      if (end.getMinutes() !== 0 || end.getSeconds() !== 0) {
        errors.push('Las reservas deben terminar en horas exactas (ej: 17:00, 18:00)');
      }
    }

    // Validar capacidad
    if (!data.estimatedCapacity || data.estimatedCapacity <= 0) {
      errors.push('El número de invitados debe ser mayor a 0');
    }

    if (data.estimatedCapacity > 1000) {
      errors.push('El número máximo de invitados es 1000');
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
   * Generar bloques de tiempo disponibles para un día específico
   */
  generateTimeBlocks(date: Date): Array<{ hour: number; timeSlot: string; isAvailable: boolean }> {
    const blocks = [];
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    for (let hour = EVENT_CONSTRAINTS.OPERATING_HOURS.START; hour <= EVENT_CONSTRAINTS.OPERATING_HOURS.END; hour++) {
      const isPast = isToday && hour <= currentHour;
      
      blocks.push({
        hour,
        timeSlot: `${hour.toString().padStart(2, '0')}:00`,
        isAvailable: !isPast
      });
    }

    return blocks;
  }

  /**
   * Validar si un rango de tiempo está dentro de los horarios permitidos
   */
  isValidTimeRange(startDate: Date, endDate: Date): boolean {
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    
    return (
      startHour >= EVENT_CONSTRAINTS.OPERATING_HOURS.START &&
      endHour <= EVENT_CONSTRAINTS.OPERATING_HOURS.END &&
      startDate.getMinutes() === 0 &&
      endDate.getMinutes() === 0
    );
  }

  /**
   * Obtener la duración máxima permitida para un tipo de evento
   */
  getMaxDurationForEventType(eventType: string): number {
    const eventDurations = {
      'conference': 8,
      'wedding': 12,
      'birthday': 8,
      'corporate': 10,
      'workshop': 6,
      'presentation': 4,
      'party': 10,
      'graduation': 6,
      'exhibition': 12,
      'other': 12
    };

    return eventDurations[eventType as keyof typeof eventDurations] || EVENT_CONSTRAINTS.MAX_DURATION_HOURS;
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