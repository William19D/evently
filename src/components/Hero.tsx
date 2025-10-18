import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-venue.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
            Encuentra el espacio perfecto para tu
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              evento único
            </span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Descubre espacios únicos para bodas, conferencias, celebraciones y eventos corporativos
          </p>

          {/* Search Form */}
          <div className="mt-8 bg-card/95 backdrop-blur-sm rounded-2xl shadow-elegant p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Armenia, Bogotá, Medellín..." 
                    className="pl-10 h-12 rounded-xl border-border/50"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    type="date" 
                    className="pl-10 h-12 rounded-xl border-border/50"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Capacidad</label>
                <Select>
                  <SelectTrigger className="h-12 rounded-xl border-border/50">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Personas" />
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

              {/* Search Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-transparent">Buscar</label>
                <Button variant="hero" size="lg" className="w-full h-12" asChild>
                  <Link to="/search">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Espacios
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;