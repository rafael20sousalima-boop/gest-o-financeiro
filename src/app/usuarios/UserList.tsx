"use client";

import { useState } from "react";
import { Plus, Key, Eye, EyeOff, Trash2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  nome: string | null;
  role: string;
  ativo: boolean;
  criadoEm: Date;
}

interface UserListProps {
  initialUsers: User[];
}

export function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nome: "",
    role: "user"
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: ""
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([...users, data.user]);
        setShowCreateModal(false);
        setFormData({ username: "", password: "", nome: "", role: "user" });
        showMessage("success", "Usuário criado com sucesso!");
      } else {
        showMessage("error", data.error || "Erro ao criar usuário");
      }
    } catch (error) {
      showMessage("error", "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/usuarios/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPasswordData.newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setShowResetModal(false);
        setResetPasswordData({ newPassword: "" });
        showMessage("success", "Senha redefinida com sucesso!");
      } else {
        showMessage("error", data.error || "Erro ao redefinir senha");
      }
    } catch (error) {
      showMessage("error", "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}/toggle-active`, {
        method: "PATCH"
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, ativo: !currentStatus } : u));
        showMessage("success", "Status atualizado com sucesso!");
      } else {
        showMessage("error", "Erro ao atualizar status");
      }
    } catch (error) {
      showMessage("error", "Erro ao atualizar status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        showMessage("success", "Usuário excluído com sucesso!");
      } else {
        showMessage("error", "Erro ao excluir usuário");
      }
    } catch (error) {
      showMessage("error", "Erro ao excluir usuário");
    }
  };

  return (
    <div>
      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2>Usuários</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Plus size={16} />
            Novo Usuário
          </button>
        </div>
        <div className="panel-body">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3 border-b">Usuário</th>
                <th className="text-left p-3 border-b">Nome</th>
                <th className="text-left p-3 border-b">Função</th>
                <th className="text-left p-3 border-b">Status</th>
                <th className="text-left p-3 border-b">Criado em</th>
                <th className="text-left p-3 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 border-b">{user.username}</td>
                  <td className="p-3 border-b">{user.nome || "-"}</td>
                  <td className="p-3 border-b">
                    <span className={`px-2 py-1 rounded text-xs ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                      {user.role === "admin" ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <span className={`px-2 py-1 rounded text-xs ${user.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-3 border-b">{new Date(user.criadoEm).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 border-b">
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetModal(true);
                        }}
                        className="btn btn-secondary"
                        title="Redefinir senha"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user.id, user.ativo)}
                        className="btn btn-secondary"
                        title={user.ativo ? "Desativar" : "Ativar"}
                      >
                        {user.ativo ? "🔒" : "🔓"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn btn-secondary"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usuário</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Redefinir Senha */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Redefinir Senha</h2>
            <p className="text-gray-600 mb-4">
              Redefinir senha para: <strong>{selectedUser.username}</strong>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData({ newPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                    setResetPasswordData({ newPassword: "" });
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Redefinindo..." : "Redefinir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
