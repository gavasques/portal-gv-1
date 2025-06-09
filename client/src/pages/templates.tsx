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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Copy, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates', { page, pageSize, search: searchQuery, ...filters }],
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
        if (filters.language) {
          params.append('language', filters.language);
        }
        const response = await fetch(`/api/templates/search?${params}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to search templates');
        return response.json();
      }

      const response = await fetch(`/api/templates?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  const handleSearch = (query: string, newFilters: Record<string, string>) => {
    setSearchQuery(query);
    setFilters(newFilters);
    setPage(1);
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: "Template copiado para a área de transferência!" });
    } catch (error) {
      toast({
        title: "Erro ao copiar template",
        description: "Não foi possível copiar o template para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const filterOptions = [
    {
      key: "category",
      label: "Categoria",
      options: [
        { value: "Primeiro Contato", label: "Primeiro Contato" },
        { value: "Negociação", label: "Negociação" },
        { value: "Suporte", label: "Suporte" },
        { value: "Amazon", label: "Amazon" },
        { value: "Importação", label: "Importação" },
      ],
    },
    {
      key: "language",
      label: "Idioma",
      options: [
        { value: "pt", label: "Português" },
        { value: "en", label: "Inglês" },
        { value: "es", label: "Espanhol" },
      ],
    },
  ];

  const columns = [
    {
      key: "title" as keyof Template,
      header: "Título",
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: "category" as keyof Template,
      header: "Categoria",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "language" as keyof Template,
      header: "Idioma",
      render: (value: string) => {
        const languages: Record<string, string> = {
          pt: "Português",
          en: "Inglês",
          es: "Espanhol",
        };
        return (
          <span>{languages[value] || value}</span>
        );
      },
    },
    {
      key: "subject" as keyof Template,
      header: "Assunto",
      render: (value: string) => value || (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "id" as keyof Template,
      header: "Ações",
      render: (value: number, template: Template) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTemplate(template)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(template.content)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{template.category}</Badge>
                <Badge variant="secondary">
                  {template.language === "pt" ? "Português" : 
                   template.language === "en" ? "Inglês" : 
                   template.language === "es" ? "Espanhol" : template.language}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {template.subject && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">Assunto:</div>
            <div className="text-sm">{template.subject}</div>
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.content}
        </p>

        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTemplate(template)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(template.content)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Biblioteca de modelos para otimizar sua comunicação
          </p>
        </div>
        <ListViewToggle view={view} onViewChange={setView} />
      </div>

      <SearchFilters
        searchPlaceholder="Buscar templates..."
        filters={filterOptions}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Nenhum template encontrado"
          description={
            searchQuery
              ? "Tente ajustar os filtros de busca para encontrar outros templates."
              : "Ainda não há templates disponíveis no sistema."
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <DataTable
          data={templates}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={templates.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.category} • {
                selectedTemplate?.language === "pt" ? "Português" : 
                selectedTemplate?.language === "en" ? "Inglês" : 
                selectedTemplate?.language === "es" ? "Espanhol" : selectedTemplate?.language
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTemplate?.subject && (
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Assunto:</div>
                <div className="p-3 bg-muted/50 rounded-lg font-medium">
                  {selectedTemplate.subject}
                </div>
              </div>
            )}
            
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-2">Conteúdo:</div>
              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                {selectedTemplate?.content}
              </div>
            </div>

            {selectedTemplate?.tags && selectedTemplate.tags.length > 0 && (
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={() => selectedTemplate && copyToClipboard(selectedTemplate.content)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
