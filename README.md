# Gestão Financeira

Sistema web de gestão financeira para pequena empresa/comércio.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS + Recharts

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL (local ou remoto)

### Configuração

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd gestao-financeira
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` e configure o `DATABASE_URL` com sua conexão PostgreSQL.

4. Rode as migrations:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

### 1. Preparar o projeto

Certifique-se de que o projeto está no GitHub e que o `.env` não foi commitado (ele está no .gitignore).

### 2. Configurar banco de dados na Vercel

**Opção A: Vercel Postgres (Recomendado)**
1. No dashboard da Vercel, vá em Storage → Create Database → Postgres
2. Siga as instruções para criar o banco
3. O Vercel configurará automaticamente a variável `DATABASE_URL`

**Opção B: PostgreSQL externo**
1. Crie um banco PostgreSQL em outro provedor (Supabase, Neon, Railway, etc.)
2. Obtenha a string de conexão
3. No projeto Vercel, vá em Settings → Environment Variables
4. Adicione a variável `DATABASE_URL` com sua string de conexão

### 3. Deploy

1. Conecte seu repositório GitHub à Vercel
2. Importe o projeto
3. **IMPORTANTE:** Configure a variável de ambiente `DATABASE_URL`:
   - Vá em Settings → Environment Variables
   - Adicione: `DATABASE_URL` = sua connection string do Supabase
   - Marque: Production, Preview, Development
   - Exemplo: `postgresql://postgres:senha@db.PROJECT_REF.supabase.co:5432/postgres`
4. Clique em Deploy

### 4. Rodar migrations em produção

Após o primeiro deploy, você precisará rodar as migrations no banco de produção:

**Via Vercel CLI:**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Ou configure no painel da Vercel:**
- Vá em Settings → Git → Build & Development Settings
- Build Command: `npx prisma generate && npx prisma migrate deploy && next build`
- Isso fará as migrations rodarem automaticamente em cada deploy

### 4. Rodar migrations no ambiente de produção

Após o deploy, você precisará rodar as migrations no banco de produção:

```bash
# Se estiver usando Vercel Postgres, use o CLI:
vercel env pull .env.local
npx prisma migrate deploy
```

Ou você pode configurar o Vercel para rodar migrations automaticamente em cada deploy adicionando um script no `package.json` e configurando no dashboard.

## Módulos

- Dashboard com indicadores, gráficos e filtros de período
- Vendas (à vista e fiado) com cálculo automático
- Contas a Receber com pagamentos parciais
- Clientes com histórico e botão de pagamento
- Contas a Pagar com atraso automático
- Fornecedores
- Fluxo de Caixa
- Estoque com baixa automática na venda

## Scripts disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm start            # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run db:migrate   # Cria e roda migrations (desenvolvimento)
npm run db:push      # Push do schema para o banco (desenvolvimento)
```
