import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureConfig } from "@/actions";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import { ClienteForm, ExcluirClienteButton } from "@/components/ClienteForms";
import { badgeClass, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  await ensureConfig();
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: {
      contasReceber: true,
      vendas: true,
    },
  });

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Cadastro e acompanhamento de crédito." />
      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Novo cliente">
          <ClienteForm />
        </Panel>
        <Panel title="Lista de clientes">
          {clientes.length === 0 ? (
            <EmptyState message="Nenhum cliente cadastrado." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Documento</th>
                    <th>Telefone</th>
                    <th>Pendente</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => {
                    const pendente = c.contasReceber
                      .filter((x) => x.status !== "cancelado")
                      .reduce((s, x) => s + x.saldoRestante, 0);
                    return (
                      <tr key={c.id}>
                        <td>
                          <Link href={`/clientes/${c.id}`} style={{ color: "var(--brand)", fontWeight: 700 }}>
                            {c.nome}
                          </Link>
                        </td>
                        <td>{c.documento || "—"}</td>
                        <td>{c.whatsapp || c.telefone || "—"}</td>
                        <td>{formatMoney(pendente)}</td>
                        <td>
                          <span className={`badge ${badgeClass(c.status)}`}>{c.status}</span>
                        </td>
                        <td style={{ display: "flex", gap: "0.4rem" }}>
                          <Link className="btn btn-secondary" href={`/clientes/${c.id}`}>
                            Abrir
                          </Link>
                          <ExcluirClienteButton id={c.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
