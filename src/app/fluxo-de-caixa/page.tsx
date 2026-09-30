import { Suspense } from "react";
import { getFluxoCaixa } from "@/lib/queries";
import { PeriodoFiltro, formatDate, formatMoney, labelFormaPagamento } from "@/lib/utils";
import { PageHeader, Panel, StatCard, EmptyState } from "@/components/ui";
import { PeriodoFilters } from "@/components/PeriodoFilters";
import { CaixaManualForm } from "@/components/ModuleForms";

export const dynamic = "force-dynamic";

export default async function FluxoCaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const periodo = (params.periodo as PeriodoFiltro) || "mes";
  const data = await getFluxoCaixa(periodo, params.de, params.ate);

  return (
    <div>
      <PageHeader
        title="Fluxo de Caixa"
        subtitle={`De ${formatDate(data.periodo.inicio)} até ${formatDate(data.periodo.fim)}`}
      />

      <Suspense fallback={null}>
        <PeriodoFilters periodo={periodo} de={params.de} ate={params.ate} />
      </Suspense>

      <div className="stats-grid" style={{ marginBottom: "1rem" }}>
        <StatCard label="Saldo inicial" value={data.saldoInicial} />
        <StatCard label="Entradas" value={data.entradas.total} />
        <StatCard label="Saídas" value={data.saidas.total} />
        <StatCard label="Saldo final" value={data.saldoFinal} />
      </div>

      <div className="charts-grid" style={{ marginBottom: "1rem" }}>
        <Panel title="Entradas">
          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                <tr><td>Vendas à vista</td><td>{formatMoney(data.entradas.vendasAVista)}</td></tr>
                <tr><td>Recebimentos de fiado</td><td>{formatMoney(data.entradas.recebimentosFiado)}</td></tr>
                <tr><td>Outras entradas</td><td>{formatMoney(data.entradas.outrasEntradas)}</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>{formatMoney(data.entradas.total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Saídas">
          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                <tr><td>Contas pagas</td><td>{formatMoney(data.saidas.contasPagas)}</td></tr>
                <tr><td>Compras</td><td>{formatMoney(data.saidas.compras)}</td></tr>
                <tr><td>Despesas</td><td>{formatMoney(data.saidas.despesas)}</td></tr>
                <tr><td>Outras saídas</td><td>{formatMoney(data.saidas.outrasSaidas)}</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>{formatMoney(data.saidas.total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Lançamento manual">
          <CaixaManualForm />
        </Panel>

        <Panel title="Recebimentos de fiado no período">
          {data.detalhes.pagamentos.length === 0 ? (
            <EmptyState message="Sem recebimentos no período." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Conta</th>
                    <th>Valor</th>
                    <th>Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {data.detalhes.pagamentos.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.dataPagamento)}</td>
                      <td>{p.cliente?.nome || "—"}</td>
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

        <Panel title="Contas pagas no período">
          {data.detalhes.contasPagas.length === 0 ? (
            <EmptyState message="Sem contas pagas no período." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.detalhes.contasPagas.map((c) => (
                    <tr key={c.id}>
                      <td>{formatDate(c.dataPagamento)}</td>
                      <td>{c.descricao}</td>
                      <td>{c.categoria}</td>
                      <td>{formatMoney(c.valor)}</td>
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
