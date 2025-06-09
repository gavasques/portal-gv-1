import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  UserCheck, 
  Crown, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Shield,
  TrendingUp,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    basic: number;
    aluno: number;
    alunoPro: number;
    support: number;
    admin: number;
  };
  tickets: {
    total: number;
    open: number;
  };
  content: {
    materials: number;
    templates: number;
  };
}

interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  category: 'users' | 'system' | 'metrics' | 'distribution';
  enabled: boolean;
  order: number;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'userStats', title: 'Estatísticas de Usuários', description: 'Contadores de usuários por tipo', category: 'users', enabled: true, order: 1 },
  { id: 'systemStats', title: 'Estatísticas do Sistema', description: 'Métricas de tickets e conteúdo', category: 'system', enabled: true, order: 2 },
  { id: 'keyMetrics', title: 'Métricas Principais', description: 'Taxa de conversão e resolução', category: 'metrics', enabled: true, order: 3 },
  { id: 'userDistribution', title: 'Distribuição de Usuários', description: 'Gráfico de distribuição por nível', category: 'distribution', enabled: true, order: 4 },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Widget management state
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('admin-dashboard-widgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const updateWidgetVisibility = (widgetId: string, enabled: boolean) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === widgetId ? { ...widget, enabled } : widget
    );
    setWidgets(updatedWidgets);
    localStorage.setItem('admin-dashboard-widgets', JSON.stringify(updatedWidgets));
  };

  const resetToDefaults = () => {
    setWidgets(defaultWidgets);
    localStorage.setItem('admin-dashboard-widgets', JSON.stringify(defaultWidgets));
  };

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);
  const enabledCount = widgets.filter(w => w.enabled).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground text-red-600">Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  const userStats = [
    {
      title: "Total de Usuários",
      value: stats.users.total,
      icon: Users,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      description: "Todos os usuários registrados"
    },
    {
      title: "Usuários Básicos",
      value: stats.users.basic,
      icon: UserCheck,
      color: "bg-gray-50 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400",
      description: "Acesso gratuito limitado"
    },
    {
      title: "Alunos",
      value: stats.users.aluno,
      icon: UserCheck,
      color: "bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      description: "Acesso padrão aos cursos"
    },
    {
      title: "Alunos Pro",
      value: stats.users.alunoPro,
      icon: Crown,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      description: "Acesso premium completo"
    }
  ];

  const systemStats = [
    {
      title: "Chamados Totais",
      value: stats.tickets.total,
      icon: MessageSquare,
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      description: "Todos os tickets criados"
    },
    {
      title: "Chamados Abertos",
      value: stats.tickets.open,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400",
      description: "Tickets pendentes de resolução"
    },
    {
      title: "Materiais",
      value: stats.content.materials,
      icon: BookOpen,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
      description: "Conteúdos educacionais"
    },
    {
      title: "Templates",
      value: stats.content.templates,
      icon: FileText,
      color: "bg-teal-50 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400",
      description: "Templates disponíveis"
    }
  ];

  const paidUsersPercentage = stats.users.total > 0 
    ? ((stats.users.aluno + stats.users.alunoPro) / stats.users.total) * 100 
    : 0;

  const ticketResolutionRate = stats.tickets.total > 0 
    ? ((stats.tickets.total - stats.tickets.open) / stats.tickets.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema e métricas importantes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Personalizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configurar Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Widgets ativos: {enabledCount} de {widgets.length}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetToDefaults}
                    className="text-xs"
                  >
                    Restaurar Padrão
                  </Button>
                </div>
                <div className="space-y-3">
                  {widgets.map((widget) => (
                    <div key={widget.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={widget.id}
                        checked={widget.enabled}
                        onCheckedChange={(checked) => 
                          updateWidgetVisibility(widget.id, !!checked)
                        }
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={widget.id} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {widget.title}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                      {widget.enabled ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsConfigOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Área Administrativa
          </Badge>
        </div>
      </div>

      {/* Render widgets based on configuration */}
      {enabledWidgets.map((widget) => {
        switch (widget.id) {
          case 'userStats':
            return (
              <div key={widget.id}>
                <h2 className="text-lg font-semibold mb-3">Estatísticas de Usuários</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {userStats.map((stat) => (
                    <Card key={stat.title} className="card-hover">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`h-6 w-6 rounded flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {stat.title}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );

          case 'systemStats':
            return (
              <div key={widget.id}>
                <h2 className="text-lg font-semibold mb-3">Estatísticas do Sistema</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {systemStats.map((stat) => (
                    <Card key={stat.title} className="card-hover">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`h-6 w-6 rounded flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {stat.title}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );

          case 'keyMetrics':
            return (
              <div key={widget.id}>
                <h2 className="text-lg font-semibold mb-3">Métricas Principais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium text-sm">Taxa de Conversão</span>
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {paidUsersPercentage.toFixed(1)}%
                      </div>
                      <Progress value={paidUsersPercentage} className="w-full mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pagos: {stats.users.aluno + stats.users.alunoPro}</span>
                        <span>Total: {stats.users.total}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium text-sm">Taxa de Resolução</span>
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {ticketResolutionRate.toFixed(1)}%
                      </div>
                      <Progress value={ticketResolutionRate} className="w-full mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Resolvidos: {stats.tickets.total - stats.tickets.open}</span>
                        <span>Total: {stats.tickets.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );

          case 'userDistribution':
            return (
              <Card key={widget.id}>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-3">Distribuição por Nível de Acesso</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Básico", value: stats.users.basic, color: "bg-gray-500" },
                      { label: "Aluno", value: stats.users.aluno, color: "bg-blue-500" },
                      { label: "Aluno Pro", value: stats.users.alunoPro, color: "bg-purple-500" },
                      { label: "Suporte", value: stats.users.support, color: "bg-yellow-500" },
                      { label: "Admin", value: stats.users.admin, color: "bg-red-500" }
                    ].map((item) => {
                      const percentage = stats.users.total > 0 ? (item.value / stats.users.total) * 100 : 0;
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <div className="w-16 text-xs font-medium">{item.label}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${item.color}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground w-12">
                                {item.value} ({percentage.toFixed(0)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}