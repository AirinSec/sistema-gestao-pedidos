

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


// ------------------------------------------------------------
// Botão Pedir - redireciona conforme sessão
// ------------------------------------------------------------
function adicionarAoPedido(id, nome , preco){
  const pedido = JSON.parse(localStorage.getItem('pedido')
) || [];
  
  const itemExistente = pedido.find(item => item.id === id

  );

  if (itemExistente) {
    itemExistente.quantidade += 1;

  } else {
    pedido.push({
      id,
      nome,
      preco,
      quantidade:1
    });

  }
  localStorage.setItem('pedido',
    JSON.stringify(pedido)
  );

  mostrarModalPedido(nome);

}

async function mostrarModalPedido(nome) {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;

  const modalExistente = document.getElementById('modalPedido');

  if (modalExistente) modalExistente.remove();

  const modal = document.createElement('div');
  modal.id = 'modalPedido';
  modal.className  = 'pedido-modal-overlay';

  const conteudoModal = session
    ? `
    <div class="pedido-modal" role="dialog" aria-modal="true"
          aria-labelledby="pedidoModalTitulo">
        <button type="button" class="pedido-modal__fechar"
                aria-label="Fechar">&times;</button>

        <div class="pedido-modal__icone">✓</div>

        <h2 id="pedidoModalTitulo">Adicionado ao carrinho!</h2>

        <p>
          <strong>${nome}</strong> foi adicionado ao seu carrinho.
        </p>

        <p>
          Você já está conectado à sua conta.
          Agora pode continuar escolhendo seus doces ou finalizar seu pedido.
        </p>

        <div class="pedido-modal__acoes">
          <a class="btn btn--primary" href="pedido.html">
            Finalizar pedido
          </a>
        </div>

        <button type="button" class="pedido-modal__continuar">
          Continuar escolhendo
        </button>

        <small>
          Seu pedido será registrado após a finalização.
        </small>
      </div>
    `
    : `
      <div class="pedido-modal" role="dialog" aria-modal="true"
          aria-labelledby="pedidoModalTitulo">
        <button type="button" class="pedido-modal__fechar"
                aria-label="Fechar">&times;</button>

        <div class="pedido-modal__icone">✓</div>

        <h2 id="pedidoModalTitulo">Adicionado ao carrinho!</h2>

        <p>
          <strong>${nome}</strong> foi adicionado ao seu carrinho.
        </p>

        <p>
          Para finalizar seu pedido, entre na sua conta ou
          cadastre-se gratuitamente.
        </p>

        <div class="pedido-modal__acoes">
          <a class="btn btn--primary" href="login.html">Entrar</a>
          <a class="btn btn--outline" href="cadastro.html">Cadastrar</a>
        </div>

        <button type="button" class="pedido-modal__continuar">
          Continuar escolhendo
        </button>

        <small>
          Seu pedido será registrado após a finalização.
        </small>
      </div>
    `;

    modal.innerHTML = conteudoModal;
    document.body.appendChild(modal);

    function fecharModal() {
      modal.remove();
    }

    modal.querySelector('.pedido-modal__fechar')
    .addEventListener('click', fecharModal);

    modal.querySelector('.pedido-modal__continuar')
    .addEventListener('click', fecharModal);

    modal.addEventListener('click', event => {
      if( event.target === modal) {
        fecharModal();
      }
    });
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