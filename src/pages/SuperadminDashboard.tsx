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
  Calendar,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { spacesClient } from "@/lib/spacesClient";
import { authClient } from "@/lib/authClient";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SuperadminDashboard = () => {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    spaceId: number | null;
    spaceName: string;
  }>({
    isOpen: false,
    spaceId: null,
    spaceName: ""
  });
  const [pendingDialog, setPendingDialog] = useState<{
    isOpen: boolean;
    spaceId: number | null;
    spaceName: string;
  }>({
    isOpen: false,
    spaceId: null,
    spaceName: ""
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingReason, setPendingReason] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/superadmin/login");
      return;
    }

    // Verificar que el usuario tenga rol de superadmin
    if (user.role !== 'superadmin') {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Cargar datos iniciales
    loadSpacesAndStats();
  }, [user, navigate]);

  const loadSpacesAndStats = async () => {
    setIsLoading(true);
    try {
      // Configurar tokens
      const tokens = authClient.getStoredTokens();
      if (tokens?.access_token) {
        spacesClient.setToken(tokens.access_token);
      }

      // Cargar estadísticas y espacios
      const [dashboardStats, spacesResponse] = await Promise.all([
        spacesClient.getDashboardStats(),
        spacesClient.getUserSpaces(1, 1000, true) // Cargar todos los espacios
      ]);

      setStats(dashboardStats);
      setSpaces(spacesResponse.data || []);

      console.log('📊 Superadmin dashboard cargado:', {
        stats: dashboardStats,
        spacesCount: spacesResponse.data?.length || 0
      });

    } catch (error) {
      console.error('❌ Error cargando datos del superadmin:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (spaceId: number, spaceName: string) => {
    setIsLoading(true);
    try {
      const response = await spacesClient.approveSpace(spaceId);
      
      if (response.success) {
        // Actualizar el estado local
        setSpaces(prev => prev.map(space => 
          space.id_space === spaceId 
            ? { ...space, status: "approved" }
            : space
        ));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1
        }));
        
        toast({
          title: "Espacio aprobado",
          description: `${spaceName} ha sido aprobado exitosamente.`,
        });
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error aprobando espacio:', error);
      toast({
        title: "Error",
        description: "Hubo un error al aprobar el espacio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.spaceId) return;
    
    setIsLoading(true);
    try {
      const response = await spacesClient.rejectSpace(
        rejectDialog.spaceId, 
        rejectionReason || "No especificado"
      );
      
      if (response.success) {
        // Actualizar el estado local
        setSpaces(prev => prev.map(space => 
          space.id_space === rejectDialog.spaceId 
            ? { ...space, status: "rejected", rejection_reason: rejectionReason }
            : space
        ));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1
        }));
        
        toast({
          title: "Espacio rechazado",
          description: `${rejectDialog.spaceName} ha sido rechazado.`,
          variant: "destructive",
        });
        
        // Cerrar dialog
        setRejectDialog({ isOpen: false, spaceId: null, spaceName: "" });
        setRejectionReason("");
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error rechazando espacio:', error);
      toast({
        title: "Error",
        description: "Hubo un error al rechazar el espacio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPending = async () => {
    if (!pendingDialog.spaceId) return;
    
    setIsLoading(true);
    try {
      const response = await spacesClient.markAsPending(
        pendingDialog.spaceId, 
        reviewReason || "Requiere revisión adicional"
      );
      
      if (response.success) {
        // Actualizar el estado local
        setSpaces(prev => prev.map(space => 
          space.id_space === pendingDialog.spaceId 
            ? { ...space, status: "pending", review_reason: reviewReason }
            : space
        ));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          approved: prev.approved - 1,
          pending: prev.pending + 1
        }));
        
        toast({
          title: "Espacio marcado como pendiente",
          description: `${pendingDialog.spaceName} requiere revisión nuevamente.`,
        });
        
        // Cerrar dialog
        setPendingDialog({ isOpen: false, spaceId: null, spaceName: "" });
        setReviewReason("");
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error marcando espacio como pendiente:', error);
      toast({
        title: "Error",
        description: "Hubo un error al marcar el espacio como pendiente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectDialog = (spaceId: number, spaceName: string) => {
    setRejectDialog({
      isOpen: true,
      spaceId,
      spaceName
    });
    setRejectionReason("");
  };

  const openPendingDialog = (spaceId: number, spaceName: string) => {
    setPendingDialog({
      isOpen: true,
      spaceId,
      spaceName
    });
    setReviewReason("");
  };

  const openDetailsDialog = (space: any) => {
    setSelectedSpace(space);
    setDetailsDialog(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleRefresh = async () => {
    await loadSpacesAndStats();
  };

  const filteredSpaces = filter === "all" 
    ? spaces 
    : spaces.filter(space => space.status === filter);

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

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
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                Todos ({stats.total})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Clock className="w-4 h-4 mr-1" />
                Pendientes ({stats.pending})
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprobados ({stats.approved})
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazados ({stats.rejected})
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
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
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {space.location || "Ubicación no especificada"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Capacidad: {space.max_capacity || 0} personas
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Enviado: {formatDate(space.created_at)}
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Propietario:</span> {space.owner_email || "No disponible"}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => openDetailsDialog(space)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalles
                          </Button>
                          
                          {space.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleApprove(space.id_space, space.space_name)}
                                disabled={isLoading}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprobar
                              </Button>
                              <Button
                                onClick={() => openRejectDialog(space.id_space, space.space_name)}
                                disabled={isLoading}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          
                          {space.status === "approved" && (
                            <Button
                              onClick={() => openPendingDialog(space.id_space, space.space_name)}
                              disabled={isLoading}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              <Clock className="w-4 h-4" />
                              Marcar como Pendiente
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog para rechazar espacio */}
        <Dialog open={rejectDialog.isOpen} onOpenChange={(open) => !open && setRejectDialog({ isOpen: false, spaceId: null, spaceName: "" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Espacio</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres rechazar "{rejectDialog.spaceName}"?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Motivo del rechazo (opcional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Explica por qué este espacio no cumple con los requisitos..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialog({ isOpen: false, spaceId: null, spaceName: "" })}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading}
              >
                {isLoading ? "Rechazando..." : "Rechazar Espacio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para marcar espacio como pendiente */}
        <Dialog open={pendingDialog.isOpen} onOpenChange={(open) => !open && setPendingDialog({ isOpen: false, spaceId: null, spaceName: "" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como Pendiente</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres marcar "{pendingDialog.spaceName}" como pendiente para re-revisión?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pending-reason">Motivo para revisión (opcional)</Label>
                <Textarea
                  id="pending-reason"
                  placeholder="Explica por qué este espacio necesita ser revisado nuevamente..."
                  value={pendingReason}
                  onChange={(e) => setPendingReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPendingDialog({ isOpen: false, spaceId: null, spaceName: "" })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleMarkAsPending}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isLoading ? "Marcando..." : "Marcar como Pendiente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para ver detalles del espacio */}
        <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Espacio</DialogTitle>
              <DialogDescription>
                Información completa sobre el espacio pendiente de aprobación
              </DialogDescription>
            </DialogHeader>
            {selectedSpace && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSpace.space_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSpace.space_type}</p>
                </div>
                
                <div>
                  <Label>Descripción</Label>
                  <p className="mt-1 text-sm">{selectedSpace.description || "Sin descripción"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Capacidad máxima</Label>
                    <p className="mt-1 text-sm">{selectedSpace.max_capacity} personas</p>
                  </div>
                  <div>
                    <Label>Precio por hora</Label>
                    <p className="mt-1 text-sm">${selectedSpace.price_per_hour?.toLocaleString()} COP</p>
                  </div>
                </div>
                
                <div>
                  <Label>Ubicación</Label>
                  <p className="mt-1 text-sm">{selectedSpace.location}</p>
                </div>
                
                {selectedSpace.amenities && selectedSpace.amenities.length > 0 && (
                  <div>
                    <Label>Amenidades</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSpace.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="secondary">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label>Propietario</Label>
                  <p className="mt-1 text-sm">{selectedSpace.owner_email}</p>
                </div>
                
                <div>
                  <Label>Fecha de solicitud</Label>
                  <p className="mt-1 text-sm">{formatDate(selectedSpace.created_at)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialog(false)}>
                Cerrar
              </Button>
              {selectedSpace?.status === "pending" && (
                <>
                  <Button
                    onClick={() => {
                      setDetailsDialog(false);
                      handleApprove(selectedSpace.id_space, selectedSpace.space_name);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsDialog(false);
                      openRejectDialog(selectedSpace.id_space, selectedSpace.space_name);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuperadminDashboard;