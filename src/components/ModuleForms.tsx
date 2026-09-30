"use client";

import { useState, useTransition } from "react";
import {
  criarContaReceber,
  registrarPagamentoReceber,
  cancelarContaReceber,
  criarContaPagar,
  pagarContaPagar,
  cancelarContaPagar,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
  criarProduto,
  movimentarEstoque,
  criarMovimentacaoCaixa,
  atualizarConfiguracao,
} from "@/actions";
import {
  CATEGORIAS_PAGAR,
  FORMAS_PAGAMENTO,
  UNIDADES,
  toInputDate,
} from "@/lib/utils";

function useFeedback() {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  return { pending, startTransition, erro, setErro, ok, setOk };
}

export function ContaReceberForm({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            await criarContaReceber(formData);
            f.setOk("Conta registrada.");
            e.currentTarget.reset();
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field">
        <label>Cliente</label>
        <select name="clienteId" required defaultValue="">
          <option value="" disabled>Selecione</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Data da venda</label>
        <input name="dataVenda" type="date" defaultValue={toInputDate()} required />
      </div>
      <div className="field full">
        <label>Descrição</label>
        <input name="descricao" required />
      </div>
      <div className="field">
        <label>Valor original</label>
        <input name="valorOriginal" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="field">
        <label>Data de vencimento</label>
        <input name="dataVencimento" type="date" />
      </div>
      <div className="field full">
        <label>Observação</label>
        <textarea name="observacao" rows={2} />
      </div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : "Registrar conta"}
        </button>
      </div>
    </form>
  );
}

export function PagamentoRapidoForm({
  contaId,
  saldo,
}: {
  contaId: string;
  saldo: number;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("contaId", contaId);
        startTransition(async () => {
          try {
            await registrarPagamentoReceber(formData);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <input name="valor" type="number" step="0.01" min="0.01" max={saldo} placeholder="Valor" required style={{ width: 100, borderRadius: 10, border: "1px solid var(--line)", padding: "0.45rem" }} />
      <input name="dataPagamento" type="date" defaultValue={toInputDate()} required style={{ borderRadius: 10, border: "1px solid var(--line)", padding: "0.45rem" }} />
      <select name="formaPagamento" defaultValue="pix" style={{ borderRadius: 10, border: "1px solid var(--line)", padding: "0.45rem" }}>
        {FORMAS_PAGAMENTO.filter((x) => x.value !== "fiado").map((x) => (
          <option key={x.value} value={x.value}>{x.label}</option>
        ))}
      </select>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "..." : "Pagar"}
      </button>
    </form>
  );
}

export function CancelarReceberButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn btn-ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancelar esta conta?")) return;
        startTransition(async () => cancelarContaReceber(id));
      }}
    >
      Cancelar
    </button>
  );
}

export function ContaPagarForm({
  fornecedores,
}: {
  fornecedores: { id: string; nome: string }[];
}) {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            await criarContaPagar(formData);
            f.setOk("Conta a pagar registrada.");
            e.currentTarget.reset();
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field full">
        <label>Descrição</label>
        <input name="descricao" required />
      </div>
      <div className="field">
        <label>Categoria</label>
        <select name="categoria" required defaultValue={CATEGORIAS_PAGAR[0]}>
          {CATEGORIAS_PAGAR.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Fornecedor</label>
        <select name="fornecedorId" defaultValue="">
          <option value="">Opcional</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Data de vencimento</label>
        <input name="dataVencimento" type="date" required />
      </div>
      <div className="field">
        <label>Valor</label>
        <input name="valor" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="field full">
        <label>Observação</label>
        <textarea name="observacao" rows={2} />
      </div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : "Registrar conta"}
        </button>
      </div>
    </form>
  );
}

export function PagarContaForm({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("id", id);
        startTransition(async () => {
          try {
            await pagarContaPagar(formData);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <input name="dataPagamento" type="date" defaultValue={toInputDate()} required style={{ borderRadius: 10, border: "1px solid var(--line)", padding: "0.45rem" }} />
      <select name="formaPagamento" defaultValue="pix" style={{ borderRadius: 10, border: "1px solid var(--line)", padding: "0.45rem" }}>
        {FORMAS_PAGAMENTO.filter((x) => x.value !== "fiado").map((x) => (
          <option key={x.value} value={x.value}>{x.label}</option>
        ))}
      </select>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "..." : "Marcar pago"}
      </button>
    </form>
  );
}

export function CancelarPagarButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn btn-ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancelar esta conta?")) return;
        startTransition(async () => cancelarContaPagar(id));
      }}
    >
      Cancelar
    </button>
  );
}

