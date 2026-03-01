// /public/js/cadrastro.js
// Script para a página de cadastro (cadastro.html)
// Permite criar trilha com múltiplos módulos e cursos (bolinhas)
// Faz POST em http://localhost:3000/trilhas

const API_BASE_CAD = "http://localhost:3000";
const ENDPOINT_TRILHAS_CAD = `${API_BASE_CAD}/trilhas`;

document.addEventListener("DOMContentLoaded", () => {
  iniciarCadastro();
});

function iniciarCadastro() {
  const btnAdd = document.querySelector(".btn-add");
  const listaCursosEl = document.querySelector(".lista-cursos");
  const btnSalvar = document.querySelector(".btn.salvar");
  const btnCancelar = document.querySelector(".btn.cancelar");
  const textareaDesc = document.querySelector("textarea");
  const inputImg = document.getElementById("imgTrilha");
  const inputDuracao = document.getElementById("duracao");
  const inputCert = document.getElementById("cert");
  const listaDificuldade = document.querySelector(".lista-dificuldade");

  // Estado local
  const estado = {
    modulos: [], // [{id, nome, cursos:[{id,titulo,concluido}]}]
    imagemBase64: ""
  };

  // cria 1 módulo inicial por padrão
  adicionarModulo(estado, listaCursosEl, `Módulo 1`);

  // upload de imagem -> guarda base64
  inputImg.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    estado.imagemBase64 = await fileToBase64(file);
  });

  // botão "ADICIONAR CURSO +" -> abre menu para adicionar curso a módulo ou novo módulo
  btnAdd.addEventListener("click", () => {
    // Mostra opções simples: adicionar módulo ou adicionar curso em módulo existente
    const opc = prompt("Digite:\n1 - Adicionar Curso (bolinha) em módulo existente\n2 - Adicionar Novo Módulo");
    if (opc === null) return;
    if (opc.trim() === "2") {
      const nomeMod = prompt("Nome do novo módulo:");
      if (!nomeMod) return;
      adicionarModulo(estado, listaCursosEl, nomeMod);
      return;
    }
    if (opc.trim() === "1") {
      if (!estado.modulos.length) {
        alert("Crie um módulo primeiro.");
        return;
      }
      // lista módulos para escolher
      const nomes = estado.modulos.map((m, i) => `${i + 1}: ${m.nome}`).join("\n");
      const choice = prompt("Escolha o número do módulo onde adicionar o curso:\n" + nomes);
      if (!choice) return;
      const idx = parseInt(choice, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= estado.modulos.length) {
        alert("Escolha inválida.");
        return;
      }
      const nomeCurso = prompt("Nome do curso (bolinha):");
      if (!nomeCurso) return;
      estado.modulos[idx].cursos.push({ id: gerarId("c"), titulo: nomeCurso, concluido: false });
      renderizarModulos(estado, listaCursosEl);
      return;
    }
    alert("Opção inválida.");
  });

  // Botão SALVAR -> solicita nome da trilha (já que não há campo) e envia POST
  btnSalvar.addEventListener("click", async (e) => {
    e.preventDefault();

    // pedir nome da trilha
    const nomeTrilha = prompt("Nome da trilha:");
    if (!nomeTrilha) {
      alert("Nome da trilha obrigatório.");
      return;
    }

    const descricao = textareaDesc.value.trim();
    const duracao = inputDuracao.value.trim();
    const certificacao = inputCert.checked;
    const dificuldade = pegarDificuldadeSelecionada();

    if (!estado.modulos.length) {
      alert("Adicione pelo menos um módulo com pelo menos um curso.");
      return;
    }

    // valida que cada módulo tem ao menos 1 curso
    for (let m of estado.modulos) {
      if (!m.cursos || m.cursos.length === 0) {
        if (!confirm(`O módulo "${m.nome}" não tem cursos. Deseja continuar mesmo assim?`)) {
          return;
        }
      }
    }

    const trilhaPayload = {
      nome: nomeTrilha,
      descricao,
      dificuldade,
      duracao,
      certificacao,
      imagem: estado.imagemBase64 || "",
      currentModuleIndex: 0,
      modulos: estado.modulos
    };

    try {
      const resp = await fetch(ENDPOINT_TRILHAS_CAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trilhaPayload)
      });
      if (!resp.ok) throw new Error("Erro ao salvar trilha");
      const data = await resp.json();
      alert("Trilha salva com sucesso!");
      // redireciona pro dashboard para ver a trilha (index.html)
      window.location.href = "/index.html";
    } catch (err) {
      console.error("Erro salvar trilha:", err);
      alert("Erro ao salvar trilha. Veja console.");
    }
  });

  // Cancelar -> reset simples
  btnCancelar.addEventListener("click", (e) => {
    if (confirm("Cancelar e limpar formulário?")) {
      estado.modulos = [];
      estado.imagemBase64 = "";
      listaCursosEl.innerHTML = "";
      adicionarModulo(estado, listaCursosEl, "Módulo 1");
      textareaDesc.value = "";
      inputDuracao.value = "";
      inputCert.checked = false;
    }
  });

  // Render inicial
  renderizarModulos(estado, listaCursosEl);
}

