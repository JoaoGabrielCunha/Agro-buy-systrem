const cadastroForm = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagem");

cadastroForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value;

  try {
    const resposta = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        tipo,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.erro || "Erro ao criar conta.";
      return;
    }

    mensagem.textContent = "Conta criada com sucesso!";

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  } catch (erro) {
    console.error(erro);
    mensagem.textContent = "Erro de conexão com o servidor.";
  }
});