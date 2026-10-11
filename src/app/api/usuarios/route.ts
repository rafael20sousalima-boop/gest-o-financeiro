import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateUsername, validatePassword } from "@/lib/credentials-generator";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado", role: session.user.role }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, nome, role } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
    }

    // Validação do padrão de usuário e senha
    if (!validateUsername(username)) {
      return NextResponse.json({ error: "O usuário deve ter exatamente 6 letras maiúsculas" }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: "A senha deve ter exatamente 6 caracteres (letras e números)" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nome,
        role: role || "user"
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro ao criar usuário", details: String(error) }, { status: 500 });
  }
}
