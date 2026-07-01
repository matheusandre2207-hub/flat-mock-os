// ============================================================================
// LOCAL AI ENGINE FOR MOCK OS (Antigravity Offline NLP Engine)
// ============================================================================
// Este motor local simula uma Inteligência Artificial conversacional avançada
// através de análise de intenções (Intents), pontuação por palavras-chave,
// detecção de contexto, análise básica de sentimento e personas realistas.
// 100% autônomo, instantâneo e compatível com hospedagem estática (GitHub Pages).
// ============================================================================

export type ContactPersonaId = 
  | 'mother' 
  | 'love' 
  | 'grandmother' 
  | 'friend-lucas' 
  | 'tech-support' 
  | 'ai-assistant' 
  | string;

export interface IntentRule {
  id: string;
  keywords: string[];
  weight: number;
  isQuestionRequired?: boolean;
}

// Catálogo de Intenções do Usuário
const INTENT_CATALOG: IntentRule[] = [
  { id: 'greeting', keywords: ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'salve', 'eae', 'eai', 'oie', 'fala', 'opa', 'hey', 'hello'], weight: 2 },
  { id: 'wellbeing', keywords: ['tudo bem', 'como vai', 'como vc ta', 'como você está', 'tudo certo', 'beleza', 'tranquilo', 'tudo joia', 'como c ta', 'de boa'], weight: 3 },
  { id: 'food', keywords: ['fome', 'comer', 'almoço', 'almoçar', 'janta', 'jantar', 'lanche', 'pizza', 'comida', 'bolo', 'restaurante', 'hamburguer', 'doce', 'cafe', 'café'], weight: 4 },
  { id: 'work_study', keywords: ['trabalho', 'trampo', 'trabalhando', 'estudo', 'estudando', 'faculdade', 'facul', 'escola', 'projeto', 'codigo', 'código', 'programando', 'chefe', 'reunião', 'prova', 'tarefa'], weight: 4 },
  { id: 'affection', keywords: ['te amo', 'amo voce', 'amo você', 'saudade', 'saudades', 'coração', 'lindo', 'linda', 'amor', 'vida', 'meu bem', 'paixão', 'carinho'], weight: 5 },
  { id: 'gaming_leisure', keywords: ['jogo', 'jogar', 'game', 'gaming', 'pc', 'console', 'discord', 'steam', 'filme', 'série', 'churrasco', 'cerveja', 'chopp', 'role', 'rolê', 'futebol', 'fut', 'sair', 'festa'], weight: 4 },
  { id: 'tech_help', keywords: ['ajuda', 'como funciona', 'bateria', 'brilho', 'tela', 'escuro', 'notificação', 'notificações', 'painel', 'gesto', 'configurações', 'configuração', 'wallpaper', 'papel de parede', 'som', 'toque', 'pin', 'senha', 'sistema', 'os', 'mock os', 'mateus'], weight: 5 },
  { id: 'time_weather', keywords: ['clima', 'tempo', 'sol', 'chuva', 'frio', 'calor', 'quente', 'horas', 'dia', 'previsão', 'temperatura'], weight: 4 },
  { id: 'gratitude', keywords: ['valeu', 'obrigado', 'obrigada', 'brigado', 'thanks', 'tmj', 'agradecido', 'top', 'show', 'mandou bem'], weight: 3 },
  { id: 'farewell', keywords: ['tchau', 'ate mais', 'até mais', 'fui', 'dormir', 'sono', 'falou', 'flw', 'vlw', 'ate amanha', 'até amanhã'], weight: 3 },
  { id: 'laughter', keywords: ['kkk', 'kkkk', 'haha', 'hahaha', 'rs', 'rsrs', 'lol', 'lmao', 'engraçado', 'comedia', 'piada'], weight: 2 },
];

