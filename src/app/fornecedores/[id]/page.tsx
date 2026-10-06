import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, EmptyState, StatCard } from "@/components/ui";
import { FornecedorForm } from "@/components/ModuleForms";
import {
  badgeClass,
  formatDate,
  formatMoney,
  labelFormaPagamento,
  statusPagarLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FornecedorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fornecedor = await prisma.fornecedor.findUnique({
    where: { id },
    include: { contasPagar: { orderBy: { dataVencimento: "desc" } } },
  });
  if (!fornecedor) notFound();

  const totalPago = fornecedor.contasPagar
    .filter((c) => c.status === "pago")
    .reduce((s, c) => s + c.valor, 0);
  const totalPendente = fornecedor.contasPagar
    .filter((c) => c.status === "pendente" || c.status === "em_atraso")
    .reduce((s, c) => s + c.valor, 0);

  return (
    <div>
      <PageHeader
        title={fornecedor.nome}
        subtitle="Histórico de compras e pagamentos"
        actions={
          <Link className="btn btn-secondary" href="/fornecedores">
            Voltar
          </Link>
        }
      />
      <div className="stats-grid" style={{ marginBottom: "1rem" }}>
        <StatCard label="Total pago" value={totalPago} />
        <StatCard label="Total em aberto" value={totalPendente} />
      </div>
      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Dados do fornecedor">
          <FornecedorForm initial={fornecedor} />
        </Panel>
        <Panel title="Histórico de contas">
          {fornecedor.contasPagar.length === 0 ? (
            <EmptyState message="Sem contas vinculadas." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedor.contasPagar.map((c) => (
                    <tr key={c.id}>
                      <td>{c.descricao}</td>
                      <td>{c.categoria}</td>
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
