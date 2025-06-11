import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  Copy,
  Zap,
  Filter,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Palette,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Target
} from "lucide-react";
import type { AiPrompt } from "@shared/schema";

const categoryIcons = {
  "Geração de Imagens e Conteúdo Visual": Palette,
  "Pesquisa e Análise de Produtos": TrendingUp,
  "Comunicação com Fornecedores": MessageSquare,
  "Estratégias de Marca e Marketing": Target,
  "Gestão Financeira e Operacional": DollarSign,
};

const categoryColors = {
  "Geração de Imagens e Conteúdo Visual": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Pesquisa e Análise de Produtos": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Comunicação com Fornecedores": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Estratégias de Marca e Marketing": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "Gestão Financeira e Operacional": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AiPrompts() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<AiPrompt | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const itemsPerPage = 25;
  const { toast } = useToast();

  const { data: prompts = [], isLoading } = useQuery<AiPrompt[]>({
    queryKey: ['/api/ai-prompts'],
  });

  const categories = prompts.reduce((acc: string[], prompt) => {
    if (!acc.includes(prompt.category)) {
      acc.push(prompt.category);
    }
    return acc;
  }, []);

  const copyToClipboard = async (content: string, promptId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      
      // Track usage
      await fetch(`/api/ai-prompts/${promptId}/use`, { method: 'POST' });
      
      toast({
        title: "Prompt copiado!",
        description: "O prompt foi copiado para sua área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o prompt.",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (promptId: number) => {
    setExpandedPrompt(expandedPrompt === promptId ? null : promptId);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !search || 
      prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      prompt.description.toLowerCase().includes(search.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory === "DESTACADOS") {
      matchesCategory = prompt.isFeatured;
    } else if (selectedCategory && selectedCategory !== "all") {
      matchesCategory = prompt.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Featured items always come first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    // Then sort by title alphabetically
    return a.title.localeCompare(b.title);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Prompts de IA</h1>
        </div>
        <p className="text-muted-foreground">
          Biblioteca completa com 15 prompts profissionais para vendedores Amazon Brasil
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[240px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todas Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="DESTACADOS" className="text-orange-600 font-medium">
                ⭐ DESTACADOS
              </SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{prompts.length}</div>
            <div className="text-sm text-muted-foreground">Prompts Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categorias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {prompts.reduce((sum, p) => sum + p.useCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total de Usos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredPrompts.length}</div>
            <div className="text-sm text-muted-foreground">Resultados</div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {paginatedPrompts.map((prompt) => {
          const Icon = categoryIcons[prompt.category as keyof typeof categoryIcons] || BookOpen;
          const isExpanded = expandedPrompt === prompt.id;
          
          return (
            <Card key={prompt.id} className="transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col h-full" onClick={() => toggleExpand(prompt.id)}>
              <CardHeader className="pb-3 flex-1">
                <div className="h-full flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <h3 className="font-semibold text-sm truncate">{prompt.title}</h3>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{prompt.useCount}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(prompt.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`${categoryColors[prompt.category as keyof typeof categoryColors]} text-xs`}>
                        {prompt.category}
                      </Badge>
                      {prompt.isFeatured && (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                          Testado e Aprovado
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {prompt.description}
                    </p>
                  </div>
                  
                  <div className="min-h-[24px] flex items-center">
                    {prompt.isFeatured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs w-fit">
                        ⭐ DESTACADO
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {prompt.instructions && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-900 dark:text-blue-200 mb-2">
                        📋 Como usar:
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {prompt.instructions}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Prompt Completo:</h4>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(prompt.content, prompt.id)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                    </div>
                    
                    <Textarea
                      value={prompt.content}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  {prompt.placeholders && Array.isArray(prompt.placeholders) && prompt.placeholders.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-amber-900 dark:text-amber-200 mb-3">
                        🔧 Campos para personalizar:
                      </h4>
                      <div className="space-y-2">
                        {(prompt.placeholders as any[]).map((placeholder: any, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                              {placeholder?.field || ""}
                            </span>
                            <span className="text-amber-800 dark:text-amber-300 ml-2">
                              - {placeholder?.description || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum prompt encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}