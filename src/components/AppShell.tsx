"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingCart,
  WalletCards,
  Users,
  Receipt,
  Truck,
  ArrowLeftRight,
  Package,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/contas-a-receber", label: "Contas a Receber", icon: WalletCards },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/contas-a-pagar", label: "Contas a Pagar", icon: Receipt },
  { href: "/fornecedores", label: "Fornecedores", icon: Truck },
  { href: "/fluxo-de-caixa", label: "Fluxo de Caixa", icon: ArrowLeftRight },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({
  children,
  empresa,
}: {
  children: React.ReactNode;
  empresa: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="app-shell">
      <aside className={cn("sidebar", open && "open")}>
        <div className="brand-block">
          <div className="brand-kicker">Sistema comercial</div>
          <div className="brand-title">{empresa}</div>
        </div>
        <nav className="nav-list">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn("nav-link", active && "active")}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {session && (
            <button
              type="button"
              className="nav-link"
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.75rem 1rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          )}
        </nav>
      </aside>

      <div className="main-area">
        <div className="topbar" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className="btn btn-secondary mobile-nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
            Menu
          </button>
        </div>
        {open && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,20,16,0.35)",
              border: 0,
              zIndex: 30,
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
