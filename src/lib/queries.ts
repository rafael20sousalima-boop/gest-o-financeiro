import { prisma } from "@/lib/prisma";
import { getPeriodoRange, PeriodoFiltro } from "@/lib/utils";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getDashboardData(
  periodo: PeriodoFiltro = "mes",
  de?: string,
  ate?: string
) {
  const { inicio, fim } = getPeriodoRange(periodo, de, ate);

  const [vendas, contasReceber, contasPagar, clientes, pagamentos, config] =
    await Promise.all([
      prisma.venda.findMany({
        where: {
          statusPagamento: { not: "cancelado" },
          dataVenda: { gte: inicio, lte: fim },
        },
        include: { cliente: true },
        orderBy: { dataVenda: "desc" },
      }),
      prisma.contaReceber.findMany({
        where: { status: { not: "cancelado" } },
        include: { cliente: true },
      }),
      prisma.contaPagar.findMany({
        where: { status: { not: "cancelado" } },
      }),
      prisma.cliente.count({ where: { status: "ativo" } }),
      prisma.pagamentoReceber.findMany({
        where: { dataPagamento: { gte: inicio, lte: fim } },
      }),
      prisma.configuracao.findUnique({ where: { id: 1 } }),
    ]);

  const faturamentoTotal = vendas.reduce((s, v) => s + v.valorTotal, 0);
  const vendasAVista = vendas.filter((v) => v.tipoPagamento !== "fiado");
  const totalRecebidoVista = vendasAVista.reduce((s, v) => s + v.valorTotal, 0);
  const totalRecebidoFiado = pagamentos.reduce((s, p) => s + p.valor, 0);
  const totalRecebido = totalRecebidoVista + totalRecebidoFiado;

  const contasPeriodo = contasReceber.filter((c) =>
    isWithinInterval(c.dataVenda, { start: inicio, end: fim })
  );

  const totalPendente = contasReceber
    .filter((c) => c.saldoRestante > 0 && c.status !== "pagamento_atraso")
    .reduce((s, c) => s + c.saldoRestante, 0);

  const totalAtraso = contasReceber
    .filter((c) => c.status === "pagamento_atraso")
    .reduce((s, c) => s + c.saldoRestante, 0);

  const despesasPeriodo = contasPagar.filter(
    (c) =>
      c.status === "pago" &&
      c.dataPagamento &&
      isWithinInterval(c.dataPagamento, { start: inicio, end: fim })
  );
  const totalDespesas = despesasPeriodo.reduce((s, c) => s + c.valor, 0);
  const lucroEstimado = totalRecebido - totalDespesas;

  const valorVendidoMes = faturamentoTotal;
  const valorRecebidoMes = totalRecebido;
  const valorPendente = totalPendente;
  const valorVencido = totalAtraso;

  // Charts - last 6 months relative to fim
  const chartStart = startOfMonth(new Date(fim.getFullYear(), fim.getMonth() - 5, 1));
  const months = eachMonthOfInterval({ start: chartStart, end: endOfMonth(fim) });

  const todasVendasChart = await prisma.venda.findMany({
    where: {
      statusPagamento: { not: "cancelado" },
      dataVenda: { gte: chartStart, lte: fim },
    },
  });
  const todosPagamentosChart = await prisma.pagamentoReceber.findMany({
    where: { dataPagamento: { gte: chartStart, lte: fim } },
  });
  const todasDespesasChart = await prisma.contaPagar.findMany({
    where: {
      status: "pago",
      dataPagamento: { gte: chartStart, lte: fim },
    },
  });

  const faturamentoPorMes = months.map((m) => {
    const ini = startOfMonth(m);
    const end = endOfMonth(m);
    const fat = todasVendasChart
      .filter((v) => isWithinInterval(v.dataVenda, { start: ini, end }))
      .reduce((s, v) => s + v.valorTotal, 0);
    return {
      mes: format(m, "MMM/yy", { locale: ptBR }),
      valor: Number(fat.toFixed(2)),
    };
  });

  const receitasDespesas = months.map((m) => {
    const ini = startOfMonth(m);
    const end = endOfMonth(m);
    const aVista = todasVendasChart
      .filter(
        (v) =>
          v.tipoPagamento !== "fiado" &&
          isWithinInterval(v.dataVenda, { start: ini, end })
      )
      .reduce((s, v) => s + v.valorTotal, 0);
    const fiado = todosPagamentosChart
      .filter((p) => isWithinInterval(p.dataPagamento, { start: ini, end }))
      .reduce((s, p) => s + p.valor, 0);
    const despesas = todasDespesasChart
      .filter(
        (c) => c.dataPagamento && isWithinInterval(c.dataPagamento, { start: ini, end })
      )
      .reduce((s, c) => s + c.valor, 0);
    return {
      mes: format(m, "MMM/yy", { locale: ptBR }),
      receitas: Number((aVista + fiado).toFixed(2)),
      despesas: Number(despesas.toFixed(2)),
    };
  });

  const vendasPorPeriodo = months.map((m) => {
    const ini = startOfMonth(m);
    const end = endOfMonth(m);
    const qtd = todasVendasChart.filter((v) =>
      isWithinInterval(v.dataVenda, { start: ini, end })
    ).length;
    return {
      mes: format(m, "MMM/yy", { locale: ptBR }),
      vendas: qtd,
    };
  });

  const formasMap = new Map<string, number>();
  for (const v of vendas) {
    formasMap.set(v.tipoPagamento, (formasMap.get(v.tipoPagamento) || 0) + v.valorTotal);
  }
  const formasPagamento = Array.from(formasMap.entries()).map(([nome, valor]) => ({
    nome,
    valor: Number(valor.toFixed(2)),
  }));

  const pendentesPorCliente = Object.values(
    contasReceber
      .filter((c) => c.saldoRestante > 0 && c.status !== "pagamento_atraso")
      .reduce(
        (acc, c) => {
          const key = c.cliente?.nome || "Sem cliente";
          acc[key] = (acc[key] || 0) + c.saldoRestante;
          return acc;
        },
        {} as Record<string, number>
      )
  );

  const valoresPendentes = Object.entries(
    contasReceber
      .filter((c) => c.saldoRestante > 0 && c.status !== "pagamento_atraso")
      .reduce(
        (acc, c) => {
          const key = c.cliente?.nome || "Sem cliente";
          acc[key] = (acc[key] || 0) + c.saldoRestante;
          return acc;
        },
        {} as Record<string, number>
      )
  )
    .map(([nome, valor]) => ({ nome, valor: Number(valor.toFixed(2)) }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  const valoresAtraso = Object.entries(
    contasReceber
      .filter((c) => c.status === "pagamento_atraso")
      .reduce(
        (acc, c) => {
          const key = c.cliente?.nome || "Sem cliente";
          acc[key] = (acc[key] || 0) + c.saldoRestante;
          return acc;
        },
        {} as Record<string, number>
      )
  )
    .map(([nome, valor]) => ({ nome, valor: Number(valor.toFixed(2)) }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  return {
    periodo: { inicio, fim },
    indicadores: {
      faturamentoTotal,
      totalRecebido,
      totalPendente,
      totalAtraso,
      totalDespesas,
      lucroEstimado,
      quantidadeVendas: vendas.length,
      quantidadeClientes: clientes,
      valorVendidoMes,
      valorRecebidoMes,
      valorPendente,
      valorVencido,
    },
    graficos: {
      faturamentoPorMes,
      receitasDespesas,
      vendasPorPeriodo,
      formasPagamento,
      valoresPendentes,
      valoresAtraso,
    },
    nomeEmpresa: config?.nomeEmpresa || "Gestão Financeira",
    _unused: pendentesPorCliente,
  };
}

export async function getFluxoCaixa(periodo: PeriodoFiltro, de?: string, ate?: string) {
  const { inicio, fim } = getPeriodoRange(periodo, de, ate);
  const config = await prisma.configuracao.findUnique({ where: { id: 1 } });

  const [vendas, pagamentos, contasPagas, manuais] = await Promise.all([
    prisma.venda.findMany({
      where: {
        statusPagamento: { not: "cancelado" },
        tipoPagamento: { not: "fiado" },
        dataVenda: { gte: inicio, lte: fim },
      },
    }),
    prisma.pagamentoReceber.findMany({
      where: { dataPagamento: { gte: inicio, lte: fim } },
      include: { conta: true, cliente: true },
    }),
    prisma.contaPagar.findMany({
      where: {
        status: "pago",
        dataPagamento: { gte: inicio, lte: fim },
      },
      include: { fornecedor: true },
    }),
    prisma.movimentacaoCaixa.findMany({
      where: { data: { gte: inicio, lte: fim } },
      orderBy: { data: "desc" },
    }),
  ]);

  const vendasAVista = vendas.reduce((s, v) => s + v.valorTotal, 0);
  const recebimentosFiado = pagamentos.reduce((s, p) => s + p.valor, 0);
  const outrasEntradas = manuais
    .filter((m) => m.tipo === "entrada")
    .reduce((s, m) => s + m.valor, 0);

  const contasPagasValor = contasPagas.reduce((s, c) => s + c.valor, 0);
  const compras = contasPagas
    .filter((c) => c.categoria === "Compra de mercadoria")
    .reduce((s, c) => s + c.valor, 0);
  const despesas = contasPagas
    .filter((c) => c.categoria !== "Compra de mercadoria")
    .reduce((s, c) => s + c.valor, 0);
  const outrasSaidas = manuais
    .filter((m) => m.tipo === "saida")
    .reduce((s, m) => s + m.valor, 0);

  const entradas = vendasAVista + recebimentosFiado + outrasEntradas;
  const saidas = contasPagasValor + outrasSaidas;
  const saldoInicial = config?.saldoInicial || 0;
  const saldoFinal = saldoInicial + entradas - saidas;

  return {
    periodo: { inicio, fim },
    saldoInicial,
    entradas: {
      vendasAVista,
      recebimentosFiado,
      outrasEntradas,
      total: entradas,
    },
    saidas: {
      contasPagas: contasPagasValor,
      compras,
      despesas,
      outrasSaidas,
      total: saidas,
    },
    saldoFinal,
    detalhes: {
      vendas,
      pagamentos,
      contasPagas,
      manuais,
    },
  };
}

export async function getClienteDetalhe(id: string) {
  await ensureConfig();
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vendas: { orderBy: { dataVenda: "desc" }, include: { produto: true } },
      contasReceber: { orderBy: { dataVenda: "desc" } },
      pagamentos: {
        orderBy: { dataPagamento: "desc" },
        include: { conta: true },
      },
    },
  });
  if (!cliente) return null;

  const totalComprado = cliente.vendas
    .filter((v) => v.statusPagamento !== "cancelado")
    .reduce((s, v) => s + v.valorTotal, 0);
  const totalPago =
    cliente.vendas
      .filter((v) => v.tipoPagamento !== "fiado" && v.statusPagamento !== "cancelado")
      .reduce((s, v) => s + v.valorTotal, 0) +
    cliente.pagamentos.reduce((s, p) => s + p.valor, 0);
  const totalPendente = cliente.contasReceber
    .filter((c) => c.saldoRestante > 0 && c.status !== "pagamento_atraso" && c.status !== "cancelado")
    .reduce((s, c) => s + c.saldoRestante, 0);
  const totalAtraso = cliente.contasReceber
    .filter((c) => c.status === "pagamento_atraso")
    .reduce((s, c) => s + c.saldoRestante, 0);
  const ultimaCompra = cliente.vendas[0]?.dataVenda ?? null;

  return {
    cliente,
    totais: { totalComprado, totalPago, totalPendente, totalAtraso, ultimaCompra },
  };
}
