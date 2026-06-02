const { supabase } = require('../lib/supabase');

// ------------------------------------------------------------
// GET /pedidos
// Admin: retorna todos os pedidos
// Customer: retorna apenas os próprios pedidos
// ------------------------------------------------------------
async function listarPedidos(req, res) {
  const { role, id: userId } = req.user.user_metadata ?? {};
  const isAdmin = role === 'admin';

  let query = supabase
    .from('pedidos')
    .select(`
      *,
      itens_pedido (
        id,
        quantidade,
        preco_unitario,
        subtotal,
        produto:produtos ( id, nome )
      )
    `)
    .order('data_pedido', { ascending: false });

  // Customer só vê os próprios pedidos
  if (!isAdmin) {
    query = query.eq('usuario_id', req.user.id);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ erro: error.message });

  res.json(data);
}

// ------------------------------------------------------------
// GET /pedidos/:id
// Admin: qualquer pedido
// Customer: apenas o próprio
// ------------------------------------------------------------
async function buscarPedido(req, res) {
  const { id } = req.params;
  const { role } = req.user.user_metadata ?? {};
  const isAdmin = role === 'admin';

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      itens_pedido (
        id,
        quantidade,
        preco_unitario,
        subtotal,
        produto:produtos ( id, nome )
      )
    `)
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  // Customer não pode ver pedido de outro usuário
  if (!isAdmin && data.usuario_id !== req.user.id) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }

  res.json(data);
}

// ------------------------------------------------------------
// POST /pedidos — customer autenticado registra pedido
// usuario_id extraído do token, não do body
// ------------------------------------------------------------
async function criarPedido(req, res) {
  const { cliente_nome, telefone, endereco, data_entrega, itens } = req.body;

  if (!cliente_nome || !telefone || !endereco || !data_entrega || !itens?.length) {
    return res.status(400).json({ erro: 'Todos os campos e ao menos um item são obrigatórios.' });
  }

  // Calcular valor_total buscando preços do banco
  const ids = itens.map(i => i.produto_id);
  const { data: produtos, error: prodErr } = await supabase
    .from('produtos')
    .select('id, preco')
    .in('id', ids)
    .eq('ativo', true);

  if (prodErr || !produtos.length) {
    return res.status(400).json({ erro: 'Um ou mais produtos não encontrados ou inativos.' });
  }

  const precosMap = Object.fromEntries(produtos.map(p => [p.id, p.preco]));

  let valor_total = 0;
  const itensComPreco = itens.map(item => {
    const preco = precosMap[item.produto_id];
    if (!preco) throw new Error(`Produto ${item.produto_id} inválido.`);
    valor_total += preco * item.quantidade;
    return { produto_id: item.produto_id, quantidade: item.quantidade, preco_unitario: preco };
  });

  // Inserir pedido
  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos')
    .insert({
      usuario_id: req.user.id,
      cliente_nome,
      telefone,
      endereco,
      data_entrega,
      valor_total,
      status: 'pendente',
    })
    .select()
    .single();

  if (pedidoErr) return res.status(500).json({ erro: pedidoErr.message });

  // Inserir itens do pedido
  const { error: itensErr } = await supabase
    .from('itens_pedido')
    .insert(itensComPreco.map(i => ({ ...i, pedido_id: pedido.id })));

  if (itensErr) return res.status(500).json({ erro: itensErr.message });

  res.status(201).json(pedido);
}

// ------------------------------------------------------------
// PUT /pedidos/:id/status — apenas admin
// ------------------------------------------------------------
async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ['pendente', 'confirmado', 'entregue'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}.` });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  res.json(data);
}

module.exports = { listarPedidos, buscarPedido, criarPedido, atualizarStatus };