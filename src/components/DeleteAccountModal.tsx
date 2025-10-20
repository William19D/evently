import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { deleteUserAccount } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle, Shield, CheckCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const [step, setStep] = useState<"warning" | "confirm" | "success">("warning");
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedItemsCount, setDeletedItemsCount] = useState(0);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const requiredText = "ELIMINAR MI CUENTA";

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast.error("Error", {
        description: "No se encontró información del usuario. Por favor, inicia sesión nuevamente."
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log('🔍 Starting account deletion for user:', {
        userId: user.id.substring(0, 8) + '***',
        email: user.email?.substring(0, 10) + '***'
      });

      const result = await deleteUserAccount(user.id);

      if (result.success) {
        const deletedCount = Object.values(result.deletedItems || {}).reduce((a: any, b: any) => a + b, 0);
        setDeletedItemsCount(deletedCount);
        
        // Mostrar pantalla de éxito
        setStep("success");
        
        // Después de 4 segundos, cerrar sesión y redirigir
        setTimeout(async () => {
          await signOut();
          navigate("/");
          onClose();
        }, 4000);
      } else {
        throw new Error(result.error || result.message || "Error desconocido al eliminar la cuenta");
      }
      
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      
      // Manejo específico de errores
      const errorMessage = error instanceof Error ? error.message : String(error);
      let friendlyMessage = errorMessage;
      
      if (errorMessage.includes("Cannot read properties of undefined")) {
        friendlyMessage = "Error interno del servidor. Intenta cerrar sesión e iniciar sesión nuevamente.";
      } else if (errorMessage.includes("Token expirado")) {
        friendlyMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente e intenta de nuevo.";
      } else if (errorMessage.includes("Token inválido")) {
        friendlyMessage = "Hay un problema con tu sesión. Por favor, cierra sesión e inicia sesión nuevamente.";
      } else if (errorMessage.includes("No se puede usar un token temporal")) {
        friendlyMessage = "No puedes eliminar tu cuenta mientras tengas MFA pendiente. Completa la autenticación primero.";
      } else if (errorMessage.includes("Usuario no encontrado")) {
        friendlyMessage = "Tu cuenta no se encontró en el sistema. Puede que ya haya sido eliminada.";
      } else if (errorMessage.includes("Error al comunicarse con el servidor")) {
        friendlyMessage = "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
      }
      
      toast.error("Error al eliminar la cuenta", {
        description: friendlyMessage
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && step !== "success") {
      setStep("warning");
      setConfirmationText("");
      setDeletedItemsCount(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={step === "success" ? "sm:max-w-lg" : "sm:max-w-md"}>
        {step === "warning" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                 Eliminar cuenta permanentemente
              </DialogTitle>
              <DialogDescription>
                Esta acción es <strong>irreversible</strong> y eliminará permanentemente toda tu información.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Al eliminar tu cuenta se borrará permanentemente:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li> Tu perfil y información personal</li>
                      <li> Todas tus reservaciones y servicios asociados</li>
                      <li> Espacios publicados, fotos y amenidades</li>
                      <li> Reseñas y calificaciones (enviadas y recibidas)</li>
                      <li> Lista de favoritos</li>
                      <li> Configuraciones de seguridad (MFA y tokens)</li>
                      <li> Historial de pagos y transacciones</li>
                      <li> Roles y permisos de usuario</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alternativas recomendadas:</strong> Si solo deseas pausar tu cuenta temporalmente, 
                  considera descargar tus datos y contactar a soporte en su lugar.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                variant="destructive"
                className="flex-1"
              >
                Continuar con la eliminación
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Confirmar eliminación de cuenta
              </DialogTitle>
              <DialogDescription>
                Para continuar, escribe exactamente "<strong>{requiredText}</strong>" en el campo de abajo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmation">
                  Escribe "<span className="font-mono font-bold">{requiredText}</span>" para confirmar:
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={requiredText}
                  className="font-mono"
                  disabled={isDeleting}
                />
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Una vez confirmada, tu cuenta será eliminada inmediatamente y no podrá ser recuperada.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("warning")}
                disabled={isDeleting}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                disabled={confirmationText !== requiredText || isDeleting}
                className="flex-1"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar mi cuenta
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                ¡Cuenta eliminada exitosamente!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Mensaje principal centrado */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tu cuenta ha sido eliminada permanentemente
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Se eliminaron exitosamente {deletedItemsCount} elementos asociados a tu cuenta.
                  </p>
                </div>

                {/* Lista de lo que se eliminó */}
                <Alert className="text-left bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-green-800">Información eliminada:</p>
                      <ul className="text-sm text-green-700 space-y-1 ml-4">
                        <li>✅ Tu perfil y información personal</li>
                        <li>✅ Todas tus reservaciones y pagos</li>
                        <li>✅ Espacios publicados y sus datos</li>
                        <li>✅ Reseñas y calificaciones</li>
                        <li>✅ Configuraciones de seguridad</li>
                        <li>✅ Roles y permisos de usuario</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Mensaje de redirección */}
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrando sesión y redirigiendo...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
