import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = "Rafael1212";
  const adminPassword = "Lima1212";

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername }
  });

  if (existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { username: adminUsername },
      data: { password: hashedPassword }
    });

    // Se o admin não tiver empresaId, criar empresa e migrar dados
    if (!existingAdmin.empresaId) {
      const empresa = await prisma.empresa.create({
        data: {
          nome: "Rafael Gestão"
        }
      });

      // Criar configuração para a empresa
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
        where: { id: existingAdmin.id },
        data: { empresaId: empresa.id }
      });

      // Migrar dados existentes usando raw SQL
      await prisma.$executeRaw`
        UPDATE "Cliente" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "Fornecedor" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "Produto" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "Venda" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "ContaReceber" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "PagamentoReceber" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "ContaPagar" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "MovimentacaoEstoque" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];

      await prisma.$executeRaw`
        UPDATE "MovimentacaoCaixa" SET "empresaId" = $1 WHERE "userId" = $2
      `, [empresa.id, existingAdmin.id];
    }
  } else {
    // Criar empresa para o admin
    const empresa = await prisma.empresa.create({
      data: {
        nome: "Rafael Gestão"
      }
    });

    // Criar configuração para a empresa
    await prisma.configuracao.create({
      data: {
        nomeEmpresa: "Rafael Gestão",
        saldoInicial: 0,
        empresaId: empresa.id
      }
    });

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        nome: "Admin",
        role: "admin",
        ativo: true,
        empresaId: empresa.id
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
