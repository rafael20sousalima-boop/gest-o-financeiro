import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, nome } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { username },
        data: { password: hashedPassword, nome: nome || existingUser.nome }
      });
      return NextResponse.json({ success: true, message: "Senha do admin atualizada" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nome: nome || "Admin",
        role: "admin",
        ativo: true
      }
    });

    return NextResponse.json({ success: true, message: "Admin criado com sucesso" });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return NextResponse.json({ error: "Erro ao criar admin" }, { status: 500 });
  }
}
