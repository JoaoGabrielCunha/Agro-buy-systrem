const {
  criarUsuarioService,
  listarUsuariosService,
  buscarUsuarioPorEmailService,
} = require("../services/userService");

async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({
        erro: "Nome, email, senha e tipo são obrigatórios.",
      });
    }

    const usuarioCriado = await criarUsuarioService({ nome, email, senha, tipo });

    res.status(201).json({
      mensagem: "Usuário criado com sucesso.",
      usuario: usuarioCriado,
    });
  } catch (erro) {
    console.error("Erro ao criar usuário:", erro);

    if (erro.name === "ConditionalCheckFailedException") {
      return res.status(409).json({ erro: "Já existe uma conta com esse e-mail." });
    }

    res.status(500).json({ erro: "Erro interno ao criar usuário." });
  }
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await listarUsuariosService();

    const usuariosSemSenha = usuarios.map(({ senhaHash, senha, ...dadosPublicos }) => dadosPublicos);

    res.status(200).json(usuariosSemSenha);
  } catch (erro) {
    console.error("Erro ao listar usuários:", erro);
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
}

async function buscarUsuarioPorEmail(req, res) {
  try {
    const { email } = req.params;

    const usuario = await buscarUsuarioPorEmailService(email);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const { senhaHash, senha, ...dadosPublicos } = usuario;

    res.status(200).json(dadosPublicos);
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
}

module.exports = { criarUsuario, listarUsuarios, buscarUsuarioPorEmail };