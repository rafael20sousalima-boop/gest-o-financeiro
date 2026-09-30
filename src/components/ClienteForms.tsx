"use client";

import { useState, useTransition } from "react";
import {
  criarCliente,
  atualizarCliente,
  excluirCliente,
  registrarPagamentoReceber,
} from "@/actions";
import { FORMAS_PAGAMENTO, toInputDate } from "@/lib/utils";

export function ClienteForm({
  initial,
}: {
  initial?: {
    id: string;
    nome: string;
    documento: string | null;
    telefone: string | null;
    whatsapp: string | null;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
    observacao: string | null;
    limiteCredito: number;
    status: string;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setOk("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (initial) await atualizarCliente(initial.id, formData);
        else await criarCliente(formData);
        setOk(initial ? "Cliente atualizado." : "Cliente cadastrado.");
        if (!initial) e.currentTarget.reset();
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao salvar");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <div className="field"><label>Nome</label><input name="nome" defaultValue={initial?.nome} required /></div>
      <div className="field"><label>CPF/CNPJ</label><input name="documento" defaultValue={initial?.documento || ""} /></div>
      <div className="field"><label>Telefone</label><input name="telefone" defaultValue={initial?.telefone || ""} /></div>
      <div className="field"><label>WhatsApp</label><input name="whatsapp" defaultValue={initial?.whatsapp || ""} /></div>
      <div className="field"><label>Endereço</label><input name="endereco" defaultValue={initial?.endereco || ""} /></div>
      <div className="field"><label>Bairro</label><input name="bairro" defaultValue={initial?.bairro || ""} /></div>
      <div className="field"><label>Cidade</label><input name="cidade" defaultValue={initial?.cidade || ""} /></div>
      <div className="field"><label>Limite de crédito</label><input name="limiteCredito" type="number" step="0.01" defaultValue={initial?.limiteCredito ?? 0} /></div>
      <div className="field">
        <label>Status</label>
        <select name="status" defaultValue={initial?.status || "ativo"}>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <div className="field full"><label>Observação</label><textarea name="observacao" rows={3} defaultValue={initial?.observacao || ""} /></div>
      {erro ? <div className="full" style={{ color: "var(--danger)" }}>{erro}</div> : null}
      {ok ? <div className="full" style={{ color: "var(--success)" }}>{ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Salvando..." : initial ? "Atualizar cliente" : "Cadastrar cliente"}
        </button>
      </div>
    </form>
  );
}

export function ExcluirClienteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn btn-danger"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir este cliente?")) return;
        startTransition(async () => {
          try {
            await excluirCliente(id);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Erro ao excluir");
          }
        });
      }}
    >
      Excluir
    </button>
  );
}

export function RegistrarPagamentoForm({
  contas,
}: {
  contas: { id: string; descricao: string; saldoRestante: number }[];
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  if (!contas.length) {
    return <div className="empty-state">Não há contas em aberto para este cliente.</div>;
  }

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        setErro("");
        setOk("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await registrarPagamentoReceber(formData);
            setOk("Pagamento registrado.");
            e.currentTarget.reset();
          } catch (err) {
            setErro(err instanceof Error ? err.message : "Erro ao registrar");
          }
        });
      }}
    >
      <div className="field full">
        <label>Conta</label>
        <select name="contaId" required defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {contas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descricao} — saldo {c.saldoRestante.toFixed(2)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Valor</label>
        <input name="valor" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="field">
        <label>Data do pagamento</label>
        <input name="dataPagamento" type="date" defaultValue={toInputDate()} required />
      </div>
      <div className="field">
        <label>Forma de pagamento</label>
        <select name="formaPagamento" required defaultValue="pix">
          {FORMAS_PAGAMENTO.filter((f) => f.value !== "fiado").map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field full">
        <label>Observação</label>
        <textarea name="observacao" rows={2} />
      </div>
      {erro ? <div className="full" style={{ color: "var(--danger)" }}>{erro}</div> : null}
      {ok ? <div className="full" style={{ color: "var(--success)" }}>{ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Registrar pagamento"}
        </button>
      </div>
    </form>
  );
}
