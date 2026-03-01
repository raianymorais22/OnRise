//popup adicionar indice
document.getElementById('addB').addEventListener('click', function () {
    document.getElementById("popupao").style.display = "flex";
});

document.getElementById('closePopup').addEventListener('click', function () {
    document.getElementById("popupao").style.display = "none";
});



async function fetchBitcoinPrice() {
    try {

        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl',
            {
                headers: {
                    "x-cg-demo-api-key": "CG-WAJ1QgiXWMNxtL3HUYNv2RDV"
                }
            }
        );
        const data = await response.json();
        document.getElementById('precoBTC').innerText = 'R$ ' + data.bitcoin.brl.toLocaleString();

        const responseeth = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=brl',
            {
                headers: {
                    "x-cg-demo-api-key": "CG-WAJ1QgiXWMNxtL3HUYNv2RDV"
                }
            }
        )
        const dataeth = await responseeth.json();
        document.getElementById('precoETH').innerText = 'R$ ' + dataeth.ethereum.brl.toLocaleString();

        const responsesol = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=brl',
            {
                headers: {
                    "x-cg-demo-api-key": "CG-WAJ1QgiXWMNxtL3HUYNv2RDV"
                }
            }
        );
        const datasol = await responsesol.json();
        document.getElementById('precoSOL').innerText = 'R$ ' + datasol.solana.brl.toLocaleString();

        const responsedoge = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=doge&vs_currencies=brl',
            {
                headers: {
                    "x-cg-demo-api-key": "CG-WAJ1QgiXWMNxtL3HUYNv2RDV"
                }
            }
        );
        const datadoge = await responsedoge.json();
        document.getElementById('precoDOGE').innerText = 'R$ ' + datadoge.doge.brl.toLocaleString();

    } catch (error) {
        console.error("Erro ao buscar preços:", error);
        document.getElementById('precoBTC').innerText = "Erro";
        document.getElementById('precoETH').innerText = "Erro";
    }
}


async function fetchDollarBRL() {
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json';
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data || data.length === 0) {
        document.getElementById('precoDolar').innerText = 'Sem dados';
        return;
    }
    const rate = data[0].valor;
    document.getElementById('precoDolar').innerText = `R$ ${rate}`;

    const urleuro = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.21619/dados/ultimos/1?formato=json';
    const respeuro = await fetch(urleuro);
    const dataeuro = await respeuro.json();
    if (!dataeuro || dataeuro.length === 0) {
        document.getElementById('precoEuro').innerText = 'Sem dados';
        return;
    }
    const rateeuro = dataeuro[0].valor;
    document.getElementById('precoEuro').innerText = `R$ ${rateeuro}`;

    const urlyen = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.21623/dados/ultimos/1?formato=json';
    const respyen = await fetch(urlyen);
    const datayen = await respyen.json();
    if (!datayen || datayen.length === 0) {
        document.getElementById('precoYen').innerText = 'Sem dados';
        return;
    }
    const rateyen = datayen[0].valor;
    document.getElementById('precoYen').innerText = `R$ ${rateyen}`;
}

fetchBitcoinPrice();
fetchDollarBRL();
setInterval(fetchBitcoinPrice, 10000);
setInterval(fetchDollarBRL, 10000);

//axios

//adicao de indice 2.0
function convFloat(str) {
    if (!str) return 0;
    return parseFloat(str.replace(",", "."));
}
document.getElementById('submitInfo').addEventListener('click', async function () {
    const novoIndice = {
        id : document.getElementById('id').value.trim(),
        nome : document.getElementById('nome').value.trim(),
        preco : convFloat(document.getElementById('preco').value.trim()),
        perCent : convFloat(document.getElementById('perCent').value.trim())
    }

    try {
        const resposta = await axios.post("http://localhost:3000/indices", novoIndice);
        console.log("Índice adicionado:", resposta.data);
        return resposta.data;
    } catch (erro) {
        console.error("Erro ao adicionar índice:", erro);
    }

    carregarIndices();
});

async function removerIndice(id) {
  try {
    await axios.delete(`http://localhost:3000/indices/${id}`);
    console.log(`Índice ${id} removido com sucesso.`);
  } catch (erro) {
    console.error("Erro ao remover índice:", erro);
  } 
  //infelizmente n consegui fazer funcionar direito a tempo :(
}

async function editarIndice(id){
    const novoIndice = {
        nome : document.getElementById('nomE').value.trim(),
        preco : convFloat(document.getElementById('precoE').value.trim()),
        perCent : convFloat(document.getElementById('perCentE').value.trim())
    }

    try {
        await axios.put(`http://localhost:3000/indices/${id}`, novoIndice);
        console.log(`Índice ${id} editado com sucesso.`);
    } catch (erro) {
        console.error("Erro ao editar índice:", erro)
    }
}

document.querySelectorAll('.rmB').forEach(btn => {
    btn.addEventListener('click', function () {
        this.closest('.caixaInfo').remove();
    });
});

async function carregarIndices() {
    try {
        const response = await axios.get('http://localhost:3000/indices');
        const indices = response.data;

        const container = document.getElementById('caixa1');

        indices.forEach(indice => {
            const id = indice.id;
            const nome = indice.nome;
            const preco = indice.preco;
            const perCent = indice.perCent;

            const caixaInfo = document.createElement('div');
            caixaInfo.classList.add('caixaInfo');

            if (parseFloat(perCent) >= 0) {
                caixaInfo.classList.add('profit');
            } else {
                caixaInfo.classList.add('loss');
            }

            caixaInfo.innerHTML = `
                <div class="ci1">
                    <p>${nome}</p>
                    <p class="preco">R$ ${parseFloat(preco).toFixed(2)}</p>
                </div>
                <div class="ci2">
                    <p class="perCent">${parseFloat(perCent) > 0 ? '+' : ''}${parseFloat(perCent).toFixed(2)}%</p>
                    <button id="rmB" class="rmB btn"><img src="imgs/trash.svg" alt="lixo"></button>
                    <button id="editB" class="rmB btn"><img src="imgs/edit.svg" alt="editar"></button>
                </div>
            `;

            const rmButton = caixaInfo.querySelector('.rmB');
            rmButton.addEventListener('click', () => {
                removerIndice(id);
            });

            const edButton = document.getElementById("editInfo");
            edButton.addEventListener('click', () => {
                editarIndice(id);
            });

            container.appendChild(caixaInfo);
        });

    } catch (error) {
        console.error("Erro ao carregar índices:", error);
    }

        //popup editar indice
    document.getElementById('editB').addEventListener('click', function () {
        document.getElementById("popupedit").style.display = "flex";
    });

    document.getElementById('closePopupedit').addEventListener('click', function () {
        document.getElementById("popupedit").style.display = "none";
    });
}



carregarIndices();


