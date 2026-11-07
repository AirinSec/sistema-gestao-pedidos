// ============================================================
//  DoceGestor — Meus Pedidos (cliente)
//  Depende de: supabase-client.js, auth.js
// ============================================================

const API_URL = 'http://localhost:3000';

(async () => {
  await exigirAutenticacao();
  document.body.classList.remove('protegida');
  await carregarPedidos();
  document.getElementById('logoutBtn').addEventListener('click', logout);
})();

async function carregarPedidos() {
  const loadingMsg = document.getElementById("loadingMsg");
  const listaEl = document.getElementById("pedidosList");
  const token = await getToken();

  try {

    const res = await fetch(`${API_URL}/pedidos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    let data = [];

    try {
      data = await res.json();
    } catch {
      data = [];
    }

    if (!res.ok) {

      switch (res.status) {

        case 401:
          loadingMsg.textContent =
            "Sua sessão expirou. Faça login novamente.";

          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);

          return;

        case 403:
          loadingMsg.textContent =
            "Você não tem permissão para acessar esta página.";
          return;

        case 500:
          loadingMsg.textContent =
            "Erro interno do servidor. Tente novamente mais tarde.";
          return;

        default:
          loadingMsg.textContent =
            data.erro || "Erro ao carregar pedidos.";
          return;

      }

    }

    loadingMsg.hidden = true;

    if (!data.length) {

      loadingMsg.hidden = false;

      loadingMsg.innerHTML =
        'Você ainda não fez nenhum pedido. <a href="pedido.html">Fazer pedido</a>';

      return;

    }

    listaEl.innerHTML = data.map(renderPedido).join("");

  } catch (err) {

    console.error(err);

    loadingMsg.textContent =
      "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente mais tarde.";

  }
}

function renderPedido(p) {
  const data = new Date(p.data_pedido).toLocaleDateString('pt-BR');
  const entrega = new Date(p.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR');
  const total = Number(p.valor_total).toFixed(2).replace('.', ',');

  const statusLabel = {
    pendente:   'Pendente',
    confirmado: 'Confirmado',
    entregue:   'Entregue',
  }[p.status] ?? p.status;

  const itens = (p.itens_pedido ?? [])
    .map(i => `<p class="pedido-card__item">${i.produto?.nome ?? 'Produto'}<span>x${i.quantidade}</span></p>`)
    .join('');

  return `
    <div class="pedido-card">
      <div class="pedido-card__header">
        <span class="pedido-card__id">Pedido #${p.id}</span>
        <span class="badge badge--${p.status}">${statusLabel}</span>
        <span class="pedido-card__data">Pedido em ${data}</span>
      </div>
      <div class="pedido-card__itens">${itens}</div>
      <div class="pedido-card__footer">
        <span class="pedido-card__total">R$ ${total}</span>
        <span class="pedido-card__entrega">Entrega desejada: ${entrega}</span>
      </div>
    </div>
  `;
}