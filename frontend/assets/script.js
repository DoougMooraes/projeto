/**
 * script.js - Lógica de interação com a API e manipulação do DOM.
 * Todas as funções e variáveis estão em português.
 */

// URL base da API
const URL_API = 'http://localhost:3000/api';

/**
 * Função para buscar estabelecimentos e exibir os destaques na home page.
 */
async function buscarDestaques() {
    try {
        const resposta = await fetch(`${URL_API}/estabelecimentos`);
        const estabelecimentos = await resposta.json();
        // Seleciona os 5 primeiros estabelecimentos para os destaques
        const destaques = estabelecimentos.slice(0, 5);
        const container = document.getElementById('cards-destaques');
        container.innerHTML = '';
        destaques.forEach(estabelecimento => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${estabelecimento.banner}" alt="Imagem de ${estabelecimento.nome}">
                <h3>${estabelecimento.nome}</h3>
                <p>${estabelecimento.descricao}</p>
                <a href="estabelecimento.html?id=${estabelecimento.id}">Ver detalhes</a>
            `;
            container.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao buscar destaques:', erro);
    }
}

/**
 * Função para realizar login.
 */
async function realizarLogin(evento) {
    evento.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    try {
        const resposta = await fetch(`${URL_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const dados = await resposta.json();
        if (resposta.ok) {
            // Armazena o token no localStorage para autenticação em requisições futuras
            localStorage.setItem('token', dados.token);
            alert(dados.mensagem);
            window.location.href = 'index.html';
        } else {
            alert(dados.mensagem);
        }
    } catch (erro) {
        console.error('Erro ao realizar login:', erro);
    }
}

/**
 * Função para carregar os detalhes de um estabelecimento.
 */
async function carregarDetalhesEstabelecimento() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;
    
    try {
        const resposta = await fetch(`${URL_API}/estabelecimento/${id}`);
        const estabelecimento = await resposta.json();
        
        document.getElementById('nome-estabelecimento').textContent = estabelecimento.nome;
        document.getElementById('banner-estabelecimento').src = estabelecimento.banner;
        document.getElementById('descricao-estabelecimento').textContent = estabelecimento.descricao;
        
        // Inicializa o mapa usando o endereço do estabelecimento
        inicializarMapa(estabelecimento.endereco);
        
        // Carrega as avaliações do estabelecimento
        carregarAvaliacoes(id);
    } catch (erro) {
        console.error('Erro ao carregar detalhes do estabelecimento:', erro);
    }
}

/**
 * Função para inicializar o Google Maps com base no endereço do estabelecimento.
 * Utiliza a API do Google Maps para geolocalização.
 */
function inicializarMapa(endereco) {
    const geocoder = new google.maps.Geocoder();
    const mapaDiv = document.getElementById('mapa');
    const mapa = new google.maps.Map(mapaDiv, {
        zoom: 15,
        center: { lat: -23.5505, lng: -46.6333 } // Centro padrão (São Paulo)
    });
    geocoder.geocode({ address: endereco }, (resultados, status) => {
        if (status === 'OK') {
            mapa.setCenter(resultados[0].geometry.location);
            new google.maps.Marker({
                map: mapa,
                position: resultados[0].geometry.location
            });
        } else {
            console.error('Erro na geolocalização: ' + status);
        }
    });
}

/**
 * Função para carregar as avaliações de um estabelecimento.
 */
async function carregarAvaliacoes(idEstabelecimento) {
    try {
        const resposta = await fetch(`${URL_API}/avaliacoes/${idEstabelecimento}`);
        const avaliacoes = await resposta.json();
        const container = document.getElementById('lista-avaliacoes');
        container.innerHTML = '';
        avaliacoes.forEach(avaliacao => {
            const divAvaliacao = document.createElement('div');
            divAvaliacao.classList.add('avaliacao');
            divAvaliacao.innerHTML = `
                <p><strong>${avaliacao.nome_usuario}:</strong> ${avaliacao.comentario} (${avaliacao.estrelas} estrelas)</p>
            `;
            container.appendChild(divAvaliacao);
        });
    } catch (erro) {
        console.error('Erro ao carregar avaliações:', erro);
    }
}

/**
 * Função para enviar uma nova avaliação.
 */
async function enviarAvaliacao(evento) {
    evento.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const idEstabelecimento = urlParams.get('id');
    const estrelas = document.getElementById('estrelas').value;
    const comentario = document.getElementById('comentario').value;
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Você precisa estar logado para enviar uma avaliação.');
        return;
    }
    
    try {
        const resposta = await fetch(`${URL_API}/avaliacao`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ idEstabelecimento, estrelas, comentario })
        });
        const dados = await resposta.json();
        if (resposta.ok) {
            alert(dados.mensagem);
            // Atualiza a lista de avaliações
            carregarAvaliacoes(idEstabelecimento);
        } else {
            alert(dados.mensagem);
        }
    } catch (erro) {
        console.error('Erro ao enviar avaliação:', erro);
    }
}

