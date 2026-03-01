// quizEditor.js

document.addEventListener("DOMContentLoaded", () => {
    
    const quizEditorArea = document.getElementById("quiz-editor-area");
    const addQuestionBtn = document.getElementById("add-question-btn");
    let nextQuestionId = 2; // Começa em 2, pois uma pergunta já está no HTML

    /**
     * Cria a estrutura HTML de uma nova opção de resposta.
     * @param {number} questionId - ID da pergunta à qual a resposta pertence.
     * @param {number} answerNumber - Número sequencial da resposta na pergunta.
     * @param {boolean} isChecked - Se deve vir pré-selecionada como correta.
     * @param {boolean} isRemovable - Se o botão de remover deve estar visível.
     * @returns {HTMLElement} O elemento div.answer-option criado.
     */
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

    /**
     * Adiciona uma nova opção de resposta a um bloco de pergunta.
     * @param {HTMLElement} questionBlock - O bloco div.quiz-question-block.
     */
    function addAnswer(questionBlock) {
        const answerContainer = questionBlock.querySelector('.answer-options-container');
        const currentAnswers = answerContainer.querySelectorAll('.answer-option').length;
        
        if (currentAnswers >= 4) {
            alert("O máximo de respostas permitidas é 4.");
            return;
        }

        const questionId = questionBlock.dataset.questionId;
        const newAnswerNumber = currentAnswers + 1;
        
        // Cria a nova opção e a insere
        const newAnswer = createAnswerOption(questionId, newAnswerNumber, false, true);
        answerContainer.appendChild(newAnswer);

        // Atualiza a visibilidade dos botões de remover após adicionar
        updateRemoveButtons(questionBlock);
    }
    
    /**
     * Remove uma opção de resposta do bloco.
     * @param {HTMLElement} answerOption - O elemento div.answer-option a ser removido.
     */
    function removeAnswer(answerOption) {
        const questionBlock = answerOption.closest('.quiz-question-block');
        const answerContainer = questionBlock.querySelector('.answer-options-container');
        
        if (answerContainer.querySelectorAll('.answer-option').length <= 2) {
            alert("O mínimo de respostas permitidas é 2.");
            return;
        }

        // Se a resposta removida era a correta, seleciona a primeira restante
        const wasChecked = answerOption.querySelector('.correct-radio').checked;
        answerOption.remove();
        
        // Reorganiza os valores dos rádios e marca o primeiro se necessário
        const remainingRadios = answerContainer.querySelectorAll('.correct-radio');
        remainingRadios.forEach((radio, index) => {
            radio.value = index + 1;
            if (wasChecked && index === 0) {
                radio.checked = true;
            }
        });

        // Atualiza a visibilidade dos botões de remover após remover
        updateRemoveButtons(questionBlock);
    }

    /**
     * Atualiza a visibilidade dos botões de remover resposta (somente se houver mais de 2).
     * @param {HTMLElement} questionBlock - O bloco div.quiz-question-block.
     */
    function updateRemoveButtons(questionBlock) {
        const answerOptions = questionBlock.querySelectorAll('.answer-option');
        const isRemovable = answerOptions.length > 2;

        answerOptions.forEach(option => {
            const removeBtn = option.querySelector('.remove-answer-btn');
            if (removeBtn) {
                removeBtn.classList.toggle('hidden', !isRemovable);
            }
        });
        
        // Esconde ou mostra o botão de adicionar resposta (máximo 4)
        const addAnswerBtn = questionBlock.querySelector('.add-answer-btn');
        if(addAnswerBtn) {
            addAnswerBtn.disabled = answerOptions.length >= 4;
            addAnswerBtn.style.opacity = answerOptions.length >= 4 ? 0.5 : 1;
        }
    }
    
    /**
     * Cria a estrutura HTML de um novo bloco de pergunta.
     * @param {number} questionId - ID único da pergunta.
     * @returns {HTMLElement} O elemento div.quiz-question-block criado.
     */
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
        // Adiciona as 2 respostas mínimas
        answerContainer.appendChild(createAnswerOption(questionId, 1, true, false)); 
        answerContainer.appendChild(createAnswerOption(questionId, 2, false, false));

        // Adiciona listeners aos botões
        block.querySelector('.add-answer-btn').addEventListener('click', () => addAnswer(block));
        block.querySelector('.remove-question-btn').addEventListener('click', () => removeQuestion(block));
        
        // Garante que os botões de remover estejam escondidos (só há 2)
        updateRemoveButtons(block);
        
        return block;
    }

    /**
     * Remove um bloco de pergunta inteiro.
     * @param {HTMLElement} questionBlock - O bloco div.quiz-question-block a ser removido.
     */
    function removeQuestion(questionBlock) {
        if (quizEditorArea.querySelectorAll('.quiz-question-block').length <= 1) {
            alert("O quiz deve ter pelo menos uma pergunta.");
            return;
        }
        
        questionBlock.remove();
        // Reordena as labels (PERGUNTA 1, PERGUNTA 2, etc.)
        reorderQuestionLabels();
    }
    
    /**
     * Reordena as labels "PERGUNTA X" após uma exclusão.
     */
    function reorderQuestionLabels() {
        const questionBlocks = quizEditorArea.querySelectorAll('.quiz-question-block');
        questionBlocks.forEach((block, index) => {
            const newNumber = index + 1;
            block.querySelector('.small-label').textContent = `PERGUNTA ${newNumber}`;
            // Se necessário, o data-question-id e os names dos radios também podem ser atualizados aqui.
        });
    }

    // ---------- EVENTOS DE INICIALIZAÇÃO E GERAÇÃO ----------
    
    // 1. Botão Adicionar Pergunta
    addQuestionBtn.addEventListener('click', () => {
        const newBlock = createNewQuestionBlock(nextQuestionId++);
        // Insere o novo bloco antes do botão "Adicionar Pergunta"
        quizEditorArea.insertBefore(newBlock, addQuestionBtn);
        reorderQuestionLabels();
    });

    // 2. Inicializa os listeners para a pergunta de exemplo no HTML
    const initialQuestionBlock = quizEditorArea.querySelector('.quiz-question-block');
    if (initialQuestionBlock) {
        initialQuestionBlock.querySelector('.add-answer-btn').addEventListener('click', () => addAnswer(initialQuestionBlock));
        initialQuestionBlock.querySelector('.remove-question-btn').addEventListener('click', () => removeQuestion(initialQuestionBlock));
        // Inicializa listeners para as respostas iniciais
        initialQuestionBlock.querySelectorAll('.remove-answer-btn').forEach(btn => {
            btn.addEventListener('click', (event) => removeAnswer(event.target.closest('.answer-option')));
        });
        updateRemoveButtons(initialQuestionBlock);
    }
});