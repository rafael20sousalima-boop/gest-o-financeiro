import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migração de userId...");

  // Buscar o usuário admin
  const admin = await prisma.user.findFirst({
    where: { role: "admin" }
  });

  if (!admin) {
    console.error("Nenhum usuário admin encontrado!");
    process.exit(1);
  }

  console.log(`Usando admin: ${admin.username} (${admin.id})`);

  // Atualizar todos os registros para associar ao admin
  const results = {
    clientes: 0,
    fornecedores: 0,
    produtos: 0,
    vendas: 0,
    contasReceber: 0,
    pagamentosReceber: 0,
    contasPagar: 0,
    movimentacoesEstoque: 0,
    movimentacoesCaixa: 0,
  };

  // Clientes
  const clientes = await prisma.cliente.updateMany({
    data: { userId: admin.id }
  });
  results.clientes = clientes.count;
  console.log(`Atualizados ${clientes.count} clientes`);

  // Fornecedores
  const fornecedores = await prisma.fornecedor.updateMany({
    data: { userId: admin.id }
  });
  results.fornecedores = fornecedores.count;
  console.log(`Atualizados ${fornecedores.count} fornecedores`);

  // Produtos
  const produtos = await prisma.produto.updateMany({
    data: { userId: admin.id }
  });
  results.produtos = produtos.count;
  console.log(`Atualizados ${produtos.count} produtos`);

  // Vendas
  const vendas = await prisma.venda.updateMany({
    data: { userId: admin.id }
  });
  results.vendas = vendas.count;
  console.log(`Atualizados ${vendas.count} vendas`);

  // Contas a Receber
  const contasReceber = await prisma.contaReceber.updateMany({
    data: { userId: admin.id }
  });
  results.contasReceber = contasReceber.count;
  console.log(`Atualizados ${contasReceber.count} contas a receber`);

  // Pagamentos a Receber
  const pagamentosReceber = await prisma.pagamentoReceber.updateMany({
    data: { userId: admin.id }
  });
  results.pagamentosReceber = pagamentosReceber.count;
  console.log(`Atualizados ${pagamentosReceber.count} pagamentos a receber`);

  // Contas a Pagar
  const contasPagar = await prisma.contaPagar.updateMany({
    data: { userId: admin.id }
  });
  results.contasPagar = contasPagar.count;
  console.log(`Atualizados ${contasPagar.count} contas a pagar`);

  // Movimentações de Estoque
  const movimentacoesEstoque = await prisma.movimentacaoEstoque.updateMany({
    data: { userId: admin.id }
  });
  results.movimentacoesEstoque = movimentacoesEstoque.count;
  console.log(`Atualizados ${movimentacoesEstoque.count} movimentações de estoque`);

  // Movimentações de Caixa
  const movimentacoesCaixa = await prisma.movimentacaoCaixa.updateMany({
    data: { userId: admin.id }
  });
  results.movimentacoesCaixa = movimentacoesCaixa.count;
  console.log(`Atualizados ${movimentacoesCaixa.count} movimentações de caixa`);

  console.log("\n=== Resumo da migração ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\nMigração concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
