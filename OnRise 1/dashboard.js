document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------------------
    // 1. DADOS (JSON SIMULADO - Substitua pelo seu JSON real)
    // ------------------------------------------------------------------
    const TRILHAS_DATA = {
        "trilhas": [
            {
                "id": 1,
                "nome": "Introdução aos Investimentos", // Nome do Card no HTML
                "descricao": "Conceitos essenciais para começar a organizar sua vida financeira.",
                "dificuldade": "Básico",
                "duracao": "6 horas",
                "percentual": 40, // Adicionado percentual para simulação de card
                "modulos": [
                    {
                        "id": "m1",
                        "nome": "Fundamentos",
                        "cursos": [
                            { "id": "c1", "titulo": "O que é Educação Financeira?", "concluido": true },
                            { "id": "c2", "titulo": "Planejamento Básico", "concluido": true },
                            { "id": "c3", "titulo": "Gastos Fixos e Variáveis", "concluido": false }
                        ]
                    },
                    {
                        "id": "m2",
                        "nome": "Orçamento",
                        "cursos": [
                            { "id": "c4", "titulo": "Criando um Orçamento Mensal", "concluido": false },
                            { "id": "c5", "titulo": "Regra 50/30/20", "concluido": false }
                        ]
                    }
                ]
            },
            {
                "id": 2,
                "nome": "Investimento em renda fixa", // Nome do Card no HTML
                "descricao": "Entenda como investir e fazer seu dinheiro trabalhar.",
                "dificuldade": "Intermediário",
                "duracao": "8 horas",
                "percentual": 75,
                "modulos": [
                    {
                        "id": "m1",
                        "nome": "Renda Fixa",
                        "cursos": [
                            { "id": "c1", "titulo": "O que é CDB?", "concluido": true },
                            { "id": "c2", "titulo": "Liquidez e Rentabilidade", "concluido": true },
                            { "id": "c3", "titulo": "Tesouro Selic", "concluido": true },
                            { "id": "c4", "titulo": "LCI e LCA", "concluido": false }
                        ]
                    },
                    {
                        "id": "m2",
                        "nome": "Renda Variável",
                        "cursos": [
                            { "id": "c5", "titulo": "Ações — Conceitos Básicos", "concluido": false },
                            { "id": "c6", "titulo": "Fundos Imobiliários", "concluido": false }
                        ]
                    }
                ]
            },
            // Adicione os outros cards do seu HTML (CDB, tesouro direto, etc.) aqui, mapeando os nomes.
            // Para 'tesouro direto', por exemplo:
            {
                "id": 3,
                "nome": "tesouro direto",
                "dificuldade": "Avançado",
                "percentual": 95,
                "modulos": [
                    // ... Estrutura completa dos módulos/cursos do Tesouro Direto
                ]
            }
        ]
    };

    // ------------------------------------------------------------------
    // 2. ELEMENTOS E FUNÇÕES DE UTILIDADE
    // ------------------------------------------------------------------
    const cardsTrilha = document.querySelectorAll('.card-trilha');
    const tituloTrilhaSection2 = document.querySelector('.sessao-principal .top-card .large');
    const moduloTrilhaSection2 = document.querySelector('.sessao-principal .top-card .small');
    const pathContainer = document.querySelector('.path');

    // Mapeia os dados do JSON por nome para fácil acesso
    const dataMap = new Map();
    TRILHAS_DATA.trilhas.forEach(trilha => {
        // Normaliza o nome para a busca
        const nomeNormalizado = trilha.nome.toLowerCase().trim(); 
        dataMap.set(nomeNormalizado, trilha);
    });

    /**
     * Função para renderizar o Path (Zig-Zag)
     * Utiliza todos os CURSOS dentro dos MÓDULOS da trilha.
     */
    function renderizarTimeline(trilhaData) {
        pathContainer.innerHTML = '';
        if (!trilhaData || !trilhaData.modulos) return;

        // Flatten: Junta todos os cursos em uma única lista para a timeline sequencial
        let todosCursos = [];
        trilhaData.modulos.forEach(modulo => {
            todosCursos = todosCursos.concat(modulo.cursos);
        });

        if (todosCursos.length === 0) {
            pathContainer.innerHTML = '<p style="padding: 20px; text-align: center;">Nenhum curso encontrado nesta trilha.</p>';
            return;
        }

        let isCurrentSet = false; // Flag para garantir que apenas um 'current' seja definido

        todosCursos.forEach((curso, index) => {
            // 1. Cria o espaçador (linha)
            if (index > 0) {
                const lineSpacer = document.createElement('li');
                lineSpacer.classList.add('line-spacer');
                pathContainer.appendChild(lineSpacer);
            }

            // 2. Cria o nó (círculo)
            const node = document.createElement('li');
            let classes = ['node'];
            
            // Lógica de Status:
            if (curso.concluido) {
                classes.push('completed');
            } else if (!isCurrentSet && !curso.concluido) {
                // Se não está concluído e o 'current' ainda não foi definido, este é o atual
                classes.push('current');
                isCurrentSet = true; // Marca como definido
            }

            // Último item é o troféu (Certificação ou Projeto Final)
            if (index === todosCursos.length - 1) { 
                classes.push('trophy');
            }
            
            node.classList.add(...classes);

            // Cria o link do círculo
            const link = document.createElement('a');
            link.href = '#';
            link.classList.add('circle-link');
            // O nome do curso aparece como título (tooltip)
            link.title = curso.titulo;

            // Adiciona o número do passo (ou ícone, que é tratado pelo CSS)
            const iconContent = document.createElement('div');
            // Se o curso não estiver concluído e não for o troféu, mostra o número
            if (!curso.concluido && index !== todosCursos.length - 1) {
                iconContent.innerHTML = `<span class="module-number">${index + 1}</span>`;
            } else if (curso.concluido && index !== todosCursos.length - 1) {
                // Se concluído, o CSS deve mostrar o '✓'
            }
            
            link.appendChild(iconContent);
            node.appendChild(link);
            pathContainer.appendChild(node);
        });
    }

    /**
     * 3. Função principal para atualizar a Seção 2 e renderizar o Path
     */
    function atualizarSection2(card) {
        const nomeTrilhaElement = card.querySelector('.card-nome');
        if (!nomeTrilhaElement) return;

        const nomeTrilha = nomeTrilhaElement.textContent.trim().toLowerCase();
        const trilhaData = dataMap.get(nomeTrilha);
        
        // Pega as informações do card HTML (para retrocompatibilidade)
        const dificuldade = card.querySelector('.card-dificuldade').textContent.trim();
        
        // Remove a classe 'ativo' de todos os cards
        cardsTrilha.forEach(c => c.classList.remove('ativo'));

        // Adiciona a classe 'ativo' no card clicado
        card.classList.add('ativo');

        // 1. Atualiza o Top Card (Seção Principal)
        if (tituloTrilhaSection2) {
            tituloTrilhaSection2.textContent = trilhaData ? trilhaData.nome : card.querySelector('.card-nome').textContent;
        }

        if (moduloTrilhaSection2) {
            // Se trilhaData existir, podemos mostrar o Módulo/Curso atual
            let currentTitle = trilhaData ? `Nível: ${trilhaData.dificuldade.toUpperCase()}` : `Nível: ${dificuldade.toUpperCase()}`;
            
            let currentModuleIndex = 0;
            let currentCourseTitle = '';

            // Tenta encontrar o primeiro curso não concluído
            const firstUncompleted = trilhaData.modulos.flatMap(m => m.cursos).find((c, i) => {
                if (!c.concluido) {
                    currentModuleIndex = i + 1; // Número do curso na sequência
                    currentCourseTitle = c.titulo;
                    return true;
                }
                return false;
            });
            
            if (firstUncompleted) {
                moduloTrilhaSection2.textContent = `Próximo: ${currentCourseTitle.slice(0, 30)}...`;
            } else {
                 moduloTrilhaSection2.textContent = `Status: Concluído! 🏆`;
            }
        }
        
        // 2. Renderiza a timeline
        renderizarTimeline(trilhaData);
        document.querySelector('.scroll-area').scrollTop = 0; // Volta o scroll para o topo
    }
    
    
    // 4. Adicionar o ouvinte de evento (o coração da solução)
    cardsTrilha.forEach(card => {
        card.addEventListener('click', () => {
            atualizarSection2(card);
        });
    });

    // 5. Opcional: Selecionar a primeira trilha automaticamente ao carregar a página
    if (cardsTrilha.length > 0) {
        // Garante que o nome do HTML (introdução aos infestimentos) esteja no seu JSON para funcionar
        atualizarSection2(cardsTrilha[0]); 
    }
});