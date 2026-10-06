import { prisma } from "@/lib/prisma";
import { PageHeader, Panel } from "@/components/ui";
import { ConfigForm } from "@/components/ModuleForms";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const config = await prisma.configuracao.findUnique({ where: { id: 1 } });

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Nome da empresa e saldo inicial do fluxo de caixa."
      />
      <Panel title="Empresa">
        <ConfigForm
          nomeEmpresa={config?.nomeEmpresa || "Minha Empresa"}
          saldoInicial={config?.saldoInicial || 0}
        />
      </Panel>
    </div>
  );
}
