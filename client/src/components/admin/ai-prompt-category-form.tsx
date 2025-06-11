import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Palette, Brain, Search, Target, Users, Settings } from "lucide-react";
import type { AiPromptCategory, InsertAiPromptCategory } from "@shared/schema";
import { insertAiPromptCategorySchema } from "@shared/schema";

interface AiPromptCategoryFormProps {
  category?: AiPromptCategory;
  onSuccess?: () => void;
}

const iconOptions = [
  { value: "Brain", label: "Cérebro", icon: Brain },
  { value: "Palette", label: "Paleta", icon: Palette },
  { value: "Search", label: "Pesquisa", icon: Search },
  { value: "Target", label: "Alvo", icon: Target },
  { value: "Users", label: "Usuários", icon: Users },
  { value: "Settings", label: "Configurações", icon: Settings },
];

const colorOptions = [
  { value: "#6b7280", label: "Cinza", color: "#6b7280" },
  { value: "#3b82f6", label: "Azul", color: "#3b82f6" },
  { value: "#10b981", label: "Verde", color: "#10b981" },
  { value: "#f59e0b", label: "Âmbar", color: "#f59e0b" },
  { value: "#ef4444", label: "Vermelho", color: "#ef4444" },
  { value: "#8b5cf6", label: "Roxo", color: "#8b5cf6" },
  { value: "#ec4899", label: "Rosa", color: "#ec4899" },
  { value: "#06b6d4", label: "Ciano", color: "#06b6d4" },
];

export default function AiPromptCategoryForm({ category, onSuccess }: AiPromptCategoryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertAiPromptCategory>({
    resolver: zodResolver(insertAiPromptCategorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      icon: category?.icon || "Brain",
      color: category?.color || "#6b7280",
      isActive: category?.isActive ?? true,
    },
  });

  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: (data: InsertAiPromptCategory) => apiRequest('/api/ai-prompt-categories', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prompt-categories'] });
      setIsOpen(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "Categoria criada",
        description: "A categoria de prompt AI foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: (data: InsertAiPromptCategory) => 
      apiRequest(`/api/ai-prompt-categories/${category!.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prompt-categories'] });
      setIsOpen(false);
      onSuccess?.();
      toast({
        title: "Categoria atualizada",
        description: "A categoria de prompt AI foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAiPromptCategory) => {
    if (category) {
      updateCategory(data);
    } else {
      createCategory(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria de Prompt AI"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Geração de Imagens" {...field} />
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
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o propósito desta categoria..."
                      rows={3}
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
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: option.color }}
                              />
                              {option.label}
                            </div>
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
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Categoria Ativa</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Categorias inativas não aparecem nos formulários
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || isUpdating}
              >
                {category ? "Atualizar" : "Criar"} Categoria
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}