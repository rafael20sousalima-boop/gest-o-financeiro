"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
  UserCog,
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
  { href: "/usuarios", label: "Usuários", icon: UserCog, adminOnly: true },
];

export function AppShell({
  children,
  empresa,
}: {
  children: React.ReactNode;
  empresa: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const filteredLinks = links.filter(
    (link) => !link.adminOnly || userRole === "admin"
  );

  return (
    <div className="app-shell">
      <aside className={cn("sidebar", open && "open")}>
        <div className="brand-block">
          <div className="brand-kicker">Sistema comercial</div>
          <div className="brand-title">{empresa}</div>
        </div>
        <nav className="nav-list">
          {filteredLinks.map((link) => {
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
        </nav>
        <div className="nav-list" style={{ marginTop: "auto" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="nav-link"
            style={{ width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
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
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "#666" }}>
              {session?.user?.name}
            </span>
            <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: userRole === "admin" ? "#dcfce7" : "#f3f4f6", color: userRole === "admin" ? "#166534" : "#374151" }}>
              {userRole === "admin" ? "Admin" : "Usuário"}
            </span>
          </div>
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
