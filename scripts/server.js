const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../')));

let totalJogadores = 0;
let cenaAtual = 'prologo';
let historicoPaths = [];
let contagemVotos = {}; // Guarda os votos da rodada atual

io.on('connection', (socket) => {
    totalJogadores++;
    console.log(`Novo jogador conectado. Total: ${totalJogadores}`);

    io.emit('update_players', totalJogadores);
    
    // Envia o estado atual do jogo e os votos que já rolaram
    socket.emit('estado_inicial', { cena: cenaAtual, paths: historicoPaths, votos: contagemVotos });

    // Quando um JOGADOR vota
    socket.on('enviar_voto', (idEscolha) => {
        if (!contagemVotos[idEscolha]) {
            contagemVotos[idEscolha] = 0;
        }
        contagemVotos[idEscolha]++;
        // Avisa todo mundo (especialmente o Mestre) sobre os votos
        io.emit('atualizar_votos', contagemVotos);
    });

    // Quando o MESTRE decide avançar a história
    socket.on('escolha_feita_pelo_mestre', (dados) => {
        cenaAtual = dados.target;
        contagemVotos = {}; // Zera os votos para a nova fase
        
        if (dados.pathName) {
            historicoPaths.push(dados.pathName);
        }
        if (dados.target === 'prologo') {
            historicoPaths = []; 
        }

        io.emit('mudar_cena_geral', dados);
    });

    socket.on('disconnect', () => {
        totalJogadores--;
        console.log(`Jogador saiu. Total: ${totalJogadores}`);
        io.emit('update_players', totalJogadores);
    });
});

http.listen(3000, () => {
    console.log('Servidor funfando!! com sistema de mestre! abra : http://localhost:3000');
});