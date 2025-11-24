// principaljs.js - versão simples e segura
// ===================== PLAYER GLOBAL =====================

function configurarPlayer() {
    const musicas = document.querySelectorAll(".musica");

    const capa = document.getElementById("playerCapa");
    const titulo = document.getElementById("playerTitulo");
    const artista = document.getElementById("playerArtista");
    const audio = document.getElementById("audioPlayer");
    const playBtn = document.getElementById("playPauseBtn");
    const barra = document.getElementById("barraProgresso");
    const tempoAtual = document.getElementById("tempoAtual");
    const tempoTotal = document.getElementById("tempoTotal");

    // Função para formatar o tempo
    function formatarTempo(seg) {
        const m = Math.floor(seg / 60);
        const s = Math.floor(seg % 60);
        return `${m}:${s < 10 ? "0"+s : s}`;
    }

    // Quando clicar em uma música
    musicas.forEach(m => {
        m.addEventListener("click", () => {
            capa.src = m.dataset.capa;
            titulo.textContent = m.dataset.titulo;
            artista.textContent = m.dataset.artista;
            audio.src = m.dataset.musica;

            audio.play();
            playBtn.textContent = "⏸️";
        });
    });

    // Play / Pause
    playBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = "⏸️";
        } else {
            audio.pause();
            playBtn.textContent = "▶️";
        }
    };

    // ======== BARRA DE PROGRESSO ========
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            barra.value = (audio.currentTime / audio.duration) * 100;
            tempoAtual.textContent = formatarTempo(audio.currentTime);
            tempoTotal.textContent = formatarTempo(audio.duration);
        }
    });

    // Quando o usuário arrastar a barra
    barra.addEventListener("input", () => {
        if (audio.duration) {
            audio.currentTime = (barra.value / 100) * audio.duration;
        }
    });

    // ========= SISTEMA DE CURTIR =========
    let curtidas = JSON.parse(localStorage.getItem("curtidas")) || [];

    document.querySelectorAll(".musica").forEach(m => {
        let id = m.dataset.id;
        let btn = m.querySelector(".curtirBtn");

        if (curtidas.includes(id)) {
            btn.classList.add("curtido");
            btn.textContent = "💜";
        }

        btn.addEventListener("click", (event) => {
            event.stopPropagation(); // impede de tocar a música ao curtir

            if (curtidas.includes(id)) {
                curtidas = curtidas.filter(x => x !== id);
                btn.classList.remove("curtido");
                btn.textContent = "🤍";
            } else {
                curtidas.push(id);
                btn.classList.add("curtido");
                btn.textContent = "💜";
            }

            localStorage.setItem("curtidas", JSON.stringify(curtidas));
        });
    });

    // ========= BOTÃO DE ADICIONAR À PLAYLIST =========
    document.querySelectorAll(".addPlaylistBtn").forEach(btn => {
        btn.onclick = (event) => {
            event.stopPropagation();
            adicionarMusicaAPlaylist(btn.closest(".musica"));
        };
    });

    // ========= ATUALIZA O ESTADO DOS BOTÕES DE PLAYLIST =========
    function atualizarBotoesPlaylist() {
        let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

        document.querySelectorAll(".musica").forEach(m => {
            let btn = m.querySelector(".addPlaylistBtn");
            let musicaId = m.dataset.id;

            // verifica se a música já está em alguma playlist
            let adicionada = playlists.some(p => p.musicas.some(mu => mu.id === musicaId));

            if (adicionada) {
                btn.textContent = "✔";
                btn.style.backgroundColor = "#01dd76ff";
                btn.disabled = true;
            } else {
                btn.textContent = "➕";
                btn.style.backgroundColor = "#6c11e4ff";
                btn.disabled = false;
            }
        });
    }

    // chama a função ao configurar o player
    atualizarBotoesPlaylist();
}

