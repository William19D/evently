import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Filter, Search, MapPin, Calendar, Users, SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";
import { publicSpacesClient, type PublicSpace, type PublicSpacesFilters } from "@/lib/publicSpacesClient";
import { useToast } from "@/hooks/use-toast";

const VenueSearch = () => {
  const [priceRange, setPriceRange] = useState([0, 1500000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para la API
  const [spaces, setSpaces] = useState<PublicSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [spaceType, setSpaceType] = useState("");
  
  const { toast } = useToast();

  // Cargar espacios
  const loadSpaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: PublicSpacesFilters = {
        limit: 12,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      // Aplicar filtros
      if (searchTerm) filters.search = searchTerm;
      if (location) filters.location = location;
      if (spaceType) filters.type = spaceType;
      if (priceRange[1] < 1500000) filters.max_price = priceRange[1];
      if (priceRange[0] > 0) filters.min_price = priceRange[0];
      
      // Filtro de capacidad
      if (capacity) {
        const [min, max] = capacity.split('-').map(s => s.replace('+', ''));
        if (min && min !== 'personas') filters.min_capacity = parseInt(min);
        if (max && max !== 'personas') filters.max_capacity = parseInt(max);
      }

      const response = await publicSpacesClient.getPublicSpaces(filters);
      
      if (response.success) {
        setSpaces(response.data || []);
      } else {
        throw new Error("Error al cargar espacios");
      }
    } catch (error: any) {
      console.error("Error loading spaces:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los espacios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar espacios iniciales
  useEffect(() => {
    loadSpaces();
  }, []);

  // Efecto para recargar cuando cambien los filtros
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadSpaces();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [location, eventDate, capacity, searchTerm, spaceType, priceRange]);

  // Convertir PublicSpace a formato VenueCard
  const convertToVenueCard = (space: PublicSpace) => ({
    id: space.id.toString(),
    name: space.name,
    location: space.location,
    image: space.photos.find(p => p.is_primary)?.url || space.photos[0]?.url || "/placeholder.svg",
    price: space.price_per_hour,
    rating: space.rating.average,
    capacity: `${space.capacity} personas`,
    amenities: space.amenities.slice(0, 3).map(a => a.display_name),
  });

  // Manejar búsqueda
  const handleSearch = () => {
    loadSpaces();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          {/* Búsqueda general */}
          <div className="mb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar espacios por nombre, descripción o ubicación..." 
                className="pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Armenia, Bogotá, Medellín..." 
                  className="pl-10" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  type="date" 
                  className="pl-10"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Capacidad" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-30">10-30 personas</SelectItem>
                  <SelectItem value="30-50">30-50 personas</SelectItem>
                  <SelectItem value="50-100">50-100 personas</SelectItem>
                  <SelectItem value="100-200">100-200 personas</SelectItem>
                  <SelectItem value="200+">200+ personas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {isLoading ? (
                "Buscando espacios..."
              ) : (
                `Se encontraron ${spaces.length} espacios disponibles`
              )}
            </p>
            <Select defaultValue="featured">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Más populares</SelectItem>
                <SelectItem value="price-low">Precio menor</SelectItem>
                <SelectItem value="price-high">Precio mayor</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Rango de Precio</h4>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1500000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-medium mb-3">Servicios</h4>
                  <div className="space-y-3">
                    {["WiFi Gratuito", "Estacionamiento", "Catering", "Sonido", "Iluminación", "Decoración"].map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox id={amenity} />
                        <label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <h4 className="font-medium mb-3">Tipo de Evento</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Bodas</SelectItem>
                      <SelectItem value="corporate">Corporativo</SelectItem>
                      <SelectItem value="birthday">Cumpleaños</SelectItem>
                      <SelectItem value="conference">Conferencias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mr-2" />
                <span>Cargando espacios...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <Alert variant="destructive" className="max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold mb-4">No se encontraron espacios</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda para encontrar más opciones.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {spaces.map((space) => (
                    <VenueCard key={space.id} {...convertToVenueCard(space)} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <Button variant="outline" disabled>Anterior</Button>
                    <Button variant="default">1</Button>
                    <Button variant="outline">2</Button>
                    <Button variant="outline">3</Button>
                    <Button variant="outline">Siguiente</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VenueSearch;