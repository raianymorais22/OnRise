document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // --- FUNÇÕES DE LÓGICA DE UPLOAD (DO editarCurso.js) ---
    // =======================================================

    /**
     * Adiciona a mídia selecionada ao box de upload, mostrando a pré-visualização.
     */
    function loadMedia(box, preview, src) {
        preview.src = src; 
        
        preview.classList.remove("hidden");
        box.querySelector(".upload-text").classList.add("hidden");
        box.querySelector(".upload-controls").classList.remove("hidden");
        box.classList.add("has-media"); 
    }

    /**
     * Remove a mídia do box de upload e limpa o input file.
     */
    function deleteMedia(box, preview) {
        preview.src = "";
        preview.classList.add("hidden");
        box.querySelector(".upload-text").classList.remove("hidden");
        box.querySelector(".upload-controls").classList.add("hidden");
        box.classList.remove("has-media");
        
        const inputFile = box.querySelector("input[type='file']");
        if (inputFile) {
            inputFile.value = "";
        }
    }

    /**
     * Configura o input file, anexando-o ao box de upload.
     */
    function setupFileInput(box, acceptType) {
        let input = box.querySelector("input[type='file']");
        
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = acceptType; 
            input.style.display = 'none'; 
            box.appendChild(input);
        }
        return input;
    }

    /**
     * Configura a lógica de clique e mudança (change) para um box de upload.
     */
    function setupUploadLogic(box, preview, input) {
        // 1. Ouve o clique no BOX
        box.addEventListener("click", e => {
            if (!box.classList.contains("has-media") && !e.target.classList.contains("upload-delete")) {
                input.click(); 
            }
        });
        
        // 2. Ouve a SELEÇÃO de um arquivo
        input.addEventListener("change", () => {
            if (input.files && input.files.length > 0) {
                const file = input.files[0];
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const mediaUrl = e.target.result;
                    loadMedia(box, preview, mediaUrl);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 3. Listener para o botão de exclusão
        const deleteBtn = box.querySelector(".upload-delete");
        if(deleteBtn) {
            deleteBtn.onclick = e => {
                e.stopPropagation(); 
                deleteMedia(box, preview);
            };
        }
    }
    
    // --- INICIALIZAÇÃO DA CAPA (IMAGEM) ---
    const imageBox = document.getElementById("course-image-box");
    const imagePreview = document.getElementById("course-image-preview");
    if (imageBox && imagePreview) {
        const imageInput = setupFileInput(imageBox, 'image/*');
        setupUploadLogic(imageBox, imagePreview, imageInput);
    }

    // --- INICIALIZAÇÃO DO VÍDEO ---
    const videoBox = document.getElementById("video-upload-box");
    const videoPreview = document.getElementById("video-frame-preview");
    if (videoBox && videoPreview) {
        const videoInput = setupFileInput(videoBox, 'video/*');
        setupUploadLogic(videoBox, videoPreview, videoInput);
    }


    // =====================================================================
    // --- LÓGICA DE EXIBIÇÃO DE SEÇÃO POR TIPO (DO conteudoTipo.js) ---
    // =====================================================================
    
    /**
     * Função que atualiza qual seção de edição de conteúdo deve ser exibida.
     */
    function updateContentTypeSections() {
        const selected = document.querySelector("input[name='content-type']:checked");
        if (!selected) return;
        
        const type = selected.id.replace("type-", "");

        // Oculta TODAS as seções
        document.querySelectorAll(".content-type-section").forEach(sec => {
            sec.style.display = "none";
        });

        // Mostra a selecionada
        const target = document.querySelector("." + type + "-section");
        if (target) target.style.display = "block";
    }

    // Listener nos 4 radios
    document.querySelectorAll("input[name='content-type']").forEach(radio => {
        radio.addEventListener("change", updateContentTypeSections);
    });

    updateContentTypeSections();


    // ======================================================
    // --- LÓGICA DE CRIAÇÃO/EXCLUSÃO (DO novoConteudo.js) ---
    // ======================================================
    
    const grid = document.getElementById("content-edit-grid");
    const confirmBar = document.getElementById("confirmBar");

    const modalCancelBtn = document.querySelector(".confirm-cancel");
    const modalConfirmBtn = document.querySelector(".confirm-ok");
    const addBtn = document.getElementById("add-content-card-btn");
    const typeRadios = document.querySelectorAll('input[name="content-type"]');
    const nameInput = document.querySelector(".content-item-editor .course-text-input"); // Usado na seção de salvar

    let currentType = "video";
    let itemToDelete = null;
    let uniqueId = 1;
    
    // RASTREIA O CARD ATUALMENTE SELECIONADO
    let currentSelectedCard = null;


    // --- ATUALIZA O TIPO & O ÍCONE (AQUI ESTÁ A NOVIDADE) ---
    typeRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const newType = radio.id.replace("type-", "");
            currentType = newType;
            
            // NOVO: Atualiza o ícone do card na grade IMEDIATAMENTE
            if (currentSelectedCard) {
                const iconImg = currentSelectedCard.querySelector('.content-item-image');
                if (iconImg) {
                    iconImg.src = getIconByType(newType);
                }
                // NOVO: Atualiza o atributo data-type (usado na hora de salvar)
                currentSelectedCard.setAttribute("data-type", newType);
            }
        });
    });


    // --- RETORNA ÍCONE DE ACORDO COM O TIPO ---
    function getIconByType(type) {
        switch (type) {
            case "video": return "../icons/content-video.png";
            case "text": return "../icons/content-text.png";
            case "file": return "../icons/content-file.png";
            case "quiz": return "../icons/content-quiz.png";
            default: return "../icons/content-icon.png";
        }
    }


    // --- CRIA UM NOVO CARD ---
    function createNewContentCard() {
        const card = document.createElement("div");
        const cardId = 'content-' + uniqueId++;

        card.classList.add("content-item-card");
        card.setAttribute("data-id", cardId);
        card.setAttribute("data-type", currentType);
        
        card.setAttribute("onclick", "openSidebarForEdit(this)"); 

        const iconPath = getIconByType(currentType);

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


    // --- ABRIR/FECHAR/CONFIRMAR BARRA DE CONFIRMAÇÃO ---
    function openConfirmBar(id) {
        itemToDelete = id;
        confirmBar.classList.remove("hidden");
    }

    function closeConfirmBar() {
        itemToDelete = null;
        confirmBar.classList.add("hidden");
    }

    function confirmDelete() {
        if (itemToDelete !== null) {
            const card = document.querySelector(`[data-id="${itemToDelete}"]`);
            if (card) {
                if (card.classList.contains('selected-card')) {
                    window.closeSidebar(); 
                }
                card.remove();
            }
        }
        closeConfirmBar();
    }


    // --- EVENTOS DO novoConteudo.js ---
    addBtn.addEventListener('click', createNewContentCard);
    modalCancelBtn.addEventListener('click', closeConfirmBar);
    modalConfirmBtn.addEventListener('click', confirmDelete);


    // ========================================================
    // --- LÓGICA DE EDIÇÃO DE QUIZ (DO quizEditor.js) ---
    // ========================================================

    const quizEditorArea = document.getElementById("quiz-editor-area");
    const addQuestionBtn = document.getElementById("add-question-btn");
    let nextQuestionId = 2; 

    /** Cria a estrutura HTML de uma nova opção de resposta. */
    function createAnswerOption(questionId, answerNumber, isChecked = false, isRemovable = true) {
        const option = document.createElement("div");
        option.classList.add("answer-option");
        option.innerHTML = `
            <input type="radio" name="correct-answer-${questionId}" class="correct-radio" value="${answerNumber}" ${isChecked ? 'checked' : ''}>
            <input type="text" class="course-text-input answer-input" placeholder="Opção de resposta ${answerNumber}">
            <button class="remove-answer-btn" style="${isRemovable ? '' : 'display: none;'}">✕</button>
        `;

        const removeBtn = option.querySelector('.remove-answer-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => removeAnswer(option));
        }
        return option;
    }

    /** Adiciona uma nova opção de resposta a um bloco de pergunta. */
    function addAnswer(questionBlock) {
        const answerContainer = questionBlock.querySelector('.answer-options-container');
        const currentAnswers = answerContainer.querySelectorAll('.answer-option').length;
        
        if (currentAnswers >= 4) {
            alert("O máximo de respostas permitidas é 4.");
            return;
        }

        const questionId = questionBlock.dataset.questionId;
        const newAnswerNumber = currentAnswers + 1;
        
        const newAnswer = createAnswerOption(questionId, newAnswerNumber, false, true);
        answerContainer.appendChild(newAnswer);

        updateRemoveButtons(questionBlock);
    }
    
    /** Remove uma opção de resposta do bloco. */
    function removeAnswer(answerOption) {
        const questionBlock = answerOption.closest('.quiz-question-block');
        const answerContainer = questionBlock.querySelector('.answer-options-container');
        
        if (answerContainer.querySelectorAll('.answer-option').length <= 2) {
            alert("O mínimo de respostas permitidas é 2.");
            return;
        }

        const wasChecked = answerOption.querySelector('.correct-radio').checked;
        answerOption.remove();
        
        const remainingRadios = answerContainer.querySelectorAll('.correct-radio');
        remainingRadios.forEach((radio, index) => {
            radio.value = index + 1;
            if (wasChecked && index === 0) {
                radio.checked = true;
            }
        });

        updateRemoveButtons(questionBlock);
    }

    /** Atualiza a visibilidade dos botões de remover resposta. */
    function updateRemoveButtons(questionBlock) {
        const answerOptions = questionBlock.querySelectorAll('.answer-option');
        const isRemovable = answerOptions.length > 2;

        answerOptions.forEach(option => {
            const removeBtn = option.querySelector('.remove-answer-btn');
            if (removeBtn) {
                removeBtn.classList.toggle('hidden', !isRemovable);
            }
        });
        
        const addAnswerBtn = questionBlock.querySelector('.add-answer-btn');
        if(addAnswerBtn) {
            addAnswerBtn.disabled = answerOptions.length >= 4;
            addAnswerBtn.style.opacity = answerOptions.length >= 4 ? 0.5 : 1;
        }
    }
    
    /** Cria a estrutura HTML de um novo bloco de pergunta. */
    function createNewQuestionBlock(questionId) {
        const block = document.createElement("div");
        block.classList.add("quiz-question-block");
        block.dataset.questionId = questionId;
        
        block.innerHTML = `
            <label class="input-label small-label">PERGUNTA ${questionId}</label>
            <textarea class="course-textarea textarea-sm-sidebar" placeholder="Digite o texto da pergunta..."></textarea>
            
            <label class="input-label small-label">RESPOSTAS (2 a 4)</label>
            <div class="answer-options-container">
                </div>
            
            <div class="quiz-controls">
                <button class="add-answer-btn">+ Adicionar Resposta</button>
                <button class="remove-question-btn">Excluir Pergunta</button>
            </div>
        `;
        
        const answerContainer = block.querySelector('.answer-options-container');
        answerContainer.appendChild(createAnswerOption(questionId, 1, true, false)); 
        answerContainer.appendChild(createAnswerOption(questionId, 2, false, false));

        block.querySelector('.add-answer-btn').addEventListener('click', () => addAnswer(block));
        block.querySelector('.remove-question-btn').addEventListener('click', () => removeQuestion(block));
        
        updateRemoveButtons(block);
        
        return block;
    }

    /** Remove um bloco de pergunta inteiro. */
    function removeQuestion(questionBlock) {
        if (quizEditorArea.querySelectorAll('.quiz-question-block').length <= 1) {
            alert("O quiz deve ter pelo menos uma pergunta.");
            return;
        }
        
        questionBlock.remove();
        reorderQuestionLabels();
    }
    
    /** Reordena as labels "PERGUNTA X" após uma exclusão. */
    function reorderQuestionLabels() {
        const questionBlocks = quizEditorArea.querySelectorAll('.quiz-question-block');
        questionBlocks.forEach((block, index) => {
            const newNumber = index + 1;
            block.querySelector('.small-label').textContent = `PERGUNTA ${newNumber}`;
        });
    }

    // --- EVENTOS DE INICIALIZAÇÃO E GERAÇÃO DO quizEditor.js ---
    addQuestionBtn.addEventListener('click', () => {
        const newBlock = createNewQuestionBlock(nextQuestionId++);
        quizEditorArea.insertBefore(newBlock, addQuestionBtn);
        reorderQuestionLabels();
    });

    const initialQuestionBlock = quizEditorArea.querySelector('.quiz-question-block');
    if (initialQuestionBlock) {
        initialQuestionBlock.querySelector('.add-answer-btn').addEventListener('click', () => addAnswer(initialQuestionBlock));
        initialQuestionBlock.querySelector('.remove-question-btn').addEventListener('click', () => removeQuestion(initialQuestionBlock));
        initialQuestionBlock.querySelectorAll('.remove-answer-btn').forEach(btn => {
            btn.addEventListener('click', (event) => removeAnswer(event.target.closest('.answer-option')));
        });
        updateRemoveButtons(initialQuestionBlock);
    }


    // ========================================================
    // --- LÓGICA DE ARRASTAR E SOLTAR (DO segurarArrastar.js) ---
    // ========================================================

    const addButtonSortable = document.getElementById("add-content-card-btn");

    if (document.getElementById("content-edit-grid") && window.Sortable) {
        new Sortable(document.getElementById("content-edit-grid"), {
            animation: 150,
            ghostClass: "drag-ghost",       
            chosenClass: "drag-selected",   
            dragClass: "drag-moving",       
            handle: ".icon-wrapper",        
            filter: "#add-content-card-btn", 
            onMove: (evt) => {
                if (evt.related === addButtonSortable) return false;
            }
        });
    }


    // =========================================================================
    // --- LÓGICA DA SIDEBAR DE EDIÇÃO E SALVAMENTO (selecionadoInformacoes.js) ---
    // =========================================================================

    const sidebar = document.querySelector(".content-editor-sidebar");

    /**
     * Define o tipo selecionado na sidebar.
     */
    function setSidebarType(type) {
        const targetRadio = document.getElementById(`type-${type}`);
        if (targetRadio) {
            targetRadio.checked = true;
            
            const changeEvent = new Event('change');
            targetRadio.dispatchEvent(changeEvent);
        }
    }

    /**
     * Função GLOBAL: Abre a sidebar e marca o card selecionado.
     */
    window.openSidebarForEdit = function(cardElement) {
        
        // --- 1. LÓGICA DE SELEÇÃO ÚNICA ---
        if (currentSelectedCard && currentSelectedCard !== cardElement) {
            currentSelectedCard.classList.remove('selected-card');
        }
        
        cardElement.classList.add('selected-card');
        currentSelectedCard = cardElement;
        
        // --- 2. LÓGICA DA SIDEBAR ---
        sidebar.classList.add("open"); 
        
        const cardId = cardElement.getAttribute('data-id');

        // 3. Define o nome no campo de input (simulação)
        const cardName = currentSelectedCard.getAttribute('data-name') || `Conteúdo Exemplo ${cardId}`;
        nameInput.value = cardName;
        
        // 4. Define o tipo selecionado
        const typeFromCard = cardElement.dataset.type || 'video';
        setSidebarType(typeFromCard);
        
        // 5. Lógica para carregar o conteúdo real do card (a ser implementada)
    }
    
    /**
     * Função GLOBAL: Fecha a sidebar e desmarca o card.
     */
    window.closeSidebar = function() {
        sidebar.classList.remove("open");
        
        if (currentSelectedCard) {
            currentSelectedCard.classList.remove('selected-card');
            currentSelectedCard = null;
        }
        nameInput.value = ""; // Limpa o nome ao fechar
    }

    
    /**
     * Coleta todos os dados do conteúdo sendo editado.
     */
    function getCurrentContentData(cardElement) {
        const type = cardElement.getAttribute("data-type");
        const id = cardElement.getAttribute("data-id");

        // Esta é a parte que você expandiria para coletar DADOS REAIS
        let contentData = {
            id: id,
            type: type,
            name: nameInput.value, // Pega o nome atual do input da sidebar
            // Adicione mais campos aqui, baseados no 'type'
            // Ex: videoUrl: type === 'video' ? document.getElementById('video-url-input').value : null,
            // Ex: textContent: type === 'text' ? document.getElementById('text-area-input').value : null,
        };

        // Simulação de dados do Quiz
        if (type === 'quiz') {
            const questions = [];
            document.querySelectorAll('.quiz-question-block').forEach(qBlock => {
                const questionText = qBlock.querySelector('.course-textarea').value;
                const answers = [];
                qBlock.querySelectorAll('.answer-option').forEach((aOption, index) => {
                    const answerText = aOption.querySelector('.answer-input').value;
                    const isCorrect = aOption.querySelector('.correct-radio').checked;
                    answers.push({ text: answerText, is_correct: isCorrect });
                });
                questions.push({ question: questionText, answers: answers });
            });
            contentData.quizData = questions;
        }

        return contentData;
    }

    /**
     * Coleta todos os dados do curso e dos conteúdos na ordem atual.
     */
    function getCourseData() {
        const contentGrid = document.getElementById("content-edit-grid");
        const contentItems = contentGrid.querySelectorAll(".content-item-card");

        // Esta função apenas retorna a ORDEM e o TIPO de todos os cards
        const contents = Array.from(contentItems).map((card, index) => {
            return {
                id: card.getAttribute("data-id"),
                position: index + 1,
                type: card.getAttribute("data-type"),
                name: card.getAttribute("data-name") || `Conteúdo ${card.getAttribute("data-id")}`
            };
        });
        
        // Simulação dos dados principais do curso
        const courseData = {
            id: "curso-001", // ID Fixo do curso sendo editado (você deve obter o ID real)
            name: document.getElementById("course-main-name-input")?.value || "Nome do Curso Principal", // Supondo um input de nome principal
            // cover_image: 'url_da_imagem.jpg', // Obter do preview
            contents_order: contents,
            // TODO: Você precisará de uma coleção separada para o CONTEÚDO DETALHADO (textos, quizzes, etc.)
            // Aqui estamos apenas salvando a ESTRUTURA e ORDEM.
        };
        
        return courseData;
    }

    /**
     * Simula o envio de dados para o servidor (db.json).
     * @param {object} data - Os dados completos do curso para salvar.
     */
    function simulateDatabaseSave(data) {
        
        // --- PASSO 1: SALVAR O CONTEÚDO DETALHADO DO CARD ATUAL (PATCH/PUT no /contents/:id) ---
        const contentDetails = getCurrentContentData(currentSelectedCard);
        
        console.log("--- 1. SALVANDO DETALHES DO CARD ---");
        console.log(JSON.stringify(contentDetails, null, 2));

        // Atualiza o atributo data-name no card para visualização futura
        currentSelectedCard.setAttribute('data-name', contentDetails.name);
        // Atualiza o tipo (já foi feito no listener, mas redundância é boa)
        currentSelectedCard.setAttribute('data-type', contentDetails.type);

        // --- PASSO 2: SALVAR ESTRUTURA COMPLETA DO CURSO (PATCH/PUT no /courses/:id) ---
        const courseStructure = getCourseData();
        
        console.log("--- 2. SALVANDO ESTRUTURA E ORDEM DO CURSO ---");
        console.log(JSON.stringify(courseStructure, null, 2));

        // ESTA É A PARTE QUE VOCÊ PRECISA SUBSTITUIR POR UM FETCH REAL:
        /*
        fetch('http://localhost:3000/courses/curso-001', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseStructure),
        })
        .then(response => response.json())
        .then(result => {
            alert('Estrutura e ordem salvas com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao salvar estrutura:', error);
        });
        */
        
        alert('Simulação: Alterações salvas com sucesso! Verifique o console para os dados que seriam enviados ao db.json.');
    }

    /**
     * Função principal chamada pelo botão SALVAR.
     */
    function saveContentChanges() {
        if (!currentSelectedCard) {
            alert("Nenhum conteúdo selecionado para salvar.");
            return;
        }

        // 1. Salva os dados do card atual e a estrutura do curso (simulação de fetch)
        simulateDatabaseSave();
        
        // 2. Fecha a sidebar
        window.closeSidebar();
    }

    // Listener para o botão SALVAR ALTERAÇÕES
    const saveBtn = document.getElementById("save-content-btn");
    if (saveBtn) {
        saveBtn.addEventListener('click', saveContentChanges);
    }

});