// Funções que atualizam o conteúdo da área principal
function showInicio() {
    const conteudo = document.getElementById("conteudo");

    // Caminho do servidor
    const baseURL = "https://kaique.pythonanywhere.com/musicas/";

    // Lista automática - coloque o nome dos arquivos mp3
    const listaMusicas = [
        "ACDC",
        "ONE",
        "M4",
        "RAP",
        "PRIMEIRO FREESTYLE",
        "BILLIE JEAN"
    ];

    let html = `
        <h2>Início</h2>
        <div class="musicas">
    `;

    listaMusicas.forEach(nome => {
        html += `
            <div class="musica"
                data-id="${nome}"
                data-capa="${baseURL}${nome}.jpeg"
                data-titulo="${nome}"
                data-artista="Artista"
                data-musica="${baseURL}${nome}.mp3">

                <img src="${baseURL}${nome}.jpeg">
                <h3>${nome} <button class="curtirBtn">🤍</button> <button class="addPlaylistBtn">➕</button></h3>
                <p>Artista</p>
            </div>
        `;
    });

    html += `</div>`;

    conteudo.innerHTML = html;
    configurarPlayer();
}


function showBiblioteca() {
    const conteudo = document.getElementById("conteudo");

    let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

    conteudo.innerHTML = `
        <h2>📚 Sua Biblioteca</h2>

        <button id="btnCriarPlaylist">➕ Criar Playlist</button>

        <div id="listaPlaylists" style="margin-top:20px;">
            ${playlists.length === 0 ? "<p>Nenhuma playlist criada.</p>" : ""}

            ${playlists.map((p, index) => `
                <div class="playlist" data-index="${index}">
                    <h2>${p.nome}</h2>
                    <p>${p.musicas.length} músicas</p>
                    <br></br>
                    <button class="btnExcluir" data-index="${index}">❌ Excluir</button>
                </div>
            `).join("")}
        </div>
    `;

    document.getElementById("btnCriarPlaylist").onclick = criarPlaylist;

    // Abrir playlist ao clicar no container
    document.querySelectorAll(".playlist").forEach(el => {
        el.onclick = (e) => {
            // impede conflito com o botão de excluir
            if (!e.target.classList.contains("btnExcluir")) {
                abrirPlaylist(el.dataset.index);
            }
        };
    });

    // Associar os botões de excluir
    document.querySelectorAll(".btnExcluir").forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); // não dispara abrirPlaylist
            excluirPlaylist(btn.dataset.index);
        };
    });
}


function criarPlaylist() {
    let nome = prompt("Nome da playlist:");

    if (!nome || nome.trim() === "") return;

    let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

    playlists.push({
        nome: nome,
        musicas: []  // começará vazia
    });

    localStorage.setItem("playlists", JSON.stringify(playlists));

    showBiblioteca(); // recarrega a biblioteca
}
function abrirPlaylist(index) {
    let playlists = JSON.parse(localStorage.getItem("playlists")) || [];
    let playlist = playlists[index];

    const conteudo = document.getElementById("conteudo");

    conteudo.innerHTML = `
        <h2>📀 ${playlist.nome}</h2>
        <button id="btnVoltarBib">⬅ Voltar</button>

        <div id="musicasPlaylist">
            ${playlist.musicas.length === 0 ? "<p>Nenhuma música adicionada.</p>" : ""}

            ${playlist.musicas.map(m => `
                <div class="musica playlistMusica"
                    data-id="${m.id}"
                    data-capa="${m.capa}"
                    data-titulo="${m.titulo}"
                    data-artista="${m.artista}"
                    data-musica="${m.src}">
                    
                    <img src="${m.capa}">
                    <h3>${m.titulo}</h3>
                    <p>${m.artista}</p>
                </div>
            `).join("")}
        </div>
    `;

   

     const btnVoltar = document.getElementById("btnVoltarBib");
    if (btnVoltar) btnVoltar.onclick = showBiblioteca;
    configurarPlayer();
}


function excluirPlaylist(index) {
    let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

    if (!playlists[index]) return;

    const confirmacao = confirm(`Deseja realmente excluir a playlist "${playlists[index].nome}"?`);
    if (!confirmacao) return;

    playlists.splice(index, 1); // remove do array
    localStorage.setItem("playlists", JSON.stringify(playlists));

    showBiblioteca(); // atualiza a tela
}


function adicionarMusicaAPlaylist(musicaEl) {
    let playlists = JSON.parse(localStorage.getItem("playlists")) || [];
    if (playlists.length === 0) {
        alert("Crie uma playlist primeiro.");
        return;
    }

    const btn = musicaEl.querySelector(".addPlaylistBtn");
    if (!btn) return;

    // Verifica se a música já está em alguma playlist
    let adicionadaEm = playlists.findIndex(p => p.musicas.some(m => m.id === musicaEl.dataset.id));

    if (adicionadaEm !== -1) {
        // Remove da playlist onde estava
        playlists[adicionadaEm].musicas = playlists[adicionadaEm].musicas.filter(m => m.id !== musicaEl.dataset.id);
        localStorage.setItem("playlists", JSON.stringify(playlists));

        btn.textContent = "➕";
        btn.style.backgroundColor = "#6c11e4ff";
        btn.disabled = false;

        alert("Música removida da playlist!");
    } else {
        // Adiciona em uma playlist escolhida
        let lista = playlists.map((p, i) => `${i} - ${p.nome}`).join("\n");
        let escolha = prompt("Escolha uma playlist:\n" + lista);
        if (escolha === null || escolha === "") return;

        let index = parseInt(escolha);
        if (isNaN(index) || !playlists[index]) {
            alert("Playlist inválida.");
            return;
        }

        let musicaData = {
            id: musicaEl.dataset.id,
            capa: musicaEl.dataset.capa,
            titulo: musicaEl.dataset.titulo,
            artista: musicaEl.dataset.artista,
            src: musicaEl.dataset.musica
        };

        playlists[index].musicas.push(musicaData);
        localStorage.setItem("playlists", JSON.stringify(playlists));

        btn.textContent = "✔";
        btn.style.backgroundColor = "#01dd76ff";
        btn.disabled = false;

        alert("Música adicionada à playlist!");
    }
}



function showCurtidas() {
    const conteudo = document.getElementById("conteudo");
    let curtidas = JSON.parse(localStorage.getItem("curtidas")) || [];

    // 1. PEGAR TODAS AS MÚSICAS DA PÁGINA PRINCIPAL
    let musicasDOM = Array.from(document.querySelectorAll(".musica"));

    // 2. FILTRAR APENAS AS QUE ESTÃO CURTIDAS
    let favoritas = musicasDOM.filter(m => curtidas.includes(m.dataset.id));

    if (favoritas.length === 0) {
        conteudo.innerHTML = "<h2>💜 Músicas Curtidas</h2><p>Você não curtiu nada ainda.</p>";
        return;
    }

    // 3. RECRIA A LISTA DE MÚSICAS CURTIDAS
    conteudo.innerHTML = `
        <h2>💜 Músicas Curtidas</h2>
        <div class="musicas">
            ${favoritas.map(m => `
                <div class="musica"
                     data-id="${m.dataset.id}"
                     data-capa="${m.dataset.capa}"
                     data-titulo="${m.dataset.titulo}"
                     data-artista="${m.dataset.artista}"
                     data-musica="${m.dataset.musica}">
                     
                    <img src="${m.dataset.capa}">
                    <h3>${m.dataset.titulo}</h3>
                    <p>${m.dataset.artista}</p>
                    <button class="curtirBtn curtido">💜</button>
                </div>
            `).join("")}
        </div>
    `;

    configurarPlayer(); // recria eventos do player
}



