import { db } from "./db";
import { templates } from "@shared/schema";

const exampleTemplates = [
  // Fornecedores Category
  {
    title: "Contato Inicial com Fornecedor Chinês",
    content: `Olá [NOME_FORNECEDOR],

Meu nome é [SEU_NOME] e represento [SUA_EMPRESA], uma empresa focada em importação para o mercado brasileiro.

Estou interessado(a) em seus produtos [CATEGORIA_PRODUTO] e gostaria de estabelecer uma parceria comercial duradoura.

Poderiam me enviar:
- Catálogo completo de produtos
- Preços FOB para quantidades de [QUANTIDADE_MINIMA] a [QUANTIDADE_MAXIMA] peças
- Tempo de produção e envio
- Certificações disponíveis (CE, FCC, etc.)
- MOQ (Quantidade Mínima de Pedido)

Aguardo retorno para iniciarmos nossa parceria.

Atenciosamente,
[SEU_NOME]
[SEU_EMAIL]
[SEU_TELEFONE]`,
    category: "Fornecedores",
    purpose: "Estabelecer primeiro contato profissional com fornecedores internacionais",
    usageInstructions: "Substitua as variáveis entre colchetes com suas informações específicas. Use um tom profissional mas amigável.",
    variableTips: "[NOME_FORNECEDOR] - Nome da empresa ou pessoa\n[SEU_NOME] - Seu nome completo\n[SUA_EMPRESA] - Nome da sua empresa\n[CATEGORIA_PRODUTO] - Tipo de produto que deseja importar",
    status: "published",
    language: "pt-BR",
    tags: ["fornecedor", "primeiro-contato", "importação"]
  },
  {
    title: "Negociação de Preços e Condições",
    content: `Prezado(a) [NOME_FORNECEDOR],

Obrigado(a) pelo orçamento enviado. Analisei cuidadosamente e tenho algumas considerações:

**Sobre os preços:**
- O preço atual de US$ [PREÇO_ATUAL] está [PERCENTUAL]% acima do nosso orçamento
- Nosso target de preço é US$ [PREÇO_TARGET] por unidade
- Podemos considerar volumes maiores para alcançar este preço

**Sobre as condições:**
- Prazo de pagamento: [PRAZO_DESEJADO] (atualmente [PRAZO_OFERECIDO])
- Prazo de entrega: máximo [PRAZO_ENTREGA] dias
- Garantia de qualidade: [TIPO_GARANTIA]

**Proposta:**
Para um pedido inicial de [QUANTIDADE] unidades, conseguem trabalhar com US$ [PREÇO_NEGOCIADO]?

Esta seria uma parceria de longo prazo com pedidos regulares mensais.

Aguardo retorno,
[SEU_NOME]`,
    category: "Fornecedores",
    purpose: "Negociar melhores preços e condições comerciais",
    usageInstructions: "Use após receber a primeira cotação. Seja específico com números e prazos.",
    variableTips: "[PREÇO_ATUAL] - Preço que o fornecedor ofereceu\n[PREÇO_TARGET] - Preço que você quer pagar\n[PERCENTUAL] - Diferença percentual entre os preços",
    status: "published",
    language: "pt-BR",
    tags: ["negociação", "preços", "condições"]
  },
  {
    title: "Solicitação de Amostras",
    content: `Caro [NOME_FORNECEDOR],

Após nossa conversa inicial, gostaria de solicitar amostras dos seguintes produtos:

**Produtos solicitados:**
1. [PRODUTO_1] - Modelo: [MODELO_1] - Quantidade: [QTD_1] pcs
2. [PRODUTO_2] - Modelo: [MODELO_2] - Quantidade: [QTD_2] pcs
3. [PRODUTO_3] - Modelo: [MODELO_3] - Quantidade: [QTD_3] pcs

**Especificações importantes:**
- Embalagem: [TIPO_EMBALAGEM]
- Cores disponíveis: [CORES]
- Certificações: [CERTIFICAÇÕES_NECESSÁRIAS]

**Envio:**
- Endereço: [SEU_ENDEREÇO_COMPLETO]
- Método preferido: [MÉTODO_ENVIO] (DHL, FedEx, etc.)
- Podemos cobrir os custos de envio

Estas amostras são para avaliação de qualidade e testes no mercado brasileiro. Se aprovadas, faremos pedidos de [VOLUME_INICIAL] unidades inicialmente.

Por favor, informem:
- Custo das amostras
- Prazo de envio
- Tracking number quando despachado

Obrigado(a),
[SEU_NOME]`,
    category: "Fornecedores",
    purpose: "Solicitar amostras de produtos para avaliação",
    usageInstructions: "Use antes de fazer pedidos grandes. Seja específico sobre especificações e quantidade.",
    variableTips: "[PRODUTO_X] - Nome específico do produto\n[MODELO_X] - Modelo ou código do produto\n[TIPO_EMBALAGEM] - Como deve vir embalado",
    status: "published",
    language: "pt-BR",
    tags: ["amostras", "produtos", "avaliação"]
  },
  {
    title: "Follow-up Pós-Pedido",
    content: `Olá [NOME_FORNECEDOR],

Espero que estejam bem. Estou acompanhando o status do nosso pedido #[NUMERO_PEDIDO] feito em [DATA_PEDIDO].

**Detalhes do pedido:**
- Valor: US$ [VALOR_PEDIDO]
- Quantidade: [QUANTIDADE] unidades
- Produtos: [LISTA_PRODUTOS]
- Prazo acordado: [PRAZO_ENTREGA]

**Solicitações:**
1. Status atual da produção
2. Data prevista para conclusão
3. Fotos do processo (se possível)
4. Confirmação da data de envio

Nossos clientes estão ansiosos pelos produtos e precisamos confirmar os prazos para nosso planejamento.

Por favor, mantenham-me atualizado sobre qualquer mudança nos prazos.

Obrigado(a) pela atenção,
[SEU_NOME]
Pedido: #[NUMERO_PEDIDO]`,
    category: "Fornecedores",
    purpose: "Acompanhar status de pedidos em produção",
    usageInstructions: "Envie semanalmente para pedidos em andamento. Mantenha tom profissional mas amigável.",
    variableTips: "[NUMERO_PEDIDO] - Número do seu pedido\n[DATA_PEDIDO] - Data que fez o pedido\n[PRAZO_ENTREGA] - Prazo combinado",
    status: "published",
    language: "pt-BR",
    tags: ["follow-up", "pedido", "status"]
  },
  {
    title: "Reclamação de Qualidade",
    content: `Prezado(a) [NOME_FORNECEDOR],

Recebemos o pedido #[NUMERO_PEDIDO] em [DATA_RECEBIMENTO], porém identificamos problemas de qualidade que precisam ser resolvidos:

**Problemas identificados:**
1. [PROBLEMA_1] - Quantidade afetada: [QTD_PROBLEMA_1] unidades
2. [PROBLEMA_2] - Quantidade afetada: [QTD_PROBLEMA_2] unidades
3. [PROBLEMA_3] - Quantidade afetada: [QTD_PROBLEMA_3] unidades

**Evidências:**
- Fotos em anexo
- Vídeos demonstrando os defeitos
- Relatório de qualidade

**Solução solicitada:**
- Reenvio das peças defeituosas
- Desconto de [PERCENTUAL_DESCONTO]% no próximo pedido
- Melhoria no controle de qualidade

Este problema afeta nossa relação com clientes finais e precisamos de uma solução rápida.

Como parceiros de longo prazo, confio que resolveremos isso da melhor forma.

Aguardo retorno urgente,
[SEU_NOME]
Pedido: #[NUMERO_PEDIDO]`,
    category: "Fornecedores",
    purpose: "Relatar problemas de qualidade e solicitar soluções",
    usageInstructions: "Use apenas quando houver problemas reais. Anexe evidências e seja específico.",
    variableTips: "[PROBLEMA_X] - Descreva o problema específico\n[QTD_PROBLEMA_X] - Quantas peças têm esse problema\n[PERCENTUAL_DESCONTO] - Desconto que considera justo",
    status: "published",
    language: "pt-BR",
    tags: ["qualidade", "reclamação", "solução"]
  },
  {
    title: "Solicitação de Certificações",
    content: `Olá [NOME_FORNECEDOR],

Para comercializarmos seus produtos no Brasil, precisamos das seguintes certificações e documentos:

**Certificações obrigatórias:**
- ANATEL (para produtos eletrônicos)
- INMETRO (conforme aplicável)
- CE (se for revenda)
- FCC (para eletrônicos)
- RoHS (produtos sem substâncias perigosas)

**Documentos necessários:**
- Certificado de origem
- Invoice comercial
- Packing list detalhado
- Manual em português (fornecemos tradução se necessário)

**Produtos específicos:**
[LISTA_PRODUTOS_CERTIFICAR]

**Prazos:**
Precisamos receber estes documentos até [DATA_LIMITE] para não atrasar nosso lançamento.

Vocês podem providenciar estas certificações? Há custos adicionais?

Por favor, confirmem a viabilidade e prazos.

Atenciosamente,
[SEU_NOME]`,
    category: "Fornecedores",
    purpose: "Solicitar certificações necessárias para importação",
    usageInstructions: "Use antes de finalizar grandes pedidos. Adapte certificações conforme o tipo de produto.",
    variableTips: "[LISTA_PRODUTOS_CERTIFICAR] - Liste os produtos que precisam de certificação\n[DATA_LIMITE] - Data que você precisa dos documentos",
    status: "published",
    language: "pt-BR",
    tags: ["certificações", "documentos", "importação"]
  },

  // Amazon Category
  {
    title: "Descrição de Produto Premium",
    content: `[NOME_PRODUTO] - [BENEFÍCIO_PRINCIPAL]

🔥 OFERTA LIMITADA - [DESCONTO]% OFF
⭐ Mais de [NÚMERO] clientes satisfeitos!

✅ PRINCIPAIS BENEFÍCIOS:
• [BENEFÍCIO_1] - [EXPLICAÇÃO_1]
• [BENEFÍCIO_2] - [EXPLICAÇÃO_2]  
• [BENEFÍCIO_3] - [EXPLICAÇÃO_3]
• [BENEFÍCIO_4] - [EXPLICAÇÃO_4]

🎯 IDEAL PARA:
- [PÚBLICO_1]
- [PÚBLICO_2]
- [PÚBLICO_3]

📦 O QUE VOCÊ RECEBE:
• 1x [PRODUTO_PRINCIPAL]
• 1x [ACESSÓRIO_1]
• 1x [ACESSÓRIO_2]
• Manual em português
• Garantia de [TEMPO_GARANTIA]

🚀 DIFERENCIAIS:
✓ [DIFERENCIAL_1]
✓ [DIFERENCIAL_2]
✓ [DIFERENCIAL_3]
✓ Entrega rápida Amazon Prime
✓ Suporte em português

⚠️ ATENÇÃO: Estoque limitado!
Apenas [QUANTIDADE_ESTOQUE] unidades disponíveis.

🛡️ GARANTIA TOTAL:
Se não ficar 100% satisfeito, devolvemos seu dinheiro em até 30 dias.

COMPRE AGORA e transforme [RESULTADO_ESPERADO]!

#[PALAVRA_CHAVE_1] #[PALAVRA_CHAVE_2] #[PALAVRA_CHAVE_3]`,
    category: "Amazon",
    purpose: "Criar descrições persuasivas que convertem visitantes em compradores",
    usageInstructions: "Adapte todos os campos entre colchetes. Use emojis moderadamente e foque nos benefícios.",
    variableTips: "[BENEFÍCIO_PRINCIPAL] - Principal vantagem do produto\n[NÚMERO] - Número de clientes (use real se tiver)\n[RESULTADO_ESPERADO] - O que o cliente vai conseguir",
    status: "published",
    language: "pt-BR",
    tags: ["descrição", "conversão", "vendas"]
  },
  {
    title: "Título de Produto Otimizado",
    content: `[PALAVRA_CHAVE_PRINCIPAL] [ESPECIFICAÇÃO_1] [ESPECIFICAÇÃO_2] - [BENEFÍCIO] para [PÚBLICO_ALVO] - [DIFERENCIAL] [COR/TAMANHO] [MARCA]`,
    category: "Amazon",
    purpose: "Criar títulos otimizados para SEO e conversão na Amazon",
    usageInstructions: "Mantenha máximo 200 caracteres. Coloque palavra-chave principal no início. Seja específico com especificações.",
    variableTips: "[PALAVRA_CHAVE_PRINCIPAL] - Principal termo que pessoas buscam\n[ESPECIFICAÇÃO_1/2] - Características técnicas importantes\n[PÚBLICO_ALVO] - Para quem é o produto",
    status: "published",
    language: "pt-BR",
    tags: ["título", "SEO", "otimização"]
  },
  {
    title: "Resposta a Avaliação Negativa",
    content: `Olá [NOME_CLIENTE],

Primeiramente, obrigado por dedicar seu tempo para nos avaliar. Seu feedback é muito importante para nós.

Lamentamos muito que sua experiência não tenha atendido às expectativas. Como uma empresa comprometida com a excelência, levamos todas as avaliações muito a sério.

**Nossa proposta:**
1. Entraremos em contato direto para entender melhor o problema
2. Oferecemos substituição do produto sem custo
3. Reembolso total se preferir
4. Melhorias em nossos processos baseadas em seu feedback

Já enviamos uma mensagem privada com os detalhes de como proceder.

Nossa missão é ter clientes 100% satisfeitos. Nos dê uma oportunidade de reverter esta situação.

**Contato direto:**
📧 [SEU_EMAIL]
📱 WhatsApp: [SEU_WHATSAPP]
🕐 Atendimento: Segunda a sexta, 8h às 18h

Aguardamos sua resposta.

Atenciosamente,
[SEU_NOME]
Equipe [SUA_MARCA]`,
    category: "Amazon",
    purpose: "Responder profissionalmente a avaliações negativas",
    usageInstructions: "Responda rapidamente. Seja empático e ofereça soluções concretas. Leve a conversa para privado.",
    variableTips: "[NOME_CLIENTE] - Nome que aparece na avaliação\n[SEU_EMAIL] - Seu email de atendimento\n[SUA_MARCA] - Nome da sua marca",
    status: "published",
    language: "pt-BR",
    tags: ["avaliação", "atendimento", "recuperação"]
  },
  {
    title: "Resposta a Avaliação Positiva",
    content: `🌟 Olá [NOME_CLIENTE]!

Muito obrigado pela avaliação incrível! ⭐⭐⭐⭐⭐

Ficamos muito felizes em saber que o [NOME_PRODUTO] atendeu (e superou!) suas expectativas. Comentários como o seu nos motivam a continuar oferecendo produtos de qualidade.

**Que tal conhecer outros produtos?**
- [PRODUTO_RELACIONADO_1]
- [PRODUTO_RELACIONADO_2]  
- [PRODUTO_RELACIONADO_3]

**Desconto especial para você:**
Use o cupom [CÓDIGO_DESCONTO] e ganhe [PERCENTUAL]% OFF na próxima compra! ⚡

**Indique para amigos:**
Compartilhe nossa loja e ambos ganham desconto especial!

Continuamos aqui para qualquer dúvida:
📧 [SEU_EMAIL]
📱 [SEU_WHATSAPP]

Obrigado por escolher a [SUA_MARCA]! 🚀

#ClienteSatisfeito #[SUA_MARCA] #QualidadeComprovada`,
    category: "Amazon",
    purpose: "Agradecer avaliações positivas e aproveitar para gerar mais vendas",
    usageInstructions: "Responda rapidamente. Aproveite para sugerir produtos relacionados e oferecer desconto.",
    variableTips: "[NOME_PRODUTO] - Nome do produto que o cliente comprou\n[PRODUTO_RELACIONADO_X] - Produtos similares que ele pode gostar\n[CÓDIGO_DESCONTO] - Cupom exclusivo",
    status: "published",
    language: "pt-BR",
    tags: ["avaliação", "fidelização", "upsell"]
  },
  {
    title: "Email de Follow-up Pós-Venda",
    content: `Assunto: Como está sua experiência com o [NOME_PRODUTO]? 🌟

Olá [NOME_CLIENTE]!

Espero que esteja aproveitando seu [NOME_PRODUTO]! 

Já faz [DIAS_DESDE_COMPRA] dias desde sua compra e queremos ter certeza de que você está 100% satisfeito(a).

**Como podemos ajudar?**
✅ Tem alguma dúvida sobre o uso?
✅ Precisa de dicas para aproveitar melhor?
✅ Quer sugestões de produtos complementares?

**Seu feedback é valioso:**
Se estiver satisfeito(a), que tal deixar uma avaliação na Amazon? Isso nos ajuda muito! ⭐

👉 [LINK_PRODUTO_AMAZON]

**Problemas? Resolveremos rapidamente:**
- Substituição grátis
- Reembolso total
- Suporte técnico especializado

**Oferta especial:**
Por ser um cliente especial, use o cupom [CÓDIGO_DESCONTO] e ganhe [PERCENTUAL]% OFF em sua próxima compra!

Qualquer coisa, estamos aqui:
📧 [SEU_EMAIL]
📱 [SEU_WHATSAPP]

Obrigado por confiar na [SUA_MARCA]!

[SEU_NOME]
Equipe de Atendimento`,
    category: "Amazon",
    purpose: "Manter relacionamento pós-venda e solicitar avaliações",
    usageInstructions: "Envie 3-7 dias após a entrega. Personalize com nome do cliente e produto específico.",
    variableTips: "[DIAS_DESDE_COMPRA] - Quantos dias desde que o cliente comprou\n[LINK_PRODUTO_AMAZON] - Link direto para avaliar na Amazon",
    status: "published",
    language: "pt-BR",
    tags: ["pós-venda", "relacionamento", "avaliação"]
  },
  {
    title: "Bullet Points Persuasivos",
    content: `🔥 [BENEFÍCIO_1]: [EXPLICAÇÃO_DETALHADA_1] - ideal para [SITUAÇÃO_USO_1]

⚡ [BENEFÍCIO_2]: [EXPLICAÇÃO_DETALHADA_2] que garante [RESULTADO_2] 

🎯 [BENEFÍCIO_3]: [EXPLICAÇÃO_DETALHADA_3] - economize [ECONOMIA/TEMPO]

🛡️ [BENEFÍCIO_4]: [EXPLICAÇÃO_DETALHADA_4] com garantia de [GARANTIA_ESPECÍFICA]

🚀 [BENEFÍCIO_5]: [EXPLICAÇÃO_DETALHADA_5] - aprovado por [AUTORIDADE/NÚMERO] clientes`,
    category: "Amazon",
    purpose: "Criar bullet points que destacam benefícios e convertem",
    usageInstructions: "Use um emoji por bullet point. Foque em benefícios, não características. Seja específico com números.",
    variableTips: "[BENEFÍCIO_X] - Vantagem que o cliente terá\n[EXPLICAÇÃO_DETALHADA_X] - Como isso funciona na prática\n[RESULTADO_X] - O que o cliente vai conseguir",
    status: "published",
    language: "pt-BR",
    tags: ["bullet-points", "benefícios", "conversão"]
  },

  // Ferramentas Category
  {
    title: "Análise de Produto para Importação",
    content: `# ANÁLISE DE VIABILIDADE: [NOME_PRODUTO]

## 📊 DADOS DO MERCADO
- **Demanda mensal**: [VOLUME_BUSCA] buscas
- **Concorrência**: [NÍVEL_CONCORRÊNCIA] 
- **Preço médio no Brasil**: R$ [PREÇO_BRASIL]
- **Preço de importação**: US$ [PREÇO_IMPORTAÇÃO]
- **Margem estimada**: [MARGEM]%

## 🎯 ANÁLISE SWOT
**Forças:**
- [FORÇA_1]
- [FORÇA_2]
- [FORÇA_3]

**Fraquezas:**
- [FRAQUEZA_1]
- [FRAQUEZA_2]

**Oportunidades:**
- [OPORTUNIDADE_1]
- [OPORTUNIDADE_2]

**Ameaças:**
- [AMEAÇA_1]
- [AMEAÇA_2]

## 💰 PROJEÇÃO FINANCEIRA
**Investimento inicial**: R$ [INVESTIMENTO_INICIAL]
- Produto: R$ [CUSTO_PRODUTO]
- Frete: R$ [CUSTO_FRETE]
- Impostos: R$ [CUSTO_IMPOSTOS]
- Marketing: R$ [CUSTO_MARKETING]

**Receita projetada (3 meses)**:
- Mês 1: R$ [RECEITA_MES1]
- Mês 2: R$ [RECEITA_MES2]
- Mês 3: R$ [RECEITA_MES3]

**ROI estimado**: [ROI]% em [TEMPO_ROI] meses

## ✅ DECISÃO
[DECISÃO_FINAL] baseada na análise acima.

**Próximos passos:**
1. [PRÓXIMO_PASSO_1]
2. [PRÓXIMO_PASSO_2]
3. [PRÓXIMO_PASSO_3]`,
    category: "Ferramentas",
    purpose: "Estrutura para análise completa de viabilidade de produtos",
    usageInstructions: "Use para avaliar cada produto antes de importar. Preencha com dados reais de pesquisa.",
    variableTips: "[VOLUME_BUSCA] - Pesquise no Google Trends ou Keyword Planner\n[NÍVEL_CONCORRÊNCIA] - Alto/Médio/Baixo\n[MARGEM] - (Preço venda - custos) / Preço venda * 100",
    status: "published",
    language: "pt-BR",
    tags: ["análise", "viabilidade", "importação"]
  },
  {
    title: "Planilha de Controle de Estoque",
    content: `# CONTROLE DE ESTOQUE - [MÊS/ANO]

## 📦 PRODUTOS EM ESTOQUE

| Produto | SKU | Estoque Atual | Estoque Mín | Status | Última Entrada | Próximo Pedido |
|---------|-----|---------------|-------------|--------|----------------|----------------|
| [PRODUTO_1] | [SKU_1] | [QTD_1] | [MIN_1] | [STATUS_1] | [DATA_1] | [PREVISÃO_1] |
| [PRODUTO_2] | [SKU_2] | [QTD_2] | [MIN_2] | [STATUS_2] | [DATA_2] | [PREVISÃO_2] |
| [PRODUTO_3] | [SKU_3] | [QTD_3] | [MIN_3] | [STATUS_3] | [DATA_3] | [PREVISÃO_3] |

## 🚨 ALERTAS
**Estoque baixo (< estoque mínimo):**
- [PRODUTO_BAIXO_1]: [QTD_ATUAL_1] unidades
- [PRODUTO_BAIXO_2]: [QTD_ATUAL_2] unidades

**Produtos parados (> 90 dias sem venda):**
- [PRODUTO_PARADO_1]: [DIAS_PARADO_1] dias
- [PRODUTO_PARADO_2]: [DIAS_PARADO_2] dias

## 📈 MOVIMENTO DO MÊS
**Entradas:**
- [ENTRADA_1]: +[QTD_ENTRADA_1] em [DATA_ENTRADA_1]
- [ENTRADA_2]: +[QTD_ENTRADA_2] em [DATA_ENTRADA_2]

**Saídas:**
- [SAÍDA_1]: -[QTD_SAÍDA_1] em [DATA_SAÍDA_1]  
- [SAÍDA_2]: -[QTD_SAÍDA_2] em [DATA_SAÍDA_2]

## 🎯 AÇÕES NECESSÁRIAS
1. **Pedidos urgentes**: [LISTA_PEDIDOS_URGENTES]
2. **Liquidação**: [LISTA_PRODUTOS_LIQUIDAR]
3. **Reposição normal**: [LISTA_REPOSIÇÃO]

**Valor total em estoque**: R$ [VALOR_TOTAL_ESTOQUE]
**Giro estimado**: [GIRO_DIAS] dias`,
    category: "Ferramentas",
    purpose: "Controlar estoque e planejar reposições",
    usageInstructions: "Atualize semanalmente. Use códigos de cores: Verde (OK), Amarelo (Atenção), Vermelho (Crítico).",
    variableTips: "[QTD_X] - Quantidade em estoque\n[MIN_X] - Estoque mínimo antes de repor\n[STATUS_X] - OK/Atenção/Crítico",
    status: "published",
    language: "pt-BR",
    tags: ["estoque", "controle", "reposição"]
  },
  {
    title: "Cálculo de Preço de Venda",
    content: `# CALCULADORA DE PREÇO - [NOME_PRODUTO]

## 💰 CUSTOS DIRETOS
**Produto:**
- Preço FOB: US$ [PREÇO_FOB]
- Taxa do dólar: R$ [COTAÇÃO_DOLAR]
- Custo em R$: R$ [CUSTO_PRODUTO_BRL]

**Frete internacional:**
- Valor: US$ [FRETE_INTERNACIONAL]
- Em R$: R$ [FRETE_BRL]

**Impostos:**
- Imposto de importação ([ALIQUOTA_II]%): R$ [VALOR_II]
- IPI ([ALIQUOTA_IPI]%): R$ [VALOR_IPI]
- ICMS ([ALIQUOTA_ICMS]%): R$ [VALOR_ICMS]
- PIS/COFINS ([ALIQUOTA_PIS_COFINS]%): R$ [VALOR_PIS_COFINS]
- **Total impostos**: R$ [TOTAL_IMPOSTOS]

**Outros custos:**
- Despachante: R$ [CUSTO_DESPACHANTE]
- Armazenagem: R$ [CUSTO_ARMAZENAGEM]
- Frete nacional: R$ [FRETE_NACIONAL]

## 📊 RESUMO DE CUSTOS
- **Custo do produto**: R$ [CUSTO_TOTAL_PRODUTO]
- **Custo total unitário**: R$ [CUSTO_UNITÁRIO]

## 🎯 DEFINIÇÃO DE PREÇO
**Estratégias:**
1. **Markup padrão** ([MARKUP]%): R$ [PREÇO_MARKUP]
2. **Concorrência** (preço médio): R$ [PREÇO_CONCORRÊNCIA]
3. **Valor percebido**: R$ [PREÇO_VALOR]

**Preço escolhido**: R$ [PREÇO_FINAL]

## 📈 ANÁLISE DE MARGEM
- **Margem bruta**: R$ [MARGEM_BRUTA] ([PERCENTUAL_MARGEM]%)
- **Ponto de equilíbrio**: [QTD_EQUILIBRIO] unidades
- **ROI estimado**: [ROI_ESTIMADO]%

## 🏷️ PRECIFICAÇÃO SUGERIDA
- **Preço à vista**: R$ [PREÇO_VISTA]
- **Preço parcelado**: R$ [PREÇO_PARCELADO] (cartão)
- **Preço atacado** (>10 un): R$ [PREÇO_ATACADO]

**Observações**: [OBSERVAÇÕES_PREÇO]`,
    category: "Ferramentas",
    purpose: "Calcular preço de venda considerando todos os custos",
    usageInstructions: "Use para cada produto novo. Atualize quando dólar ou custos mudarem. Considere estratégia de mercado.",
    variableTips: "[PREÇO_FOB] - Preço que o fornecedor cobra\n[COTAÇÃO_DOLAR] - Dólar comercial do dia\n[ALIQUOTA_X] - Percentual do imposto",
    status: "published",
    language: "pt-BR",
    tags: ["preço", "cálculo", "margem"]
  },
  {
    title: "Checklist de Importação",
    content: `# CHECKLIST DE IMPORTAÇÃO - PEDIDO #[NÚMERO_PEDIDO]

## 📋 PRÉ-PEDIDO
- [ ] Pesquisa de mercado realizada
- [ ] Fornecedor validado e confiável
- [ ] Preços negociados
- [ ] Amostras aprovadas
- [ ] NCM definida ([CÓDIGO_NCM])
- [ ] Simulação de impostos feita
- [ ] Viabilidade financeira confirmada

## 🤝 FECHAMENTO DO PEDIDO
- [ ] Contrato ou PI assinado
- [ ] Forma de pagamento definida
- [ ] Prazos de produção confirmados
- [ ] Especificações técnicas detalhadas
- [ ] Embalagem especificada
- [ ] Certificações solicitadas

## 💳 PAGAMENTO
- [ ] TT (transferência) enviada
- [ ] Comprovante de pagamento enviado
- [ ] Pagamento confirmado pelo fornecedor
- [ ] Data de início da produção confirmada

## 🏭 PRODUÇÃO
- [ ] Acompanhamento semanal do status
- [ ] Fotos da produção recebidas
- [ ] Controle de qualidade realizado
- [ ] Data de conclusão confirmada
- [ ] Packing list recebido

## 🚢 EMBARQUE
- [ ] Invoice comercial recebida
- [ ] Bill of Lading (BL) recebido
- [ ] Certificado de origem recebido
- [ ] Documentos enviados ao despachante
- [ ] Tracking do navio/avião obtido

## 🛃 DESEMBARAÇO
- [ ] Chegada da mercadoria notificada
- [ ] LI (Licença de Importação) liberada
- [ ] Impostos calculados e pagos
- [ ] Inspeção física realizada (se aplicável)
- [ ] Mercadoria liberada pela Receita

## 🚚 ENTREGA
- [ ] Retirada na Receita Federal
- [ ] Transporte contratado
- [ ] Mercadoria recebida no estoque
- [ ] Conferência de quantidade realizada
- [ ] Controle de qualidade final
- [ ] Entrada no sistema de estoque

## 📊 PÓS-IMPORTAÇÃO
- [ ] Custos reais calculados
- [ ] Preço de venda definido
- [ ] Produto cadastrado para venda
- [ ] Fornecedor avaliado
- [ ] Lições aprendidas documentadas

**Observações importantes:**
[OBSERVAÇÕES_ESPECÍFICAS]

**Responsável**: [NOME_RESPONSÁVEL]
**Data início**: [DATA_INÍCIO]
**Previsão de conclusão**: [DATA_PREVISÃO]`,
    category: "Ferramentas",
    purpose: "Garantir que todos os passos da importação sejam seguidos",
    usageInstructions: "Use para cada novo pedido de importação. Marque itens conforme completados. Mantenha atualizado.",
    variableTips: "[NÚMERO_PEDIDO] - Número interno do seu pedido\n[CÓDIGO_NCM] - Classificação fiscal do produto\n[OBSERVAÇÕES_ESPECÍFICAS] - Detalhes únicos deste pedido",
    status: "published",
    language: "pt-BR",
    tags: ["checklist", "importação", "processo"]
  },
  {
    title: "Relatório de Performance Mensal",
    content: `# RELATÓRIO DE PERFORMANCE - [MÊS/ANO]

## 📊 RESUMO EXECUTIVO
**Faturamento**: R$ [FATURAMENTO_TOTAL] ([VARIAÇÃO_FATURAMENTO]% vs mês anterior)
**Lucro líquido**: R$ [LUCRO_LIQUIDO] ([MARGEM_LIQUIDA]%)
**Produtos vendidos**: [TOTAL_PRODUTOS] unidades
**Ticket médio**: R$ [TICKET_MÉDIO]

## 🏆 TOP PERFORMERS
### Produtos mais vendidos:
1. [PRODUTO_TOP_1]: [QTD_TOP_1] unidades - R$ [RECEITA_TOP_1]
2. [PRODUTO_TOP_2]: [QTD_TOP_2] unidades - R$ [RECEITA_TOP_2]
3. [PRODUTO_TOP_3]: [QTD_TOP_3] unidades - R$ [RECEITA_TOP_3]

### Produtos mais lucrativos:
1. [PRODUTO_LUCRATIVO_1]: [MARGEM_1]% - R$ [LUCRO_1]
2. [PRODUTO_LUCRATIVO_2]: [MARGEM_2]% - R$ [LUCRO_2]
3. [PRODUTO_LUCRATIVO_3]: [MARGEM_3]% - R$ [LUCRO_3]

## 📈 CANAIS DE VENDA
- **Amazon**: R$ [RECEITA_AMAZON] ([PERCENTUAL_AMAZON]%)
- **Mercado Livre**: R$ [RECEITA_ML] ([PERCENTUAL_ML]%)
- **Loja própria**: R$ [RECEITA_LOJA] ([PERCENTUAL_LOJA]%)
- **Outros**: R$ [RECEITA_OUTROS] ([PERCENTUAL_OUTROS]%)

## 💰 ANÁLISE FINANCEIRA
**Custos principais:**
- Produtos: R$ [CUSTO_PRODUTOS] ([PERCENTUAL_CUSTO_PRODUTOS]%)
- Marketing: R$ [CUSTO_MARKETING] ([PERCENTUAL_MARKETING]%)
- Logística: R$ [CUSTO_LOGÍSTICA] ([PERCENTUAL_LOGÍSTICA]%)
- Operacional: R$ [CUSTO_OPERACIONAL] ([PERCENTUAL_OPERACIONAL]%)

**Indicadores:**
- ROAS (Return on Ad Spend): [ROAS]x
- CAC (Custo de Aquisição): R$ [CAC]
- LTV (Lifetime Value): R$ [LTV]
- Margem bruta média: [MARGEM_BRUTA]%

## 🎯 METAS vs REALIZADO
| Indicador | Meta | Realizado | % Atingimento |
|-----------|------|-----------|---------------|
| Faturamento | R$ [META_FATURAMENTO] | R$ [REALIZADO_FATURAMENTO] | [PERCENTUAL_FATURAMENTO]% |
| Unidades vendidas | [META_UNIDADES] | [REALIZADO_UNIDADES] | [PERCENTUAL_UNIDADES]% |
| Novos clientes | [META_CLIENTES] | [REALIZADO_CLIENTES] | [PERCENTUAL_CLIENTES]% |

## ⚠️ ALERTAS E OPORTUNIDADES
**Problemas identificados:**
- [PROBLEMA_1]
- [PROBLEMA_2]
- [PROBLEMA_3]

**Oportunidades:**
- [OPORTUNIDADE_1]
- [OPORTUNIDADE_2]
- [OPORTUNIDADE_3]

## 🚀 AÇÕES PARA PRÓXIMO MÊS
1. **Prioritário**: [AÇÃO_PRIORITÁRIA]
2. **Crescimento**: [AÇÃO_CRESCIMENTO]
3. **Otimização**: [AÇÃO_OTIMIZAÇÃO]
4. **Novos produtos**: [AÇÃO_PRODUTOS]

**Previsão para [PRÓXIMO_MÊS]:**
- Faturamento: R$ [PREVISÃO_FATURAMENTO]
- Novos produtos: [QTD_NOVOS_PRODUTOS]
- Investimento em marketing: R$ [INVESTIMENTO_MARKETING]`,
    category: "Ferramentas",
    purpose: "Analisar performance e planejar próximos passos",
    usageInstructions: "Compile dados mensalmente. Use para reuniões e tomada de decisão estratégica.",
    variableTips: "[VARIAÇÃO_FATURAMENTO] - Percentual de crescimento vs mês anterior\n[ROAS] - Receita dividida por investimento em ads\n[CAC] - Custo total de marketing dividido por novos clientes",
    status: "published",
    language: "pt-BR",
    tags: ["relatório", "performance", "análise"]
  },
  {
    title: "Pesquisa de Tendências de Mercado",
    content: `# PESQUISA DE TENDÊNCIAS - [CATEGORIA/NICHO]

## 🔍 METODOLOGIA
**Período analisado**: [DATA_INÍCIO] a [DATA_FIM]
**Fontes consultadas**:
- Google Trends
- Amazon Best Sellers
- Mercado Livre
- Redes sociais ([REDES_ANALISADAS])
- Relatórios setoriais

## 📊 TENDÊNCIAS IDENTIFICADAS

### 🔥 Trending (crescimento > 50%)
1. **[TENDÊNCIA_1]**
   - Crescimento: [CRESCIMENTO_1]%
   - Volume de busca: [VOLUME_BUSCA_1]
   - Principais players: [PLAYERS_1]
   - Oportunidade: [OPORTUNIDADE_1]

2. **[TENDÊNCIA_2]**
   - Crescimento: [CRESCIMENTO_2]%
   - Volume de busca: [VOLUME_BUSCA_2]
   - Principais players: [PLAYERS_2]
   - Oportunidade: [OPORTUNIDADE_2]

### 📈 Em crescimento (crescimento 10-50%)
- [CRESCIMENTO_MODERADO_1]: [DETALHES_1]
- [CRESCIMENTO_MODERADO_2]: [DETALHES_2]
- [CRESCIMENTO_MODERADO_3]: [DETALHES_3]

### 📉 Em declínio
- [DECLÍNIO_1]: [MOTIVO_DECLÍNIO_1]
- [DECLÍNIO_2]: [MOTIVO_DECLÍNIO_2]

## 🎯 ANÁLISE POR FAIXA ETÁRIA
**18-25 anos**: [TENDÊNCIAS_JOVENS]
**26-35 anos**: [TENDÊNCIAS_ADULTOS_JOVENS]
**36-50 anos**: [TENDÊNCIAS_ADULTOS]
**50+ anos**: [TENDÊNCIAS_MADUROS]

## 💡 INSIGHTS PRINCIPAIS
1. **[INSIGHT_1]**: [EXPLICAÇÃO_1]
2. **[INSIGHT_2]**: [EXPLICAÇÃO_2]
3. **[INSIGHT_3]**: [EXPLICAÇÃO_3]

## 🚀 PRODUTOS RECOMENDADOS
### Importação imediata (alta demanda):
1. **[PRODUTO_RECOMENDADO_1]**
   - Demanda: [NÍVEL_DEMANDA_1]
   - Competição: [NÍVEL_COMPETIÇÃO_1]
   - Margem estimada: [MARGEM_ESTIMADA_1]%
   - Investimento: R$ [INVESTIMENTO_1]

2. **[PRODUTO_RECOMENDADO_2]**
   - Demanda: [NÍVEL_DEMANDA_2]
   - Competição: [NÍVEL_COMPETIÇÃO_2]
   - Margem estimada: [MARGEM_ESTIMADA_2]%
   - Investimento: R$ [INVESTIMENTO_2]

### Para monitorar:
- [PRODUTO_MONITORAR_1]
- [PRODUTO_MONITORAR_2]
- [PRODUTO_MONITORAR_3]

## 📅 SAZONALIDADE
**Próximos 3 meses**:
- [MÊS_1]: [PREVISÃO_MÊS_1]
- [MÊS_2]: [PREVISÃO_MÊS_2]  
- [MÊS_3]: [PREVISÃO_MÊS_3]

**Datas importantes**:
- [DATA_IMPORTANTE_1]: [EVENTO_1]
- [DATA_IMPORTANTE_2]: [EVENTO_2]

## 🎯 RECOMENDAÇÕES ESTRATÉGICAS
1. **Curto prazo** (1-3 meses): [ESTRATÉGIA_CURTO]
2. **Médio prazo** (3-6 meses): [ESTRATÉGIA_MÉDIO]
3. **Longo prazo** (6-12 meses): [ESTRATÉGIA_LONGO]

**Próxima revisão**: [DATA_PRÓXIMA_REVISÃO]`,
    category: "Ferramentas",
    purpose: "Identificar oportunidades baseadas em tendências de mercado",
    usageInstructions: "Faça mensalmente ou antes de grandes investimentos. Use dados reais de ferramentas de pesquisa.",
    variableTips: "[CRESCIMENTO_X] - Percentual de crescimento da tendência\n[VOLUME_BUSCA_X] - Número de buscas mensais\n[NÍVEL_DEMANDA_X] - Alto/Médio/Baixo",
    status: "published",
    language: "pt-BR",
    tags: ["tendências", "mercado", "oportunidades"]
  }
];

export async function seedTemplates() {
  try {
    console.log("🌱 Inserindo templates de exemplo...");
    
    for (const template of exampleTemplates) {
      await db.insert(templates).values({
        ...template,
        copyCount: Math.floor(Math.random() * 100), // Número aleatório de cópias
        tags: template.tags || []
      });
    }
    
    console.log(`✅ ${exampleTemplates.length} templates inseridos com sucesso!`);
  } catch (error) {
    console.error("❌ Erro ao inserir templates:", error);
  }
}