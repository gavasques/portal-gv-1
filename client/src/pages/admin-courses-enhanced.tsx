import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { 
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  FileText,
  Star,
  Calendar,
  DollarSign,
  Users,
  Settings,
  Palette,
  Globe,
  BarChart3
} from "lucide-react";
import type { Course, InsertCourse, Mentorship, InsertMentorship, PageContent, InsertPageContent } from "@shared/schema";
import { insertCourseSchema, insertMentorshipSchema, insertPageContentSchema } from "@shared/schema";

export default function AdminCoursesEnhanced() {
  const [activeCourseTab, setActiveCourseTab] = useState("courses");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingMentorship, setEditingMentorship] = useState<Mentorship | null>(null);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateMentorshipOpen, setIsCreateMentorshipOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses data
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });

  // Fetch mentorships data
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery<Mentorship[]>({
    queryKey: ['/api/admin/mentorships'],
  });

  // Fetch page content
  const { data: pageContent, isLoading: pageContentLoading } = useQuery<PageContent>({
    queryKey: ['/api/admin/page-content/courses'],
  });

  // Course forms
  const createCourseForm = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      price: 0,
      originalPrice: 0,
      features: [],
      highlights: [],
      link: "",
      calendlyLink: "",
      popular: false,
      isActive: true,
      customHtml: "",
      sortOrder: 0,
    },
  });

  const editCourseForm = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
  });

  // Mentorship forms
  const createMentorshipForm = useForm<InsertMentorship>({
    resolver: zodResolver(insertMentorshipSchema),
    defaultValues: {
      title: "",
      description: "",
      features: [],
      calendlyLink: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  const editMentorshipForm = useForm<InsertMentorship>({
    resolver: zodResolver(insertMentorshipSchema),
  });

  // Page content form
  const pageContentForm = useForm<InsertPageContent>({
    resolver: zodResolver(insertPageContentSchema),
    defaultValues: pageContent || {
      pageKey: "courses",
      heroTitle: "Conheça Nossos Cursos",
      heroSubtitle: "",
      heroDescription: "",
      benefitsTitle: "",
      ctaTitle: "",
      ctaDescription: "",
      customCss: "",
      customJs: "",
      metaTitle: "",
      metaDescription: "",
      isActive: true,
    },
  });

  // Mutations for courses
  const { mutate: createCourse, isPending: isCreatingCourse } = useMutation({
    mutationFn: (data: InsertCourse) => apiRequest('/api/admin/courses', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setIsCreateCourseOpen(false);
      createCourseForm.reset();
      toast({
        title: "Curso criado",
        description: "O curso foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o curso.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateCourse, isPending: isUpdatingCourse } = useMutation({
    mutationFn: (data: { id: number; updates: Partial<InsertCourse> }) =>
      apiRequest(`/api/admin/courses/${data.id}`, 'PUT', data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setEditingCourse(null);
      toast({
        title: "Curso atualizado",
        description: "O curso foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o curso.",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteCourse } = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/courses/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Curso excluído",
        description: "O curso foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o curso.",
        variant: "destructive",
      });
    },
  });

  // Mutations for mentorships
  const { mutate: createMentorship, isPending: isCreatingMentorship } = useMutation({
    mutationFn: (data: InsertMentorship) => apiRequest('/api/admin/mentorships', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mentorships'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorships'] });
      setIsCreateMentorshipOpen(false);
      createMentorshipForm.reset();
      toast({
        title: "Mentoria criada",
        description: "A mentoria foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a mentoria.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateMentorship, isPending: isUpdatingMentorship } = useMutation({
    mutationFn: (data: { id: number; updates: Partial<InsertMentorship> }) =>
      apiRequest(`/api/admin/mentorships/${data.id}`, 'PUT', data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mentorships'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorships'] });
      setEditingMentorship(null);
      toast({
        title: "Mentoria atualizada",
        description: "A mentoria foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a mentoria.",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteMentorship } = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/mentorships/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mentorships'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorships'] });
      toast({
        title: "Mentoria excluída",
        description: "A mentoria foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mentoria.",
        variant: "destructive",
      });
    },
  });

  // Page content mutation
  const { mutate: updatePageContent, isPending: isUpdatingPageContent } = useMutation({
    mutationFn: (data: InsertPageContent) => apiRequest('/api/admin/page-content/courses', 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-content/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-content/courses'] });
      toast({
        title: "Conteúdo atualizado",
        description: "O conteúdo da página foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    editCourseForm.reset({
      title: course.title,
      subtitle: course.subtitle || "",
      description: course.description,
      price: Number(course.price),
      originalPrice: course.originalPrice ? Number(course.originalPrice) : undefined,
      features: course.features || [],
      highlights: course.highlights || [],
      link: course.link,
      calendlyLink: course.calendlyLink || "",
      popular: course.popular,
      isActive: course.isActive,
      customHtml: course.customHtml || "",
      sortOrder: course.sortOrder,
    });
  };

  const handleEditMentorship = (mentorship: Mentorship) => {
    setEditingMentorship(mentorship);
    editMentorshipForm.reset({
      title: mentorship.title,
      description: mentorship.description,
      features: mentorship.features || [],
      calendlyLink: mentorship.calendlyLink,
      isActive: mentorship.isActive,
      sortOrder: mentorship.sortOrder,
    });
  };

  const handleSubmitCourse = (data: InsertCourse) => {
    if (editingCourse) {
      updateCourse({ id: editingCourse.id, updates: data });
    } else {
      createCourse(data);
    }
  };

  const handleSubmitMentorship = (data: InsertMentorship) => {
    if (editingMentorship) {
      updateMentorship({ id: editingMentorship.id, updates: data });
    } else {
      createMentorship(data);
    }
  };

  const handleSubmitPageContent = (data: InsertPageContent) => {
    updatePageContent({ ...data, pageKey: "courses" });
  };

  if (coursesLoading || mentorshipsLoading || pageContentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gerenciamento de Cursos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Cursos</h1>
        <div className="flex gap-2">
          <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Curso</DialogTitle>
                <DialogDescription>
                  Adicione um novo curso à plataforma
                </DialogDescription>
              </DialogHeader>
              <CourseForm 
                form={createCourseForm} 
                onSubmit={handleSubmitCourse} 
                isLoading={isCreatingCourse} 
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateMentorshipOpen} onOpenChange={setIsCreateMentorshipOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Mentoria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Mentoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova mentoria à plataforma
                </DialogDescription>
              </DialogHeader>
              <MentorshipForm 
                form={createMentorshipForm} 
                onSubmit={handleSubmitMentorship} 
                isLoading={isCreatingMentorship} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter(c => c.isActive).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorias</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentorships.length}</div>
            <p className="text-xs text-muted-foreground">
              {mentorships.filter(m => m.isActive).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Populares</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.popular).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com destaque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Prevista</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {courses.reduce((sum, course) => sum + Number(course.price || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total dos cursos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeCourseTab} onValueChange={setActiveCourseTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="mentorships">Mentorias</TabsTrigger>
          <TabsTrigger value="page-content">Conteúdo da Página</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onEdit={handleEditCourse}
                    onDelete={deleteCourse}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentorships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentorias Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentorships.map((mentorship) => (
                  <MentorshipCard 
                    key={mentorship.id} 
                    mentorship={mentorship} 
                    onEdit={handleEditMentorship}
                    onDelete={deleteMentorship}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="page-content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Editar Conteúdo da Página de Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PageContentForm 
                form={pageContentForm} 
                onSubmit={handleSubmitPageContent} 
                isLoading={isUpdatingPageContent}
                pageContent={pageContent}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Course Dialog */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Curso</DialogTitle>
              <DialogDescription>
                Atualize as informações do curso
              </DialogDescription>
            </DialogHeader>
            <CourseForm 
              form={editCourseForm} 
              onSubmit={handleSubmitCourse} 
              isLoading={isUpdatingCourse} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Mentorship Dialog */}
      {editingMentorship && (
        <Dialog open={!!editingMentorship} onOpenChange={() => setEditingMentorship(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Mentoria</DialogTitle>
              <DialogDescription>
                Atualize as informações da mentoria
              </DialogDescription>
            </DialogHeader>
            <MentorshipForm 
              form={editMentorshipForm} 
              onSubmit={handleSubmitMentorship} 
              isLoading={isUpdatingMentorship} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Course Card Component
interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: number) => void;
}

function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {course.popular && (
              <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
                POPULAR
              </Badge>
            )}
            {course.isActive ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <Eye className="h-3 w-3 mr-1" />
                ATIVO
              </Badge>
            ) : (
              <Badge variant="secondary">
                <EyeOff className="h-3 w-3 mr-1" />
                INATIVO
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
        {course.subtitle && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{course.subtitle}</p>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600">
            R$ {Number(course.price).toLocaleString()}
          </span>
          {course.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {Number(course.originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(course)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este curso?')) {
                  onDelete(course.id);
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Ordem: {course.sortOrder}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mentorship Card Component
interface MentorshipCardProps {
  mentorship: Mentorship;
  onEdit: (mentorship: Mentorship) => void;
  onDelete: (id: number) => void;
}

function MentorshipCard({ mentorship, onEdit, onDelete }: MentorshipCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {mentorship.isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <Eye className="h-3 w-3 mr-1" />
              ATIVA
            </Badge>
          ) : (
            <Badge variant="secondary">
              <EyeOff className="h-3 w-3 mr-1" />
              INATIVA
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold mb-2 line-clamp-1">{mentorship.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {mentorship.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(mentorship)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir esta mentoria?')) {
                  onDelete(mentorship.id);
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Ordem: {mentorship.sortOrder}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Course Form Component
interface CourseFormProps {
  form: any;
  onSubmit: (data: InsertCourse) => void;
  isLoading: boolean;
}

function CourseForm({ form, onSubmit, isLoading }: CourseFormProps) {
  const [featuresText, setFeaturesText] = useState(
    form.getValues('features')?.join('\n') || ''
  );
  const [highlightsText, setHighlightsText] = useState(
    form.getValues('highlights')?.join('\n') || ''
  );

  const handleSubmit = (data: InsertCourse) => {
    const processedData = {
      ...data,
      features: featuresText.split('\n').filter(f => f.trim()),
      highlights: highlightsText.split('\n').filter(h => h.trim()),
    };
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Curso Iniciante" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Fundamentos do E-commerce" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição detalhada do curso..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="297" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Original (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="497" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link de Compra</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="calendlyLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Calendly (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://calendly.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Características (uma por linha)</label>
            <Textarea
              placeholder="40+ horas de conteúdo em vídeo&#10;Módulos práticos e teóricos&#10;Planilhas e ferramentas incluídas"
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Destaques (uma por linha)</label>
            <Textarea
              placeholder="Suporte via grupo exclusivo&#10;Acesso vitalício ao conteúdo&#10;Certificado de conclusão"
              rows={4}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="customHtml"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HTML Customizado (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="<div>HTML personalizado para este curso</div>"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-6">
          <FormField
            control={form.control}
            name="popular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Curso Popular</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Exibir badge "Mais Popular"
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Ativo</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Visível para os alunos
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Curso
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Mentorship Form Component
interface MentorshipFormProps {
  form: any;
  onSubmit: (data: InsertMentorship) => void;
  isLoading: boolean;
}

function MentorshipForm({ form, onSubmit, isLoading }: MentorshipFormProps) {
  const [featuresText, setFeaturesText] = useState(
    form.getValues('features')?.join('\n') || ''
  );

  const handleSubmit = (data: InsertMentorship) => {
    const processedData = {
      ...data,
      features: featuresText.split('\n').filter(f => f.trim()),
    };
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Mentoria Individual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição detalhada da mentoria..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calendlyLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Calendly</FormLabel>
                <FormControl>
                  <Input placeholder="https://calendly.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Características (uma por linha)</label>
          <Textarea
            placeholder="Sessões 1:1 personalizadas&#10;Análise do seu negócio atual&#10;Estratégias específicas para seu nicho"
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Ativa</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Visível para os alunos
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Mentoria
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Page Content Form Component
interface PageContentFormProps {
  form: any;
  onSubmit: (data: InsertPageContent) => void;
  isLoading: boolean;
  pageContent?: PageContent;
}

function PageContentForm({ form, onSubmit, isLoading, pageContent }: PageContentFormProps) {
  // Update form when pageContent loads
  if (pageContent && !form.formState.isDirty) {
    form.reset({
      pageKey: "courses",
      heroTitle: pageContent.heroTitle || "Conheça Nossos Cursos",
      heroSubtitle: pageContent.heroSubtitle || "",
      heroDescription: pageContent.heroDescription || "",
      benefitsTitle: pageContent.benefitsTitle || "",
      ctaTitle: pageContent.ctaTitle || "",
      ctaDescription: pageContent.ctaDescription || "",
      customCss: pageContent.customCss || "",
      customJs: pageContent.customJs || "",
      metaTitle: pageContent.metaTitle || "",
      metaDescription: pageContent.metaDescription || "",
      isActive: pageContent.isActive ?? true,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="heroTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Principal</FormLabel>
                <FormControl>
                  <Input placeholder="Conheça Nossos Cursos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="heroSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input placeholder="Subtítulo opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="heroDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Hero</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Cursos e mentorias desenvolvidos para acelerar seu sucesso no e-commerce..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="benefitsTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título dos Benefícios</FormLabel>
                <FormControl>
                  <Input placeholder="Por que escolher a Liberdade Virtual?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ctaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do CTA</FormLabel>
                <FormControl>
                  <Input placeholder="Pronto para começar sua jornada?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ctaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do CTA</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Escolha o curso ideal para seu momento e comece a construir seu império no e-commerce hoje mesmo."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title (SEO)</FormLabel>
                <FormControl>
                  <Input placeholder="Cursos de E-commerce | Liberdade Virtual" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description (SEO)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Aprenda e-commerce com nossos cursos especializados em Amazon e importação..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customCss"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CSS Customizado</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder=".custom-hero { background: linear-gradient(...); }"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customJs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>JavaScript Customizado</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="// Custom JavaScript for this page"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Página Ativa</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Aplicar este conteúdo na página pública
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Conteúdo
          </Button>
        </div>
      </form>
    </Form>
  );
}