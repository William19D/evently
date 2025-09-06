import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, User, Menu, Calendar, MapPin, ChevronDown, Building2, LogOut, Shield, Settings, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isMfaEnabled, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/search" 
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Calendar className="w-4 h-4 mr-1" />
                  Categorías
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/search?category=conferences">Conferencias</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/search?category=weddings">Bodas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/search?category=corporate">Corporativo</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/search?category=social">Social</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              to="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Nosotros
            </Link>

            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:block">{getUserDisplayName()}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    
                    {user.role === 'owner' && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link to="/mfa-setup" className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        <span>MFA {isMfaEnabled ? '(Activo)' : '(Inactivo)'}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Configuración
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Login Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <span>Iniciar Sesión</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/login/client" className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Como Cliente
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/login/owner" className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Como Propietario
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Register Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="flex items-center space-x-1">
                      <span>Registrarse</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/register/client" className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Como Cliente
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register/owner" className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Como Propietario
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              <Link
                to="/search"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Buscar Espacios
              </Link>
              
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Categorías</p>
                <div className="space-y-1 ml-4">
                  <Link
                    to="/search?category=conferences"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Conferencias
                  </Link>
                  <Link
                    to="/search?category=weddings"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bodas
                  </Link>
                  <Link
                    to="/search?category=corporate"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Corporativo
                  </Link>
                  <Link
                    to="/search?category=social"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Social
                  </Link>
                </div>
              </div>

              <Link
                to="/about"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Nosotros
              </Link>

              <Link
                to="/contact"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>

              {!user && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Iniciar Sesión</p>
                    <div className="space-y-1 ml-4">
                      <Link
                        to="/login/client"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Como Cliente
                      </Link>
                      <Link
                        to="/login/owner"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Como Propietario
                      </Link>
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Registrarse</p>
                    <div className="space-y-1 ml-4">
                      <Link
                        to="/register/client"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Como Cliente
                      </Link>
                      <Link
                        to="/register/owner"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Como Propietario
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;