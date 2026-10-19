import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Criar empresa para o admin se não existir
  const existingEmpresa = await prisma.empresa.findFirst({
    where: { nome: "Rafael Gestão" }
  });

  let empresa;
  if (existingEmpresa) {
    empresa = existingEmpresa;
  } else {
    empresa = await prisma.empresa.create({
      data: {
        nome: "Rafael Gestão"
      }
    });
  }

  // Atualizar Configuracao para ter empresaId
  await prisma.configuracao.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  // Atualizar User admin para ter empresaId
  await prisma.user.updateMany({
    where: { role: "admin", empresaId: null },
    data: { empresaId: empresa.id }
  });

  // Migrar dados existentes de userId para empresaId
  await prisma.cliente.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.fornecedor.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.produto.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.venda.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.contaReceber.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.pagamentoReceber.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.contaPagar.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.movimentacaoEstoque.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });

  await prisma.movimentacaoCaixa.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresa.id }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
