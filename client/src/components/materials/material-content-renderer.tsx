import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Video, 
  FileAudio, 
  FileSpreadsheet, 
  File as FileIcon,
  Globe,
  FolderOpen
} from "lucide-react";
import type { Material } from "@shared/schema";

interface MaterialContentRendererProps {
  material: Material;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const renderTextContent = (content: string) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div 
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

const renderFileDownload = (material: Material) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "documento_pdf":
        return <FileIcon className="h-8 w-8 text-red-500" />;
      case "planilha_excel":
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case "arquivo_word":
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      case "audio":
        return <FileAudio className="h-8 w-8 text-purple-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case "documento_pdf":
        return "Documento PDF";
      case "planilha_excel":
        return "Planilha Excel";
      case "arquivo_word":
        return "Documento Word";
      case "audio":
        return "Arquivo de Áudio";
      default:
        return "Arquivo";
    }
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        {getFileIcon(material.type)}
        <h3 className="mt-4 text-lg font-semibold">{material.fileName || "Arquivo"}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {getFileTypeLabel(material.type)}
        </p>
        {material.url && (
          <Button asChild>
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Baixar Arquivo
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const renderYouTubeVideo = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-destructive">URL do YouTube inválida</p>
          <Button variant="outline" className="mt-4" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Link
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

const renderPandaVideo = (url: string) => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Vídeo Panda</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Clique para assistir o vídeo
        </p>
        <Button asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Video className="h-4 w-4 mr-2" />
            Assistir Vídeo
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

const renderEmbed = (embedCode: string) => {
  return (
    <div className="w-full">
      <div 
        className="w-full min-h-[400px] border rounded-lg overflow-hidden bg-background"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </div>
  );
};

const renderExternalLink = (material: Material) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "link_pasta":
        return <FolderOpen className="h-8 w-8 text-blue-500" />;
      case "link_documento":
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <ExternalLink className="h-8 w-8 text-gray-500" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "link_pasta":
        return "Pasta Externa";
      case "link_documento":
        return "Documento Externo";
      default:
        return "Link Externo";
    }
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        {getIcon(material.type)}
        <h3 className="mt-4 text-lg font-semibold">{getLabel(material.type)}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Clique para acessar o conteúdo externo
        </p>
        {material.url && (
          <Button asChild>
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar Link
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default function MaterialContentRenderer({ material }: MaterialContentRendererProps) {
  const renderContent = () => {
    switch (material.type) {
      case "artigo_texto":
        return material.content ? renderTextContent(material.content) : (
          <p className="text-muted-foreground">Conteúdo não disponível</p>
        );
      
      case "documento_pdf":
      case "planilha_excel":
      case "arquivo_word":
      case "audio":
        return renderFileDownload(material);
      
      case "video_youtube":
        return material.url ? renderYouTubeVideo(material.url) : (
          <p className="text-muted-foreground">URL do vídeo não disponível</p>
        );
      
      case "video_panda":
        return material.url ? renderPandaVideo(material.url) : (
          <p className="text-muted-foreground">URL do vídeo não disponível</p>
        );
      
      case "fluxograma_miro":
      case "embed_iframe":
        return material.embedCode ? renderEmbed(material.embedCode) : (
          <p className="text-muted-foreground">Código de incorporação não disponível</p>
        );
      
      case "link_pasta":
      case "link_documento":
        return renderExternalLink(material);
      
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Tipo de conteúdo não suportado</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Material Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {material.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          {material.category && (
            <Badge variant="outline" className="text-xs">
              {material.category}
            </Badge>
          )}
        </div>
        
        {material.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {material.description}
          </p>
        )}
      </div>

      {/* Dynamic Content */}
      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  );
}