import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Bot, Zap, CreditCard, Image, MessageSquare, FileText, ShoppingCart } from "lucide-react";

const aiAgents = [
  {
    id: "listing-generator",
    name: "Gerador de Listing",
    description: "Crie títulos, bullet points e descrições otimizados para seus produtos Amazon",
    icon: FileText,
    cost: 5,
    features: [
      "Análise de concorrentes",
      "Otimização para SEO",
      "Múltiplas versões",
      "Palavras-chave estratégicas"
    ],
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
  },
  {
    id: "image-generator",
    name: "Gerador de Imagens",
    description: "Transforme fotos de produtos com estilos profissionais",
    icon: Image,
    cost: 3,
    features: [
      "Estilo Lifestyle",
      "Infográficos",
      "Fundo Studio",
      "Alta qualidade"
    ],
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
  },
  {
    id: "expert-amazon",
    name: "Especialista Amazon",
    description: "Tire dúvidas sobre vendas na Amazon com nossa base de conhecimento",
    icon: ShoppingCart,
    cost: 2,
    features: [
      "Perguntas e respostas",
      "Base de conhecimento atualizada",
      "Metodologia proprietária",
      "Suporte especializado"
    ],
    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
  },
  {
    id: "expert-import",
    name: "Especialista Importação",
    description: "Consultoria sobre processos de importação e regulamentações",
    icon: Bot,
    cost: 2,
    features: [
      "Processos aduaneiros",
      "Documentação necessária",
      "Custos e taxas",
      "Regulamentações"
    ],
    color: "bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400"
  },
  {
    id: "action-plans",
    name: "Planos de Ação",
    description: "Receba planos detalhados para alcançar seus objetivos no e-commerce",
    icon: MessageSquare,
    cost: 4,
    features: [
      "Planos personalizados",
      "Etapas detalhadas",
      "Cronogramas realistas",
      "Métricas de acompanhamento"
    ],
    color: "bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400"
  }
];

const creditPackages = [
  {
    id: "starter",
    name: "Pacote Starter",
    credits: 50,
    price: 29.90,
    popular: false
  },
  {
    id: "professional",
    name: "Pacote Professional",
    credits: 150,
    price: 79.90,
    popular: true,
    bonus: 25
  },
  {
    id: "enterprise",
    name: "Pacote Enterprise",
    credits: 300,
    price: 149.90,
    popular: false,
    bonus: 75
  }
];

export default function AiAgents() {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  if (!user) return null;

  const AgentCard = ({ agent }: { agent: typeof aiAgents[0] }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${agent.color}`}>
              <agent.icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  {agent.cost} créditos
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {agent.description}
        </p>

        <div className="space-y-2">
          <div className="text-sm font-medium">Recursos:</div>
          <ul className="text-sm space-y-1">
            {agent.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t">
          <Button 
            className="w-full"
            disabled={user.aiCredits < agent.cost}
          >
            {user.aiCredits < agent.cost ? (
              "Créditos Insuficientes"
            ) : (
              `Usar Agente (${agent.cost} créditos)`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CreditPackageCard = ({ package: pkg }: { package: typeof creditPackages[0] }) => (
    <Card className={`card-hover ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="text-center">
        {pkg.popular && (
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
            Mais Popular
          </Badge>
        )}
        <CardTitle className="text-xl">{pkg.name}</CardTitle>
        <div className="text-3xl font-bold text-primary">
          R$ {pkg.price.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{pkg.credits}</div>
          <div className="text-sm text-muted-foreground">créditos</div>
          {pkg.bonus && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              + {pkg.bonus} créditos bônus
            </div>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Preço por crédito: R$ {(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(2)}
        </div>

        <Button className="w-full">
          <CreditCard className="h-4 w-4 mr-2" />
          Comprar Agora
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agentes de IA</h1>
          <p className="text-muted-foreground">
            Automatize e otimize suas tarefas com inteligência artificial
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Seus créditos</div>
          <div className="text-2xl font-bold text-primary">{user.aiCredits}</div>
        </div>
      </div>

      {/* Credits Status */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Status dos Créditos</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-2xl font-bold">{user.aiCredits}</div>
                  <div className="text-purple-200 text-sm">créditos disponíveis</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full h-2 w-32">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((user.aiCredits / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <Bot className="h-16 w-16 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      {/* AI Agents */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Agentes Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Credit Packages */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Pacotes de Créditos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <CreditPackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      </div>

      {/* Usage History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Histórico de Uso</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum uso registrado</h3>
              <p className="text-muted-foreground">
                Quando você usar os agentes de IA, o histórico aparecerá aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
