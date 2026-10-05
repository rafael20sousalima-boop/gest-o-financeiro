import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const nome = formData.get("nome") as string;

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "Administrador já existe" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nome,
        role: "admin",
        ativo: true
      }
    });

    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return NextResponse.json({ error: "Erro ao criar administrador" }, { status: 500 });
  }
}
