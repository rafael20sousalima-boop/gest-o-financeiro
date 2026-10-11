import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export async function ensureAdmin() {
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin" }
  });

  if (!adminUser) {
    console.log("Criando usuário admin padrão...");
    const hashedPassword = await bcrypt.hash("Admin12", 10);

    await prisma.user.create({
      data: {
        username: "ADMIN",
        password: hashedPassword,
        nome: "Admin",
        role: "admin",
        ativo: true
      }
    });

    console.log("Usuário admin criado: ADMIN / Admin12");
  }
}
