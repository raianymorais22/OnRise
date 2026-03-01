// Configuração do Axios para JSON Server
const API_URL = 'http://localhost:3000';

// Instância do Axios configurada
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
} );

// Variáveis globais
let usuarioAtual = null;
let trilhaAtual = null;
let moduloSelecionado = null;

// Elementos do DOM
const btninfo = document.getElementById('informacoesDoUser');
const btntrilhas = document.getElementById('informacoesTrilhas');
const infos = document.querySelector(".conteudoInformacoes");
const trilhas = document.querySelector(".conteudoTrilhas");
const btnSalvar = document.getElementById('btnSalvar');
const btnExcluirConta = document.getElementById('btnExcluirConta');
const btnAlterarTrilha = document.getElementById('btnAlterarTrilha');
const btnTrocarFoto = document.getElementById('btnTrocarFoto');
const inputFoto = document.getElementById('inputFoto');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const modalModulo = document.getElementById('modalModulo');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnMarcarConcluido = document.getElementById('btnMarcarConcluido');
const modalTrilhas = document.getElementById('modalTrilhas');
const trilhasContainer = document.getElementById('trilhasContainer');
const btnFecharModalTrilhas = document.getElementById('btnFecharModalTrilhas');

// Função para carregar dados do usuário
async function carregarDados() {
    try {
        // Buscar o primeiro usuário (você pode modificar para buscar por ID específico)
        const response = await api.get('/usuarios/1');
        usuarioAtual = response.data;
        
        console.log('Dados do usuário carregados:', usuarioAtual);
        
        preencherDadosUsuario();
        await preencherDadosTrilha();
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        alert('Erro ao carregar dados do usuário. Verifique se o JSON Server está rodando.');
    }
}

// Função para preencher dados do usuário na interface
function preencherDadosUsuario() {
    if (usuarioAtual) {
        document.getElementById('usuarioNome').textContent = usuarioAtual.nome;
        document.getElementById('usuarioEmail').textContent = usuarioAtual.email;
        document.getElementById('usuarioAvatar').src = usuarioAtual.avatar || 'https://via.placeholder.com/300x300?text=Usuario';

        document.getElementById('nomeUsuario' ).value = usuarioAtual.nome || '';
        document.getElementById('emailUser').value = usuarioAtual.email || '';
        document.getElementById('telefoneUsuario').value = usuarioAtual.telefone || '';
        document.getElementById('dataNascimento').value = usuarioAtual.dataNascimento || '';
    }
}

// Função para preencher dados da trilha atual
async function preencherDadosTrilha() {
    if (usuarioAtual && usuarioAtual.trilhaAtual) {
        try {
            // Buscar trilha atual do usuário
            const response = await api.get(`/trilhas/${usuarioAtual.trilhaAtual}`);
            trilhaAtual = response.data;

            if (trilhaAtual) {
                document.getElementById('trilhaNome').textContent = trilhaAtual.nome;

                const progresso = trilhaAtual.progresso || 0;
                document.getElementById('barraProgresso').style.width = progresso + '%';

                await carregarModulos();
            }
        } catch (error) {
            console.error('Erro ao carregar trilha:', error);
        }
    }
}

