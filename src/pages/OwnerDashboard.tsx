import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { spacesClient } from "@/lib/spacesClient";
import { authClient } from "@/lib/authClient";
import { toast } from 'sonner';
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
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  Clock,
  Star,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isFullyAuthenticated } = useAuth();

  // Constantes para el formulario
  const spaceTypes = [
    { value: "salon_eventos", label: "Salón de eventos" },
    { value: "auditorio", label: "Auditorio" },
    { value: "salon_conferencias", label: "Salón de conferencias" },
    { value: "terraza", label: "Terraza" },
    { value: "salon_banquetes", label: "Salón de banquetes" },
    { value: "espacio_coworking", label: "Espacio de coworking" },
    { value: "galeria_arte", label: "Galería de arte" },
    { value: "estudio_fotografia", label: "Estudio de fotografía" },
    { value: "salon_fiestas", label: "Salón de fiestas" },
    { value: "jardin_eventos", label: "Jardín de eventos" },
    { value: "rooftop", label: "Rooftop" },
    { value: "salon_corporativo", label: "Salón corporativo" },
    { value: "otro", label: "Otro" }
  ];

  const predefinedAmenities = [
    "WiFi gratuito", "Aire acondicionado", "Calefacción", "Sistema de sonido",
    "Proyector", "Pantalla", "Micrófono", "Iluminación ajustable",
    "Cocina equipada", "Baño privado", "Estacionamiento", "Acceso para discapacitados",
    "Seguridad 24/7", "Mobiliario incluido", "Decoración personalizable", "Terraza"
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [lastLoadSource, setLastLoadSource] = useState<'server' | 'cache' | null>(null);
  const [allSpaces, setAllSpaces] = useState([]); // Cache local de todos los espacios
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // 🔥 EFECTO PRINCIPAL: Solo para autenticación y carga inicial
  useEffect(() => {
    // Verificar autenticación
    if (!isFullyAuthenticated()) {
      console.log('⚠️ User not fully authenticated, redirecting to login');
      navigate('/login-selection');
      return;
    }

    // Solo cargar datos en el mount inicial
    loadAllSpaces();
  }, [user, isFullyAuthenticated, navigate]);

  // 🔥 EFECTO SEPARADO: Solo para filtrado local cuando cambia el filtro o página
  useEffect(() => {
    if (allSpaces.length > 0) {
      filterAndPaginateSpaces();
    }
  }, [selectedStatus, currentPage, allSpaces]);

  // 📥 Cargar TODOS los espacios una sola vez
  const loadAllSpaces = async (forceRefresh: boolean = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Configurar token en el cliente
      const tokens = authClient.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error('No hay token de acceso');
      }
      
      spacesClient.setToken(tokens.access_token);
      
      console.log('📊 Loading ALL spaces (one time only)...', { forceRefresh });

      // Cargar estadísticas y TODOS los espacios de una vez
      const [dashboardStats, spacesResponse] = await Promise.all([
        spacesClient.getDashboardStats(),
        spacesClient.getUserSpaces(1, 1000, forceRefresh) // Obtener TODOS
      ]);

      setStats(dashboardStats);
      setAllSpaces(spacesResponse.data || []);

      // Determinar si se usó cache o servidor
      const cacheInfo = spacesClient.getCacheInfo();
      const usedCache = !forceRefresh && cacheInfo.isValid;
      setLastLoadSource(usedCache ? 'cache' : 'server');

      console.log('✅ ALL spaces loaded successfully', {
        stats: dashboardStats,
        totalSpacesCount: spacesResponse.data?.length || 0,
        usedCache,
        cacheAge: cacheInfo.ageMinutes
      });

    } catch (error) {
      console.error('❌ Error loading all spaces:', error);
      toast.error('Error al cargar los datos', {
        description: 'No se pudieron cargar tus espacios. Intenta recargar la página.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 Filtrar y paginar espacios localmente (SIN llamadas al servidor)
  const filterAndPaginateSpaces = () => {
    console.log('🔍 Filtering spaces locally...', { selectedStatus, currentPage });
    
    // Filtrar por estado
    let filteredSpaces = allSpaces;
    if (selectedStatus !== 'all') {
      filteredSpaces = allSpaces.filter(space => space.status === selectedStatus);
    }

    // Paginar
    const limit = 10;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSpaces = filteredSpaces.slice(startIndex, endIndex);

    setSpaces(paginatedSpaces);

    console.log('✅ Local filtering completed', {
      totalSpaces: allSpaces.length,
      filteredSpaces: filteredSpaces.length,
      currentPageSpaces: paginatedSpaces.length,
      filter: selectedStatus,
      page: currentPage
    });
  };

  const handleCreateSpace = () => {
    navigate('/publish-space');
  };

  // 👁️ Mostrar detalles completos del espacio
  const handleViewSpaceDetails = (space: any) => {
    setSelectedSpace(space);
    setIsSpaceModalOpen(true);
  };

  // ✏️ Editar espacio
  const handleEditSpace = (spaceId: number) => {
    const space = allSpaces.find((s: any) => s.id_space === spaceId);
    if (!space) {
      toast.error('Espacio no encontrado');
      return;
    }

    setEditingSpace(space);
    
    // Procesar amenidades de manera segura
    let processedAmenities = [];
    if (space.amenities && Array.isArray(space.amenities)) {
      processedAmenities = space.amenities
        .map((a: any) => {
          if (typeof a === 'string') return a;
          if (a && typeof a === 'object' && a.amenity_name) return a.amenity_name;
          if (a && typeof a === 'object' && a.name) return a.name;
          return null;
        })
        .filter(amenity => amenity && typeof amenity === 'string' && amenity.trim().length > 0);
    }

    setEditFormData({
      spaceName: space.space_name,
      spaceType: space.space_type,
      maxCapacity: space.max_capacity,
      pricePerHour: space.price_per_hour_cop,
      location: space.location,
      description: space.description,
      amenities: processedAmenities
    });
    setIsEditModalOpen(true);
  };

  // 💾 Guardar cambios del espacio editado
  const handleSaveEdit = async () => {
    if (!editingSpace) return;

    try {
      const tokens = authClient.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error('No hay token de acceso');
      }

      spacesClient.setToken(tokens.access_token);

      console.log('🔄 Updating space...', {
        spaceId: editingSpace.id_space,
        originalFormData: editFormData,
        originalAmenities: editFormData.amenities
      });

      // Limpiar y validar datos antes de enviar
      const cleanedData = {
        spaceName: editFormData.spaceName,
        spaceType: editFormData.spaceType,
        maxCapacity: editFormData.maxCapacity,
        pricePerHour: editFormData.pricePerHour,
        location: editFormData.location,
        description: editFormData.description,
        amenities: (editFormData.amenities && Array.isArray(editFormData.amenities))
          ? editFormData.amenities
              .filter(amenity => amenity && typeof amenity === 'string' && amenity.trim().length > 0)
              .map(amenity => amenity.trim())
          : []
      };

      console.log('🧹 Cleaned data:', {
        ...cleanedData,
        amenitiesDetail: {
          original: editFormData.amenities,
          cleaned: cleanedData.amenities,
          count: cleanedData.amenities.length
        }
      });

      const response = await spacesClient.updateSpace(editingSpace.id_space, cleanedData);

      if (response.success) {
        toast.success('Espacio actualizado', {
          description: `"${editFormData.spaceName}" ha sido actualizado exitosamente.`
        });

        // Actualizar el espacio en allSpaces
        setAllSpaces(prevSpaces => 
          prevSpaces.map((space: any) => 
            space.id_space === editingSpace.id_space 
              ? { ...space, ...response.data }
              : space
          )
        );

        // Actualizar estadísticas
        const dashboardStats = await spacesClient.getDashboardStats();
        setStats(dashboardStats);

        setIsEditModalOpen(false);
        setEditingSpace(null);
        setEditFormData({});
      }
    } catch (error) {
      console.error('❌ Error updating space:', error);
      toast.error('Error al actualizar espacio', {
        description: error instanceof Error ? error.message : 'No se pudo actualizar el espacio. Intenta de nuevo.'
      });
    }
  };

  // 🔄 Manejar cambios en el formulario de edición
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🏷️ Manejar cambios en amenidades
  const handleAmenitiesChange = (amenities: string[]) => {
    // Filtrar y limpiar amenidades para evitar valores null/undefined
    const cleanedAmenities = (amenities || [])
      .filter(amenity => amenity && typeof amenity === 'string' && amenity.trim().length > 0)
      .map(amenity => amenity.trim());
    
    setEditFormData(prev => ({
      ...prev,
      amenities: cleanedAmenities
    }));
  };

  const handleDeleteSpace = async (spaceId: number, spaceName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${spaceName}"?`)) {
      return;
    }

    try {
      const tokens = authClient.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error('No hay token de acceso');
      }
      
      spacesClient.setToken(tokens.access_token);
      
      await spacesClient.deleteSpace(spaceId);
      
      toast.success('Espacio eliminado', {
        description: `"${spaceName}" ha sido eliminado exitosamente.`
      });
      
      // 🔥 Actualizar estado local: eliminar el espacio de allSpaces
      setAllSpaces(prevSpaces => prevSpaces.filter(space => space.id_space !== spaceId));
      
      // Actualizar estadísticas también desde cache
      const dashboardStats = await spacesClient.getDashboardStats();
      setStats(dashboardStats);
      
      // filterAndPaginateSpaces se ejecutará automáticamente por el useEffect
      
    } catch (error) {
      console.error('❌ Error deleting space:', error);
      toast.error('Error al eliminar espacio', {
        description: 'No se pudo eliminar el espacio. Intenta de nuevo.'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Desconocido</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard del Propietario</h1>
              <p className="mt-2 text-gray-600">
                Bienvenido, {user?.name || 'Propietario'}. Gestiona tus espacios y revisa las estadísticas.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={handleCreateSpace} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Espacio
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Espacios</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Espacios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Publicados y activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                En revisión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">
                Necesitan ajustes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Spaces Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Mis Espacios</CardTitle>
                <CardDescription>
                  Gestiona y monitorea todos tus espacios registrados
                </CardDescription>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAllSpaces(true)}
                  disabled={isLoading}
                >
                  🔄 Actualizar
                </Button>
                <Tabs value={selectedStatus} onValueChange={(value: any) => {
                  console.log('🔄 Filtering locally to:', value, '(NO server request)');
                  setSelectedStatus(value);
                  setCurrentPage(1);
                  // El filtrado se hace automáticamente por el useEffect que escucha selectedStatus
                  // ESTO NO HACE LLAMADAS AL SERVIDOR - solo filtra allSpaces localmente
                }} className="w-full md:w-auto">
                  <TabsList className="grid w-full md:w-auto grid-cols-4">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="approved">Aprobados</TabsTrigger>
                    <TabsTrigger value="pending">Pendientes</TabsTrigger>
                    <TabsTrigger value="rejected">Rechazados</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {spaces.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {selectedStatus === 'all' ? 'No hay espacios' : `No hay espacios ${selectedStatus === 'approved' ? 'aprobados' : selectedStatus === 'pending' ? 'pendientes' : 'rechazados'}`}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedStatus === 'all' ? 'Comienza agregando tu primer espacio.' : 'Intenta con otro filtro o agrega un nuevo espacio.'}
                </p>
                <div className="mt-6">
                  <Button onClick={handleCreateSpace} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Espacio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spaces.map((space: any) => (
                  <Card key={space.id_space} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg truncate">{space.space_name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {space.location}
                          </CardDescription>
                        </div>
                        {getStatusBadge(space.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{space.max_capacity} personas</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{formatPrice(space.price_per_hour_cop)}/hora</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {space.description}
                      </div>

                      {space.amenities && space.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {space.amenities.slice(0, 3).map((amenity: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity.amenity_name}
                            </Badge>
                          ))}
                          {space.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{space.amenities.length - 3} más
                            </Badge>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Creado: {new Date(space.created_at).toLocaleDateString('es-CO')}
                        </div>
                        <div className="flex items-center space-x-2">
                          {space.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSpaceDetails(space)}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSpace(space.id_space)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSpace(space.id_space, space.space_name)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {space.status === 'rejected' && space.rejection_reason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex">
                            <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
                            <div className="text-sm text-red-700">
                              <strong>Motivo de rechazo:</strong>
                              <p className="mt-1">{space.rejection_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles del espacio */}
      <Dialog open={isSpaceModalOpen} onOpenChange={setIsSpaceModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedSpace?.space_name}
              {selectedSpace?.status && getStatusBadge(selectedSpace.status)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSpace && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Información General</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{selectedSpace.space_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacidad:</span>
                      <span className="font-medium">{selectedSpace.max_capacity} personas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio por hora:</span>
                      <span className="font-medium text-green-600">{selectedSpace.formatted_price_cop || `$${selectedSpace.price_per_hour_cop?.toLocaleString('es-CO')} COP`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ubicación:</span>
                      <span className="font-medium">{selectedSpace.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de creación:</span>
                      <span className="font-medium">{new Date(selectedSpace.created_at).toLocaleDateString('es-CO')}</span>
                    </div>
                    {selectedSpace.status === 'rejected' && selectedSpace.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-1">Motivo del rechazo:</h4>
                        <p className="text-red-600 text-sm">{selectedSpace.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Estado y Calificación</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      {getStatusBadge(selectedSpace.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calificación promedio:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{selectedSpace.average_rating || 0}</span>
                        <span className="text-gray-500">({selectedSpace.review_count || 0} reseñas)</span>
                      </div>
                    </div>
                    {selectedSpace.approved_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aprobado el:</span>
                        <span className="font-medium">{new Date(selectedSpace.approved_at).toLocaleDateString('es-CO')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{selectedSpace.description}</p>
              </div>

              {/* Amenidades */}
              {selectedSpace.amenities && selectedSpace.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Amenidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpace.amenities.map((amenity: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {typeof amenity === 'string' ? amenity : amenity.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Fotos */}
              {selectedSpace.photos && selectedSpace.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Fotos ({selectedSpace.photos.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedSpace.photos.map((photo: any, index: number) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={typeof photo === 'string' ? photo : photo.photo_url}
                          alt={`Foto ${index + 1} de ${selectedSpace.space_name}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => {
                            // Abrir imagen en nueva pestaña para ver en tamaño completo
                            window.open(typeof photo === 'string' ? photo : photo.photo_url, '_blank');
                          }}
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsSpaceModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={() => {
                    setIsSpaceModalOpen(false);
                    handleEditSpace(selectedSpace.id_space);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Espacio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edición del espacio */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Espacio: {editingSpace?.space_name}
            </DialogTitle>
          </DialogHeader>
          
          {editingSpace && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spaceName">Nombre del Espacio *</Label>
                  <Input
                    id="spaceName"
                    value={editFormData.spaceName || ''}
                    onChange={(e) => handleEditFormChange('spaceName', e.target.value)}
                    placeholder="Ej: Salón Principal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spaceType">Tipo de Espacio *</Label>
                  <Select
                    value={editFormData.spaceType || ''}
                    onValueChange={(value) => handleEditFormChange('spaceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Capacidad Máxima *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    max="1000"
                    value={editFormData.maxCapacity || ''}
                    onChange={(e) => handleEditFormChange('maxCapacity', parseInt(e.target.value))}
                    placeholder="50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Precio por Hora (COP) *</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    min="10000"
                    max="10000000"
                    step="1000"
                    value={editFormData.pricePerHour || ''}
                    onChange={(e) => handleEditFormChange('pricePerHour', parseFloat(e.target.value))}
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={editFormData.location || ''}
                  onChange={(e) => handleEditFormChange('location', e.target.value)}
                  placeholder="Ej: Bogotá, Colombia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Describe tu espacio, características especiales, etc."
                  rows={4}
                />
              </div>

              {/* Amenidades */}
              <div className="space-y-2">
                <Label>Amenidades</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {predefinedAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editFormData.amenities?.includes(amenity) || false}
                        onChange={(e) => {
                          const currentAmenities = editFormData.amenities || [];
                          if (e.target.checked) {
                            handleAmenitiesChange([...currentAmenities, amenity]);
                          } else {
                            handleAmenitiesChange(currentAmenities.filter(a => a !== amenity));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
                {editFormData.amenities && editFormData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editFormData.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Nota sobre fotos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Las fotos no se pueden editar desde aquí. Para cambiar las fotos de tu espacio, contacta al soporte.
                </p>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSpace(null);
                    setEditFormData({});
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!editFormData.spaceName || !editFormData.spaceType || !editFormData.maxCapacity || !editFormData.pricePerHour || !editFormData.location || !editFormData.description}
                >
                  💾 Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default OwnerDashboard;