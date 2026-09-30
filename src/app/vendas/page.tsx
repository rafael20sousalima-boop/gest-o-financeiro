import { prisma } from "@/lib/prisma";
import { ensureConfig } from "@/actions";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import { VendaForm, CancelarVendaButton } from "@/components/VendaForm";
import {
  badgeClass,
  formatDate,
  formatMoney,
  labelFormaPagamento,
  statusVendaLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  await ensureConfig();
  const [vendas, clientes, produtos] = await Promise.all([
    prisma.venda.findMany({
      include: { cliente: true },
      orderBy: { dataVenda: "desc" },
    }),
    prisma.cliente.findMany({ where: { status: "ativo" }, orderBy: { nome: "asc" } }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Vendas" subtitle="Registre vendas à vista ou fiado com cálculo automático." />

      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Nova venda">
          <VendaForm clientes={clientes} produtos={produtos} />
        </Panel>

        <Panel title="Histórico de vendas">
          {vendas.length === 0 ? (
            <EmptyState message="Nenhuma venda cadastrada ainda." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Qtd/Peso</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((v) => (
                    <tr key={v.id}>
                      <td>{formatDate(v.dataVenda)}</td>
                      <td>{v.cliente?.nome || "—"}</td>
                      <td>{v.produtoNome}</td>
                      <td>
                        {v.unidade === "kg"
                          ? `${v.pesoKg ?? 0} kg`
                          : `${v.quantidade} ${v.unidade}`}
                      </td>
                      <td>{formatMoney(v.valorTotal)}</td>
                      <td>{labelFormaPagamento(v.tipoPagamento)}</td>
                      <td>
                        <span className={`badge ${badgeClass(v.statusPagamento)}`}>
                          {statusVendaLabel(v.statusPagamento)}
                        </span>
                      </td>
                      <td>
                        {v.statusPagamento !== "cancelado" ? (
                          <CancelarVendaButton id={v.id} />
                        ) : null}
                      </td>
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
