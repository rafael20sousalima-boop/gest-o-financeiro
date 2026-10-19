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
  // A migração precisa usar raw SQL porque o campo userId não existe mais no schema
  await prisma.$executeRaw`
    UPDATE "Cliente" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "Fornecedor" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "Produto" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "Venda" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "ContaReceber" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "PagamentoReceber" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "ContaPagar" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "MovimentacaoEstoque" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];

  await prisma.$executeRaw`
    UPDATE "MovimentacaoCaixa" SET "empresaId" = $1 WHERE "userId" = $2
  `, [empresa.id, adminUser.id];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
