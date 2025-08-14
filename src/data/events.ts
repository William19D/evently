import { Event } from "@/types/event";

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Salón de Eventos El Dorado - Bogotá",
    description: "Elegante salón para eventos corporativos y sociales en el corazón de Bogotá. Ubicado en la Zona Rosa, perfecto para conferencias, bodas y celebraciones empresariales.",
    image: "/hero-venue.jpg",
    category: "Salón de eventos",
    date: "2025-09-15",
    time: "18:00 - 23:00",
    price: 2500000,
    capacity: 150,
    rating: 4.8,
    reviews: 127,
    location: {
      address: "Carrera 13 # 93-40, Zona Rosa",
      city: "Bogotá",
      department: "Cundinamarca",
      coordinates: {
        lat: 4.6784,
        lng: -74.0511
      }
    },
    organizer: {
      name: "Eventos Premium Colombia",
      avatar: "/placeholder.svg",
      rating: 4.9,
      events: 245
    },
    amenities: [
      "WiFi gratuito",
      "Parqueadero",
      "Sistema de sonido",
      "Fotografía permitida",
      "Catering disponible",
      "Seguridad privada"
    ],
    includes: [
      "Salón principal con capacidad para 150 personas",
      "Sistema de sonido profesional",
      "Iluminación LED personalizable",
      "Proyector y pantalla gigante",
      "Mobiliario completo (mesas y sillas)",
      "Servicio de limpieza",
      "Coordinador de eventos"
    ],
    rules: [
      "No se permite fumar en el interior",
      "Prohibido el ingreso de mascotas",
      "No se permite música después de las 11:00 PM",
      "Capacidad máxima estrictamente respetada",
      "Decoración debe ser aprobada previamente"
    ],
    gallery: [
      "/hero-venue.jpg",
      "/auditorium-venue.jpg",
      "/garden-venue.jpg",
      "/terrace-venue.jpg"
    ],
    availability: {}
  },
  {
    id: "2", 
    title: "Hacienda Villa de Leyva - Eventos Campestres",
    description: "Hermosa hacienda colonial en Villa de Leyva, ideal para bodas, retreats corporativos y eventos al aire libre. Rodeada de paisajes naturales y arquitectura colonial auténtica.",
    image: "/garden-venue.jpg",
    category: "Hacienda",
    date: "2025-10-20",
    time: "10:00 - 22:00",
    price: 4500000,
    capacity: 200,
    rating: 4.9,
    reviews: 89,
    location: {
      address: "Vereda Monquirá, Km 3 Vía Villa de Leyva",
      city: "Villa de Leyva",
      department: "Boyacá",
      coordinates: {
        lat: 5.6342,
        lng: -73.5264
      }
    },
    organizer: {
      name: "Haciendas Coloniales S.A.S",
      avatar: "/placeholder.svg",
      rating: 4.8,
      events: 156
    },
    amenities: [
      "WiFi gratuito",
      "Parqueadero amplio",
      "Jardines naturales",
      "Capilla colonial",
      "Catering gourmet",
      "Alojamiento disponible"
    ],
    includes: [
      "Uso de hacienda completa por 12 horas",
      "Jardines y espacios exteriores",
      "Capilla colonial para ceremonias",
      "Mobiliario rústico completo",
      "Fogata nocturna",
      "Servicio de limpieza completo",
      "Coordinador especializado en bodas"
    ],
    rules: [
      "Evento debe finalizar antes de las 10:00 PM",
      "Prohibido fuegos artificiales",
      "Respetar el entorno natural",
      "No se permite música con volumen alto después de las 9:00 PM",
      "Decoración debe ser eco-friendly"
    ],
    gallery: [
      "/garden-venue.jpg",
      "/hero-venue.jpg",
      "/terrace-venue.jpg",
      "/auditorium-venue.jpg"
    ],
    availability: {}
  },
  {
    id: "3",
    title: "Centro de Convenciones Cartagena",
    description: "Moderno centro de convenciones en el corazón histórico de Cartagena. Perfecto para congresos, ferias comerciales y eventos internacionales con todas las comodidades.",
    image: "/auditorium-venue.jpg", 
    category: "Centro de convenciones",
    date: "2025-11-08",
    time: "08:00 - 18:00",
    price: 8500000,
    capacity: 500,
    rating: 4.7,
    reviews: 203,
    location: {
      address: "Avenida Venezuela, Centro Histórico",
      city: "Cartagena",
      department: "Bolívar",
      coordinates: {
        lat: 10.4236,
        lng: -75.5378
      }
    },
    organizer: {
      name: "Convenciones del Caribe",
      avatar: "/placeholder.svg",
      rating: 4.6,
      events: 312
    },
    amenities: [
      "WiFi de alta velocidad",
      "Parqueadero VIP",
      "Sistema audiovisual HD",
      "Traducción simultánea",
      "Catering internacional",
      "Seguridad 24/7"
    ],
    includes: [
      "Auditorio principal para 500 personas",
      "5 salas de reuniones adicionales",
      "Equipos audiovisuales completos",
      "Servicio de traducción",
      "Coffee breaks incluidos",
      "Personal técnico especializado",
      "Coordinación logística completa"
    ],
    rules: [
      "Registro de asistentes obligatorio",
      "Cumplir protocolos de bioseguridad",
      "No se permite comida externa",
      "Uso de identificación durante el evento",
      "Respetar horarios establecidos"
    ],
    gallery: [
      "/auditorium-venue.jpg",
      "/hero-venue.jpg",
      "/garden-venue.jpg",
      "/terrace-venue.jpg"
    ],
    availability: {}
  },
  {
    id: "4",
    title: "Terraza Rooftop Medellín - Vista Panorámica",
    description: "Espectacular terraza en el piso 25 con vista 360° de Medellín. Ideal para eventos de networking, lanzamientos de productos y celebraciones exclusivas.",
    image: "/terrace-venue.jpg",
    category: "Terraza",
    date: "2025-12-14",
    time: "19:00 - 01:00",
    price: 3200000,
    capacity: 80,
    rating: 4.9,
    reviews: 156,
    location: {
      address: "Carrera 43A # 16-45, El Poblado",
      city: "Medellín",
      department: "Antioquia", 
      coordinates: {
        lat: 6.2088,
        lng: -75.5756
      }
    },
    organizer: {
      name: "Sky Events Medellín",
      avatar: "/placeholder.svg",
      rating: 4.8,
      events: 134
    },
    amenities: [
      "WiFi gratuito",
      "Vista panorámica 360°",
      "Barra completa",
      "DJ profesional",
      "Iluminación ambiental",
      "Servicio valet parking"
    ],
    includes: [
      "Terraza completa por 6 horas",
      "Barra libre premium incluida",
      "DJ y equipo de sonido",
      "Iluminación LED personalizable",
      "Mobiliario lounge moderno",
      "Servicio de meseros",
      "Seguridad privada"
    ],
    rules: [
      "Código de vestimenta casual elegante",
      "No se permite fumar en área cerrada",
      "Respetar niveles de ruido después de medianoche",
      "Capacidad máxima de 80 personas",
      "Prohibido decoraciones con fuego"
    ],
    gallery: [
      "/terrace-venue.jpg",
      "/hero-venue.jpg",
      "/auditorium-venue.jpg",
      "/garden-venue.jpg"
    ],
    availability: {}
  }
];

export const getEventById = (id: string): Event | undefined => {
  return sampleEvents.find(event => event.id === id);
};
