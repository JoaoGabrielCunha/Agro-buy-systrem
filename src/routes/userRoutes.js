const express = require("express");
const router = express.Router();

const {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorEmail,
} = require("../controllers/userController");

router.post("/", criarUsuario);
router.get("/", listarUsuarios);
router.get("/:email", buscarUsuarioPorEmail);

module.exports = router;
