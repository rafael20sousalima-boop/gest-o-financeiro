"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  calcValorVenda,
  parseInputDate,
  resolveStatusPagar,
  resolveStatusReceber,
} from "@/lib/utils";

async function syncStatuses() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const contasReceber = await prisma.contaReceber.findMany({
    where: { status: { not: "cancelado" } },
  });

  for (const conta of contasReceber) {
    const novo = resolveStatusReceber({
      status: conta.status,
      saldoRestante: conta.saldoRestante,
      valorRecebido: conta.valorRecebido,
      dataVencimento: conta.dataVencimento,
    });
    if (novo !== conta.status) {
      await prisma.contaReceber.update({
        where: { id: conta.id },
        data: { status: novo },
      });
    }
  }

  const contasPagar = await prisma.contaPagar.findMany({
    where: { status: { notIn: ["pago", "cancelado"] } },
  });

  for (const conta of contasPagar) {
    const novo = resolveStatusPagar({
      status: conta.status,
      dataVencimento: conta.dataVencimento,
      dataPagamento: conta.dataPagamento,
    });
    if (novo !== conta.status) {
      await prisma.contaPagar.update({
        where: { id: conta.id },
        data: { status: novo },
      });
    }
  }
}

export async function ensureConfig() {
  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nomeEmpresa: "Minha Empresa", saldoInicial: 0 },
  });
  await syncStatuses();
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string) {
  const raw = formString(formData, key).replace(",", ".");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function formOptionalDate(formData: FormData, key: string) {
  const raw = formString(formData, key);
  return raw ? parseInputDate(raw) : null;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

/* ===================== CLIENTES ===================== */

export async function criarCliente(formData: FormData) {
  const nome = formString(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.cliente.create({
    data: {
      nome,
      documento: formString(formData, "documento") || null,
      telefone: formString(formData, "telefone") || null,
      whatsapp: formString(formData, "whatsapp") || null,
      endereco: formString(formData, "endereco") || null,
      bairro: formString(formData, "bairro") || null,
      cidade: formString(formData, "cidade") || null,
      observacao: formString(formData, "observacao") || null,
      limiteCredito: formNumber(formData, "limiteCredito"),
      status: formString(formData, "status") || "ativo",
    },
  });
  revalidateAll();
}

export async function atualizarCliente(id: string, formData: FormData) {
  const nome = formString(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.cliente.update({
    where: { id },
    data: {
      nome,
      documento: formString(formData, "documento") || null,
      telefone: formString(formData, "telefone") || null,
      whatsapp: formString(formData, "whatsapp") || null,
      endereco: formString(formData, "endereco") || null,
      bairro: formString(formData, "bairro") || null,
      cidade: formString(formData, "cidade") || null,
      observacao: formString(formData, "observacao") || null,
      limiteCredito: formNumber(formData, "limiteCredito"),
      status: formString(formData, "status") || "ativo",
    },
  });
  revalidateAll();
}

export async function excluirCliente(id: string) {
  const vendas = await prisma.venda.count({ where: { clienteId: id } });
  const contas = await prisma.contaReceber.count({ where: { clienteId: id } });
  if (vendas || contas) {
    throw new Error("Não é possível excluir cliente com vendas ou contas vinculadas");
  }
  await prisma.cliente.delete({ where: { id } });
  revalidateAll();
}

/* ===================== FORNECEDORES ===================== */

export async function criarFornecedor(formData: FormData) {
  const nome = formString(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.fornecedor.create({
    data: {
      nome,
      documento: formString(formData, "documento") || null,
      telefone: formString(formData, "telefone") || null,
      whatsapp: formString(formData, "whatsapp") || null,
      endereco: formString(formData, "endereco") || null,
      produtoFornecido: formString(formData, "produtoFornecido") || null,
      observacao: formString(formData, "observacao") || null,
    },
  });
  revalidateAll();
}

export async function atualizarFornecedor(id: string, formData: FormData) {
  const nome = formString(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.fornecedor.update({
    where: { id },
    data: {
      nome,
      documento: formString(formData, "documento") || null,
      telefone: formString(formData, "telefone") || null,
      whatsapp: formString(formData, "whatsapp") || null,
      endereco: formString(formData, "endereco") || null,
      produtoFornecido: formString(formData, "produtoFornecido") || null,
      observacao: formString(formData, "observacao") || null,
    },
  });
  revalidateAll();
}

export async function excluirFornecedor(id: string) {
  const contas = await prisma.contaPagar.count({ where: { fornecedorId: id } });
  if (contas) {
    throw new Error("Não é possível excluir fornecedor com contas vinculadas");
  }
  await prisma.fornecedor.delete({ where: { id } });
  revalidateAll();
}

/* ===================== PRODUTOS / ESTOQUE ===================== */

export async function criarProduto(formData: FormData) {
  const nome = formString(formData, "nome");
  if (!nome) throw new Error("Nome do produto é obrigatório");

  const quantidade = formNumber(formData, "quantidade");

  const produto = await prisma.produto.create({
    data: {
      nome,
      categoria: formString(formData, "categoria") || null,
      unidade: formString(formData, "unidade") || "unidade",
      quantidade,
      estoqueMinimo: formNumber(formData, "estoqueMinimo"),
      custo: formNumber(formData, "custo"),
      precoVenda: formNumber(formData, "precoVenda"),
    },
  });

  if (quantidade > 0) {
    await prisma.movimentacaoEstoque.create({
      data: {
        produtoId: produto.id,
        tipo: "entrada",
        quantidade,
        observacao: "Estoque inicial",
      },
    });
  }

  revalidateAll();
}

export async function atualizarProduto(id: string, formData: FormData) {
  const nome = formString(formData, "nome");
  if (!nome) throw new Error("Nome do produto é obrigatório");

  await prisma.produto.update({
    where: { id },
    data: {
      nome,
      categoria: formString(formData, "categoria") || null,
      unidade: formString(formData, "unidade") || "unidade",
      estoqueMinimo: formNumber(formData, "estoqueMinimo"),
      custo: formNumber(formData, "custo"),
      precoVenda: formNumber(formData, "precoVenda"),
      ativo: formString(formData, "ativo") !== "false",
    },
  });
  revalidateAll();
}

export async function movimentarEstoque(formData: FormData) {
  const produtoId = formString(formData, "produtoId");
  const tipo = formString(formData, "tipo");
  const quantidade = formNumber(formData, "quantidade");
  const observacao = formString(formData, "observacao") || null;

  if (!produtoId || !tipo || quantidade <= 0) {
    throw new Error("Dados da movimentação inválidos");
  }

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) throw new Error("Produto não encontrado");

  let novaQtd = produto.quantidade;
  if (tipo === "entrada") novaQtd += quantidade;
  else if (tipo === "saida") novaQtd -= quantidade;
  else if (tipo === "ajuste") novaQtd = quantidade;
  else throw new Error("Tipo de movimentação inválido");

  if (novaQtd < 0) throw new Error("Estoque insuficiente");

  await prisma.$transaction([
    prisma.produto.update({
      where: { id: produtoId },
      data: { quantidade: novaQtd },
    }),
    prisma.movimentacaoEstoque.create({
      data: {
        produtoId,
        tipo,
        quantidade: tipo === "ajuste" ? novaQtd : quantidade,
        observacao,
        data: formOptionalDate(formData, "data") || new Date(),
      },
    }),
  ]);

  revalidateAll();
}

/* ===================== VENDAS ===================== */

export async function criarVenda(formData: FormData) {
  const produtoId = formString(formData, "produtoId") || null;
  const clienteId = formString(formData, "clienteId") || null;
  const unidade = formString(formData, "unidade") || "unidade";
  const quantidade = formNumber(formData, "quantidade") || 1;
  const pesoKg = formNumber(formData, "pesoKg") || null;
  const precoPorKg = formNumber(formData, "precoPorKg") || null;
  const valorUnitario = formNumber(formData, "valorUnitario");
  const tipoPagamento = formString(formData, "tipoPagamento");
  const dataVenda = formOptionalDate(formData, "dataVenda") || new Date();
  const dataVencimento = formOptionalDate(formData, "dataVencimento");
  const observacao = formString(formData, "observacao") || null;

  if (!tipoPagamento) throw new Error("Forma de pagamento é obrigatória");

  let produtoNome = formString(formData, "produtoNome");
  let produto = null as Awaited<ReturnType<typeof prisma.produto.findUnique>>;

  if (produtoId) {
    produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) throw new Error("Produto não encontrado");
    produtoNome = produto.nome;
  }

  if (!produtoNome) throw new Error("Informe o produto");

  // Validação específica para vendas por KG
  if (unidade === "kg") {
    if (!pesoKg || pesoKg <= 0) {
      throw new Error("Informe o peso em KG para vender por quilo");
    }
    if (!precoPorKg || precoPorKg <= 0) {
      throw new Error("Informe o preço por KG");
    }
  }

  const valorTotal = calcValorVenda({
    unidade,
    quantidade,
    valorUnitario,
    pesoKg,
    precoPorKg,
  });

  if (valorTotal <= 0) throw new Error("Valor total inválido");

  const isFiado = tipoPagamento === "fiado";
  const statusPagamento = isFiado ? "fiado" : "pago";

  const qtdEstoque =
    unidade === "kg" ? Number(pesoKg || 0) : Number(quantidade || 0);

  if (produto && qtdEstoque > 0 && produto.quantidade < qtdEstoque) {
    throw new Error("Estoque insuficiente para esta venda");
  }

  const venda = await prisma.$transaction(async (tx) => {
    const novaVenda = await tx.venda.create({
      data: {
        dataVenda,
        clienteId: clienteId || null,
        produtoId: produtoId || null,
        produtoNome,
        quantidade,
        unidade,
        pesoKg: unidade === "kg" ? pesoKg : null,
        precoPorKg: unidade === "kg" ? precoPorKg : null,
        valorUnitario: unidade === "kg" ? Number(precoPorKg || 0) : valorUnitario,
        valorTotal,
        tipoPagamento,
        statusPagamento,
        dataVencimento: isFiado ? dataVencimento : null,
        observacao,
      },
    });

    if (produto && qtdEstoque > 0) {
      await tx.produto.update({
        where: { id: produto.id },
        data: { quantidade: { decrement: qtdEstoque } },
      });
      await tx.movimentacaoEstoque.create({
        data: {
          produtoId: produto.id,
          tipo: "saida",
          quantidade: qtdEstoque,
          vendaId: novaVenda.id,
          observacao: `Venda ${novaVenda.id.slice(-6)}`,
          data: dataVenda,
        },
      });
    }

    if (isFiado) {
      if (!clienteId) throw new Error("Cliente é obrigatório para venda fiado");

      await tx.contaReceber.create({
        data: {
          clienteId,
          vendaId: novaVenda.id,
          dataVenda,
          descricao: `Venda fiado - ${produtoNome}`,
          valorOriginal: valorTotal,
          valorRecebido: 0,
          saldoRestante: valorTotal,
          dataVencimento,
          status: resolveStatusReceber({
            saldoRestante: valorTotal,
            valorRecebido: 0,
            dataVencimento,
          }),
          observacao,
        },
      });
    }

    return novaVenda;
  });

  revalidateAll();
  return venda.id;
}

export async function cancelarVenda(id: string) {
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { contaReceber: true, movimentacoes: true },
  });
  if (!venda) throw new Error("Venda não encontrada");
  if (venda.statusPagamento === "cancelado") return;

  await prisma.$transaction(async (tx) => {
    await tx.venda.update({
      where: { id },
      data: { statusPagamento: "cancelado" },
    });

    if (venda.contaReceber && venda.contaReceber.status !== "pago") {
      await tx.contaReceber.update({
        where: { id: venda.contaReceber.id },
        data: { status: "cancelado", saldoRestante: 0 },
      });
    }

    for (const mov of venda.movimentacoes.filter((m) => m.tipo === "saida")) {
      await tx.produto.update({
        where: { id: mov.produtoId },
        data: { quantidade: { increment: mov.quantidade } },
      });
      await tx.movimentacaoEstoque.create({
        data: {
          produtoId: mov.produtoId,
          tipo: "entrada",
          quantidade: mov.quantidade,
          observacao: `Estorno venda cancelada ${id.slice(-6)}`,
        },
      });
    }
  });

  revalidateAll();
}

/* ===================== CONTAS A RECEBER ===================== */

export async function criarContaReceber(formData: FormData) {
  const clienteId = formString(formData, "clienteId");
  const descricao = formString(formData, "descricao");
  const valorOriginal = formNumber(formData, "valorOriginal");
  const dataVenda = formOptionalDate(formData, "dataVenda") || new Date();
  const dataVencimento = formOptionalDate(formData, "dataVencimento");

  if (!clienteId || !descricao || valorOriginal <= 0) {
    throw new Error("Preencha cliente, descrição e valor");
  }

  await prisma.contaReceber.create({
    data: {
      clienteId,
      dataVenda,
      descricao,
      valorOriginal,
      valorRecebido: 0,
      saldoRestante: valorOriginal,
      dataVencimento,
      status: resolveStatusReceber({
        saldoRestante: valorOriginal,
        valorRecebido: 0,
        dataVencimento,
      }),
      observacao: formString(formData, "observacao") || null,
    },
  });

  revalidateAll();
}

export async function registrarPagamentoReceber(formData: FormData) {
  const contaId = formString(formData, "contaId");
  const valor = formNumber(formData, "valor");
  const formaPagamento = formString(formData, "formaPagamento");
  const dataPagamento = formOptionalDate(formData, "dataPagamento") || new Date();
  const observacao = formString(formData, "observacao") || null;

  if (!contaId || valor <= 0 || !formaPagamento) {
    throw new Error("Informe conta, valor e forma de pagamento");
  }

  const conta = await prisma.contaReceber.findUnique({ where: { id: contaId } });
  if (!conta) throw new Error("Conta não encontrada");
  if (conta.status === "cancelado") throw new Error("Conta cancelada");
  if (conta.status === "pago") throw new Error("Conta já está paga");
  if (valor > conta.saldoRestante + 0.009) {
    throw new Error("Valor maior que o saldo restante");
  }

  const valorRecebido = Number((conta.valorRecebido + valor).toFixed(2));
  const saldoRestante = Number((conta.valorOriginal - valorRecebido).toFixed(2));
  const status = resolveStatusReceber({
    saldoRestante,
    valorRecebido,
    dataVencimento: conta.dataVencimento,
  });

  await prisma.$transaction(async (tx) => {
    await tx.pagamentoReceber.create({
      data: {
        contaId,
        clienteId: conta.clienteId,
        valor,
        dataPagamento,
        formaPagamento,
        observacao,
      },
    });

    await tx.contaReceber.update({
      where: { id: contaId },
      data: { valorRecebido, saldoRestante, status },
    });

    if (conta.vendaId) {
      await tx.venda.update({
        where: { id: conta.vendaId },
        data: {
          statusPagamento:
            status === "pago" ? "pago" : status === "parcialmente_pago" ? "parcial" : "fiado",
        },
      });
    }
  });

  revalidateAll();
}

export async function cancelarContaReceber(id: string) {
  await prisma.contaReceber.update({
    where: { id },
    data: { status: "cancelado" },
  });
  revalidateAll();
}

/* ===================== CONTAS A PAGAR ===================== */

export async function criarContaPagar(formData: FormData) {
  const descricao = formString(formData, "descricao");
  const categoria = formString(formData, "categoria");
  const valor = formNumber(formData, "valor");
  const dataVencimento = formOptionalDate(formData, "dataVencimento");
  const fornecedorId = formString(formData, "fornecedorId") || null;

  if (!descricao || !categoria || !dataVencimento || valor <= 0) {
    throw new Error("Preencha descrição, categoria, vencimento e valor");
  }

  const status = resolveStatusPagar({
    dataVencimento,
  });

  await prisma.contaPagar.create({
    data: {
      descricao,
      categoria,
      fornecedorId,
      dataVencimento,
      valor,
      status,
      observacao: formString(formData, "observacao") || null,
    },
  });

  revalidateAll();
}

export async function pagarContaPagar(formData: FormData) {
  const id = formString(formData, "id");
  const formaPagamento = formString(formData, "formaPagamento");
  const dataPagamento = formOptionalDate(formData, "dataPagamento") || new Date();

  if (!id || !formaPagamento) {
    throw new Error("Informe a conta e a forma de pagamento");
  }

  await prisma.contaPagar.update({
    where: { id },
    data: {
      status: "pago",
      formaPagamento,
      dataPagamento,
    },
  });

  revalidateAll();
}

export async function cancelarContaPagar(id: string) {
  await prisma.contaPagar.update({
    where: { id },
    data: { status: "cancelado" },
  });
  revalidateAll();
}

/* ===================== CAIXA MANUAL ===================== */

export async function criarMovimentacaoCaixa(formData: FormData) {
  const tipo = formString(formData, "tipo");
  const categoria = formString(formData, "categoria");
  const descricao = formString(formData, "descricao");
  const valor = formNumber(formData, "valor");
  const data = formOptionalDate(formData, "data") || new Date();

  if (!["entrada", "saida"].includes(tipo) || !descricao || valor <= 0) {
    throw new Error("Dados inválidos para movimentação de caixa");
  }

  await prisma.movimentacaoCaixa.create({
    data: {
      tipo,
      categoria: categoria || (tipo === "entrada" ? "Outras entradas" : "Outras saídas"),
      descricao,
      valor,
      data,
      observacao: formString(formData, "observacao") || null,
    },
  });

  revalidateAll();
}

export async function atualizarConfiguracao(formData: FormData) {
  await ensureConfig();
  await prisma.configuracao.update({
    where: { id: 1 },
    data: {
      nomeEmpresa: formString(formData, "nomeEmpresa") || "Minha Empresa",
      saldoInicial: formNumber(formData, "saldoInicial"),
    },
  });
  revalidateAll();
}
