import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { ListViewToggle } from "@/components/common/list-view-toggle";
import { SearchFilters } from "@/components/common/search-filters";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
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
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, Plus, Edit, Trash2, Globe, Mail, Phone, ExternalLink } from "lucide-react";
import type { MySupplier } from "@shared/schema";

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
}

export default function MySuppliers() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MySupplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery<MySupplier[]>({
    queryKey: ['/api/my-suppliers', { page, pageSize, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      const response = await fetch(`/api/my-suppliers?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      const response = await apiRequest('POST', '/api/my-suppliers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({ title: "Fornecedor criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SupplierFormData> }) => {
      const response = await apiRequest('PUT', `/api/my-suppliers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-suppliers'] });
      toast({ title: "Fornecedor atualizado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/my-suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({ title: "Fornecedor removido com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      website: "",
      notes: "",
    });
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: MySupplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      website: supplier.website || "",
      notes: supplier.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const columns = [
    {
      key: "name" as keyof MySupplier,
      header: "Nome",
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: "email" as keyof MySupplier,
      header: "Email",
      render: (value: string) => value || (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "phone" as keyof MySupplier,
      header: "Telefone",
      render: (value: string) => value || (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "createdAt" as keyof MySupplier,
      header: "Adicionado em",
      render: (value: string) => (
        new Date(value).toLocaleDateString('pt-BR')
      ),
    },
    {
      key: "id" as keyof MySupplier,
      header: "Ações",
      render: (value: number, supplier: MySupplier) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(supplier)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate(supplier.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const SupplierCard = ({ supplier }: { supplier: MySupplier }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{supplier.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Adicionado em {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(supplier)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(supplier.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {supplier.notes && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {supplier.notes}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {supplier.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Site
              </a>
            </Button>
          )}
          {supplier.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${supplier.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </a>
            </Button>
          )}
          {supplier.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${supplier.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Telefone
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus contatos comerciais e histórico de conversas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ListViewToggle view={view} onViewChange={setView} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? "Editar Fornecedor" : "Adicionar Fornecedor"}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier 
                    ? "Atualize as informações do fornecedor."
                    : "Adicione um novo fornecedor ao seu CRM pessoal."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do fornecedor"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@fornecedor.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://fornecedor.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas e observações sobre o fornecedor..."
                      rows={3}
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingSupplier ? "Atualizar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SearchFilters
        searchPlaceholder="Buscar fornecedores..."
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title={
            searchQuery
              ? "Nenhum fornecedor encontrado"
              : "Nenhum fornecedor cadastrado"
          }
          description={
            searchQuery
              ? "Tente ajustar os termos de busca."
              : "Comece adicionando seus primeiros fornecedores ao seu CRM pessoal."
          }
          action={
            !searchQuery
              ? {
                  label: "Adicionar Primeiro Fornecedor",
                  onClick: () => setIsDialogOpen(true),
                }
              : undefined
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredSuppliers}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredSuppliers.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
