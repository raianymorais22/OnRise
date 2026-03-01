const grid = document.getElementById("content-edit-grid");
const confirmBar = document.getElementById("confirmBar");

// BOTÕES DENTRO DA BARRA DE CONFIRMAÇÃO
const modalCancelBtn = document.querySelector(".confirm-cancel");
const modalConfirmBtn = document.querySelector(".confirm-ok");
const addBtn = document.getElementById("add-content-card-btn");
const typeRadios = document.querySelectorAll('input[name="content-type"]');

let currentType = "video";

let itemToDelete = null;
let uniqueId = 1;


// ---------- ATUALIZA O TIPO QUANDO O USUÁRIO TROCA ----------
typeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        currentType = radio.id.replace("type-", "");
        // "type-video" -> "video"
        console.log("Tipo Selecionado (currentType):", currentType); // LOG DE CONTROLE
    });
});


// ---------- RETORNA ÍCONE DE ACORDO COM O TIPO ----------
function getIconByType(type) {

    console.log("Função getIconByType - Tipo recebido:", type);

    switch (type) {
        case "video":
            return "../icons/content-video.png";
        case "text":
            return "../icons/content-text.png";
        case "file":
            return "../icons/content-file.png";
        case "quiz":
            return "../icons/content-quiz.png";
        default:
            console.log("!!! ATENÇÃO: getIconByType CAIU NO DEFAULT. Verifique a variável 'type'.");
            return "../icons/content-icon.png";
    }
}


// ---------- CRIA UM NOVO CARD ----------
function createNewContentCard() {

    const card = document.createElement("div");
    const cardId = 'content-' + uniqueId++;

    card.classList.add("content-item-card");
    card.setAttribute("data-id", cardId);
    card.setAttribute("data-type", currentType); // <-- NOVO: Adiciona o tipo do conteúdo
    card.setAttribute("onclick", "openSidebarForEdit(this)");

    // DEFINE O ÍCONE COM BASE NO TIPO SELECIONADO
    const iconPath = getIconByType(currentType);
    console.log(`Novo Card criado com ID: ${cardId}. Caminho do Ícone: ${iconPath}`);

    card.innerHTML = `
        <div class="icon-wrapper" draggable="true">
            <img src="${iconPath}" class="content-item-image">
        </div>
        <button class="remove-content-btn">✕</button>
    `;

    const removeBtn = card.querySelector('.remove-content-btn');
    removeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        openConfirmBar(cardId);
    });

    const addCard = grid.querySelector('#add-content-card-btn');

    if (addCard) {
        grid.insertBefore(card, addCard);
    } else {
        grid.appendChild(card);
    }
}


// ---------- ABRIR BARRA ----------
function openConfirmBar(id) {
    itemToDelete = id;
    confirmBar.classList.remove("hidden");
}

// ---------- FECHAR BARRA ----------
function closeConfirmBar() {
    itemToDelete = null;
    confirmBar.classList.add("hidden");
}

// ---------- CONFIRMAR EXCLUSÃO ----------
function confirmDelete() {
    if (itemToDelete !== null) {
        const card = document.querySelector(`[data-id="${itemToDelete}"]`);
        if (card) {
            card.remove();
        }
    }
    closeConfirmBar();
}


// ---------- EVENTOS ----------
addBtn.addEventListener('click', createNewContentCard);
modalCancelBtn.addEventListener('click', closeConfirmBar);
modalConfirmBtn.addEventListener('click', confirmDelete);