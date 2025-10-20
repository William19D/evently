import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Calendar, Shield, LogOut, ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import MfaSetup from "@/components/MfaSetup";
import DeleteAccountModal from "@/components/DeleteAccountModal";

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login/client");
      return;
    }

    // Load user profile data
    setUserProfile({
      email: user.email,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      phone: '',
      avatar: '',
      createdAt: new Date(),
    });
  }, [user, navigate]);

  const handleSignOut = async () => {
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userProfile) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mi Perfil</h1>
              <p className="text-muted-foreground">Gestiona tu información personal y configuración de seguridad</p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? "Cerrando..." : "Cerrar Sesión"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={userProfile.avatar} alt="Avatar" />
                  <AvatarFallback className="text-lg">
                    {getInitials(userProfile.firstName, userProfile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">
                  {userProfile.firstName} {userProfile.lastName}
                </CardTitle>
                <CardDescription>Cliente de Evently</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{userProfile.email}</span>
                </div>
                
                {userProfile.phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Miembro desde {formatDate(userProfile.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Información Personal</span>
                </CardTitle>
                <CardDescription>
                  Esta información se usa para personalizar tu experiencia
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input 
                      id="firstName" 
                      value={userProfile.firstName} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input 
                      id="lastName" 
                      value={userProfile.lastName} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    value={userProfile.email} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                
                {userProfile.phone && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input 
                      id="phone" 
                      value={userProfile.phone} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                )}

                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Para modificar tu información personal, contacta a nuestro soporte.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* MFA Settings */}
            <MfaSetup />

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
                <CardDescription>
                  Acciones irreversibles relacionadas con tu cuenta
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Eliminar cuenta:</strong> Esta acción no se puede deshacer. 
                    Todos tus datos se eliminarán permanentemente.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="destructive" 
                  className="mt-4 w-full"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Eliminar Cuenta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </PageLayout>
  );
};

export default UserProfile;
