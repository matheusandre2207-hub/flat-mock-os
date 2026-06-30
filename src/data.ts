import { Wallpaper, Track, Chat, Folder, NotificationItem } from './types';

export const wallpapersList: Wallpaper[] = [
  { name: "Metal Shift", gradient: "linear-gradient(135deg, #a6afb8, #cbd4dc, #5e6468, #e3e9ed)", isDark: false },
  { name: "Metal Shift Escuro", gradient: "linear-gradient(135deg, #121517, #1e2225, #0a0b0d, #252a2f)", isDark: true },
  { name: "Aurora Violeta", gradient: "linear-gradient(135deg, #0f172a, #1e1b4b, #311042, #115e59)", isDark: true },
  { name: "Pôr do Sol Minimalista", gradient: "linear-gradient(135deg, #f43f5e, #ec4899, #d946ef, #8b5cf6, #3b82f6)", isDark: false },
  { name: "Nebula Cósmica", gradient: "linear-gradient(135deg, #020617, #0f172a, #1e1b4b, #020617)", isDark: true },
  { name: "Floresta Sombria", gradient: "linear-gradient(135deg, #14532d, #064e3b, #022c22, #020617)", isDark: true },
  { name: "Lofi Vibes", gradient: "linear-gradient(135deg, #ff9a9e, #fecfef, #a1c4fd, #c2e9fb)", isDark: false }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Sistema Mock OS",
    body: "Mock OS instalado com sucesso. Abra o painel de Configurações para simular diferentes níveis de bateria!",
    time: "Agora",
    app: "sistema"
  },
  {
    id: "2",
    title: "Mãe ❤️",
    body: "Oi meu filho, tudo bem? Me avisa quando chegar em casa!",
    time: "5m atrás",
    app: "mensagens"
  },
  {
    id: "3",
    title: "Música 🎵",
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
    avatar: "🤖",
    role: "Inteligência Artificial",
    unread: true,
    messages: [
      { id: "m1", sender: "contact", text: "Olá! Sou seu Assistente IA do Mock OS. Pergunte-me qualquer coisa sobre o sistema!", timestamp: "18:30" }
    ]
  },
  {
    id: "mother",
    name: "Mãe ❤️",
    avatar: "👩",
    role: "Família",
    unread: true,
    messages: [
      { id: "m2", sender: "contact", text: "Oi meu filho! Você está se alimentando bem? Me liga depois.", timestamp: "18:15" },
      { id: "m3", sender: "user", text: "Oi mãe, sim! Estou estudando bastante.", timestamp: "18:18" },
      { id: "m4", sender: "contact", text: "Que ótimo, te amo! Se cuida ❤️", timestamp: "18:20" }
    ]
  },
  {
    id: "tech-support",
    name: "Suporte Mock OS",
    avatar: "🛠️",
    role: "Suporte Técnico",
    unread: false,
    messages: [
      { id: "m5", sender: "contact", text: "Olá Mateus. Detectamos que seu controle de brilho e bateria foram otimizados com sucesso!", timestamp: "15:00" }
    ]
  },
  {
    id: "self-notes",
    name: "Anotações",
    avatar: "📝",
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
    icon: "📂",
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
    icon: "🖼️",
    files: [
      { name: "Pôr do Sol.png", type: "image", mediaRef: "3", size: "1.2 MB" },
      { name: "Nebula Cósmica.png", type: "image", mediaRef: "4", size: "2.5 MB" },
      { name: "Aurora Violeta.png", type: "image", mediaRef: "2", size: "1.8 MB" }
    ]
  },
  {
    name: "Músicas",
    icon: "🎵",
    files: [
      { name: "Amanhecer Synth.mp3", type: "audio", mediaRef: "Amanhecer Synth", size: "4.8 MB" },
      { name: "Lofi Café.mp3", type: "audio", mediaRef: "Lofi Café", size: "3.2 MB" },
      { name: "Tarde de Jazz.mp3", type: "audio", mediaRef: "Tarde de Jazz", size: "5.5 MB" }
    ]
  },
  {
    name: "Sistema",
    icon: "⚙️",
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
