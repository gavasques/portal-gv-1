import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Zap,
  BookOpen,
  BarChart3
} from "lucide-react";
import type { AiPrompt, InsertAiPrompt, AiPromptCategory } from "@shared/schema";
import { insertAiPromptSchema } from "@shared/schema";

export default function AdminAiPrompts() {
  const [search, setSearch] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<AiPrompt | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prompts = [], isLoading } = useQuery<AiPrompt[]>({
    queryKey: ['/api/admin/ai-prompts'],
  });

  const { data: aiPromptCategories = [] } = useQuery<AiPromptCategory[]>({
    queryKey: ['/api/ai-prompt-categories'],
  });

  const createForm = useForm<InsertAiPrompt>({
    resolver: zodResolver(insertAiPromptSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      content: "",
      instructions: "",
      placeholders: [],
      tags: [],
      isActive: true,
      isFeatured: false,
    },
  });

  const editForm = useForm<InsertAiPrompt>({
    resolver: zodResolver(insertAiPromptSchema),
  });

  const { mutate: createPrompt, isPending: isCreating } = useMutation({
    mutationFn: (data: InsertAiPrompt) => apiRequest('/api/admin/ai-prompts', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-prompts'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Prompt criado",
        description: "O prompt AI foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o prompt.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updatePrompt, isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: number; updates: Partial<InsertAiPrompt> }) =>
      apiRequest(`/api/admin/ai-prompts/${data.id}`, 'PUT', data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-prompts'] });
      setEditingPrompt(null);
      toast({
        title: "Prompt atualizado",
        description: "O prompt AI foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o prompt.",
        variant: "destructive",
      });
    },
  });

  const { mutate: deletePrompt } = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/ai-prompts/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-prompts'] });
      toast({
        title: "Prompt excluído",
        description: "O prompt AI foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o prompt.",
        variant: "destructive",
      });
    },
  });

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(search.toLowerCase()) ||
    prompt.description.toLowerCase().includes(search.toLowerCase())
  );

  // Categories are now fetched dynamically from the database

  const handleEdit = (prompt: AiPrompt) => {
    setEditingPrompt(prompt);
    editForm.reset({
      title: prompt.title,
      category: prompt.category,
      description: prompt.description,
      content: prompt.content,
      instructions: prompt.instructions || "",
      placeholders: prompt.placeholders || [],
      tags: prompt.tags || [],
      isActive: prompt.isActive,
      isFeatured: prompt.isFeatured || false,
    });
  };

  const { mutate: toggleFeatured } = useMutation({
    mutationFn: (data: { id: number; isFeatured: boolean }) =>
      apiRequest(`/api/admin/ai-prompts/${data.id}`, 'PUT', { isFeatured: data.isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-prompts'] });
      toast({
        title: "Status atualizado",
        description: "Status de destaque do prompt foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitEdit = (data: InsertAiPrompt) => {
    if (editingPrompt) {
      updatePrompt({ id: editingPrompt.id, updates: data });
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Gerenciar Prompts AI</h1>
          </div>
          <p className="text-muted-foreground">
            Administre a biblioteca de prompts AI para vendedores Amazon
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Prompt AI</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((data) => createPrompt(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Análise de Concorrentes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descreva brevemente o que este prompt faz..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Digite o prompt completo com placeholders [CAMPO]..."
                          className="min-h-[200px] font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções de Uso (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Como usar este prompt efetivamente..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Criando..." : "Criar Prompt"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Total Prompts</p>
                <p className="text-2xl font-bold">{prompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Prompts Ativos</p>
                <p className="text-2xl font-bold">{prompts.filter(p => p.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Total Usos</p>
                <p className="text-2xl font-bold">{prompts.reduce((sum, p) => sum + p.useCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Mais Usado</p>
                <p className="text-2xl font-bold">
                  {Math.max(...prompts.map(p => p.useCount), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prompts AI ({filteredPrompts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{prompt.title}</h3>
                      <Badge variant={prompt.isActive ? "default" : "secondary"}>
                        {prompt.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">{prompt.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{prompt.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Usos: {prompt.useCount}</span>
                      <span>Criado: {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}</span>
                      {prompt.updatedAt && (
                        <span>Atualizado: {new Date(prompt.updatedAt).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={prompt.isFeatured ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFeatured({ id: prompt.id, isFeatured: !prompt.isFeatured })}
                      className={prompt.isFeatured ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : ""}
                    >
                      ⭐ {prompt.isFeatured ? "DESTACADO" : "Destacar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prompt.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePrompt(prompt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Prompt AI</DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleSubmitEdit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[200px] font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções de Uso</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingPrompt(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}