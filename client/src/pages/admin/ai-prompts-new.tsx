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

export default function AdminAiPromptsNew() {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Prompts AI</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prompts AI</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
                          <Input placeholder="Ex: Análise de Concorrentes" {...field} />
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
                            {aiPromptCategories.filter(cat => cat.isActive).map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
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
                        <Textarea 
                          placeholder="Descreva brevemente o que este prompt faz..."
                          rows={3}
                          {...field}
                        />
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
                          placeholder="Digite o prompt completo com placeholders [CAMPO]..."
                          rows={8}
                          {...field}
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
                        <Textarea 
                          placeholder="Como usar este prompt efetivamente..."
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    Criar Prompt
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredPrompts.length} prompt(s) encontrado(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg line-clamp-1">{prompt.title}</CardTitle>
                </div>
                {prompt.isFeatured && (
                  <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
                    DESTACADO
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{prompt.category}</Badge>
                <Badge variant={prompt.isActive ? "default" : "secondary"}>
                  {prompt.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {prompt.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
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
                    onClick={() => toggleFeatured({ 
                      id: prompt.id, 
                      isFeatured: !prompt.isFeatured 
                    })}
                  >
                    {prompt.isFeatured ? "Remover Destaque" : "Destacar"}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este prompt?')) {
                      deletePrompt(prompt.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum prompt encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {search ? "Não há prompts que correspondam à sua busca." : "Comece criando seu primeiro prompt AI."}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Prompt
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingPrompt && (
        <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Prompt AI</DialogTitle>
            </DialogHeader>
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
                          <Input placeholder="Ex: Análise de Concorrentes" {...field} />
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
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {aiPromptCategories.filter(cat => cat.isActive).map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
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
                        <Textarea 
                          placeholder="Descreva brevemente o que este prompt faz..."
                          rows={3}
                          {...field}
                        />
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
                          placeholder="Digite o prompt completo com placeholders [CAMPO]..."
                          rows={8}
                          {...field}
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
                      <FormLabel>Instruções de Uso (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Como usar este prompt efetivamente..."
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingPrompt(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    Atualizar Prompt
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}