const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

if (!usuario) {
  window.location.href = '/login';
}

document.getElementById('nomeUsuario').textContent = usuario?.nome || 'Usuário';

let produtos = [];
let categoriaSelecionada = 'Todos';

async function carregarProdutos() {
  try {
    const res = await fetch('/api/products');
    produtos = await res.json();
    atualizarFiltros();
    renderizarProdutos();
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    document.getElementById('produtosGrid').innerHTML =
      '<p class="sem-produtos">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
  }
}

function atualizarFiltros() {
  const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria))];
  const el = document.getElementById('filtrosCategorias');
  el.innerHTML = categorias.map(cat => `
    <button class="filtro-btn ${cat === categoriaSelecionada ? 'ativo' : ''}"
            onclick="filtrarCategoria('${cat}')">${cat}</button>
  `).join('');
}

function filtrarCategoria(categoria) {
  categoriaSelecionada = categoria;
  atualizarFiltros();
  renderizarProdutos();
}

function renderizarProdutos() {
  const busca = document.getElementById('buscaInput').value.toLowerCase().trim();

  let lista = produtos;

  if (categoriaSelecionada !== 'Todos') {
    lista = lista.filter(p => p.categoria === categoriaSelecionada);
  }

  if (busca) {
    lista = lista.filter(p =>
      p.nome.toLowerCase().includes(busca) ||
      (p.descricao && p.descricao.toLowerCase().includes(busca)) ||
      p.categoria.toLowerCase().includes(busca)
    );
  }

  const grid = document.getElementById('produtosGrid');

  if (!lista.length) {
    grid.innerHTML = '<p class="sem-produtos">Nenhum produto encontrado.</p>';
    return;
  }

  grid.innerHTML = lista.map(p => `
    <div class="produto-card" id="card-${p.id}">
      <div class="produto-img">
        ${p.imagemPath
          ? `<img src="${p.imagemPath}" alt="${p.nome}" />`
          : '<div class="sem-img-user">🌱</div>'}
      </div>
      <div class="produto-body">
        <span class="categoria-badge">${p.categoria}</span>
        <h3 class="produto-nome">${p.nome}</h3>
        ${p.descricao ? `<p class="produto-descricao">${p.descricao}</p>` : ''}
        <div class="produto-footer">
          <span class="produto-preco">R$ ${Number(p.preco).toFixed(2)}</span>
          <span class="produto-unidade-info">${p.unidade}</span>
        </div>
        <span class="estoque-badge ${p.estoque > 0 ? 'em-estoque' : 'sem-estoque'}" id="estoque-${p.id}">
          ${p.estoque > 0 ? `✓ ${p.estoque} em estoque` : '✗ Fora de estoque'}
        </span>
        ${p.estoque > 0 ? `
        <div class="compra-container">
          <input type="number" id="qtd-${p.id}" class="input-quantidade" value="1" min="1" max="${p.estoque}" />
          <button class="btn-comprar" onclick="comprar('${p.id}')">Comprar</button>
        </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function comprar(id) {
  const token = localStorage.getItem('token');
  const qtdInput = document.getElementById(`qtd-${id}`);
  const quantidade = parseInt(qtdInput.value);

  if (!quantidade || quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  const btn = qtdInput.nextElementSibling;
  btn.disabled = true;
  btn.textContent = 'Comprando...';

  try {
    const res = await fetch(`/api/products/${id}/compra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantidade }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.erro || 'Erro ao realizar compra.');
      return;
    }

    const novoEstoque = data.estoque;
    const badgeEl = document.getElementById(`estoque-${id}`);

    badgeEl.className = `estoque-badge ${novoEstoque > 0 ? 'em-estoque' : 'sem-estoque'}`;
    badgeEl.textContent = novoEstoque > 0 ? `✓ ${novoEstoque} em estoque` : '✗ Fora de estoque';

    const produto = produtos.find(p => p.id === id);
    if (produto) produto.estoque = novoEstoque;

    if (novoEstoque === 0) {
      document.querySelector(`#card-${id} .compra-container`)?.remove();
    } else {
      qtdInput.max = novoEstoque;
      qtdInput.value = 1;
    }

    alert(`Compra realizada! Novo estoque: ${novoEstoque}`);
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao conectar com o servidor.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Comprar';
  }
}

document.getElementById('buscaInput').addEventListener('input', renderizarProdutos);

document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login';
});

carregarProdutos();