// Eventos de inicialização conforme a página
document.addEventListener('DOMContentLoaded', () => {
    // Se estivermos na página de login
    if (document.getElementById('form-login')) {
        document.getElementById('form-login').addEventListener('submit', realizarLogin);
    }
    
    // Se estivermos na home page, carrega os destaques
    if (document.getElementById('cards-destaques')) {
        buscarDestaques();
    }
    
    // Se estivermos na página de estabelecimento, carrega os detalhes e configura o envio de avaliação
    if (document.getElementById('detalhes-estabelecimento')) {
        carregarDetalhesEstabelecimento();
        document.getElementById('form-avaliacao').addEventListener('submit', enviarAvaliacao);
    }
});


// Função para decodificar o payload do JWT (sem verificação de assinatura)
// Essa função assume que o token está no formato header.payload.signature
function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        // Obtém o payload (segunda parte do token) e converte de base64 para JSON
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.id;
    } catch (e) {
        console.error('Erro ao decodificar token', e);
        return null;
    }
}

/**
 * Função para carregar as avaliações de um estabelecimento.
 * Além de exibir as avaliações, adiciona um botão "Editar" se a avaliação pertencer ao usuário logado.
 */
async function carregarAvaliacoes(idEstabelecimento) {
    try {
        const resposta = await fetch(`${URL_API}/avaliacoes/${idEstabelecimento}`);
        const avaliacoes = await resposta.json();
        const container = document.getElementById('lista-avaliacoes');
        container.innerHTML = '';
        
        // Obtém o id do usuário logado decodificando o token
        const usuarioLogadoId = getUserIdFromToken();
        
        avaliacoes.forEach(avaliacao => {
            // Cria o container da avaliação
            const divAvaliacao = document.createElement('div');
            divAvaliacao.classList.add('avaliacao');
            // Exibe as informações da avaliação
            divAvaliacao.innerHTML = `
                <p><strong>${avaliacao.nome_usuario}:</strong> ${avaliacao.comentario} (${avaliacao.estrelas} estrelas)</p>
            `;
            
            // Se a avaliação pertence ao usuário logado, adiciona o botão "Editar"
            if (usuarioLogadoId && parseInt(avaliacao.id_usuario) === usuarioLogadoId) {
                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar';
                // Redireciona para a página de edição passando o id da avaliação na URL
                btnEditar.addEventListener('click', () => {
                    window.location.href = `editar-avaliacao.html?id=${avaliacao.id}&estabelecimento=${idEstabelecimento}`;
                });
                divAvaliacao.appendChild(btnEditar);
            }
            
            container.appendChild(divAvaliacao);
        });
    } catch (erro) {
        console.error('Erro ao carregar avaliações:', erro);
    }
}

// Se estivermos na página de detalhes do estabelecimento, carrega os detalhes e as avaliações
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('detalhes-estabelecimento')) {
        carregarDetalhesEstabelecimento();
        document.getElementById('form-avaliacao').addEventListener('submit', enviarAvaliacao);
    }
});

