const express = require("express");
const router = express.Router();

const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");
const {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  comprarProduto,
  deletarProduto,
} = require("../controllers/productController");

router.get("/", listarProdutos);
router.get("/:id", buscarProdutoPorId);
router.post("/", verificarToken, apenasAdmin, upload.single("imagem"), criarProduto);
router.post("/:id/compra", verificarToken, comprarProduto);
router.put("/:id", verificarToken, apenasAdmin, upload.single("imagem"), atualizarProduto);
router.delete("/:id", verificarToken, apenasAdmin, deletarProduto);

module.exports = router;
