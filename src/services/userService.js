const bcrypt = require("bcrypt");

const {
  PutCommand,
  ScanCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamo = require("../config/dynamoClient");

const TABLE_NAME = "Users";

async function criarUsuarioService({ nome, email, senha, tipo }) {
  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = {
    email,
    nome,
    tipo,
    senhaHash,
    criadoEm: new Date().toISOString(),
  };

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: usuario,
      ConditionExpression: "attribute_not_exists(email)",
    })
  );

  return {
    email: usuario.email,
    nome: usuario.nome,
    tipo: usuario.tipo,
    criadoEm: usuario.criadoEm,
  };
}

async function listarUsuariosService() {
  const resultado = await dynamo.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );

  return resultado.Items || [];
}

async function buscarUsuarioPorEmailService(email) {
  const resultado = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { email },
    })
  );

  return resultado.Item;
}

module.exports = {
  criarUsuarioService,
  listarUsuariosService,
  buscarUsuarioPorEmailService,
};
