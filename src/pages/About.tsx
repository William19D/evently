import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4">Sobre Nosotros</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Conectamos espacios únicos con eventos memorables
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Evently es la plataforma líder en Colombia para la gestión y reserva de espacios para eventos. 
            Conectamos a clientes que buscan el lugar perfecto con propietarios de espacios únicos en todo el país.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-gradient-subtle">
            <CardContent className="p-0">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Nuestra Misión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Facilitar la conexión entre organizadores de eventos y propietarios de espacios únicos, 
                ofreciendo una plataforma confiable, intuitiva y completa que transforme la manera 
                como se planifican y ejecutan los eventos en Colombia.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-8 bg-gradient-subtle">
            <CardContent className="p-0">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Nuestra Visión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ser la plataforma de referencia en América Latina para la gestión de espacios para eventos, 
                democratizando el acceso a venues únicos y empoderando a propietarios de espacios 
                a monetizar sus propiedades de manera eficiente.
              </p>
            </CardContent>
          </Card>
        </div>

        
        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Nuestros Valores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <h4 className="text-xl font-semibold mb-3 text-foreground">Confianza</h4>
                <p className="text-muted-foreground">
                  Construimos relaciones duraderas basadas en transparencia y seguridad 
                  en cada transacción.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <h4 className="text-xl font-semibold mb-3 text-foreground">Innovación</h4>
                <p className="text-muted-foreground">
                  Utilizamos tecnología de vanguardia para simplificar la gestión 
                  y reserva de espacios.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <h4 className="text-xl font-semibold mb-3 text-foreground">Comunidad</h4>
                <p className="text-muted-foreground">
                  Apoyamos el crecimiento de la industria de eventos y fortalecemos 
                  las economías locales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Un Equipo Apasionado</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Nuestro equipo está compuesto por profesionales apasionados por la tecnología y los eventos, 
            comprometidos con brindar la mejor experiencia tanto para organizadores como para propietarios de espacios.
          </p>
          <div className="bg-gradient-subtle rounded-lg p-8">
            <p className="text-lg font-medium text-foreground">
              "Creemos que cada evento merece el espacio perfecto, y cada espacio merece la oportunidad de brillar."
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;