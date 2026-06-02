// ============================================================
//  Depende de: ../js/supabase-client.js, ../js/auth.js
// ============================================================

const API_URL = 'http://localhost:3000';

(async () => {
  await exigirAdmin();
  document.body.classList.remove('protegida');
  await carregarDashboard();
  document.getElementById('logoutBtn').addEventListener('click', logout);
})();

async function carregarDashboard() {
  const loadingMsg = document.getElementById('loadingMsg');
  const tabelaWrap = document.getElementById('tabelaWrap');
  const token      = await getToken();

  try {
    const res    = await fetch(`${API_URL}/pedidos`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const pedidos = await res.json();

    // Calcular totais por status
    const total      = pedidos.length;
    const pendente   = pedidos.filter(p => p.status === 'pendente').length;
    const confirmado = pedidos.filter(p => p.status === 'confirmado').length;
    const entregue   = pedidos.filter(p => p.status === 'entregue').length;

    document.getElementById('statTotal').textContent     = total;
    document.getElementById('statPendente').textContent  = pendente;
    document.getElementById('statConfirmado').textContent = confirmado;
    document.getElementById('statEntregue').textContent  = entregue;

    loadingMsg.hidden = true;

    if (!total) {
      loadingMsg.hidden      = false;
      loadingMsg.textContent = 'Nenhum pedido recebido ainda.';
      return;
    }

    // Exibir os 5 pedidos mais recentes
    const recentes = pedidos.slice(0, 5);
    tabelaWrap.hidden = false;
    document.getElementById('pedidosBody').innerHTML = recentes.map(renderLinha).join('');

  } catch (err) {
    loadingMsg.textContent = 'Erro ao carregar dados.';
    console.error(err);
  }
}

function renderLinha(p) {
  const data    = new Date(p.data_pedido).toLocaleDateString('pt-BR');
  const total   = Number(p.valor_total).toFixed(2).replace('.', ',');
  const label   = { pendente: '⏳ Pendente', confirmado: '✅ Confirmado', entregue: '📦 Entregue' }[p.status] ?? p.status;

  return `
    <tr>
      <td>#${p.id}</td>
      <td>${p.cliente_nome}</td>
      <td>${data}</td>
      <td>R$ ${total}</td>
      <td><span class="badge badge--${p.status}">${label}</span></td>
    </tr>
  `;
}