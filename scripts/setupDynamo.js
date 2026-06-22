const {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
  },
});

const tables = [
  {
    TableName: "Users",
    KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "email", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: "Products",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function setup() {
  console.log("Conectando ao DynamoDB local...\n");

  const { TableNames } = await client.send(new ListTablesCommand({}));

  for (const table of tables) {
    if (TableNames.includes(table.TableName)) {
      console.log(`✓ Tabela '${table.TableName}' já existe.`);
      continue;
    }
    await client.send(new CreateTableCommand(table));
    console.log(`✓ Tabela '${table.TableName}' criada com sucesso.`);
  }

  console.log("\nSetup concluído!");
}

setup().catch((err) => {
  console.error("Erro no setup:", err.message);
  process.exit(1);
});
