const API_URL = 'http://localhost:3000';

let currentTopicId = null;


function createTopicCard(topico) {
    const dataFormatada = topico.data ? new Date(topico.data).toLocaleDateString('pt-BR') : 'Data inválida';
    const comentariosCount = topico.comentariosCount || 0;

    return `
<div class="col-md-4 mb-3">
  <div class="topico-card p-3" data-topico-id="${topico.id}">
    <div class="topico-titulo fw-bold mb-2">${topico.titulo}</div>

    <div class="topico-meta small mb-2">
      Autor: ${topico.autor || 'undefined'} |
      Categoria: ${topico.categoria || 'undefined'} |
      Data: ${dataFormatada}
    </div>

    <div class="topico-comentarios small text-muted mb-2">
      ${comentariosCount} Comentários
    </div>
    <div class="d-flex gap-2 mt-2">
      <button class="btn btn-warning btn-sm btn-editar" data-id="${topico.id}">
        Editar
      </button>

      <button class="btn btn-danger btn-sm btn-excluir" data-id="${topico.id}">
        Excluir
      </button>
    </div>
  </div>
</div>
`;
}


function renderTopics(topicos) {
    const areaTopicos = document.getElementById('areaTopicos');
    areaTopicos.innerHTML = '';
    topicos.forEach(topico => {
        areaTopicos.innerHTML += createTopicCard(topico);
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editarTopico(btn.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            excluirTopico(btn.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.topico-card').forEach(card => {
        card.addEventListener('click', function () {
            const topicoId = this.getAttribute('data-topico-id');
            openCommentsModal(topicoId);
        });
    });
}

function renderComments(comentarios) {
    const commentsBody = document.getElementById('commentsBody');
    commentsBody.innerHTML = '';
    if (!comentarios || comentarios.length === 0) {
        commentsBody.innerHTML = '<p class="text-center text-muted">Nenhum comentário ainda. Seja o primeiro!</p>';
    } else {
        comentarios.forEach(comentario => {
            commentsBody.innerHTML += createCommentItem(comentario);
        });
    }

    document.querySelectorAll('.btn-editar-comentario').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            editarComentario(btn.getAttribute('data-id'));
        });
    });


    document.querySelectorAll('.btn-excluir-comentario').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            excluirComentario(btn.getAttribute('data-id'));
        });
    });

}

function createCommentItem(comentario) {
    const dataFormatada = comentario.data
        ? new Date(comentario.data).toLocaleDateString('pt-BR')
        : 'Data inválida';

    return `
<div class="comment-item mb-2 p-2 border rounded">
    
    <div class="comment-meta small text-muted mb-1">
        <strong>${comentario.autor}</strong> em ${dataFormatada}
    </div>

    <div class="comment-text mb-2">${comentario.texto}</div>

    <div class="d-flex gap-2">
        <button class="btn btn-warning btn-sm btn-editar-comentario" data-id="${comentario.id}">
            Editar
        </button>

        <button class="btn btn-danger btn-sm btn-excluir-comentario" data-id="${comentario.id}">
            Excluir
        </button>
    </div>

</div>
`;
}


async function loadTopics() {
    try {
        const response = await fetch(`${API_URL}/topicos?_sort=data&_order=desc`);
        const topicos = await response.json();
        renderTopics(topicos);
    } catch (error) {
        console.error('Erro ao carregar tópicos:', error);
        alert('Erro ao carregar tópicos. Verifique se o json-server está rodando.');
    }
}

