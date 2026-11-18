import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Download, Trash2, Check, Star, ArrowLeft, ArrowUpRight, ShieldCheck, 
  Heart, Sparkles, User, Award, FileText, Bird, Sun, Palette, Sliders, 
  Image as ImageIcon, Music as MusicIcon, Globe, Folder, Settings, MessageSquare, 
  ShoppingBag, Phone, Users, Camera, Upload, FileCode, FolderOpen
} from 'lucide-react';
import { CustomApp, MAX_CUSTOM_APP_BYTES, extractIcon, extractTitle, makeCustomAppId, pickColor } from '../customApps';
import { installFolderApp } from '../folderApps';
import AppEditSheet from './AppEditSheet';
import type { AppOverride } from '../appOverrides';
import { Search as SearchIcon, X as ClearIcon } from 'lucide-react';

function renderAppStoreIcon(iconName: string, size: number = 24, className?: string) {
  switch (iconName) {
    case 'FileText': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-1.5 ${className}`}>
          {/* Notepad Page with a yellow top band & pencil */}
          <rect x="8" y="6" width="32" height="36" rx="6" fill="#fcfcfd" />
          <path d="M8,12 Q8,6 14,6 L34,6 Q40,6 40,12 L40,14 L8,14 Z" fill="#eab308" />
          <circle cx="14" cy="10" r="1.5" fill="#ca8a04" />
          <circle cx="24" cy="10" r="1.5" fill="#ca8a04" />
          <circle cx="34" cy="10" r="1.5" fill="#ca8a04" />
          <line x1="12" y1="20" x2="36" y2="20" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="27" x2="36" y2="27" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="34" x2="28" y2="34" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(29, 27) rotate(45)">
            <rect x="0" y="0" width="4" height="12" rx="1" fill="#fbbf24" />
            <polygon points="0,0 2,-3 4,0" fill="#fca5a5" />
          </g>
        </svg>
      );
    case 'Bird': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-1 ${className}`}>
          {/* Flat retro bird */}
          <circle cx="22" cy="24" r="13" fill="#38bdf8" />
          <path d="M12,24 C10,22 8,17 12,15 C16,13 18,17 16,24 Z" fill="#7dd3fc" />
          <path d="M18,25 C14,25 12,29 16,33 C20,37 22,31 18,25 Z" fill="#7dd3fc" />
          <circle cx="27" cy="19" r="4" fill="white" />
          <circle cx="28" cy="19" r="1.5" fill="black" />
          <path d="M34,21 L41,23 L34,26 Z" fill="#f59e0b" />
          <path d="M9,26 L5,28 L9,29 Z" fill="#0284c7" />
        </svg>
      );
    case 'Sun': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-1 ${className}`}>
          <circle cx="24" cy="24" r="11" fill="#f59e0b" />
          <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
            <line x1="24" y1="4" x2="24" y2="8" />
            <line x1="24" y1="40" x2="24" y2="44" />
            <line x1="4" y1="24" x2="8" y2="24" />
            <line x1="40" y1="24" x2="44" y2="24" />
            <line x1="10" y1="10" x2="13" y2="13" />
            <line x1="35" y1="35" x2="38" y2="38" />
            <line x1="10" y1="35" x2="13" y2="32" />
            <line x1="35" y1="10" x2="38" y2="13" />
          </g>
        </svg>
      );
    case 'Palette': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-1.5 ${className}`}>
          <path d="M38,28 C41,18 36,9 25,8 C14,7 6,14 8,25 C10,36 19,40 30,38 C34,37 35,32 38,28 Z" fill="#d97706" opacity="0.85" />
          <circle cx="15" cy="28" r="2.5" fill="#1e293b" />
          <circle cx="15" cy="15" r="3" fill="#ef4444" />
          <circle cx="24" cy="13" r="3" fill="#3b82f6" />
          <circle cx="32" cy="18" r="3" fill="#10b981" />
          <circle cx="30" cy="28" r="3" fill="#f59e0b" />
        </svg>
      );
    case 'Sliders': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-1.5 ${className}`}>
          <rect x="10" y="6" width="28" height="36" rx="5" fill="#334155" />
          <rect x="14" y="10" width="20" height="9" rx="2" fill="#0f172a" />
          <text x="31" y="17" fill="#10b981" fontSize="7" fontWeight="black" fontFamily="monospace" textAnchor="end">3.1415</text>
          <g fill="#94a3b8" rx="1">
            <rect x="14" y="22" width="4" height="4" />
            <rect x="20" y="22" width="4" height="4" />
            <rect x="26" y="22" width="4" height="4" fill="#f97316" />
            <rect x="14" y="28" width="4" height="4" />
            <rect x="20" y="28" width="4" height="4" />
            <rect x="26" y="28" width="4" height="4" />
            <rect x="14" y="34" width="4" height="4" />
            <rect x="20" y="34" width="4" height="4" />
            <rect x="26" y="34" width="4" height="4" />
          </g>
        </svg>
      );
    case 'Image': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-2 ${className}`}>
          <rect x="6" y="6" width="36" height="36" rx="6" fill="#3b82f6" />
          <path d="M6,12 L36,42 L6,42 Z" fill="#1d4ed8" opacity="0.5" />
          <circle cx="15" cy="15" r="4.5" fill="#fef08a" />
          <polygon points="6,42 21,24 32,35 42,42" fill="#10b981" />
          <polygon points="16,42 26,29 36,39 42,42" fill="#059669" opacity="0.75" />
        </svg>
      );
    case 'Music': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-2 ${className}`}>
          <circle cx="24" cy="24" r="18" fill="#e11d48" />
          <circle cx="24" cy="24" r="12" fill="#fda4af" />
          <circle cx="24" cy="24" r="6" fill="#f43f5e" />
          <path d="M22,13 L31,11 L31,16 L22,18 Z" fill="white" />
          <rect x="22" y="14" width="2" height="13" fill="white" />
          <rect x="29" y="12" width="2" height="13" fill="white" />
          <circle cx="20" cy="27" r="3" fill="white" />
          <circle cx="27" cy="25" r="3" fill="white" />
        </svg>
      );
    case 'Folder':
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-2 ${className}`}>
          <path d="M6 14a3 3 0 0 1 3-3h9l4 5h17a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#3b82f6" />
          <path d="M6 20h36v15a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#60a5fa" />
        </svg>
      );
    case 'Chat':
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-2 ${className}`}>
          <path d="M8 12a5 5 0 0 1 5-5h22a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H21l-8 7v-7a5 5 0 0 1-5-5z" fill="#22c55e" />
          <circle cx="17" cy="20" r="2.2" fill="#fff" /><circle cx="24" cy="20" r="2.2" fill="#fff" /><circle cx="31" cy="20" r="2.2" fill="#fff" />
        </svg>
      );
    case 'Globe': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-2 ${className}`}>
          <circle cx="24" cy="24" r="18" fill="#4f46e5" />
          <ellipse cx="24" cy="24" rx="18" ry="6" fill="none" stroke="#c7d2fe" strokeWidth="2" />
          <ellipse cx="24" cy="24" rx="6" ry="18" fill="none" stroke="#c7d2fe" strokeWidth="2" />
          <line x1="6" y1="24" x2="42" y2="24" stroke="#c7d2fe" strokeWidth="2" />
          <line x1="24" y1="6" x2="24" y2="42" stroke="#c7d2fe" strokeWidth="2" />
        </svg>
      );
    case 'Settings': 
      return (
        <svg viewBox="0 0 48 48" className={`w-full h-full p-2 ${className}`}>
          <circle cx="24" cy="24" r="18" fill="#475569" />
          <g fill="#334155">
            <rect x="22" y="3" width="4" height="42" rx="1" />
            <rect x="22" y="3" width="4" height="42" rx="1" transform="rotate(45 24 24)" />
            <rect x="22" y="3" width="4" height="42" rx="1" transform="rotate(90 24 24)" />
            <rect x="22" y="3" width="4" height="42" rx="1" transform="rotate(135 24 24)" />
          </g>
          <circle cx="24" cy="24" r="11" fill="#475569" />
          <circle cx="24" cy="24" r="5" fill="#1e293b" />
        </svg>
      );
    default: 
      return <FileCode size={size} className={className} />;
  }
}

