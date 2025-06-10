import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Grid, List, X } from "lucide-react";
import { Link } from "wouter";
import type { Template, TemplateTag } from "@shared/schema";

const categories = [
  "Todos",
  "Fornecedores", 
  "Amazon", 
  "Ferramentas", 
  "Negociação", 
  "Marketing"
];

const tagColors = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#EC4899", // pink
  "#6B7280", // gray
];

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates", searchQuery, selectedCategory, selectedTags],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "Todos") params.append("category", selectedCategory);
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
      
      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json() as Template[];
    },
  });

  const { data: templateTags } = useQuery({
    queryKey: ["/api/template-tags"],
    queryFn: async () => {
      const response = await fetch("/api/template-tags");
      if (!response.ok) throw new Error("Failed to fetch template tags");
      return response.json() as TemplateTag[];
    },
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setSelectedTags([]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Biblioteca de Templates</h1>
        <p className="text-muted-foreground">
          Comunicação profissional pronta para copiar e colar.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg p-1">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {templates && templates.length > 0 ? (
        viewMode === "list" ? (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{template.title}</h3>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{template.purpose}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{template.copyCount} cópias</span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/templates/${template.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Template
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <FileText className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {template.purpose}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {template.copyCount} cópias
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/templates/${template.id}`}>
                        Ver Template
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de busca ou categoria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}