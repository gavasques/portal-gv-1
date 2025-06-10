import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import MaterialContentRenderer from "@/components/materials/material-content-renderer";
import { 
  ChevronRight, 
  Download, 
  Eye, 
  Globe, 
  Lock, 
  MessageSquare, 
  Send,
  FileText,
  Video,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import type { Material } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const formatIcons = {
  pdf: Download,
  text: FileText,
  video: Video,
  link: ExternalLink,
  embed: ExternalLink
};

function CTABanner() {
  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Acesso Limitado</h3>
            <p className="mb-4 opacity-90">
              Este é um material exclusivo para alunos. Faça upgrade do seu plano para acessar 
              este e centenas de outros conteúdos exclusivos.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Ver Planos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Saiba Mais
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Lock className="h-16 w-16 opacity-30" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentSection({ materialId, comments }: { materialId: number; comments: Comment[] }) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/materials/${materialId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/materials/${materialId}/comments`] });
      setNewComment("");
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      addComment(newComment.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Compartilhe seus insights sobre este material..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim() || isPending}>
                <Send className="h-4 w-4 mr-2" />
                Publicar Comentário
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-3">Faça login para comentar</p>
            <Link href="/login">
              <Button variant="outline" size="sm">Fazer Login</Button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum comentário ainda</h3>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a comentar sobre este material
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {comment.user?.fullName?.charAt(0) || comment.user?.email.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.user?.fullName || comment.user?.email.split('@')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MaterialView() {
  const [, params] = useRoute("/materials/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const materialId = params?.id ? parseInt(params.id) : null;

  const { data: material, isLoading } = useQuery<Material>({
    queryKey: [`/api/materials/${materialId}`],
    enabled: !!materialId,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/materials/${materialId}/comments`],
    enabled: !!materialId,
  });

  // Track view when component mounts
  useEffect(() => {
    if (materialId && material) {
      fetch(`/api/materials/${materialId}/view`, { method: 'POST' })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: [`/api/materials/${materialId}`] });
        })
        .catch(() => {
          // Silent fail for view tracking
        });
    }
  }, [materialId, material, queryClient]);

  if (isLoading || !material) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-muted rounded w-2/3 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const canAccess = material.accessLevel === "Public" || (user && user.accessLevel !== "Basic");
  const Icon = formatIcons[material.type as keyof typeof formatIcons] || FileText;
  const isBasicUser = user?.accessLevel === "Basic";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/materials" className="hover:text-foreground">
          Biblioteca
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="hover:text-foreground">{material.category}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{material.title}</span>
      </nav>

      {/* Material Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Icon className="h-6 w-6 text-primary" />
              <Badge variant={canAccess ? "default" : "secondary"}>
                {material.accessLevel === "Public" ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Público
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Aluno Exclusivo
                  </>
                )}
              </Badge>
              <Badge variant="outline">{material.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{material.title}</h1>
            {material.description && (
              <p className="text-lg text-muted-foreground">{material.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{material.viewCount} visualizações</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner for Basic Users on Restricted Content */}
      {isBasicUser && material.accessLevel !== "Public" && <CTABanner />}

      {/* Main Content */}
      {canAccess ? (
        <Card>
          <CardContent className="p-6">
            <MaterialContentRenderer material={material} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Conteúdo Restrito</h3>
            <p className="text-muted-foreground mb-4">
              Este material é exclusivo para alunos
            </p>
            <Button>Fazer Upgrade</Button>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <CommentSection materialId={material.id} comments={comments} />
    </div>
  );
}