// Cliente para la API de disponibilidad de espacios
import { format } from 'date-fns';

export interface TimeSlot {
  time: string;
  hour: number;
  available: boolean;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  conflictWith?: {
    id: number;
    start: string;
    end: string;
    status: string;
  };
}

export interface DayAvailability {
  day: number;
  date: string;
  dayOfWeek: number;
  dayName: string;
  isWeekend: boolean;
  slots: TimeSlot[];
  availableCount: number;
  occupiedCount: number;
  reservations?: Array<{
    id: number;
    start: string;
    end: string;
    endWithCleanup: string;
    status: string;
    capacity: number;
  }>;
}

export interface MonthlyAvailability {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  startDate: string;
  endDate: string;
  days: DayAvailability[];
  summary: {
    totalDays: number;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    availabilityRate: number;
    daysWithReservations: number;
    interpretation: string;
  };
}

// Nueva estructura optimizada de la edge function
export interface OptimizedAvailabilityResponse {
  space: {
    id: number;
    name: string;
    location: string;
    maxCapacity: number;
    pricePerHour: number;
  };
  searchParams: {
    year: number;
    month: number;
    duration: number;
    cleanupTimeHours: number;
  };
  monthInfo: {
    year: number;
    month: number;
    monthName: string;
    daysInMonth: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalDays: number;
    daysWithReservations: number;
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    availabilityRate: number;
    interpretation: string;
  };
  occupiedDays: DayAvailability[]; // Solo días con reservas
  confirmedReservations: Array<{
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    capacity: number;
  }>;
}

export interface MonthlyAvailabilityResponse {
  space: {
    id: number;
    name: string;
    location: string;
    maxCapacity: number;
    pricePerHour: number;
  };
  searchParams: {
    year: number;
    month: number;
    duration: number;
  };
  availability: MonthlyAvailability;
  reservations: Array<{
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    capacity: number;
  }>;
}

export interface NextAvailableSlot {
  date: string;
  dayName: string;
  time: string;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  formattedTime: string;
}

export interface NextSlotsResponse {
  space: {
    id: number;
    name: string;
    location: string;
  };
  searchParams: {
    fromDate: string;
    duration: number;
    requestedCount: number;
  };
  nextAvailableSlots: NextAvailableSlot[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    executionTime: number;
    timezone: string;
    generatedFor?: string;
    optimization?: {
      onlyOccupiedDaysReturned: boolean;
      interpretation: string;
      reservationsConsidered: number;
      cleanupTimeIncluded: boolean;
    };
    fixes?: {
      authenticationFixed: boolean;
      usingServiceRoleKey: boolean;
      queryLogicFromWorkingFunction: boolean;
      onlyOccupiedDaysReturned: boolean;
    };
  };
}

const AVAILABILITY_API_URL = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/space-availability';

