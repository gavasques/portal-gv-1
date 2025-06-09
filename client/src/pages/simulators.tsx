import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, DollarSign, Truck, AlertTriangle, Save, FileText } from "lucide-react";

interface PricingData {
  costPrice: string;
  salePrice: string;
  quantity: string;
  margin: number;
  profit: number;
}

interface SimplesData {
  revenue: string;
  anexo: string;
  taxRate: number;
  taxAmount: number;
}

interface ImportData {
  type: "simplified" | "formal" | "shared";
  productValue: string;
  quantity: string;
  weight: string;
  totalCost: number;
  taxes: number;
  fees: number;
}

export default function Simulators() {
  const [activeSimulator, setActiveSimulator] = useState<string | null>(null);
  
  // Pricing Simulator State
  const [pricingData, setPricingData] = useState<PricingData>({
    costPrice: "",
    salePrice: "",
    quantity: "1",
    margin: 0,
    profit: 0,
  });

  // Simples Nacional State
  const [simplesData, setSimplesData] = useState<SimplesData>({
    revenue: "",
    anexo: "3",
    taxRate: 0,
    taxAmount: 0,
  });

  // Import Simulator State
  const [importData, setImportData] = useState<ImportData>({
    type: "simplified",
    productValue: "",
    quantity: "1",
    weight: "",
    totalCost: 0,
    taxes: 0,
    fees: 0,
  });

  const calculatePricing = () => {
    const cost = parseFloat(pricingData.costPrice) || 0;
    const sale = parseFloat(pricingData.salePrice) || 0;
    const qty = parseInt(pricingData.quantity) || 1;

    const profit = (sale - cost) * qty;
    const margin = sale > 0 ? ((sale - cost) / sale) * 100 : 0;

    setPricingData({
      ...pricingData,
      profit,
      margin,
    });
  };

  const calculateSimples = () => {
    const revenue = parseFloat(simplesData.revenue) || 0;
    const anexo = simplesData.anexo;
    
    // Simplified tax calculation based on Anexo
    const taxRates: Record<string, number> = {
      "1": 4.0,   // Comércio
      "2": 7.3,   // Indústria
      "3": 6.0,   // Serviços
      "4": 4.5,   // Serviços
      "5": 15.5,  // Serviços
    };

    const rate = taxRates[anexo] || 6.0;
    const amount = (revenue * rate) / 100;

    setSimplesData({
      ...simplesData,
      taxRate: rate,
      taxAmount: amount,
    });
  };

  const calculateImport = () => {
    const value = parseFloat(importData.productValue) || 0;
    const qty = parseInt(importData.quantity) || 1;
    const weight = parseFloat(importData.weight) || 0;

    let taxes = 0;
    let fees = 0;

    if (importData.type === "simplified") {
      // Simplified import - 60% tax up to $50
      taxes = Math.min(value * qty * 0.6, 50 * qty);
      fees = 15; // Fixed handling fee
    } else if (importData.type === "formal") {
      // Formal import - II + IPI + PIS + COFINS
      const ii = value * qty * 0.14; // Average import duty
      const ipi = value * qty * 0.15; // IPI
      const pisCofins = value * qty * 0.095; // PIS/COFINS
      taxes = ii + ipi + pisCofins;
      fees = weight * 2.5 + 100; // Storage + handling
    } else {
      // Shared import
      taxes = value * qty * 0.20;
      fees = weight * 1.5 + 50;
    }

    setImportData({
      ...importData,
      taxes,
      fees,
      totalCost: value * qty + taxes + fees,
    });
  };

  const simulators = [
    {
      id: "pricing",
      title: "Simulador de Precificação",
      description: "Calcule rapidamente preços, margens e lucros dos seus produtos",
      icon: DollarSign,
      color: "bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    },
    {
      id: "simples",
      title: "Simulador do Simples Nacional",
      description: "Calcule os impostos devidos no regime do Simples Nacional",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    },
    {
      id: "import",
      title: "Simulador de Importação",
      description: "Compare custos entre importação simplificada, formal e compartilhada",
      icon: Truck,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    },
  ];

  const SimulatorCard = ({ simulator }: { simulator: typeof simulators[0] }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${simulator.color}`}>
            <simulator.icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg">{simulator.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {simulator.description}
        </p>

        <Button 
          className="w-full"
          onClick={() => setActiveSimulator(simulator.id)}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Abrir Simulador
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Simuladores</h1>
        <p className="text-muted-foreground">
          Ferramentas práticas para auxiliar nas suas decisões de negócio
        </p>
      </div>

      {/* Legal Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Aviso Legal:</strong> Os resultados dos simuladores são estimativas baseadas em cálculos aproximados e não substituem a consulta a um profissional especializado. Os valores podem variar conforme a situação específica e mudanças na legislação.
        </AlertDescription>
      </Alert>

      {/* Simulators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulators.map((simulator) => (
          <SimulatorCard key={simulator.id} simulator={simulator} />
        ))}
      </div>

      {/* Pricing Simulator Dialog */}
      <Dialog open={activeSimulator === "pricing"} onOpenChange={() => setActiveSimulator(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulador de Precificação</DialogTitle>
            <DialogDescription>
              Calcule margens de lucro e preços de venda dos seus produtos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={pricingData.costPrice}
                  onChange={(e) => setPricingData({ ...pricingData, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={pricingData.salePrice}
                  onChange={(e) => setPricingData({ ...pricingData, salePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={pricingData.quantity}
                  onChange={(e) => setPricingData({ ...pricingData, quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={calculatePricing} className="w-full">
                  Calcular
                </Button>
              </div>
            </div>

            {pricingData.profit !== 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-3">Resultados:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Lucro Total:</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      R$ {pricingData.profit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Margem de Lucro:</div>
                    <div className="text-lg font-semibold">
                      {pricingData.margin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Simples Nacional Dialog */}
      <Dialog open={activeSimulator === "simples"} onOpenChange={() => setActiveSimulator(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulador do Simples Nacional</DialogTitle>
            <DialogDescription>
              Calcule os impostos devidos no regime tributário Simples Nacional
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue">Faturamento Mensal (R$)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={simplesData.revenue}
                  onChange={(e) => setSimplesData({ ...simplesData, revenue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="anexo">Anexo do Simples</Label>
                <Select value={simplesData.anexo} onValueChange={(value) => setSimplesData({ ...simplesData, anexo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Anexo I - Comércio</SelectItem>
                    <SelectItem value="2">Anexo II - Indústria</SelectItem>
                    <SelectItem value="3">Anexo III - Serviços</SelectItem>
                    <SelectItem value="4">Anexo IV - Serviços</SelectItem>
                    <SelectItem value="5">Anexo V - Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculateSimples} className="w-full">
              Calcular Impostos
            </Button>

            {simplesData.taxAmount > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-3">Resultado:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Alíquota:</div>
                    <div className="text-lg font-semibold">
                      {simplesData.taxRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Imposto a Pagar:</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      R$ {simplesData.taxAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Simulator Dialog */}
      <Dialog open={activeSimulator === "import"} onOpenChange={() => setActiveSimulator(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulador de Importação</DialogTitle>
            <DialogDescription>
              Compare custos entre diferentes modalidades de importação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="importType">Tipo de Importação</Label>
              <Select value={importData.type} onValueChange={(value: any) => setImportData({ ...importData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simplified">Importação Simplificada</SelectItem>
                  <SelectItem value="formal">Importação Formal</SelectItem>
                  <SelectItem value="shared">Importação Compartilhada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="productValue">Valor do Produto (USD)</Label>
                <Input
                  id="productValue"
                  type="number"
                  step="0.01"
                  value={importData.productValue}
                  onChange={(e) => setImportData({ ...importData, productValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="importQuantity">Quantidade</Label>
                <Input
                  id="importQuantity"
                  type="number"
                  value={importData.quantity}
                  onChange={(e) => setImportData({ ...importData, quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={importData.weight}
                  onChange={(e) => setImportData({ ...importData, weight: e.target.value })}
                  placeholder="0.0"
                />
              </div>
            </div>

            <Button onClick={calculateImport} className="w-full">
              Calcular Custos
            </Button>

            {importData.totalCost > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-3">Resultado da Simulação:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Impostos:</div>
                    <div className="font-semibold">
                      R$ {importData.taxes.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Taxas e Tarifas:</div>
                    <div className="font-semibold">
                      R$ {importData.fees.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <div className="text-muted-foreground">Custo Total Estimado:</div>
                    <div className="text-lg font-bold text-primary">
                      R$ {importData.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
