import { prisma } from "@/lib/prisma";
import { ensureConfig } from "@/actions";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import {
  ContaReceberForm,
  PagamentoRapidoForm,
  CancelarReceberButton,
} from "@/components/ModuleForms";
import {
  badgeClass,
  formatDate,
  formatMoney,
  statusReceberLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContasReceberPage() {
  await ensureConfig();
  const [contas, clientes] = await Promise.all([
    prisma.contaReceber.findMany({
      include: { cliente: true, pagamentos: true },
      orderBy: { dataVenda: "desc" },
    }),
    prisma.cliente.findMany({ where: { status: "ativo" }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Contas a Receber"
        subtitle="Vendas fiado, saldos e recebimentos parciais."
      />
      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Nova conta / venda fiada">
          <ContaReceberForm clientes={clientes} />
        </Panel>
        <Panel title="Contas">
          {contas.length === 0 ? (
            <EmptyState message="Nenhuma conta a receber cadastrada." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Original</th>
                    <th>Recebido</th>
                    <th>Saldo</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Receber</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((c) => (
                    <tr key={c.id}>
                      <td>{c.cliente?.nome || "—"}</td>
                      <td>{formatDate(c.dataVenda)}</td>
                      <td>{c.descricao}</td>
                      <td>{formatMoney(c.valorOriginal)}</td>
                      <td>{formatMoney(c.valorRecebido)}</td>
                      <td>{formatMoney(c.saldoRestante)}</td>
                      <td>{formatDate(c.dataVencimento)}</td>
                      <td>
                        <span className={`badge ${badgeClass(c.status)}`}>
                          {statusReceberLabel(c.status)}
                        </span>
                      </td>
                      <td>
                        {c.saldoRestante > 0 && c.status !== "cancelado" ? (
                          <div style={{ display: "grid", gap: "0.35rem" }}>
                            <PagamentoRapidoForm contaId={c.id} saldo={c.saldoRestante} />
                            <CancelarReceberButton id={c.id} />
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
