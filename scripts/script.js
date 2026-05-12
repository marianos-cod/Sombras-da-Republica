const socket = io();
let isMestre = false;
let localCurrentScene = 'prologo';
let playerPath = [];
let currentFaseName = "O Tabuleiro";

function escolherPapel(papel) {
    if (papel === 'mestre') {
        const senha = prompt("Acesso Restrito: Digite a senha do Mestre");
        if (senha !== '123') {
            alert("Senha incorreta. Acesso negado.");
            return;
        }
        isMestre = true;
        alert("Bem-vindo, Mestre da Sessão.");
    } else {
        isMestre = false;
    }
    document.getElementById('lobby-screen').style.display = 'none';
    renderScene(localCurrentScene);
}

const localizacoes = {
    "O Tabuleiro": { top: '50%', left: '50%', visible: false },
    "Pré-Golpe":   { top: '58%', left: '46%', visible: true },
    "O Golpe":     { top: '68%', left: '68%', visible: true },
    "A Nova Era":  { top: '25%', left: '68%', visible: true },
    "O Legado":    { top: '50%', left: '50%', visible: false }
};

function openMap() {
    const marker = document.getElementById('player-marker');
    const loc = localizacoes[currentFaseName];

    if (loc && loc.visible) {
        marker.style.top = loc.top;
        marker.style.left = loc.left;
        marker.style.display = 'block';
    } else {
        marker.style.display = 'none';
    }

    document.getElementById('map-modal').style.display = 'flex';
}

function closeMap() {
    document.getElementById('map-modal').style.display = 'none';
}

document.getElementById('map-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeMap();
    }
});

function updateUI(fase, doutrina) {
    currentFaseName = fase;
    
    if (isMestre) {
        document.getElementById('tag-fase').innerHTML = `<span style="color: gold;">👑 MESTRE</span> | Fase: <span>${fase}</span>`;
    } else {
        document.getElementById('tag-fase').innerHTML = `👤 JOGADOR | Fase: <span>${fase}</span>`;
    }

    document.getElementById('tag-filosofia').innerHTML = `Essência: <span>${doutrina}</span>`;
    
    const mapElement = document.getElementById('progression-map');
    const mapPositions = ["center", "30% 70%", "70% 30%", "80% 80%"];
    mapElement.style.backgroundPosition = mapPositions[Math.min(playerPath.length, mapPositions.length - 1)];
    
    mapElement.classList.remove('pulse-animation');
    void mapElement.offsetWidth;
    mapElement.classList.add('pulse-animation');
}

const cards = {
    prologo: {
        fase: "O Tabuleiro",
        doutrina: "Observador",
        html: `
            <div class="card-header">
                <h2>As Regras do Pensamento</h2>
                <p class="moment">O império rachou. A coroa vai cair.</p>
            </div>
            <p style="text-align: center; font-size: 16px; line-height: 1.6;">
                Neste jogo, as armas não disparam sem uma ideia que puxe o gatilho.<br>
                Você deverá escolher o destino da nação baseado em três pensadores definitivos.<br><br>
                A ordem de Platão. O dever de Kant. A astúcia de Maquiavel.<br><br>
                <em>"O poder nunca é vazio. Ele sempre serve a uma filosofia."</em>
            </p>
        `,
        choices: [
            {
                title: "Analisar as peças. Virar a Primeira Carta.",
                target: "carta1"
            }
        ]
    },
    carta1: {
        fase: "Pré-Golpe",
        doutrina: "Indefinida",
        html: `
            <div class="card-header">
                <h2>🃏 Carta 1 — “Antes da Queda”</h2>
                <p class="moment">(Momento: o Império ainda existe, mas está desmoronando nas sombras)</p>
            </div>
            <div class="central-question">O poder deve ser mantido ou transformado?</div>
        `,
        choices: [
            {
                title: "A) A Ordem dos Sábios <span class='philosophy-tag'>(Platão)</span>",
                quote: "“A cidade justa é aquela onde cada um cumpre o seu papel. A democracia é o prelúdio da tirania.”",
                desc: "Você defende uma hierarquia rígida. O Império não deve cair nas mãos da multidão ou de soldados rasos. Apenas os mais sábios, a aristocracia intelectual (os reis-filósofos), devem guiar o povo cego.",
                target: "carta2",
                pathName: "Platão"
            },
            {
                title: "B) O Dever Universal <span class='philosophy-tag'>(Kant)</span>",
                quote: "“Age apenas segundo uma máxima tal que possas querer que ela se torne lei universal.”",
                desc: "O Império violou a dignidade humana por séculos. A mudança não é uma opção política, é um dever moral absoluto (Imperativo Categórico). O sistema precisa ser reformado porque é o único meio ético de tratar o povo como um fim.",
                target: "carta2",
                pathName: "Kant"
            },
            {
                title: "C) A Tomada pela Virtù <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "“Não há nada mais difícil de executar do que a introdução de uma nova ordem de coisas.”",
                desc: "O Império está fraco. Onde há fraqueza, alguém tomará o espaço. A Fortuna sorri para os audazes; é hora de forçar a ruptura.",
                target: "carta2",
                pathName: "Maquiavel"
            }
        ]
    },
    carta2: {
        fase: "O Golpe",
        doutrina: "Em formação",
        html: `
            <div class="card-header">
                <h2>🃏 Carta 2 — “O Dia 15”</h2>
                <p class="moment">(Momento: O golpe acontece. Tropas nas ruas. O fim é iminente.)</p>
            </div>
            <div class="central-question">O fim justifica os meios?</div>
        `,
        choices: [
            {
                title: "A) A Harmonia do Estado <span class='philosophy-tag'>(Platão)</span>",
                quote: "“Para o bem da pólis, os governantes podem usar a mentira nobre.”",
                desc: "O povo não sabe o que é melhor para si. Se for necessário omitir informações ou usar fábulas para acalmar as massas e manter a República alinhada com o Bem Maior, você fará.",
                target: "carta3",
                pathName: "Platão"
            },
            {
                title: "B) A Intenção Pura <span class='philosophy-tag'>(Kant)</span>",
                quote: "“A mentira é o abandono e, por assim dizer, a aniquilação da dignidade do homem.”",
                desc: "Um governo que nasce da traição está fadado à podridão. Você se recusa a agir pelas sombras. Se o Império deve cair, que seja às claras.",
                target: "carta3",
                pathName: "Kant"
            },
            {
                title: "C) A Preservação do Príncipe <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "“Os fins justificam os meios. É melhor ser temido do que amado.”",
                desc: "A moralidade filosófica é inútil no dia da batalha. Traição e intimidação são apenas ferramentas. Você fará o que for absolutamente necessário.",
                target: "carta3",
                pathName: "Maquiavel"
            }
        ]
    },
    carta3: {
        fase: "A Nova Era",
        doutrina: "Definida",
        html: `
            <div class="card-header">
                <h2>🃏 Carta 3 — “Depois da Coroa”</h2>
                <p class="moment">(Momento: A República já foi instaurada. É hora de governar.)</p>
            </div>
            <div class="central-question">O que legitima o seu novo governo?</div>
        `,
        choices: [
            {
                title: "A) A República dos Iluminados <span class='philosophy-tag'>(Platão)</span>",
                quote: "“Até que os filósofos sejam reis, as cidades nunca terão descanso de seus males.”",
                desc: "O novo Brasil será governado por uma elite intelectual, um senado de 'guardiões' que ditará as leis e organizará o caos.",
                target: "final",
                pathName: "Platão"
            },
            {
                title: "B) O Reino dos Fins <span class='philosophy-tag'>(Kant)</span>",
                quote: "“Age de tal maneira que uses a humanidade sempre como um fim, nunca como um meio.”",
                desc: "A República só será legítima se sua constituição garantir a liberdade e o dever cívico absoluto. O estado de direito se torna a força maior.",
                target: "final",
                pathName: "Kant"
            },
            {
                title: "C) A Razão de Estado <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "“Um príncipe não deve ter outro objetivo além da guerra, suas regras e sua disciplina.”",
                desc: "Para não perder o Brasil, o governo será centralizado na figura de um líder implacável. Você governa com as garras.",
                target: "final",
                pathName: "Maquiavel"
            }
        ]
    }
};