interface AppItem {
  id: string;
  name: string;
  category: 'productivity' | 'games' | 'utilities' | 'creativity' | 'system';
  icon: string;
  iconBgClass: string;
  size: string;
  version: string;
  rating: number;
  downloads: string;
  desc: string;
  isCore?: boolean;
  iconUrl?: string;
  color?: string;
  bundled?: boolean;
  imported?: boolean;
}

const STORE_APPS: AppItem[] = [
  // Store exclusives
  {
    id: 'notas',
    name: 'Bloco de Notas',
    category: 'productivity',
    icon: 'FileText',
    iconBgClass: 'bg-amber-400',
    size: '4 MB',
    version: 'v1.1.0',
    rating: 4.8,
    downloads: '1.2M',
    desc: 'Escreva notas rápidas, salve ideias e lembretes com cores pastéis personalizáveis e pesquise por palavras-chave.',
  },
  {
    id: 'flappy',
    name: 'Flappy Bird',
    category: 'games',
    icon: 'Bird',
    iconBgClass: 'bg-cyan-400',
    size: '9 MB',
    version: 'v1.3.0',
    rating: 4.9,
    downloads: '850K',
    desc: 'O maior clássico arcade para celular! Toque na tela para bater asas, ultrapasse canos desafiadores e quebre seu recorde de pontuação.',
  },
  {
    id: 'clima',
    name: 'Previsão do Tempo',
    category: 'utilities',
    icon: 'Sun',
    iconBgClass: 'bg-sky-400',
    size: '6 MB',
    version: 'v1.2.1',
    rating: 4.7,
    downloads: '2.1M',
    desc: 'Veja as condições atmosféricas em tempo real para qualquer cidade, com velocidade do vento, humidade do ar, UV e previsões detalhadas.',
  },
  {
    id: 'paint',
    name: 'Mini Paint',
    category: 'creativity',
    icon: 'Palette',
    iconBgClass: 'bg-purple-500',
    size: '7 MB',
    version: 'v1.0.5',
    rating: 4.6,
    downloads: '420K',
    desc: 'Transforme sua tela em uma tela de pintura livre! Mude o tamanho e a cor do pincel, use borracha e salve o desenho direto no aparelho.',
  },
  
  // System core apps
  {
    id: 'calculadora',
    name: 'Calculadora OS',
    category: 'system',
    icon: 'Sliders',
    iconBgClass: 'bg-orange-400',
    size: '3 MB',
    version: 'v1.2.0',
    rating: 4.5,
    downloads: 'Nativo',
    desc: 'Realize contas aritméticas, exponenciais e trigonometria em uma interface minimalista com som de toque tátil.',
    isCore: true,
  },
  {
    id: 'galeria',
    name: 'Minha Galeria',
    category: 'system',
    icon: 'Image',
    iconBgClass: 'bg-pink-500',
    size: '18 MB',
    version: 'v1.0.0',
    rating: 4.6,
    downloads: 'Nativo',
    desc: 'Veja e defina papéis de parede elegantes e degradees no seu aparelho com uma confirmação interativa de visualização.',
    isCore: true,
  },
  {
    id: 'musica',
    name: 'Música Player',
    category: 'system',
    icon: 'Music',
    iconBgClass: 'bg-red-500',
    size: '3 MB',
    version: 'v1.0.8',
    rating: 4.9,
    downloads: 'Nativo',
    desc: 'Player de áudio completo com músicas integradas, controles de reprodução (tocar, pausar, passar), barra de progresso e volume.',
    isCore: true,
  },
  {
    id: 'navegador',
    name: 'Navegador Web',
    category: 'system',
    icon: 'Globe',
    iconBgClass: 'bg-indigo-500',
    size: '22 MB',
    version: 'v1.4.2',
    rating: 4.4,
    downloads: 'Nativo',
    desc: 'Navegue por portais famosos e sites simulados do sistema com barra de endereços inteligente, histórico de pesquisa e abas rápidas.',
    isCore: true,
  },
  {
    id: 'arquivos',
    name: 'Arquivos',
    category: 'system',
    icon: 'Folder',
    iconBgClass: 'bg-blue-500',
    size: '12 MB',
    version: 'v1.2.0',
    rating: 4.5,
    downloads: 'Nativo',
    desc: 'Organize pastas, abra documentos e encontre tudo que está guardado no seu aparelho.',
    isCore: true,
  },
  {
    id: 'mensagens',
    name: 'Mensagens',
    category: 'system',
    icon: 'Chat',
    iconBgClass: 'bg-green-500',
    size: '18 MB',
    version: 'v2.0.1',
    rating: 4.6,
    downloads: 'Nativo',
    desc: 'Converse com seus contatos, receba notificações e responda direto da barra de avisos.',
    isCore: true,
  }
];

