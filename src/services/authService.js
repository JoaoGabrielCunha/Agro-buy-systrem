const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { buscarUsuarioPorEmailService } = require("./userService");

const JWT_SECRET = process.env.JWT_SECRET || "agro-secret-key-dev";

async function loginService({ email, senha }) {
  const usuario = await buscarUsuarioPorEmailService(email);

  if (!usuario) throw new Error("CREDENCIAIS_INVALIDAS");

  const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaCorreta) throw new Error("CREDENCIAIS_INVALIDAS");

  const token = jwt.sign(
    { email: usuario.email, nome: usuario.nome, tipo: usuario.tipo },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    usuario: {
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
    },
  };
}

module.exports = { loginService };
