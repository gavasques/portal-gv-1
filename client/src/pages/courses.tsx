import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, ExternalLink, MessageCircle, Star, Clock, Users, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface CourseData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  highlights: string[];
  link: string;
  calendlyLink?: string;
  popular: boolean;
  isActive: boolean;
  customHtml?: string;
}

interface MentorshipData {
  id: number;
  title: string;
  description: string;
  features: string[];
  calendlyLink: string;
  isActive: boolean;
}

interface PageContent {
  heroTitle: string;
  heroSubtitle?: string;
  heroDescription: string;
  benefitsTitle: string;
  ctaTitle: string;
  ctaDescription: string;
  customCss?: string;
  customJs?: string;
}

export default function Courses() {
  // Fetch courses data from public API
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    }
  });

  // Fetch mentorships data from public API
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery({
    queryKey: ['/api/mentorships'],
    queryFn: async () => {
      const response = await fetch('/api/mentorships');
      if (!response.ok) throw new Error('Failed to fetch mentorships');
      return await response.json();
    }
  });

  // Fetch page content from public API
  const { data: pageContent, isLoading: pageLoading } = useQuery({
    queryKey: ['/api/page-content/courses'],
    queryFn: async () => {
      const response = await fetch('/api/page-content/courses');
      if (!response.ok) return null;
      return await response.json();
    }
  });

  // Inject custom CSS and JS when page content loads
  useEffect(() => {
    if (pageContent?.customCss) {
      const styleElement = document.createElement('style');
      styleElement.textContent = pageContent.customCss;
      styleElement.id = 'courses-custom-css';
      
      // Remove existing custom CSS
      const existingStyle = document.getElementById('courses-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(styleElement);
    }

    if (pageContent?.customJs) {
      try {
        // Create script element
        const scriptElement = document.createElement('script');
        scriptElement.textContent = pageContent.customJs;
        scriptElement.id = 'courses-custom-js';
        
        // Remove existing custom JS
        const existingScript = document.getElementById('courses-custom-js');
        if (existingScript) {
          existingScript.remove();
        }
        
        document.body.appendChild(scriptElement);
      } catch (error) {
        console.error('Error executing custom JavaScript:', error);
      }
    }

    // Cleanup function
    return () => {
      const customStyle = document.getElementById('courses-custom-css');
      const customScript = document.getElementById('courses-custom-js');
      if (customStyle) customStyle.remove();
      if (customScript) customScript.remove();
    };
  }, [pageContent]);

  if (coursesLoading || mentorshipsLoading || pageLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback courses data if API returns empty
  const fallbackCourses = [
  {
      id: "iniciante",
      title: "Curso Iniciante",
      subtitle: "Fundamentos do E-commerce na Amazon",
      description: "Aprenda do zero como vender na Amazon. Ideal para quem está começando no mundo do e-commerce e quer dar os primeiros passos com segurança.",
      price: 297,
      originalPrice: 497,
      features: [
        "40+ horas de conteúdo em vídeo",
        "Módulos práticos e teóricos",
        "Planilhas e ferramentas incluídas",
        "Suporte via grupo exclusivo",
        "Acesso vitalício ao conteúdo",
        "Certificado de conclusão"
      ],
      highlights: [
        "Mais de 5.000 alunos",
        "Avaliação 4.8/5",
        "Suporte dedicado"
      ],
      link: "https://liberdadevirtual.com.br/curso-iniciante",
      popular: false,
      isActive: true
    },
    {
      id: "completo",
      title: "Curso Completo", 
      subtitle: "Metodologia Avançada para Vendedores Profissionais",
      description: "O curso mais completo do mercado. Para quem quer dominar todas as estratégias avançadas e construir um negócio sólido e escalável na Amazon.",
      price: 2997,
      originalPrice: 4997,
      features: [
        "120+ horas de conteúdo exclusivo",
        "Metodologia proprietária LVB",
        "Análise de nichos rentáveis",
        "Estratégias de sourcing avançadas",
        "Automação e escalabilidade",
        "Suporte prioritário 1:1",
        "Acesso ao grupo VIP",
        "Atualizações perpétuas",
        "Garantia de 30 dias"
      ],
      highlights: [
        "ROI médio de 300%",
        "Suporte 1:1 especializado", 
        "Acesso ao grupo VIP"
      ],
      link: "https://liberdadevirtual.com.br/curso-completo",
      calendlyLink: "https://calendly.com/liberdadevirtual/consulta",
      popular: true,
      isActive: true
    }
  ];

  const fallbackMentorships = [
    {
      id: 1,
      title: "Mentoria Individual",
      description: "Acompanhamento personalizado para acelerar seus resultados",
      features: [
        "Sessões 1:1 com especialistas",
        "Plano de ação personalizado", 
        "Análise detalhada do seu negócio",
        "Suporte via WhatsApp",
        "Revisão de estratégias mensais"
      ],
      calendlyLink: "https://calendly.com/liberdadevirtual/mentoria-individual",
      isActive: true
    },
    {
      id: 2,
      title: "Mentoria em Grupo",
      description: "Aprenda junto com outros empreendedores em sessões exclusivas",
      features: [
        "Sessões semanais em grupo",
        "Networking com outros vendedores",
        "Cases de sucesso reais",
        "Q&A ao vivo",
        "Suporte contínuo"
      ],
      calendlyLink: "https://calendly.com/liberdadevirtual/mentoria-grupo",
      isActive: true
    }
  ];

  // Use API data if available, otherwise fallback to hardcoded data
  const displayCourses = courses.length > 0 ? courses : fallbackCourses;
  const displayMentorships = mentorships.length > 0 ? mentorships : fallbackMentorships;
  
  // Use page content or fallback values
  const heroTitle = pageContent?.heroTitle || "Conheça Nossos Cursos";
  const heroDescription = pageContent?.heroDescription || "Cursos e mentorias desenvolvidos para acelerar seu sucesso no e-commerce. Aprenda com quem já faturou milhões vendendo na Amazon.";
  const benefitsTitle = pageContent?.benefitsTitle || "Por que escolher a Liberdade Virtual?";
  const ctaTitle = pageContent?.ctaTitle || "Pronto para começar sua jornada?";
  const ctaDescription = pageContent?.ctaDescription || "Escolha o curso ideal para seu momento e comece a construir seu império no e-commerce hoje mesmo.";

  const CourseCard = ({ course }: { course: CourseData }) => (
    <Card className={`card-hover relative ${course.popular ? 'ring-2 ring-primary' : ''}`}>
      {course.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
          Mais Popular
        </Badge>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{course.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-primary">R$ {course.price}</span>
          {course.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              R$ {course.originalPrice}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {course.highlights.map((highlight, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {highlight}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {course.description}
        </p>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">O que está incluído:</h4>
          <ul className="space-y-2">
            {course.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Button asChild className="w-full">
            <a href={course.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar Página de Vendas
            </a>
          </Button>
          
          {course.calendlyLink && (
            <Button variant="outline" asChild className="w-full">
              <a href={course.calendlyLink} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Conversa
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const MentorshipCard = ({ mentorship }: { mentorship: MentorshipData }) => (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-lg">{mentorship.title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {mentorship.description}
        </p>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Incluído:</h4>
          <ul className="space-y-1">
            {mentorship.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button asChild className="w-full">
          <a href={mentorship.calendlyLink} target="_blank" rel="noopener noreferrer">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Conversa
          </a>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{heroTitle}</h1>
        {pageContent?.heroSubtitle && (
          <p className="text-xl text-muted-foreground mb-2">{pageContent.heroSubtitle}</p>
        )}
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {heroDescription}
        </p>
      </div>

      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-lg">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-semibold">Mais de 10.000 alunos formados</span>
              <Star className="h-5 w-5 fill-current" />
            </div>
            <h2 className="text-2xl font-bold">
              A educação em e-commerce que realmente funciona
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Metodologia testada e aprovada por milhares de alunos que já conquistaram 
              sua liberdade financeira vendendo na Amazon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Courses Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Nossos Cursos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Mentorships Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Mentorias Personalizadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayMentorships.map((mentorship) => (
            <MentorshipCard key={mentorship.id} mentorship={mentorship} />
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{benefitsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Metodologia Comprovada</h3>
              <p className="text-sm text-muted-foreground">
                Estratégias testadas por milhares de alunos com resultados reais e mensuráveis.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Suporte Especializado</h3>
              <p className="text-sm text-muted-foreground">
                Equipe dedicada para tirar suas dúvidas e acelerar seu aprendizado.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Acesso Vitalício</h3>
              <p className="text-sm text-muted-foreground">
                Conteúdo sempre atualizado com acesso para toda a vida.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">{ctaTitle}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="https://liberdadevirtual.com.br/curso-iniciante" target="_blank" rel="noopener noreferrer">
                Ver Curso Iniciante
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://calendly.com/liberdadevirtual/consulta" target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Consulta
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
