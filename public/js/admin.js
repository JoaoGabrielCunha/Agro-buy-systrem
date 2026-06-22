const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
const token = localStorage.getItem('token');

if (!usuario || usuario.tipo !== 'admin') {
  window.location.href = '/login';
}

document.getElementById('nomeAdmin').textContent = usuario?.nome || 'Admin';

let produtos = [];
let editandoId = null;

async function carregarProdutos() {
  try {
    const res = await fetch('/api/products');
    produtos = await res.json();
    renderizarProdutos(produtos);
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    document.getElementById('produtosGrid').innerHTML =
      '<p class="sem-produtos">Erro ao carregar produtos.</p>';
  }
}

function renderizarProdutos(lista) {
  const grid = document.getElementById('produtosGrid');

  if (!lista.length) {
    grid.innerHTML = '<p class="sem-produtos">Nenhum produto cadastrado ainda. Clique em "+ Novo Produto" para começar.</p>';
    return;
  }

  grid.innerHTML = lista.map(p => `
    <div class="produto-card-admin">
      <div class="produto-img-admin">
        ${p.imagemPath
          ? `<img src="${p.imagemPath}" alt="${p.nome}" />`
          : '<div class="sem-img">📦 Sem imagem</div>'}
      </div>
      <div class="produto-info-admin">
        <span class="produto-categoria-tag">${p.categoria}</span>
        <h3>${p.nome}</h3>
        <p class="produto-desc-admin">${p.descricao || 'Sem descrição.'}</p>
        <div class="produto-meta">
          <span class="produto-preco-admin">R$ ${Number(p.preco).toFixed(2)}</span>
          <span class="produto-estoque-admin">${p.estoque} ${p.unidade}</span>
        </div>
        <div class="produto-acoes">
          <button class="btn-editar" onclick="abrirEditar('${p.id}')">Editar</button>
          <button class="btn-deletar" onclick="deletarProduto('${p.id}', '${p.nome.replace(/'/g, "\\'")}')">Excluir</button>
        </div>
      </div>
    </div>
  `).join('');
}

function abrirNovo() {
  editandoId = null;
  document.getElementById('modalTitulo').textContent = 'Novo Produto';
  document.getElementById('formProduto').reset();
  document.getElementById('previewImg').style.display = 'none';
  document.getElementById('imgAtualContainer').style.display = 'none';
  document.getElementById('modal').style.display = 'flex';
}

function abrirEditar(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  editandoId = id;
  document.getElementById('modalTitulo').textContent = 'Editar Produto';
  document.getElementById('inputNome').value = p.nome;
  document.getElementById('inputPreco').value = p.preco;
  document.getElementById('inputEstoque').value = p.estoque;
  document.getElementById('inputCategoria').value = p.categoria;
  document.getElementById('inputUnidade').value = p.unidade;
  document.getElementById('inputDescricao').value = p.descricao || '';
  document.getElementById('inputImagem').value = '';
  document.getElementById('previewImg').style.display = 'none';

  const imgAtualContainer = document.getElementById('imgAtualContainer');
  if (p.imagemPath) {
    imgAtualContainer.style.display = 'block';
    document.getElementById('imgAtual').src = p.imagemPath;
  } else {
    imgAtualContainer.style.display = 'none';
  }

  document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

document.getElementById('inputImagem').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const preview = document.getElementById('previewImg');
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';
  document.getElementById('imgAtualContainer').style.display = 'none';
});

document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('nome', document.getElementById('inputNome').value);
  formData.append('preco', document.getElementById('inputPreco').value);
  formData.append('estoque', document.getElementById('inputEstoque').value);
  formData.append('categoria', document.getElementById('inputCategoria').value);
  formData.append('unidade', document.getElementById('inputUnidade').value);
  formData.append('descricao', document.getElementById('inputDescricao').value);

  const imagem = document.getElementById('inputImagem').files[0];
  if (imagem) formData.append('imagem', imagem);

  const btn = document.getElementById('btnSalvar');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    const url = editandoId ? `/api/products/${editandoId}` : '/api/products';
    const method = editandoId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      fecharModal();
      await carregarProdutos();
    } else {
      const data = await res.json();
      alert(data.erro || 'Erro ao salvar produto.');
    }
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao conectar com o servidor.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
});

async function deletarProduto(id, nome) {
  if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await carregarProdutos();
    } else {
      const data = await res.json();
      alert(data.erro || 'Erro ao excluir produto.');
    }
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao conectar com o servidor.');
  }
}

document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login';
});

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') fecharModal();
});

carregarProdutos();
