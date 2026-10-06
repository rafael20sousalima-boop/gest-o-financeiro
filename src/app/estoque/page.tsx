import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import { ProdutoForm, MovimentacaoEstoqueForm } from "@/components/ModuleForms";
import { formatDate, formatMoney, labelUnidade } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const [produtos, movimentacoes] = await Promise.all([
    prisma.produto.findMany({ orderBy: { nome: "asc" } }),
    prisma.movimentacaoEstoque.findMany({
      include: { produto: true },
      orderBy: { data: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Estoque"
        subtitle="Produtos, mínimos e movimentações. Vendas baixam o estoque automaticamente."
      />
      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Novo produto">
          <ProdutoForm />
        </Panel>
        <Panel title="Movimentação de estoque">
          <MovimentacaoEstoqueForm produtos={produtos.map((p) => ({ id: p.id, nome: p.nome }))} />
        </Panel>
        <Panel title="Produtos">
          {produtos.length === 0 ? (
            <EmptyState message="Nenhum produto cadastrado." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Unidade</th>
                    <th>Qtd</th>
                    <th>Mínimo</th>
                    <th>Custo</th>
                    <th>Preço</th>
                    <th>Alerta</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td>{p.categoria || "—"}</td>
                      <td>{labelUnidade(p.unidade)}</td>
                      <td>{p.quantidade}</td>
                      <td>{p.estoqueMinimo}</td>
                      <td>{formatMoney(p.custo)}</td>
                      <td>{formatMoney(p.precoVenda)}</td>
                      <td>
                        {p.quantidade <= p.estoqueMinimo ? (
                          <span className="badge badge-danger">Estoque baixo</span>
                        ) : (
                          <span className="badge badge-success">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title="Últimas movimentações">
          {movimentacoes.length === 0 ? (
            <EmptyState message="Sem movimentações." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Qtd</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDate(m.data)}</td>
                      <td>{m.produto.nome}</td>
                      <td>{m.tipo}</td>
                      <td>{m.quantidade}</td>
                      <td>{m.observacao || "—"}</td>
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