socket.on('update_players', (qtd) => {
    document.getElementById('online-count').innerText = qtd;
});

socket.on('estado_inicial', (estado) => {
    playerPath = estado.paths;
    renderScene(estado.cena);
});

socket.on('mudar_cena_geral', (dados) => {
    if (dados.target === 'prologo') {
        playerPath = [];
    } else if (dados.pathName) {
        playerPath.push(dados.pathName);
    }
    renderScene(dados.target);
});

function renderScene(sceneId) {
    localCurrentScene = sceneId;

    if (sceneId === "final") {
        renderFinal();
        return;
    }

    const scene = cards[sceneId];
    updateUI(scene.fase, playerPath.length > 0 ? playerPath[playerPath.length - 1] : scene.doutrina);
    
    document.getElementById('story-area').innerHTML = scene.html;
    
    const choicesBox = document.getElementById('choices');
    choicesBox.innerHTML = '';

    scene.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        
        let btnHTML = `<div class="choice-title">${choice.title}</div>`;
        if (choice.quote) btnHTML += `<div class="choice-quote">${choice.quote}</div>`;
        if (choice.desc) btnHTML += `<div class="choice-desc">${choice.desc}</div>`;
        
        btn.innerHTML = btnHTML;
        
        if (isMestre) {
            btn.onclick = () => {
                socket.emit('escolha_feita', {
                    target: choice.target,
                    pathName: choice.pathName || null
                });
            };
        } else {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.onclick = () => {
                alert("Aguarde. Apenas o Mestre pode tomar a decisão e avançar a história!");
            };
        }

        choicesBox.appendChild(btn);
    });
}

function renderFinal() {
    const trindade = playerPath.join(" → ");
    updateUI("O Legado", "O Arquiteto do Sistema");

    document.getElementById('story-area').innerHTML = `
        <div class="card-header">
            <h2>Fim de Jogo</h2>
            <p class="moment">A poeira baixou. As ideias venceram.</p>
        </div>
        <div class="central-question" style="font-size: 16px;">
            Evolução Filosófica da sua República:<br><br>
            <span style="color: var(--accent-color); font-size: 22px; letter-spacing: 2px;">${trindade}</span>
        </div>
        <div class="final-quote">
            “O corpo do país mudou de dono, mas a verdadeira revolução ocorreu dentro da mente de quem o governa.”
        </div>
    `;

    const choicesBox = document.getElementById('choices');
    choicesBox.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<div class="choice-title" style="text-align: center; color: #fff;">Virar as páginas novamente (Reiniciar)</div>`;
    
    if (isMestre) {
        btn.onclick = () => {
            socket.emit('escolha_feita', { target: 'prologo' });
        };
    } else {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.onclick = () => alert("Apenas o Mestre pode reiniciar a sessão.");
    }

    choicesBox.appendChild(btn);
}