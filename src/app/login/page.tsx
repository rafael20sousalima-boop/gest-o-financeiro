"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError("Usuário ou senha inválidos");
      } else if (result?.ok) {
        // Redirecionar para o callbackUrl ou "/" (Dashboard)
        const redirectUrl = callbackUrl || "/";
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } catch (error) {
      setError("Erro ao fazer login. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full rounded-lg shadow-md p-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Gestão Financeira</h1>
          <p className="mt-2" style={{ color: 'var(--ink-muted)' }}>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="px-4 py-3 rounded" style={{ background: 'var(--danger)', color: 'white' }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                border: '1px solid var(--line)',
                background: 'var(--bg-elevated)',
                color: 'var(--ink)',
                transition: 'background 0.3s ease, border-color 0.3s ease'
              }}
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                border: '1px solid var(--line)',
                background: 'var(--bg-elevated)',
                color: 'var(--ink)',
                transition: 'background 0.3s ease, border-color 0.3s ease'
              }}
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--brand)',
              color: 'white',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--brand-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--brand)';
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
