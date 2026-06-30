import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Wifi, WifiOff, Bluetooth, Signal, Plane, Moon, Sun, 
  Volume2, VolumeX, Sliders, Search, User, Folder, FileText, 
  Image as ImageIcon, Music as MusicIcon, Globe, Settings, 
  ChevronRight, ChevronLeft, X, Play, Pause, SkipForward, SkipBack, 
  Send, Trash2, Clock, Smartphone, Bell, MessageSquare, Plus, Minus,
  Grid, Compass, FolderClosed, PlayCircle, Eye, EyeOff
} from 'lucide-react';

import { Wallpaper, NotificationItem, Track, Chat, Folder as FolderType } from './types';
import { wallpapersList, initialNotifications, tracksList, initialChats, initialFolders } from './data';

// Component imports
import BatteryDots from './components/BatteryDots';
import Calculator from './components/Calculator';
import SettingsApp from './components/SettingsApp';
import MessagesApp from './components/MessagesApp';
import MusicPlayer from './components/MusicPlayer';
import Browser from './components/Browser';
import FilesApp from './components/FilesApp';
import StoreApp from './components/StoreApp';
import NotesApp from './components/NotesApp';
import FlappyApp from './components/FlappyApp';
import WeatherApp from './components/WeatherApp';
import PaintApp from './components/PaintApp';

