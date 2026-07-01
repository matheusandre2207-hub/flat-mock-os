import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Trash2, Check, Star, ArrowLeft, ArrowUpRight, ShieldCheck, Heart, Sparkles, User, Award } from 'lucide-react';

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
}

const STORE_APPS: AppItem[] = [
  // Store exclusives
  {
    id: 'notas',
    name: 'Bloco de Notas',
    category: 'productivity',
    icon: '📝',
    iconBgClass: 'bg-gradient-to-tr from-amber-400 to-yellow-500',
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
    icon: '🐦',
    iconBgClass: 'bg-gradient-to-tr from-cyan-400 to-blue-500',
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
    icon: '☀️',
    iconBgClass: 'bg-gradient-to-tr from-sky-400 to-amber-500',
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
    icon: '🎨',
    iconBgClass: 'bg-gradient-to-tr from-purple-500 to-pink-500',
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
    icon: '🧮',
    iconBgClass: 'bg-gradient-to-tr from-orange-400 to-red-500',
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
    icon: '🖼️',
    iconBgClass: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500',
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
    icon: '🎵',
    iconBgClass: 'bg-gradient-to-tr from-red-500 to-rose-600',
    size: '36 MB',
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
    icon: '🌐',
    iconBgClass: 'bg-gradient-to-tr from-indigo-500 to-purple-600',
    size: '22 MB',
    version: 'v1.4.2',
    rating: 4.4,
    downloads: 'Nativo',
    desc: 'Navegue por portais famosos e sites simulados do sistema com barra de endereços inteligente, histórico de pesquisa e abas rápidas.',
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
}

export default function StoreApp({ darkMode, installedApps, onInstall, onUninstall, onOpenApp }: StoreAppProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'productivity' | 'games' | 'utilities' | 'creativity' | 'system'>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  
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

  const filteredApps = STORE_APPS.filter(app => {
    const matchesTab = activeTab === 'all' || app.category === activeTab;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.desc.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={`flex flex-col h-full select-none font-sans relative ${
      darkMode ? 'bg-[#0a0c10] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* 1. APP STORE HEADER BAR */}
      <div className={`px-5 py-4 border-b flex justify-between items-center shrink-0 backdrop-blur-xl ${
        darkMode ? 'border-white/5 bg-[#0e121a]/90' : 'border-slate-200/60 bg-white/90 shadow-xs'
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <Sparkles size={16} className="animate-pulse" />
            </div>
          )}
          <div>
            <h1 className="text-xs font-extrabold tracking-tight uppercase opacity-55 text-left">
              {selectedApp ? selectedApp.category : 'Aplicativos'}
            </h1>
            <p className="text-sm font-black text-left leading-none">
              {selectedApp ? selectedApp.name : 'App Store'}
            </p>
          </div>
        </div>
        
        {/* Profile Avatar simulation */}
        {!selectedApp && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 shadow-xs">
              M
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN STORE VIEWPORT PORT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* DETAILS SCREEN */}
        {selectedApp ? (
          <div className="p-5 space-y-6">
            
            {/* App Branding Info Card */}
            <div className="flex gap-4 items-center">
              <div className={`w-20 h-20 rounded-[22px] flex items-center justify-center text-4xl shadow-xl shadow-black/10 shrink-0 ${selectedApp.iconBgClass}`}>
                {selectedApp.icon}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h2 className="font-black text-lg leading-tight tracking-tight">{selectedApp.name}</h2>
                <p className="text-xs font-bold text-blue-500 capitalize mt-0.5">{selectedApp.category}</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-blue-500/10 text-blue-500 border border-blue-500/10">
                    {selectedApp.version}
                  </span>
                  <span className="text-[10px] font-medium opacity-40 font-mono">{selectedApp.size}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Banner Grid */}
            <div className={`grid grid-cols-3 gap-2.5 p-3.5 rounded-[20px] text-center text-xs border ${
              darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200/50 shadow-xs'
            }`}>
              <div className="flex flex-col justify-center items-center">
                <span className="opacity-40 text-[9px] block mb-0.5 uppercase tracking-wider font-bold">Nota</span>
                <span className="font-extrabold text-[12.5px] flex items-center gap-0.5">
                  {selectedApp.rating} <Star size={11} fill="currentColor" className="text-amber-500 border-none" />
                </span>
              </div>
              <div className="border-x border-slate-200/40 dark:border-white/5 flex flex-col justify-center items-center">
                <span className="opacity-40 text-[9px] block mb-0.5 uppercase tracking-wider font-bold">Baixados</span>
                <span className="font-extrabold text-[12.5px] text-blue-500">{selectedApp.downloads}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="opacity-40 text-[9px] block mb-0.5 uppercase tracking-wider font-bold">Segurança</span>
                <span className="font-bold text-[10px] text-emerald-500 flex items-center gap-0.5">
                  <ShieldCheck size={11} /> Seguro
                </span>
              </div>
            </div>

            {/* Action Buttons Zone */}
            <div className="space-y-2 pt-1">
              {installingId === selectedApp.id ? (
                /* Installing custom progress loading bar */
                <div className="w-full bg-slate-100 dark:bg-slate-900/60 rounded-[18px] border border-blue-500/10 p-3.5 text-center space-y-2">
                  <div className="flex justify-between items-center text-xs font-black font-mono px-1">
                    <span className="animate-pulse text-blue-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      Instalando aplicativo...
                    </span>
                    <span className="text-blue-500">{installProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-100" style={{ width: `${installProgress}%` }} />
                  </div>
                </div>
              ) : installedApps.includes(selectedApp.id) ? (
                /* Application installed: Open or Uninstall */
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => {
                      onOpenApp(selectedApp.id);
                      setSelectedApp(null);
                      playTone(659.25, 'sine', 0.05); // E5 note
                    }}
                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
                  >
                    <span>Iniciar Aplicativo</span>
                    <ArrowUpRight size={14} />
                  </button>
                  
                  {!selectedApp.isCore && (
                    <button 
                      onClick={() => handleUninstallRequest(selectedApp)}
                      className={`px-4 py-3.5 rounded-xl border-none cursor-pointer flex items-center justify-center transition-all ${
                        darkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                      }`}
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
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  <span>Obter Aplicativo Grátis ({selectedApp.size})</span>
                </button>
              )}
            </div>

            {/* Description section card */}
            <div className="space-y-2 text-left">
              <h3 className="font-extrabold text-[10px] uppercase tracking-widest opacity-45">Descrição Oficial</h3>
              <p className={`p-4 rounded-[20px] leading-relaxed text-xs border ${
                darkMode ? 'bg-slate-900/20 border-white/5 text-slate-300' : 'bg-white border-slate-200/50 text-slate-600 shadow-xs'
              }`}>
                {selectedApp.desc}
              </p>
            </div>

            {/* User review section card */}
            <div className="space-y-3.5 text-left pt-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-extrabold text-[10px] uppercase tracking-widest opacity-45">Avaliações & Opiniões</h3>
                <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer">Ver todas</span>
              </div>
              <div className="space-y-2">
                {REVIEWS.map((rev, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200/40 shadow-xs'
                  }`}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="font-bold text-xs">{rev.user}</span>
                      <span className="text-[9px] opacity-40">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={9} fill={i < rev.rating ? "currentColor" : "none"} className="border-none" />
                      ))}
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* MAIN STORE HOME SCREEN */
          <div className="p-4 space-y-5">
            
            {/* HERO PROMOTIONAL BANNER */}
            <div className="relative rounded-[28px] aspect-[16/9.5] overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 shadow-lg text-white p-5 flex flex-col justify-between group">
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              
              {/* Decorative graphic illustration */}
              <div className="absolute right-3.5 bottom-2 text-7xl opacity-20 transform group-hover:scale-110 transition-transform duration-300 select-none">
                🚀✨
              </div>

              {/* Tag / Badge */}
              <span className="self-start text-[8px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                ⭐ APP RECOMENDADO ⭐
              </span>

              {/* Title & info description */}
              <div className="space-y-1 relative z-10 text-left">
                <h2 className="font-black text-base leading-tight text-white tracking-tight">Flappy Bird Arcade</h2>
                <p className="text-[10px] text-white/80 line-clamp-1 leading-snug">O clássico arcade definitivo com animações fluidas!</p>
                
                {/* Visual button to action */}
                <button 
                  onClick={() => {
                    setSelectedApp(STORE_APPS[1]);
                    playTone(493.88, 'sine', 0.05); // B4 note
                  }}
                  className="mt-3 px-4 py-2 bg-white text-indigo-950 hover:bg-slate-50 font-extrabold text-[10px] rounded-xl border-none cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <span>Ver Detalhes</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>

            {/* CATEGORIES HORIZONTAL NAVIGATION PILLS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'productivity', label: '📝 Produtividade' },
                { id: 'games', label: '🎮 Jogos' },
                { id: 'utilities', label: '☀️ Clima' },
                { id: 'creativity', label: '🎨 Criatividade' },
                { id: 'system', label: '⚙️ Sistema' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    playTone(550, 'sine', 0.03);
                  }}
                  className={`px-3.5 py-2 rounded-full text-[10.5px] font-bold border shrink-0 cursor-pointer transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/10' 
                      : darkMode ? 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80' : 'bg-white border-slate-200/60 hover:bg-slate-100 shadow-xs'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SEARCH TEXT INPUT */}
            <div className="relative w-full pt-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-45" />
              <input 
                type="text" 
                placeholder="Buscar aplicativos ou categorias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9.5 pr-4 py-2.5 text-xs rounded-xl border outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-slate-900/60 border-white/5 text-white placeholder-white/35 focus:bg-slate-900' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* APPS GRID LISTING */}
            <div className="space-y-3.5 pt-1 text-left">
              <div className="flex items-center gap-1.5 px-1">
                <Award size={13} className="text-blue-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-45">
                  {activeTab === 'all' ? 'Aplicativos Disponíveis' : 'Resultados'}
                </h3>
              </div>

              {filteredApps.length === 0 ? (
                <div className="text-center py-16 text-xs opacity-40 border border-dashed border-slate-800/40 rounded-2xl">
                  Nenhum aplicativo encontrado
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredApps.map(app => (
                    <div 
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        playTone(523.25, 'sine', 0.05);
                      }}
                      className={`p-3.5 rounded-[22px] flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer border ${
                        darkMode ? 'bg-slate-900/40 hover:bg-slate-900 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-100 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl shrink-0 shadow-md ${app.iconBgClass}`}>
                          {app.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight truncate">{app.name}</h4>
                          <p className="text-[10px] opacity-50 truncate mt-0.5 line-clamp-1">{app.desc}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[8.5px] font-mono opacity-40">{app.size}</span>
                            <span className="text-[8.5px] opacity-45">•</span>
                            <span className="text-[8.5px] font-bold text-amber-500 flex items-center gap-0.5">
                              {app.rating} <Star size={9} fill="currentColor" className="border-none" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Download/Uninstall action indicator pill */}
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        {installingId === app.id ? (
                          /* Installing little loader icon */
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-blue-500/20">
                            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : installedApps.includes(app.id) ? (
                          <div className="flex gap-1.5 items-center">
                            <button 
                              onClick={() => {
                                onOpenApp(app.id);
                                playTone(659.25, 'sine', 0.05);
                              }}
                              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-extrabold text-[10px] rounded-lg border-none cursor-pointer transition-all active:scale-95"
                            >
                              Abrir
                            </button>
                            {!app.isCore && (
                              <button 
                                onClick={() => handleUninstallRequest(app)}
                                className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${
                                  darkMode ? 'bg-red-500/10 hover:bg-red-500/25 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                                }`}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleInstallClick(app.id)}
                            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer flex items-center justify-center transition-all active:scale-90 shadow-md shadow-blue-500/10"
                            title="Instalar"
                          >
                            <Download size={13} />
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

      {/* 3. CUSTOM UNINSTALL CONFIRMATION MODAL/SHEET (Instead of native alert/confirm popups) */}
      {uninstallConfirmApp && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className={`w-full max-w-sm rounded-t-3xl p-6 space-y-5 animate-[slide-up_0.25s_ease-out] shadow-2xl border-t ${
            darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl shadow-inner mb-1">
                🗑️
              </div>
              <h3 className="font-black text-sm">Desinstalar Aplicativo?</h3>
              <p className="text-xs opacity-60 px-3">
                Deseja remover <strong>{uninstallConfirmApp.name}</strong> e todos os seus dados locais do Mock OS?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setUninstallConfirmApp(null);
                  playTone(400, 'sine', 0.05);
                }}
                className={`flex-1 py-3 text-xs font-extrabold rounded-xl border cursor-pointer ${
                  darkMode ? 'bg-slate-900 border-white/10 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmUninstall}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl border-none cursor-pointer shadow-md shadow-red-600/10 active:scale-95 transition-all"
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