// Função para carregar módulos da trilha atual
async function carregarModulos() {
    const modulosContainer = document.getElementById('modulosContainer');
    modulosContainer.innerHTML = '';

    if (trilhaAtual) {
        try {
            // Buscar módulos filtrados por trilhaId
            const response = await api.get('/modulos', {
                params: {
                    trilhaId: trilhaAtual.id
                }
            });
            const modulos = response.data;

            if (modulos.length === 0) {
                modulosContainer.innerHTML = '<p>Nenhum módulo disponível</p>';
                return;
            }

            modulos.forEach((modulo) => {
                const moduloElement = document.createElement('h3');
                moduloElement.id = 'modulo';
                moduloElement.style.opacity = modulo.concluido ? '0.7' : '1';
                moduloElement.style.display = 'flex';
                moduloElement.style.justifyContent = 'space-between';
                moduloElement.style.alignItems = 'center';

                const nomeSpan = document.createElement('span');
                nomeSpan.textContent = modulo.nome;

                const botaoVerMais = document.createElement('button');
                botaoVerMais.textContent = modulo.concluido ? '✓ CONCLUÍDO' : 'VER MAIS';
                botaoVerMais.style.background = modulo.concluido ? '#0fd1c6' : '#0fb2b0';
                botaoVerMais.style.color = '#04292e';
                botaoVerMais.style.border = 'none';
                botaoVerMais.style.padding = '8px 16px';
                botaoVerMais.style.borderRadius = '8px';
                botaoVerMais.style.cursor = 'pointer';
                botaoVerMais.style.fontWeight = 'bold';
                botaoVerMais.style.fontSize = '12px';
                botaoVerMais.addEventListener('click', (e) => {
                    e.stopPropagation();
                    abrirModalModulo(modulo);
                });

                moduloElement.appendChild(nomeSpan);
                moduloElement.appendChild(botaoVerMais);
                modulosContainer.appendChild(moduloElement);
            });
        } catch (error) {
            console.error('Erro ao carregar módulos:', error);
            modulosContainer.innerHTML = '<p>Erro ao carregar módulos</p>';
        }
    }
}

// Função para abrir modal do módulo
function abrirModalModulo(modulo) {
    moduloSelecionado = modulo;
    document.getElementById('modalTituloModulo').textContent = modulo.nome;
    document.getElementById('modalDescricaoModulo').textContent = modulo.descricao || 'Sem descrição disponível';
    document.getElementById('modalStatusModulo').textContent = modulo.concluido ? '✓ Concluído' : 'Não iniciado';

    if (modulo.concluido) {
        btnMarcarConcluido.textContent = 'Marcar como Não Concluído';
        btnMarcarConcluido.style.background = '#527577';
    } else {
        btnMarcarConcluido.textContent = 'Marcar como Concluído';
        btnMarcarConcluido.style.background = '#e94fa8';
    }

    modalModulo.style.display = 'flex';
}

// Função para fechar modal do módulo
function fecharModal() {
    modalModulo.style.display = 'none';
    moduloSelecionado = null;
}

// Função para marcar módulo como concluído/não concluído
async function marcarModuloConcluido() {
    if (moduloSelecionado) {
        try {
            // Atualizar status do módulo no servidor
            const novoStatus = !moduloSelecionado.concluido;
            const response = await api.patch(`/modulos/${moduloSelecionado.id}`, {
                concluido: novoStatus
            });

            moduloSelecionado.concluido = novoStatus;

            // Atualizar interface do modal
            document.getElementById('modalStatusModulo').textContent = moduloSelecionado.concluido ? '✓ Concluído' : 'Não iniciado';

            if (moduloSelecionado.concluido) {
                btnMarcarConcluido.textContent = 'Marcar como Não Concluído';
                btnMarcarConcluido.style.background = '#527577';
                alert('Parabéns! Módulo marcado como concluído!');
            } else {
                btnMarcarConcluido.textContent = 'Marcar como Concluído';
                btnMarcarConcluido.style.background = '#e94fa8';
                alert('Módulo marcado como não concluído');
            }

            // Recarregar módulos para atualizar a lista
            await carregarModulos();
            
            // Atualizar progresso da trilha
            await atualizarProgressoTrilha();
        } catch (error) {
            console.error('Erro ao atualizar módulo:', error);
            alert('Erro ao atualizar módulo. Tente novamente.');
        }
    }
}

// Função para calcular e atualizar progresso da trilha
async function atualizarProgressoTrilha() {
    try {
        // Buscar todos os módulos da trilha
        const response = await api.get('/modulos', {
            params: {
                trilhaId: trilhaAtual.id
            }
        });
        const modulos = response.data;

        // Calcular progresso
        const totalModulos = modulos.length;
        const modulosConcluidos = modulos.filter(m => m.concluido).length;
        const progresso = totalModulos > 0 ? Math.round((modulosConcluidos / totalModulos) * 100) : 0;

        // Atualizar progresso da trilha no servidor
        await api.patch(`/trilhas/${trilhaAtual.id}`, {
            progresso: progresso
        });

        // Atualizar interface
        trilhaAtual.progresso = progresso;
        document.getElementById('barraProgresso').style.width = progresso + '%';
    } catch (error) {
        console.error('Erro ao atualizar progresso da trilha:', error);
    }
}

