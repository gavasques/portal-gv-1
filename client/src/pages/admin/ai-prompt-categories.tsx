import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Trash2, Brain, Palette, Target, Users, Settings } from "lucide-react";
import type { AiPromptCategory } from "@shared/schema";
import AiPromptCategoryForm from "@/components/admin/ai-prompt-category-form";

const iconMap = {
  Brain,
  Palette,
  Search,
  Target,
  Users,
  Settings,
};

export default function AdminAiPromptCategories() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<AiPromptCategory[]>({
    queryKey: ['/api/ai-prompt-categories'],
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/ai-prompt-categories/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prompt-categories'] });
      toast({
        title: "Categoria excluída",
        description: "A categoria de prompt AI foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (data: { id: number; isActive: boolean }) =>
      apiRequest(`/api/ai-prompt-categories/${data.id}`, 'PUT', { isActive: data.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prompt-categories'] });
      toast({
        title: "Status atualizado",
        description: "Status da categoria foi atualizado.",
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categorias de Prompt AI</h1>
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
        <h1 className="text-3xl font-bold">Categorias de Prompt AI</h1>
        <AiPromptCategoryForm />
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCategories.length} categoria(s) encontrada(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Brain;
          
          return (
            <Card key={category.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <AiPromptCategoryForm category={category} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive({ 
                        id: category.id, 
                        isActive: !category.isActive 
                      })}
                    >
                      {category.isActive ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta categoria?')) {
                        deleteCategory(category.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {search ? "Não há categorias que correspondam à sua busca." : "Comece criando sua primeira categoria de prompt AI."}
            </p>
            {!search && <AiPromptCategoryForm />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}