function showPesquisar() {
  const conteudo = document.getElementById("conteudo");

  conteudo.innerHTML = `
    <h2>Pesquisar 🔍</h2>
    <input type="text" id="campoBusca" placeholder="Digite o nome da música ou artista..." style="width:80%; padding:8px;">
    <button id="btnBuscar">Buscar</button>
    <div id="resultadoBusca" style="margin-top:15px;"></div>
  `;

  document.getElementById("btnBuscar").onclick = buscarMusica;
}

function buscarMusica() {
  const termo = document.getElementById("campoBusca").value.toLowerCase();
  const resultado = document.getElementById("resultadoBusca");

  const musicas = [
    {
      id: "1",
      capa: "/imagens/ACDC.jpeg",
      titulo: "Thunderstruck",
      artista: "AC/DC",
      src: "/musicas/ACDC.mp3"
    },
    {
      id: "2",
      capa: "/imagens/ONE.jpeg",
      titulo: "One More Time",
      artista: "Daft Punk",
      src: "/musicas/ONE.mp3"
    },
    {
      id: "3",
      capa: "/imagens/M4.jpeg",
      titulo: "M4",
      artista: "Teto",
      src: "/musicas/M4.mp3"
    },
    {
      id: "4",
      capa: "/imagens/RAP.jpeg",
      titulo: "Rap God",
      artista: "Eminem",
      src: "/musicas/RAP.mp3"
    }
  ];

  if (termo.trim() === "") {
    resultado.innerHTML = "<p>Digite algo para buscar.</p>";
    return;
  }

  const encontrados = musicas.filter(m => 
    m.titulo.toLowerCase().includes(termo) || 
    m.artista.toLowerCase().includes(termo)
  );

  if (encontrados.length === 0) {
    resultado.innerHTML = "<p>Nenhuma música encontrada.</p>";
    return;
  }

  resultado.innerHTML = `
    <div class="musicas">
      ${encontrados.map(m => `
        <div class="musica"
          data-id="${m.id}"
          data-capa="${m.capa}"
          data-titulo="${m.titulo}"
          data-artista="${m.artista}"
          data-musica="${m.src}">

          <img src="${m.capa}">
          <h3>${m.titulo}</h3>
          <p>${m.artista}</p>
        </div>
      `).join("")}
    </div>
  `;

  configurarPlayer(); // ativa o player pros resultados
}

function detectarCidade() {
    const elemento = document.getElementById("localizacaoUsuario");

    if (!navigator.geolocation) {
        elemento.textContent = "Geolocalização não suportada.";
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;

        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

            const resposta = await fetch(url);
            const dados = await resposta.json();

            let cidade = dados.address.city || 
                         dados.address.town || 
                         dados.address.village || 
                         "Cidade desconhecida";

            let estado = dados.address.state || "";

            elemento.textContent = `Você está em: ${cidade} - ${estado}`;
        }
        catch (e) {
            elemento.textContent = "Não foi possível obter a cidade.";
        }

    }, () => {
        elemento.textContent = "Permissão negada para acessar localização.";
    });
}

detectarCidade();

// Garante que os elementos existam antes de ligar os handlers.
// window.onload executa quando a página terminou de carregar.
window.onload = function() {
  // associa os botões (se existirem)
  const inicioBtn = document.getElementById("inicioBtn");
  const bibliotecaBtn = document.getElementById("bibliotecaBtn");
  const curtidasBtn = document.getElementById("curtidasBtn");
  const pesquisarBtn = document.getElementById("pesquisarBtn");

  if (inicioBtn) inicioBtn.onclick = showInicio;
  if (bibliotecaBtn) bibliotecaBtn.onclick = showBiblioteca;
  if (curtidasBtn) curtidasBtn.onclick = showCurtidas;
  if (pesquisarBtn) pesquisarBtn.onclick = showPesquisar;

  // opcional: mostra a aba Início por padrão
  showInicio();
};
