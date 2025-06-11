import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Package, Settings, Search, FileType, Layers, Code, Truck, ShoppingCart, Users, ChevronDown, Brain } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MaterialTypeForm from "@/components/admin/material-type-form";
import type { MaterialType, MaterialCategory, SoftwareType, SupplierType, ProductCategory, PartnerCategory, AiPromptCategory } from "@shared/schema";

// Common form schemas
const materialTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const materialCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const softwareTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const supplierTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const productCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const partnerCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const aiPromptCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
});

type MaterialTypeFormData = z.infer<typeof materialTypeSchema>;
type MaterialCategoryFormData = z.infer<typeof materialCategorySchema>;
type SoftwareTypeFormData = z.infer<typeof softwareTypeSchema>;
type SupplierTypeFormData = z.infer<typeof supplierTypeSchema>;
type ProductCategoryFormData = z.infer<typeof productCategorySchema>;
type PartnerCategoryFormData = z.infer<typeof partnerCategorySchema>;
type AiPromptCategoryFormData = z.infer<typeof aiPromptCategorySchema>;

// Helper function to get format type labels
function getFormatTypeLabel(formatType: string): string {
  const labels: Record<string, string> = {
    text: "Texto/Artigo",
    embed: "Embed HTML", 
    iframe: "iFrame",
    youtube: "YouTube",
    pdf: "PDF",
    audio: "Áudio",
    video: "Vídeo",
    link: "Link Externo",
    upload: "Upload de Arquivo"
  };
  return labels[formatType] || formatType;
}

// Generic CRUD hook for all cadastros types
function useCrudOperations<T, F>(
  queryKey: string,
  schema: z.ZodSchema<F>,
  entityName: string
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await fetch(queryKey);
      if (!response.ok) throw new Error(`Failed to fetch ${entityName}`);
      return response.json();
    },
  });

  const { mutate: createItem, isPending: isCreating } = useMutation({
    mutationFn: async (data: F) => {
      return apiRequest(queryKey, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: `${entityName} criado`,
        description: `O ${entityName} foi criado com sucesso.`
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: `Não foi possível criar o ${entityName}.`,
        variant: "destructive"
      });
    },
  });

  const { mutate: updateItem, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: F }) => {
      return apiRequest(`${queryKey}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: `${entityName} atualizado`,
        description: `O ${entityName} foi atualizado com sucesso.`
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o ${entityName}.`,
        variant: "destructive"
      });
    },
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`${queryKey}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: `${entityName} excluído`,
        description: `O ${entityName} foi removido com sucesso.`
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: `Não foi possível excluir o ${entityName}.`,
        variant: "destructive"
      });
    },
  });

  return {
    items,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
  };
}

// Generic form component
function GenericForm<T extends { id: number; name: string; description?: string | null; isActive: boolean }>({
  schema,
  editingItem,
  onSubmit,
  onCancel,
  isLoading,
  entityName,
}: {
  schema: z.ZodSchema<any>;
  editingItem: T | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  entityName: string;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editingItem?.name || "",
      description: editingItem?.description || "",
      isActive: editingItem?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder={`Nome do ${entityName}`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder={`Descreva o ${entityName}...`}
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Ativo</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Controla se o item está disponível para uso
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {editingItem ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Generic card grid component
function ItemGrid<T extends { id: number; name: string; description?: string | null; isActive: boolean; createdAt: Date; formatType?: string }>({
  items,
  isLoading,
  onEdit,
  onDelete,
  searchQuery,
  icon: Icon,
  entityName,
}: {
  items: T[];
  isLoading: boolean;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  searchQuery: string;
  icon: React.ComponentType<{ className?: string }>;
  entityName: string;
}) {
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Tente ajustar os termos de busca." : `Comece criando seu primeiro ${entityName}.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Icon className="h-5 w-5 text-primary" />
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
            {item.formatType && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getFormatTypeLabel(item.formatType)}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminCadastros() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("material-types");
  const [editingItem, setEditingItem] = useState<any>(null);

  // CRUD operations for each entity type
  const materialTypes = useCrudOperations<MaterialType, MaterialTypeFormData>('/api/material-types', materialTypeSchema, 'tipo de material');
  const materialCategories = useCrudOperations<MaterialCategory, MaterialCategoryFormData>('/api/material-categories', materialCategorySchema, 'categoria de material');
  const softwareTypes = useCrudOperations<SoftwareType, SoftwareTypeFormData>('/api/software-types', softwareTypeSchema, 'tipo de software');
  const supplierTypes = useCrudOperations<SupplierType, SupplierTypeFormData>('/api/supplier-types', supplierTypeSchema, 'tipo de fornecedor');
  const productCategories = useCrudOperations<ProductCategory, ProductCategoryFormData>('/api/product-categories', productCategorySchema, 'categoria de produto');
  const partnerCategories = useCrudOperations<PartnerCategory, PartnerCategoryFormData>('/api/partner-categories', partnerCategorySchema, 'categoria de parceiro');
  const aiPromptCategories = useCrudOperations<AiPromptCategory, AiPromptCategoryFormData>('/api/ai-prompt-categories', aiPromptCategorySchema, 'categoria de prompt IA');

  const getCurrentOperations = () => {
    switch (activeTab) {
      case "material-types": return materialTypes;
      case "material-categories": return materialCategories;
      case "software-types": return softwareTypes;
      case "supplier-types": return supplierTypes;
      case "product-categories": return productCategories;
      case "partner-categories": return partnerCategories;
      case "ai-prompt-categories": return aiPromptCategories;
      default: return materialTypes;
    }
  };

  const getCurrentSchema = () => {
    switch (activeTab) {
      case "material-types": return materialTypeSchema;
      case "material-categories": return materialCategorySchema;
      case "software-types": return softwareTypeSchema;
      case "supplier-types": return supplierTypeSchema;
      case "product-categories": return productCategorySchema;
      case "partner-categories": return partnerCategorySchema;
      case "ai-prompt-categories": return aiPromptCategorySchema;
      default: return materialTypeSchema;
    }
  };

  const getCurrentEntityName = () => {
    switch (activeTab) {
      case "material-types": return "tipo de material";
      case "material-categories": return "categoria de material";
      case "software-types": return "tipo de software";
      case "supplier-types": return "tipo de fornecedor";
      case "product-categories": return "categoria de produto";
      case "partner-categories": return "categoria de parceiro";
      case "ai-prompt-categories": return "categoria de prompt IA";
      default: return "item";
    }
  };

  const getCurrentIcon = () => {
    switch (activeTab) {
      case "material-types": return FileType;
      case "material-categories": return Layers;
      case "software-types": return Code;
      case "supplier-types": return Truck;
      case "product-categories": return ShoppingCart;
      case "partner-categories": return Users;
      case "ai-prompt-categories": return Brain;
      default: return Package;
    }
  };

  const operations = getCurrentOperations();

  const handleSubmit = (data: any) => {
    if (editingItem) {
      operations.updateItem({ id: editingItem.id, data });
    } else {
      operations.createItem(data);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      operations.deleteItem(id);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cadastros</h1>
          <p className="text-muted-foreground">Gerencie os dados de referência do sistema</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingItem(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className={activeTab === "material-types" ? "max-w-4xl max-h-[90vh] overflow-y-auto" : ""}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? `Editar ${getCurrentEntityName()}` : `Novo ${getCurrentEntityName()}`}
              </DialogTitle>
            </DialogHeader>
            {activeTab === "material-types" ? (
              <MaterialTypeForm
                materialType={editingItem}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={operations.isCreating || operations.isUpdating}
              />
            ) : (
              <GenericForm
                schema={getCurrentSchema()}
                editingItem={editingItem}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={operations.isCreating || operations.isUpdating}
                entityName={getCurrentEntityName()}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Área de Cadastros</h2>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-[280px]">
                <div className="flex items-center gap-2">
                  {activeTab === "material-types" && <FileType className="h-4 w-4" />}
                  {activeTab === "material-categories" && <Layers className="h-4 w-4" />}
                  {activeTab === "software-types" && <Code className="h-4 w-4" />}
                  {activeTab === "supplier-types" && <Truck className="h-4 w-4" />}
                  {activeTab === "product-categories" && <ShoppingCart className="h-4 w-4" />}
                  {activeTab === "partner-categories" && <Users className="h-4 w-4" />}
                  {activeTab === "ai-prompt-categories" && <Brain className="h-4 w-4" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material-types">
                  <div className="flex items-center gap-2">
                    <FileType className="h-4 w-4" />
                    Tipos de Materiais
                  </div>
                </SelectItem>
                <SelectItem value="material-categories">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Categorias de Materiais
                  </div>
                </SelectItem>
                <SelectItem value="software-types">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Tipos de Softwares
                  </div>
                </SelectItem>
                <SelectItem value="supplier-types">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Tipos de Fornecedores
                  </div>
                </SelectItem>
                <SelectItem value="product-categories">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Categorias de Produtos
                  </div>
                </SelectItem>
                <SelectItem value="partner-categories">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Categorias de Parceiros
                  </div>
                </SelectItem>
                <SelectItem value="ai-prompt-categories">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Categorias de Prompts IA
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content based on selected tab */}
        {activeTab === "material-types" && (
          <ItemGrid
            items={operations.items}
            isLoading={operations.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            icon={FileType}
            entityName="tipo de material"
          />
        )}

        {activeTab === "material-categories" && (
          <ItemGrid
            items={operations.items}
            isLoading={operations.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            icon={Layers}
            entityName="categoria de material"
          />
        )}

        {activeTab === "software-types" && (
          <ItemGrid
            items={operations.items}
            isLoading={operations.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            icon={Code}
            entityName="tipo de software"
          />
        )}

        {activeTab === "supplier-types" && (
          <ItemGrid
            items={operations.items}
            isLoading={operations.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            icon={Truck}
            entityName="tipo de fornecedor"
          />
        )}

        {activeTab === "product-categories" && (
          <ItemGrid
            items={operations.items}
            isLoading={operations.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            icon={ShoppingCart}
            entityName="categoria de produto"
          />
        )}

        {activeTab === "partner-categories" && (
          <ItemGrid
            items={operations.items}
            isLoading={operations.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            icon={Users}
            entityName="categoria de parceiro"
          />
        )}
      </div>
    </div>
  );
}