async function createTopic() {
    const titulo = document.getElementById('novoTitulo').value.trim();
    const autor = document.getElementById('novoAutor').value.trim();
    const categoria = document.getElementById('novaCategoria').value;

    if (!titulo || !autor) {
        alert('Por favor, preencha o título e o autor.');
        return;
    }

    const novoTopico = {
        titulo,
        autor,
        categoria,
        data: new Date().toISOString(),
        comentariosCount: 0
    };

    try {
        const response = await fetch(`${API_URL}/topicos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoTopico)
        });

        if (response.ok) {
            document.getElementById('novoTitulo').value = '';
            document.getElementById('novoAutor').value = '';
            loadTopics();
        } else {
            alert('Erro ao criar tópico.');
        }
    } catch (error) {
        console.error('Erro ao criar tópico:', error);
        alert('Erro ao criar tópico. Verifique a conexão com a API.');
    }
}

async function openCommentsModal(topicoId) {
    currentTopicId = topicoId;
    const commentsOverlay = document.getElementById('commentsOverlay');
    const modalTopicTitle = document.getElementById('modalTopicTitle');
    const modalTopicMeta = document.getElementById('modalTopicMeta');

    try {
        const topicoResponse = await fetch(`${API_URL}/topicos/${topicoId}`);
        const topico = await topicoResponse.json();
        const comentariosResponse = await fetch(`${API_URL}/comentarios?topicoId=${topicoId}&_sort=data&_order=asc`);
        const comentarios = await comentariosResponse.json();

        const dataFormatada = topico.data ? new Date(topico.data).toLocaleDateString('pt-BR') : 'Data inválida';
        modalTopicTitle.textContent = topico.titulo || topico.title || 'Sem título';
        modalTopicMeta.innerHTML = `Autor: ${topico.autor || topico.author || 'undefined'} | Categoria: ${topico.categoria || topico.category || 'undefined'} | Data: ${dataFormatada}`;
        renderComments(comentarios);

        commentsOverlay.style.display = 'flex';

    } catch (error) {
        console.error('Erro ao carregar detalhes do tópico/comentários:', error);
        alert('Erro ao carregar detalhes do tópico.');
    }
}

function closeCommentsModal() {
    document.getElementById('commentsOverlay').style.display = 'none';
    currentTopicId = null;
    document.getElementById('novoComentAutor').value = '';
    document.getElementById('novoComentTexto').value = '';
}

async function addComment() {
    if (!currentTopicId) return;
    const autor = document.getElementById('novoComentAutor').value.trim();
    const texto = document.getElementById('novoComentTexto').value.trim();

    if (!autor || !texto) {
        alert('Por favor, preencha o autor e o comentário.');
        return;
    }

    const novoComentario = {
        topicoId: parseInt(currentTopicId, 10),
        autor,
        texto,
        data: new Date().toISOString()
    };

    try {
        const commentResponse = await fetch(`${API_URL}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoComentario)
        });

        if (commentResponse.ok) {
            const topicoResponse = await fetch(`${API_URL}/topicos/${currentTopicId}`);
            const topico = await topicoResponse.json();
            const newCount = (topico.comentariosCount || 0) + 1;

            await fetch(`${API_URL}/topicos/${currentTopicId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comentariosCount: newCount })
            });
            document.getElementById('novoComentAutor').value = '';
            document.getElementById('novoComentTexto').value = '';
            openCommentsModal(currentTopicId);
            loadTopics();
        } else {
            alert('Erro ao adicionar comentário.');
        }
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        alert('Erro ao adicionar comentário. Verifique a conexão com a API.');
    }
}

async function editarTopico(id) {
    const novoTitulo = prompt("Digite o novo título do tópico:");
    if (!novoTitulo) return;

    try {
        await fetch(`${API_URL}/topicos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: novoTitulo })
        });

        alert("Tópico atualizado!");
        loadTopics();

    } catch (error) {
        console.error(error);
        alert("Erro ao editar tópico.");
    }
}

async function excluirTopico(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esse tópico?");
    if (!confirmar) return;

    try {
        await fetch(`${API_URL}/topicos/${id}`, { method: 'DELETE' });
        alert("Tópico excluído!");
        loadTopics();
    } catch (error) {
        console.error(error);
        alert("Erro ao excluir tópico.");
    }
}

let editingTopicId = null;

async function editarTopico(id) {
    editingTopicId = id;

    try {
        const response = await fetch(`${API_URL}/topicos/${id}`);
        const topico = await response.json();

        document.getElementById('editTitulo').value = topico.titulo;
        document.getElementById('editAutor').value = topico.autor;
        const catSelect = document.getElementById('editCategoria');
        catSelect.value = topico.categoria === "quentes" ? "quentes" : "recentes";

        document.getElementById('editOverlay').style.display = 'flex';
    } catch (error) {
        alert("Erro ao carregar informações para edição.");
        console.error(error);
    }
}

async function saveTopicEdit() {
    const novoTitulo = document.getElementById('editTitulo').value.trim();
    const novoAutor = document.getElementById('editAutor').value.trim();
    const novaCategoria = document.getElementById('editCategoria').value.trim();

    if (!novoTitulo || !novoAutor) {
        alert("Título e Autor são obrigatórios.");
        return;
    }

    const updatedTopic = {
        titulo: novoTitulo,
        autor: novoAutor,
        categoria: novaCategoria
    };

    try {
        await fetch(`${API_URL}/topicos/${editingTopicId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTopic)
        });

        closeEditModal();
        loadTopics();
        alert("Tópico atualizado com sucesso!");
    } catch (error) {
        console.error(error);
        alert("Erro ao salvar alterações.");
    }
}

function closeEditModal() {
    document.getElementById('editOverlay').style.display = 'none';
}

let editingCommentId = null;

async function editarComentario(id) {
    editingCommentId = id;

    try {
        const response = await fetch(`${API_URL}/comentarios/${id}`);
        const comentario = await response.json();

        document.getElementById('editComentAutor').value = comentario.autor;
        document.getElementById('editComentTexto').value = comentario.texto;

        document.getElementById('editCommentOverlay').style.display = 'flex';

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do comentário.");
    }
}

async function saveCommentEdit() {
    const autor = document.getElementById('editComentAutor').value.trim();
    const texto = document.getElementById('editComentTexto').value.trim();

    if (!autor || !texto) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        await fetch(`${API_URL}/comentarios/${editingCommentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autor, texto })
        });

        closeEditCommentModal();
        openCommentsModal(currentTopicId); // atualiza modal aberto

    } catch (err) {
        console.error(err);
        alert("Erro ao salvar edição.");
    }
}

async function excluirComentario(id) {
    if (!confirm("Deseja excluir este comentário?")) return;

    try {
        await fetch(`${API_URL}/comentarios/${id}`, {
            method: "DELETE"
        });

        openCommentsModal(currentTopicId);

    } catch (err) {
        console.error(err);
        alert("Erro ao excluir comentário.");
    }
}



document.addEventListener('DOMContentLoaded', () => {
    loadTopics();
    document.getElementById('btnCriarTopico').addEventListener('click', createTopic);
    document.getElementById('closeComments').addEventListener('click', closeCommentsModal);
    document.getElementById('btnComentar').addEventListener('click', addComment);
});