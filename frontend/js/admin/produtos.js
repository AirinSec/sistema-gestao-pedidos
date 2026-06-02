// ============================================================
//  DoceGestor — Admin: Produtos
//  Depende de: ../js/supabase-client.js, ../js/auth.js
// ============================================================

const API_URL = 'http://localhost:3000';

(async () => {
  await exigirAdmin();
  document.body.classList.remove('protegida');
  await carregarProdutos();
  inicializarEventos();
})();

// ------------------------------------------------------------
// Carregar e renderizar produtos
// ------------------------------------------------------------
async function carregarProdutos() {
  const loadingMsg   = document.getElementById('loadingMsg');
  const produtosGrid = document.getElementById('produtosGrid');

  try {
    const res  = await fetch(`${API_URL}/produtos`);
    const data = await res.json();

    loadingMsg.hidden = true;

    if (!data.length) {
      loadingMsg.hidden      = false;
      loadingMsg.textContent = 'Nenhum produto cadastrado ainda.';
      return;
    }

    produtosGrid.innerHTML = data.map(renderCartao).join('');

  } catch (err) {
    loadingMsg.textContent = 'Erro ao carregar produtos.';
    console.error(err);
  }
}

function renderCartao(p) {
  const imagem = p.imagem_url
    ? `<img class="produto-card__img" src="${p.imagem_url}" alt="${p.nome}" />`
    : `<div class="produto-card__img-placeholder">🍰</div>`;

  return `
    <div class="produto-card">
      ${imagem}
      <div class="produto-card__body">
        <p class="produto-card__nome">${p.nome}</p>
        <p class="produto-card__preco">R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</p>
        ${p.descricao ? `<p class="produto-card__descricao">${p.descricao}</p>` : ''}
        <div class="produto-card__actions">
          <button class="btn btn--outline" onclick="abrirEdicao(${p.id})">Editar</button>
          <button class="btn btn--danger"  onclick="confirmarExclusao(${p.id}, '${p.nome}')">Excluir</button>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------
// Formulário — abrir para novo produto
// ------------------------------------------------------------
function abrirFormulario() {
  document.getElementById('formTitle').textContent    = 'Novo produto';
  document.getElementById('produtoId').value          = '';
  document.getElementById('produtoForm').reset();
  document.getElementById('formError').textContent    = '';
  document.getElementById('formPanel').hidden         = false;
  document.getElementById('nome').focus();
}

// ------------------------------------------------------------
// Formulário — abrir para edição
// ------------------------------------------------------------
async function abrirEdicao(id) {
  try {
    const res     = await fetch(`${API_URL}/produtos/${id}`);
    const produto = await res.json();

    document.getElementById('formTitle').textContent    = 'Editar produto';
    document.getElementById('produtoId').value          = produto.id;
    document.getElementById('nome').value               = produto.nome;
    document.getElementById('preco').value              = produto.preco;
    document.getElementById('descricao').value          = produto.descricao || '';
    document.getElementById('imagem_url').value         = produto.imagem_url || '';
    document.getElementById('formError').textContent    = '';
    document.getElementById('formPanel').hidden         = false;
    document.getElementById('nome').focus();

  } catch (err) {
    alert('Erro ao carregar produto para edição.');
    console.error(err);
  }
}

// ------------------------------------------------------------
// Fechar formulário
// ------------------------------------------------------------
function fecharFormulario() {
  document.getElementById('formPanel').hidden          = true;
  document.getElementById('produtoForm').reset();
  document.getElementById('formError').textContent     = '';
}

// ------------------------------------------------------------
// Salvar produto (criar ou editar)
// ------------------------------------------------------------
async function salvarProduto(e) {
  e.preventDefault();

  const id         = document.getElementById('produtoId').value;
  const nome       = document.getElementById('nome').value.trim();
  const preco      = parseFloat(document.getElementById('preco').value);
  const descricao  = document.getElementById('descricao').value.trim();
  const imagem_url = document.getElementById('imagem_url').value.trim();
  const errorEl    = document.getElementById('formError');
  const salvarBtn  = document.getElementById('salvarBtn');

  errorEl.textContent = '';

  if (!nome) { errorEl.textContent = 'Nome é obrigatório.'; return; }
  if (isNaN(preco) || preco < 0) { errorEl.textContent = 'Preço deve ser maior ou igual a zero.'; return; }

  const token   = await getToken();
  const metodo  = id ? 'PUT' : 'POST';
  const endpoint = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;

  salvarBtn.disabled    = true;
  salvarBtn.textContent = 'Salvando…';

  try {
    const res = await fetch(endpoint, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, preco, descricao: descricao || null, imagem_url: imagem_url || null }),
    });

    if (!res.ok) {
      const err = await res.json();
      errorEl.textContent = err.erro || 'Erro ao salvar produto.';
      return;
    }

    fecharFormulario();
    await carregarProdutos();

  } catch (err) {
    errorEl.textContent = 'Erro de conexão com o servidor.';
    console.error(err);
  } finally {
    salvarBtn.disabled    = false;
    salvarBtn.textContent = 'Salvar';
  }
}

// ------------------------------------------------------------
// Excluir produto — modal customizado
// ------------------------------------------------------------
function confirmarExclusao(id, nome) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <p class="modal__texto">Desativar <strong>${nome}</strong>?</p>
      <p class="modal__sub">O produto não aparecerá mais no catálogo.</p>
      <div class="modal__actions">
        <button class="btn btn--danger" id="confirmarBtn">Desativar</button>
        <button class="btn btn--outline" id="cancelarModalBtn">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cancelarModalBtn').addEventListener('click', () => modal.remove());
  document.getElementById('confirmarBtn').addEventListener('click', async () => {
    modal.remove();
    await excluirProduto(id);
  });
}

async function excluirProduto(id) {
  const token = await getToken();
  try {
    await fetch(`${API_URL}/produtos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    await carregarProdutos();
  } catch (err) {
    alert('Erro ao excluir produto.');
    console.error(err);
  }
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------
function inicializarEventos() {
  document.getElementById('novoProdutoBtn').addEventListener('click', abrirFormulario);
  document.getElementById('cancelarBtn').addEventListener('click', fecharFormulario);
  document.getElementById('produtoForm').addEventListener('submit', salvarProduto);
  document.getElementById('logoutBtn').addEventListener('click', logout);
}