export function FornecedorForm({
  initial,
}: {
  initial?: {
    id: string;
    nome: string;
    documento: string | null;
    telefone: string | null;
    whatsapp: string | null;
    endereco: string | null;
    produtoFornecido: string | null;
    observacao: string | null;
  };
}) {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            if (initial) await atualizarFornecedor(initial.id, formData);
            else await criarFornecedor(formData);
            f.setOk(initial ? "Atualizado." : "Fornecedor cadastrado.");
            if (!initial) e.currentTarget.reset();
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field"><label>Nome</label><input name="nome" defaultValue={initial?.nome} required /></div>
      <div className="field"><label>CPF/CNPJ</label><input name="documento" defaultValue={initial?.documento || ""} /></div>
      <div className="field"><label>Telefone</label><input name="telefone" defaultValue={initial?.telefone || ""} /></div>
      <div className="field"><label>WhatsApp</label><input name="whatsapp" defaultValue={initial?.whatsapp || ""} /></div>
      <div className="field full"><label>Endereço</label><input name="endereco" defaultValue={initial?.endereco || ""} /></div>
      <div className="field full"><label>Produto fornecido</label><input name="produtoFornecido" defaultValue={initial?.produtoFornecido || ""} /></div>
      <div className="field full"><label>Observação</label><textarea name="observacao" rows={2} defaultValue={initial?.observacao || ""} /></div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : initial ? "Atualizar" : "Cadastrar fornecedor"}
        </button>
      </div>
    </form>
  );
}

export function ExcluirFornecedorButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn btn-danger"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir fornecedor?")) return;
        startTransition(async () => {
          try {
            await excluirFornecedor(id);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      Excluir
    </button>
  );
}

export function ProdutoForm() {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            await criarProduto(formData);
            f.setOk("Produto cadastrado.");
            e.currentTarget.reset();
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field"><label>Produto</label><input name="nome" required /></div>
      <div className="field"><label>Categoria</label><input name="categoria" /></div>
      <div className="field">
        <label>Unidade</label>
        <select name="unidade" defaultValue="unidade">
          {UNIDADES.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>
      <div className="field"><label>Quantidade</label><input name="quantidade" type="number" step="0.001" defaultValue={0} /></div>
      <div className="field"><label>Estoque mínimo</label><input name="estoqueMinimo" type="number" step="0.001" defaultValue={0} /></div>
      <div className="field"><label>Custo</label><input name="custo" type="number" step="0.01" defaultValue={0} /></div>
      <div className="field"><label>Preço de venda</label><input name="precoVenda" type="number" step="0.01" defaultValue={0} /></div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : "Cadastrar produto"}
        </button>
      </div>
    </form>
  );
}

export function MovimentacaoEstoqueForm({
  produtos,
}: {
  produtos: { id: string; nome: string }[];
}) {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            await movimentarEstoque(formData);
            f.setOk("Movimentação registrada.");
            e.currentTarget.reset();
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field">
        <label>Produto</label>
        <select name="produtoId" required defaultValue="">
          <option value="" disabled>Selecione</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Tipo</label>
        <select name="tipo" required defaultValue="entrada">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
          <option value="ajuste">Ajuste</option>
        </select>
      </div>
      <div className="field">
        <label>Quantidade</label>
        <input name="quantidade" type="number" step="0.001" min="0.001" required />
      </div>
      <div className="field">
        <label>Data</label>
        <input name="data" type="date" defaultValue={toInputDate()} />
      </div>
      <div className="field full">
        <label>Observação</label>
        <textarea name="observacao" rows={2} />
      </div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : "Registrar movimentação"}
        </button>
      </div>
    </form>
  );
}

export function CaixaManualForm() {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            await criarMovimentacaoCaixa(formData);
            f.setOk("Movimentação lançada.");
            e.currentTarget.reset();
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field">
        <label>Tipo</label>
        <select name="tipo" defaultValue="entrada">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>
      <div className="field">
        <label>Categoria</label>
        <input name="categoria" placeholder="Ex.: Outras entradas" />
      </div>
      <div className="field full">
        <label>Descrição</label>
        <input name="descricao" required />
      </div>
      <div className="field">
        <label>Valor</label>
        <input name="valor" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="field">
        <label>Data</label>
        <input name="data" type="date" defaultValue={toInputDate()} />
      </div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : "Lançar no caixa"}
        </button>
      </div>
    </form>
  );
}

export function ConfigForm({
  nomeEmpresa,
  saldoInicial,
}: {
  nomeEmpresa: string;
  saldoInicial: number;
}) {
  const f = useFeedback();
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        f.setErro("");
        f.setOk("");
        const formData = new FormData(e.currentTarget);
        f.startTransition(async () => {
          try {
            await atualizarConfiguracao(formData);
            f.setOk("Configurações salvas.");
          } catch (err) {
            f.setErro(err instanceof Error ? err.message : "Erro");
          }
        });
      }}
    >
      <div className="field">
        <label>Nome da empresa</label>
        <input name="nomeEmpresa" defaultValue={nomeEmpresa} required />
      </div>
      <div className="field">
        <label>Saldo inicial do caixa</label>
        <input name="saldoInicial" type="number" step="0.01" defaultValue={saldoInicial} />
      </div>
      {f.erro ? <div className="full" style={{ color: "var(--danger)" }}>{f.erro}</div> : null}
      {f.ok ? <div className="full" style={{ color: "var(--success)" }}>{f.ok}</div> : null}
      <div className="full">
        <button className="btn btn-primary" disabled={f.pending} type="submit">
          {f.pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