// Função para abrir modal de trilhas
async function abrirModalTrilhas() {
    trilhasContainer.innerHTML = '';

    try {
        // Buscar todas as trilhas
        const response = await api.get('/trilhas');
        const todasTrilhas = response.data;

        // Filtrar trilhas disponíveis (excluir a atual)
        const trilhasDisponiveis = todasTrilhas.filter(t => t.id !== usuarioAtual.trilhaAtual);

        if (trilhasDisponiveis.length === 0) {
            trilhasContainer.innerHTML = '<p style="color: #527577; text-align: center;">Você já está inscrito em todas as trilhas disponíveis!</p>';
        } else {
            trilhasDisponiveis.forEach(trilha => {
                const cartaoTrilha = document.createElement('div');
                cartaoTrilha.style.background = '#122A44';
                cartaoTrilha.style.padding = '20px';
                cartaoTrilha.style.borderRadius = '12px';
                cartaoTrilha.style.cursor = 'pointer';
                cartaoTrilha.style.transition = 'all 0.3s ease';
                cartaoTrilha.style.border = '2px solid transparent';

                cartaoTrilha.innerHTML = `
                    <h3 style="color: #0fd1c6; margin: 0 0 10px 0; font-size: 18px;">${trilha.nome}</h3>
                    <p style="color: #FAFAFA; margin: 0 0 15px 0; font-size: 14px;">${trilha.descricao}</p>
                    <div style="background: #0fb2b0; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: #e94fa8; height: 100%; width: ${trilha.progresso}%; transition: width 0.3s ease;"></div>
                    </div>
                    <p style="color: #FAFAFA; margin: 10px 0 0 0; font-size: 12px; text-align: right;">${trilha.progresso}% concluído</p>
                `;

                cartaoTrilha.addEventListener('mouseover', () => {
                    cartaoTrilha.style.background = '#0fb2b0';
                    cartaoTrilha.style.transform = 'translateY(-5px)';
                });

                cartaoTrilha.addEventListener('mouseout', () => {
                    cartaoTrilha.style.background = '#122A44';
                    cartaoTrilha.style.transform = 'translateY(0)';
                });

                cartaoTrilha.addEventListener('click', () => {
                    selecionarTrilha(trilha);
                });

                trilhasContainer.appendChild(cartaoTrilha);
            });
        }

        modalTrilhas.style.display = 'flex';
    } catch (error) {
        console.error('Erro ao carregar trilhas:', error);
        trilhasContainer.innerHTML = '<p style="color: #527577; text-align: center;">Erro ao carregar trilhas</p>';
        modalTrilhas.style.display = 'flex';
    }
}

// Função para selecionar nova trilha
async function selecionarTrilha(trilha) {
    try {
        // Atualizar trilha atual do usuário no servidor
        await api.patch(`/usuarios/${usuarioAtual.id}`, {
            trilhaAtual: trilha.id,
            progresso: trilha.progresso
        });

        usuarioAtual.trilhaAtual = trilha.id;
        usuarioAtual.progresso = trilha.progresso;

        await preencherDadosTrilha();
        alert('Trilha alterada com sucesso!');
        fecharModalTrilhas();
    } catch (error) {
        console.error('Erro ao alterar trilha:', error);
        alert('Erro ao alterar trilha. Tente novamente.');
    }
}

// Função para fechar modal de trilhas
function fecharModalTrilhas() {
    modalTrilhas.style.display = 'none';
}

// Funções para alternar entre abas
function mostrarInformacoes() {
    infos.style.display = "flex";
    trilhas.style.display = "none";
}

function mostrarTrilhas() {
    trilhas.style.display = "flex";
    infos.style.display = "none";
}

