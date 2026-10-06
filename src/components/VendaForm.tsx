"use client";

import { useMemo, useState, useTransition } from "react";
import { criarVenda, cancelarVenda } from "@/actions";
import { FORMAS_PAGAMENTO, UNIDADES, calcValorVenda, toInputDate, formatMoney } from "@/lib/utils";

function MoneyInput({
  value,
  onChange,
  name,
  placeholder = "R$ 0,00",
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  name: string;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name'>) {
  const [displayValue, setDisplayValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = Number(rawValue) / 100;
    onChange(numericValue);
    setDisplayValue(rawValue);
  };

  const handleBlur = () => {
    setDisplayValue("");
  };

  const formattedValue = displayValue
    ? (Number(displayValue) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    : value > 0
    ? formatMoney(value)
    : '';

  return (
    <>
      <input
        {...props}
        type="text"
        value={formattedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputMode="numeric"
      />
      <input
        type="hidden"
        name={name}
        value={value > 0 ? value.toString() : "0"}
      />
    </>
  );
}

type Cliente = { id: string; nome: string };
type Produto = {
  id: string;
  nome: string;
  unidade: string;
  precoVenda: number;
  quantidade: number;
};

export function VendaForm({
  clientes,
  produtos,
}: {
  clientes: Cliente[];
  produtos: Produto[];
}) {
  const [pending, startTransition] = useTransition();
  const [unidade, setUnidade] = useState("unidade");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [pesoKg, setPesoKg] = useState(0);
  const [precoPorKg, setPrecoPorKg] = useState(0);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [tipoPagamento, setTipoPagamento] = useState("pix");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  const total = useMemo(
    () =>
      calcValorVenda({
        unidade,
        quantidade,
        valorUnitario,
        pesoKg,
        precoPorKg,
      }),
    [unidade, quantidade, valorUnitario, pesoKg, precoPorKg]
  );

  function onProdutoChange(id: string) {
    setProdutoId(id);
    const p = produtos.find((x) => x.id === id);
    if (!p) return;
    setUnidade(p.unidade || "unidade");
    if (p.unidade === "kg") {
      setPrecoPorKg(p.precoVenda);
      setValorUnitario(0);
      setPesoKg(0);
    } else {
      setValorUnitario(p.precoVenda);
      setPrecoPorKg(0);
      setPesoKg(0);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setOk("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await criarVenda(formData);
        setOk("Venda registrada com sucesso.");
        form.reset();
        setProdutoId("");
        setQuantidade(1);
        setPesoKg(0);
        setPrecoPorKg(0);
        setValorUnitario(0);
        setTipoPagamento("pix");
        setUnidade("unidade");
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao salvar venda");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <div className="field">
        <label>Data da venda</label>
        <input type="date" name="dataVenda" defaultValue={toInputDate()} required />
      </div>
      <div className="field">
        <label>Cliente</label>
        <select name="clienteId" defaultValue="">
          <option value="">Selecione (obrigatório no fiado)</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Produto cadastrado</label>
        <select value={produtoId} name="produtoId" onChange={(e) => onProdutoChange(e.target.value)}>
          <option value="">Produto avulso / digitar</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} (estoque: {p.quantidade})
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Nome do produto</label>
        <input
          name="produtoNome"
          placeholder="Ex.: Carne bovina"
          defaultValue={produtos.find((p) => p.id === produtoId)?.nome || ""}
          required={!produtoId}
        />
      </div>
      <div className="field">
        <label>Unidade de medida</label>
        <select name="unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          {UNIDADES.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      {unidade === "kg" ? (
        <>
          <div className="field">
            <label>Peso em KG</label>
            <input
              name="pesoKg"
              type="number"
              step="0.001"
              min="0.001"
              value={pesoKg || ""}
              onChange={(e) => setPesoKg(Number(e.target.value))}
              required
              placeholder="0.000"
            />
          </div>
          <div className="field">
            <label>Preço por KG</label>
            <MoneyInput
              name="precoPorKg"
              value={precoPorKg}
              onChange={setPrecoPorKg}
              required
            />
          </div>
          <input type="hidden" name="quantidade" value={pesoKg > 0 ? pesoKg : 0} />
        </>
      ) : (
        <>
          <div className="field">
            <label>Quantidade</label>
            <input
              name="quantidade"
              type="number"
              step="0.001"
              min="0"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              required
              placeholder="0"
            />
          </div>
          <div className="field">
            <label>Valor unitário</label>
            <MoneyInput
              name="valorUnitario"
              value={valorUnitario}
              onChange={setValorUnitario}
              required
            />
          </div>
        </>
      )}
      <div className="field">
        <label>Tipo de pagamento</label>
        <select
          name="tipoPagamento"
          value={tipoPagamento}
          onChange={(e) => setTipoPagamento(e.target.value)}
          required
        >
          {FORMAS_PAGAMENTO.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      {tipoPagamento === "fiado" && (
        <div className="field">
          <label>Data de vencimento</label>
          <input type="date" name="dataVencimento" required />
        </div>
      )}
      <div className="field">
        <label>Valor total (calculado)</label>
        <input value={formatMoney(total)} readOnly />
      </div>
      <div className="field full">
        <label>Observação</label>
        <textarea name="observacao" rows={3} />
      </div>
      {erro ? <div className="full" style={{ color: "var(--danger)" }}>{erro}</div> : null}
      {ok ? <div className="full" style={{ color: "var(--success)" }}>{ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Registrar venda"}
        </button>
      </div>
    </form>
  );
}

export function CancelarVendaButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-danger"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancelar esta venda?")) return;
        startTransition(async () => {
          await cancelarVenda(id);
        });
      }}
    >
      {pending ? "..." : "Cancelar"}
    </button>
  );
}
