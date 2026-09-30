"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, labelFormaPagamento } from "@/lib/utils";

const COLORS = ["#0f6b4c", "#c45c26", "#1d6a8a", "#b7791f", "#5b6b62", "#1f7a4d"];

function moneyTick(value: number) {
  return formatMoney(value);
}

export function FaturamentoChart({ data }: { data: { mes: string; valor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
        <XAxis dataKey="mes" />
        <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={40} />
        <Tooltip formatter={(v) => formatMoney(Number(v))} />
        <Line type="monotone" dataKey="valor" stroke="#0f6b4c" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ReceitasDespesasChart({
  data,
}: {
  data: { mes: string; receitas: number; despesas: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
        <XAxis dataKey="mes" />
        <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={40} />
        <Tooltip formatter={(v) => formatMoney(Number(v))} />
        <Legend />
        <Bar dataKey="receitas" fill="#0f6b4c" radius={[6, 6, 0, 0]} name="Receitas" />
        <Bar dataKey="despesas" fill="#c45c26" radius={[6, 6, 0, 0]} name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VendasPeriodoChart({ data }: { data: { mes: string; vendas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
        <XAxis dataKey="mes" />
        <YAxis allowDecimals={false} width={30} />
        <Tooltip />
        <Bar dataKey="vendas" fill="#1d6a8a" radius={[6, 6, 0, 0]} name="Vendas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FormasPagamentoChart({
  data,
}: {
  data: { nome: string; valor: number }[];
}) {
  const chartData = data.map((d) => ({
    ...d,
    nome: labelFormaPagamento(d.nome),
  }));

  if (!chartData.length) {
    return <div className="empty-state">Sem dados de pagamento no período</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={90}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => moneyTick(Number(v))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RankingValorChart({
  data,
  color = "#0f6b4c",
}: {
  data: { nome: string; valor: number }[];
  color?: string;
}) {
  if (!data.length) {
    return <div className="empty-state">Nenhum valor para exibir</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
        <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <YAxis type="category" dataKey="nome" width={90} />
        <Tooltip formatter={(v) => formatMoney(Number(v))} />
        <Bar dataKey="valor" fill={color} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