// Função para salvar alterações do usuário
async function salvarAlteracoes() {
    const novoNome = document.getElementById('nomeUsuario').value;
    const novoEmail = document.getElementById('emailUser').value;
    const novoTelefone = document.getElementById('telefoneUsuario').value;
    const novaDataNascimento = document.getElementById('dataNascimento').value;
    const senhaAtual = document.getElementById('senhaAtual').value;
    const senhaNova = document.getElementById('senhaNova').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (!novoNome && !novoEmail && !novoTelefone && !novaDataNascimento && !senhaNova) {
        alert('Por favor, preencha pelo menos um campo');
        return;
    }

    // Validar senha se for alterada
    if (senhaNova && senhaAtual) {
        if (senhaNova !== confirmarSenha) {
            alert('As senhas não conferem!');
            return;
        }
    }

    try {
        // Preparar dados para atualização
        const dadosAtualizados = {};

        if (novoNome && novoNome !== usuarioAtual.nome) {
            dadosAtualizados.nome = novoNome;
        }

        if (novoEmail && novoEmail !== usuarioAtual.email) {
            dadosAtualizados.email = novoEmail;
        }

        if (novoTelefone) {
            dadosAtualizados.telefone = novoTelefone;
        }

        if (novaDataNascimento) {
            dadosAtualizados.dataNascimento = novaDataNascimento;
        }

        // Atualizar no servidor
        if (Object.keys(dadosAtualizados).length > 0) {
            await api.patch(`/usuarios/${usuarioAtual.id}`, dadosAtualizados);

            // Atualizar objeto local
            Object.assign(usuarioAtual, dadosAtualizados);

            // Atualizar interface
            if (dadosAtualizados.nome) {
                document.getElementById('usuarioNome').textContent = dadosAtualizados.nome;
            }
            if (dadosAtualizados.email) {
                document.getElementById('usuarioEmail').textContent = dadosAtualizados.email;
            }

            alert('Dados atualizados com sucesso!');
        }

        // Limpar campos de senha
        if (senhaNova) {
            document.getElementById('senhaAtual').value = '';
            document.getElementById('senhaNova').value = '';
            document.getElementById('confirmarSenha').value = '';
            alert('Senha alterada com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        alert('Erro ao salvar alterações. Tente novamente.');
    }
}

// Função para excluir conta
async function excluirConta() {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        try {
            await api.delete(`/usuarios/${usuarioAtual.id}`);
            alert('Conta excluída com sucesso!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Erro ao excluir conta. Tente novamente.');
        }
    }
}

// Event listeners para trocar foto
btnTrocarFoto.addEventListener("click", () => {
    inputFoto.click();
});

usuarioAvatar.addEventListener("click", () => {
    inputFoto.click();
});

inputFoto.addEventListener("change", async (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = async (evento) => {
            const novaFoto = evento.target.result;
            usuarioAvatar.src = novaFoto;

            if (usuarioAtual) {
                try {
                    // Atualizar avatar no servidor
                    await api.patch(`/usuarios/${usuarioAtual.id}`, {
                        avatar: novaFoto
                    });

                    usuarioAtual.avatar = novaFoto;
                    alert('Foto alterada com sucesso!');
                } catch (error) {
                    console.error('Erro ao atualizar foto:', error);
                    alert('Erro ao atualizar foto. Tente novamente.');
                }
            }
        };
        leitor.readAsDataURL(arquivo);
    }
});

// Event listeners para botões
btninfo.addEventListener("click", mostrarInformacoes);
btntrilhas.addEventListener("click", mostrarTrilhas);
btnSalvar.addEventListener("click", salvarAlteracoes);
btnExcluirConta.addEventListener("click", excluirConta);
btnAlterarTrilha.addEventListener("click", abrirModalTrilhas);
btnFecharModal.addEventListener("click", fecharModal);
btnMarcarConcluido.addEventListener("click", marcarModuloConcluido);
btnFecharModalTrilhas.addEventListener("click", fecharModalTrilhas);

// Event listeners para fechar modais clicando fora
modalModulo.addEventListener("click", (e) => {
    if (e.target === modalModulo) {
        fecharModal();
    }
});

modalTrilhas.addEventListener("click", (e) => {
    if (e.target === modalTrilhas) {
        fecharModalTrilhas();
    }
});

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    mostrarTrilhas();
});
