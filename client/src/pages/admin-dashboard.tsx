import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  Crown, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Shield,
  TrendingUp,
  AlertCircle
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

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

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
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Área Administrativa
        </Badge>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Estatísticas de Usuários</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat) => (
            <Card key={stat.title} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Estatísticas do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat) => (
            <Card key={stat.title} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Métricas Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Taxa de Conversão
              </CardTitle>
              <CardDescription>
                Percentual de usuários com planos pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {paidUsersPercentage.toFixed(1)}%
              </div>
              <Progress value={paidUsersPercentage} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Usuários Pagos: {stats.users.aluno + stats.users.alunoPro}</span>
                <span>Total: {stats.users.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Taxa de Resolução de Tickets
              </CardTitle>
              <CardDescription>
                Percentual de tickets resolvidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {ticketResolutionRate.toFixed(1)}%
              </div>
              <Progress value={ticketResolutionRate} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Resolvidos: {stats.tickets.total - stats.tickets.open}</span>
                <span>Total: {stats.tickets.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Usuários por Nível</CardTitle>
          <CardDescription>
            Visualização da distribuição dos níveis de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Básico", value: stats.users.basic, color: "bg-gray-500" },
              { label: "Aluno", value: stats.users.aluno, color: "bg-blue-500" },
              { label: "Aluno Pro", value: stats.users.alunoPro, color: "bg-purple-500" },
              { label: "Suporte", value: stats.users.support, color: "bg-yellow-500" },
              { label: "Admin", value: stats.users.admin, color: "bg-red-500" }
            ].map((item) => {
              const percentage = stats.users.total > 0 ? (item.value / stats.users.total) * 100 : 0;
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">{item.label}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground w-16">
                        {item.value} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}