import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simulated data
  const ownerData = {
    name: "María González",
    email: "maria@example.com",
    phone: "+57 300 123 4567",
    memberSince: "Enero 2023",
    totalSpaces: 3,
    totalBookings: 47,
    monthlyRevenue: 2850000,
    rating: 4.8
  };

  const spaces = [
    {
      id: 1,
      name: "Salón Elegante Centro",
      location: "Chapinero, Bogotá",
      capacity: 150,
      price: 250000,
      status: "Activo",
      bookings: 12,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Terraza Vista Panorámica",
      location: "Zona Rosa, Bogotá",
      capacity: 80,
      price: 180000,
      status: "Activo",
      bookings: 8,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Jardín Botánico Privado",
      location: "La Candelaria, Bogotá",
      capacity: 200,
      price: 320000,
      status: "Pendiente",
      bookings: 0,
      rating: 0,
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop"
    }
  ];

  const recentBookings = [
    {
      id: 1,
      spaceName: "Salón Elegante Centro",
      clientName: "Ana Rodríguez",
      date: "2024-01-15",
      status: "Confirmada",
      amount: 500000
    },
    {
      id: 2,
      spaceName: "Terraza Vista Panorámica",
      clientName: "Carlos Mendoza",
      date: "2024-01-20",
      status: "Pendiente",
      amount: 360000
    },
    {
      id: 3,
      spaceName: "Salón Elegante Centro",
      clientName: "Sofía López",
      date: "2024-01-25",
      status: "Completada",
      amount: 750000
    }
  ];

  const handleEditSpace = (spaceId: number) => {
    toast({
      title: "Función en desarrollo",
      description: "La edición de espacios estará disponible pronto."
    });
  };

  const handleDeleteSpace = (spaceId: number) => {
    toast({
      title: "Espacio eliminado",
      description: "El espacio ha sido eliminado exitosamente."
    });
  };

  const handleViewSpace = (spaceId: number) => {
    navigate(`/event/${spaceId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Inactivo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Completada":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
                  {ownerData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  ¡Hola, {ownerData.name.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">
                  Miembro desde {ownerData.memberSince}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/publish-space")}
              className="bg-gradient-primary hover:opacity-90"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publicar Nuevo Espacio
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Espacios Activos</p>
                    <p className="text-3xl font-bold text-foreground">{ownerData.totalSpaces}</p>
                  </div>
                  <div className="bg-gradient-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reservas Totales</p>
                    <p className="text-3xl font-bold text-foreground">{ownerData.totalBookings}</p>
                  </div>
                  <div className="bg-gradient-primary/10 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${ownerData.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-primary/10 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Calificación</p>
                    <div className="flex items-center gap-1">
                      <p className="text-3xl font-bold text-foreground">{ownerData.rating}</p>
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                  </div>
                  <div className="bg-gradient-primary/10 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="spaces" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spaces" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Mis Espacios
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            {/* Spaces Tab */}
            <TabsContent value="spaces">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {spaces.map((space) => (
                  <Card key={space.id} className="shadow-card hover:shadow-elegant transition-shadow">
                    <div className="relative">
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${getStatusColor(space.status)}`}
                      >
                        {space.status}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{space.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {space.location}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{space.rating || "N/A"}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Capacidad:</span>
                          <span>{space.capacity} personas</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Precio/hora:</span>
                          <span className="font-semibold">${space.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reservas:</span>
                          <span>{space.bookings} este mes</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSpace(space.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSpace(space.id)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSpace(space.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Reservas Recientes</CardTitle>
                  <CardDescription>
                    Gestiona las reservas de tus espacios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{booking.spaceName}</p>
                              <p className="text-sm text-muted-foreground">Cliente: {booking.clientName}</p>
                              <p className="text-sm text-muted-foreground">Fecha: {booking.date}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${booking.amount.toLocaleString()}</p>
                            <Badge className={getBookingStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contactar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Ingresos por Mes</CardTitle>
                    <CardDescription>Evolución de tus ingresos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Gráfico de ingresos</p>
                        <p className="text-sm">(Funcionalidad en desarrollo)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Reservas por Espacio</CardTitle>
                    <CardDescription>Popularidad de tus espacios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {spaces.map((space) => (
                        <div key={space.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{space.name}</p>
                            <p className="text-sm text-muted-foreground">{space.bookings} reservas</p>
                          </div>
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-primary h-2 rounded-full"
                              style={{ width: `${(space.bookings / 15) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OwnerDashboard;