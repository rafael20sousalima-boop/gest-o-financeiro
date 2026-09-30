import { Suspense } from "react";
import { getDashboardData } from "@/lib/queries";
import { PeriodoFiltro } from "@/lib/utils";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { PeriodoFilters } from "@/components/PeriodoFilters";
import {
  FaturamentoChart,
  FormasPagamentoChart,
  RankingValorChart,
  ReceitasDespesasChart,
  VendasPeriodoChart,
} from "@/components/Charts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const periodo = (params.periodo as PeriodoFiltro) || "mes";
  const data = await getDashboardData(periodo, params.de, params.ate);
  const i = data.indicadores;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Indicadores de ${formatDate(data.periodo.inicio)} até ${formatDate(data.periodo.fim)}`}
      />

      <Suspense fallback={null}>
        <PeriodoFilters periodo={periodo} de={params.de} ate={params.ate} />
      </Suspense>

      <div className="stats-grid">
        <StatCard label="Faturamento total" value={i.faturamentoTotal} delay={0} />
        <StatCard label="Total recebido" value={i.totalRecebido} delay={40} />
        <StatCard label="Total pendente" value={i.totalPendente} delay={80} />
        <StatCard label="Total em atraso" value={i.totalAtraso} delay={120} />
        <StatCard label="Total de despesas" value={i.totalDespesas} delay={160} />
        <StatCard label="Lucro estimado" value={i.lucroEstimado} delay={200} />
        <StatCard label="Quantidade de vendas" value={i.quantidadeVendas} money={false} delay={240} />
        <StatCard label="Quantidade de clientes" value={i.quantidadeClientes} money={false} delay={280} />
        <StatCard label="Valor vendido no mês" value={i.valorVendidoMes} delay={320} />
        <StatCard label="Valor recebido no mês" value={i.valorRecebidoMes} delay={360} />
        <StatCard label="Valor pendente" value={i.valorPendente} delay={400} />
        <StatCard label="Valor vencido" value={i.valorVencido} delay={440} />
      </div>

      <div className="charts-grid">
        <Panel title="Faturamento por mês" className="chart-card">
          <FaturamentoChart data={data.graficos.faturamentoPorMes} />
        </Panel>
        <Panel title="Receitas x despesas" className="chart-card">
          <ReceitasDespesasChart data={data.graficos.receitasDespesas} />
        </Panel>
        <Panel title="Vendas por período" className="chart-card">
          <VendasPeriodoChart data={data.graficos.vendasPorPeriodo} />
        </Panel>
        <Panel title="Formas de pagamento" className="chart-card">
          <FormasPagamentoChart data={data.graficos.formasPagamento} />
        </Panel>
        <Panel title="Valores pendentes" className="chart-card">
          <RankingValorChart data={data.graficos.valoresPendentes} color="#b7791f" />
        </Panel>
        <Panel title="Valores em atraso" className="chart-card">
          <RankingValorChart data={data.graficos.valoresAtraso} color="#b42318" />
        </Panel>
      </div>
    </div>
  );
}