const REVIEWS = [
  { user: "Matheus A.", rating: 5, date: "Ontem", text: "Excelente funcionamento! A integração tátil e a estética limpa do app são fantásticas." },
  { user: "Julia L.", rating: 4, date: "3 dias atrás", text: "Muito bonito e direto ao ponto. Adoro usar no dia a dia." },
  { user: "Lucas F.", rating: 5, date: "1 semana atrás", text: "Flappy Bird funciona que é uma beleza, adorei o som de pulo!" }
];

interface StoreAppProps {
  darkMode: boolean;
  installedApps: string[];
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onOpenApp: (id: string) => void;
  customApps: CustomApp[];
  onImportCustomApp: (app: CustomApp) => Promise<boolean>;
  onDeleteCustomApp: (id: string) => void;
  onSetFollowWallpaper: (id: string, value: boolean) => void;
  onSetOrientation: (id: string, o: 'portrait' | 'landscape') => void;
  onUpdateCustomApp: (id: string, patch: Partial<CustomApp>) => void;
  overrides: Record<string, AppOverride>;
  onUpdateApp: (id: string, o: AppOverride | null) => void;
}

// Ícone de um app da loja: imagem enviada pelo app importado, ou o desenho padrão
function appIconNode(app: AppItem, size: number) {
  if (app.iconUrl && app.iconUrl.startsWith('data:image')) {
    return <img src={app.iconUrl} alt="" className="w-full h-full object-cover rounded-[inherit]" />;
  }
  if (app.iconUrl) return <span className="text-2xl">{app.iconUrl}</span>;
  return renderAppStoreIcon(app.icon, size);
}

