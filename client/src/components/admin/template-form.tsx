import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Template, TemplateTag } from "@shared/schema";

const templateFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  category: z.enum(["Fornecedores", "Amazon", "Ferramentas", "Negociação", "Marketing"]),
  purpose: z.string().min(1, "Finalidade é obrigatória"),
  usageInstructions: z.string().min(1, "Instruções de uso são obrigatórias"),
  content: z.string().min(1, "Corpo do template é obrigatório"),
  variableTips: z.string().optional(),
  status: z.enum(["published", "draft"]),
  selectedTags: z.array(z.number()).default([]),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

const categories = [
  "Fornecedores",
  "Amazon", 
  "Ferramentas", 
  "Negociação", 
  "Marketing"
];

interface TemplateFormProps {
  template?: Template | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TemplateForm({ template, onCancel, onSuccess }: TemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  // Query para buscar tags existentes
  const { data: templateTags, refetch: refetchTags } = useQuery({
    queryKey: ["/api/admin/template-tags"],
    queryFn: async () => {
      const response = await fetch("/api/admin/template-tags");
      if (!response.ok) throw new Error("Failed to fetch template tags");
      return response.json() as TemplateTag[];
    },
  });

  // Query para buscar template com tags na edição
  const { data: templateWithTags } = useQuery({
    queryKey: ["/api/admin/templates", template?.id],
    queryFn: async () => {
      if (!template?.id) return null;
      const response = await fetch(`/api/admin/templates/${template.id}?include_tags=true`);
      if (!response.ok) throw new Error("Failed to fetch template");
      return response.json();
    },
    enabled: !!template?.id,
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      title: template?.title || "",
      category: template?.category as any || "Fornecedores",
      purpose: template?.purpose || "",
      usageInstructions: template?.usageInstructions || "",
      content: template?.content || "",
      variableTips: template?.variableTips || "",
      status: template?.status as any || "published",
      selectedTags: templateWithTags?.tags?.map((tag: any) => tag.id) || [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const url = template ? `/api/admin/templates/${template.id}` : "/api/admin/templates";
      const method = template ? "PUT" : "POST";
      return await apiRequest(url, { method, body: data });
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Error saving template:", error);
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (tagData: { name: string; color: string }) => {
      return await apiRequest("/api/admin/template-tags", { 
        method: "POST", 
        body: tagData 
      });
    },
    onSuccess: () => {
      refetchTags();
      setShowNewTagForm(false);
      setNewTagName("");
      setNewTagColor("#3B82F6");
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
    },
  });

  const handleSubmit = async (data: TemplateFormData) => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    await createTagMutation.mutateAsync({
      name: newTagName.trim(),
      color: newTagColor
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {template ? "Editar Template" : "Criar Novo Template"}
          </h1>
          <p className="text-muted-foreground">
            {template ? "Edite as informações do template" : "Crie um novo template para a biblioteca"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Template</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Primeiro contato com fornecedor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
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

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finalidade</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Breve descrição do objetivo do template..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instruções e Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="usageInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções de Uso</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Explique quando e como usar este template..."
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corpo do Template</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Cole aqui o texto do template com as variáveis [NOME_VARIAVEL]..."
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Use [VARIAVEL] para indicar campos que o usuário deve preencher
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variableTips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dicas sobre Variáveis (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Explique o que significa cada variável e como preenchê-la..."
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags e Categorização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="selectedTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags do Template</FormLabel>
                    <div className="space-y-3">
                      {/* Tags selecionadas */}
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tagId) => {
                            const tag = templateTags?.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <Badge 
                                key={tagId} 
                                style={{ backgroundColor: tag.color }}
                                className="text-white pr-1"
                              >
                                {tag.name}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1 hover:bg-black/20"
                                  onClick={() => {
                                    field.onChange(field.value.filter(id => id !== tagId));
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Lista de tags disponíveis */}
                      {templateTags && templateTags.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Tags disponíveis:</Label>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {templateTags
                              .filter(tag => !field.value.includes(tag.id))
                              .map((tag) => (
                                <Button
                                  key={tag.id}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7"
                                  onClick={() => {
                                    field.onChange([...field.value, tag.id]);
                                  }}
                                >
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  {tag.name}
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Formulário para criar nova tag */}
                      {showNewTagForm ? (
                        <div className="border rounded-lg p-3 space-y-3">
                          <Label className="text-sm font-medium">Criar Nova Tag</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nome da tag"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="color"
                              value={newTagColor}
                              onChange={(e) => setNewTagColor(e.target.value)}
                              className="w-16"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleCreateTag}
                              disabled={!newTagName.trim() || createTagMutation.isPending}
                            >
                              {createTagMutation.isPending ? "Criando..." : "Criar Tag"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowNewTagForm(false);
                                setNewTagName("");
                                setNewTagColor("#3B82F6");
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewTagForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Nova Tag
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Publicação</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="published" />
                          <Label className="font-normal">
                            Publicar - Disponível para todos os alunos
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="draft" />
                          <Label className="font-normal">
                            Salvar como Rascunho - Visível apenas para administradores
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Template"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}