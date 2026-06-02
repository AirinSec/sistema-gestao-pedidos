const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// POST /cadastro - registra novo cliente
// Usa supabase.auth.admin que requer SUPABASE_SECRET_KEY no backend
router.post('/', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome,
      role: 'customer',
    },
  });

  if (error) {
    // E-mail já cadastrado
    if (error.message.includes('already been registered')) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json({ mensagem: 'Cadastro realizado com sucesso.' });
});

module.exports = router;