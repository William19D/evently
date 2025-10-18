import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
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
  Loader2
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

  // Cargar espacios
  const loadSpaces = async () => {
    try {
      setIsLoading(true);
      
      const searchFilters = {
        ...filters,
        ...(searchTerm && { search: searchTerm })
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
    loadSpaces();
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navbar */}
      <Navigation />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Espacios Disponibles</h1>
            <p className="mt-2 text-gray-600">
              Descubre los mejores espacios para tus eventos
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
        {/* Panel de filtros lateral simplificado */}
        {showFilters && (
          <aside className="w-64 bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
            <p className="text-sm text-gray-600">Aquí puedes aplicar filtros.</p>
          </aside>
        )}

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
            <div className="flex items-center justify-between">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {spaces.map((space) => (
                <Card key={space.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    {/* Imagen principal */}
                    {space.photos.length > 0 ? (
                      <img
                        src={space.photos.find(p => p.is_primary)?.url || space.photos[0]?.url}
                        alt={space.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badge del tipo */}
                    <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800">
                      {space.type}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{space.name}</h3>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{space.description}</p>
                      
                      {/* Rating */}
                      {space.rating.count > 0 && (
                        <div className="flex items-center gap-1">
                          {renderStars(space.rating.stars)}
                          <span className="text-sm text-gray-600 ml-1">
                            {space.rating.average.toFixed(1)} ({space.rating.count})
                          </span>
                        </div>
                      )}
                      
                      {/* Ubicación */}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{space.location}</span>
                      </div>
                      
                      {/* Capacidad */}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Hasta {space.capacity} personas</span>
                      </div>
                      
                      {/* Precio */}
                      <div className="flex items-center gap-1 text-lg font-semibold text-[#f1893f]">
                        <DollarSign className="w-5 h-5" />
                        <span>{space.price_formatted}/hora</span>
                      </div>
                      
                      {/* Botón de ver más */}
                      <Link to={`/spaces/${space.id}`} className="block">
                        <Button 
                          className="w-full mt-3 bg-[#f1893f] hover:bg-[#e17a36] text-white border-0" 
                          variant="default"
                        >
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
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
