

const API_URL = 'http://localhost:3000';

(async () => {
  await renderizarHeader();
  await carregarProdutos();
})();

// ------------------------------------------------------------
// Header dinâmico - muda conforme sessão ativa
// ------------------------------------------------------------
async function renderizarHeader() {
  const nav = document.getElementById('headerNav');
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;

  if (!session) {
    // Visitante sem login
    nav.innerHTML = `
      <a class="app-header__link" href="login.html">Entrar</a>
      <a class="btn btn--primary" href="cadastro.html">Cadastrar</a>
    `;
    return;
  }

  const role = session.user.user_metadata?.role;

  if (role === 'admin') {
    nav.innerHTML = `
      <a class="app-header__link" href="admin/dashboard.html">Painel</a>
      <button class="btn btn--outline" id="logoutBtn" type="button">Sair</button>
    `;
  } else {
    nav.innerHTML = `
      <a class="app-header__link" href="meus-pedidos.html">Meus pedidos</a>
      <button class="btn btn--outline" id="logoutBtn" type="button">Sair</button>
    `;
  }

  document.getElementById('logoutBtn').addEventListener('click', logout);
}

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
      loadingMsg.textContent = 'Nenhum produto disponível no momento.';
      return;
    }

    produtosGrid.innerHTML = data.map(renderCartao).join('');

  } catch (err) {
    loadingMsg.textContent = 'Erro ao carregar produtos. Tente novamente mais tarde.';
    console.error(err);
  }
}
  function renderCartao(p) {
console.log(p)
  const imagem = p.imagem_url
    ? `<img class="produto-card__img" src="${p.imagem_url}" alt="${p.nome}" />`
    : `<div class="produto-card__img-placeholder">🍰</div>`;

  return `
    <div class="produto-card">

      ${imagem}

      <div class="produto-card__body">

        <p class="produto-card__nome">
          ${p.nome}
        </p>

        <p class="produto-card__preco">
          R$ ${Number(p.preco).toFixed(2).replace('.', ',')}
        </p>

        ${p.descricao
          ? `<p class="produto-card__descricao">${p.descricao}</p>`
          : ''
        }

        <div class="quantidade-box">

          <button
            class="qtd-btn"
            onclick="diminuirQuantidade(${p.id})">
            -
          </button>

          <span
            class="qtd-numero"
            id="qtd-${p.id}">
            1
          </span>

          <button
            class="qtd-btn"
            onclick="aumentarQuantidade(${p.id})">
            +
          </button>

        </div>

        <div class="produto-card__actions">

          <button
            class="produto-btn"
            onclick="adicionarAoPedido(${p.id}, '${p.nome}', ${p.preco})">

            Pedir
          </button>
        </div>
      </div>
    </div>
  `;
}

const quantidades = {};

function aumentarQuantidade(id) {
  if(!quantidades[id]) {
    quantidades[id] = 1;
  }

  quantidades[id]++;

  atualizarQuantidade(id);
}

function diminuirQuantidade(id) {
  if(!quantidades[id]) {
    quantidades[id] = 1; 
  }

  if(quantidades[id] > 1) {
    quantidades[id]--;
  }
  atualizarQuantidade(id);
}

function atualizarQuantidade(id) {
  document.getElementById(`qtd-${id}`).textContent =
  quantidades[id] || 1;
}
window.aumentarQuantidade = aumentarQuantidade;
window.diminuirQuantidade = diminuirQuantidade;
// ------------------------------------------------------------
// Botão Pedir - redireciona conforme sessão
// ------------------------------------------------------------

function adicionarAoPedido(id, nome, preco) {
  const quantidadeSelecionada = quantidades[id] || 1;

  const pedido = JSON.parse(
    localStorage.getItem('pedido')
  ) || [];

  pedido.push({
    id,
    nome,
    preco,
    quantidade: quantidadeSelecionada
  });

  localStorage.setItem(
    'pedido',
    JSON.stringify(pedido)
  );
  alert(
    `${quantidadeSelecionada}x ${nome} adicionado ao Pedido!`
  );
}







async function irParaPedido(produtoId) {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = 'login.html';
    return;
  }

  const role = data.session.user.user_metadata?.role;

  if (role === 'admin') {
    // Admin não faz pedidos - redireciona para o painel
    window.location.href = 'admin/dashboard.html';
    return;
  }

  window.location.href = 'pedido.html';
}