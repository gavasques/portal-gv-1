import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import MaterialContentRenderer from "@/components/materials/material-content-renderer";
import { 
  ChevronRight, 
  Eye, 
  Globe, 
  Lock, 
  ArrowLeft,
  FileText,
  Video,
  Download,
  ExternalLink
} from "lucide-react";
import type { Material } from "@shared/schema";

const formatIcons = {
  pdf: Download,
  text: FileText,
  video: Video,
  link: ExternalLink,
  embed: ExternalLink
};

export default function MaterialView() {
  const [, params] = useRoute("/materials/:id");
  const { user } = useAuth();
  const [viewTracked, setViewTracked] = useState(false);
  
  const materialId = params?.id ? parseInt(params.id) : null;

  const { data: material, isLoading } = useQuery<Material>({
    queryKey: [`/api/materials/${materialId}`],
    enabled: !!materialId,
  });

  // Track view only once per session
  useEffect(() => {
    if (materialId && material && !viewTracked) {
      const sessionKey = `viewed_material_${materialId}`;
      const hasViewedInSession = sessionStorage.getItem(sessionKey);
      
      if (!hasViewedInSession) {
        fetch(`/api/materials/${materialId}/view`, { method: 'POST' })
          .then(() => {
            sessionStorage.setItem(sessionKey, 'true');
            setViewTracked(true);
          })
          .catch(() => {
            // Silent fail for view tracking
          });
      } else {
        setViewTracked(true);
      }
    }
  }, [materialId, material, viewTracked]);

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

  const canAccess = material.accessLevel === "public" || (user && user.groupId !== null);
  const Icon = formatIcons[material.type as keyof typeof formatIcons] || FileText;

  return (
    <div className="space-y-6">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/materials">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/materials" className="hover:text-foreground transition-colors">
            Biblioteca
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link 
            href={`/materials?category=${encodeURIComponent(material.category || '')}`} 
            className="hover:text-foreground transition-colors"
          >
            {material.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{material.title}</span>
        </nav>
      </div>

      {/* Material Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Icon className="h-6 w-6 text-primary" />
              <Badge variant={canAccess ? "default" : "secondary"}>
                {material.accessLevel === "public" ? (
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
    </div>
  );
}