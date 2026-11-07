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
    console.log("PEDIDOS:", todosPedidos);

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

  return `
    <tr>
      <td>#${p.id}</td>

      <td>
        <strong>${p.cliente_nome}</strong><br>
        <small style="color: var(--text-muted)">
          ${p.telefone}
        </small>
      </td>

      <td>${dataPedido}</td>
      <td>${dataEntrega}</td>
      <td>R$ ${total}</td>

      <td>
        <button
          class="btn btn--outline"
          onclick="abrirDetalhes(${p.id})">
          Ver
        </button>

        <br><br>

        <select
          class="status-select"
          onchange="atualizarStatus(${p.id}, this.value)">
          <option value="pendente"
            ${p.status === 'pendente' ? 'selected' : ''}>
            ⏳ Pendente
          </option>

          <option value="confirmado"
            ${p.status === 'confirmado' ? 'selected' : ''}>
            ✅ Confirmado
          </option>

          <option value="entregue"
            ${p.status === 'entregue' ? 'selected' : ''}>
            📦 Entregue
          </option>
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
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    let resposta = {};

    try {
      resposta = await res.json();
    } catch {
      resposta = {};
    }

    if (!res.ok) {

      switch (res.status) {

        case 400:
          alert(resposta.erro || "Status inválido.");
          break;

        case 401:
          alert("Sessão expirada. Faça login novamente.");
          break;

        case 403:
          alert("Você não tem permissão para realizar esta ação.");
          break;

        case 404:
          alert("Pedido não encontrado.");
          break;

        case 500:
          alert("Erro interno do servidor. Tente novamente mais tarde.");
          break;

        default:
          alert(resposta.erro || "Erro ao atualizar status.");

      }

      // Recarrega os pedidos para voltar ao estado correto
      await carregarPedidos();
      return;
    }

    // Atualiza localmente sem recarregar toda a página
    const pedido = todosPedidos.find(p => p.id === id);

    if (pedido) {
      pedido.status = status;
    }

  } catch (err) {

    console.error(err);
    alert("Não foi possível conectar ao servidor.");

  }
  
}

// ------------------------------------------------------------
// Filtro por status
// ------------------------------------------------------------
function filtrar() {
    const statusEl = document.getElementById('filtroStatus');
  const buscaEl = document.getElementById('buscaCliente');

  if (!statusEl || !buscaEl) {
    console.error('Elementos de filtro não encontrados.');
    return;
  }

  const status = statusEl.value;

  const busca = buscaEl.value
    .trim()
    .toLowerCase();

  const filtrados = todosPedidos.filter(p => {

    const correspondeStatus =
      !status || p.status === status;

    const nomeCliente =
      (p.cliente_nome || '').toLowerCase();

    const correspondeBusca =
      !busca || nomeCliente.includes(busca);

    return correspondeStatus && correspondeBusca;
  });

  renderTabela(filtrados);
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------

function abrirDetalhes(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  console.log("DETALHES PEDIDO:",pedido);

  if(!pedido) return;

  const itens = (pedido.itens_pedido || [])
  .map(i => `
    <li>
    ${i.produto?.nome || 'Produto'}
    - Quantidade: ${i.quantidade}
    </li>
    `)
    .join('');

    const modal = document.createElement('div');
    
    modal.className = 'modal-overlay';

    modal.innerHTML = `
    <div class="modal">

    <h2>Pedido # ${pedido.id}</h2>

    <p>
    <strong>Cliente:</strong>
    ${pedido.cliente_nome}
    </p>
    
    <p>
    <strong>Telefone:</strong>
    ${pedido.telefone}
    </p>
    
    <p>
    <strong>Endereço:</strong>
    ${pedido.endereco}
    </p>
    
    <p>
    <strong>Entrega:</strong>
    ${new Date(pedido.data_entrega + 'T00:00:00'

    ).toLocaleDateString('pt-br')}
    </p>
      <hr>

      <h3>Informações do evento</h3>
        
      <p>
      <strong>Tipo do evento:</strong>
      ${pedido.tipo_evento || 'Não informado'}
      </p>

      <p>
      <strong>Tema:</strong>
      ${pedido.tema || 'Não informado'}
      </p>

      <p>
      <strong>Quantidade de convidados:</strong>
      ${pedido.quantidade_convidados || 'Não informado'}
      </p>

      <p>
      <strong>Observações:</strong>
      ${pedido.observacoes || 'Sem observações'}
      <p>
      
    <hr>
    
    <h3>Itens do Pedido</he>
    
    <ul>
    ${itens || '<li>Nenhum item encontrado</li>'}
    </ul>
    
    <hr>
    
    <p>
    <strong> Total:</strong>
    R$ ${Number(pedido.valor_total)
      .toFixed(2)
      .replace('.', ',')}
      </p>
      
      <button
      class="btn btn--primary"
      id="fecharModal">
      fechar
      </button>
      
      </div>
      `;

      document.body.appendChild(modal);
      document
      .getElementById('fecharModal')
      .addEventListener('click', () => modal.remove());
}

function inicializarEventos() {
  const filtroStatus = document.getElementById('filtroStatus');
  const buscaCliente = document.getElementById('buscaCliente');
  const logoutBtn = document.getElementById('logoutBtn');

  if (filtroStatus) {
    filtroStatus.addEventListener('change', filtrar);
  }

  if (buscaCliente) {
    buscaCliente.addEventListener('input', filtrar);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}