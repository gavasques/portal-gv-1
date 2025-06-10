import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Factory, Package, Bot, Headphones, Calculator, Plus, Rocket, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import type { DashboardMetrics, NewsItem } from "@/lib/types";
import AdminDashboard from "./admin-dashboard";

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend,
  trendText
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string;
  trend?: 'up' | 'down';
  trendText?: string;
}) {
  return (
    <Card className="bg-white shadow-sm border-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          {trendText && (
            <p className={`text-xs flex items-center ${trend === 'up' ? 'text-green-600' : 'text-blue-600'}`}>
              {trend === 'up' ? '↗' : '→'} {trendText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ 
  title, 
  subtitle, 
  icon: Icon, 
  color, 
  onClick 
}: { 
  title: string; 
  subtitle: string; 
  icon: any; 
  color: string; 
  onClick: () => void; 
}) {
  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
      onClick={onClick}
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-center">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </Button>
  );
}

function VideoCard({ 
  title, 
  thumbnail, 
  duration, 
  publishedAt,
  url,
  views
}: { 
  title: string; 
  thumbnail: string; 
  duration: string; 
  publishedAt: string;
  url?: string;
  views?: string;
}) {
  const formatPublishedDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data não disponível';
      
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'hoje';
      if (diffInDays === 1) return 'há 1 dia';
      if (diffInDays < 7) return `há ${diffInDays} dias`;
      if (diffInDays < 30) return `há ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data não disponível';
    }
  };

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={handleClick}>
      <div className="relative rounded-lg overflow-hidden mb-3">
        <div className="w-full h-0 pb-[56.25%] relative">
          <img 
            src={thumbnail} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-200">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded font-medium">
          {duration}
        </div>
      </div>
      <div className="px-2 pb-3">
        <h4 className="font-medium text-sm line-clamp-2 mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          <span>👁 2.4k visualizações</span>
          <span>•</span>
          <span>{formatPublishedDate(publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Show admin dashboard for admin users
  if (user?.groupId === 1) {
    return <AdminDashboard />;
  }

  // Student dashboard for other users
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    enabled: !!user,
  });

  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ['/api/news/latest'],
    enabled: !!user,
  });

  const { data: youtubeData } = useQuery<{videos: any[], lastUpdated: string, channelInfo: any, count: number}>({
    queryKey: ['/api/youtube/videos'],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Rocket className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Bem-vindo de volta, {user.fullName}!
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Hoje</p>
            <p className="text-white font-medium">
              {new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Meus Produtos"
          value={metrics?.productsCount || 124}
          icon={Package}
          color="bg-blue-50 text-blue-600"
          trend="up"
          trendText="12% desde o último mês"
        />
        <MetricCard
          title="Meus Fornecedores"
          value={metrics?.suppliersCount || 18}
          icon={Factory}
          color="bg-green-50 text-green-600"
          trend="up"
          trendText="3 novos este mês"
        />
        <MetricCard
          title="Créditos de IA"
          value={user.aiCredits}
          icon={Bot}
          color="bg-yellow-50 text-yellow-600"
          trendText="Comprar mais créditos"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* YouTube Videos Section - 2 columns */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded mr-3 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent"></div>
                  </div>
                  <span className="text-xl font-semibold">Vídeos Recentes</span>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todos →
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {youtubeData?.videos && youtubeData.videos.length > 0 ? (
                  youtubeData.videos.slice(0, 4).map((video: any) => (
                    <VideoCard 
                      key={video.id} 
                      title={video.title}
                      thumbnail={video.thumbnail}
                      duration={video.duration}
                      publishedAt={video.publishedAt}
                      url={video.url}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Carregando vídeos do canal...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News Sidebar - 1 column */}
        <div>
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded mr-3 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-semibold">Últimas Notícias</span>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todas →
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    category: "Amazon",
                    date: "22 Jun",
                    title: "Amazon Brasil anuncia novas categorias para vendedores",
                    description: "Expansão inclui eletrônicos e produtos para casa, aumentando oportunidades...",
                    color: "bg-orange-100 text-orange-700"
                  },
                  {
                    id: 2,
                    category: "Marketplace",
                    date: "19 Jun",
                    title: "Variação do dólar impacta precificação",
                    description: "Especialistas recomendam revisão na precificação para manter competitividade...",
                    color: "bg-green-100 text-green-700"
                  },
                  {
                    id: 3,
                    category: "Logística",
                    date: "15 Jun",
                    title: "Novos centros de distribuição da Amazon",
                    description: "Redução de 30% nos tempos de entrega para várias regiões do país...",
                    color: "bg-purple-100 text-purple-700"
                  },
                  {
                    id: 4,
                    category: "Impostos",
                    date: "10 Jun",
                    title: "Novas regras de tributação para e-commerce",
                    description: "Mudanças na tributação afetam vendedores de marketplaces diretamente...",
                    color: "bg-orange-100 text-orange-700"
                  },
                  {
                    id: 5,
                    category: "Tendências",
                    date: "05 Jun",
                    title: "Black Friday 2024: Preparação antecipada",
                    description: "Dicas essenciais para maximizar vendas no maior evento do e-commerce...",
                    color: "bg-red-100 text-red-700"
                  }
                ].map((article) => (
                  <div key={article.id} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${article.color}`}>
                        {article.category}
                      </div>
                      <div className="text-xs text-gray-500">{article.date}</div>
                    </div>
                    <h4 className="font-medium text-sm mt-2 mb-1 line-clamp-2">{article.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{article.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}