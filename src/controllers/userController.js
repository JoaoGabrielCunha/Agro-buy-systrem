const {
  criarUsuarioService,
  listarUsuariosService,
  buscarUsuarioPorEmailService,
} = require("../services/userService");

async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ erro: "Campos obrigatórios: nome, email, senha, tipo." });
    }

    if (!["admin", "user"].includes(tipo)) {
      return res.status(400).json({ erro: "Tipo deve ser 'admin' ou 'user'." });
    }

    const usuario = await criarUsuarioService({ nome, email, senha, tipo });
    return res.status(201).json({ mensagem: "Usuário criado com sucesso.", usuario });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(409).json({ erro: "Já existe uma conta com esse e-mail." });
    }
    console.error("Erro ao criar usuário:", err);
    return res.status(500).json({ erro: "Erro interno ao criar usuário." });
  }
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await listarUsuariosService();
    const usuariosSemSenha = usuarios.map(({ senhaHash, ...dadosPublicos }) => dadosPublicos);
    return res.status(200).json(usuariosSemSenha);
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ erro: "Erro ao listar usuários." });
  }
}

async function buscarUsuarioPorEmail(req, res) {
  try {
    const usuario = await buscarUsuarioPorEmailService(req.params.email);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
    const { senhaHash, ...dadosPublicos } = usuario;
    return res.status(200).json(dadosPublicos);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
}

module.exports = { criarUsuario, listarUsuarios, buscarUsuarioPorEmail };
