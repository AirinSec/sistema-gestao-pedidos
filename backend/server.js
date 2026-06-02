require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

// ------------------------------------------------------------
// Validação das variáveis de ambiente obrigatórias
// ------------------------------------------------------------
const { SUPABASE_URL, SUPABASE_SECRET_KEY, PORT = 3000 } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Erro: SUPABASE_URL e SUPABASE_SECRET_KEY são obrigatórios.');
  console.error('Copie o .env.example para .env e preencha com suas credenciais.');
  process.exit(1);
}

// ------------------------------------------------------------
// Cliente Supabase
// ------------------------------------------------------------
const { supabase } = require('./lib/supabase');

// ------------------------------------------------------------
// Configuração do servidor Express
// ------------------------------------------------------------
const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// Health check
// ------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    projeto: 'DoceGestor',
    versao: '1.0.0',
  });
});

// ------------------------------------------------------------
// Rotas
// ------------------------------------------------------------
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const cadastroRoutes = require('./routes/cadastro');

app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/cadastro', cadastroRoutes);

// ------------------------------------------------------------
// Inicialização
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, supabase };