import VenueCard from "./VenueCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedSpaces = () => {
  // Mock data for featured venues
  const featuredVenues = [
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
    }
  ];

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
          <Button variant="outline" size="lg" className="group">
            Ver Todos los Espacios
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpaces;