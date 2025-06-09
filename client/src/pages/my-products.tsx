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
import { Badge } from "@/components/ui/badge";
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
import { Package, Plus, Edit, Trash2, DollarSign, TrendingUp } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductFormData {
  name: string;
  description: string;
  asin: string;
  sku: string;
  image: string;
  costPrice: string;
  salePrice: string;
  fbaFee: string;
  fbmFee: string;
  dbaFee: string;
  commission: string;
  taxes: string;
  prepCenterFee: string;
}

export default function MyProducts() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    asin: "",
    sku: "",
    image: "",
    costPrice: "",
    salePrice: "",
    fbaFee: "",
    fbmFee: "",
    dbaFee: "",
    commission: "",
    taxes: "",
    prepCenterFee: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { page, pageSize, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      const response = await fetch(`/api/products?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const numericData = {
        ...data,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        fbaFee: data.fbaFee ? parseFloat(data.fbaFee) : null,
        fbmFee: data.fbmFee ? parseFloat(data.fbmFee) : null,
        dbaFee: data.dbaFee ? parseFloat(data.dbaFee) : null,
        commission: data.commission ? parseFloat(data.commission) : null,
        taxes: data.taxes ? parseFloat(data.taxes) : null,
        prepCenterFee: data.prepCenterFee ? parseFloat(data.prepCenterFee) : null,
      };
      const response = await apiRequest('POST', '/api/products', numericData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({ title: "Produto criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      const numericData = {
        ...data,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        fbaFee: data.fbaFee ? parseFloat(data.fbaFee) : null,
        fbmFee: data.fbmFee ? parseFloat(data.fbmFee) : null,
        dbaFee: data.dbaFee ? parseFloat(data.dbaFee) : null,
        commission: data.commission ? parseFloat(data.commission) : null,
        taxes: data.taxes ? parseFloat(data.taxes) : null,
        prepCenterFee: data.prepCenterFee ? parseFloat(data.prepCenterFee) : null,
      };
      const response = await apiRequest('PUT', `/api/products/${id}`, numericData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto atualizado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({ title: "Produto removido com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateProfitability = (product: Product) => {
    const cost = parseFloat(product.costPrice || "0");
    const sale = parseFloat(product.salePrice || "0");
    const fba = parseFloat(product.fbaFee || "0");
    const commission = parseFloat(product.commission || "0");
    const taxes = parseFloat(product.taxes || "0");

    const totalCosts = cost + fba + commission + taxes;
    const profit = sale - totalCosts;
    const margin = sale > 0 ? (profit / sale) * 100 : 0;

    return { profit, margin };
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      asin: "",
      sku: "",
      image: "",
      costPrice: "",
      salePrice: "",
      fbaFee: "",
      fbmFee: "",
      dbaFee: "",
      commission: "",
      taxes: "",
      prepCenterFee: "",
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      asin: product.asin || "",
      sku: product.sku || "",
      image: product.image || "",
      costPrice: product.costPrice || "",
      salePrice: product.salePrice || "",
      fbaFee: product.fbaFee || "",
      fbmFee: product.fbmFee || "",
      dbaFee: product.dbaFee || "",
      commission: product.commission || "",
      taxes: product.taxes || "",
      prepCenterFee: product.prepCenterFee || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.asin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const columns = [
    {
      key: "name" as keyof Product,
      header: "Produto",
      render: (value: string, product: Product) => (
        <div className="flex items-center space-x-3">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="font-medium">{value}</div>
            {product.asin && (
              <div className="text-xs text-muted-foreground">ASIN: {product.asin}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "salePrice" as keyof Product,
      header: "Preço de Venda",
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>R$ {parseFloat(value).toFixed(2)}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "costPrice" as keyof Product,
      header: "Custo",
      render: (value: string) => value ? (
        <span>R$ {parseFloat(value).toFixed(2)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "id" as keyof Product,
      header: "Rentabilidade",
      render: (value: number, product: Product) => {
        const { profit, margin } = calculateProfitability(product);
        return (
          <div className="text-center">
            <div className="font-medium">
              R$ {profit.toFixed(2)}
            </div>
            <Badge
              variant={margin > 20 ? "default" : margin > 10 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {margin.toFixed(1)}%
            </Badge>
          </div>
        );
      },
    },
    {
      key: "id" as keyof Product,
      header: "Ações",
      render: (value: number, product: Product) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(product)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate(product.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const ProductCard = ({ product }: { product: Product }) => {
    const { profit, margin } = calculateProfitability(product);

    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.asin && (
                  <p className="text-sm text-muted-foreground">ASIN: {product.asin}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteMutation.mutate(product.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Preço de Venda:</span>
              <div className="font-medium">
                {product.salePrice ? `R$ ${parseFloat(product.salePrice).toFixed(2)}` : "-"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Custo:</span>
              <div className="font-medium">
                {product.costPrice ? `R$ ${parseFloat(product.costPrice).toFixed(2)}` : "-"}
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Lucro Estimado</div>
                <div className="font-medium">R$ {profit.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Margem</div>
                <Badge
                  variant={margin > 20 ? "default" : margin > 10 ? "secondary" : "destructive"}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {margin.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e analise a rentabilidade
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ListViewToggle view={view} onViewChange={setView} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Adicionar Produto"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? "Atualize as informações do produto."
                    : "Adicione um novo produto ao seu catálogo."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do produto"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do produto..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="asin">ASIN</Label>
                    <Input
                      id="asin"
                      value={formData.asin}
                      onChange={(e) => setFormData({ ...formData, asin: e.target.value })}
                      placeholder="B01234567A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU do produto"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fbaFee">Taxa FBA (R$)</Label>
                    <Input
                      id="fbaFee"
                      type="number"
                      step="0.01"
                      value={formData.fbaFee}
                      onChange={(e) => setFormData({ ...formData, fbaFee: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Comissão (R$)</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.01"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxes">Impostos (R$)</Label>
                    <Input
                      id="taxes"
                      type="number"
                      step="0.01"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prepCenterFee">Taxa Prep Center (R$)</Label>
                    <Input
                      id="prepCenterFee"
                      type="number"
                      step="0.01"
                      value={formData.prepCenterFee}
                      onChange={(e) => setFormData({ ...formData, prepCenterFee: e.target.value })}
                      placeholder="0.00"
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
                    {editingProduct ? "Atualizar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SearchFilters
        searchPlaceholder="Buscar produtos por nome, ASIN ou SKU..."
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingSkeleton type={view} count={pageSize} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title={
            searchQuery
              ? "Nenhum produto encontrado"
              : "Nenhum produto cadastrado"
          }
          description={
            searchQuery
              ? "Tente ajustar os termos de busca."
              : "Comece adicionando seus primeiros produtos para análise de rentabilidade."
          }
          action={
            !searchQuery
              ? {
                  label: "Adicionar Primeiro Produto",
                  onClick: () => setIsDialogOpen(true),
                }
              : undefined
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredProducts}
          columns={columns}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredProducts.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
