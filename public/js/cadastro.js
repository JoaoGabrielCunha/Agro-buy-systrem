document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const tipo = document.getElementById('tipo').value;
  const mensagem = document.getElementById('mensagem');

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, email, senha, tipo }),
    });

    const data = await response.json();

    if (response.ok) {
      mensagem.style.color = 'green';
      mensagem.textContent = 'Usuário criado com sucesso!';
      document.getElementById('cadastroForm').reset();
    } else {
      mensagem.style.color = 'red';
      mensagem.textContent = data.erro || 'Erro ao criar usuário.';
    }
  } catch (erro) {
    console.error('Erro:', erro);
    mensagem.style.color = 'red';
    mensagem.textContent = 'Erro ao conectar com o servidor.';
  }
});