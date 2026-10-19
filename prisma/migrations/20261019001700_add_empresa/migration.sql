-- Criar tabela Empresa
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- Adicionar coluna empresaId como nullable temporariamente
ALTER TABLE "User" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "Fornecedor" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "Produto" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "Venda" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "ContaReceber" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "PagamentoReceber" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "ContaPagar" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "MovimentacaoEstoque" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "MovimentacaoCaixa" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "Configuracao" ADD COLUMN "empresaId" TEXT;

-- Adicionar FK para User
ALTER TABLE "User" ADD CONSTRAINT "User_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Adicionar FK para outros modelos
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PagamentoReceber" ADD CONSTRAINT "PagamentoReceber_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovimentacaoCaixa" ADD CONSTRAINT "MovimentacaoCaixa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Configuracao" ADD CONSTRAINT "Configuracao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Criar índices
CREATE UNIQUE INDEX "Configuracao_empresaId_key" ON "Configuracao"("empresaId");
