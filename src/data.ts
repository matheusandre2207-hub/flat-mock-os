import { Wallpaper, Track, Chat, Folder, NotificationItem } from './types';

// Papéis de parede de ondas: camadas orgânicas "de papel" com sombra suave, em tons pastel.
// Três composições próprias: dunas (camadas horizontais com um sol), fluxo (ondas diagonais) e anéis (blobs concêntricos).
const rng = (seed: number) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const smoothPath = (pts: [number, number][]) => {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};
const waveWallpaper = (name: string, layout: 'dunes' | 'flow' | 'rings', seed: number, pal: string[]): Wallpaper => {
  const r = rng(seed), W = 400, H = 860, n = pal.length;
  let layers = '';
  const lighten = (hex: string) => hex; // o degradê de cada camada usa a própria cor e a próxima
  pal.forEach((c, k) => {
    const next = pal[Math.min(n - 1, k + 1)];
    const grad = `<linearGradient id="g${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c)}"/><stop offset="1" stop-color="${next}" stop-opacity="0.55"/></linearGradient>`;
    let d = '';
    if (layout === 'dunes') {
      const base = 250 + k * 108, amp = 26 + r() * 26, ph = r() * 6, f = 0.012 + r() * 0.008;
      const pts: [number, number][] = [];
      for (let x = -40; x <= 440; x += 60) pts.push([x, base + amp * Math.sin(x * f + ph) + (r() - 0.5) * 22]);
      d = `${smoothPath(pts)}L440,${H + 40}L-40,${H + 40}Z`;
    } else if (layout === 'flow') {
      const base = -20 + k * 62, amp = 40 + r() * 30, ph = r() * 6, f = 0.007 + r() * 0.006;
      const pts: [number, number][] = [];
      for (let y = -40; y <= H + 40; y += 70) pts.push([base + amp * Math.sin(y * f + ph) + (r() - 0.5) * 26 + k * 18, y]);
      d = `${smoothPath(pts)}L${W + 40},${H + 40}L${W + 40},-40Z`;
    } else {
      const cx = 330 - k * 6, cy = 150 + k * 14, R = (n - k) * 138 - 30;
      const pts: [number, number][] = [];
      const m = 12;
      const rad = Array.from({ length: m }, () => 1 + (r() - 0.5) * 0.16);
      for (let i = 0; i <= m + 2; i++) { const a = ((i % m) / m) * Math.PI * 2; const rr = R * rad[i % m]; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.18]); }
      d = `${smoothPath(pts)}Z`;
    }
    layers += `<defs>${grad}</defs><path d="${d}" fill="url(#g${k})" filter="url(#sh)"/>`;
    if (layout === 'dunes' && k === 0) layers += `<circle cx="${240 + r() * 100}" cy="${262 + r() * 34}" r="${48 + r() * 16}" fill="${pal[n - 1]}" opacity="0.95"/>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="-4" dy="7" stdDeviation="7" flood-color="#1b1b1b" flood-opacity="0.22"/></filter></defs><rect width="${W}" height="${H}" fill="${pal[0]}"/>${layers}</svg>`;
  return { name, gradient: `url("data:image/svg+xml,${encodeURIComponent(svg)}") center/cover no-repeat`, isDark: false };
};

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
  { name: "★ Shifting Gradient", gradient: "linear-gradient(135deg, #1e1b4b, #311042, #1e1b4b)", isDark: true, isAnimated: true, animatedType: "gradient-shift" },
  waveWallpaper("Ondas Verde", "flow", 11, ["#6fa384", "#82b595", "#97c6a7", "#acd5b8", "#c3e3cb", "#dbf0df"]),
  waveWallpaper("Dunas Amarelo", "dunes", 23, ["#e0b94f", "#e9c866", "#f0d680", "#f5e29c", "#faedb9", "#fdf6d6"]),
  waveWallpaper("Anéis Azul", "rings", 35, ["#6f9fcf", "#85b0da", "#9cc1e4", "#b4d2ee", "#cbe1f6", "#e1eefb"]),
  waveWallpaper("Ondas Rosa", "flow", 47, ["#d98aa8", "#e29ab6", "#eaadc5", "#f1c0d3", "#f7d3e0", "#fbe6ee"]),
  waveWallpaper("Dunas Roxo", "dunes", 59, ["#9884cf", "#a995da", "#bba9e4", "#cdbdee", "#ded2f6", "#eee7fb"]),
  waveWallpaper("Anéis Marrom", "rings", 71, ["#a67f5b", "#b68f6b", "#c6a07d", "#d4b393", "#e2c8ab", "#efdcc6"]),
  waveWallpaper("Ondas Branco", "flow", 83, ["#cfccc4", "#dbd8d1", "#e6e3dd", "#efede8", "#f6f4f0", "#fcfbf9"]),
  waveWallpaper("Dunas Laranja", "dunes", 95, ["#e08a4f", "#e99a63", "#f0ab79", "#f5bd91", "#f9cfaa", "#fce1c5"]),
  waveWallpaper("Anéis Cinza", "rings", 107, ["#8c9097", "#9da1a8", "#aeb2b8", "#bfc3c8", "#d0d3d7", "#e2e4e6"]),
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