export class SpaceAvailabilityClient {
  /**
   * Crea un slot de tiempo completamente disponible para un día sin reservas
   */
  private static createAvailableSlot(date: Date, hour: number, duration: number): TimeSlot {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + duration, 0, 0, 0);

    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour,
      available: true,
      startDateTime: slotStart.toISOString(),
      endDateTime: slotEnd.toISOString(),
      duration
    };
  }

  /**
   * Genera un día completamente disponible (sin reservas)
   */
  private static createFullyAvailableDay(
    date: Date, 
    duration: number
  ): DayAvailability {
    const slots: TimeSlot[] = [];
    
    // Generar slots de 6:00 AM a 11:00 PM (18 slots por día)
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(this.createAvailableSlot(date, hour, duration));
    }

    return {
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      dayName: date.toLocaleDateString('es-CO', { weekday: 'long' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      slots,
      availableCount: slots.length,
      occupiedCount: 0,
      reservations: []
    };
  }

  /**
   * Convierte la respuesta optimizada en la estructura mensual completa
   */
  private static convertOptimizedToComplete(
    optimizedData: OptimizedAvailabilityResponse
  ): MonthlyAvailabilityResponse {
    const { monthInfo, occupiedDays, searchParams } = optimizedData;
    const allDays: DayAvailability[] = [];

    // Crear un mapa de días ocupados para búsqueda rápida
    const occupiedDaysMap = new Map<number, DayAvailability>();
    occupiedDays.forEach(day => {
      occupiedDaysMap.set(day.day, day);
    });

    // Generar todos los días del mes
    for (let day = 1; day <= monthInfo.daysInMonth; day++) {
      const dayDate = new Date(monthInfo.year, monthInfo.month - 1, day);
      
      if (occupiedDaysMap.has(day)) {
        // Día con reservas - usar datos de la respuesta optimizada
        allDays.push(occupiedDaysMap.get(day)!);
      } else {
        // Día sin reservas - generar como completamente disponible
        allDays.push(this.createFullyAvailableDay(dayDate, searchParams.duration));
      }
    }

    // Construir la estructura de disponibilidad mensual
    const availability: MonthlyAvailability = {
      year: monthInfo.year,
      month: monthInfo.month,
      monthName: monthInfo.monthName,
      daysInMonth: monthInfo.daysInMonth,
      startDate: monthInfo.startDate,
      endDate: monthInfo.endDate,
      days: allDays,
      summary: {
        totalDays: optimizedData.summary.totalDays,
        totalSlots: optimizedData.summary.totalSlots,
        availableSlots: optimizedData.summary.availableSlots,
        occupiedSlots: optimizedData.summary.occupiedSlots,
        availabilityRate: optimizedData.summary.availabilityRate,
        daysWithReservations: optimizedData.summary.daysWithReservations,
        interpretation: optimizedData.summary.interpretation
      }
    };

    return {
      space: optimizedData.space,
      searchParams: {
        year: searchParams.year,
        month: searchParams.month,
        duration: searchParams.duration
      },
      availability,
      reservations: optimizedData.confirmedReservations
    };
  }

  /**
   * Obtiene la disponibilidad mensual completa de un espacio
   */
  static async getMonthlyAvailability(
    spaceId: number,
    year: number,
    month: number,
    duration: number = 2
  ): Promise<MonthlyAvailabilityResponse> {
    try {
      const params = new URLSearchParams({
        spaceId: spaceId.toString(),
        year: year.toString(),
        month: month.toString(),
        duration: duration.toString()
      });

      console.log('🔍 Fetching optimized monthly availability:', {
        spaceId,
        year,
        month,
        duration
      });

      const response = await fetch(`${AVAILABILITY_API_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`El espacio con ID ${spaceId} no fue encontrado`);
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result: ApiResponse<OptimizedAvailabilityResponse> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo disponibilidad mensual');
      }

      if (!result.data) {
        throw new Error('No se recibieron datos de disponibilidad');
      }

      console.log('✅ Monthly availability retrieved:', {
        spaceId,
        monthName: result.data.monthInfo.monthName,
        availabilityRate: result.data.summary.availabilityRate
      });

      // Convertir la respuesta optimizada a la estructura completa
      const completeData = this.convertOptimizedToComplete(result.data);

      return completeData;
    } catch (error) {
      console.error('❌ Error fetching monthly availability:', error);
      
      // Proporcionar mensajes de error más útiles
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conectividad. Verifica tu conexión a internet.');
      }
      
      throw error;
    }
  }

  /**
   * Obtiene la disponibilidad de un día específico del mes
   */
  static async getDayAvailability(
    spaceId: number,
    date: Date,
    duration: number = 2
  ): Promise<DayAvailability | null> {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      const monthlyData = await this.getMonthlyAvailability(spaceId, year, month, duration);
      
      // Buscar el día específico en los datos del mes
      const dayData = monthlyData.availability.days.find(d => d.day === day);
      return dayData || null;
    } catch (error) {
      console.error('❌ Error fetching day availability:', error);
      throw error;
    }
  }

  /**
   * Obtiene próximos slots disponibles desde una fecha
   */
  static async getNextAvailableSlots(
    spaceId: number,
    fromDate: Date,
    duration: number = 2,
    count: number = 10
  ): Promise<TimeSlot[]> {
    try {
      const availableSlots: TimeSlot[] = [];
      const currentDate = new Date(fromDate);
      
      // Buscar en los próximos 3 meses
      for (let monthOffset = 0; monthOffset < 3 && availableSlots.length < count; monthOffset++) {
        const searchYear = currentDate.getFullYear();
        const searchMonth = currentDate.getMonth() + 1 + monthOffset;
        
        try {
          const monthlyData = await this.getMonthlyAvailability(spaceId, searchYear, searchMonth, duration);
          
          // Buscar slots disponibles en este mes
          for (const day of monthlyData.availability.days) {
            if (availableSlots.length >= count) break;
            
            // Solo incluir días desde la fecha solicitada en adelante
            const dayDate = new Date(day.date);
            if (dayDate >= fromDate) {
              for (const slot of day.slots) {
                if (availableSlots.length >= count) break;
                if (slot.available) {
                  availableSlots.push(slot);
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Error loading month ${searchYear}-${searchMonth}:`, error);
        }
      }
      
      return availableSlots;
    } catch (error) {
      console.error('❌ Error fetching next available slots:', error);
      throw error;
    }
  }

  /**
   * Valida si un horario específico está disponible
   */
  static async isTimeSlotAvailable(
    spaceId: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const dayAvailability = await this.getDayAvailability(spaceId, startTime, duration);
      
      if (!dayAvailability) {
        return false;
      }

      const startHour = startTime.getHours();
      const endHour = endTime.getHours();

      // Verificar que todos los slots en el rango estén disponibles
      for (let hour = startHour; hour < endHour; hour++) {
        const slot = dayAvailability.slots.find(s => s.hour === hour);
        if (!slot || !slot.available) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error validating time slot availability:', error);
      return false;
    }
  }
}

export default SpaceAvailabilityClient;