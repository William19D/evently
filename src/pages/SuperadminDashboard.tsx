import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Users, 
  Building2,
  AlertCircle,
  LogOut,
  Eye,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - reemplazar con datos reales
const mockSpaces = [
  {
    id: 1,
    space_name: "Salón de Eventos El Dorado",
    location: "Bogotá, Colombia",
    max_capacity: 200,
    status: "pending",
    description: "Elegante salón con vista panorámica, ideal para bodas y eventos corporativos.",
    owner_email: "owner1@example.com",
    submitted_at: "2025-01-05"
  },
  {
    id: 2,
    space_name: "Terraza Garden Club",
    location: "Medellín, Colombia", 
    max_capacity: 150,
    status: "pending",
    description: "Hermosa terraza al aire libre con jardín, perfecta para celebraciones íntimas.",
    owner_email: "owner2@example.com",
    submitted_at: "2025-01-04"
  },
  {
    id: 3,
    space_name: "Centro de Convenciones Plaza",
    location: "Cali, Colombia",
    max_capacity: 500,
    status: "approved",
    description: "Amplio centro de convenciones con tecnología de última generación.",
    owner_email: "owner3@example.com",
    submitted_at: "2025-01-03"
  }
];

const SuperadminDashboard = () => {
  const [spaces, setSpaces] = useState(mockSpaces);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/superadmin/login");
    }
  }, [user, navigate]);

  const handleApprove = async (spaceId: number) => {
    setIsLoading(true);
    try {
      // Aquí iría la lógica para aprobar el espacio
      setSpaces(prev => prev.map(space => 
        space.id === spaceId 
          ? { ...space, status: "approved" }
          : space
      ));
      
      toast({
        title: "Espacio aprobado",
        description: "El espacio ha sido aprobado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al aprobar el espacio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (spaceId: number) => {
    setIsLoading(true);
    try {
      // Aquí iría la lógica para rechazar el espacio
      setSpaces(prev => prev.map(space => 
        space.id === spaceId 
          ? { ...space, status: "rejected" }
          : space
      ));
      
      toast({
        title: "Espacio rechazado",
        description: "El espacio ha sido rechazado.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al rechazar el espacio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const filteredSpaces = filter === "all" 
    ? spaces 
    : spaces.filter(space => space.status === filter);

  const pendingCount = spaces.filter(space => space.status === "pending").length;
  const approvedCount = spaces.filter(space => space.status === "approved").length;
  const rejectedCount = spaces.filter(space => space.status === "rejected").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Panel Superadministrador</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{spaces.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Espacios</CardTitle>
            <CardDescription>
              Revisar y gestionar solicitudes de publicación de espacios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                Todos ({spaces.length})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Clock className="w-4 h-4 mr-1" />
                Pendientes ({pendingCount})
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprobados ({approvedCount})
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazados ({rejectedCount})
              </Button>
            </div>

            {/* Spaces List */}
            <div className="space-y-4">
              {filteredSpaces.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay espacios {filter === "all" ? "" : filter === "pending" ? "pendientes" : filter === "approved" ? "aprobados" : "rechazados"} en este momento.
                  </AlertDescription>
                </Alert>
              ) : (
                filteredSpaces.map((space) => (
                  <Card key={space.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{space.space_name}</h3>
                            {getStatusBadge(space.status)}
                          </div>
                          
                          <p className="text-muted-foreground">{space.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {space.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Capacidad: {space.max_capacity} personas
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Enviado: {space.submitted_at}
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Propietario:</span> {space.owner_email}
                          </div>
                        </div>

                        {space.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalles
                            </Button>
                            <Button
                              onClick={() => handleApprove(space.id)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => handleReject(space.id)}
                              disabled={isLoading}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminDashboard;