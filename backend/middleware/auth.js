const { supabase } = require('../lib/supabase');

// ------------------------------------------------------------
// Função base - valida o token JWT e retorna o usuário
// Usada internamente pelos middlewares abaixo
// ------------------------------------------------------------
async function getAuthenticatedUser(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
    return null;
  }

  return data.user;
}

// ------------------------------------------------------------
// requireCustomer - qualquer usuário autenticado (admin ou customer)
// Usar em: POST /pedidos, GET /pedidos (filtragem por role dentro da rota)
// ------------------------------------------------------------
async function requireCustomer(req, res, next) {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  req.user = user;
  next();
}

// ------------------------------------------------------------
// requireAdmin - apenas usuários com role 'admin'
// Usar em: POST/PUT/DELETE /produtos, GET /pedidos (admin), PUT /pedidos/:id/status
// ------------------------------------------------------------
async function requireAdmin(req, res, next) {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  const role = user.user_metadata?.role;

  if (role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }

  req.user = user;
  next();
}

// ------------------------------------------------------------
// authenticateUser - mantido por compatibilidade
// Novo código deve usar requireAdmin ou requireCustomer
// ------------------------------------------------------------
async function authenticateUser(req, res, next) {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  req.user = user;
  next();
}

module.exports = { authenticateUser, requireCustomer, requireAdmin };