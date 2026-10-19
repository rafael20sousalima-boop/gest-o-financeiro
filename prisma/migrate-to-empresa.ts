import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Criar empresa para o admin existente
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin" }
  });

  if (!adminUser) {
    const empresa = await prisma.empresa.create({
      data: {
        nome: "Minha Empresa"
      }
    });

    await prisma.configuracao.create({
      data: {
        nomeEmpresa: "Minha Empresa",
        saldoInicial: 0,
        empresaId: empresa.id
      }
    });

    return;
  }

  // Verificar se o admin já tem empresa
  if (adminUser.empresaId) {
    return;
  }

  const empresa = await prisma.empresa.create({
    data: {
      nome: "Rafael Gestão"
    }
  });

  // Atualizar configuração existente
  const configExistente = await prisma.configuracao.findFirst();
  if (configExistente) {
    await prisma.configuracao.update({
      where: { id: configExistente.id },
      data: {
        empresaId: empresa.id,
        nomeEmpresa: "Rafael Gestão"
      }
    });
  } else {
    await prisma.configuracao.create({
      data: {
        nomeEmpresa: "Rafael Gestão",
        saldoInicial: 0,
        empresaId: empresa.id
      }
    });
  }

  // Atualizar usuário admin com empresaId
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar todos os dados existentes para a empresa do admin
  await prisma.cliente.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.fornecedor.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.produto.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.venda.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.contaReceber.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.pagamentoReceber.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.contaPagar.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.movimentacaoEstoque.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  await prisma.movimentacaoCaixa.updateMany({
    where: { userId: adminUser.id },
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
