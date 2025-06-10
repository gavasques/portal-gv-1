import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Template } from "@shared/schema";

export default function TemplateView() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: template, isLoading } = useQuery({
    queryKey: ["/api/templates", id],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) throw new Error("Failed to fetch template");
      return response.json() as Template;
    },
    enabled: !!id,
  });

  const copyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/templates/${id}/copy`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
  });

  const handleCopyTemplate = async () => {
    if (!template) return;

    try {
      await navigator.clipboard.writeText(template.content);
      setCopied(true);
      copyMutation.mutate();
      
      toast({
        title: "Copiado! ✅",
        description: "Template copiado para a área de transferência",
      });

      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o template",
        variant: "destructive",
      });
    }
  };

  const highlightVariables = (content: string) => {
    return content.replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-medium">[$1]</span>');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Template não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O template solicitado não existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/templates">
                Voltar para Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/templates" className="hover:text-foreground">
          Templates
        </Link>
        <span>›</span>
        <span>{template.category}</span>
        <span>›</span>
        <span className="text-foreground">{template.title}</span>
      </div>

      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/templates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Templates
        </Link>
      </Button>

      {/* Template Context */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{template.title}</CardTitle>
              <Badge variant="secondary" className="mb-4">{template.category}</Badge>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>{template.copyCount} cópias</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Quando e como usar</h3>
              <p className="text-muted-foreground leading-relaxed">
                {template.usageInstructions}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Copy Box */}
      <Card className="mb-6 border-2 border-dashed border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Template</CardTitle>
            <Button 
              onClick={handleCopyTemplate}
              className="flex items-center gap-2"
              disabled={copyMutation.isPending}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Texto
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="bg-muted/50 p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightVariables(template.content) }}
          />
        </CardContent>
      </Card>

      {/* Tips and Variables */}
      {template.variableTips && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas e Variáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap leading-relaxed">
                {template.variableTips}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}