import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Video, FileIcon, FileAudio, FileSpreadsheet, FileText, Globe } from "lucide-react";
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

const renderAudioPlayer = (material: Material) => {
  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <FileAudio className="h-8 w-8 text-purple-500 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {material.fileName || material.title}
            </h3>
            {material.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {material.description}
              </p>
            )}
            
            {material.filePath && (
              <div className="mb-4">
                <audio controls className="w-full max-w-md">
                  <source src={material.filePath} type={material.mimeType || "audio/mpeg"} />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            )}
            
            <div className="flex gap-2">
              {material.filePath && (
                <Button variant="outline" size="sm" asChild>
                  <a href={material.filePath} download>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Áudio
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const renderVideoPlayer = (material: Material) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Video className="h-8 w-8 text-blue-500 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {material.fileName || material.title}
            </h3>
            {material.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {material.description}
              </p>
            )}
            
            {material.filePath && (
              <div className="mb-4">
                <video controls className="w-full max-w-2xl rounded-lg">
                  <source src={material.filePath} type={material.mimeType || "video/mp4"} />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            )}
            
            <div className="flex gap-2">
              {material.filePath && (
                <Button variant="outline" size="sm" asChild>
                  <a href={material.filePath} download>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Vídeo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const renderPDFViewer = (material: Material) => {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <FileText className="h-8 w-8 text-red-500 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {material.fileName || material.title}
            </h3>
            {material.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {material.description}
              </p>
            )}
            
            {material.filePath && (
              <div className="mb-4">
                <iframe 
                  src={material.filePath}
                  className="w-full h-96 border rounded-lg"
                  title="PDF Viewer"
                />
              </div>
            )}
            
            <div className="flex gap-2">
              {material.filePath && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href={material.filePath} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizar em Tela Cheia
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={material.filePath} download>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const renderFileDownload = (material: Material) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "planilha_excel":
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case "arquivo_word":
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case "planilha_excel":
        return "Planilha Excel";
      case "arquivo_word":
        return "Documento Word";
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
        {material.filePath && (
          <Button asChild>
            <a href={material.filePath} download>
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
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={url}
        title="Panda Video player"
        frameBorder="0"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

const renderExternalLink = (material: Material) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "fluxograma_miro":
        return <Globe className="h-12 w-12 text-blue-500" />;
      case "video_panda":
        return <Video className="h-12 w-12 text-orange-500" />;
      case "link_pasta":
        return <FileIcon className="h-12 w-12 text-purple-500" />;
      case "link_documento":
        return <FileText className="h-12 w-12 text-green-500" />;
      default:
        return <ExternalLink className="h-12 w-12 text-gray-500" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "fluxograma_miro":
        return "Fluxograma Miro";
      case "video_panda":
        return "Vídeo Panda";
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
        return renderPDFViewer(material);
      
      case "planilha_excel":
      case "arquivo_word":
        return renderFileDownload(material);
      
      case "audio":
        return renderAudioPlayer(material);
      
      case "video_upload":
        return renderVideoPlayer(material);
      
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
        return material.embedCode ? (
          <div 
            className="w-full"
            dangerouslySetInnerHTML={{ __html: material.embedCode }} 
          />
        ) : (
          <p className="text-muted-foreground">Código de incorporação não disponível</p>
        );
      
      case "link_pasta":
      case "link_documento":
        return material.url ? renderExternalLink(material) : (
          <p className="text-muted-foreground">Link não disponível</p>
        );
      
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Tipo de material não suportado</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
}