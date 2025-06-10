
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare,
  FileText,
  Video,
  Download,
  ExternalLink,
  Globe,
  Lock
} from "lucide-react";
import type { Material } from "@shared/schema";
import MaterialForm from "@/components/admin/material-form";

const formatIcons = {
  pdf: Download,
  text: FileText,
  video: Video,
  link: ExternalLink,
  embed: ExternalLink
};

function MaterialRow({ material, onEdit, onDelete }: { 
  material: Material; 
  onEdit: (material: Material) => void;
  onDelete: (id: number) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const Icon = formatIcons[material.type as keyof typeof formatIcons] || FileText;

  const { mutate: toggleStatus } = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await fetch(`/api/admin/materials/${material.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update material');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/materials'] });
      toast({
        title: "Status atualizado",
        description: `Material ${material.isActive ? 'despublicado' : 'publicado'} com sucesso.`
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do material.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="p-3 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium line-clamp-2 leading-tight mb-1">
                {material.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                {material.description && material.description.length > 80 
                  ? material.description.substring(0, 80) + "..." 
                  : material.description}
              </p>
            </div>
          </div>
          
          {/* Badges and stats */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-xs">
              {material.category && material.category.length > 12 
                ? material.category.substring(0, 12) + "..." 
                : material.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">{material.type}</Badge>
            <Badge variant={material.accessLevel === "Public" ? "default" : "secondary"} className="text-xs">
              {material.accessLevel === "Public" ? (
                <>
                  <Globe className="h-2 w-2 mr-1" />
                  Público
                </>
              ) : (
                <>
                  <Lock className="h-2 w-2 mr-1" />
                  Aluno
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{material.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>0</span>
            </div>
            <span>
              {new Date(material.createdAt).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit',
                year: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Switch 
            checked={material.isActive}
            onCheckedChange={(checked) => toggleStatus(checked)}
            className="scale-75"
          />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(material)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(material.id)}
              className="h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ['/api/admin/materials', { search: searchQuery }],
  });

  const { mutate: deleteMaterial } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete material');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/materials'] });
      toast({
        title: "Material excluído",
        description: "O material foi removido com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteMaterial(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestão de Materiais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os materiais educacionais da plataforma
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMaterial(null)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Adicionar Novo Material</span>
              <span className="sm:hidden">Novo Material</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Editar Material' : 'Novo Material'}
              </DialogTitle>
            </DialogHeader>
            <MaterialForm 
              material={editingMaterial || undefined} 
              onSubmit={async (data) => {
                try {
                  const url = editingMaterial 
                    ? `/api/admin/materials/${editingMaterial.id}` 
                    : '/api/admin/materials';
                  const method = editingMaterial ? 'PATCH' : 'POST';
                  
                  const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  if (!response.ok) throw new Error('Failed to save material');
                  
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/materials'] });
                  handleFormClose();
                  
                  toast({
                    title: editingMaterial ? "Material atualizado" : "Material criado",
                    description: editingMaterial 
                      ? "O material foi atualizado com sucesso." 
                      : "O novo material foi criado com sucesso."
                  });
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Não foi possível salvar o material.",
                    variant: "destructive"
                  });
                }
              }}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materiais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Materiais ({filteredMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando materiais...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum material encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Tente ajustar os termos de busca' : 'Comece criando seu primeiro material'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Material
                </Button>
              )}
            </div>
          ) : (
            <div>
              {filteredMaterials.map((material) => (
                <MaterialRow
                  key={material.id}
                  material={material}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
