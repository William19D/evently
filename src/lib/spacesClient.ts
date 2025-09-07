/**
 * Cliente para la API de espacios (Edge Function)
 */

interface SpaceData {
  spaceName: string;
  spaceType: string;
  maxCapacity: number;
  pricePerHour: number;
  location: string;
  description: string;
  amenities?: string[];
  photos?: Array<string | { data: string; name: string; type: string }>;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  review_reason?: string;
}

interface SpaceResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

interface SpacesListResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class SpacesClient {
  private baseUrl: string;
  private token: string | null = null;
  private spacesCache: any[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.baseUrl = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/space';
  }

  setToken(token: string) {
    this.token = token;
    // Limpiar cache cuando cambia el token
    this.clearCache();
  }

  // 🗄️ Métodos de cache
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION && this.spacesCache.length > 0;
  }

  private updateCache(spaces: any[]): void {
    this.spacesCache = spaces;
    this.cacheTimestamp = Date.now();
    console.log('💾 Cache actualizado', {
      spacesCount: spaces.length,
      timestamp: new Date(this.cacheTimestamp).toISOString()
    });
  }

  private clearCache(): void {
    this.spacesCache = [];
    this.cacheTimestamp = 0;
    console.log('🗑️ Cache limpiado');
  }

  // 🔍 Filtrar espacios localmente
  private filterSpacesLocally(status?: 'pending' | 'approved' | 'rejected'): any[] {
    if (!status) return this.spacesCache;
    return this.spacesCache.filter(space => space.status === status);
  }

  // 📊 Obtener estadísticas del cache local
  private getStatsFromCache(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } {
    const stats = {
      total: this.spacesCache.length,
      pending: this.spacesCache.filter(s => s.status === 'pending').length,
      approved: this.spacesCache.filter(s => s.status === 'approved').length,
      rejected: this.spacesCache.filter(s => s.status === 'rejected').length
    };
    
    console.log('📊 Stats desde cache:', stats);
    return stats;
  }

  private async makeRequest(
    endpoint: string = '',
    options: RequestInit = {}
  ): Promise<any> {
    const url = endpoint ? `${this.baseUrl}/${endpoint}` : this.baseUrl;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaGdtdnB6eWdwZW5jY25pZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxNTU3MTcsImV4cCI6MjA0MDczMTcxN30.aVOr-8EOCBJLOOFIRrWGrGdJxQJm5UfUdRwTU5IXLHM',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    console.log('🌐 SpacesClient: Making request', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      hasBody: !!options.body,
      tokenPrefix: this.token ? this.token.substring(0, 20) + '***' : 'none'
    });

    try {
      const response = await fetch(url, config);
      
      // Intentar parsear la respuesta
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ SpacesClient: Failed to parse response as JSON', parseError);
        throw new Error(`Respuesta inválida del servidor (${response.status})`);
      }

      if (!response.ok) {
        console.error('❌ SpacesClient: Request failed', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          requiresAuth: data.requiresAuth
        });
        
        // Manejo específico de errores de autenticación
        if (response.status === 401 || data.requiresAuth) {
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
        
        if (response.status === 403) {
          throw new Error('No tienes permisos para realizar esta acción.');
        }
        
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ SpacesClient: Request successful', {
        success: data.success,
        hasData: !!data.data,
        dataType: Array.isArray(data.data) ? 'array' : typeof data.data
      });

      return data;
    } catch (error) {
      console.error('❌ SpacesClient: Request exception', error);
      throw error;
    }
  }

  // 📋 Obtener todos los espacios del usuario autenticado (optimizado con cache)
  async getUserSpaces(page: number = 1, limit: number = 10, forceRefresh: boolean = false): Promise<SpacesListResponse> {
    // Si tenemos cache válido y no es un refresh forzado, usar cache
    if (this.isCacheValid() && !forceRefresh) {
      console.log('⚡ Usando espacios desde cache');
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSpaces = this.spacesCache.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedSpaces,
        pagination: {
          page,
          limit,
          total: this.spacesCache.length,
          totalPages: Math.ceil(this.spacesCache.length / limit)
        }
      };
    }

    // Hacer request completo para obtener TODOS los espacios
    console.log('🌐 Obteniendo todos los espacios desde servidor...');
    const params = new URLSearchParams({
      page: '1',
      limit: '1000' // Obtener todos de una vez
    });

    const response = await this.makeRequest(`?${params.toString()}`);
    
    // Actualizar cache con todos los espacios
    if (response.success && response.data) {
      this.updateCache(response.data);
    }

    // Devolver página solicitada
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSpaces = this.spacesCache.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedSpaces,
      pagination: {
        page,
        limit,
        total: this.spacesCache.length,
        totalPages: Math.ceil(this.spacesCache.length / limit)
      }
    };
  }

  // 📋 Obtener espacios por estado (optimizado con filtrado local)
  async getSpacesByStatus(status: 'pending' | 'approved' | 'rejected', page: number = 1, limit: number = 10, forceRefresh: boolean = false): Promise<SpacesListResponse> {
    // Si tenemos cache válido y no es un refresh forzado, filtrar localmente
    if (this.isCacheValid() && !forceRefresh) {
      console.log(`⚡ Filtrando espacios ${status} desde cache`);
      const filteredSpaces = this.filterSpacesLocally(status);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSpaces = filteredSpaces.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedSpaces,
        pagination: {
          page,
          limit,
          total: filteredSpaces.length,
          totalPages: Math.ceil(filteredSpaces.length / limit)
        }
      };
    }

    // Si no tenemos cache, primero cargar todos los espacios
    if (!this.isCacheValid()) {
      await this.getUserSpaces(1, 1000, true); // Cargar todos al cache
    }

    // Ahora filtrar desde cache
    return this.getSpacesByStatus(status, page, limit, false);
  }

  // 🔍 Obtener un espacio específico
  async getSpace(spaceId: number): Promise<SpaceResponse> {
    const params = new URLSearchParams({
      id: spaceId.toString()
    });

    return this.makeRequest(`?${params.toString()}`);
  }

  // ➕ Crear nuevo espacio (con invalidación de cache)
  async createSpace(spaceData: SpaceData): Promise<SpaceResponse> {
    const response = await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(spaceData)
    });

    // Invalidar cache al crear nuevo espacio
    if (response.success) {
      this.clearCache();
      console.log('✅ Espacio creado, cache invalidado');
    }

    return response;
  }

  // ✏️ Actualizar espacio existente (con actualización de cache)
  async updateSpace(spaceId: number, spaceData: Partial<SpaceData>): Promise<SpaceResponse> {
    const response = await this.makeRequest(`${spaceId}/update`, {
      method: 'PUT',
      body: JSON.stringify(spaceData)
    });

    // Actualizar cache con el espacio modificado
    if (response.success && response.data) {
      const spaceIndex = this.spacesCache.findIndex(space => space.id_space === spaceId);
      if (spaceIndex !== -1) {
        this.spacesCache[spaceIndex] = response.data;
        console.log('✅ Espacio actualizado en cache');
      } else {
        this.clearCache(); // Si no encontramos el espacio, invalidar cache
      }
    }

    return response;
  }

  // 🗑️ Eliminar espacio (con limpieza de cache)
  async deleteSpace(spaceId: number): Promise<SpaceResponse> {
    const response = await this.makeRequest(`${spaceId}/delete`, {
      method: 'DELETE'
    });

    // Remover del cache si fue exitoso
    if (response.success) {
      this.spacesCache = this.spacesCache.filter(space => space.id_space !== spaceId);
      this.cacheTimestamp = Date.now(); // Actualizar timestamp
      console.log('✅ Espacio eliminado del cache');
    }

    return response;
  }

  // ✅ Aprobar espacio (función específica para superadmin)
  async approveSpace(spaceId: number): Promise<SpaceResponse> {
    console.log('🟢 Aprobando espacio:', spaceId);
    
    // Usar updateSpace con status approved
    const response = await this.updateSpace(spaceId, { 
      status: 'approved' 
    } as any);

    // Actualizar status en cache si fue exitoso
    if (response.success) {
      const spaceIndex = this.spacesCache.findIndex(space => space.id_space === spaceId);
      if (spaceIndex !== -1) {
        this.spacesCache[spaceIndex].status = 'approved';
        console.log('✅ Estado del espacio actualizado a "approved" en cache');
      }
    }

    return response;
  }

  // ❌ Rechazar espacio (función específica para superadmin)
  async rejectSpace(spaceId: number, reason?: string): Promise<SpaceResponse> {
    console.log('🔴 Rechazando espacio:', spaceId, 'Motivo:', reason);
    
    // Usar updateSpace con status rejected
    const updateData: any = { 
      status: 'rejected'
    };
    
    if (reason) {
      updateData.rejection_reason = reason;
    }
    
    const response = await this.updateSpace(spaceId, updateData);

    // Actualizar status en cache si fue exitoso
    if (response.success) {
      const spaceIndex = this.spacesCache.findIndex(space => space.id_space === spaceId);
      if (spaceIndex !== -1) {
        this.spacesCache[spaceIndex].status = 'rejected';
        if (reason) {
          this.spacesCache[spaceIndex].rejection_reason = reason;
        }
        console.log('✅ Estado del espacio actualizado a "rejected" en cache');
      }
    }

    return response;
  }

  // 🔄 Marcar espacio como pendiente (función específica para superadmin)
  async markAsPending(spaceId: number, reason?: string): Promise<SpaceResponse> {
    console.log('🟡 Marcando espacio como pendiente:', spaceId, 'Motivo:', reason);
    
    // Usar updateSpace con status pending
    const updateData: any = { 
      status: 'pending'
    };
    
    if (reason) {
      updateData.review_reason = reason; // Motivo de la revisión
    }
    
    const response = await this.updateSpace(spaceId, updateData);

    // Actualizar status en cache si fue exitoso
    if (response.success) {
      const spaceIndex = this.spacesCache.findIndex(space => space.id_space === spaceId);
      if (spaceIndex !== -1) {
        this.spacesCache[spaceIndex].status = 'pending';
        if (reason) {
          this.spacesCache[spaceIndex].review_reason = reason;
        }
        // Limpiar rejection_reason si existía
        delete this.spacesCache[spaceIndex].rejection_reason;
        console.log('✅ Estado del espacio actualizado a "pending" en cache');
      }
    }

    return response;
  }

  // 📊 Estadísticas del dashboard (optimizado con cache)
  async getDashboardStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      // Si tenemos cache válido, calcular stats desde cache
      if (this.isCacheValid()) {
        console.log('⚡ Calculando estadísticas desde cache');
        return this.getStatsFromCache();
      }

      // Si no tenemos cache, cargar todos los espacios primero
      console.log('🌐 Cargando espacios para calcular estadísticas...');
      await this.getUserSpaces(1, 1000, true); // Cargar todos al cache
      
      // Ahora calcular desde cache
      return this.getStatsFromCache();
    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    }
  }

  // 🔄 Métodos de utilidad para el cache
  async refreshCache(): Promise<void> {
    console.log('🔄 Refrescando cache...');
    await this.getUserSpaces(1, 1000, true);
  }

  getCacheInfo(): { isValid: boolean; spacesCount: number; ageMinutes: number } {
    const ageMs = Date.now() - this.cacheTimestamp;
    return {
      isValid: this.isCacheValid(),
      spacesCount: this.spacesCache.length,
      ageMinutes: Math.round(ageMs / (1000 * 60))
    };
  }
}

// Instancia singleton
export const spacesClient = new SpacesClient();

// Tipos para usar en los componentes
export type { SpaceData, SpaceResponse, SpacesListResponse };