// Respostas Ricas por Persona para cada Intenção
const PERSONA_RESPONSES: Record<string, Record<string, string[]>> = {
  // =========================================================================
  // PERSONA 1: MÃE ❤️
  // =========================================================================
  mother: {
    greeting: [
      "Oi meu filho lindo! Que alegria ver sua mensagem ❤️ Como você está hoje?",
      "Olá meu amor! A bênção da mamãe 🙏 Tudo certinho por aí?",
      "Oie meu querido! Acabei de pegar no celular e vi sua mensagem 🥰 Bom dia pra nós!",
      "Oi filho! Graças a Deus você mandou mensagem. Estava pensando em você agora mesmo! 💕"
    ],
    wellbeing: [
      "Comigo está tudo excelente, graças a bom Deus! E você, está se alimentando direito e descansando? ❤️",
      "Tudo em paz por aqui meu filho! Graças a Deus saúde não falta. Só fico com saudade de você! 🥰",
      "Estou ótima amor! Fazendo minhas coisinhas aqui em casa. Não esquece de beber bastante água hoje, viu? 💧🙏",
      "Tudo bem por aqui meu filho! E você, como está se sentindo? Sem trabalhar demais hein! ❤️"
    ],
    food: [
      "Filho, não vai ficar pulando refeição! Come bastante salada, uma comidinha caseira bem nutritiva e cuida da saúde! ❤️🥗",
      "Ai que delícia! Mas vê se não come só besteira na rua hein! Se quiser vir almoçar aqui no fim de semana, faço aquela lasanha que você ama! 🍝😘",
      "Que fome hein! Fiz um franguinho assado hoje de manhã delicioso. Come direito pra ter bastante energia, te amo! 🥰🍲",
      "Não esquece das frutas e de tomar suco natural filho! A saúde começa pela nossa alimentação 🙏🍎"
    ],
    work_study: [
      "Deus abençoe muito o seu trabalho e os seus estudos meu filho! Você é tão esforçado e inteligente, tenho muito orgulho de você! 🥰🙏✨",
      "Trabalha com dedicação meu amor, mas lembra que o descanso da mente também é sagrado! Não vai ficar até madrugada no computador! 💻❤️",
      "Você vai longe meu filho! Sempre com essa dedicação linda. Que Deus abra todas as portas profissionais na sua vida! 🙏🚀",
      "Estou rezando aqui pelo seu sucesso no projeto! Só não esquece de fazer pausas pra alongar as costas e descansar os olhos, tá? 😘👵"
    ],
    affection: [
      "Eu também te amo mais que tudo nessa vida, meu amor! Você é o maior presente que Deus me deu ❤️🙏 Mãe te ama ao infinito!",
      "Oh meu filho, você me emociona assim! Te amo demais, você é minha vida, meu orgulho e meu tesouro mais precioso! 🥰💖✨",
      "Saudade imensa de você também meu anjo! Vem me visitar logo pra eu te dar aquele abraço bem apertado e fazer um bolinho! 😘❤️",
      "Te amo incondicionalmente meu filho amado! Que Deus proteja cada passo do seu dia com seus anjos! 🌟🙏💋"
    ],
    gaming_leisure: [
      "Aproveite bastante o seu lazer meu filho, você merece relaxar depois de tanto esforço! Só cuidado com os excessos, viu? Beijos! 😘🎉",
      "Que legal meu amor! Se diverte bastante com seus amigos! Quando chegar em casa me avisa pra eu saber que você está em segurança 🙏❤️",
      "Isso mesmo, espairecer a mente faz muito bem pra saúde! Aproveita bem o final de semana meu querido 🥰🍻"
    ],
    time_weather: [
      "Olha o tempo hein filho! Leva um agasalho ou guarda-chuva se for sair de casa para não pegar friagem! Mãe avisa por amor ❤️☔",
      "Hoje o dia está lindo mesmo! Que o sol ilumine ainda mais a sua caminhada hoje meu amor ☀️🙏"
    ],
    gratitude: [
      "Imagina meu amor, mãe está aqui pra tudo o que você precisar em qualquer momento da vida! Te amo infinitamente! 🥰🙏",
      "De nada meu filho querido! Que Deus abençoe seu coração maravilhoso sempre ❤️✨"
    ],
    farewell: [
      "Boa noite meu filho amado! Dorme com os anjos e que Deus abençoe o seu sono e restaure suas forças 🙏💤 Te amo!",
      "Vá em paz meu amor! Me manda mensagem depois quando puder. Fica com Deus! ❤️👋",
      "Um beijo bem grande no seu coração! Se cuida muito e bom descanso meu filho 😘🌙"
    ],
    laughter: [
      "kkkk você é muito engraçado meu filho, adoro ver sua alegria e seu bom humor! 🥰😂",
      "Ai filho, você me faz rir aqui sozinha kkkk Que Deus conserve sempre esse seu sorriso lindo! 😄💖"
    ],
    general: [
      "Que bom meu amor! Fico muito feliz em saber. Qualquer coisa que precisar me liga tá? Te amo muito! ❤️🙏",
      "Entendi filho! Que Deus te abençoe em tudo o que estiver fazendo agora. Um beijo enorme no coração! 😘✨",
      "Maravilha meu querido! Continue assim com essa luz e energia positiva sempre. Mãe te ama! 🥰💖",
      "A vida é maravilhosa quando temos filhos como você! Se cuida direitinho hoje, viu? ❤️🙏"
    ]
  },

  // =========================================================================
  // PERSONA 2: AMOR 💖 (Namorada/Esposa)
  // =========================================================================
  love: {
    greeting: [
      "Oi meu amor!!! ❤️ Que saudade de você! Como está sendo o seu dia vida? 🥰",
      "Oieee meu lindo! Estava pensando na gente agorinha mesmo ✨ Tudo bem com vc? 😘",
      "Bom dia / Boa tarde meu amor! Passando só pra te lembrar que vc é o homem mais incrível do mundo 💕💋",
      "Oi vida! Que felicidade receber mensagem sua agora 🥰 Já te amo mais hoje do que ontem!"
    ],
    wellbeing: [
      "Tudo ótimo por aqui amor, só com um pouquinho de preguiça hoje kkkk e vc? Tudo certinho e animado? 😘✨",
      "Comigo tudo maravilhoso vida, principalmente agora falando com vc! 🥰 Como vc tá se sentindo hoje?",
      "Tudo ótimo amor! Só contando as horas pra gente se ver e ficar juntinho ❤️ E com vc, tudo tranquilo no dia?",
      "De boa amor! Estudando/trabalhando um pouco aqui também mas com o pensamento todo em vc! 💖💭"
    ],
    food: [
      "Nossa, me deu uma fome agora tbm kkkk 😋 Que tal a gente pedir um japa ou uma pizza hoje de noite pra assistir uma série juntinhos? 🍕🍣🍿",
      "Hmm eu amo comer com vc! Vamos naquele restaurante legal no final de semana? Eu topo demais! 🍔🥰",
      "Almoça direito vida! Nada de comer com pressa na frente do computador hein! Te quero bem saudável 💕🥗",
      "Uma pizza hoje ia cair perfeitamente né amor? Vc escolhe o sabor que eu escolho o filme! 🍕🎬😘"
    ],
    work_study: [
      "Ahhh vc trabalha e estuda demais hein! Fico muito orgulhosa de ver vc focado assim, vc é brilhante e incansável! 🥰🚀",
      "Bom trabalho vida! Vc vai conquistar todos os seus objetivos, não tenho a menor dúvida nisso! Só não esquece de beber água e descansar a mente 💕✨",
      "Meu programador preferido do mundo todo! 💻❤️ Arrebenta nesse código amor, vc é muito talento! Depois me conta tudo!",
      "Foco total vida! Estou aqui torcendo por vc em cada segundo. Quando terminar me avisa pra gente conversar mais! 😘📈"
    ],
    affection: [
      "Ahhh eu te amo muito mais, sabia? Vc é a melhor parte do meu dia e a razão dos meus melhores sorrisos! 🥰💖✨",
      "Tô morrendo de saudade de vc também amor! Não vejo a hora de te dar aquele abraço bem apertado e ficar sentindo seu cheiro... 🥺❤️",
      "Vc é o amor da minha vida inteirinha! Obrigado por ser tão carinhoso, companheiro e perfeito pra mim 💕🥰💋",
      "Minha saudade de vc não cabe no peito amor! Vamos nos ver logo por favor? Te amooo infinitamente! ❤️✨"
    ],
    gaming_leisure: [
      "Aproveite seu joguinho com o Lucas e com os meninos amor! Vc merece se divertir depois do trampo 🎮❤️ Depois vem me dar atenção kkkk 😘",
      "Um cineminha com pipoca hoje seria perfeito vida! Qual filme vamos assistir hoje? 🍿🎬🥰",
      "Se diverte no rolê amor! Aproveita bastante e me manda uma fotinha sua linda lá! Te amo 💕📸"
    ],
    time_weather: [
      "Esse climinha está perfeito pra ficar agarradinho debaixo das cobertas assistindo um filme com vc né amor? 🌧️🥰❤️",
      "Dia lindo hoje vida! Bem que a gente podia dar uma volta no parque no fim de tarde e tomar um sorvete ☀️🍦💕"
    ],
    gratitude: [
      "Imagina meu amor! Eu faço tudo por vc com o maior carinho do mundo 🥰 Te amooo demais!",
      "Vc merece o mundo inteiro vida! Sempre aqui com vc pra tudo 💕✨"
    ],
    farewell: [
      "Boa noite meu amor lindo! Durma bem, sonhe comigo e descansa bastante! Até amanhã, te amo infinito 😘💤🌙",
      "Tchau vida! Bom descanso e qualquer coisa me manda mensagem! Beijinhos no coração 💕💋",
      "Fui também amor! Se cuida e não esquece de mim nem por um segundo kkkk Te amoooo! ❤️✨"
    ],
    laughter: [
      "kkkkkkk ai amor vc me faz rir alto aqui! Vc é bobo demais e eu amo isso 🥰😂",
      "hahaha não aguento com vc vida! O melhor senso de humor é o seu kkkk 💕😄"
    ],
    general: [
      "Amei vida! Vc é um fofo mesmo. Vamos nos falando, daqui a pouco te mando um áudio porque estou terminando uma coisinha aqui. Te amo! 😘❤️",
      "Com certeza amor! Vc tem toda razão. Sempre ótimo conversar tudo com vc 💕✨",
      "Que incrível vida! Fico feliz demais por vc. Vc me inspira todos os dias! 🥰🙏",
      "Entendi tudo meu amor! Vamos fazer dar super certo isso. Te amo muitão! ❤️🚀"
    ]
  },

  // =========================================================================
  // PERSONA 3: VOVÓ 👵
  // =========================================================================
  grandmother: {
    greeting: [
      "Oi meu netinho querido... a bênção de Deus... Como você está hoje? A vovó estava com saudade... ❤️👵",
      "Olá meu anjo... que alegria ver sua mensagem no meu celular... Deus te abençoe grandemente hoje e sempre... 🙏✨",
      "Oi meu filho querido... a vovó acabou de fazer um cafezinho e lembrei muito de você... tudo bem por aí? ☕❤️"
    ],
    wellbeing: [
      "Por aqui está tudo em santa paz graças ao bom Deus meu filho... e com você, muita saúde e paz? Se cuidando direitinho? 🙏👵",
      "A vovó está bem graças a Deus... com um pouco de dorzinha no joelho por causa do frio mas feliz da vida... e você meu anjo? ❤️✨",
      "Tudo maravilhoso meu netinho... o importante é ter fé e saúde... rezando por você todos os dias no meu terço... 🙏📿"
    ],
    food: [
      "Vem lanchar aqui na casa da vovó meu querido... fiz aquele bolo de cenoura com cobertura de chocolate bem quentinho que você ama... 🍰👵❤️",
      "Você precisa se alimentar bem meu neto... nada de ficar sem comer por causa de trabalho... faz um prato bem farto com feijão e salada... 🍲🙏",
      "Fiz um pudim de leite condensado hoje cedo pensando nos meus netos... vem me visitar pra provar um pedaço! 🍮😘"
    ],
    work_study: [
      "Que orgulho que a vovó tem de você meu netinho... sempre tão trabalhador e estudioso... Deus te dê muita saúde para vencer na vida... 🙏✨",
      "Mas não canse muito os olhos nesse computador hein meu filho... a luz da tela faz mal pra vista se ficar muitas horas... descansa um pouco! 💻👵",
      "Deus abençoe suas mãos e sua inteligência meu neto! Você vai ser um grande profissional, a vovó tem certeza! 🌟🙏"
    ],
    affection: [
      "A vovó também te ama demais meu amor... você mora aqui dentro do meu coração... você é a luz dos meus olhos... 😘👵💖",
      "Oh meu netinho lindo, a vovó chora de emoção com o seu carinho... que Deus te proteja de todo mal desta vida... 🙏❤️✨",
      "Saudades infinitas de você também meu anjo... vem me dar um beijo qualquer hora dessas na minha casa! 👵🥰"
    ],
    gaming_leisure: [
      "Aproveite seu descanso com moderação meu filho... a juventude é linda mas tem que cuidar da saúde sempre... Beijos da vovó! 😘🎉",
      "Que bom que você está se divertindo meu neto... só não vai dormir muito tarde da noite para não prejudicar a saúde! 🙏🌙"
    ],
    time_weather: [
      "O tempo está esfriando meu netinho... coloca meia nos pés e não toma gelado para não pegar dor de garganta hein! 👵🥶❤️",
      "Hoje o dia abriu um sol lindo graças a Deus! Que seja um dia abençoado de muita luz pra você meu amor ☀️🙏"
    ],
    gratitude: [
      "Imagina meu netinho amado... a vovó faz tudo com amor... que Deus te abençoe mil vezes mais! 🙏💖",
      "Amém meu filho! Deus é bom o tempo todo... um beijo no seu coração limpo e puro! ✨👵"
    ],
    farewell: [
      "Fica com Deus meu netinho! Que os anjos do Senhor acampem ao seu redor e guardem o seu sono... amém... 🙏💤🌙",
      "Um beijo no coração meu filho... vai com Deus e me manda notícias quando puder... a vovó te ama! ❤️👋",
      "Boa noite meu anjo... dorme em paz e que amanhã seja um dia de muitas vitórias pra nós... 🙏✨"
    ],
    laughter: [
      "kkkk você é muito alegre meu netinho... a vovó adoro ver essa sua felicidade... Deus conserve! 😄💖",
      "Ai ai meu filho... você me faz rir muito com essas suas conversas modernas kkkk 👵😂"
    ],
    general: [
      "Fico muito feliz meu netinho... o importante é ter saúde, honestidade e fé no coração... Deus te acompanhe sempre... 🙏🌸",
      "Sim meu querido... tudo está nas mãos de Deus... um abraço bem carinhoso da sua vovó que te ama tanto... ❤️👵",
      "Que maravilha meu filho! A vovó vai rezar para dar tudo certo nos seus planos... benções infinitas! 🙏✨"
    ]
  },

  // =========================================================================
  // PERSONA 4: LUCAS 🤙 (Amigo Gamer/Dev)
  // =========================================================================
  'friend-lucas': {
    greeting: [
      "Eae mano! Beleza pura? O que tá aprontando de bom por aí no código? 🤙💻",
      "Fala Mateus! Salve salve mano, tudo na paz? Bora fechar um game depois? 🎮⚡",
      "Opa, eae mano! Vi sua mensagem aqui, qual é a boa de hoje? 👊⚽",
      "Salve mano! Tudo tranquilo? Como estão os projetos no Mock OS? 🚀🔥"
    ],
    wellbeing: [
      "Tudo tranquilo por aqui tbm mano! Só na luta e nos códigos kkkk E cntg, tudo de boa no dia? 🤙",
      "Tranquilo demais mano! Só programando um pouco e esperando dar a hora do game kkkk Tudo 100% por aqui! E aí? 🎮😎",
      "De boa mano! Sobrevivendo aos bugs e às reuniões kkkk E vc, como tá indo? 👊",
      "Tudo certo mano! Só no aguardo daquele churrasco do fim de semana que não pode faltar kkkk 🥩🍻"
    ],
    food: [
      "Caraca mano me deu fome agora tbm kkkk Partiu pedir um lanche ou uma pizza mais tarde pra mandar ver no game? 🍕🍔",
      "Aquele churrasco de sábado tá de pé né mano? Já tô preparando a carne e a cerveja gelada aqui! 🥩🍻🔥",
      "Almoçar é sagrado mano! Manda ver num prato bem servido aí que saco vazio não para em pé nem coda kkkk 🍲👊"
    ],
    work_study: [
      "Eita cara, só trampo e foco kkkk tá certo! O Mock OS tá ficando surreal de lindo mano, vc mandou muito bem na interface! 🚀💻🔥",
      "Tem que garantir o sucesso mano, vc é brabo demais na programação! Mas descansa um pouco aí senão o cérebro fritar e dá overflow kkkk 🧠⚡",
      "Código limpo é outra fita né mano! Sucesso demais nos seus projetos aí, qualquer ajuda na arquitetura ou teste me grita! 👊💻",
      "Trampa firme aí mano! Depois me mostra o deploy rodando liso no GitHub Pages que eu quero testar no meu celular tbm! 📱✨"
    ],
    affection: [
      "Tamo junto demais mano! Vc é um irmão que a vida me deu, parceria forte sempre! 👊❤️🔥",
      "É us guri mano! Consideração máxima por vc sempre. O que precisar tamo aí na linha de frente! 🤙✨",
      "Saudade de trocar aquela ideia e jogar horas seguidas mano! Vamos marcar de se reunir logo! 🎮🍻"
    ],
    gaming_leisure: [
      "Bora fechar um game mais tarde demorou! Me grita no Discord quando vc entrar que eu já abro a call e chamo o squad 🎮⚡🔥",
      "Se for rolar aquele futebol ou um chopp de lei no fim de semana me avisa com antecedência que tô dentro total kkkk ⚽🍻🤙",
      "Vi que saiu atualização nova naquele game mano! Temos que testar hoje de noite sem falta, prepara o setup! 🖥️🎮😎"
    ],
    time_weather: [
      "Clima perfeito pra ficar no ar condicionado jogando no PC ou codando umas novas features né mano? 🌧️💻🎮",
      "Solzão lá fora mano! Dia propício pra tomar uma gelada mais tarde e trocar ideia ☀️🍻🤙"
    ],
    gratitude: [
      "Que isso mano, tamo junto sempre! É nóis, precisar de qualquer parada dá o grito! 👊🔥",
      "Tranquilo mano! Parceria é pra isso mesmo. É us guri! 🤙✨"
    ],
    farewell: [
      "Falou mano! Bom descanso aí, mais tarde a gente se tromba no Discord ou se fala por aqui! É nóis 👊💤",
      "Flw mano! Vlw pela ideia, se cuida e bom trampo/estudo aí. Abracão! 🤙👋",
      "Fui também mano! Vou nessa, qualquer novidade no Mock OS me manda o link que eu testo! 🔥🚀"
    ],
    laughter: [
      "kkkkkkkk caraca mano rindo alto aqui! Vc é resenha demais, não tem como kkkk 😂🤙",
      "hahahahaha sensacional mano! Mandou muito bem nessa kkkk 😄🔥"
    ],
    general: [
      "Show de bola mano! Tamo junto demais. Qualquer coisa me dá um salve por aqui ou liga pra gente agilizar. Abraço! 👊🔥",
      "Pode crer mano! Tem toda razão, o negócio é fazer acontecer e não ligar pra nada. É nóis! 🤙✨",
      "Da hora demais isso aí mano! Fico muito feliz em ver os projetos evoluindo assim. Sucesso sempre! 🚀💻",
      "Entendi a fita mano! Vamos ver isso com calma depois, vai dar bom com certeza! 👊😎"
    ]
  },

  // =========================================================================
  // PERSONA 5: SUPORTE MOCK OS 🛠️
  // =========================================================================
  'tech-support': {
    tech_help: [
      "Olá! Sou o assistente oficial de suporte do Mock OS. O sistema conta com recursos avançados: puxe a barra de status pela direita para o Painel de Atalhos, ou pela esquerda para Notificações. Use o app de Configurações para simular a bateria (cabo e nível) em tempo real! 🛠️⚡",
      "O Mock OS possui um sistema nativo de persistência via localStorage! Todas as suas conversas, fotos capturadas na câmera, contatos adicionados e papéis de parede ficam salvos no seu navegador de forma 100% offline. 📁✨",
      "Para testar o controle de brilho realista, abra o painel de utilitários deslizando do topo para baixo. Nosso filtro de brilho aplica uma camada escura uniforme que preserva o contraste e as cores do sistema sem quebrar o CSS! ☀️🌙",
      "Se precisar redefinir o sistema ou limpar os dados, acesse o app de Configurações e role até o final em 'Redefinir Mock OS'. Isso restaurará todas as animações, apps e contatos padrão originais! ⚙️🔄"
    ],
    general: [
      "Obrigado por entrar em contato com o Suporte Técnico Mock OS! Todos os serviços estão operacionais no GitHub Pages sem erros 405 ou falhas de Service Worker. Como posso ajudar em sua experiência hoje? 🛠️✨",
      "Sistema rodando na versão mais recente do Flat Mock OS! Interface responsiva, balões de chat orgânicos com design de alta precisão e 8 toques de som VIP disponíveis no painel de áudio. 🎵📱",
      "Olá! Estamos aqui para garantir que sua experiência com o Mock OS seja fluida, sem bugs e com animações nativas de 60 FPS. Digite 'ajuda', 'bateria' ou 'brilho' para saber mais sobre recursos específicos! 🚀⚙️"
    ]
  },

  // =========================================================================
  // PERSONA 6: ASSISTENTE AI DO SISTEMA 🤖 (General Knowledge & OS AI)
  // =========================================================================
  'ai-assistant': {
    greeting: [
      "Olá! Sou a Inteligência Artificial Integrada do Mock OS. Estou rodando localmente no seu navegador via motor algorítmico autônomo! Em que posso ajudar nos seus estudos, códigos ou curiosidades hoje? 🤖✨",
      "Oi! Tudo ótimo por aqui. Como assistente virtual do Flat OS, estou programado para responder perguntas, explicar recursos do sistema e conversar sobre qualquer assunto. O que gostaria de explorar? 🚀💡",
      "Saudações! Estou online e 100% otimizado. Como posso tornar seu dia mais produtivo e interessante hoje? 🌟🤖"
    ],
    tech_help: [
      "No Mock OS, você tem controle total! Você pode instalar e desinstalar apps na 'App Store', tirar fotos com filtros retrô e cyberpunk na 'Câmera' que vão direto para a Galeria, e trocar o papel de parede pressionando e segurando na tela inicial! 📱🎨",
      "Para simular o carregamento do celular, vá em Configurações > Bateria e Simulação. Você poderá ligar o cabo virtual e ver o ícone animado com raios de energia na barra superior em tempo real! ⚡🔋",
      "Nosso sistema foi desenvolvido por Mateus Oliveira focando em design orgânico, animações fluidas com Framer Motion e tolerância a falhas em servidores estáticos como GitHub Pages! 🚀💻"
    ],
    work_study: [
      "Programação e estudo são a chave para a inovação! Dica de produtividade do sistema: divida tarefas grandes em pequenos blocos de 25 minutos (Técnica Pomodoro) e mantenha seu código sempre limpo e bem documentado. Bom foco! 🧠💻📚",
      "Se estiver enfrentando algum bug no código, lembre-se de verificar o console do navegador e inspecionar os tipos TypeScript. Estou aqui para dar apoio moral e técnico no seu desenvolvimento! 🚀🔥"
    ],
    time_weather: [
      "Previsão do tempo simulada no Mock OS: Sol entre nuvens com temperatura agradável de 24°C, ventos calmos de 12 km/h e umidade relativa do ar em 65%. Clima perfeito para produzir e inovar! ☀️⛅",
      "O relógio do sistema sincroniza automaticamente com o horário real do seu dispositivo, garantindo que suas notificações e alarmes virtuais estejam sempre precisos! ⌚✨"
    ],
    general: [
      "Interessante ponto de vista! Como IA local do Mock OS, utilizo processamento em tempo real de linguagem natural para compreender o contexto e oferecer respostas coerentes e úteis sem precisar de internet ou chaves de API externas! 🤖💡",
      "Compreendido! A computação moderna se beneficia muito de sistemas offline-first que garantem privacidade e velocidade instantânea para o usuário. Tem mais alguma dúvida sobre tecnologia ou sobre o Mock OS? 🚀✨",
      "Essa é uma ótima questão! O conhecimento é uma jornada contínua. Estou sempre evoluindo aqui no seu Mock OS para te auxiliar nas tarefas do dia a dia com eficiência e simpatia! 🌟🤖"
    ]
  }
};

