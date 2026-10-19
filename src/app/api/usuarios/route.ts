import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado", role: session.user.role }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, nome, role, nomeEmpresa } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
    }

    // Validação básica
    if (username.length < 3) {
      return NextResponse.json({ error: "O usuário deve ter pelo menos 3 caracteres" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 4 caracteres" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar empresa para o novo usuário
    const empresa = await prisma.empresa.create({
      data: {
        nome: nomeEmpresa || "Nova Empresa"
      }
    });

    // Criar configuração para a empresa
    await prisma.configuracao.create({
      data: {
        nomeEmpresa: nomeEmpresa || "Nova Empresa",
        saldoInicial: 0,
        empresaId: empresa.id
      }
    });

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nome,
        role: role || "user",
        empresaId: empresa.id
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro ao criar usuário", details: String(error) }, { status: 500 });
  }
}