// Transforma um app HTML importado no mesmo formato dos apps da loja
function customToItem(app: CustomApp): AppItem {
  return {
    id: app.id,
    name: app.name,
    color: app.color,
    bundled: !!app.bundled,
    imported: !app.bundled,
    category: app.category ?? 'utilities',
    icon: 'Custom',
    iconBgClass: 'bg-slate-500',
    size: app.size,
    version: app.kind === 'folder' ? `${app.fileCount ?? 0} arquivos` : 'v1.0.0',
    rating: app.rating ?? 0,
    downloads: app.downloads ?? 'Importado',
    iconUrl: app.iconUrl,
    desc: app.desc ? app.desc : app.kind === 'folder'
      ? 'Pacote instalado de uma pasta, com os arquivos dele. Roda com o mesmo acesso do AeroOS: instale só pastas de fontes confiáveis.'
      : 'App HTML importado por você. Roda isolado do sistema e não tem acesso aos seus dados.',
  };
}

export default function StoreApp({ darkMode, installedApps, onInstall, onUninstall, onOpenApp, customApps, onImportCustomApp, onDeleteCustomApp, onSetFollowWallpaper, onSetOrientation, onUpdateCustomApp, overrides, onUpdateApp }: StoreAppProps) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const baseCatalog: AppItem[] = [...STORE_APPS, ...customApps.map(customToItem)];
  // Nome e ícone personalizados valem para qualquer app (padrão, da loja ou importado)
  const catalog: AppItem[] = baseCatalog.map(a => {
    const ov = overrides[a.id];
    return ov ? { ...a, name: ov.name ?? a.name, iconUrl: ov.iconNormal ?? a.iconUrl } : a;
  });

  useEffect(() => {
    if (!importMsg) return;
    const t = window.setTimeout(() => setImportMsg(null), 3800);
    return () => window.clearTimeout(t);
  }, [importMsg]);

  // Pasta de jogo/app (com JS, CSS, imagens, áudio...): grava tudo no IndexedDB
  const handleFolderChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (!list.length) return;
    setAvatarMenuOpen(false);
    const notify = (ok: boolean, text: string) => setImportMsg({ ok, text });
    notify(true, 'Preparando a pasta…');
    try {
      const app = await installFolderApp(list, pct => notify(true, `Instalando pacote… ${pct}%`));
      const ok = await onImportCustomApp(app).catch(() => false);
      notify(ok, ok ? `"${app.name}" foi instalado e já está na loja.` : 'Não foi possível salvar este pacote no aparelho.');
    } catch (err) {
      notify(false, err instanceof Error ? err.message : 'Não foi possível instalar esta pasta.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite importar o mesmo arquivo de novo
    if (!file) return;
    const notify = (ok: boolean, text: string) => setImportMsg({ ok, text });

    if (!/\.html?$/i.test(file.name) && file.type !== 'text/html') {
      notify(false, 'Escolha um arquivo .html');
      return;
    }
    if (file.size > MAX_CUSTOM_APP_BYTES) {
      notify(false, 'Arquivo muito grande (máximo 10 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const html = String(reader.result || '');
      if (!html.trim()) {
        notify(false, 'O arquivo está vazio');
        return;
      }
      const name = extractTitle(html, file.name.replace(/\.html?$/i, ''));
      const app: CustomApp = {
        id: makeCustomAppId(),
        name,
        html,
        color: pickColor(customApps.length),
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        iconUrl: extractIcon(html),
        createdAt: Date.now(),
      };
      const ok = await onImportCustomApp(app).catch(() => false);
      notify(ok, ok ? `"${name}" foi importado e já está na loja.` : 'Não foi possível salvar este app no aparelho. Tente de novo.');
      if (ok) setAvatarMenuOpen(false);
    };
    reader.onerror = () => notify(false, 'Não foi possível ler o arquivo');
    reader.readAsText(file);
  };

  const [activeTab, setActiveTab] = useState<'all' | 'productivity' | 'games' | 'utilities' | 'creativity' | 'system'>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [editing, setEditing] = useState<{ id: string } | null>(null);
  
  // Install progress simulation
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);

  // Custom Uninstall Confirmation Modal state
  const [uninstallConfirmApp, setUninstallConfirmApp] = useState<AppItem | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playTone = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstallClick = (appId: string) => {
    if (installingId) return;
    
    setInstallingId(appId);
    setInstallProgress(0);
    playTone(523.25, 'sine', 0.08); // C5 note

    let currentVal = 0;
    const interval = setInterval(() => {
      currentVal += 10;
      if (currentVal >= 100) {
        clearInterval(interval);
        setInstallProgress(100);
        onInstall(appId);
        setInstallingId(null);
        playTone(1046.5, 'sine', 0.15); // C6 note
      } else {
        setInstallProgress(currentVal);
      }
    }, 100);
  };

  const handleUninstallRequest = (app: AppItem) => {
    setUninstallConfirmApp(app);
    playTone(329.63, 'triangle', 0.1); // E4 note
  };

  const confirmUninstall = () => {
    if (uninstallConfirmApp) {
      onUninstall(uninstallConfirmApp.id);
      playTone(261.63, 'triangle', 0.15); // C4 note
      setUninstallConfirmApp(null);
    }
  };

  // Destaques dinâmicos: novidades (importados e do sistema) primeiro, depois os clássicos da loja
  const featured = [...catalog.filter(a => a.imported), ...catalog.filter(a => a.bundled), ...catalog.filter(a => !a.isCore && !a.imported && !a.bundled)].slice(0, 6);
  useEffect(() => {
    if (featured.length < 2) return;
    const t = window.setInterval(() => setHeroIdx(i => i + 1), 5200);
    return () => window.clearInterval(t);
  }, [featured.length]);
  const hero = featured[heroIdx % Math.max(1, featured.length)];
  const heroColor = hero?.color ?? ['#7e22ce', '#0e7490', '#b45309', '#be185d', '#4338ca', '#047857'][(heroIdx % 6)];
  const novidades = catalog.filter(a => a.imported || a.bundled);
  const installedCount = catalog.filter(a => a.isCore || installedApps.includes(a.id)).length;


  const filteredApps = catalog.filter(app => {
    const matchesTab = activeTab === 'all' || app.category === activeTab;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.desc.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={`flex flex-col h-full select-none font-sans relative ${
 darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
 }`}>
      
      {/* 1. APP STORE PREMIUM HEADER BAR */}
      <div className={`px-5 py-4 flex justify-between items-center shrink-0 ${
 darkMode ? 'bg-slate-950' : 'bg-white border-b border-slate-200/60'
 }`}>
        <div className="flex items-center gap-3">
          {selectedApp ? (
            <button 
              onClick={() => {
                setSelectedApp(null);
                playTone(440, 'sine', 0.05);
              }}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-current border-none bg-transparent cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="flex items-center justify-center text-purple-400">
              <Sparkles size={22} className="animate-pulse" />
            </div>
          )}
          <div className="text-left">
            <h1 className="text-[11px] font-bold text-slate-400">
              {selectedApp ? selectedApp.category : 'APLICATIVOS'}
            </h1>
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              {selectedApp ? selectedApp.name : 'App Store'}
            </p>
          </div>
        </div>
        
        {/* Perfil: toque no avatar para abrir o menu (importar apps HTML) */}
        {!selectedApp && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setAvatarMenuOpen(v => !v); }}
              aria-label="Menu do perfil"
              aria-expanded={avatarMenuOpen}
              className="p-0 border-none bg-transparent cursor-pointer rounded-full active:scale-95 transition-transform"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="User Profile"
                className="w-9 h-9 rounded-full object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        )}
      </div>

      {/* Editar nome e ícones de qualquer app */}
      {editing && (() => {
        const base = baseCatalog.find(a => a.id === editing.id);
        const ov = overrides[editing.id];
        return (
          <div className="absolute inset-0 z-[60] bg-black/55 flex items-end" onClick={() => setEditing(null)}>
            <div onClick={e => e.stopPropagation()} className={`w-full max-h-[90%] overflow-y-auto rounded-t-3xl p-5 pb-7 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              <AppEditSheet
                defaultName={base?.name ?? ''}
                name={ov?.name ?? base?.name ?? ''}
                iconNormal={ov?.iconNormal}
                iconSystem={ov?.iconSystem}
                darkMode={darkMode}
                customized={!!ov}
                onSave={v => {
                  onUpdateApp(editing.id, { name: v.name === base?.name ? undefined : v.name, iconNormal: v.iconNormal, iconSystem: v.iconSystem });
                  setSelectedApp(a => (a && a.id === editing.id ? { ...a, name: v.name, iconUrl: v.iconNormal ?? base?.iconUrl } : a));
                  setEditing(null);
                }}
                onReset={() => {
                  onUpdateApp(editing.id, null);
                  setSelectedApp(a => (a && a.id === editing.id && base ? { ...a, name: base.name, iconUrl: base.iconUrl } : a));
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>
        );
      })()}

      {/* Menu do perfil (fecha ao tocar fora) */}
      {avatarMenuOpen && !selectedApp && (
        <>
          <div className="absolute inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
          <div className={`absolute right-3 top-16 z-50 w-64 rounded-2xl p-1.5 border shadow-lg ${darkMode ? 'bg-slate-900 border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); importInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-none bg-transparent cursor-pointer text-left hover:bg-slate-500/10 transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0"><Upload size={15} /></span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold">Importar app HTML</span>
                <span className="block text-[11px] opacity-60">Um arquivo .html vira um app na loja</span>
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-none bg-transparent cursor-pointer text-left hover:bg-slate-500/10 transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0"><FolderOpen size={15} /></span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold">Instalar pasta de jogo</span>
                <span className="block text-[11px] opacity-60">Pasta inteira, com JS e arquivos (até 1,5 GB)</span>
              </span>
            </button>
          </div>
        </>
      )}
      <input ref={importInputRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleImportFile} />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFolderChosen}
        {...({ webkitdirectory: '', directory: '' } as any)}
      />

      {importMsg && (
        <div className={`mx-4 mt-3 rounded-xl px-3.5 py-2.5 text-xs font-medium border ${importMsg.ok ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {importMsg.text}
        </div>
      )}

      {/* 2. MAIN STORE VIEWPORT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* DETAILS SCREEN */}
        {selectedApp ? (
          <div className="p-5 space-y-6">
            
            {/* App Branding Info Card */}
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-[22px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0">
                {appIconNode(selectedApp, 36)}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h2 className="font-semibold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">{selectedApp.name}</h2>
                <p className="text-xs font-bold text-blue-500 dark:text-blue-400 capitalize mt-0.5">{selectedApp.category}</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold font-mono bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/10">
                    {selectedApp.version}
                  </span>
                  <span className="text-[11px] font-medium opacity-40 font-mono text-slate-500 dark:text-slate-300">{selectedApp.size}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Banner Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-[20px] text-center text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
              <div className="flex flex-col justify-center items-center">
                <span className="opacity-40 text-[11px] block mb-0.5 font-bold text-slate-500 dark:text-slate-400">Nota</span>
                <span className="font-semibold text-[12.5px] flex items-center gap-0.5 text-slate-900 dark:text-white">
                  {selectedApp.rating > 0 ? <>{selectedApp.rating} <Star size={11} fill="currentColor" className="text-amber-500 border-none" /></> : '—'}
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-white/5 flex flex-col justify-center items-center">
                <span className="opacity-40 text-[11px] block mb-0.5 font-bold text-slate-500 dark:text-slate-400">Baixados</span>
                <span className="font-semibold text-[12.5px] text-blue-500 dark:text-blue-400">{selectedApp.downloads}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="opacity-40 text-[11px] block mb-0.5 font-bold text-slate-500 dark:text-slate-400">Segurança</span>
                <span className="font-bold text-[11px] text-emerald-500 flex items-center gap-0.5">
                  <ShieldCheck size={11} /> Seguro
                </span>
              </div>
            </div>

            {/* Action Buttons Zone */}
            <div className="space-y-2 pt-1">
              {installingId === selectedApp.id ? (
                /* Installing custom progress loading bar */
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-[18px] border border-blue-500/10 p-3.5 text-center space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold font-mono px-1">
                    <span className="animate-pulse text-blue-500 dark:text-blue-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                      Instalando aplicativo...
                    </span>
                    <span className="text-blue-500 dark:text-blue-400">{installProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-100" style={{ width: `${installProgress}%` }} />
                  </div>
                </div>
              ) : installedApps.includes(selectedApp.id) ? (
                /* Application installed: Open or Uninstall */
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => {
                      onOpenApp(selectedApp.id);
                      setSelectedApp(null);
                      playTone(659.25, 'sine', 0.05);
                    }}
                    className="flex-1 py-3.5 bg-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <span>Iniciar Aplicativo</span>
                    <ArrowUpRight size={14} />
                  </button>
                  
                  {!selectedApp.isCore && (
                    <button 
                      onClick={() => handleUninstallRequest(selectedApp)}
                      className="px-4 py-3.5 rounded-xl border-none cursor-pointer flex items-center justify-center transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10"
                      title="Desinstalar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ) : (
                /* Uninstalled: Download and Install action button */
                <button 
                  onClick={() => handleInstallClick(selectedApp.id)}
                  className="w-full py-3.5 bg-blue-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  <span>Obter Aplicativo Grátis ({selectedApp.size})</span>
                </button>
              )}
            </div>

            {selectedApp.id.startsWith('custom-') && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-[20px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Mudar com o papel de parede</h4>
                  <p className="text-[11px] opacity-60 mt-0.5 text-slate-500 dark:text-slate-400">O app recebe as cores do papel de parede pelas variáveis --aero-*.</p>
                </div>
                <input
                  type="checkbox"
                  className="os-switch"
                  aria-label="Mudar com o papel de parede"
                  checked={!!customApps.find(a => a.id === selectedApp.id)?.followWallpaper}
                  onChange={(e) => onSetFollowWallpaper(selectedApp.id, e.target.checked)}
                />
              </div>
            )}

            {selectedApp.id.startsWith('custom-') && (
              <div className="p-4 rounded-[20px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Orientação ao abrir</h4>
                  <p className="text-[11px] opacity-60 mt-0.5 text-slate-500 dark:text-slate-400">Paisagem é ótimo para jogos. Você também pode girar em qualquer app pelos ajustes rápidos.</p>
                </div>
                <div className="flex p-1 rounded-2xl bg-slate-200/60 dark:bg-white/5 gap-1">
                  {(['portrait', 'landscape'] as const).map(o => {
                    const cur = customApps.find(a => a.id === selectedApp.id)?.orientation ?? 'portrait';
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => onSetOrientation(selectedApp.id, o)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${cur === o ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        {o === 'portrait' ? 'Retrato' : 'Paisagem'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedApp.id.startsWith('custom-') && (
              <div className="p-4 rounded-[20px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Barra de status na paisagem</h4>
                  <p className="text-[11px] opacity-60 mt-0.5 text-slate-500 dark:text-slate-400">As pílulas de hora, sinal e bateria mudam de cor conforme o fundo do app.</p>
                </div>
                <div className="flex p-1 rounded-2xl bg-slate-200/60 dark:bg-white/5 gap-1">
                  {([['auto', 'Automática'], ['dark', 'Escura'], ['light', 'Clara']] as const).map(([t, l]) => {
                    const cur = customApps.find(a => a.id === selectedApp.id)?.statusTone ?? 'auto';
                    return (
                      <button key={t} type="button" onClick={() => onUpdateCustomApp(selectedApp.id, { statusTone: t })}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${cur === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{l}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {(
              <button
                type="button"
                onClick={() => setEditing({ id: selectedApp.id })}
                className="w-full py-3 rounded-xl border-none cursor-pointer text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
              >
                Editar nome e ícones
              </button>
            )}

            {selectedApp.id.startsWith('custom-') && !selectedApp.bundled && (
              <button
                type="button"
                onClick={() => { onDeleteCustomApp(selectedApp.id); setSelectedApp(null); }}
                className="w-full py-3 rounded-xl border-none cursor-pointer text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-500"
              >
                Excluir app importado da loja
              </button>
            )}

            {/* Description section card */}
            <div className="space-y-2 text-left">
              <h3 className="font-semibold text-[11px] opacity-45 text-slate-500 dark:text-slate-400">Descrição Oficial</h3>
              <p className="p-4 rounded-[20px] leading-relaxed text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                {selectedApp.desc}
              </p>
            </div>

            {/* User review section card */}
            <div className="space-y-3.5 text-left pt-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-[11px] opacity-45 text-slate-500 dark:text-slate-400">Avaliações & Opiniões</h3>
                <span className="text-[11px] text-blue-500 dark:text-blue-400 font-bold hover:underline cursor-pointer">Ver todas</span>
              </div>
              <div className="space-y-2">
                {REVIEWS.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.user}</span>
                      <span className="text-[11px] opacity-40 text-slate-500 dark:text-slate-300">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={9} fill={i < rev.rating ? "currentColor" : "none"} className="border-none" />
                      ))}
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed text-slate-700 dark:text-slate-300">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* MAIN STORE HOME SCREEN */
          <div className="p-4 space-y-5">
            
            {/* Pesquisa */}
            <div className="flex items-center gap-2.5 px-4 h-11 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
              <SearchIcon size={16} className="opacity-50 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar apps, jogos e mais" aria-label="Pesquisar na loja"
                className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar" className="opacity-50 shrink-0"><ClearIcon size={15} /></button>}
            </div>

            {/* DESTAQUE DINÂMICO: troca sozinho entre as novidades */}
            {hero && !search && (
              <div
                onClick={() => { setSelectedApp(hero); playTone(493.88, 'sine', 0.05); }}
                className="relative rounded-[28px] aspect-[16/9.5] overflow-hidden text-white p-5 flex flex-col justify-between cursor-pointer border border-white/10"
                style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${heroColor} 75%, #000), color-mix(in srgb, ${heroColor} 28%, #0b0b0f))` }}
              >
                <div key={hero.id} className="absolute inset-0 flex flex-col justify-between p-5" style={{ animation: 'storeFade .6s ease both' }}>
                  <span className="self-start text-[11px] font-semibold px-3 py-1 bg-black/35 backdrop-blur rounded-full border border-white/10">
                    {hero.imported ? 'IMPORTADO POR VOCÊ' : hero.bundled ? 'NOVIDADE' : 'APP RECOMENDADO'}
                  </span>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 w-24 h-24 rounded-[26px] bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center overflow-hidden text-4xl">
                    {appIconNode(hero, 52)}
                  </div>
                  <div className="relative z-10 pr-28">
                    <h2 className="font-semibold text-xl leading-tight tracking-tight">{hero.name}</h2>
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{hero.desc}</p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-5 flex gap-1.5">
                  {featured.map((f, i) => (
                    <span key={f.id} className={`h-1.5 rounded-full transition-all ${i === heroIdx % featured.length ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                  ))}
                </div>
              </div>
            )}
            <style>{`@keyframes storeFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>

            {activeTab === 'all' && !search && novidades.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Novidades</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-500">{installedCount} instalados · {catalog.length} disponíveis</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                  {novidades.map(a => (
                    <button key={a.id} onClick={() => { setSelectedApp(a); playTone(520, 'sine', 0.04); }}
                      className="shrink-0 w-[104px] flex flex-col items-center gap-2 p-3 rounded-[20px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 active:scale-95 transition-transform">
                      <div className="w-14 h-14 rounded-[16px] flex items-center justify-center overflow-hidden text-2xl" style={{ background: a.color ?? '#475569' }}>
                        <span className="w-full h-full flex items-center justify-center text-white">{appIconNode(a, 28)}</span>
                      </div>
                      <span className="text-[11px] font-semibold leading-tight text-center line-clamp-2">{a.name}</span>
                      <span className="text-[10px] text-slate-500">{installedApps.includes(a.id) ? 'Instalado' : a.downloads}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIES HORIZONTAL NAVIGATION PILLS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'productivity', label: 'Produtividade' },
                { id: 'games', label: 'Jogos' },
                { id: 'utilities', label: 'Clima' },
                { id: 'creativity', label: 'Criatividade' },
                { id: 'system', label: 'Sistema' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    playTone(550, 'sine', 0.03);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border shrink-0 cursor-pointer transition-all ${
 activeTab === tab.id 
 ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent' 
 : 'bg-transparent border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700'
 }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* APPS LISTING */}
            <div className="space-y-3 pt-1 text-left">
              <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                {activeTab === 'all' ? 'APLICATIVOS DISPONÍVEIS' : 'RESULTADOS'}
              </h3>

              {filteredApps.length === 0 ? (
                <div className="text-center py-16 text-xs opacity-40 border border-dashed border-slate-300 dark:border-slate-800/40 rounded-2xl text-slate-500 dark:text-slate-400">
                  Nenhum aplicativo encontrado
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredApps.map(app => (
                    <div 
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        playTone(523.25, 'sine', 0.05);
                      }}
                      className="flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Perfect Squared Icon Container with thin border */}
                        <div className="w-14 h-14 rounded-[16px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0">
                          {appIconNode(app, 24)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{app.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[210px] sm:max-w-md">{app.desc}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{app.size}</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">•</span>
                            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                              {app.rating > 0 ? <>{app.rating} <Star size={10} fill="currentColor" className="border-none text-amber-500" /></> : 'Importado'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Circular Blue/Dark Download Button (Identical to Photo) */}
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        {installingId === app.id ? (
                          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center border border-blue-500/20">
                            <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : installedApps.includes(app.id) ? (
                          <div className="flex gap-1.5 items-center">
                            <button 
                              onClick={() => {
                                onOpenApp(app.id);
                                playTone(659.25, 'sine', 0.05);
                              }}
                              className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-[11px] rounded-lg border-none cursor-pointer transition-all active:scale-95"
                            >
                              Abrir
                            </button>
                            {!app.isCore && (
                              <button 
                                onClick={() => handleUninstallRequest(app)}
                                className="p-1.5 rounded-lg border-none cursor-pointer transition-all bg-red-500/10 hover:bg-red-500/25 text-red-500 dark:text-red-400"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleInstallClick(app.id)}
                            className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border-none cursor-pointer flex items-center justify-center transition-all active:scale-90"
                            title="Instalar"
                          >
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. CUSTOM UNINSTALL CONFIRMATION MODAL/SHEET */}
      {uninstallConfirmApp && (
        <div className="absolute inset-0 bg-black/75 z-50 flex items-end justify-center">
          <div className="w-full max-w-sm rounded-t-3xl p-6 space-y-5 animate-[slide-up_0.25s_ease-out] border-t bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mb-1">
                <Trash2 size={22} />
              </div>
              <h3 className="font-semibold text-sm">Desinstalar Aplicativo?</h3>
              <p className="text-xs opacity-60 px-3 text-slate-500 dark:text-slate-300">
                Deseja remover <strong>{uninstallConfirmApp.name}</strong> e todos os seus dados locais do Mock OS?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setUninstallConfirmApp(null);
                  playTone(400, 'sine', 0.05);
                }}
                className="flex-1 py-3 text-xs font-semibold rounded-xl border cursor-pointer bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmUninstall}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl border-none cursor-pointer shadow-red-600/10 active:scale-95 transition-all"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
