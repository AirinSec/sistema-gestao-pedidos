const { supabase } = require('../lib/supabase');

// ============================================================
// GET /produtos
// Lista todos os produtos ativos
// ============================================================

async function listarProdutos(req, res) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao listar produtos:', error);

      return res.status(500).json({
        erro: 'Não foi possível carregar os produtos.'
      });
    }

    return res.status(200).json(data || []);

  } catch (err) {
    console.error('Erro inesperado ao listar produtos:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// GET /produtos/:id
// Retorna produto individual
// ============================================================

async function buscarProduto(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        erro: 'ID do produto inválido.'
      });
    }

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        erro: 'Produto não encontrado.'
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Erro ao buscar produto:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// POST /produtos
// Cria novo produto
// ============================================================

async function criarProduto(req, res) {
  try {
    const {
      nome,
      preco,
      descricao,
      imagem_url
    } = req.body;


    // --------------------------------------------------------
    // Validar nome
    // --------------------------------------------------------

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        erro: 'O nome do produto é obrigatório.'
      });
    }


    // --------------------------------------------------------
    // Validar preço
    // --------------------------------------------------------

    if (
      preco === undefined ||
      preco === null ||
      typeof preco !== 'number' ||
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      return res.status(400).json({
        erro: 'Preço deve ser um número maior ou igual a zero.'
      });
    }


    // --------------------------------------------------------
    // Criar produto
    // --------------------------------------------------------

    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        nome: nome.trim(),
        preco,
        descricao: descricao?.trim() || null,
        imagem_url: imagem_url?.trim() || null
      }])
      .select()
      .single();
    
      if(
        descricao !== undefined &&
        descricao !== null &&

        (
            typeof descricao !== 'string' ||
            descricao.trim().length > 500
        )
      )
      {
        return res.status(400).json({
        erro: 'A descrição deve ser um texto de até 500 caravteres.'
        });
      }
      
    

    if (error) {
      console.error('Erro ao criar produto:', error);

      return res.status(500).json({
        erro: 'Não foi possível criar o produto.'
      });
    }


    return res.status(201).json(data);

  } catch (err) {
    console.error('Erro inesperado ao criar produto:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// PUT /produtos/:id
// Atualiza produto existente
// ============================================================

async function atualizarProduto(req, res) {
  try {
    const { id } = req.params;

    const {
      nome,
      preco,
      descricao,
      imagem_url,
      ativo
    } = req.body;
    // --------------------------------------------------------
    // Validar descrição
    // --------------------------------------------------------
    if (
        descricao !== undefined &&
        descricao !== null &&
      (
      typeof descricao !== 'string' ||
      descricao.trim().length > 500
      )
    ) {
    return res.status(400).json({
    erro: 'A descrição deve ser um texto de até 500 caracteres.'
    });
  }

    // --------------------------------------------------------
    // Validar ID
    // --------------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        erro: 'ID do produto inválido.'
      });
    }


    // --------------------------------------------------------
    // Validar nome
    // --------------------------------------------------------

  const nomeLimpo = nome.trim();
    if (!nomeLimpo || nomeLimpo.length > 100) {
      return res.status(400).json({
        erro: 'O nome do produto deve ter entre 1 e 100.'
      });
    }


    // --------------------------------------------------------
    // Validar preço
    // --------------------------------------------------------

    if (
      preco !== undefined &&
      (
        typeof preco !== 'number' ||
        !Number.isFinite(preco) ||
        preco < 0
      )
    ) {
      return res.status(400).json({
        erro: 'Preço deve ser um número maior ou igual a zero.'
      });
    }


    // --------------------------------------------------------
    // Validar ativo
    // --------------------------------------------------------

    if (
      ativo !== undefined &&
      typeof ativo !== 'boolean'
    ) {
      return res.status(400).json({
        erro: 'O campo ativo deve ser verdadeiro ou falso.'
      });
    }


    // --------------------------------------------------------
    // Montar somente os campos enviados
    // --------------------------------------------------------

    const atualizacao = {};

    if (nome !== undefined) {
      atualizacao.nome = nome.trim();
    }
    if (preco !== undefined) {
      atualizacao.preco = preco;
    }
    if (descricao !== undefined) {
      atualizacao.descricao =
        typeof descricao === 'string'
          ? descricao.trim()
          : descricao;
    }
    if (
      imagem_url !== undefined &&
      imagem_url !== null &&
      imagem_url.trim() !== ''
    ) {
      try {
        const url = new URL(imagem_url.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        return res.status(400).json({
          erro: 'A url da imagem é invalida'
        });
      }
    }
    if (ativo !== undefined) {
      atualizacao.ativo = ativo;
    }
    // Nenhum campo enviado
    if (!Object.keys(atualizacao).length) {
      return res.status(400).json({
        erro: 'Nenhum dado foi informado para atualização.'
      });
    }


    // --------------------------------------------------------
    // Atualizar produto
    // --------------------------------------------------------

    const { data, error } = await supabase
      .from('produtos')
      .update(atualizacao)
      .eq('id', id)
      .select()
      .single();


    if (error || !data) {
      return res.status(404).json({
        erro: 'Produto não encontrado.'
      });
    }


    return res.status(200).json(data);

  } catch (err) {
    console.error('Erro inesperado ao atualizar produto:', err);

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// DELETE /produtos/:id
// Remove produto logicamente
// Marca como inativo
// ============================================================

async function removerProduto(req, res) {
  try {
    const { id } = req.params;


    // --------------------------------------------------------
    // Validar ID
    // --------------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        erro: 'ID do produto inválido.'
      });
    }


    // --------------------------------------------------------
    // Verificar se o produto existe
    // --------------------------------------------------------

    const { data: produto, error: buscaError } = await supabase
      .from('produtos')
      .select('id, ativo')
      .eq('id', id)
      .single();


    if (buscaError || !produto) {
      return res.status(404).json({
        erro: 'Produto não encontrado.'
      });
    }


    // --------------------------------------------------------
    // Já está inativo
    // --------------------------------------------------------

    if (!produto.ativo) {
      return res.status(400).json({
        erro: 'Este produto já está inativo.'
      });
    }


    // --------------------------------------------------------
    // Desativar produto
    // --------------------------------------------------------

    const { error } = await supabase
      .from('produtos')
      .update({ ativo: false })
      .eq('id', id);


    if (error) {
      console.error('Erro ao remover produto:', error);

      return res.status(500).json({
        erro: 'Não foi possível remover o produto.'
      });
    }


    return res.status(204).send();

  } catch (err) {
    console.error('Erro inesperado ao remover produto:', err);

    return res.status(500).json({
    erro: 'Erro interno do servidor.'
    });
  }
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  removerProduto
};