// Respostas Padrão de Emergência caso nenhuma palavra-chave seja correspondida
const FALLBACK_RESPONSES: Record<string, string[]> = {
  mother: [
    "Entendi meu filho! Que Deus te proteja em tudo hoje e sempre. Fica com Deus e me liga depois! ❤️🙏",
    "Sim meu amor! A mamãe está sempre aqui torcendo por você em cada segundo. Um beijo bem grande no seu coração! 😘🥰",
    "Que maravilha meu filho! Se cuida direitinho por aí, come bem e não esquece do casaco! Te amo muito ❤️✨"
  ],
  love: [
    "Amei vida! Vc tem toda razão amor. Vamos nos falando, daqui a pouco te chamo de novo porque tô terminando uma coisinha aqui. Te amo! 😘❤️",
    "Com certeza meu amor! Sempre tão inteligente e compreensivo. Mal posso esperar pra gente se ver logo! 💕🥰",
    "Sim vida! Vc é tudo pra mim. Te amo mais que o universo inteiro! ❤️✨💋"
  ],
  grandmother: [
    "Fico muito feliz meu netinho... o importante é ter fé em Deus e muita saúde... a vovó te ama infinitamente... 🙏👵❤️",
    "Sim meu filho... Deus está no controle de todas as coisas... vou rezar um terço por você hoje à noite... benções! 📿✨"
  ],
  'friend-lucas': [
    "Show de bola mano! Tamo junto demais. Qualquer coisa me dá um salve por aqui ou chama lá no Discord pra gente jogar. Abraço! 👊🔥",
    "Pode crer mano! É us guri sempre. Vamos agilizar aquele churrasco e um game no fim de semana! 🍻🎮🤙"
  ],
  'tech-support': [
    "Compreendido! O Suporte Mock OS permanece à disposição para dúvidas técnicas sobre widgets, gestos, som ou personalização de papéis de parede. 🛠️📱"
  ],
  'ai-assistant': [
    "Interessante! Como IA local autonomo do Mock OS, processei sua mensagem com sucesso. Digite 'ajuda', 'bateria', 'brilho' ou me faça qualquer pergunta para continuarmos nossa interação! 🤖💡"
  ]
};

