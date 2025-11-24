  // === Função de login ===
function fazerLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById('usuario')?.value;

  if (usuario && usuario.trim() !== '') {
    // Salva o usuário no localStorage
    localStorage.setItem('usuario', usuario);

    // Debug
    console.log('Login realizado:', usuario);

    // Redireciona direto para a página principal
    window.location.replace('index.html');
  } else {
    alert('Por favor, digite seu nome de usuário.');
  }
}

// === Função de logout ===
function fazerLogout() {
  localStorage.removeItem('usuario');
  window.location.href = 'Registro_musica.html';
}

// === Verifica login ao carregar qualquer página protegida ===
window.addEventListener('load', () => {
  const usuario = localStorage.getItem('usuario');
  const boasVindas = document.getElementById('boasVindas');
  const usuarioLogado = document.getElementById('usuarioLogado');
  const visitante = document.getElementById('visitante');
  const logoutBtn = document.getElementById('logoutBtn');

  // Página Principal
  if (window.location.pathname.toLowerCase().includes('index.html')) {
    if (!usuario) {
      // Não está logado → redireciona para login
      window.location.href = 'Registro_musica.html';
    } else {
      // Mostra conteúdo logado
      if (usuarioLogado) usuarioLogado.style.display = 'block';
      if (visitante) visitante.style.display = 'none';
      if (boasVindas) boasVindas.textContent = `Bem-vindo de volta, ${usuario}! 🎧`;
      if (logoutBtn) logoutBtn.style.display = 'inline';
    }
  }
});