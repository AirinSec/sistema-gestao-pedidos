const { supabase } = require('../lib/supabase');

// GET /produtos — lista todos os produtos ativos
async function listarProdutos(req, res) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (error) return res.status(500).json({ erro: error.message });

  res.json(data);
}

// GET /produtos/:id — retorna produto individual
async function buscarProduto(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Produto não encontrado.' });

  res.json(data);
}

// POST /produtos — cria novo produto
async function criarProduto(req, res) {
  const { nome, preco, descricao, imagem_url } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
  }

  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Preço deve ser um número maior ou igual a zero.' });
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, preco, descricao, imagem_url }])
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });

  res.status(201).json(data);
}

// PUT /produtos/:id — atualiza produto existente
async function atualizarProduto(req, res) {
  const { id } = req.params;
  const { nome, preco, descricao, imagem_url, ativo } = req.body;

  if (preco !== undefined && (typeof preco !== 'number' || preco < 0)) {
    return res.status(400).json({ erro: 'Preço deve ser um número maior ou igual a zero.' });
  }

  const { data, error } = await supabase
    .from('produtos')
    .update({ nome, preco, descricao, imagem_url, ativo })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });

  res.json(data);
}

// DELETE /produtos/:id — remove produto (marca como inativo)
async function removerProduto(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from('produtos')
    .update({ ativo: false })
    .eq('id', id);

  if (error) return res.status(500).json({ erro: error.message });

  res.status(204).send();
}

module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  removerProduto,
};