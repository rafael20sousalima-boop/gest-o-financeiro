import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin" }
  });

  if (adminUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuração Inicial</h1>
          <p className="text-gray-600 mt-2">Crie o usuário administrador</p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}

function SetupForm() {
  return (
    <form action="/api/setup-admin" method="POST" className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Usuário
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue="Rafael1212"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          defaultValue="Lima1212"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          defaultValue="Admin"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Criar Administrador
      </button>

      <p className="text-sm text-gray-500 text-center">
        Após criar o administrador, você será redirecionado para a página de login.
      </p>
    </form>
  );
}
