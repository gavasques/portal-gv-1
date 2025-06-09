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
import { Wrench, ExternalLink, Globe, Shield, DollarSign } from "lucide-react";
import type { Tool } from "@shared/schema";

export default function Tools() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: tools, isLoading } = useQuery<Tool[]>({
    queryKey: ['/api/tools', { page, pageSize, search: searchQuery, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      if (searchQuery) {
        params.append('q', searchQuery);
        if (filters.primaryFunction) {
          params.append('primaryFunction', filters.primaryFunction);
        }
        const response = await fetch(`/api/tools/search?${params}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to search tools');
        return response.json();
      }

      const response = await fetch(`/api/tools?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch tools');
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
      key: "primaryFunction",
      label: "Função Principal",
      options: [
        { value: "Pesquisa de Palavras-chave", label: "Pesquisa de Palavras-chave" },
        { value: "Gestão Financeira", label: "Gestão Financeira" },
        { value: "Automação de Marketing", label: "Automação de Marketing" },
        { value: "Análise de Concorrência", label: "Análise de Concorrência" },
        { value: "Gestão de Estoque", label: "Gestão de Estoque" },
      ],
    },
  ];

  const columns = [
    {
      key: "name" as keyof Tool,
      header: "Nome",
      render: (value: string, tool: Tool) => (
        <div className="flex items-center space-x-3">
          {tool.logo ? (
            <img src={tool.logo} alt={tool.name} className="h-8 w-8 rounded" />
          ) : (
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <div className="font-medium">{value}</div>
            {tool.isVerified && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "primaryFunction" as keyof Tool,
      header: "Função Principal",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "pricing" as keyof Tool,
      header: "Preço",
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Consultar</span>
      ),
    },
    {
      key: "discountInfo" as keyof Tool,
      header: "Desconto",
      render: (value: string) => value ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {value}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
  ];

  const ToolCard = ({ tool }: { tool: Tool }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {tool.logo ? (
              <img src={tool.logo} alt={tool.name} className="h-12 w-12 rounded-lg" />
            ) : (
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              <Badge variant="outline" className="mt-1">{tool.primaryFunction}</Badge>
            </div>
          </div>
          {tool.isVerified && (
            <Badge variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {tool.description}
        </p>

        {tool.pricing && (
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="font-medium">{tool.pricing}</span>
          </div>
        )}

        {tool.discountInfo && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Desconto Exclusivo
            </div>
            <div className="text-sm text-green-600 dark:text-green-300">
              {tool.discountInfo}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {tool.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={tool.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Acessar
                </a>
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ferramentas</h1>
          <p className="text-muted-foreground">
            Descubra softwares e plataformas para otimizar seu e-commerce
          </p>
        </div>
        <ListViewToggle view={view} onViewChange={setView} />
      </div>

      <SearchFilters
        searchPlaceholder="Buscar ferramentas..."
        filters={filterOptions}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : !tools || tools.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-12 w-12" />}
          title="Nenhuma ferramenta encontrada"
          description={
            searchQuery
              ? "Tente ajustar os filtros de busca para encontrar outras ferramentas."
              : "Ainda não há ferramentas cadastradas no sistema."
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <DataTable
          data={tools}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={tools.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
