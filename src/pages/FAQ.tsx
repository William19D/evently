import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Users, Building2, CreditCard } from "lucide-react";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4">FAQ</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Encuentra respuestas a las preguntas más comunes sobre Evently
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Categories */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <CardContent className="p-0">
                <h3 className="font-semibold mb-4 text-foreground">Categorías</h3>
                <div className="space-y-2">
                  <a href="#general" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1">
                    <MessageCircle className="w-4 h-4" />
                    General
                  </a>
                  <a href="#clients" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1">
                    <Users className="w-4 h-4" />
                    Para Clientes
                  </a>
                  <a href="#owners" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1">
                    <Building2 className="w-4 h-4" />
                    Para Propietarios
                  </a>
                  <a href="#payments" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1">
                    <CreditCard className="w-4 h-4" />
                    Pagos
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* General Questions */}
            <section id="general">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Preguntas Generales
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="what-is-evently">
                  <AccordionTrigger>¿Qué es Evently?</AccordionTrigger>
                  <AccordionContent>
                    Evently es la plataforma líder en Colombia para la gestión y reserva de espacios para eventos. 
                    Conectamos a organizadores de eventos con propietarios de espacios únicos en todo el país, 
                    facilitando el proceso de búsqueda, reserva y gestión de venues para cualquier tipo de evento.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="how-it-works">
                  <AccordionTrigger>¿Cómo funciona Evently?</AccordionTrigger>
                  <AccordionContent>
                    Es muy simple: los clientes buscan y filtran espacios según sus necesidades, revisan fotos y detalles, 
                    y realizan reservas directamente en la plataforma. Los propietarios publican sus espacios con fotos, 
                    descripciones y disponibilidad, y reciben reservas automáticamente.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="coverage">
                  <AccordionTrigger>¿En qué ciudades está disponible Evently?</AccordionTrigger>
                  <AccordionContent>
                    Actualmente operamos en más de 15 ciudades principales de Colombia, incluyendo Bogotá, Medellín, 
                    Cali, Armenia, Pereira, Manizales, Bucaramanga, Barranquilla, Cartagena, y más. 
                    Estamos expandiendo constantemente a nuevas ciudades.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Client Questions */}
            <section id="clients">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Para Clientes
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="search-spaces">
                  <AccordionTrigger>¿Cómo busco espacios en Evently?</AccordionTrigger>
                  <AccordionContent>
                    Puedes buscar espacios usando nuestros filtros por ubicación, capacidad, tipo de evento, 
                    presupuesto y fechas disponibles. También puedes explorar por categorías como salones de eventos, 
                    espacios al aire libre, terrazas, auditorios, y más.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="booking-process">
                  <AccordionTrigger>¿Cómo hago una reserva?</AccordionTrigger>
                  <AccordionContent>
                    Selecciona el espacio que te guste, elige la fecha y hora, completa los detalles de tu evento, 
                    y procede al pago. Recibirás una confirmación inmediata y podrás comunicarte directamente con 
                    el propietario para coordinar detalles adicionales.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cancellation">
                  <AccordionTrigger>¿Puedo cancelar mi reserva?</AccordionTrigger>
                  <AccordionContent>
                    Sí, puedes cancelar tu reserva según la política de cancelación del espacio específico. 
                    Las políticas varían, pero generalmente permiten cancelación gratuita hasta 48-72 horas antes del evento. 
                    Revisa siempre los términos específicos antes de confirmar tu reserva.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Owner Questions */}
            <section id="owners">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                Para Propietarios
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="list-space">
                  <AccordionTrigger>¿Cómo publico mi espacio en Evently?</AccordionTrigger>
                  <AccordionContent>
                    Regístrate como propietario, completa el perfil de tu negocio, agrega fotos profesionales de tu espacio, 
                    describe las características y servicios, establece tus tarifas y disponibilidad. 
                    Nuestro equipo revisará y aprobará tu listado en 24-48 horas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="commission">
                  <AccordionTrigger>¿Cuánto cobra Evently por las reservas?</AccordionTrigger>
                  <AccordionContent>
                    Cobramos una comisión del 8% sobre cada reserva confirmada. Esta comisión cubre el procesamiento de pagos, 
                    marketing de tu espacio, soporte al cliente, y mantenimiento de la plataforma. 
                    No hay costos ocultos ni tarifas mensuales.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payments-owners">
                  <AccordionTrigger>¿Cuándo recibo el pago por las reservas?</AccordionTrigger>
                  <AccordionContent>
                    Los pagos se procesan automáticamente 24 horas después de la finalización exitosa del evento. 
                    Recibirás el monto (menos la comisión de Evently) directamente en tu cuenta bancaria registrada. 
                    También puedes consultar el historial de pagos en tu panel de propietario.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Payment Questions */}
            <section id="payments">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                Pagos y Facturación
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="payment-methods">
                  <AccordionTrigger>¿Qué métodos de pago aceptan?</AccordionTrigger>
                  <AccordionContent>
                    Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), 
                    PSE para transferencias bancarias, y próximamente integraremos Nequi, Daviplata y otros métodos digitales. 
                    Todos los pagos son procesados de forma segura.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="invoicing">
                  <AccordionTrigger>¿Emiten factura por las reservas?</AccordionTrigger>
                  <AccordionContent>
                    Sí, emitimos factura electrónica para todas las reservas. La factura se envía automáticamente a tu correo 
                    después del pago y también está disponible en tu perfil de usuario para descarga en cualquier momento. 
                    Para empresas, podemos incluir datos específicos de facturación.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="refunds">
                  <AccordionTrigger>¿Cómo funcionan los reembolsos?</AccordionTrigger>
                  <AccordionContent>
                    Los reembolsos dependen de la política de cancelación del espacio específico y el tiempo de la cancelación. 
                    Los reembolsos aprobados se procesan en 3-5 días hábiles y se acreditan al método de pago original. 
                    En caso de disputas, nuestro equipo de soporte mediará para encontrar una solución justa.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="p-8 bg-gradient-subtle text-center">
          <CardContent className="p-0">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">¿No encuentras la respuesta que buscas?</h3>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta adicional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contáctanos</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:soporte@evently.com.co">Enviar Email</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;