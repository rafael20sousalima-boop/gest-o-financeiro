-- Este script deve ser executado após a migration para migrar os dados existentes

-- Criar empresa para o admin
INSERT INTO "Empresa" (id, nome, criadoEm, atualizadoEm)
VALUES ('admin-company', 'Rafael Gestão', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Atualizar Configuracao para ter empresaId
UPDATE "Configuracao" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;

-- Atualizar User admin para ter empresaId
UPDATE "User" SET "empresaId" = 'admin-company' WHERE "role" = 'admin' AND "empresaId" IS NULL;

-- Migrar dados existentes de userId para empresaId
UPDATE "Cliente" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "Fornecedor" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "Produto" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "Venda" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "ContaReceber" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "PagamentoReceber" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "ContaPagar" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "MovimentacaoEstoque" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;
UPDATE "MovimentacaoCaixa" SET "empresaId" = 'admin-company' WHERE "empresaId" IS NULL;

-- Agora tornar empresaId NOT NULL após a migração
-- Isso precisará ser feito manualmente ou em uma migration separada
