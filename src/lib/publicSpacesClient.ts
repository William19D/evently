// Cliente para la API pública de espacios
// Esta API permite ver espacios aprobados sin necesidad de autenticación

interface PublicSpace {
  id: number;
  name: string;
  description: string;
  type: string;
  capacity: number;
  location: string;
  price_per_hour: number;
  price_formatted: string;
  rating: {
    average: number;
    count: number;
    stars: number;
  };
  amenities: Array<{
    name: string;
    display_name: string;
    icon: string;
    category: string;
    is_custom: boolean;
  }>;
  photos: Array<{
    id: number;
    url: string;
    is_primary: boolean;
    order: number;
  }>;
  availability: {
    status: string;
    published_at: string;
  };
  reviews?: Array<{
    id: number;
    rating: number;
    text: string;
    event_date: string;
    created_at: string;
    reviewer: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface PublicSpacesResponse {
  success: boolean;
  data: PublicSpace[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  metadata: {
    query_time: string;
    api_version: string;
    filters: Record<string, any>;
    sort: {
      field: string;
      order: string;
    };
    include_reviews: boolean;
  };
}

interface PublicSpaceResponse {
  success: boolean;
  data: PublicSpace;
}

interface PublicSpacesFilters {
  type?: string;
  min_capacity?: number;
  max_capacity?: number;
  min_price?: number;
  max_price?: number;
  location?: string;
  search?: string;
  sort_by?: 'created_at' | 'updated_at' | 'space_name' | 'max_capacity' | 'price_per_hour_cop';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  include_reviews?: boolean;
}

// Usar la URL directa de la edge function desplegada
const PUBLIC_SPACES_ENDPOINT = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/public-space';

class PublicSpacesClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = PUBLIC_SPACES_ENDPOINT;
  }

  /**
   * Obtiene una lista de espacios públicos aprobados
   */
  async getPublicSpaces(filters: PublicSpacesFilters = {}): Promise<PublicSpacesResponse> {
    try {
      const searchParams = new URLSearchParams();

      // Agregar filtros a los parámetros de búsqueda
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}?${searchParams.toString()}`;
      
      console.log('🌍 Fetching public spaces:', { url, filters });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Public spaces fetched successfully:', {
        count: data.data?.length || 0,
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching public spaces:', error);
      throw error;
    }
  }

  /**
   * Obtiene un espacio público específico por ID
   */
  async getPublicSpace(spaceId: number, includeReviews = false): Promise<PublicSpaceResponse> {
    try {
      const searchParams = new URLSearchParams({
        id: spaceId.toString(),
        ...(includeReviews && { include_reviews: 'true' })
      });

      const url = `${this.baseUrl}?${searchParams.toString()}`;
      
      console.log('🌍 Fetching public space:', { spaceId, includeReviews, url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Public space fetched successfully:', {
        spaceId: data.data?.id,
        spaceName: data.data?.name,
        includeReviews
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching public space:', error);
      throw error;
    }
  }

  /**
   * Busca espacios públicos por texto
   */
  async searchPublicSpaces(
    searchTerm: string, 
    filters: Omit<PublicSpacesFilters, 'search'> = {}
  ): Promise<PublicSpacesResponse> {
    return this.getPublicSpaces({
      ...filters,
      search: searchTerm
    });
  }

  /**
   * Obtiene espacios públicos por tipo
   */
  async getPublicSpacesByType(
    spaceType: string, 
    filters: Omit<PublicSpacesFilters, 'type'> = {}
  ): Promise<PublicSpacesResponse> {
    return this.getPublicSpaces({
      ...filters,
      type: spaceType
    });
  }

  /**
   * Obtiene espacios públicos por ubicación
   */
  async getPublicSpacesByLocation(
    location: string, 
    filters: Omit<PublicSpacesFilters, 'location'> = {}
  ): Promise<PublicSpacesResponse> {
    return this.getPublicSpaces({
      ...filters,
      location: location
    });
  }

  /**
   * Obtiene espacios públicos con filtros de capacidad
   */
  async getPublicSpacesByCapacity(
    minCapacity?: number, 
    maxCapacity?: number,
    filters: Omit<PublicSpacesFilters, 'min_capacity' | 'max_capacity'> = {}
  ): Promise<PublicSpacesResponse> {
    return this.getPublicSpaces({
      ...filters,
      ...(minCapacity && { min_capacity: minCapacity }),
      ...(maxCapacity && { max_capacity: maxCapacity })
    });
  }

  /**
   * Obtiene espacios públicos con filtros de precio
   */
  async getPublicSpacesByPrice(
    minPrice?: number, 
    maxPrice?: number,
    filters: Omit<PublicSpacesFilters, 'min_price' | 'max_price'> = {}
  ): Promise<PublicSpacesResponse> {
    return this.getPublicSpaces({
      ...filters,
      ...(minPrice && { min_price: minPrice }),
      ...(maxPrice && { max_price: maxPrice })
    });
  }

  /**
   * Obtiene espacios públicos con reviews incluidos
   */
  async getPublicSpacesWithReviews(
    filters: Omit<PublicSpacesFilters, 'include_reviews'> = {}
  ): Promise<PublicSpacesResponse> {
    return this.getPublicSpaces({
      ...filters,
      include_reviews: true
    });
  }
}

// Instancia singleton del cliente
export const publicSpacesClient = new PublicSpacesClient();

// Exportar tipos para uso en componentes
export type {
  PublicSpace,
  PublicSpacesResponse,
  PublicSpaceResponse,
  PublicSpacesFilters
};
