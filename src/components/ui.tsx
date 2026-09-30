import { formatMoney } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  money = true,
  delay = 0,
}: {
  label: string;
  value: number;
  money?: boolean;
  delay?: number;
}) {
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{money ? formatMoney(value) : value}</div>
    </div>
  );
}

export function Panel({
  title,
  actions,
  children,
  className = "",
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <div className="panel-header">
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{title}</h2>
          {actions}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}

export function SubmitButton({
  children,
  pendingLabel = "Salvando...",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  return (
    <button type="submit" className="btn btn-primary">
      {children}
    </button>
  );
}
