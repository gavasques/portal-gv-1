import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Video, Music, Link, Upload, Globe, FileImage, Code } from "lucide-react";
import type { MaterialType } from "@shared/schema";

const materialTypeFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  formatType: z.enum([
    "text", "embed", "iframe", "youtube", "pdf", "audio", "video", "link", "upload"
  ]).default("text"),
  displayConfig: z.object({
    allowedExtensions: z.array(z.string()).optional(),
    embedSettings: z.object({
      width: z.string().optional(),
      height: z.string().optional(),
      allowFullscreen: z.boolean().optional(),
    }).optional(),
    validationRules: z.object({
      urlPattern: z.string().optional(),
      maxFileSize: z.number().optional(),
    }).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

type MaterialTypeFormData = z.infer<typeof materialTypeFormSchema>;

interface MaterialTypeFormProps {
  materialType?: MaterialType | null;
  onSubmit: (data: MaterialTypeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatTypeOptions = [
  { 
    value: "text", 
    label: "Texto/Artigo", 
    icon: FileText,
    description: "Conteúdo de texto simples ou artigos",
    fields: ["content"]
  },
  { 
    value: "embed", 
    label: "Embed HTML", 
    icon: Code,
    description: "Código HTML para incorporação",
    fields: ["embedCode"]
  },
  { 
    value: "iframe", 
    label: "iFrame", 
    icon: Globe,
    description: "Incorporação via iframe",
    fields: ["url", "embedSettings"]
  },
  { 
    value: "youtube", 
    label: "YouTube", 
    icon: Video,
    description: "Vídeos do YouTube",
    fields: ["url", "embedSettings"]
  },
  { 
    value: "pdf", 
    label: "PDF", 
    icon: FileImage,
    description: "Documentos PDF",
    fields: ["fileName", "url"]
  },
  { 
    value: "audio", 
    label: "Áudio", 
    icon: Music,
    description: "Arquivos de áudio",
    fields: ["fileName", "url"]
  },
  { 
    value: "video", 
    label: "Vídeo", 
    icon: Video,
    description: "Arquivos de vídeo",
    fields: ["fileName", "url", "embedSettings"]
  },
  { 
    value: "link", 
    label: "Link Externo", 
    icon: Link,
    description: "Links para recursos externos",
    fields: ["url"]
  },
  { 
    value: "upload", 
    label: "Upload de Arquivo", 
    icon: Upload,
    description: "Upload de arquivos diversos",
    fields: ["fileName"]
  },
];

export default function MaterialTypeForm({ materialType, onSubmit, onCancel, isLoading }: MaterialTypeFormProps) {
  const [selectedFormatType, setSelectedFormatType] = useState<string>(materialType?.formatType || "text");
  
  const form = useForm<MaterialTypeFormData>({
    resolver: zodResolver(materialTypeFormSchema),
    defaultValues: {
      name: materialType?.name || "",
      description: materialType?.description || "",
      formatType: (materialType?.formatType as any) || "text",
      displayConfig: materialType?.displayConfig as any || {},
      isActive: materialType?.isActive ?? true,
    },
  });

  const watchedFormatType = form.watch("formatType");
  const selectedOption = formatTypeOptions.find(opt => opt.value === watchedFormatType);

  const handleSubmit = (data: MaterialTypeFormData) => {
    // Clean up displayConfig based on format type
    let cleanedDisplayConfig = { ...data.displayConfig };
    
    if (!["iframe", "youtube", "video", "embed"].includes(data.formatType)) {
      delete cleanedDisplayConfig.embedSettings;
    }
    
    if (!["upload", "pdf", "audio", "video"].includes(data.formatType)) {
      delete cleanedDisplayConfig.allowedExtensions;
    }
    
    if (!["link", "youtube", "iframe"].includes(data.formatType)) {
      delete cleanedDisplayConfig.validationRules;
    }

    onSubmit({
      ...data,
      displayConfig: Object.keys(cleanedDisplayConfig).length > 0 ? cleanedDisplayConfig : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Tipo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Vídeo Aula, E-book, Planilha..." />
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
                      placeholder="Descreva este tipo de material..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Format Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Formato</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecione como este tipo de material será exibido no sistema
            </p>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="formatType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato de Exibição</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedFormatType(value);
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato de exibição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formatTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  
                  {selectedOption && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <selectedOption.icon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{selectedOption.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{selectedOption.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Campos utilizados:</span>
                        {selectedOption.fields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Display Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Exibição</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure como este tipo de material será processado e exibido
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Embed Settings */}
            {["iframe", "youtube", "video", "embed"].includes(watchedFormatType) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <h4 className="font-medium">Configurações de Incorporação</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <FormField
                    control={form.control}
                    name="displayConfig.embedSettings.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Largura Padrão</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="100% ou 640px" />
                        </FormControl>
                        <FormDescription>Largura padrão para incorporação</FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="displayConfig.embedSettings.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura Padrão</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="360px ou auto" />
                        </FormControl>
                        <FormDescription>Altura padrão para incorporação</FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="displayConfig.embedSettings.allowFullscreen"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Permitir Tela Cheia</FormLabel>
                            <FormDescription>
                              Permite que o conteúdo seja exibido em tela cheia
                            </FormDescription>
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
                  </div>
                </div>
              </div>
            )}

            {/* File Extensions */}
            {["upload", "pdf", "audio", "video"].includes(watchedFormatType) && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <h4 className="font-medium">Configurações de Arquivo</h4>
                </div>
                <div className="pl-6">
                  <FormField
                    control={form.control}
                    name="displayConfig.allowedExtensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extensões Permitidas</FormLabel>
                        <FormControl>
                          <Input 
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => {
                              const extensions = e.target.value
                                .split(",")
                                .map(ext => ext.trim())
                                .filter(ext => ext.length > 0);
                              field.onChange(extensions);
                            }}
                            placeholder="pdf, docx, xlsx, mp4, mp3..."
                          />
                        </FormControl>
                        <FormDescription>
                          Lista de extensões separadas por vírgula
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* URL Validation */}
            {["link", "youtube", "iframe"].includes(watchedFormatType) && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  <h4 className="font-medium">Validação de URL</h4>
                </div>
                <div className="pl-6">
                  <FormField
                    control={form.control}
                    name="displayConfig.validationRules.urlPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Padrão de URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="youtube\.com|youtu\.be para YouTube"
                          />
                        </FormControl>
                        <FormDescription>
                          Expressão regular para validar URLs (opcional)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* File Size Limit */}
            {["upload", "pdf", "audio", "video"].includes(watchedFormatType) && (
              <div className="pl-6">
                <FormField
                  control={form.control}
                  name="displayConfig.validationRules.maxFileSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho Máximo (MB)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="10"
                        />
                      </FormControl>
                      <FormDescription>
                        Tamanho máximo do arquivo em megabytes
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Tipo Ativo</FormLabel>
                    <FormDescription>
                      Controla se este tipo está disponível para uso
                    </FormDescription>
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {materialType ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}