import Link from "next/link";
import { notFound } from "next/navigation";
import { getClienteDetalhe } from "@/lib/queries";
import { PageHeader, Panel, StatCard, EmptyState } from "@/components/ui";
import { ClienteForm, RegistrarPagamentoForm } from "@/components/ClienteForms";
import {
  badgeClass,
  formatDate,
  formatMoney,
  labelFormaPagamento,
  statusReceberLabel,
  statusVendaLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getClienteDetalhe(id);
  if (!data) notFound();

  const { cliente, totais } = data;
  const contasAbertas = cliente.contasReceber.filter(
    (c) => c.saldoRestante > 0 && c.status !== "cancelado"
  );

  return (
    <div>
      <PageHeader
        title={cliente.nome}
        subtitle="Ficha do cliente, compras e pagamentos"
        actions={
          <Link className="btn btn-secondary" href="/clientes">
            Voltar
          </Link>
        }
      />

      <div className="stats-grid" style={{ marginBottom: "1rem" }}>
        <StatCard label="Total comprado" value={totais.totalComprado} />
        <StatCard label="Total pago" value={totais.totalPago} />
        <StatCard label="Total pendente" value={totais.totalPendente} />
        <StatCard label="Total em atraso" value={totais.totalAtraso} />
      </div>
      <p className="page-subtitle" style={{ marginBottom: "1rem" }}>
        Última compra: {formatDate(totais.ultimaCompra)}
      </p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Registrar pagamento">
          <RegistrarPagamentoForm contas={contasAbertas} />
        </Panel>

        <Panel title="Dados do cliente">
          <ClienteForm initial={cliente} />
        </Panel>

        <Panel title="Histórico de compras">
          {cliente.vendas.length === 0 ? (
            <EmptyState message="Sem compras registradas." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Produto</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.vendas.map((v) => (
                    <tr key={v.id}>
                      <td>{formatDate(v.dataVenda)}</td>
                      <td>{v.produtoNome}</td>
                      <td>{formatMoney(v.valorTotal)}</td>
                      <td>{labelFormaPagamento(v.tipoPagamento)}</td>
                      <td>
                        <span className={`badge ${badgeClass(v.statusPagamento)}`}>
                          {statusVendaLabel(v.statusPagamento)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Histórico de pagamentos">
          {cliente.pagamentos.length === 0 ? (
            <EmptyState message="Sem pagamentos registrados." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Conta</th>
                    <th>Valor</th>
                    <th>Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.pagamentos.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.dataPagamento)}</td>
                      <td>{p.conta.descricao}</td>
                      <td>{formatMoney(p.valor)}</td>
                      <td>{labelFormaPagamento(p.formaPagamento)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Contas a receber">
          {cliente.contasReceber.length === 0 ? (
            <EmptyState message="Sem contas a receber." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Original</th>
                    <th>Recebido</th>
                    <th>Saldo</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.contasReceber.map((c) => (
                    <tr key={c.id}>
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
