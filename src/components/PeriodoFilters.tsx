"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PeriodoFiltro } from "@/lib/utils";

const opcoes: { value: PeriodoFiltro; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mês" },
  { value: "mes_anterior", label: "Mês anterior" },
  { value: "ano", label: "Este ano" },
  { value: "personalizado", label: "Personalizado" },
];

export function PeriodoFilters({
  periodo,
  de,
  ate,
}: {
  periodo: PeriodoFiltro;
  de?: string;
  ate?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPeriodo(value: PeriodoFiltro) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", value);
    if (value !== "personalizado") {
      params.delete("de");
      params.delete("ate");
    }
    router.push(`?${params.toString()}`);
  }

  function setCustom(key: "de" | "ate", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", "personalizado");
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <div className="filters">
        {opcoes.map((op) => (
          <button
            key={op.value}
            type="button"
            className={`filter-chip ${periodo === op.value ? "active" : ""}`}
            onClick={() => setPeriodo(op.value)}
          >
            {op.label}
          </button>
        ))}
      </div>
      {periodo === "personalizado" && (
        <div className="form-grid" style={{ marginBottom: "1rem", maxWidth: 480 }}>
          <div className="field">
            <label>De</label>
            <input type="date" value={de || ""} onChange={(e) => setCustom("de", e.target.value)} />
          </div>
          <div className="field">
            <label>Até</label>
            <input type="date" value={ate || ""} onChange={(e) => setCustom("ate", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
