import { useState, useEffect } from "react";
import VenueCard from "./VenueCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { publicSpacesClient, type PublicSpace } from "@/lib/publicSpacesClient";

const FeaturedSpaces = () => {
  const [featuredSpaces, setFeaturedSpaces] = useState<PublicSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar espacios destacados
  useEffect(() => {
    const loadFeaturedSpaces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener los primeros 4 espacios ordenados por fecha de creación
        const response = await publicSpacesClient.getPublicSpaces({
          limit: 4,
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        
        if (response.success) {
          console.log('📦 Raw spaces data:', response.data);
          setFeaturedSpaces(response.data || []);
        } else {
          throw new Error("Error al cargar espacios");
        }
      } catch (error: any) {
        console.error("Error loading featured spaces:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedSpaces();
  }, []);

  // Convertir PublicSpace a formato VenueCard
  const convertToVenueCard = (space: PublicSpace) => {
    // Validar y sanear los datos
    const safeSpace = {
      id: space.id?.toString() || 'unknown',
      name: space.name || 'Espacio sin nombre',
      location: space.location || 'Ubicación no especificada',
      image: space.photos?.find(p => p.is_primary)?.url || space.photos?.[0]?.url || "/placeholder.svg",
      price: typeof space.price_per_hour === 'number' ? space.price_per_hour : 0,
      rating: typeof space.rating?.average === 'number' ? space.rating.average : 0,
      capacity: `${space.capacity || 0} personas`,
      amenities: Array.isArray(space.amenities) 
        ? space.amenities.slice(0, 3).map(a => a.display_name || a.name || 'Amenidad')
        : [],
    };
    
    console.log('🔄 Safe conversion result:', safeSpace);
    return safeSpace;
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Espacios Destacados
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre los espacios más populares y mejor valorados por nuestros clientes
            </p>
          </div>

          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-muted-foreground">Cargando espacios...</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Espacios Destacados
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre los espacios más populares y mejor valorados por nuestros clientes
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se pudieron cargar los espacios en este momento. 
                <Link to="/spaces" className="underline ml-1">
                  Ver todos los espacios
                </Link>
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="group" asChild>
              <Link to="/spaces">
                Explorar Espacios
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // No spaces available
  if (featuredSpaces.length === 0) {
    return (
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Espacios Destacados
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Próximamente encontrarás aquí los espacios más populares
            </p>
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" className="group" asChild>
              <Link to="/spaces">
                Explorar Espacios
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Espacios Destacados
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre los espacios más populares y mejor valorados por nuestros clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredSpaces.map((space) => {
            try {
              console.log('🏢 Converting space:', space);
              const venueCardData = convertToVenueCard(space);
              console.log('🎯 Converted venue card data:', venueCardData);
              
              // Debug: mostrar datos en dev
              if (process.env.NODE_ENV === 'development') {
                console.log('Space price_per_hour:', space.price_per_hour, typeof space.price_per_hour);
                console.log('Converted price:', venueCardData.price, typeof venueCardData.price);
              }
              
              return <VenueCard key={space.id} {...venueCardData} />;
            } catch (error) {
              console.error('❌ Error rendering space card:', error, space);
              return (
                <div key={space.id || Math.random()} className="p-4 border border-red-300 rounded-lg bg-red-50">
                  <p className="text-red-600 text-sm">Error cargando espacio</p>
                  <p className="text-red-400 text-xs">{space.name || 'Nombre no disponible'}</p>
                </div>
              );
            }
          })}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="group" asChild>
            <Link to="/spaces">
              Ver Todos los Espacios
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpaces;