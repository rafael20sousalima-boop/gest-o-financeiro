import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserList } from "./UserList";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { criadoEm: "desc" }
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Gerenciamento de Usuários</h1>
          <p className="page-subtitle">Crie e gerencie usuários do sistema</p>
        </div>
      </div>
      <UserList initialUsers={users} />
    </div>
  );
}
