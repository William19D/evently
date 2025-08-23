import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, User, Menu, Calendar, MapPin, ChevronDown, Building2 } from "lucide-react";
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
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              Quién Somos
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contacto
            </Link>
            <Link to="/faq" className="text-foreground hover:text-primary transition-colors font-medium">
              Preguntas Frecuentes
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="font-medium" asChild>
              <Link to="/publish-space">Publicar Espacio</Link>
            </Button>
            
            {/* Login Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Iniciar Sesión
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border shadow-lg" align="end">
                <DropdownMenuItem asChild>
                  <Link to="/login/client" className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-medium">Soy Cliente</div>
                      <div className="text-xs text-muted-foreground">Busco espacios para eventos</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/login/owner" className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-medium">Soy Propietario</div>
                      <div className="text-xs text-muted-foreground">Tengo espacios para alquilar</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem asChild>
                  <Link to="/register-selection" className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-4 h-4" />
                    <div className="text-sm">¿No tienes cuenta? Regístrate</div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <Link to="/about" className="text-foreground hover:text-primary transition-colors py-2">
                Quién Somos
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors py-2">
                Contacto
              </Link>
              <Link to="/faq" className="text-foreground hover:text-primary transition-colors py-2">
                Preguntas Frecuentes
              </Link>
              <div className="pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start mb-2" asChild>
                  <Link to="/publish-space">Publicar Espacio</Link>
                </Button>
                
                {/* Mobile Login Options */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground px-2">Iniciar Sesión</div>
                  <Link to="/login/client">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Soy Cliente
                    </Button>
                  </Link>
                  <Link to="/login/owner">
                    <Button variant="outline" className="w-full justify-start">
                      <Building2 className="w-4 h-4 mr-2" />
                      Soy Propietario
                    </Button>
                  </Link>
                  <Link to="/register-selection" className="block">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground text-sm">
                      ¿No tienes cuenta? Regístrate
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;