import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Building2 } from "lucide-react";
import Logo from "@/components/Logo";

const RegisterSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <Card className="shadow-elegant bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto">
              <Logo size="md" />
            </div>
            <CardTitle className="text-2xl font-semibold">Crear Cuenta</CardTitle>
            <CardDescription>
              Selecciona tu perfil para registrarte
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Link to="/register/client">
              <Button variant="outline" className="w-full h-20 hover:bg-primary/5 transition-all duration-200 group">
                <div className="flex flex-col items-center space-y-2">
                  <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <div className="font-semibold">Soy Cliente</div>
                    <div className="text-sm text-muted-foreground">Busco espacios para mis eventos</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/register/owner">
              <Button variant="outline" className="w-full h-20 hover:bg-primary/5 transition-all duration-200 group">
                <div className="flex flex-col items-center space-y-2">
                  <Building2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <div className="font-semibold">Soy Propietario</div>
                    <div className="text-sm text-muted-foreground">Quiero alquilar mis espacios</div>
                  </div>
                </div>
              </Button>
            </Link>

            <div className="text-center text-sm text-muted-foreground pt-4">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login-selection" className="text-primary hover:underline font-medium transition-colors">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterSelection;