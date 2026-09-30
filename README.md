# Gestão Financeira

Sistema web de gestão financeira para pequena empresa/comércio.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite (dados persistentes locais)
- Tailwind CSS + Recharts

## Como rodar

```bash
npm install
npx prisma migrate dev
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Módulos

- Dashboard com indicadores, gráficos e filtros de período
- Vendas (à vista e fiado) com cálculo automático
- Contas a Receber com pagamentos parciais
- Clientes com histórico e botão de pagamento
- Contas a Pagar com atraso automático
- Fornecedores
- Fluxo de Caixa
- Estoque com baixa automática na venda

Os dados ficam em `prisma/dev.db`. Não há dependência de dados de exemplo.
