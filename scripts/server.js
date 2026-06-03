const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, '..')));

// ESTADO INICIAL DO JOGO COMPLETAMENTE LIMPO
let estadoJogo = {
    cena: 'prologo',
    paths: []
};

let totalJogadores = 0;

io.on('connection', (socket) => {
    totalJogadores++;
    io.emit('update_players', totalJogadores);
    
    // Envia o estado limpo para quem acabou de se conectar
    socket.emit('estado_inicial', estadoJogo);

    socket.on('escolha_feita_pelo_mestre', (dados) => {
        // Se o mestre mandar voltar para o prologo, limpa o histórico de escolhas!
        if (dados.target === 'prologo') {
            estadoJogo.cena = 'prologo';
            estadoJogo.paths = [];
        } else {
            estadoJogo.cena = dados.target;
            if (dados.pathName) {
                estadoJogo.paths.push(dados.pathName);
            }
        }

        // Replica para todos os jogadores a mudança exata
        io.emit('mudar_cena_geral', dados);
    });

    socket.on('disconnect', () => {
        totalJogadores--;
        io.emit('update_players', totalJogadores);
    });
});

http.listen(3000, () => {
    console.log("Servidor funfando!! com sistema de mestre!");
});