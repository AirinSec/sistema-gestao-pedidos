const express = require('express');
const router = express.Router();
const { requireCustomer, requireAdmin } = require('../middleware/auth');
const { listarPedidos, buscarPedido, criarPedido, atualizarStatus } = require('../controllers/pedido');

// GET /pedidos — admin vê todos; customer vê os próprios (filtrado no controller)
router.get('/', requireCustomer, listarPedidos);

// GET /pedidos/:id — admin ou dono do pedido (verificado no controller)
router.get('/:id', requireCustomer, buscarPedido);

// POST /pedidos — customer autenticado registra pedido
router.post('/', requireCustomer, criarPedido);

// PUT /pedidos/:id/status — apenas admin
router.put('/:id/status', requireAdmin, atualizarStatus);

module.exports = router;