// ============================================================
//  Depende de: ../js/supabase-client.js, ../js/auth.js
// ============================================================

const API_URL = 'http://localhost:3000';

let todosPedidos = [];

(async () => {
  await exigirAdmin();
  document.body.classList.remove('protegida');
  await carregarPedidos();
  inicializarEventos();
})();

// ------------------------------------------------------------
// Carregar todos os pedidos
// ------------------------------------------------------------
async function carregarPedidos() {
  const loadingMsg = document.getElementById('loadingMsg');
  const tabelaWrap = document.getElementById('tabelaWrap');
  const token      = await getToken();

  try {
    const res  = await fetch(`${API_URL}/pedidos`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    todosPedidos = await res.json();

    loadingMsg.hidden = true;

    if (!todosPedidos.length) {
      loadingMsg.hidden      = false;
      loadingMsg.textContent = 'Nenhum pedido recebido ainda.';
      return;
    }

    tabelaWrap.hidden = false;
    renderTabela(todosPedidos);

  } catch (err) {
    loadingMsg.textContent = 'Erro ao carregar pedidos.';
    console.error(err);
  }
}

// ------------------------------------------------------------
// Renderizar tabela
// ------------------------------------------------------------
function renderTabela(pedidos) {
  const tbody = document.getElementById('pedidosBody');

  if (!pedidos.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">
          Nenhum pedido com este status.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = pedidos.map(renderLinha).join('');
}

function renderLinha(p) {
  const dataPedido  = new Date(p.data_pedido).toLocaleDateString('pt-BR');
  const dataEntrega = new Date(p.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR');
  const total       = Number(p.valor_total).toFixed(2).replace('.', ',');

  const statusLabel = { pendente: 'Pendente', confirmado: 'Confirmado', entregue: 'Entregue' }[p.status] ?? p.status;

  return `
    <tr>
      <td>#${p.id}</td>
      <td>
        <strong>${p.cliente_nome}</strong><br>
        <small style="color: var(--text-muted)">${p.telefone}</small>
      </td>
      <td>${dataPedido}</td>
      <td>${dataEntrega}</td>
      <td>R$ ${total}</td>
      <td>
        <select class="status-select" onchange="atualizarStatus(${p.id}, this.value)">
          <option value="pendente"   ${p.status === 'pendente'   ? 'selected' : ''}>⏳ Pendente</option>
          <option value="confirmado" ${p.status === 'confirmado' ? 'selected' : ''}>✅ Confirmado</option>
          <option value="entregue"   ${p.status === 'entregue'   ? 'selected' : ''}>📦 Entregue</option>
        </select>
      </td>
    </tr>
  `;
}

// ------------------------------------------------------------
// Atualizar status de um pedido
// ------------------------------------------------------------
async function atualizarStatus(id, status) {
  const token = await getToken();

  try {
    const res = await fetch(`${API_URL}/pedidos/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert('Erro ao atualizar status.');
      await carregarPedidos();
    } else {
      // Atualiza localmente sem recarregar tudo
      const pedido = todosPedidos.find(p => p.id === id);
      if (pedido) pedido.status = status;
    }

  } catch (err) {
    alert('Erro de conexão.');
    console.error(err);
  }
}

// ------------------------------------------------------------
// Filtro por status
// ------------------------------------------------------------
function filtrar() {
  const valor    = document.getElementById('filtroStatus').value;
  const filtrado = valor ? todosPedidos.filter(p => p.status === valor) : todosPedidos;
  renderTabela(filtrado);
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------
function inicializarEventos() {
  document.getElementById('filtroStatus').addEventListener('change', filtrar);
  document.getElementById('logoutBtn').addEventListener('click', logout);
}