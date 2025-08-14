import { Button } from "@/components/ui/button";
import { Search, User, Menu, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
              Evently
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Espacios
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Categorías
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Para Empresas
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="font-medium">
              Publicar Espacio
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <Link to="/login">
                <User className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-foreground hover:text-primary transition-colors py-2">
                Espacios
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors py-2">
                Categorías
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors py-2">
                Para Empresas
              </a>
              <div className="pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start mb-2">
                  Publicar Espacio
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/login">
                    <User className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;