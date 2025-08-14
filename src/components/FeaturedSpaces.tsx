import VenueCard from "./VenueCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { sampleEvents } from "@/data/events";

const FeaturedSpaces = () => {
  // Use sample events data
  const featuredVenues = sampleEvents.map(event => ({
    id: event.id,
    name: event.title,
    location: `${event.location.city}, ${event.location.department}`,
    image: event.image,
    price: event.price,
    rating: event.rating,
    capacity: `Hasta ${event.capacity} personas`,
    amenities: event.amenities.slice(0, 3),
    featured: true
  }));

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
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} {...venue} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="group" asChild>
            <Link to="/search">
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