// Adiciona um módulo vazio ao estado e re-renderiza
function adicionarModulo(estado, listaCursosEl, nome = "") {
  const mod = { id: gerarId("m"), nome: nome || `Módulo ${estado.modulos.length + 1}`, cursos: [] };
  estado.modulos.push(mod);
  renderizarModulos(estado, listaCursosEl);
}

// Renderiza todos módulos e seus cursos na .lista-cursos
function renderizarModulos(estado, container) {
  container.innerHTML = "";

  estado.modulos.forEach((mod, modIndex) => {
    const modEl = document.createElement("div");
    modEl.className = "modulo-item";
    modEl.style.background = "#fff";
    modEl.style.color = "#222";
    modEl.style.padding = "10px";
    modEl.style.borderRadius = "6px";
    modEl.style.marginBottom = "10px";

    const cursosHtml = (mod.cursos && mod.cursos.length)
      ? mod.cursos.map((c, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:#f2f6f8;border-radius:6px;margin-bottom:6px">
            <span>${c.titulo}</span>
            <div>
              <button class="remover-curso" data-mod="${modIndex}" data-curso="${i}">Remover</button>
            </div>
         </div>`).join("")
      : `<div style="opacity:0.7">Nenhum curso adicionado.</div>`;

    modEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${mod.nome}</strong>
        <div style="display:flex;gap:6px;">
          <button class="adicionar-curso" data-mod="${modIndex}">+ Curso</button>
          <button class="editar-mod" data-mod="${modIndex}">Editar</button>
          <button class="remover-mod" data-mod="${modIndex}">Remover</button>
        </div>
      </div>
      <div style="margin-top:8px">${cursosHtml}</div>
    `;

    container.appendChild(modEl);
  });

  // após renderizar, ligar eventos dos botões criados
  container.querySelectorAll(".adicionar-curso").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(btn.dataset.mod, 10);
      const nomeCurso = prompt("Nome do curso (bolinha):");
      if (!nomeCurso) return;
      estado.modulos[idx].cursos.push({ id: gerarId("c"), titulo: nomeCurso, concluido: false });
      renderizarModulos(estado, container);
    });
  });

  container.querySelectorAll(".editar-mod").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(btn.dataset.mod, 10);
      const novo = prompt("Nome do módulo:", estado.modulos[idx].nome);
      if (novo) {
        estado.modulos[idx].nome = novo;
        renderizarModulos(estado, container);
      }
    });
  });

  container.querySelectorAll(".remover-mod").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(btn.dataset.mod, 10);
      if (confirm("Remover módulo?")) {
        estado.modulos.splice(idx, 1);
        renderizarModulos(estado, container);
      }
    });
  });

  container.querySelectorAll(".remover-curso").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idxMod = parseInt(btn.dataset.mod, 10);
      const idxCurso = parseInt(btn.dataset.curso, 10);
      if (confirm("Remover curso?")) {
        estado.modulos[idxMod].cursos.splice(idxCurso, 1);
        renderizarModulos(estado, container);
      }
    });
  });
}

function pegarDificuldadeSelecionada() {
  const radios = document.querySelectorAll('.lista-dificuldade input[type="radio"]');
  for (let r of radios) {
    if (r.checked) {
      // o texto do li (pai) contém o label
      return r.parentElement.textContent.trim();
    }
  }
  return "FÁCIL";
}

// util: gera id simples
function gerarId(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// util: converte arquivo em base64
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.toString());
    reader.onerror = (e) => rej(e);
    reader.readAsDataURL(file);
  });
}
