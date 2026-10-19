import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migração para modelo de empresas...");

  // Criar empresa para o admin existente
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin" }
  });

  if (!adminUser) {
    console.log("Nenhum usuário admin encontrado. Criando empresa padrão...");
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

    console.log("Empresa padrão criada com ID:", empresa.id);
    return;
  }

  // Verificar se o admin já tem empresa
  if (adminUser.empresaId) {
    console.log("Usuário admin já tem empresa. Pulando migração.");
    return;
  }

  console.log("Criando empresa 'Rafael Gestão' para o admin...");
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
  console.log("Migrando dados existentes para a empresa do admin...");

  // Migrar clientes
  await prisma.cliente.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar fornecedores
  await prisma.fornecedor.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar produtos
  await prisma.produto.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar vendas
  await prisma.venda.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar contas a receber
  await prisma.contaReceber.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar pagamentos
  await prisma.pagamentoReceber.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar contas a pagar
  await prisma.contaPagar.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar movimentações de estoque
  await prisma.movimentacaoEstoque.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  // Migrar movimentações de caixa
  await prisma.movimentacaoCaixa.updateMany({
    where: { userId: adminUser.id },
    data: { empresaId: empresa.id }
  });

  console.log("Migração concluída com sucesso!");
  console.log("Empresa criada com ID:", empresa.id);
}

main()
  .catch((e) => {
    console.error("Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
