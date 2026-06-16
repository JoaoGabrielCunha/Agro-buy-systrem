const express = require("express");
const router = express.Router();

const {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorEmail,
} = require("../controllers/userController");

router.post("/users", criarUsuario);
router.get("/users", listarUsuarios);
router.get("/users/:email", buscarUsuarioPorEmail);

module.exports = router;