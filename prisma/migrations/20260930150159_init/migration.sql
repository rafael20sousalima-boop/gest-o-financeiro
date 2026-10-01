-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "observacao" TEXT,
    "limiteCredito" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "endereco" TEXT,
    "produtoFornecido" TEXT,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'unidade',
    "quantidade" REAL NOT NULL DEFAULT 0,
    "estoqueMinimo" REAL NOT NULL DEFAULT 0,
    "custo" REAL NOT NULL DEFAULT 0,
    "precoVenda" REAL NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataVenda" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT,
    "produtoId" TEXT,
    "produtoNome" TEXT NOT NULL,
    "quantidade" REAL NOT NULL DEFAULT 1,
    "unidade" TEXT NOT NULL DEFAULT 'unidade',
    "pesoKg" REAL,
    "precoPorKg" REAL,
    "valorUnitario" REAL NOT NULL DEFAULT 0,
    "valorTotal" REAL NOT NULL,
    "tipoPagamento" TEXT NOT NULL,
    "statusPagamento" TEXT NOT NULL DEFAULT 'pago',
    "dataVencimento" DATETIME,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "vendaId" TEXT,
    "dataVenda" DATETIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorOriginal" REAL NOT NULL,
    "valorRecebido" REAL NOT NULL DEFAULT 0,
    "saldoRestante" REAL NOT NULL,
    "dataVencimento" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'aguardando_pagamento',
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContaReceber_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PagamentoReceber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "clienteId" TEXT,
    "valor" REAL NOT NULL,
    "dataPagamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PagamentoReceber_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaReceber" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PagamentoReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "dataVencimento" DATETIME NOT NULL,
    "valor" REAL NOT NULL,
    "dataPagamento" DATETIME,
    "formaPagamento" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ContaPagar_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "vendaId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimentacaoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimentacaoEstoque_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimentacaoCaixa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    "nomeEmpresa" TEXT NOT NULL DEFAULT 'Minha Empresa',
    "saldoInicial" REAL NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "ContaReceber_vendaId_key" ON "ContaReceber"("vendaId");
