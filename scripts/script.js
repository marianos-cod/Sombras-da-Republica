const socket = io({ transports: ['websocket'] });

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
    "A Faísca": { top: '58%', left: '46%', visible: true },
    "O Baile": { top: '68%', left: '68%', visible: true },
    "A Conspiração": { top: '25%', left: '68%', visible: true },
    "O Dia 15": { top: '40%', left: '50%', visible: true },
    "O Legado": { top: '50%', left: '50%', visible: false }
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

document.getElementById('map-modal').addEventListener('click', function (e) {
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
    const mapPositions = ["center", "30% 70%", "70% 30%", "80% 80%", "45% 55%"];
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
                <h2>O Tabuleiro da República</h2>
                <p class="moment">Rio de Janeiro, novembro de 1889.</p>
            </div>
            <p style="text-align: justify; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                O Império do Brasil está enfraquecido. A escravidão acabou, mas a sociedade continua dividida. Os militares estão insatisfeitos, os grandes fazendeiros querem preservar seus interesses e a imprensa tenta influenciar o rumo do país. Por fora, a cidade continua viva e elegante. Por dentro, tudo já está em crise.
            </p>
            <p style="text-align: justify; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                Dom Pedro II está cansado e distante. A monarquia perdeu apoio em muitos círculos importantes, e a ideia de República começa a ganhar força. Mas a mudança não acontece de forma limpa ou simples. Ela nasce de disputas, ambições e decisões difíceis.
            </p>
            <p style="text-align: justify; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                Vocês estão no centro desse período de tensão. A História ainda não decidiu como vai lembrar esses dias, e cada escolha pode aproximar o Brasil de um caminho diferente.
            </p>
        `,
        choices: [
            {
                title: "Virar a primeira carta.",
                target: "carta1"
            }
        ]
    },

    carta1: {
        fase: "A Faísca",
        doutrina: "Em tensão",
        html: `
        <div class="card-header">
            <h2>🃏 Carta 1 — O Apoio ao Movimento</h2>
            <p class="moment">Um oficial influente procura vocês e fala com segurança sobre o fim do Império.</p>
        </div>
        <div class="central-question">Ele afirma que a mudança precisa acontecer logo, mas apoiar esse movimento significa escolher entre prudência, dever e conveniência. O que vocês fazem?</div>
    `,
        choices: [
            {
                title: "A) Apoiar com equilíbrio <span class='philosophy-tag'>(Aristóteles)</span>",
                quote: "A prudência é encontrar a medida certa entre os extremos.",
                desc: "Você aceita dialogar com o oficial, mas busca agir com cautela. A mudança precisa acontecer de forma equilibrada e sem excessos.",
                target: "carta2",
                pathName: "Aristóteles"
            },
            {
                title: "B) Recusar por dever e princípio <span class='philosophy-tag'>(Kant)</span>",
                quote: "A verdade deve ser defendida mesmo quando o momento é difícil.",
                desc: "Você avalia a proposta com base em princípios morais. O mais importante é agir corretamente, independentemente das vantagens políticas.",
                target: "carta2",
                pathName: "Kant"
            },
            {
                title: "C) Apoiar pela eficiência da crise <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "Quando o tempo aperta, a astúcia pesa mais que a delicadeza.",
                desc: "Você acredita que momentos de crise exigem decisões rápidas e eficientes. Se a mudança é inevitável, é melhor participar dela.",
                target: "carta2",
                pathName: "Maquiavel"
            }
        ]
    },

    carta2: {
        fase: "O Baile",
        doutrina: "Máscaras sociais",
        html: `
        <div class="card-header">
            <h2>🃏 Carta 2 — O Que Contar ao Povo</h2>
            <p class="moment">Os rumores crescem, os jornais se dividem e a cidade começa a perceber que algo maior está se movendo.</p>
        </div>
        <div class="central-question">Vocês precisam decidir o quanto da crise deve ser revelado. Contar tudo pode gerar caos; esconder demais pode alimentar a manipulação. O que fazem?</div>
    `,
        choices: [
            {
                title: "A) Informar com equilíbrio <span class='philosophy-tag'>(Aristóteles)</span>",
                quote: "Nem toda verdade precisa ser lançada sem medida.",
                desc: "Você procura divulgar as informações de maneira responsável, evitando tanto o pânico quanto a omissão.",
                target: "carta3",
                pathName: "Aristóteles"
            },
            {
                title: "B) Contar toda a verdade <span class='philosophy-tag'>(Kant)</span>",
                quote: "A verdade não deve ser escondida por conveniência.",
                desc: "Você acredita que a população tem o direito de saber exatamente o que está acontecendo, sem distorções.",
                target: "carta3",
                pathName: "Kant"
            },
            {
                title: "C) Controlar a informação <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "A informação pode ser uma ferramenta de poder.",
                desc: "Você decide divulgar apenas o que for útil para conduzir a crise na direção desejada.",
                target: "carta3",
                pathName: "Maquiavel"
            }
        ]
    },

    carta3: {
        fase: "A Conspiração",
        doutrina: "A verdade em disputa",
        html: `
        <div class="card-header">
            <h2>🃏 Carta 3 — Quem Vai Se Beneficiar</h2>
            <p class="moment">A queda do Império parece próxima, mas a disputa agora é sobre quem vai ocupar o espaço deixado por ele.</p>
        </div>
        <div class="central-question">A mudança pode abrir caminho para justiça, para controle ou para novos interesses escondidos. Vocês vão buscar equilíbrio, revelar as intenções ou agir para ganhar vantagem?</div>
    `,
        choices: [
            {
                title: "A) Buscar o bem comum e evitar extremos <span class='philosophy-tag'>(Aristóteles)</span>",
                quote: "A melhor decisão é aquela que reduz o dano e preserva a cidade.",
                desc: "Você tenta impedir a mentira, mas também evita transformar a crise em uma guerra aberta. A saída ideal é a mais prudente.",
                target: "carta4",
                pathName: "Aristóteles"
            },
            {
                title: "B) Expor a verdade sem esconder nada <span class='philosophy-tag'>(Kant)</span>",
                quote: "A verdade não deve ser usada como ferramenta; ela deve ser respeitada.",
                desc: "Você decide revelar tudo ao público, mesmo sabendo que isso pode causar desordem e acelerar o conflito.",
                target: "carta4",
                pathName: "Kant"
            },
            {
                title: "C) Usar a informação para vencer a disputa <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "Num momento de crise, quem controla a informação controla o destino.",
                desc: "Você permite ou manipula a divulgação para garantir que seu lado saia fortalecido, mesmo que isso custe a verdade.",
                target: "carta4",
                pathName: "Maquiavel"
            }
        ]
    },

    carta4: {
        fase: "O Dia 15",
        doutrina: "Destino da República",
        html: `
        <div class="card-header">
            <h2>🃏 Carta Final — 15 de Novembro de 1889</h2>
            <p class="moment">As tropas se movem, os boatos aumentam e o Império finalmente cede.</p>
        </div>
        <div class="central-question">A República está prestes a nascer. Agora, mais do que nunca, a pergunta é: como vocês querem que esse momento seja lembrado?</div>
    `,
        choices: [
            {
                title: "A) Guiar o país com prudência <span class='philosophy-tag'>(Aristóteles)</span>",
                quote: "A virtude política está em evitar os excessos.",
                desc: "Você tenta reduzir os danos, unir grupos diferentes e escolher a saída mais equilibrada para o país.",
                target: "final",
                pathName: "Aristóteles"
            },
            {
                title: "B) Agir pelo dever e pela verdade <span class='philosophy-tag'>(Kant)</span>",
                quote: "A dignidade da ação está em seguir o princípio correto.",
                desc: "Você defende que a decisão final precisa ser moralmente justa, mesmo que o resultado seja difícil.",
                target: "final",
                pathName: "Kant"
            },
            {
                title: "C) Garantir a vitória custe o que custar <span class='philosophy-tag'>(Maquiavel)</span>",
                quote: "O poder não espera quem hesita.",
                desc: "Você escolhe a solução mais eficiente para vencer a disputa política e manter o controle da situação.",
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
    playerPath = estado.paths || [];
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
    if (!scene) return;

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
                // CORRIGIDO: Enviando 'escolha_feita_pelo_mestre' para conversar com o server.js
                socket.emit('escolha_feita_pelo_mestre', {
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
            <p class="moment">A poeira baixou. O Brasil mudou — mas o modo como mudou dependeu das escolhas.</p>
        </div>
        <div class="central-question" style="font-size: 16px;">
            Caminho filosófico da sessão:<br><br>
            <span style="color: var(--accent-color); font-size: 22px; letter-spacing: 2px;">${trindade || "Nenhuma escolha registrada"}</span>
        </div>
        <div class="final-quote">
            “A República não nasceu de uma única vontade. Ela foi moldada por interesses, escolhas e disputas escondidas nos bastidores da História.”
        </div>
    `;

    const choicesBox = document.getElementById('choices');
    choicesBox.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<div class="choice-title" style="text-align: center; color: #fff;">Reiniciar a sessão</div>`;

    if (isMestre) {
        btn.onclick = () => {
            // CORRIGIDO: Enviando 'escolha_feita_pelo_mestre' também no reinício
            socket.emit('escolha_feita_pelo_mestre', { target: 'prologo' });
        };
    } else {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.onclick = () => alert("Apenas o Mestre pode reiniciar a sessão.");
    }

    choicesBox.appendChild(btn);
}