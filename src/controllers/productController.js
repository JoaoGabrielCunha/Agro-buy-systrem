const path = require("path");
const fs = require("fs");
const {
  criarProdutoService,
  listarProdutosService,
  buscarProdutoPorIdService,
  atualizarProdutoService,
  comprarProdutoService,
  deletarProdutoService,
} = require("../services/productService");

async function criarProduto(req, res) {
  try {
    const { nome, preco, estoque, descricao, categoria, unidade } = req.body;

    if (!nome || !preco || !estoque || !categoria || !unidade) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: "Campos obrigatórios: nome, preco, estoque, categoria, unidade." });
    }

    const imagemPath = req.file ? `/uploads/produtos/${req.file.filename}` : null;
    const produto = await criarProdutoService({ nome, preco, estoque, descricao, categoria, unidade, imagemPath });

    return res.status(201).json(produto);
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    return res.status(500).json({ erro: "Erro interno ao criar produto." });
  }
}

async function listarProdutos(req, res) {
  try {
    const produtos = await listarProdutosService();
    return res.status(200).json(produtos);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    return res.status(500).json({ erro: "Erro ao listar produtos." });
  }
}

async function buscarProdutoPorId(req, res) {
  try {
    const produto = await buscarProdutoPorIdService(req.params.id);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado." });
    return res.status(200).json(produto);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return res.status(500).json({ erro: "Erro ao buscar produto." });
  }
}

async function atualizarProduto(req, res) {
  try {
    const { id } = req.params;
    const produto = await buscarProdutoPorIdService(id);

    if (!produto) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    const dados = { ...req.body };

    if (req.file) {
      if (produto.imagemPath) {
        const old = path.join(__dirname, "../../public", produto.imagemPath);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      dados.imagemPath = `/uploads/produtos/${req.file.filename}`;
    }

    const atualizado = await atualizarProdutoService(id, dados);
    return res.status(200).json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    return res.status(500).json({ erro: "Erro ao atualizar produto." });
  }
}

async function comprarProduto(req, res) {
  try {
    const { quantidade } = req.body;
    const qtd = Number(quantidade);

    if (!qtd || qtd <= 0 || !Number.isInteger(qtd)) {
      return res.status(400).json({ erro: "Quantidade deve ser um número inteiro positivo." });
    }

    const produto = await comprarProdutoService(req.params.id, qtd);
    return res.status(200).json(produto);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(400).json({ erro: "Estoque insuficiente ou produto não encontrado." });
    }
    console.error("Erro ao comprar produto:", err);
    return res.status(500).json({ erro: "Erro interno ao processar compra." });
  }
}

async function deletarProduto(req, res) {
  try {
    await deletarProdutoService(req.params.id);
    return res.status(200).json({ mensagem: "Produto deletado com sucesso." });
  } catch (err) {
    if (err.message === "PRODUTO_NAO_ENCONTRADO") {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }
    console.error("Erro ao deletar produto:", err);
    return res.status(500).json({ erro: "Erro ao deletar produto." });
  }
}

module.exports = { criarProduto, listarProdutos, buscarProdutoPorId, atualizarProduto, comprarProduto, deletarProduto };
