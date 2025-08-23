import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="md" className="text-white" />
            <p className="text-white/80 text-sm leading-relaxed">
              La plataforma líder para encontrar y reservar espacios únicos para tus eventos especiales.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Buscar Espacios
              </a>
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Categorías
              </a>
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Para Empresas
              </a>
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Publicar Espacio
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Soporte</h4>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Centro de Ayuda
              </a>
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Términos de Servicio
              </a>
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Política de Privacidad
              </a>
              <a href="#" className="block text-white/80 hover:text-white transition-colors text-sm">
                Contacto
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@evently.com.co</span>
              </div>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <Phone className="w-4 h-4" />
                <span>+57 316 789 4567</span>
              </div>
              <div className="flex items-start gap-3 text-white/80 text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Armenia, Quindío - Colombia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 Evently. Todos los derechos reservados.
            </p>
            <p className="text-white/60 text-sm flex items-center gap-1 mt-4 md:mt-0">
              Hecho con <Heart className="w-4 h-4 text-red-500" /> para eventos únicos
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;