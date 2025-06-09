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
import { Handshake, ExternalLink, Mail, Phone, Globe, Shield } from "lucide-react";
import type { Partner } from "@shared/schema";

export default function Partners() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ['/api/partners', { page, pageSize, search: searchQuery, ...filters }],
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
        const response = await fetch(`/api/partners/search?${params}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to search partners');
        return response.json();
      }

      const response = await fetch(`/api/partners?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch partners');
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
        { value: "Contabilidade", label: "Contabilidade" },
        { value: "Jurídico", label: "Jurídico" },
        { value: "Despachante", label: "Despachante" },
        { value: "Fotografia", label: "Fotografia" },
        { value: "Marketing", label: "Marketing" },
      ],
    },
  ];

  const columns = [
    {
      key: "name" as keyof Partner,
      header: "Nome",
      render: (value: string, partner: Partner) => (
        <div className="flex items-center space-x-3">
          {partner.logo ? (
            <img src={partner.logo} alt={partner.name} className="h-8 w-8 rounded" />
          ) : (
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <Handshake className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <div className="font-medium">{value}</div>
            {partner.isVerified && (
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
      key: "category" as keyof Partner,
      header: "Categoria",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "description" as keyof Partner,
      header: "Descrição",
      render: (value: string) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    {
      key: "discountInfo" as keyof Partner,
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

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {partner.logo ? (
              <img src={partner.logo} alt={partner.name} className="h-12 w-12 rounded-lg" />
            ) : (
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Handshake className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{partner.name}</CardTitle>
              <Badge variant="outline" className="mt-1">{partner.category}</Badge>
            </div>
          </div>
          {partner.isVerified && (
            <Badge variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {partner.description}
        </p>

        {partner.discountInfo && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Desconto Exclusivo
            </div>
            <div className="text-sm text-green-600 dark:text-green-300">
              {partner.discountInfo}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {partner.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={partner.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Site
                </a>
              </Button>
            )}
            {partner.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${partner.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
            {partner.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${partner.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Telefone
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
          <h1 className="text-3xl font-bold">Parceiros</h1>
          <p className="text-muted-foreground">
            Encontre prestadores de serviços essenciais para seu negócio
          </p>
        </div>
        <ListViewToggle view={view} onViewChange={setView} />
      </div>

      <SearchFilters
        searchPlaceholder="Buscar parceiros..."
        filters={filterOptions}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : !partners || partners.length === 0 ? (
        <EmptyState
          icon={<Handshake className="h-12 w-12" />}
          title="Nenhum parceiro encontrado"
          description={
            searchQuery
              ? "Tente ajustar os filtros de busca para encontrar outros parceiros."
              : "Ainda não há parceiros cadastrados no sistema."
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <DataTable
          data={partners}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={partners.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
