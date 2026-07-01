import { Wallpaper, Track, Chat, Folder, NotificationItem } from './types';

export const wallpapersList: Wallpaper[] = [
  // Static wallpapers (exactly 10)
  { name: "Flat Charcoal", gradient: "linear-gradient(135deg, #18181b, #09090b, #18181b)", isDark: true },
  { name: "Pure Sand", gradient: "linear-gradient(135deg, #f4f4f5, #e4e4e7, #f4f4f5)", isDark: false },
  { name: "Deep Space", gradient: "linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a)", isDark: true },
  { name: "Muted Sage", gradient: "linear-gradient(135deg, #2e3f37, #1b2621, #2e3f37)", isDark: true },
  { name: "Warm Terracotta", gradient: "linear-gradient(135deg, #e07a5f, #f4f1de, #3d405b)", isDark: false },
  { name: "Ocean Abyss", gradient: "linear-gradient(135deg, #0c4a6e, #0369a1, #0c4a6e)", isDark: true },
  { name: "Nordic Slate", gradient: "linear-gradient(135deg, #374151, #1f2937, #374151)", isDark: true },
  { name: "Cosmic Plum", gradient: "linear-gradient(135deg, #4c1d95, #2e1065, #4c1d95)", isDark: true },
  { name: "Minimalist Clay", gradient: "linear-gradient(135deg, #fafaf9, #e7e5e4, #fafaf9)", isDark: false },
  { name: "Retro Mint", gradient: "linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)", isDark: false },

  // Animated wallpapers (exactly 10)
  { name: "★ Matrix Code Animado", gradient: "linear-gradient(180deg, #020202, #050505)", isDark: true, isAnimated: true, animatedType: "matrix" },
  { name: "★ Estrelas Flutuantes Animadas", gradient: "linear-gradient(135deg, #0b0f19, #111827, #030712)", isDark: true, isAnimated: true, animatedType: "particles" },
  { name: "★ Aurora Boreal Animada", gradient: "linear-gradient(135deg, #050515, #0a1128, #150525)", isDark: true, isAnimated: true, animatedType: "aurora" },
  { name: "★ Metal Líquido Chrome", gradient: "linear-gradient(135deg, #111318, #2a2d34, #111318)", isDark: true, isAnimated: true, animatedType: "metal-liquid" },
  { name: "★ Ondas de Luz Animadas", gradient: "linear-gradient(135deg, #020617, #0369a1, #0f172a)", isDark: true, isAnimated: true, animatedType: "waves" },
  { name: "★ Saturno Geométrico", gradient: "linear-gradient(135deg, #08080a, #141418, #08080a)", isDark: true, isAnimated: true, animatedType: "geometric" },
  { name: "★ Cyber Grid Neon", gradient: "linear-gradient(135deg, #050510, #180825, #050510)", isDark: true, isAnimated: true, animatedType: "cyber-neon" },
  { name: "★ Starfield Warp Speed", gradient: "linear-gradient(135deg, #020205, #050508)", isDark: true, isAnimated: true, animatedType: "starfield" },
  { name: "★ Lava Lamp Glow", gradient: "linear-gradient(135deg, #09090c, #1a0f25, #09090c)", isDark: true, isAnimated: true, animatedType: "lava-lamp" },
  { name: "★ Shifting Gradient", gradient: "linear-gradient(135deg, #1e1b4b, #311042, #1e1b4b)", isDark: true, isAnimated: true, animatedType: "gradient-shift" }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "fs-tip",
    title: "Experiência Nativa",
    body: "Esconda a barra de status do seu smartphone Android e use como app nativo! Ative a 'Tela Cheia' no painel de atalhos rápidos do topo ou nas Configurações da Tela.",
    time: "Agora",
    app: "sistema"
  },
  {
    id: "1",
    title: "Sistema Mock OS",
    body: "Mock OS instalado com sucesso. Abra o painel de Configurações para simular diferentes níveis de bateria!",
    time: "2m atrás",
    app: "sistema"
  },
  {
    id: "2",
    title: "Mãe",
    body: "Oi meu filho, tudo bem? Me avisa quando chegar em casa!",
    time: "5m atrás",
    app: "mensagens"
  },
  {
    id: "3",
    title: "Música",
    body: "Inicie o app de Música para ver o analisador de espectro ativo!",
    time: "20m atrás",
    app: "musica"
  }
];

export const tracksList: Track[] = [
  { title: "Amanhecer Synth", artist: "Retro Future", duration: "03:24", durationSec: 204, genre: "Synthwave", color: "from-pink-500 to-indigo-600" },
  { title: "Lofi Café", artist: "Lofi Producer", duration: "02:45", durationSec: 165, genre: "Lofi Beats", color: "from-amber-600 to-amber-900" },
  { title: "Tarde de Jazz", artist: "Chill Quartet", duration: "04:12", durationSec: 252, genre: "Smooth Jazz", color: "from-emerald-500 to-slate-800" },
  { title: "Caminho do Sol", artist: "Acoustic Folk", duration: "03:05", durationSec: 185, genre: "Acoustic", color: "from-yellow-400 to-orange-500" }
];

