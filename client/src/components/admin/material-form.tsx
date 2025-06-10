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
    "link_documento",
    "video_upload"
  ]),
  content: z.string().optional(),
  url: z.string().optional(),
  embedCode: z.string().optional(),
  fileName: z.string().optional(),
  filePath: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
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
  { value: "video_upload", label: "Vídeo Upload", icon: Upload },
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
                <FormLabel>Conteúdo do Artigo (HTML)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Cole aqui o conteúdo HTML do artigo..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  Você pode colar HTML formatado que será exibido aos alunos
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "documento_pdf":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Arquivo PDF</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo PDF para upload
                </p>
                <Input type="file" accept=".pdf" className="max-w-sm mx-auto" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome do arquivo para exibição" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "planilha_excel":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Planilha Excel</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo .xls ou .xlsx
                </p>
                <Input type="file" accept=".xls,.xlsx" className="max-w-sm mx-auto" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome da planilha para exibição" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "arquivo_word":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Documento Word</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo .doc ou .docx
                </p>
                <Input type="file" accept=".doc,.docx" className="max-w-sm mx-auto" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome do documento para exibição" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "audio":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Arquivo de Áudio</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo .mp3 ou .wav
                </p>
                <Input type="file" accept=".mp3,.wav" className="max-w-sm mx-auto" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome do áudio para exibição" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "video_upload":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Vídeo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo de vídeo .mp4, .mov ou .avi
                </p>
                <Input type="file" accept=".mp4,.mov,.avi" className="max-w-sm mx-auto" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome do vídeo para exibição" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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