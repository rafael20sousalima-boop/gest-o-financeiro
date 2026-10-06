import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import {
  ContaPagarForm,
  PagarContaForm,
  CancelarPagarButton,
} from "@/components/ModuleForms";
import {
  badgeClass,
  formatDate,
  formatMoney,
  labelFormaPagamento,
  statusPagarLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContasPagarPage() {
  const [contas, fornecedores] = await Promise.all([
    prisma.contaPagar.findMany({
      include: { fornecedor: true },
      orderBy: { dataVencimento: "asc" },
    }),
    prisma.fornecedor.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Contas a Pagar" subtitle="Despesas, fornecedores e vencimentos." />
      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Nova conta a pagar">
          <ContaPagarForm fornecedores={fornecedores} />
        </Panel>
        <Panel title="Contas">
          {contas.length === 0 ? (
            <EmptyState message="Nenhuma conta a pagar cadastrada." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Fornecedor</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((c) => (
                    <tr key={c.id}>
                      <td>{c.descricao}</td>
                      <td>{c.categoria}</td>
                      <td>{c.fornecedor?.nome || "—"}</td>
                      <td>{formatDate(c.dataVencimento)}</td>
                      <td>{formatMoney(c.valor)}</td>
                      <td>
                        {c.dataPagamento
                          ? `${formatDate(c.dataPagamento)} · ${labelFormaPagamento(c.formaPagamento)}`
                          : "—"}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass(c.status)}`}>
                          {statusPagarLabel(c.status)}
                        </span>
                      </td>
                      <td>
                        {c.status !== "pago" && c.status !== "cancelado" ? (
                          <div style={{ display: "grid", gap: "0.35rem" }}>
                            <PagarContaForm id={c.id} />
                            <CancelarPagarButton id={c.id} />
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
