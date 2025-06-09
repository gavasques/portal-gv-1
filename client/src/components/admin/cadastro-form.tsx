import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CadastroItem {
  id?: number;
  name: string;
  description?: string;
  isActive: boolean;
}

interface CadastroFormProps {
  type: string;
  item?: CadastroItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CadastroForm({ type, item, onSuccess, onCancel }: CadastroFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    isActive: item?.isActive ?? true,
  });

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = item?.id ? `/api/${type}/${item.id}` : `/api/${type}`;
      const method = item?.id ? 'PUT' : 'POST';

      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ 
        title: item?.id ? "Item atualizado!" : "Item criado!",
        description: "As alterações foram salvas com sucesso."
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao salvar", 
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ 
        title: "Nome obrigatório", 
        description: "Por favor, informe um nome para o item.",
        variant: "destructive" 
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Digite o nome do item"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Digite uma descrição opcional"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
        />
        <Label htmlFor="isActive">Ativo</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Salvando...' : (item?.id ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  );
}