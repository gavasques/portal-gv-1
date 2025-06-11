# Portal do Aluno - Plataforma de Educação para Vendedores Amazon Brasil

![CI](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/workflows/CI/badge.svg)

Uma plataforma educacional moderna e abrangente para vendedores Amazon no Brasil, oferecendo formação especializada em importação, criação de marcas e otimização de performance no marketplace.

## 🎯 Visão Geral

O Portal do Aluno é uma solução completa que integra:

- **Gestão de Materiais Educacionais**: Biblioteca organizada com vídeos, documentos, planilhas e conteúdo interativo
- **Sistema de Parceiros**: Diretório qualificado de fornecedores, prestadores de serviços e especialistas
- **Templates e Ferramentas AI**: Prompts otimizados para criação de listings, análise de mercado e comunicação
- **Área Administrativa**: Controle granular de usuários, permissões e conteúdo
- **Sistema de Tickets**: Suporte integrado com categorização e acompanhamento
- **Dashboard Analytics**: Métricas de uso, progresso e performance dos alunos

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização responsiva
- **Shadcn/UI** para componentes consistentes
- **Vite** para build e desenvolvimento
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento

### Backend
- **Node.js 20** com Express
- **PostgreSQL** com Drizzle ORM
- **Passport.js** para autenticação (Google OAuth + Local)
- **Express Session** para gerenciamento de sessões
- **Stripe** para pagamentos e assinaturas

## 📋 Requisitos

- **Node.js 20.x** ou superior
- **PostgreSQL 13** ou superior
- **npm** ou **yarn**

## ⚙️ Configuração

### 1. Clone e instale dependências

```bash
git clone <repository-url>
cd portal-do-aluno
npm install
```

### 2. Configure variáveis de ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env
```

### Variáveis Obrigatórias

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portal_db

# Session
SESSION_SECRET=your-session-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email (Opcional - para notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# YouTube API (Para sincronização de vídeos)
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id

# Ambiente
NODE_ENV=development
PORT=5000
```

### 3. Configure o banco de dados

```bash
# Execute as migrações
npx drizzle-kit push

# Seed inicial (opcional)
npm run seed
```

### 4. Execute em desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

## 🧪 Testes e CI/CD

### Executar Testes

```bash
# Executar todos os testes
npx vitest run

# Executar testes em modo watch
npx vitest watch

# Executar teste específico
npx vitest run tests/health.test.ts

# Executar com coverage
npx vitest run --coverage
```

### Pipeline CI/CD

O projeto inclui pipeline automatizado no GitHub Actions:

- **Trigger**: Push para branch `main` ou Pull Requests
- **Passos**:
  1. Checkout do código
  2. Setup Node.js 20
  3. Instalação de dependências (`npm ci`)
  4. Execução dos testes (`vitest run`)
  5. Build do projeto (`npm run build`)
  6. Geração de coverage (opcional)

O badge CI no topo do README mostra o status atual dos testes.

## 🏗️ Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── lib/            # Utilitários e configurações
│   │   └── hooks/          # Custom hooks
├── server/                 # Backend Express
│   ├── routes.ts           # Rotas da API
│   ├── storage.ts          # Camada de dados
│   └── db.ts              # Configuração do banco
├── shared/                 # Código compartilhado
│   └── schema.ts          # Schema do banco de dados
└── README.md
```

## 🔐 Sistema de Permissões

O portal implementa um sistema granular de permissões baseado em grupos:

- **Administrador**: Acesso total ao sistema
- **Moderador**: Gestão de conteúdo e usuários
- **Professor**: Criação e edição de materiais
- **Aluno Premium**: Acesso a conteúdo exclusivo
- **Aluno Basic**: Acesso ao conteúdo básico

## 📦 Deploy no Replit

### Passo a Passo

1. **Fork o projeto no Replit**
   - Conecte sua conta GitHub
   - Importe o repositório

2. **Configure o banco de dados**
   ```bash
   # No shell do Replit
   createdb portal_aluno
   ```

3. **Configure as variáveis de ambiente**
   - Acesse "Secrets" no painel lateral
   - Adicione todas as variáveis obrigatórias listadas acima
   - **DATABASE_URL** será fornecida automaticamente pelo Replit

4. **Execute a aplicação**
   ```bash
   npm install
   npm run dev
   ```

5. **Configure domínio customizado (opcional)**
   - Acesse as configurações do projeto
   - Configure seu domínio personalizado
   - Atualize as URLs de callback do Google OAuth

### Configuração Específica do Replit

```env
# Adicione estas variáveis específicas
REPLIT_URL=https://your-repl-name.your-username.repl.co
GOOGLE_CALLBACK_URL=${REPLIT_URL}/api/auth/google/callback
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run preview      # Preview do build

# Database
npm run db:push      # Aplica mudanças no schema
npm run db:studio    # Interface visual do banco
npm run db:seed      # Popula dados iniciais

# Qualidade
npm run lint         # Verifica código
npm run type-check   # Verifica tipos TypeScript
```

## 📊 Funcionalidades Principais

### Para Alunos
- Dashboard personalizado com progresso
- Biblioteca de materiais organizados por categoria
- Diretório de parceiros verificados
- Templates de IA para automação
- Sistema de tickets para suporte
- Perfil e configurações pessoais

### Para Administradores
- Painel de controle completo
- Gestão de usuários e permissões
- Upload e organização de conteúdo
- Aprovação de parceiros
- Analytics e relatórios
- Sistema de notificações

### Integrações
- **Google OAuth** para login simplificado
- **YouTube API** para sincronização automática de vídeos
- **Stripe** para pagamentos e assinaturas
- **Email** para notificações automáticas

## 🔧 Personalização

### Temas e Branding
- Edite `client/src/index.css` para cores personalizadas
- Configure logos em `client/src/components/layout/`
- Personalize emails em `server/templates/`

### Novos Módulos
1. Adicione schema em `shared/schema.ts`
2. Implemente storage em `server/storage.ts`
3. Crie rotas em `server/routes.ts`
4. Desenvolva frontend em `client/src/pages/`

## 📞 Suporte

Para suporte técnico:
- Abra um ticket no sistema interno
- Consulte a documentação da API
- Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto é propriedade privada e está protegido por direitos autorais.

---

**Versão**: 2.0.0
**Última atualização**: Junho 2025