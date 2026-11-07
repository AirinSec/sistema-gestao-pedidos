const { supabase } = require('../lib/supabase');

// ============================================================
// GET /pedidos
// Admin: retorna todos os pedidos
// Cliente: retorna apenas os próprios pedidos
// ============================================================

async function listarPedidos(req, res) {
  try {
    const role = req.user?.app_metadata?.role;
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
          produto:produtos (
            id,
            nome
          )
        )
      `)
      .order('data_pedido', { ascending: false });

    // Cliente só vê os próprios pedidos
    if (!isAdmin) {
      query = query.eq('usuario_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar pedidos:', error);

      return res.status(500).json({
        erro: 'Não foi possível carregar os pedidos.'
      });
    }

    return res.status(200).json(data || []);

  } catch (err) {
    console.error('Erro inesperado ao listar pedidos:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// GET /pedidos/:id
// Admin: qualquer pedido
// Cliente: apenas o próprio pedido
// ============================================================

async function buscarPedido(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        erro: 'ID do pedido inválido.'
      });
    }

    const role = req.user?.app_metadata?.role;
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
          produto:produtos (
            id,
            nome
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        erro: 'Pedido não encontrado.'
      });
    }

    // Cliente não pode acessar pedido de outro usuário
    if (!isAdmin && data.usuario_id !== req.user.id) {
      return res.status(403).json({
        erro: 'Você não tem permissão para acessar este pedido.'
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Erro ao buscar pedido:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// POST /pedidos
// Cliente autenticado registra pedido
// usuario_id é retirado do token
// ============================================================
async function criarPedido(req, res) {
  const {
    cliente_nome,
    telefone,
    endereco,
    data_entrega,
    itens,
    tipo_evento,
    tema,
    quantidade_convidados,
    observacoes
  } = req.body;

  // =========================
  // VALIDAÇÕES BÁSICAS
  // =========================

  if (
    typeof cliente_nome !== 'string' ||
    !cliente_nome.trim()
  ) {
    return res.status(400).json({
      erro: 'Nome do cliente é obrigatório.'
    });
  }

  if (
    typeof telefone !== 'string' ||
    !telefone.trim()
  ) {
    return res.status(400).json({
      erro: 'Telefone é obrigatório.'
    });
  }

  if (
    typeof endereco !== 'string' ||
    !endereco.trim()
  ) {
    return res.status(400).json({
      erro: 'Endereço é obrigatório.'
    });
  }

  // =========================
  // VALIDAÇÃO DO TELEFONE
  // =========================

  const telefoneLimpo = telefone.replace(/\D/g, '');

  if (
    telefoneLimpo.length < 10 ||
    telefoneLimpo.length > 11
  ) {
    return res.status(400).json({
      erro: 'Telefone inválido.'
    });
  }

  // =========================
  // VALIDAÇÃO DA DATA
  // =========================

  if (
    typeof data_entrega !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data_entrega)
  ) {
    return res.status(400).json({
      erro: 'Data de entrega inválida.'
    });
  }

  const dataEntrega = new Date(`${data_entrega}T00:00:00`);

  if (Number.isNaN(dataEntrega.getTime())) {
    return res.status(400).json({
      erro: 'Data de entrega inválida.'
    });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (dataEntrega < hoje) {
    return res.status(400).json({
      erro: 'A data de entrega não pode estar no passado.'
    });
  }

  // =========================
  // VALIDAÇÃO DOS ITENS
  // =========================

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: 'O pedido deve possuir ao menos um item.'
    });
  }

  for (const item of itens) {
    if (
      !item ||
      item.produto_id === undefined ||
      item.produto_id === null
    ) {
      return res.status(400).json({
        erro: 'Produto inválido no pedido.'
      });
    }

    if (
      !Number.isInteger(item.quantidade) ||
      item.quantidade <= 0
    ) {
      return res.status(400).json({
        erro: 'A quantidade dos produtos deve ser um número inteiro maior que zero.'
      });
    }
  }

  // =========================
  // QUANTIDADE DE CONVIDADOS
  // =========================

  if (
    quantidade_convidados !== undefined &&
    quantidade_convidados !== null
  ) {
    if (
      !Number.isInteger(quantidade_convidados) ||
      quantidade_convidados < 0
    ) {
      return res.status(400).json({
        erro: 'Quantidade de convidados inválida.'
      });
    }
  }

  // =========================
  // BUSCAR PRODUTOS
  // =========================

  const ids = itens.map(item => item.produto_id);

  const { data: produtos, error: prodErr } = await supabase
    .from('produtos')
    .select('id, preco')
    .in('id', ids)
    .eq('ativo', true);

  if (prodErr) {
    return res.status(500).json({
      erro: 'Erro ao consultar os produtos.'
    });
  }

  if (!produtos || produtos.length !== ids.length) {
    return res.status(400).json({
      erro: 'Um ou mais produtos não foram encontrados ou estão inativos.'
    });
  }

  // =========================
  // CALCULAR TOTAL
  // =========================

  const precosMap = Object.fromEntries(
    produtos.map(p => [p.id, p.preco])
  );

  let valor_total = 0;

  const itensComPreco = itens.map(item => {
    const preco = precosMap[item.produto_id];

    if (preco === undefined || preco === null) {
      throw new Error(`Produto ${item.produto_id} inválido.`);
    }

    valor_total += preco * item.quantidade;

    return {
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: preco
    };
  });

  // =========================
  // CRIAR PEDIDO
  // =========================

try {
  const { data: pedido, error} = await supabase.rpc('criar_pedido_com_itens',
    {
      p_usuario_id: req.user.id,
        p_cliente_nome: cliente_nome.trim(),
        p_telefone: telefone.trim(),
        p_endereco: endereco.trim(),
        p_data_entrega: data_entrega,
        p_tipo_evento: tipo_evento?.trim() || null,
        p_tema: tema?.trim() || null,
        p_quantidade_convidados: quantidade_convidados ?? null,
        p_observacoes: observacoes?.trim() || null,
        p_valor_total: valor_total,
        p_itens: itensComPreco
    }
  );

  if (error) {
    console.error('Erro ao criar pedido e itens:', error);

    return res.status(500).json({
      erro: 'Não foi possivel criar o pedido. Nenhum dado foi salvo parcialmente.'
    });
  }

  return res.status(201).json(pedido);

} catch (err){

  console.error('Erro inesperado ao criar pedido:',err);

  return res.status(500).json({
    erro: 'Erro interno ao criar o pedido.'
  });
}
}
// ============================================================
// PUT /pedidos/:id/status
// Apenas Admin
// ============================================================

async function atualizarStatus(req, res) {
  try {

    const { id } = req.params;
    const { status } = req.body;


    // --------------------------------------------------------
    // Validar ID
    // --------------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        erro: 'ID do pedido inválido.'
      });
    }


    // --------------------------------------------------------
    // Validar status
    // --------------------------------------------------------

    const statusValidos = [
      'pendente',
      'confirmado',
      'entregue'
    ];


    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        erro: `Status inválido. Use: ${statusValidos.join(', ')}.`
      });
    }


    // --------------------------------------------------------
    // Atualizar pedido
    // --------------------------------------------------------

    const { data, error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();


    if (error || !data) {
      console.error('Erro ao atualizar status:', error);

      return res.status(404).json({
        erro: 'Pedido não encontrado.'
      });
    }


    return res.status(200).json(data);

  } catch (err) {

    console.error('Erro inesperado ao atualizar status:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatus
};