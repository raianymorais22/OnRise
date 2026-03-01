// selecionadoInformacoes.js

document.addEventListener("DOMContentLoaded", () => {
    
    // Elementos principais
    const sidebar = document.querySelector(".content-editor-sidebar");
    const typeRadios = document.querySelectorAll('input[name="content-type"]');
    const nameInput = document.querySelector(".content-item-editor .course-text-input");
    
    // Seletor de tipo no novoConteudo.js (para criar o card correto)
    const typeRadiosGlobal = window.typeRadios; 

    /**
     * Define o tipo selecionado na sidebar (radio button e seção de edição).
     * @param {string} type - O tipo do conteúdo ('video', 'text', 'file', 'quiz').
     */
    function setSidebarType(type) {
        // 1. Marca o radio correto
        const targetRadio = document.getElementById(`type-${type}`);
        if (targetRadio) {
            targetRadio.checked = true;
            
            // 2. Dispara o evento 'change' para que o 'conteudoTipo.js' atualize a seção de edição.
            // Isso garante que a seção correta (e.g., video-section, text-section) seja exibida.
            const changeEvent = new Event('change');
            targetRadio.dispatchEvent(changeEvent);
            
            // 3. Atualiza a variável global de controle de tipo, se necessário (depende da sua implementação completa)
            if(window.updateContentType) {
                window.updateContentType(type);
            }
        }
    }

    /**
     * Função chamada ao clicar em um card para abrir a sidebar de edição.
     * Deve ser definida no escopo global (ou anexada ao 'window') para funcionar com o onclick no HTML.
     * @param {HTMLElement} cardElement - O elemento div.content-item-card clicado.
     */
    window.openSidebarForEdit = function(cardElement) {
        
        // Exibe a sidebar
        sidebar.classList.add("open"); 
        // Você precisará de CSS para .content-editor-sidebar.open { right: 0; }
        
        // Exemplo: Simulação de dados a serem carregados do card
        const cardId = cardElement.getAttribute('data-id');
        
        // Na sua aplicação real, você buscará os dados do item com este cardId
        // Por enquanto, vamos simular a busca.
        const exampleData = {
            id: cardId,
            name: `Conteúdo Exemplo ${cardId}`,
            type: 'video', // Para este exemplo, usaremos 'video' como tipo padrão de simulação
            // ... outras propriedades
        };

        // 1. Define o nome no campo de input
        nameInput.value = exampleData.name;
        
        // 2. Define o tipo selecionado (o que aciona o 'conteudoTipo.js' para mostrar a seção certa)
        const typeFromCard = cardElement.dataset.type || 'video'; // Pega o tipo do atributo (se você adicioná-lo)
        setSidebarType(typeFromCard);
        
        // 3. Preenche o resto dos campos baseados no tipo
        if (typeFromCard === 'video') {
            // Lógica para carregar o URL do vídeo existente (se houver)
            // Exemplo: loadMedia(videoBox, videoPreview, exampleData.videoUrl);
        } else if (typeFromCard === 'text') {
            // Lógica para preencher a textarea de texto
        }
        
        console.log(`Abrindo edição para o card ID: ${cardId} do tipo: ${typeFromCard}`);
    }
    
    // Adiciona o listener para fechar a sidebar (exemplo: ao clicar fora ou em um botão 'Fechar' futuro)
    // Para simplificar, vou adicionar um listener simples, mas você precisará de um botão "Fechar" no seu aside.
    /*
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !event.target.closest('.content-item-card')) {
            // sidebar.classList.remove("open");
        }
    });
    */
});