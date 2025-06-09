import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Database } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CadastroForm } from "@/components/admin/cadastro-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CadastroItem {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

const cadastroTypes = [
  { 
    key: "material-types", 
    title: "Tipos de Materiais", 
    description: "Gerencie os tipos de materiais disponíveis no sistema" 
  },
  { 
    key: "software-types", 
    title: "Tipos de Softwares", 
    description: "Configure os tipos de softwares e ferramentas" 
  },
  { 
    key: "supplier-types", 
    title: "Tipos de Fornecedores", 
    description: "Defina as categorias de fornecedores" 
  },
  { 
    key: "product-categories", 
    title: "Categorias de Produtos", 
    description: "Organize as categorias de produtos" 
  },
  { 
    key: "partner-categories", 
    title: "Categorias de Parceiros", 
    description: "Classifique os tipos de parceiros" 
  }
];

function CadastroTable({ 
  type, 
  items, 
  isLoading, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}: {
  type: string;
  items: CadastroItem[];
  isLoading: boolean;
  onEdit: (item: CadastroItem) => void;
  onToggleStatus: (id: number, status: boolean) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum item cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium">{item.name}</h3>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={item.isActive}
                onCheckedChange={(checked) => onToggleStatus(item.id, checked)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AdminCadastros() {
  const [selectedType, setSelectedType] = useState(cadastroTypes[0].key);
  const [editingItem, setEditingItem] = useState<CadastroItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data for current type
  const { data: items = [], isLoading } = useQuery({
    queryKey: [`/api/${selectedType}`],
    enabled: !!selectedType,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CadastroItem> }) => {
      return apiRequest(`/api/${selectedType}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${selectedType}`] });
      toast({ title: "Item atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/${selectedType}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${selectedType}`] });
      toast({ title: "Item removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover item", variant: "destructive" });
    },
  });

  const handleEdit = (item: CadastroItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive } });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: [`/api/${selectedType}`] });
  };

  const currentTypeInfo = cadastroTypes.find(t => t.key === selectedType);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cadastros</h1>
        <p className="text-muted-foreground">
          Gerencie os dados de referência do sistema
        </p>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {cadastroTypes.map((type) => (
            <TabsTrigger key={type.key} value={type.key} className="text-xs">
              {type.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {cadastroTypes.map((type) => (
          <TabsContent key={type.key} value={type.key}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Editar" : "Adicionar"} {currentTypeInfo?.title}
                        </DialogTitle>
                        <DialogDescription>
                          {editingItem 
                            ? "Modifique as informações do item"
                            : "Preencha os dados para criar um novo item"
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <CadastroForm
                        type={selectedType}
                        item={editingItem}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsFormOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <CadastroTable
                  type={selectedType}
                  items={items}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}