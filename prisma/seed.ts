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
    console.log("Criando usuário admin...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        nome: "Admin",
        role: "admin",
        ativo: true
      }
    });
    console.log("Usuário admin criado com sucesso!");
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
