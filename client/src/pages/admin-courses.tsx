
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  GraduationCap,
  Code,
  Layout,
  Settings,
  ExternalLink
} from "lucide-react";

interface CourseContent {
  id?: number;
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

interface MentorshipContent {
  id?: number;
  title: string;
  description: string;
  features: string[];
  calendlyLink: string;
  isActive: boolean;
}

interface PageContent {
  id?: number;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  benefitsTitle: string;
  benefitsDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  customCss?: string;
  customJs?: string;
  isActive: boolean;
}

export default function AdminCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("courses");
  const [editingCourse, setEditingCourse] = useState<CourseContent | null>(null);
  const [editingMentorship, setEditingMentorship] = useState<MentorshipContent | null>(null);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);

  // Fetch courses content
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    }
  });

  // Fetch mentorships content
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery({
    queryKey: ['admin-mentorships'],
    queryFn: async () => {
      const response = await fetch('/api/admin/mentorships');
      if (!response.ok) throw new Error('Failed to fetch mentorships');
      return response.json();
    }
  });

  // Fetch page content
  const { data: pageContent, isLoading: pageLoading } = useQuery({
    queryKey: ['admin-page-content'],
    queryFn: async () => {
      const response = await fetch('/api/admin/page-content/courses');
      if (!response.ok) throw new Error('Failed to fetch page content');
      return response.json();
    }
  });

  // Save course mutation
  const saveCourse = useMutation({
    mutationFn: async (course: CourseContent) => {
      const url = course.id ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
      const method = course.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      if (!response.ok) throw new Error('Failed to save course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setEditingCourse(null);
      toast({ title: "Curso salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar curso", variant: "destructive" });
    }
  });

  // Save mentorship mutation
  const saveMentorship = useMutation({
    mutationFn: async (mentorship: MentorshipContent) => {
      const url = mentorship.id ? `/api/admin/mentorships/${mentorship.id}` : '/api/admin/mentorships';
      const method = mentorship.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mentorship)
      });
      if (!response.ok) throw new Error('Failed to save mentorship');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentorships'] });
      setEditingMentorship(null);
      toast({ title: "Mentoria salva com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar mentoria", variant: "destructive" });
    }
  });

  // Save page content mutation
  const savePageContent = useMutation({
    mutationFn: async (content: PageContent) => {
      const response = await fetch('/api/admin/page-content/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (!response.ok) throw new Error('Failed to save page content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page-content'] });
      setEditingPage(null);
      toast({ title: "Conteúdo da página salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar conteúdo da página", variant: "destructive" });
    }
  });

  const CourseForm = ({ course, onSave, onCancel }: { 
    course: CourseContent | null, 
    onSave: (course: CourseContent) => void,
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState<CourseContent>(course || {
      title: '',
      subtitle: '',
      description: '',
      price: 0,
      originalPrice: 0,
      features: [''],
      highlights: [''],
      link: '',
      calendlyLink: '',
      popular: false,
      isActive: true,
      customHtml: ''
    });

    const updateFeature = (index: number, value: string) => {
      const newFeatures = [...formData.features];
      newFeatures[index] = value;
      setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
      setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index: number) => {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    };

    const updateHighlight = (index: number, value: string) => {
      const newHighlights = [...formData.highlights];
      newHighlights[index] = value;
      setFormData({ ...formData, highlights: newHighlights });
    };

    const addHighlight = () => {
      setFormData({ ...formData, highlights: [...formData.highlights, ''] });
    };

    const removeHighlight = (index: number) => {
      const newHighlights = formData.highlights.filter((_, i) => i !== index);
      setFormData({ ...formData, highlights: newHighlights });
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="originalPrice">Preço Original</Label>
            <Input
              id="originalPrice"
              type="number"
              value={formData.originalPrice || ''}
              onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="link">Link de Vendas</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="calendlyLink">Link Calendly (opcional)</Label>
            <Input
              id="calendlyLink"
              value={formData.calendlyLink || ''}
              onChange={(e) => setFormData({ ...formData, calendlyLink: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Características (o que está incluído)</Label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Digite uma característica..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
                disabled={formData.features.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addFeature} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Característica
          </Button>
        </div>

        <div>
          <Label>Destaques</Label>
          {formData.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                placeholder="Digite um destaque..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeHighlight(index)}
                disabled={formData.highlights.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Destaque
          </Button>
        </div>

        <div>
          <Label htmlFor="customHtml">HTML Personalizado (opcional)</Label>
          <Textarea
            id="customHtml"
            value={formData.customHtml || ''}
            onChange={(e) => setFormData({ ...formData, customHtml: e.target.value })}
            rows={6}
            className="font-mono text-sm"
            placeholder="Cole aqui HTML personalizado para este curso..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="popular"
              checked={formData.popular}
              onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
            />
            <Label htmlFor="popular">Marcar como Popular</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)} disabled={saveCourse.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveCourse.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  const PageContentForm = ({ content, onSave, onCancel }: {
    content: PageContent | null,
    onSave: (content: PageContent) => void,
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState<PageContent>(content || {
      heroTitle: 'Conheça Nossos Cursos',
      heroSubtitle: '',
      heroDescription: 'Cursos e mentorias desenvolvidos para acelerar seu sucesso no e-commerce.',
      benefitsTitle: 'Por que escolher a Liberdade Virtual?',
      benefitsDescription: '',
      ctaTitle: 'Pronto para começar sua jornada?',
      ctaDescription: 'Escolha o curso ideal para seu momento e comece a construir seu império no e-commerce hoje mesmo.',
      customCss: '',
      customJs: '',
      isActive: true
    });

    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="heroTitle">Título Principal</Label>
          <Input
            id="heroTitle"
            value={formData.heroTitle}
            onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="heroSubtitle">Subtítulo (opcional)</Label>
          <Input
            id="heroSubtitle"
            value={formData.heroSubtitle}
            onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="heroDescription">Descrição Principal</Label>
          <Textarea
            id="heroDescription"
            value={formData.heroDescription}
            onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="benefitsTitle">Título da Seção de Benefícios</Label>
          <Input
            id="benefitsTitle"
            value={formData.benefitsTitle}
            onChange={(e) => setFormData({ ...formData, benefitsTitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="ctaTitle">Título do Call to Action</Label>
          <Input
            id="ctaTitle"
            value={formData.ctaTitle}
            onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="ctaDescription">Descrição do Call to Action</Label>
          <Textarea
            id="ctaDescription"
            value={formData.ctaDescription}
            onChange={(e) => setFormData({ ...formData, ctaDescription: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="customCss">CSS Personalizado</Label>
          <Textarea
            id="customCss"
            value={formData.customCss || ''}
            onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
            rows={6}
            className="font-mono text-sm"
            placeholder="/* CSS personalizado para a página de cursos */"
          />
        </div>

        <div>
          <Label htmlFor="customJs">JavaScript Personalizado</Label>
          <Textarea
            id="customJs"
            value={formData.customJs || ''}
            onChange={(e) => setFormData({ ...formData, customJs: e.target.value })}
            rows={6}
            className="font-mono text-sm"
            placeholder="// JavaScript personalizado para a página de cursos"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)} disabled={savePageContent.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {savePageContent.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  if (coursesLoading || mentorshipsLoading || pageLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Cursos</h1>
          <p className="text-muted-foreground">
            Gerencie o conteúdo da página "Nossos Cursos" vista pelos alunos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/courses" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Página do Aluno
            </a>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="mentorships">Mentorias</TabsTrigger>
          <TabsTrigger value="page">Conteúdo da Página</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cursos</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCourse({
                  title: '',
                  subtitle: '',
                  description: '',
                  price: 0,
                  features: [''],
                  highlights: [''],
                  link: '',
                  popular: false,
                  isActive: true
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse?.id ? 'Editar Curso' : 'Novo Curso'}
                  </DialogTitle>
                </DialogHeader>
                <CourseForm
                  course={editingCourse}
                  onSave={(course) => saveCourse.mutate(course)}
                  onCancel={() => setEditingCourse(null)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {courses.map((course: CourseContent) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {course.title}
                        {course.popular && <Badge>Popular</Badge>}
                        {!course.isActive && <Badge variant="secondary">Inativo</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{course.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Preço: R$ {course.price}</span>
                      {course.originalPrice && (
                        <span>De: R$ {course.originalPrice}</span>
                      )}
                      <span>{course.features.length} características</span>
                      <span>{course.highlights.length} destaques</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentorships" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mentorias</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mentoria
            </Button>
          </div>
          {/* Mentorships content would go here */}
        </TabsContent>

        <TabsContent value="page" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Conteúdo da Página</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPage(pageContent)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Página
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Conteúdo da Página</DialogTitle>
                </DialogHeader>
                <PageContentForm
                  content={editingPage}
                  onSave={(content) => savePageContent.mutate(content)}
                  onCancel={() => setEditingPage(null)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações da Página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Título Principal</Label>
                  <p className="text-sm text-muted-foreground">{pageContent?.heroTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-muted-foreground">{pageContent?.heroDescription}</p>
                </div>
                {pageContent?.customCss && (
                  <div>
                    <Label className="text-sm font-medium">CSS Personalizado</Label>
                    <Badge variant="outline">Configurado</Badge>
                  </div>
                )}
                {pageContent?.customJs && (
                  <div>
                    <Label className="text-sm font-medium">JavaScript Personalizado</Label>
                    <Badge variant="outline">Configurado</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
