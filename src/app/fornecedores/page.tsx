import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import { FornecedorForm, ExcluirFornecedorButton } from "@/components/ModuleForms";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FornecedoresPage() {
  const fornecedores = await prisma.fornecedor.findMany({
    orderBy: { nome: "asc" },
    include: { contasPagar: true },
  });

  return (
    <div>
      <PageHeader title="Fornecedores" subtitle="Cadastro e histórico de pagamentos." />
      <div style={{ display: "grid", gap: "1rem" }}>
        <Panel title="Novo fornecedor">
          <FornecedorForm />
        </Panel>
        <Panel title="Lista">
          {fornecedores.length === 0 ? (
            <EmptyState message="Nenhum fornecedor cadastrado." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Documento</th>
                    <th>Contato</th>
                    <th>Produto</th>
                    <th>Total pago</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((f) => {
                    const pago = f.contasPagar
                      .filter((c) => c.status === "pago")
                      .reduce((s, c) => s + c.valor, 0);
                    return (
                      <tr key={f.id}>
                        <td>
                          <Link href={`/fornecedores/${f.id}`} style={{ color: "var(--brand)", fontWeight: 700 }}>
                            {f.nome}
                          </Link>
                        </td>
                        <td>{f.documento || "—"}</td>
                        <td>{f.whatsapp || f.telefone || "—"}</td>
                        <td>{f.produtoFornecido || "—"}</td>
                        <td>{formatMoney(pago)}</td>
                        <td style={{ display: "flex", gap: "0.4rem" }}>
                          <Link className="btn btn-secondary" href={`/fornecedores/${f.id}`}>
                            Abrir
                          </Link>
                          <ExcluirFornecedorButton id={f.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
