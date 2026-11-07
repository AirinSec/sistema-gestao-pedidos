// ============================================================
//  Depende de: supabase-client.js, auth.js
// ============================================================

const API_URL = 'http://localhost:3000';

document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome          = document.getElementById('nome').value.trim();
  const email         = document.getElementById('email').value.trim();
  const senha         = document.getElementById('senha').value;
  const confirmar     = document.getElementById('confirmarSenha').value;
  const errorEl       = document.getElementById('cadastroError');
  const btn           = document.getElementById('cadastroBtn');

  errorEl.textContent = '';

  // Validações
  if (!nome || !email || !senha || !confirmar) {
    errorEl.textContent = 'Preencha todos os campos.';
    return;
  }

  if (senha.length < 6) {
    errorEl.textContent = 'A senha deve ter no mínimo 6 caracteres.';
    return;
  }

  if (senha !== confirmar) {
    errorEl.textContent = 'As senhas não coincidem.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Criando conta…';

  try {
    const res  = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.erro || 'Erro ao criar conta.';
      return;
    }

    // Cadastro OK - faz login automático e redireciona
    const { error: loginError } = await login(email, senha);

    if (loginError) {
      // Cadastro funcionou mas login falhou - manda para login manual
      window.location.href = 'login.html';
    }
    // Se login OK, auth.js já redireciona para index.html

  } catch (err) {
    errorEl.textContent = 'Erro de conexão com o servidor.';
    console.error(err);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Criar conta';
  }
});