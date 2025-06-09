import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ListViewToggle } from "@/components/common/list-view-toggle";
import { SearchFilters } from "@/components/common/search-filters";
import { RatingDisplay } from "@/components/common/rating-display";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Factory, ExternalLink, MapPin, Shield, Globe } from "lucide-react";
import type { Supplier } from "@shared/schema";

export default function Suppliers() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers', { page, pageSize, search: searchQuery, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      if (searchQuery) {
        params.append('q', searchQuery);
        if (filters.productType) {
          params.append('productType', filters.productType);
        }
        if (filters.country) {
          params.append('country', filters.country);
        }
        const response = await fetch(`/api/suppliers/search?${params}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to search suppliers');
        return response.json();
      }

      const response = await fetch(`/api/suppliers?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch suppliers');
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
      key: "productType",
      label: "Tipo de Produto",
      options: [
        { value: "Eletrônicos", label: "Eletrônicos" },
        { value: "Têxtil", label: "Têxtil" },
        { value: "Casa e Jardim", label: "Casa e Jardim" },
        { value: "Esportes", label: "Esportes" },
        { value: "Beleza", label: "Beleza" },
      ],
    },
    {
      key: "country",
      label: "País",
      options: [
        { value: "China", label: "China" },
        { value: "Índia", label: "Índia" },
        { value: "Vietnã", label: "Vietnã" },
        { value: "Tailândia", label: "Tailândia" },
        { value: "Brasil", label: "Brasil" },
      ],
    },
  ];

  const columns = [
    {
      key: "name" as keyof Supplier,
      header: "Nome",
      render: (value: string, supplier: Supplier) => (
        <div className="flex items-center space-x-3">
          {supplier.logo ? (
            <img src={supplier.logo} alt={supplier.name} className="h-8 w-8 rounded" />
          ) : (
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <Factory className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <div className="font-medium">{value}</div>
            {supplier.isVerified && (
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
      key: "productType" as keyof Supplier,
      header: "Tipo de Produto",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "country" as keyof Supplier,
      header: "País",
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "discountInfo" as keyof Supplier,
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

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {supplier.logo ? (
              <img src={supplier.logo} alt={supplier.name} className="h-12 w-12 rounded-lg" />
            ) : (
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Factory className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{supplier.productType}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {supplier.country}
                </div>
              </div>
            </div>
          </div>
          {supplier.isVerified && (
            <Badge variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {supplier.description}
        </p>

        {supplier.discountInfo && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Desconto Exclusivo
            </div>
            <div className="text-sm text-green-600 dark:text-green-300">
              {supplier.discountInfo}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {supplier.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Site
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
          <h1 className="text-3xl font-bold">Fornecedores</h1>
          <p className="text-muted-foreground">
            Encontre fabricantes e distribuidores de produtos confiáveis
          </p>
        </div>
        <ListViewToggle view={view} onViewChange={setView} />
      </div>

      <SearchFilters
        searchPlaceholder="Buscar fornecedores..."
        filters={filterOptions}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : !suppliers || suppliers.length === 0 ? (
        <EmptyState
          icon={<Factory className="h-12 w-12" />}
          title="Nenhum fornecedor encontrado"
          description={
            searchQuery
              ? "Tente ajustar os filtros de busca para encontrar outros fornecedores."
              : "Ainda não há fornecedores cadastrados no sistema."
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <DataTable
          data={suppliers}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={suppliers.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
