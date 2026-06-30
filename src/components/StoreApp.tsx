import React, { useState } from 'react';
import { Search, Download, Trash2, Check, Star, ArrowLeft, ArrowUpRight } from 'lucide-react';

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
    iconBgClass: 'bg-yellow-500',
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
    iconBgClass: 'bg-blue-500',
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
    iconBgClass: 'bg-gradient-to-tr from-sky-400 to-amber-400',
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
    iconBgClass: 'bg-purple-500',
    size: '7 MB',
    version: 'v1.0.5',
    rating: 4.6,
    downloads: '420K',
    desc: 'Transforme sua tela em uma tela de pintura livre! Mude o tamanho e a cor do pincel, use borracha e salve o desenho direto no aparelho.',
  },
  
  // System core apps (for complete management)
  {
    id: 'calculadora',
    name: 'Calculadora OS',
    category: 'system',
    icon: '🧮',
    iconBgClass: 'bg-orange-500',
    size: '3 MB',
    version: 'v1.2.0',
    rating: 4.5,
    downloads: 'Built-in',
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
    downloads: 'Built-in',
    desc: 'Veja e defina papéis de parede elegantes e degradees no seu aparelho com uma confirmação interativa de visualização.',
    isCore: true,
  },
  {
    id: 'musica',
    name: 'Música Player',
    category: 'system',
    icon: '🎵',
    iconBgClass: 'bg-red-500',
    size: '36 MB',
    version: 'v1.0.8',
    rating: 4.9,
    downloads: 'Built-in',
    desc: 'Player de áudio completo com músicas integradas, controles de reprodução (tocar, pausar, passar), barra de progresso e volume.',
    isCore: true,
  },
  {
    id: 'navegador',
    name: 'Navegador Web',
    category: 'system',
    icon: '🌐',
    iconBgClass: 'bg-purple-600',
    size: '22 MB',
    version: 'v1.4.2',
    rating: 4.4,
    downloads: 'Built-in',
    desc: 'Navegue por portais famosos e sites simulados do sistema com barra de endereços inteligente, histórico de pesquisa e abas rápidas.',
    isCore: true,
  }
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
  
  // Local state to simulate loading/installation bar
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);

  // Beep tone feedback
  const playTone = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstallClick = (appId: string) => {
    if (installingId) return; // Prevent double trigger
    
    setInstallingId(appId);
    setInstallProgress(0);
    playTone(440, 'sine', 0.05);

    let currentVal = 0;
    // Animate progress bar over 1.2 seconds
    const interval = setInterval(() => {
      currentVal += 10;
      if (currentVal >= 100) {
        clearInterval(interval);
        setInstallProgress(100);
        onInstall(appId);
        setInstallingId(null);
        playTone(880, 'sine', 0.15); // success beep
      } else {
        setInstallProgress(currentVal);
      }
    }, 120);
  };

  const handleUninstallClick = (appId: string) => {
    playTone(300, 'triangle', 0.1);
    const confirmed = window.confirm(`Deseja desinstalar o aplicativo "${STORE_APPS.find(a => a.id === appId)?.name}"?`);
    if (confirmed) {
      onUninstall(appId);
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev } : null);
      }
      playTone(220, 'triangle', 0.15);
    }
  };

  const filteredApps = STORE_APPS.filter(app => {
    const matchesTab = activeTab === 'all' || app.category === activeTab;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.desc.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={`flex flex-col h-full select-none ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* App Store Header */}
      <div className={`p-4 border-b flex justify-between items-center shrink-0 ${
        darkMode ? 'border-white/5 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          {selectedApp ? (
            <button 
              onClick={() => {
                setSelectedApp(null);
                playTone(400, 'sine', 0.05);
              }}
              className="p-1.5 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-lg text-current border-none bg-transparent cursor-pointer mr-1"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <span className="text-xl">🛍️</span>
          )}
          <h1 className="text-sm font-extrabold tracking-tight">
            {selectedApp ? selectedApp.name : 'App Store'}
          </h1>
        </div>
        
        {!selectedApp && (
          <div className="relative flex-1 max-w-[130px] ml-4">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-7.5 pr-2 py-1.5 text-[11px] rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                darkMode ? 'bg-slate-800/60 text-white placeholder-white/30' : 'bg-slate-100 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
        )}
      </div>

      {/* Main Content Scroll container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* DETAILS SCREEN */}
        {selectedApp ? (
          <div className="p-5 space-y-5">
            {/* App Card Header inside details */}
            <div className="flex gap-4 items-center">
              <div className={`w-18 h-18 rounded-2.5xl flex items-center justify-center text-3xl shadow-lg shrink-0 ${selectedApp.iconBgClass}`}>
                {selectedApp.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-base leading-tight truncate">{selectedApp.name}</h2>
                <p className="text-xs opacity-50 capitalize mt-0.5">{selectedApp.category}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-blue-500/10 text-blue-500">
                    {selectedApp.version}
                  </span>
                  <span className="text-[10px] opacity-40 font-mono">{selectedApp.size}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className={`grid grid-cols-3 gap-2.5 p-3 rounded-2xl text-center text-xs border ${
              darkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200/50 shadow-xs'
            }`}>
              <div>
                <span className="opacity-40 text-[10px] block mb-0.5">Nota</span>
                <span className="font-bold flex items-center justify-center gap-0.5">
                  {selectedApp.rating} <Star size={11} fill="currentColor" className="text-amber-500 border-none" />
                </span>
              </div>
              <div className="border-x border-slate-200/40 dark:border-white/5">
                <span className="opacity-40 text-[10px] block mb-0.5">Donwloads</span>
                <span className="font-bold">{selectedApp.downloads}</span>
              </div>
              <div>
                <span className="opacity-40 text-[10px] block mb-0.5">Desenvolvedor</span>
                <span className="font-bold text-[10px] truncate block px-0.5">MockOS Inc.</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              {installingId === selectedApp.id ? (
                /* Progress bar installing */
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-xl p-3 text-center space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold font-mono px-1">
                    <span className="animate-pulse">Instalando...</span>
                    <span>{installProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-100" style={{ width: `${installProgress}%` }} />
                  </div>
                </div>
              ) : installedApps.includes(selectedApp.id) ? (
                /* Dynamic open/uninstall controls if installed */
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => {
                      onOpenApp(selectedApp.id);
                      setSelectedApp(null);
                      playTone(600, 'sine', 0.05);
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Abrir Aplicativo</span>
                    <ArrowUpRight size={14} />
                  </button>
                  
                  {/* We can uninstall but not core apps */}
                  {!selectedApp.isCore && (
                    <button 
                      onClick={() => handleUninstallClick(selectedApp.id)}
                      className={`px-4.5 py-3 rounded-xl border-none cursor-pointer flex items-center justify-center ${
                        darkMode ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                      title="Desinstalar"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ) : (
                /* Install App button if uninstalled */
                <button 
                  onClick={() => handleInstallClick(selectedApp.id)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Download size={14} />
                  <span>Baixar e Instalar ({selectedApp.size})</span>
                </button>
              )}
            </div>

            {/* Description card */}
            <div className="space-y-2 text-xs">
              <h3 className="font-extrabold text-xs uppercase tracking-wider opacity-55">Descrição</h3>
              <p className={`p-4 rounded-2xl leading-relaxed text-[11.5px] border ${
                darkMode ? 'bg-slate-900/30 border-white/5 text-slate-300' : 'bg-white border-slate-200/50 text-slate-600'
              }`}>
                {selectedApp.desc}
              </p>
            </div>
          </div>
        ) : (
          /* MAIN STORE HOME SCREEN */
          <div className="p-4 space-y-4">
            
            {/* HERO PROMOTIONAL CAROUSEL BANNER */}
            <div className="relative rounded-2.5xl aspect-[16/9] overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-lg text-white p-5 flex flex-col justify-between">
              {/* Badge */}
              <span className="self-start text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-black/30 backdrop-blur-md rounded-full">
                Destaque da semana
              </span>
              
              {/* Graphic element */}
              <div className="absolute right-3 bottom-2 text-6xl opacity-20 transform rotate-12 scale-110 select-none">
                🎮🚀
              </div>

              {/* Title & info */}
              <div className="space-y-1 relative z-10 text-left">
                <h2 className="font-black text-sm leading-tight text-white">Flappy Bird Arcade</h2>
                <p className="text-[10px] text-white/80 line-clamp-1 leading-snug">O clássico viciante com canos gerados e recordes locais!</p>
                
                {/* Button */}
                <button 
                  onClick={() => setSelectedApp(STORE_APPS[1])}
                  className="mt-2.5 px-3.5 py-1.5 bg-white text-indigo-950 hover:bg-slate-50 font-bold text-[10px] rounded-lg border-none cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span>Ver Detalhes</span>
                  <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* CATEGORIES BUTTONS LIST */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'productivity', label: '📝 Produtividade' },
                { id: 'games', label: '🎮 Jogos' },
                { id: 'utilities', label: '☀️ Clima' },
                { id: 'creativity', label: '🎨 Artes' },
                { id: 'system', label: '⚙️ Sistema' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    playTone(550, 'sine', 0.03);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold border shrink-0 cursor-pointer transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : darkMode ? 'bg-slate-900 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* APPS LISTING */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1 text-left">
                {activeTab === 'all' ? 'Aplicativos Disponíveis' : 'Resultados'}
              </h3>

              {filteredApps.length === 0 ? (
                <div className="text-center py-12 text-xs opacity-50">
                  Nenhum aplicativo encontrado
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredApps.map(app => (
                    <div 
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        playTone(450, 'sine', 0.05);
                      }}
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer border ${
                        darkMode ? 'bg-slate-900/50 hover:bg-slate-900 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm ${app.iconBgClass}`}>
                          {app.icon}
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight truncate">{app.name}</h4>
                          <p className="text-[10px] opacity-50 truncate mt-0.5 line-clamp-1">{app.desc}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[8.5px] font-mono opacity-40">{app.size}</span>
                            <span className="text-[8.5px] opacity-40">•</span>
                            <span className="text-[8.5px] font-bold text-amber-500 flex items-center gap-0.5">
                              {app.rating} <Star size={9} fill="currentColor" className="border-none" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Download/Uninstall Indicator Pill */}
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0 pl-1">
                        {installingId === app.id ? (
                          /* Little spinner */
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-blue-500/30">
                            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : installedApps.includes(app.id) ? (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => {
                                onOpenApp(app.id);
                                playTone(600, 'sine', 0.05);
                              }}
                              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-extrabold text-[10px] rounded-lg border-none cursor-pointer transition-colors"
                            >
                              Abrir
                            </button>
                            {!app.isCore && (
                              <button 
                                onClick={() => handleUninstallClick(app.id)}
                                className={`p-1.5 rounded-lg border-none cursor-pointer transition-colors ${
                                  darkMode ? 'bg-red-900/10 hover:bg-red-900/30 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                                }`}
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleInstallClick(app.id)}
                            className="p-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white border-none cursor-pointer transition-transform active:scale-90"
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

    </div>
  );
}
