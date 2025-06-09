import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ListViewToggle } from "@/components/common/list-view-toggle";
import { SearchFilters } from "@/components/common/search-filters";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useAuth } from "@/hooks/use-auth";
import { BookMarked, Download, ExternalLink, FileText, Link, Play, Eye } from "lucide-react";
import type { Material } from "@shared/schema";

const typeIcons = {
  pdf: FileText,
  text: FileText,
  link: Link,
  embed: Play
};

const typeLabels = {
  pdf: "PDF",
  text: "Texto",
  link: "Link",
  embed: "Vídeo/Embed"
};

export default function Materials() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { user } = useAuth();

  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ['/api/materials', { page, pageSize, search: searchQuery, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      if (searchQuery) {
        params.append('q', searchQuery);
        if (filters.category) {
          params.append('category', filters.category);
        }
        const response = await fetch(`/api/materials/search?${params}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to search materials');
        return response.json();
      }

      const response = await fetch(`/api/materials?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch materials');
      return response.json();
    },
  });

  const handleSearch = (query: string, newFilters: Record<string, string>) => {
    setSearchQuery(query);
    setFilters(newFilters);
    setPage(1);
  };

  const filterOptions = [
    {
      key: "category",
      label: "Categoria",
      options: [
        { value: "Curso", label: "Curso" },
        { value: "Importação", label: "Importação" },
        { value: "Amazon", label: "Amazon" },
        { value: "Fornecedores", label: "Fornecedores" },
        { value: "Marketing", label: "Marketing" },
      ],
    },
  ];

  const handleMaterialAccess = (material: Material) => {
    if (material.type === 'link' && material.url) {
      window.open(material.url, '_blank');
    } else if (material.type === 'pdf' && material.filePath) {
      window.open(material.filePath, '_blank');
    }
    // For text and embed types, you could open a modal or navigate to a detail page
  };

  const columns = [
    {
      key: "title" as keyof Material,
      header: "Título",
      render: (value: string, material: Material) => {
        const Icon = typeIcons[material.type as keyof typeof typeIcons] || FileText;
        return (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {typeLabels[material.type as keyof typeof typeLabels]}
                </Badge>
                {material.accessLevel === 'Restricted' && (
                  <Badge variant="secondary" className="text-xs">
                    Restrito
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "category" as keyof Material,
      header: "Categoria",
      render: (value: string) => value ? (
        <Badge variant="outline">{value}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "downloadCount" as keyof Material,
      header: "Downloads",
      render: (value: number) => (
        <span className="text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "viewCount" as keyof Material,
      header: "Visualizações",
      render: (value: number) => (
        <span className="text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "id" as keyof Material,
      header: "Ações",
      render: (value: number, material: Material) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleMaterialAccess(material)}
        >
          {material.type === 'link' ? (
            <ExternalLink className="h-4 w-4" />
          ) : material.type === 'pdf' ? (
            <Download className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      ),
    },
  ];

  const MaterialCard = ({ material }: { material: Material }) => {
    const Icon = typeIcons[material.type as keyof typeof typeIcons] || FileText;
    const typeLabel = typeLabels[material.type as keyof typeof typeLabels];

    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{material.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{typeLabel}</Badge>
                  {material.category && (
                    <Badge variant="secondary">{material.category}</Badge>
                  )}
                  {material.accessLevel === 'Restricted' && (
                    <Badge variant="destructive" className="text-xs">
                      Restrito
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {material.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {material.description}
            </p>
          )}

          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {material.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {material.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{material.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex space-x-4">
              <span>{material.viewCount} visualizações</span>
              <span>{material.downloadCount} downloads</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              className="w-full"
              onClick={() => handleMaterialAccess(material)}
            >
              {material.type === 'link' ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar Link
                </>
              ) : material.type === 'pdf' ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materiais</h1>
          <p className="text-muted-foreground">
            Biblioteca de conteúdo para aprendizado contínuo
          </p>
        </div>
        <ListViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Access Level Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">
                Seu Nível de Acesso: {user.accessLevel}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {user.accessLevel === 'Basic' 
                  ? "Você tem acesso aos materiais públicos"
                  : "Você tem acesso a todos os materiais, incluindo conteúdo restrito"
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SearchFilters
        searchPlaceholder="Buscar materiais..."
        filters={filterOptions}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : !materials || materials.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="h-12 w-12" />}
          title="Nenhum material encontrado"
          description={
            searchQuery
              ? "Tente ajustar os filtros de busca para encontrar outros materiais."
              : user.accessLevel === 'Basic'
              ? "Ainda não há materiais públicos disponíveis. Faça upgrade para acessar mais conteúdo."
              : "Ainda não há materiais disponíveis no sistema."
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <DataTable
          data={materials}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={materials.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
