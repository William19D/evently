import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import Breadcrumb from "@/components/Breadcrumb";
import VenueCard from "@/components/VenueCard";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MapPin, 
  Users, 
  Star,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { publicSpacesClient, type PublicSpace, type PublicSpacesFilters } from "@/lib/publicSpacesClient";
import { useToast } from "@/hooks/use-toast";

const PublicSpaces = () => {
  const navigate = useNavigate();
  const { user, isFullyAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [spaces, setSpaces] = useState<PublicSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PublicSpacesFilters>({
    page: 1,
    limit: 12,
    sort_by: "created_at",
    sort_order: "desc"
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para filtros adicionales
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [capacityRange, setCapacityRange] = useState([0, 500]);

  // Opciones para filtros
  const spaceTypes = [
    "Salón de eventos",
    "Auditorio", 
    "Sala de conferencias",
    "Terraza",
    "Jardín",
    "Galería",
    "Estudio",
    "Rooftop",
    "Salón social",
    "Otro"
  ];

  const locations = [
    "Bogotá",
    "Medellín", 
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
    "Manizales"
  ];

  // Cargar espacios
  const loadSpaces = async () => {
    try {
      setIsLoading(true);
      
      const searchFilters = {
        ...filters,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && selectedType !== "all" && { type: selectedType }),
        ...(selectedLocation && selectedLocation !== "all" && { location: selectedLocation }),
        ...(priceRange[0] > 0 || priceRange[1] < 1000000) && {
          min_price: priceRange[0],
          max_price: priceRange[1]
        },
        ...(capacityRange[0] > 0 || capacityRange[1] < 500) && {
          min_capacity: capacityRange[0],
          max_capacity: capacityRange[1]
        }
      };

      const response = await publicSpacesClient.getPublicSpaces(searchFilters);
      
      if (response.success) {
        setSpaces(response.data || []);
        setPagination(response.pagination);
      } else {
        throw new Error("Error al cargar espacios");
      }
    } catch (error: any) {
      console.error("Error loading spaces:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los espacios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar espacios cuando cambien los filtros
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadSpaces();
    }, 300); // Debounce para evitar muchas llamadas
    
    return () => clearTimeout(debounceTimer);
  }, [filters, searchTerm, selectedType, selectedLocation, priceRange, capacityRange]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    loadSpaces();
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key: keyof PublicSpacesFilters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedLocation("all");
    setPriceRange([0, 1000000]);
    setCapacityRange([0, 500]);
    setFilters({
      page: 1,
      limit: 12,
      sort_by: "created_at",
      sort_order: "desc"
    });
  };

  // Renderizar estrellas de rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  // Convertir PublicSpace a formato VenueCard
  const convertToVenueCard = (space: PublicSpace) => ({
    id: space.id.toString(),
    name: space.name,
    location: space.location,
    image: space.photos.find(p => p.is_primary)?.url || space.photos[0]?.url || "/placeholder.svg",
    price: space.price_per_hour,
    rating: space.rating.average,
    capacity: `${space.capacity} personas`,
    amenities: space.amenities?.map(a => a.display_name || a.name) || []
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Navbar */}
      <Navigation />

      {/* Header con Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb className="mb-4" />
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
        {/* Panel de filtros lateral */}
        <aside className={`w-80 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card className="sticky top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de espacio */}
              <div>
                <h4 className="font-medium mb-3">Tipo de Espacio</h4>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {spaceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ubicación */}
              <div>
                <h4 className="font-medium mb-3">Ciudad</h4>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              
              {/* Ordenar por */}
              <div>
                <h4 className="font-medium mb-3">Ordenar por</h4>
                <Select 
                  value={filters.sort_by} 
                  onValueChange={(value) => handleFilterChange('sort_by', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Más recientes</SelectItem>
                    <SelectItem value="price_per_hour">Precio</SelectItem>
                    <SelectItem value="capacity">Capacidad</SelectItem>
                    <SelectItem value="rating">Mejor valorados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          {/* Búsqueda y Resultados */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                {/* Barra de búsqueda */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Buscar espacios por nombre, descripción o ubicación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {isLoading ? (
                  "Buscando espacios..."
                ) : (
                  `Mostrando ${spaces.length} de ${pagination.total} espacios`
                )}
              </p>
              {pagination.total > 0 && (
                <p className="text-sm text-gray-500">
                  Página {pagination.page} de {pagination.total_pages}
                </p>
              )}
            </div>

            {/* Filtros activos */}
            {(selectedType !== "all" || selectedLocation !== "all" || searchTerm || priceRange[0] > 0 || priceRange[1] < 1000000 || capacityRange[0] > 0 || capacityRange[1] < 500) && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Búsqueda: "{searchTerm}"
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSearchTerm("")}
                    />
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Tipo: {selectedType}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedType("all")}
                    />
                  </Badge>
                )}
                {selectedLocation !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Ciudad: {selectedLocation}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedLocation("all")}
                    />
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setPriceRange([0, 1000000])}
                    />
                  </Badge>
                )}
                {(capacityRange[0] > 0 || capacityRange[1] < 500) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Capacidad: {capacityRange[0]} - {capacityRange[1]} personas
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setCapacityRange([0, 500])}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-6 px-2"
                >
                  Limpiar todos
                </Button>
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          )}

          {/* Sin resultados */}
          {!isLoading && spaces.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron espacios que coincidan con tu búsqueda. 
                Intenta ajustar los filtros o buscar con otros términos.
              </AlertDescription>
            </Alert>
          )}

          {/* Grid de espacios */}
          {!isLoading && spaces.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {spaces.map((space) => (
                <VenueCard key={space.id} {...convertToVenueCard(space)} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {!isLoading && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {pagination.page} de {pagination.total_pages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicSpaces;
