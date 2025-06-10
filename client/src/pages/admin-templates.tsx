import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Template } from "@shared/schema";
import TemplateForm from "@/components/admin/template-form";

export default function AdminTemplates() {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/admin/templates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json() as Template[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/templates/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Template excluído",
        description: "Template removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover o template",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (template: Template) => {
    if (confirm(`Tem certeza que deseja excluir o template "${template.title}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTemplate(null);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
    toast({
      title: editingTemplate ? "Template atualizado" : "Template criado",
      description: editingTemplate 
        ? "Template atualizado com sucesso" 
        : "Novo template adicionado à biblioteca",
    });
  };

  const getStatusBadge = (status: string) => {
    return status === "published" ? (
      <Badge variant="default">Publicado</Badge>
    ) : (
      <Badge variant="secondary">Rascunho</Badge>
    );
  };

  if (showForm) {
    return (
      <TemplateForm
        template={editingTemplate}
        onCancel={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Templates</h1>
          <p className="text-muted-foreground">
            Gerencie a biblioteca de templates de comunicação
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Template
        </Button>
      </div>

      {/* Templates Table */}
      {templates && templates.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Templates ({templates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Título</th>
                    <th className="text-left py-3 px-4 font-medium">Categoria</th>
                    <th className="text-center py-3 px-4 font-medium">Nº de Cópias</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {template.purpose}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{template.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{template.copyCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(template.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(template)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro template de comunicação.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}