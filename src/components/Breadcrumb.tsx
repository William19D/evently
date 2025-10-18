import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  const location = useLocation();

  // Generar breadcrumbs automáticamente basado en la ruta si no se proporcionan items
  const generateAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', href: '/' }
    ];

    // Mapeo de rutas a nombres amigables
    const routeNames: Record<string, string> = {
      'spaces': 'Espacios Públicos',
      'events': 'Eventos',
      'about': 'Acerca de',
      'contact': 'Contacto',
      'faq': 'Preguntas Frecuentes',
      'login': 'Iniciar Sesión',
      'register': 'Registrarse',
      'profile': 'Mi Perfil',
      'dashboard': 'Panel de Control',
      'owner': 'Propietario',
      'superadmin': 'Superadministrador',
      'auth': 'Autenticación',
      'verification': 'Verificación',
      'recover': 'Recuperar Contraseña',
      'mfa': 'Autenticación de Dos Factores',
      'setup': 'Configuración',
      'publish': 'Publicar Espacio',
      'client': 'Cliente',
      'venue': 'Lugar',
      'search': 'Búsqueda',
      'details': 'Detalles'
    };

    // Rutas especiales que necesitan manejo personalizado
    const specialRoutes: Record<string, (segments: string[]) => string> = {
      'owner': (segments) => {
        if (segments.includes('dashboard')) return 'Panel del Propietario';
        if (segments.includes('login')) return 'Login de Propietario';
        return 'Propietario';
      },
      'superadmin': (segments) => {
        if (segments.includes('dashboard')) return 'Panel de Superadmin';
        if (segments.includes('login')) return 'Login de Superadmin';
        return 'Superadministrador';
      },
      'client': (segments) => {
        if (segments.includes('register')) return 'Registro de Cliente';
        if (segments.includes('login')) return 'Login de Cliente';
        return 'Cliente';
      }
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Si es un ID numérico, usar el nombre del segmento anterior + "Detalle"
      if (/^\d+$/.test(segment)) {
        const previousSegment = pathSegments[index - 1];
        const baseName = routeNames[previousSegment] || previousSegment;
        breadcrumbs.push({
          label: `${baseName} - Detalle`,
          href: isLast ? undefined : currentPath,
          isActive: isLast
        });
      } else {
        // Manejar rutas especiales
        let label = '';
        if (specialRoutes[segment]) {
          label = specialRoutes[segment](pathSegments);
        } else {
          label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        }
        
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
          isActive: isLast
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateAutoBreadcrumbs();

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            
            {index === 0 && (
              <Home className="w-4 h-4 text-gray-500 mr-1" />
            )}
            
            {item.href && !item.isActive ? (
              <Link
                to={item.href}
                className="text-gray-600 hover:text-[#f1893f] transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`${
                  item.isActive 
                    ? 'text-[#f1893f] font-semibold' 
                    : 'text-gray-500'
                }`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;