/**
 * Normaliza o texto removendo acentos, pontuações extras e colocando em minúsculas
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Detecta se a mensagem do usuário é uma pergunta
 */
function isQuestion(text: string): boolean {
  const norm = normalizeText(text);
  return (
    text.includes('?') ||
    norm.startsWith('como ') ||
    norm.startsWith('quando ') ||
    norm.startsWith('onde ') ||
    norm.startsWith('por que ') ||
    norm.startsWith('porque ') ||
    norm.startsWith('qual ') ||
    norm.startsWith('quais ') ||
    norm.startsWith('quem ') ||
    norm.startsWith('o que ') ||
    norm.startsWith('oque ') ||
    norm.startsWith('vc sabe') ||
    norm.startsWith('voce sabe') ||
    norm.startsWith('tem como')
  );
}

/**
 * Motor Principal de IA Local: Gera a resposta do NPC com base no histórico e mensagem
 */
export function generateLocalAIReply(
  contactId: string, 
  userMessage: string, 
  messageHistory?: Array<{ sender: string; text: string }>
): string {
  const cleanQuery = normalizeText(userMessage);
  const questionFlag = isQuestion(userMessage);

  // 1. Identificar a persona alvo (se não existir, usa 'ai-assistant')
  const targetPersona = PERSONA_RESPONSES[contactId] ? contactId : 'ai-assistant';
  const personaDict = PERSONA_RESPONSES[targetPersona] || PERSONA_RESPONSES['ai-assistant'];
  const fallbackList = FALLBACK_RESPONSES[targetPersona] || FALLBACK_RESPONSES['ai-assistant'];

  // 2. Pontuar as intenções (Intents Matching)
  let bestIntent: string | null = null;
  let highestScore = 0;

  for (const intent of INTENT_CATALOG) {
    let score = 0;
    for (const kw of intent.keywords) {
      const cleanKw = normalizeText(kw);
      if (cleanQuery === cleanKw) {
        score += intent.weight * 3; // Correspondência exata ganha bônus alto
      } else if (cleanQuery.includes(cleanKw)) {
        score += intent.weight;
      }
    }

    // Se a intenção requer uma pergunta e o usuário fez uma pergunta, ganha bônus
    if (questionFlag && (intent.id === 'tech_help' || intent.id === 'wellbeing')) {
      score += 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestIntent = intent.id;
    }
  }

  // 3. Verificar se encontramos respostas para a intenção detectada
  if (bestIntent && personaDict[bestIntent] && personaDict[bestIntent].length > 0) {
    const possibleReplies = personaDict[bestIntent];
    // Evitar responder exatamente a mesma coisa que a última mensagem do robô
    const lastBotMsg = messageHistory && messageHistory.length > 0 
      ? [...messageHistory].reverse().find(m => m.sender === 'contact')?.text 
      : null;

    const filteredReplies = possibleReplies.filter(r => r !== lastBotMsg);
    const pool = filteredReplies.length > 0 ? filteredReplies : possibleReplies;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 4. Se for uma pergunta não mapeada para IA ou Suporte, dar resposta analítica
  if (questionFlag && (targetPersona === 'ai-assistant' || targetPersona === 'tech-support')) {
    const aiQuestions = [
      "Excelente pergunta! No ecossistema do Mock OS, todas as funcionalidades operam de forma interativa e sem latência. Tente experimentar deslizar os painéis ou abrir o app de Configurações para testar na prática! 💡✨",
      "Essa é uma questão muito relevante! Como motor de IA local autônomo, posso te afirmar que o Mock OS foi projetado para oferecer a máxima fluidez visual e persistência offline. Quer saber mais sobre algum app específico? 🤖🚀",
      "Compreendi sua dúvida! O Mock OS utiliza arquitetura reativa moderna com React e Framer Motion para simular um celular de ponta direto no seu navegador. Experimente explorar a App Store ou a Galeria! 📱🎨"
    ];
    return aiQuestions[Math.floor(Math.random() * aiQuestions.length)];
  }

  // 5. Retornar resposta genérica contextual da Persona (Fallback)
  const generalPool = personaDict['general'] || fallbackList;
  const lastBotMsg = messageHistory && messageHistory.length > 0 
    ? [...messageHistory].reverse().find(m => m.sender === 'contact')?.text 
    : null;
    
  const validPool = generalPool.filter(r => r !== lastBotMsg);
  const finalPool = validPool.length > 0 ? validPool : generalPool;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

/**
 * Motor de Simulação Espontânea no Fundo (Background Check-ins)
 * Gera mensagens autônomas e realistas quando o usuário está navegando pelo sistema
 */
export function generateBackgroundCheckIn(contactId: string): string {
  const bgCatalog: Record<string, string[]> = {
    mother: [
      "Filho, não esquece de almoçar bem hoje, viu? Se cuida direitinho! Te amo ❤️🍲",
      "Passando só pra te mandar um beijo e abençoar o seu dia meu amor! Deus te acompanhe 🙏✨",
      "Oi meu filho! Estava lembrando de você aqui. Quando tiver um tempinho me manda notícias 🥰👵",
      "Não vai ficar trabalhando no computador até madrugada hein! O descanso é importante! Te amo ❤️💤"
    ],
    love: [
      "Oi meu amor! Só passando pra dizer que estou morrendo de saudade de você 🥰💕",
      "Estava pensando em você agora mesmo vida! Que nosso dia seja maravilhoso ✨😘",
      "Amor, que tal pedirmos uma pizza hoje de noite pra assistir um filme juntinhos? 🍕🍿❤️",
      "Te amo muito vida! Vc é a melhor parte dos meus dias! Quando puder me liga 💕💋"
    ],
    grandmother: [
      "Meu netinho querido... que Deus te proteja e ilumine seus passos hoje... a vovó te ama 🙏👵❤️",
      "Vem comer bolo de cenoura com chocolate aqui na casa da vovó qualquer dia desses meu anjo! 🍰👵✨",
      "A bênção de Deus sobre sua vida meu neto amado... rezando por você todos os dias! 🙏📿"
    ],
    'friend-lucas': [
      "Eae mano! Bora fechar um game no Discord mais tarde? Me dá um grito quando entrar! 🎮⚡👊",
      "Mano, viu aquele lance ontem no jogo? Que loucura kkkk Depois me chama no chat! ⚽🍻",
      "Aquele churrasco do fim de semana tá confirmado né mano? Já prepara a carne aí! 🥩🔥🤙"
    ],
    'tech-support': [
      "Dica do Sistema Mock OS: Você sabia que pode testar 8 toques de som VIP e futuristas no app de Configurações? Experimente agora! 🎵⚙️",
      "Lembrete de Performance: O Flat Mock OS opera em 60 FPS com persistência automática de todas as suas conversas no localStorage! 🚀📱"
    ],
    'ai-assistant': [
      "Assistente AI Online: Sincronização do sistema concluída com sucesso! Estou pronto para auxiliar em seus estudos e códigos quando precisar. 🤖💡",
      "Curiosidade de IA: O processamento de linguagem natural autônomo permite interações instantâneas e sem consumo de dados de servidores externos no Mock OS! 🌟🚀"
    ]
  };

  const pool = bgCatalog[contactId] || bgCatalog['ai-assistant'] || [
    "Olá! Passando para mandar um olá e saber como estão as coisas por aí! 😊✨"
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}
