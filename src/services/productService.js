const {
  PutCommand,
  ScanCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const dynamo = require("../config/dynamoClient");

const TABLE_NAME = "Products";

async function criarProdutoService({ nome, preco, estoque, descricao, categoria, unidade, imagemPath }) {
  const produto = {
    id: uuidv4(),
    nome,
    preco: Number(preco),
    estoque: Number(estoque),
    descricao: descricao || "",
    categoria,
    unidade,
    imagemPath: imagemPath || null,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: produto }));
  return produto;
}

async function listarProdutosService() {
  const resultado = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));
  return resultado.Items || [];
}

async function buscarProdutoPorIdService(id) {
  const resultado = await dynamo.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );
  return resultado.Item;
}

async function atualizarProdutoService(id, dados) {
  const campos = ["nome", "preco", "estoque", "descricao", "categoria", "unidade", "imagemPath"];
  const sets = [];
  const names = {};
  const values = {};

  for (const campo of campos) {
    if (dados[campo] !== undefined) {
      sets.push(`#${campo} = :${campo}`);
      names[`#${campo}`] = campo;
      values[`:${campo}`] = campo === "preco" || campo === "estoque"
        ? Number(dados[campo])
        : dados[campo];
    }
  }

  sets.push("#atualizadoEm = :atualizadoEm");
  names["#atualizadoEm"] = "atualizadoEm";
  values[":atualizadoEm"] = new Date().toISOString();

  const resultado = await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET " + sets.join(", "),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return resultado.Attributes;
}

async function comprarProdutoService(id, quantidade) {
  const resultado = await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: "#estoque >= :qtd AND attribute_exists(id)",
      UpdateExpression: "SET #estoque = #estoque - :qtd, #atualizadoEm = :agora",
      ExpressionAttributeNames: {
        "#estoque": "estoque",
        "#atualizadoEm": "atualizadoEm",
      },
      ExpressionAttributeValues: {
        ":qtd": Number(quantidade),
        ":agora": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return resultado.Attributes;
}

async function deletarProdutoService(id) {
  const produto = await buscarProdutoPorIdService(id);
  if (!produto) throw new Error("PRODUTO_NAO_ENCONTRADO");

  if (produto.imagemPath) {
    const filePath = path.join(__dirname, "../../public", produto.imagemPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await dynamo.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
  return produto;
}

module.exports = {
  criarProdutoService,
  listarProdutosService,
  buscarProdutoPorIdService,
  atualizarProdutoService,
  comprarProdutoService,
  deletarProdutoService,
};
