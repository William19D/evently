import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Music, 
  Utensils, 
  Camera 
} from "lucide-react";

const Categories = () => {
  const categories = [
    {
      name: "Bodas",
      icon: Heart,
      description: "Espacios románticos para tu día especial",
      count: "85+ espacios",
      color: "text-pink-500"
    },
    {
      name: "Eventos Corporativos",
      icon: Briefcase,
      description: "Salas profesionales para reuniones y conferencias",
      count: "120+ espacios",
      color: "text-blue-500"
    },
    {
      name: "Quinceañeros",
      icon: GraduationCap,
      description: "Celebra los 15 años en grande",
      count: "65+ espacios",
      color: "text-green-500"
    },
    {
      name: "Conciertos",
      icon: Music,
      description: "Auditorios y espacios para presentaciones musicales",
      count: "40+ espacios",
      color: "text-purple-500"
    },
    {
      name: "Primeras Comuniones",
      icon: Utensils,
      description: "Espacios especiales para celebraciones familiares",
      count: "75+ espacios",
      color: "text-orange-500"
    },
    {
      name: "Sesiones Fotográficas",
      icon: Camera,
      description: "Estudios y locaciones únicas en el Eje Cafetero",
      count: "35+ espacios",
      color: "text-indigo-500"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Encuentra por Categoría
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora espacios perfectos para cada tipo de evento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-surface ${category.color}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 mb-3 text-sm">
                      {category.description}
                    </p>
                    <div className="text-xs text-primary font-medium">
                      {category.count}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;