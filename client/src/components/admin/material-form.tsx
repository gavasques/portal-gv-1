import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  Upload,
  X
} from "lucide-react";
import type { Material } from "@/lib/types";

const categoryOptions = [
  "Estratégias de E-commerce",
  "Marketing Digital",
  "Logística",
  "Fornecedores",
  "Análise de Mercado",
  "Ferramentas",
  "Cases de Sucesso"
];

const materialFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["text", "pdf", "video", "link", "embed"]),
  content: z.string().optional(),
  filePath: z.string().optional(),
  url: z.string().optional(),
  accessLevel: z.enum(["Public", "Restricted"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  isActive: z.boolean().default(true),
});

type MaterialFormData = z.infer<typeof materialFormSchema>;

export default function MaterialForm({ 
  material, 
  onClose 
}: { 
  material?: Material | null; 
  onClose: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "text",
      content: "",
      filePath: "",
      url: "",
      accessLevel: "Public",
      category: "",
      isActive: true,
    },
  });

  const watchedType = form.watch("type");

  // Load material data when editing
  useEffect(() => {
    if (material) {
      form.reset({
        title: material.title,
        description: material.description || "",
        type: material.type as any,
        content: material.content || "",
        filePath: material.filePath || "",
        url: material.url || "",
        accessLevel: material.accessLevel as any,
        category: material.category || "",
        isActive: material.isActive,
      });
    }
  }, [material, form]);

  const { mutate: saveMaterial, isPending } = useMutation({
    mutationFn: async (data: MaterialFormData) => {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const url = material 
        ? `/api/admin/materials/${material.id}`
        : '/api/admin/materials';
      
      const response = await fetch(url, {
        method: material ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save material');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/materials'] });
      toast({
        title: material ? "Material atualizado" : "Material criado",
        description: `Material ${material ? 'atualizado' : 'criado'} com sucesso.`
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: MaterialFormData) => {
    // Validate based on type
    if (data.type === "pdf" && !selectedFile && !material?.filePath) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo PDF.",
        variant: "destructive"
      });
      return;
    }

    if (data.type === "video" && !data.url) {
      toast({
        title: "Erro",
        description: "Insira a URL do vídeo.",
        variant: "destructive"
      });
      return;
    }

    if (data.type === "link" && !data.url) {
      toast({
        title: "Erro",
        description: "Insira a URL do link.",
        variant: "destructive"
      });
      return;
    }

    if (data.type === "embed" && !data.content) {
      toast({
        title: "Erro",
        description: "Insira o código de embed.",
        variant: "destructive"
      });
      return;
    }

    if (data.type === "text" && !data.content) {
      toast({
        title: "Erro",
        description: "Insira o conteúdo do artigo.",
        variant: "destructive"
      });
      return;
    }

    saveMaterial(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Erro",
          description: "Apenas arquivos PDF são aceitos.",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Material</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título..." {...field} />
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
                          placeholder="Breve descrição do material..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato do Material</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Artigo
                            </div>
                          </SelectItem>
                          <SelectItem value="pdf">
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center">
                              <Video className="h-4 w-4 mr-2" />
                              Vídeo
                            </div>
                          </SelectItem>
                          <SelectItem value="link">
                            <div className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Link Externo
                            </div>
                          </SelectItem>
                          <SelectItem value="embed">
                            <div className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Embed/Código
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content based on type */}
                {watchedType === "text" && (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo do Artigo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite o conteúdo do artigo..."
                            rows={10}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedType === "pdf" && (
                  <div>
                    <Label>Arquivo PDF</Label>
                    <div className="mt-2">
                      {material?.filePath && !selectedFile && (
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">Arquivo atual: {material.filePath.split('/').pop()}</p>
                        </div>
                      )}
                      {selectedFile ? (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span className="text-sm">{selectedFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Clique para selecionar ou arraste um arquivo PDF
                            </p>
                            <input
                              id="file-upload"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              Selecionar Arquivo
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(watchedType === "video" || watchedType === "link") && (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchedType === "video" ? "URL do Vídeo" : "URL do Link"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={
                              watchedType === "video" 
                                ? "https://youtube.com/watch?v=..." 
                                : "https://exemplo.com"
                            }
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedType === "embed" && (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Embed</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cole aqui o código de embed..."
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Acesso</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Public" id="public" />
                            <Label htmlFor="public">Público</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Restricted" id="restricted" />
                            <Label htmlFor="restricted">Aluno Exclusivo</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status de Publicação</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="publish" />
                            <Label htmlFor="publish">Publicar</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="draft" />
                            <Label htmlFor="draft">Salvar como Rascunho</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending 
              ? (material ? "Atualizando..." : "Criando...") 
              : (material ? "Atualizar Material" : "Criar Material")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}