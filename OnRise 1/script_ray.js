

const API_URL = "http://localhost:3000/noticiasNovas";
const API_URL_DESTAQUES = "http://localhost:3000/noticiasDestaques";


const KNOWN_CATS = ["ECONOMIA","CRIPTOMOEDA","STARTUPS","TECNOLOGIA","ESPORTE","OPINIAO","all"];

let categoriaAtiva = "all";
let todasNoticias = [];


function pegarCategoriaNormalizada(valor) {
  if (!valor) return "";
  const str = String(valor);

  
  for (const cat of KNOWN_CATS) {
    if (cat === "all") continue;
    const regex = new RegExp(`\\b${cat}\\b`, "i");
    if (regex.test(str)) return cat;
  }

  
  if (str.includes("—")) {
    return str.split("—").pop().trim().toLowerCase();
  }

  
  if (str.includes("-")) {
    return str.split("-").pop().trim().toLowerCase();
  }

  
  const parts = str.trim().split(/\s+/);
  return parts.length ? parts.pop().toLowerCase() : str.toLowerCase();
}


function criarCard(noticia) {
  const categoria = pegarCategoriaNormalizada(noticia.categoria);

  const a = document.createElement("a");
  a.href = `noticia_ray.html?id=${noticia.id}`;
  a.className = "noticia-card";
  a.dataset.category = categoria;

  a.innerHTML = `
    <img class="thumb" src="${noticia.imagem || 'https://via.placeholder.com/400x200'}" alt="thumb">
    <div class="categoria">
      <p class="kicker">${categoria || ""}</p>
      <h3>${noticia.titulo || "Sem título"}</h3>
      <p class="time">${noticia.publicado || noticia.tempo || ""}</p>
    </div>
  `;
  return a;
}

async function carregarNoticias() {
  const container = document.getElementById("lista-noticias");
  if (!container) { console.error("#lista-noticias não encontrado"); return; }

  container.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Status " + res.status);
    const lista = await res.json();
    todasNoticias = lista;

    container.innerHTML = "";

    if (lista.length === 0) return;

   
    // PRIMEIRA NOTÍCIA → BIG CARD
    
    const primeira = lista[0];

    const bigCard = document.createElement("a");
    bigCard.href = `noticia_ray.html?id=${primeira.id}`;
    bigCard.className = "card big-card fade-up";
    bigCard.dataset.category = pegarCategoriaNormalizada(primeira.categoria);

    bigCard.innerHTML = `
      <img src="${primeira.imagem || 'https://via.placeholder.com/900x400'}"
           style="width:100%; border-radius:10px;">
      <div class="content">
        <div class="eyebrow">${primeira.categoria || ""}</div>
        <h2>${primeira.titulo || "Sem título"}</h2>
        <p class="card-meta">${primeira.publicado || "Agora"}</p>
      </div>
    `;

    container.appendChild(bigCard);

   
    lista.slice(1).forEach(n => {
      container.appendChild(criarCard(n));
    });

    aplicarFiltros();

  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar notícias.</p>";
    console.error("Erro carregarNoticias:", err);
  }
}

async function carregarDestaques() {
  const container = document.getElementById("lista-destaques");
  if (!container) return;

  container.innerHTML = "<p>Carregando...</p>";
  try {
    const res = await fetch(API_URL_DESTAQUES);
    if (!res.ok) throw new Error("Status " + res.status);
    const lista = await res.json();
    container.innerHTML = "";
    lista.forEach((item, i) => {
      const d = document.createElement("a");
      d.href = `noticia_ray.html?id=${item.id}`;
      d.className = "destaque-item";
      d.dataset.category = pegarCategoriaNormalizada(item.categoria);
      d.innerHTML = `<div class="numero">${i+1}</div><div class="destaque-text">${item.titulo}</div>`;
      container.appendChild(d);
    });
  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar destaques.</p>";
    console.error("Erro carregarDestaques:", err);
  }
}

// --- aplica busca + categoria ao DOM
function aplicarFiltros() {
  const input = document.getElementById("searchInput");
  const termo = input ? input.value.toLowerCase().trim() : "";
  document.querySelectorAll(".noticia-card").forEach(card => {
    const cat = (card.dataset.category || "").toLowerCase();
    const text = card.innerText.toLowerCase();
    const passaCat = (categoriaAtiva === "all" || categoriaAtiva === cat);
    const passaBusca = termo === "" || text.includes(termo);
    card.style.display = (passaCat && passaBusca) ? "" : "none";
  });

  // opcional: esconde destaques que não batem categoria
  document.querySelectorAll(".destaque-item").forEach(d => {
    const cat = (d.dataset.category || "").toLowerCase();
    d.style.display = (categoriaAtiva === "all" || categoriaAtiva === cat) ? "" : "none";
  });

  // big-card (se houver) também respeita filtros
  document.querySelectorAll(".big-card").forEach(card => {
    const cat = (card.dataset.category || "").toLowerCase();
    const text = card.innerText.toLowerCase();
    const passaCat = (categoriaAtiva === "all" || categoriaAtiva === cat);
    const passaBusca = termo === "" || text.includes(termo);
    card.style.display = (passaCat && passaBusca) ? "" : "none";
  });
}

// --- configura UI: botões e input
function configurarUI() {
  const botoes = document.querySelectorAll(".editorial-btn");
  botoes.forEach(b => {
    b.addEventListener("click", () => {
      categoriaAtiva = (b.dataset.category || "all").toLowerCase();
      botoes.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      aplicarFiltros();
    });
  });

  const input = document.getElementById("searchInput");
  if (input) {
    input.addEventListener("input", aplicarFiltros);
  } else {
    console.warn("Campo #searchInput não encontrado");
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  configurarUI();
  await Promise.all([carregarNoticias(), carregarDestaques()]);
  aplicarFiltros();
  console.log("Init complete — categorias ativas:", categoriaAtiva);
});
