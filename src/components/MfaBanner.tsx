import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MfaBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isMfaEnabled } = useAuth();

  // No mostrar si MFA ya está habilitado o si fue descartado
  if (isMfaEnabled || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <Shield className="h-4 w-4 text-blue-600" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <strong>Protege tu cuenta:</strong> Activa la autenticación de dos factores para mayor seguridad.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link to="/profile">
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              Configurar MFA
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default MfaBanner;
