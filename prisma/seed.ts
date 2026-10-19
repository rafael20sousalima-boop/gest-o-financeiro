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
    console.log("Usuário admin já existe. Atualizando senha...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { username: adminUsername },
      data: { password: hashedPassword }
    });
    console.log("Senha do admin atualizada com sucesso!");
  } else {
    console.log("Criando usuário admin e empresa...");

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
    console.log("Usuário admin e empresa criados com sucesso!");
  }

  console.log(`Usuário: ${adminUsername}`);
  console.log(`Senha: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
