import { clsx, type ClassValue } from "clsx";
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMoney(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function toInputDate(value?: Date | string | null) {
  const date = value
    ? typeof value === "string"
      ? parseISO(value)
      : value
    : new Date();
  return format(date, "yyyy-MM-dd");
}

export function parseInputDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export type PeriodoFiltro =
  | "hoje"
  | "semana"
  | "mes"
  | "mes_anterior"
  | "ano"
  | "personalizado";

export function getPeriodoRange(
  periodo: PeriodoFiltro,
  de?: string,
  ate?: string
) {
  const agora = new Date();

  switch (periodo) {
    case "hoje":
      return { inicio: startOfDay(agora), fim: endOfDay(agora) };
    case "semana":
      return {
        inicio: startOfWeek(agora, { weekStartsOn: 1 }),
        fim: endOfWeek(agora, { weekStartsOn: 1 }),
      };
    case "mes":
      return { inicio: startOfMonth(agora), fim: endOfMonth(agora) };
    case "mes_anterior": {
      const anterior = subMonths(agora, 1);
      return { inicio: startOfMonth(anterior), fim: endOfMonth(anterior) };
    }
    case "ano":
      return { inicio: startOfYear(agora), fim: endOfYear(agora) };
    case "personalizado":
      return {
        inicio: de ? startOfDay(parseInputDate(de)) : startOfMonth(agora),
        fim: ate ? endOfDay(parseInputDate(ate)) : endOfDay(agora),
      };
    default:
      return { inicio: startOfMonth(agora), fim: endOfMonth(agora) };
  }
}

export const UNIDADES = [
  { value: "unidade", label: "Unidade" },
  { value: "kg", label: "KG" },
  { value: "caixa", label: "Caixa" },
  { value: "outro", label: "Outro" },
] as const;

export const FORMAS_PAGAMENTO = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "transferencia", label: "Transferência" },
  { value: "fiado", label: "Fiado" },
] as const;

export const CATEGORIAS_PAGAR = [
  "Compra de mercadoria",
  "Energia",
  "Água",
  "Internet",
  "Transporte",
  "Funcionários",
  "Impostos",
  "Aluguel",
  "Manutenção",
  "Outros",
] as const;

export function labelFormaPagamento(value?: string | null) {
  return FORMAS_PAGAMENTO.find((f) => f.value === value)?.label ?? value ?? "—";
}

export function labelUnidade(value?: string | null) {
  return UNIDADES.find((u) => u.value === value)?.label ?? value ?? "—";
}

export function calcValorVenda(input: {
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  pesoKg?: number | null;
  precoPorKg?: number | null;
}) {
  if (input.unidade === "kg") {
    return Number(((input.pesoKg || 0) * (input.precoPorKg || 0)).toFixed(2));
  }
  return Number((input.quantidade * input.valorUnitario).toFixed(2));
}

export function statusReceberLabel(status: string) {
  const map: Record<string, string> = {
    aguardando_pagamento: "Aguardando pagamento",
    pendente_pagamento: "Pendente de pagamento",
    pagamento_atraso: "Pagamento em atraso",
    parcialmente_pago: "Parcialmente pago",
    pago: "Pago",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function statusPagarLabel(status: string) {
  const map: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago",
    em_atraso: "Em atraso",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function statusVendaLabel(status: string) {
  const map: Record<string, string> = {
    pago: "Pago",
    pendente: "Pendente",
    parcial: "Parcial",
    fiado: "Fiado",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function badgeClass(status: string) {
  const map: Record<string, string> = {
    pago: "badge-success",
    ativo: "badge-success",
    aguardando_pagamento: "badge-warning",
    pendente_pagamento: "badge-warning",
    pendente: "badge-warning",
    parcialmente_pago: "badge-info",
    parcial: "badge-info",
    fiado: "badge-info",
    pagamento_atraso: "badge-danger",
    em_atraso: "badge-danger",
    cancelado: "badge-muted",
    inativo: "badge-muted",
  };
  return map[status] ?? "badge-muted";
}

export function resolveStatusReceber(params: {
  status?: string;
  saldoRestante: number;
  valorRecebido: number;
  dataVencimento?: Date | null;
}) {
  if (params.status === "cancelado") return "cancelado";
  if (params.saldoRestante <= 0.009) return "pago";
  if (params.valorRecebido > 0 && params.saldoRestante > 0) {
    if (params.dataVencimento && params.dataVencimento < startOfDay(new Date())) {
      return "pagamento_atraso";
    }
    return "parcialmente_pago";
  }
  if (params.dataVencimento && params.dataVencimento < startOfDay(new Date())) {
    return "pagamento_atraso";
  }
  if (params.status === "pendente_pagamento") return "pendente_pagamento";
  return "aguardando_pagamento";
}

export function resolveStatusPagar(params: {
  status?: string;
  dataVencimento: Date;
  dataPagamento?: Date | null;
}) {
  if (params.status === "cancelado") return "cancelado";
  if (params.status === "pago" || params.dataPagamento) return "pago";
  if (params.dataVencimento < startOfDay(new Date())) return "em_atraso";
  return "pendente";
}
