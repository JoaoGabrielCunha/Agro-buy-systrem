document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const mensagem = document.getElementById('mensagem');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      if (data.usuario.tipo === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/user';
      }
    } else {
      mensagem.style.color = '#ff6b6b';
      mensagem.textContent = data.erro || 'Erro ao fazer login.';
    }
  } catch (erro) {
    console.error('Erro:', erro);
    mensagem.style.color = '#ff6b6b';
    mensagem.textContent = 'Erro ao conectar com o servidor.';
  }
});
