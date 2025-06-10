import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  FileText, 
  Video, 
  Download, 
  ExternalLink,
  Eye,
  Lock,
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Material } from "@shared/schema";

const formatIcons = {
  artigo_texto: FileText,
  documento_pdf: Download,
  fluxograma_miro: Globe,
  embed_iframe: Globe,
  video_youtube: Video,
  video_panda: Video,
  audio: Video,
  planilha_excel: Download,
  arquivo_word: Download,
  link_pasta: ExternalLink,
  link_documento: ExternalLink
};

const categoryOptions = [
  "Estratégias de E-commerce",
  "Marketing Digital",
  "Logística",
  "Fornecedores",
  "Análise de Mercado",
  "Ferramentas",
  "Cases de Sucesso"
];

function MaterialCard({ material }: { material: Material }) {
  const { user } = useAuth();
  const canAccess = material.accessLevel === "Public" || (user && user.groupId !== null);
  const Icon = formatIcons[material.type as keyof typeof formatIcons] || FileText;

  return (
    <Card className="card-hover cursor-pointer h-full">
      <Link href={`/materials/${material.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-1 flex-wrap">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <Badge variant={canAccess ? "default" : "secondary"} className="text-xs">
                {material.accessLevel === "Public" ? (
                  <>
                    <Globe className="h-2 w-2 mr-1" />
                    Público
                  </>
                ) : (
                  <>
                    <Lock className="h-2 w-2 mr-1" />
                    Exclusivo
                  </>
                )}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
            {material.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
            {material.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs truncate max-w-24">
              {material.category}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{material.viewCount}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function MaterialListItem({ material }: { material: Material }) {
  const { user } = useAuth();
  const canAccess = material.accessLevel === "Public" || (user && user.groupId !== null);
  const Icon = formatIcons[material.type as keyof typeof formatIcons] || FileText;

  return (
    <Link href={`/materials/${material.id}`}>
      <div className="flex items-start p-3 hover:bg-muted/50 border-b border-border last:border-b-0 cursor-pointer gap-3">
        <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-medium line-clamp-2 leading-tight">
            {material.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {material.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {material.category && material.category.length > 15 
                ? material.category.substring(0, 15) + "..." 
                : material.category || "Geral"}
            </Badge>
            <Badge variant={canAccess ? "default" : "secondary"} className="text-xs">
              {material.accessLevel === "Public" ? (
                <>
                  <Globe className="h-2 w-2 mr-1" />
                  Público
                </>
              ) : (
                <>
                  <Lock className="h-2 w-2 mr-1" />
                  Exclusivo
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Materials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ['/api/materials', { 
      search: searchQuery, 
      category: selectedCategory, 
      format: selectedFormat,
      page: currentPage,
      limit: itemsPerPage 
    }],
  });

  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || material.category === selectedCategory;
    const matchesFormat = !selectedFormat || selectedFormat === "all" || material.type === selectedFormat;
    
    return matchesSearch && matchesCategory && matchesFormat;
  }) || [];

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Biblioteca de Materiais</h1>
        <p className="text-muted-foreground">
          Acesse conteúdos educacionais, guias práticos e recursos exclusivos
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="flex gap-2 flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1 min-w-0 text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categoryOptions.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.length > 20 ? category.substring(0, 20) + "..." : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="flex-1 min-w-0 text-xs max-w-32">
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="text">Artigo</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="embed">Embed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg self-start">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none px-3"
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none px-3"
                >
                  <Grid3X3 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials List/Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {paginatedMaterials.map((material) => (
                  <MaterialListItem key={material.id} material={material} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
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

          {/* No results */}
          {paginatedMaterials.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum material encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}