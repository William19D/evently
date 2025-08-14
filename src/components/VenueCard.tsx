import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Wifi, Car, Coffee } from "lucide-react";
import { Link } from "react-router-dom";

interface VenueCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  capacity: string;
  amenities: string[];
  featured?: boolean;
}

const VenueCard = ({ 
  id,
  name, 
  location, 
  image, 
  price, 
  rating, 
  capacity, 
  amenities, 
  featured = false 
}: VenueCardProps) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-3 h-3" />;
      case 'parking':
        return <Car className="w-3 h-3" />;
      case 'catering':
        return <Coffee className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
      <div className="relative">
        {featured && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground font-semibold">
            Destacado
          </Badge>
        )}
        <div 
          className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {location}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{capacity}</span>
        </div>

        <div className="flex items-center gap-2">
          {amenities.slice(0, 3).map((amenity, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
          {amenities.length > 3 && (
            <span className="text-xs text-muted-foreground">+{amenities.length - 3} más</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">por evento</div>
          </div>
          <Link to={`/event/${id}`}>
            <Button size="sm" className="shadow-soft hover:shadow-card">
              Ver Detalles
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueCard;