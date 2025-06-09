import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ListViewToggle } from "@/components/common/list-view-toggle";
import { SearchFilters } from "@/components/common/search-filters";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Headphones, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
import type { Ticket } from "@shared/schema";

interface TicketFormData {
  title: string;
  category: string;
  description: string;
}

const ticketCategories = [
  "Dúvida sobre Curso",
  "Problema Técnico", 
  "Financeiro",
  "Sugestão"
];

const statusConfig = {
  open: { label: "Aberto", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: AlertCircle },
  responded: { label: "Respondido", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: MessageCircle },
  closed: { label: "Fechado", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: CheckCircle }
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
};

export default function Tickets() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    category: "",
    description: "",
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets', { page, pageSize, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      const response = await fetch(`/api/tickets?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest('POST', '/api/tickets', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({ title: "Chamado criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar chamado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filteredTickets = tickets?.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const columns = [
    {
      key: "title" as keyof Ticket,
      header: "Título",
      render: (value: string, ticket: Ticket) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">#{ticket.id}</div>
        </div>
      ),
    },
    {
      key: "category" as keyof Ticket,
      header: "Categoria",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "status" as keyof Ticket,
      header: "Status",
      render: (value: string) => {
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config.icon;
        return (
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "priority" as keyof Ticket,
      header: "Prioridade",
      render: (value: string) => {
        const config = priorityConfig[value as keyof typeof priorityConfig];
        return (
          <Badge className={config.color}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "createdAt" as keyof Ticket,
      header: "Criado em",
      render: (value: string) => (
        new Date(value).toLocaleDateString('pt-BR')
      ),
    },
  ];

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig];
    const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig];
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{ticket.category}</Badge>
                  <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Badge className={statusInfo.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Badge className={priorityInfo.color}>
                {priorityInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {ticket.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
            <span>Criado em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ver Detalhes
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
          <h1 className="text-3xl font-bold">Chamados</h1>
          <p className="text-muted-foreground">
            Sistema de tickets para suporte e dúvidas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ListViewToggle view={view} onViewChange={setView} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Abrir Chamado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Novo Chamado</DialogTitle>
                <DialogDescription>
                  Descreva sua dúvida ou problema detalhadamente para que possamos ajudá-lo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Resumo do problema ou dúvida"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva detalhadamente seu problema ou dúvida..."
                      rows={5}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Criando..." : "Abrir Chamado"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SearchFilters
        searchPlaceholder="Buscar chamados..."
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={<Headphones className="h-12 w-12" />}
          title={
            searchQuery
              ? "Nenhum chamado encontrado"
              : "Nenhum chamado aberto"
          }
          description={
            searchQuery
              ? "Tente ajustar os termos de busca."
              : "Você ainda não tem chamados de suporte. Abra um chamado se precisar de ajuda."
          }
          action={
            !searchQuery
              ? {
                  label: "Abrir Primeiro Chamado",
                  onClick: () => setIsDialogOpen(true),
                }
              : undefined
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredTickets}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredTickets.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
