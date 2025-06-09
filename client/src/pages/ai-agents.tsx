import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Bot, Zap, Image, MessageSquare, CreditCard, History, Download, Copy, Loader2, ShoppingCart } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { id: "basic", name: "Pacote Básico", credits: 50, price: 29.90 },
  { id: "pro", name: "Pacote Pro", credits: 150, price: 79.90, popular: true },
  { id: "premium", name: "Pacote Premium", credits: 300, price: 149.90 },
  { id: "enterprise", name: "Pacote Empresarial", credits: 500, price: 199.90 }
];

function PaymentForm({ packageData, onSuccess }: { packageData: CreditPackage; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/ai-agents?payment=success",
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else {
        onSuccess();
        toast({
          title: "Pagamento realizado!",
          description: `${packageData.credits} créditos foram adicionados à sua conta.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={isProcessing || !stripe} className="w-full">
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        Finalizar Compra - R$ {packageData.price.toFixed(2)}
      </Button>
    </form>
  );
}

function CreditPurchase({ onClose }: { onClose: () => void }) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const { toast } = useToast();

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (packageData: CreditPackage) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: packageData.price,
        credits: packageData.credits
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o pagamento",
        variant: "destructive",
      });
    }
  });

  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    createPaymentIntentMutation.mutate(pkg);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    onClose();
  };

  if (selectedPackage && clientSecret) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Finalizar Compra</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="font-medium">{selectedPackage.name}</p>
            <p className="text-2xl font-bold text-blue-600">R$ {selectedPackage.price.toFixed(2)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPackage.credits} créditos</p>
          </div>
        </div>

        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: { theme: 'stripe' }
          }}
        >
          <PaymentForm packageData={selectedPackage} onSuccess={handlePaymentSuccess} />
        </Elements>

        <Button variant="outline" onClick={() => {
          setSelectedPackage(null);
          setClientSecret("");
        }} className="w-full">
          Voltar aos Pacotes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Escolha seu Pacote de Créditos</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione o pacote que melhor atende suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creditPackages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              pkg.popular ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handlePackageSelect(pkg)}
          >
            <CardContent className="p-6 text-center relative">
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Mais Popular
                </Badge>
              )}
              <h4 className="font-semibold text-lg mb-2">{pkg.name}</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                R$ {pkg.price.toFixed(2)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {pkg.credits} créditos
              </p>
              <p className="text-sm text-gray-500">
                R$ {(pkg.price / pkg.credits).toFixed(2)} por crédito
              </p>
              <Button 
                className="mt-4 w-full" 
                variant={pkg.popular ? "default" : "outline"}
                disabled={createPaymentIntentMutation.isPending}
              >
                {createPaymentIntentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Comprar Agora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AiAgents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listing");
  const [showPurchase, setShowPurchase] = useState(false);

  // Listing Generator State
  const [listingForm, setListingForm] = useState({
    productName: "",
    category: "",
    targetAudience: "",
    features: "",
    competitors: ""
  });

  // Image Generator State
  const [imageForm, setImageForm] = useState({
    productImage: null as File | null,
    style: ""
  });

  const generateListingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-listing", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Listing gerado com sucesso!",
        description: `Foram utilizados ${data.creditsUsed} créditos. Você possui ${data.remainingCredits} créditos restantes.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar listing",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  const generateImagesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Imagens geradas com sucesso!",
        description: `Foram utilizados ${data.creditsUsed} créditos. Você possui ${data.remainingCredits} créditos restantes.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar imagens",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  const handleGenerateListing = () => {
    if (!listingForm.productName || !listingForm.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome do produto e categoria",
        variant: "destructive",
      });
      return;
    }

    generateListingMutation.mutate({
      productInfo: {
        name: listingForm.productName,
        category: listingForm.category,
        features: listingForm.features
      },
      targetAudience: listingForm.targetAudience,
      competitors: listingForm.competitors
    });
  };

  const handleGenerateImages = () => {
    if (!imageForm.productImage || !imageForm.style) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma imagem e um estilo",
        variant: "destructive",
      });
      return;
    }

    generateImagesMutation.mutate({
      productImage: imageForm.productImage,
      style: imageForm.style
    });
  };

  if (!user) return null;

  if (showPurchase) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Comprar Créditos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Adquira créditos para usar os agentes de IA
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{user.aiCredits}</div>
            <div className="text-sm text-gray-500">créditos atuais</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <CreditPurchase onClose={() => setShowPurchase(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agentes de IA</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Utilize inteligência artificial para otimizar seu e-commerce
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{user.aiCredits}</div>
          <div className="text-sm text-gray-500">créditos disponíveis</div>
        </div>
      </div>

      {/* Credit Purchase Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Precisa de mais créditos?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pacotes de créditos disponíveis para uso nos agentes de IA
              </p>
            </div>
            <Button className="gap-2" onClick={() => setShowPurchase(true)}>
              <CreditCard className="h-4 w-4" />
              Comprar Créditos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listing">Gerador de Listing</TabsTrigger>
          <TabsTrigger value="images">Gerador de Imagens</TabsTrigger>
          <TabsTrigger value="expert">Especialistas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Listing Generator */}
        <TabsContent value="listing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Gerador de Listing
                </CardTitle>
                <CardDescription>
                  Crie títulos, bullet points e descrições otimizados com IA
                  <Badge variant="secondary" className="ml-2">5 créditos</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto *</Label>
                  <Input
                    id="productName"
                    value={listingForm.productName}
                    onChange={(e) => setListingForm(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Ex: Fone de Ouvido Bluetooth"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    value={listingForm.category}
                    onChange={(e) => setListingForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Eletrônicos"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAudience">Público-alvo</Label>
                  <Input
                    id="targetAudience"
                    value={listingForm.targetAudience}
                    onChange={(e) => setListingForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Ex: Jovens urbanos, profissionais"
                  />
                </div>
                <div>
                  <Label htmlFor="features">Características Principais</Label>
                  <Textarea
                    id="features"
                    value={listingForm.features}
                    onChange={(e) => setListingForm(prev => ({ ...prev, features: e.target.value }))}
                    placeholder="Ex: Bluetooth 5.0, cancelamento de ruído, bateria 20h"
                  />
                </div>
                <div>
                  <Label htmlFor="competitors">Principais Concorrentes</Label>
                  <Input
                    id="competitors"
                    value={listingForm.competitors}
                    onChange={(e) => setListingForm(prev => ({ ...prev, competitors: e.target.value }))}
                    placeholder="Ex: Sony, JBL, Beats"
                  />
                </div>
                <Button 
                  onClick={handleGenerateListing}
                  disabled={generateListingMutation.isPending || user.aiCredits < 5}
                  className="w-full"
                >
                  {generateListingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Gerar Listing (5 créditos)
                </Button>
              </CardContent>
            </Card>

            {generateListingMutation.data && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado Gerado</CardTitle>
                  <CardDescription>
                    Listing otimizado para seu produto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="font-medium">{generateListingMutation.data.listing.title}</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Bullet Points</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <ul className="space-y-1">
                        {generateListingMutation.data.listing.bulletPoints.map((point: string, index: number) => (
                          <li key={index} className="text-sm">{point}</li>
                        ))}
                      </ul>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm">{generateListingMutation.data.listing.description}</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Image Generator */}
        <TabsContent value="images" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Gerador de Imagens
                </CardTitle>
                <CardDescription>
                  Transforme fotos de produtos em imagens profissionais
                  <Badge variant="secondary" className="ml-2">3 créditos</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productImage">Imagem do Produto *</Label>
                  <Input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageForm(prev => ({ ...prev, productImage: file }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="imageStyle">Estilo *</Label>
                  <Select value={imageForm.style} onValueChange={(value) => setImageForm(prev => ({ ...prev, style: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifestyle">Lifestyle (produto em uso)</SelectItem>
                      <SelectItem value="infographic">Infográfico (com benefícios)</SelectItem>
                      <SelectItem value="studio">Studio (fundo branco)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateImages}
                  disabled={generateImagesMutation.isPending || user.aiCredits < 3}
                  className="w-full"
                >
                  {generateImagesMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Gerar Imagens (3 créditos)
                </Button>
              </CardContent>
            </Card>

            {generateImagesMutation.data && (
              <Card>
                <CardHeader>
                  <CardTitle>Imagens Geradas</CardTitle>
                  <CardDescription>
                    Suas imagens profissionais estão prontas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {generateImagesMutation.data.images.map((image: any) => (
                      <div key={image.id} className="space-y-2">
                        <img
                          src={image.url}
                          alt="Generated image"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* AI Experts */}
        <TabsContent value="expert" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Especialista Amazon</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dúvidas sobre FBA, ranking, políticas
                </p>
                <Badge variant="secondary" className="mt-2">2 créditos/pergunta</Badge>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Especialista Importação</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processos, documentação, tributação
                </p>
                <Badge variant="secondary" className="mt-2">2 créditos/pergunta</Badge>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Planos de Ação</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estratégias personalizadas de crescimento
                </p>
                <Badge variant="secondary" className="mt-2">5 créditos/plano</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Uso
              </CardTitle>
              <CardDescription>
                Acompanhe o uso dos seus créditos de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum histórico de uso ainda
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Comece usando os agentes de IA para ver seu histórico aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}