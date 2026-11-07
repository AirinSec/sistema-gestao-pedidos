// ============================================================
//  DoceGestor — Funções de autenticação
//  Depende de supabase-client.js carregado antes deste arquivo.
// ============================================================

// Login com e-mail e senha — redireciona por role após sucesso
async function login(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (!error && data.session) {
    const role = data.session.user.user_metadata?.role;
    window.location.href = role === 'admin' ? 'admin/dashboard.html' : 'index.html';
  }

  return { data, error };
}

// Logout — encerra a sessão e redireciona para a vitrine
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = window.location.pathname.includes('admin/') ? '../index.html' : 'index.html';
}

// Verifica sessão ativa — redireciona para login se não houver
// Chamar no topo de todas as páginas protegidas
async function exigirAutenticacao() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = window.location.pathname.includes('admin/') ? '../login.html' : 'login.html';
  }
  return data.session;
}

// Verifica sessão e role admin — redireciona se não for admin
// Chamar no topo de todas as páginas do painel admin
async function exigirAdmin() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = window.location.pathname.includes('admin/') ? '../login.html' : 'login.html';
    return null;
  }
  const role = data.session.user.user_metadata?.role;
  if (role !== 'admin') {
    window.location.href = window.location.pathname.includes('admin/') ? '../index.html' : 'index.html';
    return null;
  }
  return data.session;
}

// Retorna o token JWT da sessão atual
// Usado pelo frontend ao chamar a API do backend:
// headers: { Authorization: `Bearer ${await getToken()}` }
async function getToken() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session?.access_token ?? null;
}