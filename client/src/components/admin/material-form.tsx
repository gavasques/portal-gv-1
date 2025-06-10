import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FileText, Upload, Link, Video, FileAudio, FileSpreadsheet, File, Globe } from "lucide-react";
import type { Material } from "@shared/schema";

const materialFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum([
    "artigo_texto", 
    "documento_pdf", 
    "fluxograma_miro", 
    "embed_iframe", 
    "video_youtube", 
    "video_panda", 
    "audio", 
    "planilha_excel", 
    "arquivo_word", 
    "link_pasta", 
    "link_documento"
  ]),
  content: z.string().optional(),
  url: z.string().optional(),
  embedCode: z.string().optional(),
  fileName: z.string().optional(),
  accessLevel: z.enum(["Public", "Restricted"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

type MaterialFormData = z.infer<typeof materialFormSchema>;

interface MaterialFormProps {
  material?: Material;
  onSubmit: (data: MaterialFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  "Fornecedores",
  "Estratégias de E-commerce", 
  "Ferramentas",
  "Cases de Sucesso",
  "Marketing Digital",
  "Logística",
  "Finanças",
  "Geral"
];

const materialTypes = [
  { value: "artigo_texto", label: "Artigo/Texto", icon: FileText },
  { value: "documento_pdf", label: "Documento PDF", icon: File },
  { value: "fluxograma_miro", label: "Fluxograma Miro", icon: Globe },
  { value: "embed_iframe", label: "Embed/Iframe", icon: Globe },
  { value: "video_youtube", label: "Vídeo YouTube", icon: Video },
  { value: "video_panda", label: "Vídeo Panda", icon: Video },
  { value: "audio", label: "Áudio", icon: FileAudio },
  { value: "planilha_excel", label: "Planilha Excel", icon: FileSpreadsheet },
  { value: "arquivo_word", label: "Arquivo Word", icon: File },
  { value: "link_pasta", label: "Link de Pasta", icon: Link },
  { value: "link_documento", label: "Link de Documento", icon: Link },
];

export default function MaterialForm({ material, onSubmit, onCancel, isLoading }: MaterialFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      title: material?.title || "",
      description: material?.description || "",
      type: (material?.type as MaterialFormData["type"]) || "artigo_texto",
      content: material?.content || "",
      url: material?.url || "",
      embedCode: material?.embedCode || "",
      fileName: material?.fileName || "",
      accessLevel: (material?.accessLevel as MaterialFormData["accessLevel"]) || "Public",
      category: material?.category || "",
      tags: material?.tags || [],
      isActive: material?.isActive ?? true,
    },
  });

  const watchedType = form.watch("type");

  const handleSubmit = async (data: MaterialFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderContentFields = () => {
    switch (watchedType) {
      case "artigo_texto":
        return (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo do Artigo</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Digite o conteúdo completo do artigo..."
                    className="min-h-[200px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "documento_pdf":
      case "planilha_excel":
      case "arquivo_word":
      case "audio":
        return (
          <>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Arquivo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome do arquivo para download" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Arquivo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://exemplo.com/arquivo.pdf" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case "video_youtube":
        return (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do YouTube</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="https://www.youtube.com/watch?v=..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "video_panda":
        return (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Vídeo Panda</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="URL do vídeo no Panda Video" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "fluxograma_miro":
      case "embed_iframe":
        return (
          <FormField
            control={form.control}
            name="embedCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Incorporação</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Cole aqui o código iframe de incorporação..."
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "link_pasta":
      case "link_documento":
        return (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="https://drive.google.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {material ? "Editar Material" : "Criar Novo Material"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Digite o título do material" />
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
                          value={field.value || ""}
                          placeholder="Breve descrição do material"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Material</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
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
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Conteúdo do Material</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o conteúdo baseado no tipo selecionado: {materialTypes.find(t => t.value === watchedType)?.label}
                  </p>
                </div>
                
                {renderContentFields()}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="accessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Acesso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o nível de acesso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Public">Público</SelectItem>
                          <SelectItem value="Restricted">Restrito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Material Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Controla se o material está visível para os usuários
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
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : material ? "Salvar Alterações" : "Criar Material"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}