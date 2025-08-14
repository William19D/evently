import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, MapPin, Calendar, Users, SlidersHorizontal } from "lucide-react";

const VenueSearch = () => {
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for search results
  const searchResults = [
    {
      id: "1",
      name: "Salón Elegance",
      location: "Centro, Ciudad de México",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
      price: 15000,
      rating: 4.8,
      capacity: "150-200 personas",
      amenities: ["WiFi", "Parking", "Catering"],
      featured: true
    },
    {
      id: "2", 
      name: "Terraza Vista Panorámica",
      location: "Polanco, Ciudad de México",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80",
      price: 25000,
      rating: 4.9,
      capacity: "80-120 personas",
      amenities: ["WiFi", "Parking", "Catering"],
      featured: true
    },
    {
      id: "3",
      name: "Auditorio Moderno",
      location: "Santa Fe, Ciudad de México",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      price: 20000,
      rating: 4.7,
      capacity: "200-300 personas",
      amenities: ["WiFi", "Parking", "Catering"],
      featured: false
    },
    {
      id: "4",
      name: "Jardín Botanical",
      location: "Coyoacán, Ciudad de México",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
      price: 18000,
      rating: 4.6,
      capacity: "100-150 personas",
      amenities: ["WiFi", "Parking", "Catering"],
      featured: false
    },
    {
      id: "5",
      name: "Loft Industrial",
      location: "Roma Norte, Ciudad de México",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      price: 12000,
      rating: 4.5,
      capacity: "60-80 personas",
      amenities: ["WiFi", "Parking"],
      featured: false
    },
    {
      id: "6",
      name: "Salón de Cristal",
      location: "Las Lomas, Ciudad de México",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      price: 30000,
      rating: 4.9,
      capacity: "100-150 personas",
      amenities: ["WiFi", "Parking", "Catering"],
      featured: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Ubicación" className="pl-10" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input type="date" className="pl-10" />
              </div>
              <Select>
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
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Buscar
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
              Se encontraron {searchResults.length} espacios disponibles
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
                      max={50000}
                      step={1000}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((venue) => (
                <VenueCard key={venue.id} {...venue} />
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VenueSearch;