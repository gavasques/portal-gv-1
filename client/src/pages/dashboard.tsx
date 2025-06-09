import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Factory, Package, Bot, Headphones, Calculator, Plus, Rocket, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import type { DashboardMetrics, NewsItem } from "@/lib/types";

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
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
      className="h-auto p-4 text-left justify-start w-full flex items-center space-x-3"
      onClick={onClick}
    >
      <div className={`${color} p-2 rounded-lg shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-left">{title}</p>
        <p className="text-xs text-muted-foreground text-left">{subtitle}</p>
      </div>
    </Button>
  );
}

function VideoCard({ 
  title, 
  thumbnail, 
  duration, 
  publishedAt 
}: { 
  title: string; 
  thumbnail: string; 
  duration: string; 
  publishedAt: string; 
}) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden mb-3">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>
      <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="text-xs text-muted-foreground mt-1">{publishedAt}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    enabled: !!user,
  });

  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ['/api/news/latest'],
    enabled: !!user,
  });

  const { data: youtubeData } = useQuery({
    queryKey: ['/api/youtube/videos'],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h2>
            <p className="text-primary-foreground/80">
              Continue sua jornada para o sucesso no e-commerce
            </p>
          </div>
          <div className="hidden md:block">
            <Rocket className="h-16 w-16 text-primary-foreground/30" />
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Meus Fornecedores"
          value={metrics?.suppliersCount || 0}
          icon={Factory}
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
        />
        <MetricCard
          title="Meus Produtos"
          value={metrics?.productsCount || 0}
          icon={Package}
          color="bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400"
        />
        <MetricCard
          title="Créditos de IA"
          value={metrics?.aiCredits || 0}
          icon={Bot}
          color="bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
        />
        <MetricCard
          title="Chamados Abertos"
          value={metrics?.openTickets || 0}
          icon={Headphones}
          color="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest YouTube Videos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded mr-2 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent"></div>
                </div>
                Últimos Vídeos do Canal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockVideos.map((video, index) => (
                  <VideoCard key={index} {...video} />
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline" className="gap-2">
                  Ver todos os vídeos
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News and Quick Actions */}
        <div className="space-y-6">
          {/* Latest News */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Últimas Notícias</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {news?.length ? (
                  news.slice(0, 3).map((article) => (
                    <div key={article.id} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-sm mb-2">{article.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <Badge variant={article.isImportant ? "destructive" : "secondary"}>
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Nenhuma notícia disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  title="Gerar Listing"
                  subtitle="com IA"
                  icon={Bot}
                  color="text-primary bg-primary/10"
                  onClick={() => navigate("/ai-agents")}
                />
                <QuickActionButton
                  title="Simular"
                  subtitle="Preço/Lucro"
                  icon={Calculator}
                  color="text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/50"
                  onClick={() => navigate("/simulators")}
                />
                <QuickActionButton
                  title="Adicionar"
                  subtitle="Fornecedor"
                  icon={Plus}
                  color="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50"
                  onClick={() => navigate("/my-suppliers")}
                />
                <QuickActionButton
                  title="Abrir"
                  subtitle="Chamado"
                  icon={Headphones}
                  color="text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/50"
                  onClick={() => navigate("/tickets")}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Credits Status */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Créditos de IA</h3>
              <Bot className="h-8 w-8 text-purple-200" />
            </div>
            <div className="mb-4">
              <div className="text-2xl font-bold">{user.aiCredits}</div>
              <div className="text-purple-200 text-sm">créditos disponíveis</div>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full h-2 mb-4">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((user.aiCredits / 200) * 100, 100)}%` }}
              ></div>
            </div>
            <Button 
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white/20"
              variant="outline"
              onClick={() => navigate("/ai-agents")}
            >
              Comprar Mais Créditos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