export const initialChats: Chat[] = [
  {
    id: "ai-assistant",
    name: "Assistente IA",
    avatar: "Sparkles",
    role: "Inteligência Artificial",
    unread: true,
    messages: [
      { id: "m1", sender: "contact", text: "Olá! Sou seu Assistente IA do Mock OS. Pergunte-me qualquer coisa sobre o sistema!", timestamp: "18:30" }
    ]
  },
  {
    id: "mother",
    name: "Mãe",
    avatar: "Heart",
    role: "Família",
    unread: true,
    messages: [
      { id: "m2", sender: "contact", text: "Oi meu filho! Você está se alimentando bem? Me liga depois.", timestamp: "18:15" },
      { id: "m3", sender: "user", text: "Oi mãe, sim! Estou estudando bastante.", timestamp: "18:18" },
      { id: "m4", sender: "contact", text: "Que ótimo, te amo! Se cuida ❤️", timestamp: "18:20" }
    ]
  },
  {
    id: "love",
    name: "Amor",
    avatar: "Heart",
    role: "Namorada",
    unread: true,
    messages: [
      { id: "l1", sender: "contact", text: "Oi lindo! Já chegou no trabalho? ❤️", timestamp: "18:02" },
      { id: "l2", sender: "user", text: "Oi amor, cheguei sim! Acabei de sentar no computador.", timestamp: "18:05" },
      { id: "l3", sender: "contact", text: "Que bom vida! Bom trabalho, te amo muito! Me avisa quando sair 🥰", timestamp: "18:06" }
    ]
  },
  {
    id: "grandmother",
    name: "Vovó",
    avatar: "User",
    role: "Família",
    unread: false,
    messages: [
      { id: "g1", sender: "contact", text: "Oi meu netinho querido... a bênção de Deus... fiz aquele bolo de cenoura que você gosta... vem lanchar com a vovó hoje?...", timestamp: "15:20" },
      { id: "g2", sender: "user", text: "Oi vó! Que delícia, vou tentar ir sim! Amém!", timestamp: "15:35" },
      { id: "g3", sender: "contact", text: "Deus te abençoe meu filho... te espero...", timestamp: "15:40" }
    ]
  },
  {
    id: "friend-lucas",
    name: "Lucas",
    avatar: "User",
    role: "Amigo",
    unread: true,
    messages: [
      { id: "fl1", sender: "contact", text: "Eae mano, vai rolar o fut hoje à noite? ⚽", timestamp: "17:40" },
      { id: "fl2", sender: "user", text: "Opa, se a galera confirmar eu tô dentro!", timestamp: "17:45" },
      { id: "fl3", sender: "contact", text: "Demorou, vou mandar lá no grupo pra agitar kkk", timestamp: "17:46" }
    ]
  },
  {
    id: "tech-support",
    name: "Suporte Mock OS",
    avatar: "Wrench",
    role: "Suporte Técnico",
    unread: false,
    messages: [
      { id: "m5", sender: "contact", text: "Olá Mateus. Detectamos que seu controle de brilho e bateria foram otimizados com sucesso!", timestamp: "15:00" }
    ]
  },
  {
    id: "self-notes",
    name: "Anotações",
    avatar: "FileText",
    role: "Minhas Notas",
    unread: false,
    messages: [
      { id: "m6", sender: "user", text: "Ideias para o Mock OS: Adicionar analisador de áudio, editor de arquivos txt real e simulador de bateria no app de configurações.", timestamp: "Ontem" }
    ]
  }
];

export const initialFolders: Folder[] = [
  {
    name: "Documentos",
    icon: "Folder",
    files: [
      {
        name: "ideias_projeto.txt",
        type: "text",
        content: "Desenvolver um simulador de sistema operacional em React.\n\nPróximos passos:\n1. Resolver problema do controle de brilho (usando overlay para melhor contraste).\n2. Criar painel de controle com blurs elegantes.\n3. Integrar indicador de bateria de 3 pontos (...).\n4. Criar um editor de notas interativo.",
        size: "340 B"
      },
      {
        name: "lista_compras.txt",
        type: "text",
        content: "- Café em grãos\n- Pão artesanal\n- Manteiga salgada\n- Frutas frescas\n- Chocolate amargo 70%",
        size: "112 B"
      }
    ]
  },
  {
    name: "Imagens",
    icon: "Image",
    files: [
      { name: "Pôr do Sol.png", type: "image", mediaRef: "3", size: "1.2 MB" },
      { name: "Nebula Cósmica.png", type: "image", mediaRef: "4", size: "2.5 MB" },
      { name: "Aurora Violeta.png", type: "image", mediaRef: "2", size: "1.8 MB" }
    ]
  },
  {
    name: "Músicas",
    icon: "Music",
    files: [
      { name: "Amanhecer Synth.mp3", type: "audio", mediaRef: "Amanhecer Synth", size: "4.8 MB" },
      { name: "Lofi Café.mp3", type: "audio", mediaRef: "Lofi Café", size: "3.2 MB" },
      { name: "Tarde de Jazz.mp3", type: "audio", mediaRef: "Tarde de Jazz", size: "5.5 MB" }
    ]
  },
  {
    name: "Sistema",
    icon: "Settings",
    files: [
      {
        name: "build_info.json",
        type: "text",
        content: "{\n  \"os_name\": \"Mock OS\",\n  \"version\": \"1.0.4\",\n  \"kernel\": \"Antigravity-v5.8\",\n  \"status\": \"Otimizado\"\n}",
        size: "128 B"
      },
      {
        name: "logs_bateria.log",
        type: "text",
        content: "[INFO] Battery Status API loaded\n[INFO] Three-dot display synced with state\n[SUCCESS] Custom Manual Battery Simulator ready to run.",
        size: "145 B"
      }
    ]
  }
];
