// ============================================================
//  DoceGestor — Pedido do cliente
//  Depende de: supabase-client.js, auth.js
// ============================================================

const API_URL = 'http://localhost:3000';

// Mapa de quantidades: { produto_id: quantidade }
const quantidades = {};

(async () => {
  await exigirAutenticacao();
  document.body.classList.remove('protegida');
  definirDataMinima();
  await carregarProdutos();
  inicializarEventos();
})();

// ------------------------------------------------------------
// Define data mínima de entrega como amanhã
// ------------------------------------------------------------
function definirDataMinima() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  document.getElementById('dataEntrega').min = amanha.toISOString().split('T')[0];
}

// ------------------------------------------------------------
// Carregar produtos disponíveis
// ------------------------------------------------------------
async function carregarProdutos() {
  const loadingEl  = document.getElementById('loadingProdutos');
  const listaEl    = document.getElementById('produtosList');

  try {
    const res  = await fetch(`${API_URL}/produtos`);
    const data = await res.json();

    loadingEl.hidden = true;

    if (!data.length) {
      loadingEl.hidden      = false;
      loadingEl.textContent = 'Nenhum produto disponível no momento.';
      return;
    }

    listaEl.innerHTML = data.map(renderItem).join('');

  } catch (err) {
    loadingEl.textContent = 'Erro ao carregar produtos.';
    console.error(err);
  }
}

function renderItem(p) {
  const imagem = p.imagem_url
    ? `<img class="produto-item__img" src="${p.imagem_url}" alt="${p.nome}" />`
    : `<div class="produto-item__img-placeholder">🍰</div>`;

  return `
    <div class="produto-item">
      ${imagem}
      <div class="produto-item__info">
        <p class="produto-item__nome">${p.nome}</p>
        <p class="produto-item__preco">R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</p>
      </div>
      <div class="produto-item__qty">
        <button class="qty-btn" onclick="alterarQty(${p.id}, ${p.preco}, -1)">−</button>
        <span class="qty-value" id="qty-${p.id}">0</span>
        <button class="qty-btn" onclick="alterarQty(${p.id}, ${p.preco}, 1)">+</button>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------
// Alterar quantidade de um produto
// ------------------------------------------------------------
function alterarQty(id, preco, delta) {
  const atual = quantidades[id]?.quantidade ?? 0;
  const novo  = Math.max(0, atual + delta);

  if (novo === 0) {
    delete quantidades[id];
  } else {
    quantidades[id] = { quantidade: novo, preco: parseFloat(preco) };
  }

  document.getElementById(`qty-${id}`).textContent = novo;
  atualizarResumo();
}

// ------------------------------------------------------------
// Atualizar resumo e total
// ------------------------------------------------------------
function atualizarResumo() {
  const resumoEl = document.getElementById('resumoItens');
  const totalEl  = document.getElementById('totalValor');
  const ids      = Object.keys(quantidades);

  if (!ids.length) {
    resumoEl.innerHTML = '<p class="resumo-vazio">Nenhum item selecionado.</p>';
    totalEl.textContent = 'R$ 0,00';
    return;
  }

  let total = 0;
  const linhas = ids.map(id => {
    const { quantidade, preco } = quantidades[id];
    const subtotal = quantidade * preco;
    total += subtotal;

    const nomeEl = document.getElementById(`qty-${id}`)?.closest('.produto-item')?.querySelector('.produto-item__nome');
    const nome   = nomeEl?.textContent ?? `Produto ${id}`;

    return `
      <div class="resumo-item">
        <span class="resumo-item__nome">${nome}</span>
        <span class="resumo-item__qty">x${quantidade}</span>
        <span class="resumo-item__subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
      </div>
    `;
  });

  resumoEl.innerHTML = linhas.join('');
  totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// ------------------------------------------------------------
// Enviar pedido
// ------------------------------------------------------------
async function enviarPedido(e) {
  e.preventDefault();

  const errorEl    = document.getElementById('pedidoError');
  const enviarBtn  = document.getElementById('enviarBtn');
  errorEl.textContent = '';

  const clienteNome  = document.getElementById('clienteNome').value.trim();
  const telefone     = document.getElementById('telefone').value.trim();
  const endereco     = document.getElementById('endereco').value.trim();
  const dataEntrega  = document.getElementById('dataEntrega').value;

  if (!clienteNome || !telefone || !endereco || !dataEntrega) {
    errorEl.textContent = 'Preencha todos os campos de entrega.';
    return;
  }

  const ids = Object.keys(quantidades);
  if (!ids.length) {
    errorEl.textContent = 'Selecione ao menos um produto.';
    return;
  }

  const itens = ids.map(id => ({
    produto_id: parseInt(id),
    quantidade: quantidades[id].quantidade,
  }));

  const token = await getToken();

  enviarBtn.disabled    = true;
  enviarBtn.textContent = 'Enviando…';

  try {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cliente_nome: clienteNome, telefone, endereco, data_entrega: dataEntrega, itens }),
    });

    if (!res.ok) {
      const err = await res.json();
      errorEl.textContent = err.erro || 'Erro ao enviar pedido.';
      return;
    }

    window.location.href = 'meus-pedidos.html';

  } catch (err) {
    errorEl.textContent = 'Erro de conexão com o servidor.';
    console.error(err);
  } finally {
    enviarBtn.disabled    = false;
    enviarBtn.textContent = 'Confirmar pedido';
  }
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------
function inicializarEventos() {
  document.getElementById('pedidoForm').addEventListener('submit', enviarPedido);
  document.getElementById('logoutBtn').addEventListener('click', logout);
}