const { loginService } = require("../services/authService");

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  try {
    const resultado = await loginService({ email, senha });
    return res.status(200).json(resultado);
  } catch (err) {
    if (err.message === "CREDENCIAIS_INVALIDAS") {
      return res.status(401).json({ erro: "Email ou senha inválidos." });
    }
    console.error("Erro no login:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

module.exports = { login };