const appMetadata: Record<string, { label: string; icon: string; iconBgClass: string }> = {
  arquivos: { label: 'Arquivos', icon: '📁', iconBgClass: 'bg-blue-600' },
  calculadora: { label: 'Calculadora', icon: '🧮', iconBgClass: 'bg-orange-500' },
  configuracoes: { label: 'Configurações', icon: '⚙️', iconBgClass: 'bg-slate-500' },
  galeria: { label: 'Galeria', icon: '🖼️', iconBgClass: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500' },
  mensagens: { label: 'Mensagens', icon: '💬', iconBgClass: 'bg-green-500' },
  musica: { label: 'Música', icon: '🎵', iconBgClass: 'bg-red-500' },
  navegador: { label: 'Navegador', icon: '🌐', iconBgClass: 'bg-purple-600' },
  loja: { label: 'App Store', icon: '🛍️', iconBgClass: 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500' },
  notas: { label: 'Bloco de Notas', icon: '📝', iconBgClass: 'bg-yellow-500' },
  flappy: { label: 'Flappy Bird', icon: '🐦', iconBgClass: 'bg-blue-500' },
  clima: { label: 'Previsão do Tempo', icon: '☀️', iconBgClass: 'bg-gradient-to-tr from-sky-400 to-amber-400' },
  paint: { label: 'Mini Paint', icon: '🎨', iconBgClass: 'bg-purple-500' }
};

export default function App() {
  // 1. Core System Settings & States
  const [userName, setUserName] = useState('Mateus Oliveira');
  const [wifiActive, setWifiActive] = useState(true);
  const [bluetoothActive, setBluetoothActive] = useState(true);
  const [cellularActive, setCellularActive] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  
  // Theme & screen settings
  const [darkMode, setDarkMode] = useState(true);
  const [nightMode, setNightMode] = useState(false); // Eyes shield (warm overlay)
  const [brightness, setBrightness] = useState(100); // 20 - 100 range
  const [volume, setVolume] = useState(70); // 0 - 100 range
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);

  // Battery Simulator state managers
  const [useManualBattery, setUseManualBattery] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // Music Player globally shared state
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Wallpaper manager
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const currentWallpaper = wallpapersList[wallpaperIndex] || wallpapersList[0];

  // Shell Navigation & Dropdowns
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Time-clock updates
  const [systemTime, setSystemTime] = useState('00:00');
  const [systemDate, setSystemDate] = useState('Segunda, 15 de Outubro');

  // Interactive dynamic app data
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [folders, setFolders] = useState<FolderType[]>(initialFolders);

  // Installed Apps State
  const [installedApps, setInstalledApps] = useState<string[]>([
    'arquivos', 'calculadora', 'configuracoes', 'galeria', 'mensagens', 'musica', 'navegador', 'loja'
  ]);

  const handleInstallApp = (appId: string) => {
    if (!installedApps.includes(appId)) {
      setInstalledApps(prev => [...prev, appId]);
    }
  };

  const handleUninstallApp = (appId: string) => {
    if (appId === 'configuracoes' || appId === 'loja') return;
    setInstalledApps(prev => prev.filter(id => id !== appId));
    if (activeApp === appId) {
      setActiveApp(null);
    }
    setOpenedApps(prev => prev.filter(id => id !== appId));
  };

  // Standalone gallery lightbox state
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<number | null>(null);

  // Swipe gesture detection
  const [touchStartX, setTouchStartX] = useState(0);
  const [swipeBackStartX, setSwipeBackStartX] = useState<number | null>(null);
  const [swipeBackCurrentX, setSwipeBackCurrentX] = useState<number>(0);
  const [isSwipingBack, setIsSwipingBack] = useState<boolean>(false);

  // Multitasking & Recent Apps states
  const [openedApps, setOpenedApps] = useState<string[]>([]);
  const [recentAppsOpen, setRecentAppsOpen] = useState(false);
  const [swipeUpStartY, setSwipeUpStartY] = useState<number | null>(null);
  const [swipeUpCurrentY, setSwipeUpCurrentY] = useState<number | null>(null);
  const swipeUpTimerRef = useRef<any>(null);
  const touchStartYRef = useRef<number>(0);
  const touchCurrentYRef = useRef<number>(0);
  const isHoldingBottomSwipeRef = useRef<boolean>(false);

  // 2. Volume Change HUD display trigger
  useEffect(() => {
    setShowVolumeHUD(true);
    const timer = setTimeout(() => setShowVolumeHUD(false), 1500);
    return () => clearTimeout(timer);
  }, [volume]);

  // 3. Time Tick Clock trigger
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setSystemTime(`${hrs}:${mins}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      let dateStr = now.toLocaleDateString('pt-BR', options);
      setSystemDate(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Solução robusta para corrigir o bug de deslocamento da tela (teclado mobile no iframe)
  useEffect(() => {
    const handleFocusOut = () => {
      // Pequeno delay para garantir que o teclado recolheu e o estado de foco foi atualizado
      setTimeout(() => {
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.hasAttribute('contenteditable')
        );
        
        if (!isInputActive) {
          // Garante que o container volte ao topo absoluto do viewport
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }
      }, 150);
    };

    const handleScroll = () => {
      // Se não houver nenhum input em foco e o scroll não for zero, força a redefinição ao topo
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.hasAttribute('contenteditable')
      );

      if (!isInputActive && (window.scrollY !== 0 || window.scrollX !== 0)) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    };

    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('blur', handleFocusOut);
    window.addEventListener('scroll', handleScroll);

    // Também monitora redimensionamentos do visualViewport se disponível
    const visualViewport = (window as any).visualViewport;
    const handleViewportChange = () => {
      if (!document.activeElement || 
          (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    };

    if (visualViewport) {
      visualViewport.addEventListener('resize', handleViewportChange);
      visualViewport.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('blur', handleFocusOut);
      window.removeEventListener('scroll', handleScroll);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleViewportChange);
        visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  // 4. Real battery connector fallback
  useEffect(() => {
    if (!useManualBattery && typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        const onLevelChange = () => setBatteryLevel(Math.round(battery.level * 100));
        const onChargingChange = () => setIsCharging(battery.charging);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);

        return () => {
          battery.removeEventListener('levelchange', onLevelChange);
          battery.removeEventListener('chargingchange', onChargingChange);
        };
      });
    }
  }, [useManualBattery]);

  // 5. Helper callbacks for cross-app communication
  const handleSetWallpaperFromFile = (idx: number) => {
    setWallpaperIndex(idx);
    setNotifications(prev => [
      {
        id: `sys-${Date.now()}`,
        title: "Papel de Parede",
        body: `Papel de parede alterado para "${wallpapersList[idx].name}"!`,
        time: "Agora",
        app: "galeria"
      },
      ...prev
    ]);
  };

  const handlePlayTrackFromFile = (trackTitle: string) => {
    const trackIdx = tracksList.findIndex(t => t.title === trackTitle);
    if (trackIdx !== -1) {
      setCurrentTrackIndex(trackIdx);
      setMusicPlaying(true);
      setActiveApp('musica'); // Open music app
      setNotifications(prev => [
        {
          id: `sys-${Date.now()}`,
          title: "Player de Música",
          body: `Tocando "${trackTitle}" de Arquivos`,
          time: "Agora",
          app: "musica"
        },
        ...prev
      ]);
    }
  };

  // Clear single notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Open an app safely
  const openApp = (appName: string) => {
    setActiveApp(appName);
    setAppDrawerOpen(false);
    setNotificationsOpen(false);
    setUtilitiesOpen(false);
    setRecentAppsOpen(false);
    if (!openedApps.includes(appName)) {
      setOpenedApps(prev => [...prev, appName]);
    }
  };

  // Close active app
  const closeApp = () => {
    setActiveApp(null);
  };

  // Gesto de deslizar (Swipe) para abrir a gaveta pela esquerda, voltar pela direita ou multitarefa de baixo
  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    setTouchStartX(x);
    touchStartYRef.current = y;
    touchCurrentYRef.current = y;
    isHoldingBottomSwipeRef.current = false;

    // Se o toque iniciar próximo à borda inferior da tela
    if (y > window.innerHeight - 80) {
      setSwipeUpStartY(y);
      setSwipeUpCurrentY(y);
      
      if (swipeUpTimerRef.current) clearTimeout(swipeUpTimerRef.current);
      swipeUpTimerRef.current = setTimeout(() => {
        const diffY = touchStartYRef.current - touchCurrentYRef.current;
        // Se deslizou mais de 100px para cima e segurou por 350ms, abre a tela de apps recentes (multitarefa)
        if (diffY > 100) {
          setRecentAppsOpen(true);
          setAppDrawerOpen(false);
          setNotificationsOpen(false);
          setUtilitiesOpen(false);
          isHoldingBottomSwipeRef.current = true;
          if (navigator.vibrate) {
            navigator.vibrate(15);
          }
        }
      }, 350);
    } else if (x > window.innerWidth - 45 && activeApp !== null) {
      // Começou na borda direita (gesto de voltar do Android/iOS)
      setSwipeBackStartX(x);
      setSwipeBackCurrentX(x);
      setIsSwipingBack(true);
    } else {
      setSwipeBackStartX(null);
      setIsSwipingBack(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    touchCurrentYRef.current = y;

    if (swipeUpStartY !== null) {
      setSwipeUpCurrentY(y);
    }
    if (isSwipingBack && swipeBackStartX !== null) {
      setSwipeBackCurrentX(x);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeUpTimerRef.current) {
      clearTimeout(swipeUpTimerRef.current);
      swipeUpTimerRef.current = null;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    if (swipeUpStartY !== null) {
      const diffY = swipeUpStartY - touchEndY;
      setSwipeUpStartY(null);
      setSwipeUpCurrentY(null);

      // Se o usuário deslizou rapidamente para cima (> 140px) sem acionar o 'hold', volta para a Home
      if (!isHoldingBottomSwipeRef.current && diffY > 140) {
        setActiveApp(null);
        setRecentAppsOpen(false);
      }
      return;
    }

    if (isSwipingBack && swipeBackStartX !== null) {
      const dragDistance = swipeBackStartX - touchEndX;
      setIsSwipingBack(false);
      setSwipeBackStartX(null);
      
      // Puxando da direita para a esquerda: volta a página ou fecha o app
      if (dragDistance > 65) {
        if (activeApp === 'galeria' && selectedGalleryImg !== null) {
          setSelectedGalleryImg(null);
        } else {
          const event = new Event('mockos-back', { cancelable: true });
          const wasCancelled = !window.dispatchEvent(event);
          if (!wasCancelled) {
            closeApp();
          }
        }
      }
      return;
    }

    // Se o toque começar bem perto da borda esquerda (< 70px) e deslizar para a direita (> 60px de diferença)
    if (touchStartX < 70 && (touchEndX - touchStartX) > 60) {
      setAppDrawerOpen(true);
      setNotificationsOpen(false);
      setUtilitiesOpen(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden select-none bg-black">
      <div 
        id="screen-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ filter: `brightness(${brightness}%)` }}
      >
        
        {/* ==========================================
           1. CORE SCREEN OVERLAYS (Comfort Warmth)
           ========================================== */}
        {/* Night comfort amber tint filter screen */}
        <div 
          className="night-shield-overlay" 
          style={{ opacity: nightMode ? 1 : 0 }} 
        />

        {/* Floating volume bar HUD capsule */}
        {showVolumeHUD && (
          <div className="absolute top-16 left-4 z-50 animate-fade-in bg-slate-900/95 text-white rounded-2xl p-2.5 flex items-center gap-2 border border-white/10 shadow-lg text-xs">
            <Volume2 size={12} className={volume === 0 ? "text-slate-500" : "text-blue-400"} />
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${volume}%` }} />
            </div>
            <span className="font-mono font-bold text-[10px]">{volume}%</span>
          </div>
        )}

        {/* ==========================================
           2. SYSTEM WALLPAPER BACKGROUND (Metal Shift Animado)
           ========================================== */}
        <div 
          id="wallpaper"
          className="metal-shift-anim"
          style={{ background: currentWallpaper.gradient }}
        />

        {/* Background visual blur overlay when utilities, notifications or app drawer is open */}
        {(notificationsOpen || utilitiesOpen || appDrawerOpen) && (
          <button 
            id="overlay-blur"
            onClick={() => {
              setNotificationsOpen(false);
              setUtilitiesOpen(false);
              setAppDrawerOpen(false);
            }}
            className="w-full h-full text-left border-none focus:outline-none cursor-pointer"
          />
        )}

        {/* ==========================================
           3. SYSTEM STATUS BAR (Clock & Pill - mix-blend-mode: difference)
           ========================================== */}
        <header id="status-bar">
          <div 
            className="status-zone left cursor-pointer" 
            id="trigger-notifications"
            onClick={(e) => {
              e.stopPropagation();
              setNotificationsOpen(!notificationsOpen);
              setUtilitiesOpen(false);
              setAppDrawerOpen(false);
            }}
          >
            <span id="status-time">{systemTime}</span>
          </div>
          
          <div 
            className="status-zone right cursor-pointer" 
            id="trigger-utilities"
            onClick={(e) => {
              e.stopPropagation();
              setUtilitiesOpen(!utilitiesOpen);
              setNotificationsOpen(false);
              setAppDrawerOpen(false);
            }}
          >
            <div className="status-pill">
              <svg className="pill-svg" viewBox="0 0 24 24" id="wifi-icon" style={{ width: '17px', height: '13px', fill: 'none', stroke: '#ffffff', strokeWidth: 2.5, strokeLinecap: 'round' }}>
                <circle cx="12" cy="19.5" r="1.2" fill="#ffffff" stroke="none" />
                <path d="M8.5 15.5a5 3.2 0 0 1 7 0" />
                <path d="M5 11.5a10 6 0 0 1 14 0" />
                <path d="M1.5 7.5a15 8.5 0 0 1 21 0" />
              </svg>
              <div className="cellular-bars">
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
              </div>
              <BatteryDots level={batteryLevel} isCharging={isCharging} />
            </div>
          </div>
        </header>

        {/* ==========================================
           4. DROPDOWN CONTROL PANELS (Animações Nativas do OS)
           ========================================== */}
        
        {/* PANEL 4A: NOTIFICATIONS LIST DRAWER */}
        <div 
          id="panel-notifications"
          className={notificationsOpen ? '' : 'closed'}
        >
          <div className="panel-top-cap" />
          <div className="panel-center-content">
            <div className="panel-header flex justify-between items-center w-full">
              <span>Notificações</span>
              {notifications.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setNotifications([]); }}
                  className="text-[10px] text-blue-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Limpar Tudo
                </button>
              )}
            </div>

            <div className="panel-content w-full space-y-2 overflow-y-auto no-scrollbar max-h-72">
              {notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-white/40">Nenhuma notificação recente</p>
              ) : (
                notifications.map(item => (
                  <div 
                    key={item.id} 
                    className="notification-item relative"
                  >
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <span className="text-[9px] text-white/30 font-mono mt-1.5 block">{item.time}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }}
                      className="absolute top-3 right-3 text-white/40 hover:text-white bg-transparent border-none cursor-pointer"
                      title="Remover"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="panel-bottom-cap" />
        </div>

        {/* PANEL 4B: UTILITY ATALHOS PANEL */}
        <div 
          id="panel-utilities"
          className={utilitiesOpen ? '' : 'closed'}
        >
          <div className="panel-top-cap" />
          <div className="panel-center-content">
            
            {/* 1. Fileira de 4 botões redondos */}
            <div className="panel-row-round-buttons">
              <button 
                onClick={() => !airplaneMode && setWifiActive(!wifiActive)}
                disabled={airplaneMode}
                className={`round-btn ${wifiActive ? 'active' : ''}`}
                title="Wi-Fi"
              >
                <Wifi size={20} />
              </button>
              <button 
                onClick={() => !airplaneMode && setBluetoothActive(!bluetoothActive)}
                disabled={airplaneMode}
                className={`round-btn ${bluetoothActive ? 'active' : ''}`}
                title="Bluetooth"
              >
                <Bluetooth size={20} />
              </button>
              <button 
                onClick={() => !airplaneMode && setCellularActive(!cellularActive)}
                disabled={airplaneMode}
                className={`round-btn ${cellularActive ? 'active' : ''}`}
                title="Dados Móveis"
              >
                <Signal size={20} />
              </button>
              <button 
                onClick={() => {
                  const val = !airplaneMode;
                  setAirplaneMode(val);
                  if (val) {
                    setWifiActive(false);
                    setBluetoothActive(false);
                    setCellularActive(false);
                  }
                }}
                className={`round-btn ${airplaneMode ? 'active bg-amber-500 text-white' : ''}`}
                title="Modo Avião"
              >
                <Plane size={20} className="rotate-45" />
              </button>
            </div>

            {/* 2. Duas barras deslizantes largas e arredondadas */}
            <div className="panel-sliders-container">
              <div className="panel-slider-row">
                <span className="slider-glyph">⛭</span>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={brightness} 
                  onChange={e => setBrightness(parseInt(e.target.value))}
                />
              </div>
              <div className="panel-slider-row">
                <span className="slider-glyph">🔊</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={e => setVolume(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* 3. Grid de baixo (Toggles na esquerda, Mídia na direita) */}
            <div className="panel-bottom-grid">
              <div className="panel-vertical-toggles">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`toggle-btn ${darkMode ? 'active' : ''}`}
                >
                  <Moon size={16} />
                  <span>Modo Escuro</span>
                </button>
                <button 
                  onClick={() => setNightMode(!nightMode)}
                  className={`toggle-btn ${nightMode ? 'active' : ''}`}
                >
                  <Sun size={16} />
                  <span>Modo Noturno</span>
                </button>
              </div>
              
              <div className="panel-media-player">
                <span className="media-icon">🎵</span>
                <div className="flex-1 min-w-0 flex flex-col justify-center px-1">
                  <p className="text-[10px] font-bold truncate text-white/95 leading-tight">
                    {tracksList[currentTrackIndex].title}
                  </p>
                  <p className="text-[8px] text-white/60 truncate leading-none mt-0.5">
                    {tracksList[currentTrackIndex].artist}
                  </p>
                </div>
                <div className="media-controls">
                  <span onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex(currentTrackIndex === 0 ? tracksList.length - 1 : currentTrackIndex - 1); }} title="Anterior">⏮</span>
                  <span onClick={(e) => { e.stopPropagation(); setMusicPlaying(!musicPlaying); }} title={musicPlaying ? "Pausar" : "Tocar"}>
                    {musicPlaying ? '⏸' : '▶'}
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex((currentTrackIndex + 1) % tracksList.length); }} title="Próxima">⏭</span>
                </div>
              </div>
            </div>

          </div>
          <div className="panel-bottom-cap" />
        </div>

        {/* ==========================================
           5. SYSTEM HOME SCREEN
           ========================================== */}
        <main id="home-screen">
          <div 
            id="swipe-trigger"
            onClick={() => setAppDrawerOpen(true)}
            title="Toque ou deslize da esquerda para abrir a Grade de Apps"
          />
        </main>

        {/* ==========================================
           6. SLIDE-OUT APP DRAWER (Visual e Animação Lateral do Usuário)
           ========================================== */}
        <aside 
          id="app-drawer"
          className={appDrawerOpen ? '' : 'closed'}
        >
          {/* Drawer Header */}
          <div className="drawer-header">
            <div className="drawer-header-left">
              <span className="grid-icon">⣿</span>
              <span className="drawer-title">Grade de aplicativos</span>
            </div>
            <span className="drawer-time">{systemTime}</span>
          </div>

          {/* Apps List */}
          <div className="drawer-list no-scrollbar">
            {installedApps.map((appName) => {
              const meta = appMetadata[appName];
              if (!meta) return null;
              return (
                <button 
                  key={appName} 
                  className="drawer-item flex flex-col items-center justify-center p-2.5 transition-transform active:scale-95 cursor-pointer" 
                  onClick={() => openApp(appName)}
                >
                  <div className={`app-icon flex items-center justify-center text-xl shadow-sm ${meta.iconBgClass} rounded-2xl w-12 h-12`}>
                    {meta.icon}
                  </div>
                  <span className="app-label text-[10px] mt-1.5 font-bold text-center truncate w-full">{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="drawer-footer">
            <span>{systemDate}</span>
          </div>
        </aside>

        {/* ==========================================
           7. ACTIVE RUNNING APPLICATIONS (Janela de Cartão Deslizante)
           ========================================== */}
        
        {/* APP A: CONFIGURAÇÕES */}
        <div className={`app-window ${activeApp === 'configuracoes' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <SettingsApp
              userName={userName}
              setUserName={setUserName}
              wifi={wifiActive}
              setWifi={setWifiActive}
              bluetooth={bluetoothActive}
              setBluetooth={setBluetoothActive}
              cellular={cellularActive}
              setCellular={setCellularActive}
              airplaneMode={airplaneMode}
              setAirplaneMode={setAirplaneMode}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              nightMode={nightMode}
              setNightMode={setNightMode}
              brightness={brightness}
              setBrightness={setBrightness}
              volume={volume}
              setVolume={setVolume}
              useManualBattery={useManualBattery}
              setUseManualBattery={setUseManualBattery}
              simulatedLevel={batteryLevel}
              setSimulatedLevel={setBatteryLevel}
              simulatedCharging={isCharging}
              setSimulatedCharging={setIsCharging}
              wallpapers={wallpapersList}
              currentWallpaperIndex={wallpaperIndex}
              setWallpaperIndex={setWallpaperIndex}
              isActive={activeApp === 'configuracoes'}
              installedApps={installedApps}
              onUninstall={handleUninstallApp}
            />
          </div>
        </div>

        {/* APP B: CALCULADORA */}
        <div className={`app-window ${activeApp === 'calculadora' ? '' : 'closed'} dark bg-slate-950 text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <Calculator />
          </div>
        </div>

        {/* APP C: GALERIA */}
        <div className={`app-window ${activeApp === 'galeria' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar pt-4 pb-24 px-5 space-y-4 overflow-y-auto">
            <div className="space-y-1">
              <h3 className="font-bold text-base">Minha Galeria</h3>
              <p className="text-xs opacity-65">Escolha um gradiente para ser seu papel de parede do sistema.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {wallpapersList.map((wp, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGalleryImg(idx)}
                  className="aspect-[9/16] rounded-2xl overflow-hidden relative shadow-md hover:scale-[0.98] transition-transform cursor-pointer border border-white/5 text-left w-full"
                  style={{ background: wp.gradient }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 text-white">
                    <p className="font-bold text-xs leading-tight">{wp.name}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* LIGHTBOX CONFIRMAÇÃO DE PAPEL DE PAREDE */}
            {selectedGalleryImg !== null && (
              <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center p-6 z-50 text-white space-y-6">
                <div className="w-44 aspect-[9/16] rounded-2xl border-4 border-white/10 shadow-2xl relative overflow-hidden" style={{ background: wallpapersList[selectedGalleryImg].gradient }}>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 px-3 py-1 rounded-full text-[9px] text-center">
                    Visualização
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm">Definir "{wallpapersList[selectedGalleryImg].name}"?</h4>
                  <p className="text-xs opacity-60">Isso atualizará a tela de fundo do sistema operacional.</p>
                </div>

                <div className="flex gap-3 text-xs w-full max-w-xs">
                  <button 
                    onClick={() => setSelectedGalleryImg(null)}
                    className="flex-1 py-2.5 bg-slate-800 font-bold rounded-xl hover:bg-slate-700 border-none cursor-pointer text-white text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      handleSetWallpaperFromFile(selectedGalleryImg);
                      setSelectedGalleryImg(null);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 font-bold rounded-xl hover:bg-blue-700 border-none cursor-pointer text-white text-center"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* APP D: MENSAGENS */}
        <div className={`app-window ${activeApp === 'mensagens' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <MessagesApp
              chats={chats}
              setChats={setChats}
              darkMode={darkMode}
              isActive={activeApp === 'mensagens'}
            />
          </div>
        </div>

        {/* APP E: MÚSICA */}
        <div className={`app-window ${activeApp === 'musica' ? '' : 'closed'} dark bg-slate-950 text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <MusicPlayer
              tracks={tracksList}
              isPlaying={musicPlaying}
              setIsPlaying={setMusicPlaying}
              currentTrackIndex={currentTrackIndex}
              setCurrentTrackIndex={setCurrentTrackIndex}
              volume={volume}
              setVolume={setVolume}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* APP F: NAVEGADOR */}
        <div className={`app-window ${activeApp === 'navegador' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <Browser darkMode={darkMode} isActive={activeApp === 'navegador'} />
          </div>
        </div>

        {/* APP G: ARQUIVOS */}
        <div className={`app-window ${activeApp === 'arquivos' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <FilesApp
              folders={folders}
              setFolders={setFolders}
              darkMode={darkMode}
              onSetWallpaper={handleSetWallpaperFromFile}
              onPlayTrack={handlePlayTrackFromFile}
              isActive={activeApp === 'arquivos'}
            />
          </div>
        </div>

        {/* APP H: LOJA DE APLICATIVOS */}
        <div className={`app-window ${activeApp === 'loja' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <StoreApp
              darkMode={darkMode}
              installedApps={installedApps}
              onInstall={handleInstallApp}
              onUninstall={handleUninstallApp}
              onOpenApp={openApp}
            />
          </div>
        </div>

        {/* APP I: BLOCO DE NOTAS */}
        <div className={`app-window ${activeApp === 'notas' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <NotesApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP J: FLAPPY BIRD */}
        <div className={`app-window ${activeApp === 'flappy' ? '' : 'closed'} dark bg-slate-950 text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <FlappyApp darkMode={darkMode} isActive={activeApp === 'flappy'} />
          </div>
        </div>

        {/* APP K: PREVISÃO DO TEMPO */}
        <div className={`app-window ${activeApp === 'clima' ? '' : 'closed'} ${darkMode ? 'dark text-white' : 'text-white'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <WeatherApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP L: MINI PAINT */}
        <div className={`app-window ${activeApp === 'paint' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <PaintApp darkMode={darkMode} />
          </div>
        </div>

        {/* ==========================================
           8. BOTTOM DOCK (Visual e Formato Original do Usuário)
           ========================================== */}
        <footer id="bottom-dock">
          
          <button 
            onClick={() => openApp('mensagens')}
            className="dock-icon flex items-center justify-center bg-green-500 text-white rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Mensagens"
          >
            💬
          </button>

          <button 
            onClick={() => openApp('loja')}
            className="dock-icon flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="App Store"
          >
            🛍️
          </button>

          <button 
            onClick={() => openApp('arquivos')}
            className="dock-icon flex items-center justify-center bg-blue-500 text-white rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Arquivos"
          >
            🖋️
          </button>

        </footer>

        {/* Animated gesture back indicator on the right edge */}
        {isSwipingBack && swipeBackStartX !== null && (
          <div 
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] pointer-events-none flex items-center justify-end pr-2 transition-opacity duration-150"
            style={{
              width: `${Math.max(40, Math.min(120, swipeBackStartX - swipeBackCurrentX))}px`,
              opacity: Math.min(1, (swipeBackStartX - swipeBackCurrentX) / 50)
            }}
          >
            <div className="w-12 h-24 bg-black/50 backdrop-blur-md border border-white/10 rounded-l-full flex items-center justify-center text-white shadow-2xl">
              <ChevronLeft 
                size={24} 
                className="text-white/90 animate-pulse"
                style={{
                  transform: `translateX(${Math.max(-16, -((swipeBackStartX - swipeBackCurrentX) / 4))}px)`
                }}
              />
            </div>
          </div>
        )}

        {/* ==========================================
           MULTITASKING / RECENT APPS VIEW (Modo Multitarefa)
           ========================================== */}
        {recentAppsOpen && (
          <div 
            onClick={() => setRecentAppsOpen(false)}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-2xl z-40 flex flex-col justify-between p-6 text-white select-none transition-all duration-300"
          >
            
            {/* Top header */}
            <div className="pt-10 flex justify-between items-center px-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                <span className="font-bold text-xs tracking-wider uppercase text-slate-400">Segundo Plano</span>
              </div>
            </div>

            {/* Middle Carousel of cards */}
            <div 
              className="flex-1 flex items-center justify-start overflow-x-auto gap-5 py-8 no-scrollbar px-6 w-full snap-x snap-mandatory"
              onClick={(e) => e.stopPropagation()}
            >
              {openedApps.length === 0 ? (
                <div className="text-center space-y-2 w-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg opacity-50">
                    📭
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Nenhum aplicativo recente aberto</p>
                </div>
              ) : (
                openedApps.map((appName) => {
                  const meta = appMetadata[appName] || { label: appName, icon: '📱', iconBgClass: 'bg-slate-700' };
                  const isActive = activeApp === appName;
                  
                  return (
                    <motion.div 
                      key={appName}
                      drag="y"
                      dragConstraints={{ top: -300, bottom: 0 }}
                      dragElastic={{ top: 0.8, bottom: 0.1 }}
                      onDragEnd={(event, info) => {
                        // Se deslizou mais de 120px para cima, fecha o app
                        if (info.offset.y < -120) {
                          setOpenedApps(prev => prev.filter(name => name !== appName));
                          if (activeApp === appName) {
                            setActiveApp(null);
                          }
                        }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-48 h-72 flex-shrink-0 bg-slate-900 border border-white/15 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl transition-all cursor-pointer group snap-center select-none touch-none"
                      onClick={() => {
                        openApp(appName);
                        setRecentAppsOpen(false);
                      }}
                    >
                      {/* Top App Header inside card */}
                      <div className="p-3 bg-black/40 border-b border-white/5 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${meta.iconBgClass} flex items-center justify-center text-xs shadow`}>
                          {meta.icon}
                        </div>
                        <span className="font-bold text-[11px] truncate text-white">{meta.label}</span>
                      </div>

                      {/* Mock Preview Content */}
                      <div className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col justify-center items-center p-4 text-center space-y-3">
                        <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                          {meta.icon}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-xs text-slate-300">{meta.label}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400 font-mono">
                            {isActive ? 'Ativo' : 'Em segundo plano'}
                          </span>
                        </div>
                      </div>

                      {/* Small visual swipe-up hint bar at bottom of card */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors" />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions - Center round 'X' button to clear everything */}
            <div 
              className="pb-8 flex flex-col items-center gap-2 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {openedApps.length > 0 ? (
                <>
                  <button 
                    onClick={() => {
                      setOpenedApps([]);
                      setActiveApp(null);
                      setRecentAppsOpen(false);
                    }}
                    className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer border-none"
                    title="Fechar todos os apps"
                  >
                    <X size={24} strokeWidth={2.5} />
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fechar Tudo</span>
                </>
              ) : (
                <button 
                  onClick={() => setRecentAppsOpen(false)}
                  className="text-xs text-slate-400 hover:text-white transition-colors tracking-wide underline decoration-white/10 bg-transparent border-none cursor-pointer"
                >
                  Voltar à Tela Inicial
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
           9. GESTURE NAVIGATION PILL BAR (Android/iOS Style)
           ========================================== */}
        <div 
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-[100] cursor-pointer hover:bg-white/60 active:scale-95 transition-all"
          onClick={() => {
            if (activeApp !== null) {
              setActiveApp(null);
              setRecentAppsOpen(false);
            } else {
              setRecentAppsOpen(!recentAppsOpen);
            }
          }}
          title="Toque para Voltar à Tela Inicial / Ver Aplicativos Recentes"
        />

      </div>
    </div>
  );
}
