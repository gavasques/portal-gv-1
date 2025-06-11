import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FileText, Upload, Link, Video, FileAudio, FileSpreadsheet, File, Globe } from "lucide-react";
import type { Material, MaterialCategory, MaterialType } from "@shared/schema";

const materialFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.string().min(1, "Tipo é obrigatório"),
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
  isFeatured: z.boolean().optional(),
});

type MaterialFormData = z.infer<typeof materialFormSchema>;

interface MaterialFormProps {
  material?: Material;
  onSubmit: (data: MaterialFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

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

export default function MaterialForm({ material, onSubmit, onCancel, isLoading }: MaterialFormProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Load material categories dynamically
  const { data: categories = [] } = useQuery<MaterialCategory[]>({
    queryKey: ['/api/material-categories'],
    queryFn: async () => {
      const response = await fetch('/api/material-categories');
      if (!response.ok) throw new Error('Failed to fetch material categories');
      return response.json();
    },
  });

  // Load material types dynamically
  const { data: materialTypes = [] } = useQuery<MaterialType[]>({
    queryKey: ['/api/material-types'],
    queryFn: async () => {
      const response = await fetch('/api/material-types');
      if (!response.ok) throw new Error('Failed to fetch material types');
      return response.json();
    },
  });
  
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
      isFeatured: material?.isFeatured ?? false,
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
      case "Prompt para IA":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Prompt (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder={`# PROMPT #1 - TÍTULO DO PROMPT

## Instruções ao PROMPT

Escreva aqui as instruções detalhadas do prompt...

### Informações Necessárias:
- **Campo 1:** [INSERIR_VALOR]
- **Campo 2:** [INSERIR_VALOR]

### Critérios:
**1. Critério Principal**
- Detalhe específico
- Outro detalhe

**2. Objetivo**
- Meta clara do prompt

### Exemplo de Uso:
Explique como usar este prompt no ChatGPT ou Claude...`}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Guia de Formatação Markdown:</strong></p>
                    <ul className="list-disc ml-4 space-y-0.5">
                      <li># Título Principal</li>
                      <li>## Seção</li>
                      <li>### Subseção</li>
                      <li>**Texto em negrito**</li>
                      <li>- Item de lista</li>
                      <li>[CAMPO_VARIAVEL] para campos personalizáveis</li>
                    </ul>
                    <p className="mt-2"><strong>Como usar:</strong> Copie este prompt e cole no ChatGPT, Claude ou outra IA. Substitua os campos [VARIAVEL] pelas informações específicas.</p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "artigo_texto":
      case "Artigo/Texto":
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
      

      
      case "Fluxograma Miro":
      case "Embed/Iframe":
      case "Código Embed":
      case "iFrame Externo":
      case "embed_iframe":
      case "fluxograma_miro":
        return (
          <FormField
            control={form.control}
            name="embedCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Incorporação (iframe)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Cole aqui o código iframe de incorporação..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Exemplo de código iframe:</strong></p>
                  <code className="block bg-muted p-2 rounded text-xs">
                    &lt;iframe src="https://exemplo.com" width="100%" height="400"&gt;&lt;/iframe&gt;
                  </code>
                  <p>Cole aqui o código HTML iframe completo fornecido pela plataforma externa.</p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "Link de Pasta":
      case "Link de Documento":
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
                <div className="text-xs text-muted-foreground">
                  Cole aqui o link direto para o documento ou pasta (Google Drive, Dropbox, OneDrive, etc.)
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "Documento PDF":
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

      case "Planilha Excel":
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

      case "Arquivo Word":
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

      case "Apresentação PowerPoint":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Apresentação PowerPoint</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo .ppt ou .pptx
                </p>
                <Input type="file" accept=".ppt,.pptx" className="max-w-sm mx-auto" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nome da apresentação para exibição" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "Áudio":
      case "Áudio/Podcast":
      case "audio":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload de Arquivo de Áudio</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo .mp3, .wav ou .m4a
                </p>
                <Input type="file" accept=".mp3,.wav,.m4a" className="max-w-sm mx-auto" />
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

      case "Vídeo YouTube":
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
                <div className="text-xs text-muted-foreground">
                  Cole aqui o link completo do vídeo no YouTube
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "Vídeo Panda":
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
                <div className="text-xs text-muted-foreground">
                  Cole aqui o link do vídeo hospedado no Panda Video
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "Vídeo Upload":
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
                          {materialTypes.filter(type => type.isActive).map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium">{type.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getFormatTypeLabel(type.formatType || 'text')}
                                  </span>
                                </div>
                              </div>
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
                          {categories.filter(cat => cat.isActive).map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
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
                    Configure o conteúdo baseado no tipo selecionado: {materialTypes.find(t => t.id === parseInt(watchedType || '0'))?.name}
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

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Material Destacado</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Marca o material como "DESTACADO" com visual especial
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