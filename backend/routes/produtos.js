const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  removerProduto,
} = require('../controllers/produto');

// Rotas públicas — sem autenticação
router.get('/', listarProdutos);
router.get('/:id', buscarProduto);

// Rotas protegidas — apenas admin
router.post('/', requireAdmin, criarProduto);
router.put('/:id', requireAdmin, atualizarProduto);
router.delete('/:id', requireAdmin, removerProduto);

module.exports = router;