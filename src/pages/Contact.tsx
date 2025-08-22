import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4">Contáctanos</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            ¿Necesitas ayuda?
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Estamos aquí para ayudarte. Contáctanos y te responderemos lo más pronto posible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card className="p-8">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Envíanos un mensaje</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" placeholder="Tu apellido" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input id="phone" placeholder="+57 300 123 4567" />
                </div>

                <div>
                  <Label htmlFor="subject">Tipo de Consulta</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Consulta General</SelectItem>
                      <SelectItem value="support">Soporte Técnico</SelectItem>
                      <SelectItem value="booking">Ayuda con Reservas</SelectItem>
                      <SelectItem value="owner">Quiero ser Propietario</SelectItem>
                      <SelectItem value="partnership">Alianzas Comerciales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    className="min-h-32"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Correo Electrónico</h3>
                    <p className="text-muted-foreground">hola@evently.com.co</p>
                    <p className="text-muted-foreground">soporte@evently.com.co</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                    <p className="text-muted-foreground">+57 (6) 741 2345</p>
                    <p className="text-sm text-muted-foreground">Lunes a Viernes, 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Oficina Principal</h3>
                    <p className="text-muted-foreground">
                      Carrera 14 #12-35<br />
                      Armenia, Quindío<br />
                      Colombia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Horarios de Atención</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                      <p>Sábados: 9:00 AM - 2:00 PM</p>
                      <p>Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-subtle">
              <CardContent className="p-0">
                <h3 className="font-semibold text-foreground mb-4">Ayuda Rápida</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:soporte@evently.com.co">
                      <Mail className="w-4 h-4 mr-2" />
                      Soporte Técnico
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer">
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;