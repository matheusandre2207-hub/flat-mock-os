import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, WifiOff, Bluetooth, Signal, Plane, Moon, Sun, 
  Volume2, VolumeX, Sliders, Search, User, Folder, FileText, 
  Image as ImageIcon, Music as MusicIcon, Globe, Settings, 
  ChevronRight, ChevronLeft, X, Play, Pause, SkipForward, SkipBack, 
  Send, Trash2, Clock, Smartphone, Bell, MessageSquare, Plus, Minus,
  Grid, Compass, FolderClosed, PlayCircle, Eye, EyeOff, Maximize, Minimize
} from 'lucide-react';

import { Wallpaper, NotificationItem, PopupNotification, Track, Chat, Folder as FolderType, Contact } from './types';
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
import PhoneApp from './components/PhoneApp';
import ContactsApp from './components/ContactsApp';
import CameraApp from './components/CameraApp';

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
  paint: { label: 'Mini Paint', icon: '🎨', iconBgClass: 'bg-purple-500' },
  telefone: { label: 'Telefone', icon: '📞', iconBgClass: 'bg-emerald-500' },
  contatos: { label: 'Contatos', icon: '👥', iconBgClass: 'bg-sky-500' },
  camera: { label: 'Câmera', icon: '📷', iconBgClass: 'bg-zinc-700' }
};

const randomIncomingMessages = [
  {
    chatId: 'love',
    name: 'Amor 💖',
    avatar: '💖',
    texts: [
      "Amor, quando chegar me avisa tá? Te amo! 🥰",
      "Queria tanto comer uma pizza hoje de noite... o que acha? 🍕",
      "Terminou o que estava fazendo aí? Me liga! 😘",
      "Você é o melhor, sabia? Passando só pra lembrar! ❤️"
    ]
  },
  {
    chatId: 'friend-lucas',
    name: 'Lucas 🤙',
    avatar: '🤙',
    texts: [
      "Mano, viu o jogo ontem? Que loucura! ⚽",
      "Eae, bora fechar um game hoje mais tarde? 🎮",
      "Tô precisando de uma ajuda com um negócio aqui, depois me liga!",
      "Aquele churrasco do fim de semana tá de pé né? 🥩🍻"
    ]
  },
  {
    chatId: 'grandmother',
    name: 'Vovó 👵',
    avatar: '👵',
    texts: [
      "Meu neto querido, vem comer bolo de cenoura hoje! 👵🍰",
      "Deus te abençoe muito e te proteja sempre. Amém! 🙏",
      "Como você está, meu filho? Manda notícias!",
      "Não fique trabalhando muito nesse computador, faz mal pras vistas! 👵🌸"
    ]
  }
];

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

  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'mother', name: 'Mãe ❤️', avatar: '👩', role: 'Mãe', phone: '(11) 99222-3344', email: 'mamae.querida@email.com', location: 'São Paulo, SP' },
    { id: 'love', name: 'Amor 💖', avatar: '🥰', role: 'Namorada', phone: '(11) 99888-7766', email: 'meu.amor@email.com', location: 'São Paulo, SP' },
    { id: 'grandmother', name: 'Vovó 👵', avatar: '👵', role: 'Família', phone: '(11) 98765-4321', email: 'vovo.querida@email.com', location: 'Santos, SP' },
    { id: 'friend-lucas', name: 'Lucas 🤙', avatar: '👦', role: 'Amigo', phone: '(11) 99111-2233', email: 'lucas.friend@email.com', location: 'São Bernardo, SP' },
    { id: 'tech-support', name: 'Suporte Mock OS', avatar: '🛠️', role: 'Suporte Técnico', phone: '0800 123 456', email: 'suporte@mockos.io', location: 'Nuvem' },
  ]);

  const addContact = (newContact: Contact) => {
    setContacts(prev => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
    // Also create a chat for this contact if it doesn't exist
    setChats(prev => {
      if (prev.some(c => c.id === newContact.id)) return prev;
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newChat: Chat = {
        id: newContact.id,
        name: newContact.name,
        avatar: newContact.avatar,
        role: newContact.role,
        unread: false,
        messages: [
          {
            id: `sys-${Date.now()}`,
            sender: 'contact',
            text: `Oi Mateus! Adicionei seu número aqui nos meus contatos. Tudo bem? 😊`,
            timestamp
          }
        ]
      };
      return [...prev, newChat];
    });
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setChats(prev => prev.filter(c => c.id !== id));
    if (selectedChatId === id) {
      setSelectedChatId(null);
    }
  };

  // Selected chat ID for messaging & Popups state
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activePopup, setActivePopup] = useState<PopupNotification | null>(null);

  // Installed Apps State
  const [installedApps, setInstalledApps] = useState<string[]>([
    'arquivos', 'calculadora', 'configuracoes', 'galeria', 'mensagens', 'musica', 'navegador', 'loja', 'telefone', 'contatos', 'camera'
  ]);

  const handleInstallApp = (appId: string) => {
    setInstalledApps(prev => {
      if (prev.includes(appId)) return prev;
      return [...prev, appId];
    });
  };

  const handleUninstallApp = (appId: string) => {
    if (appId === 'configuracoes' || appId === 'loja' || appId === 'telefone' || appId === 'contatos' || appId === 'camera') return;
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

  // Fullscreen state & native browser control (força a esconder a barra de status do celular Android)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const docEl = document.documentElement as any;
    const doc = document as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
      const requestFS = docEl.requestFullscreen || 
                        docEl.webkitRequestFullscreen || 
                        docEl.mozRequestFullScreen || 
                        docEl.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(docEl).then(() => {
          const screenObj = window.screen as any;
          if (screenObj && screenObj.orientation && typeof screenObj.orientation.lock === 'function') {
            screenObj.orientation.lock('portrait').catch((err: any) => {
              console.warn("Falha ao travar orientação em modo retrato:", err);
            });
          }
        }).catch((err: any) => {
          console.warn("Falha ao entrar em tela inteira:", err);
        });
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  const handleScreenClick = () => {
    const doc = document as any;
    const isCurrentlyFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
    
    if (!isCurrentlyFullscreen) {
      const docEl = document.documentElement as any;
      const requestFS = docEl.requestFullscreen || 
                        docEl.webkitRequestFullscreen || 
                        docEl.mozRequestFullScreen || 
                        docEl.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(docEl).then(() => {
          const screenObj = window.screen as any;
          if (screenObj && screenObj.orientation && typeof screenObj.orientation.lock === 'function') {
            screenObj.orientation.lock('portrait').catch((err: any) => {
              console.warn("Falha ao travar orientação em modo retrato:", err);
            });
          }
        }).catch((err: any) => {
          console.warn("Falha ao entrar em tela inteira:", err);
        });
      }
    }
  };

  // Auto-dismiss popup notifications after 5 seconds
  useEffect(() => {
    if (activePopup) {
      const timer = setTimeout(() => {
        setActivePopup(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activePopup]);

  // Periodic background message simulator
  useEffect(() => {
    let intervalId: any = null;

    // Wait 60 seconds before the first background message, then send every 150 seconds to prevent spam
    const initialTimer = setTimeout(() => {
      const sendRandomMessage = () => {
        // Use setChats functional form to always read the freshest state without triggering re-runs
        setChats(prevChats => {
          // Exclude 'self-notes' and the currently active chat
          const availableChats = prevChats.filter(c => c.id !== 'self-notes' && c.id !== selectedChatId);
          if (availableChats.length === 0) return prevChats;

          const targetChat = availableChats[Math.floor(Math.random() * availableChats.length)];

          const getBgMessage = async () => {
            try {
              const res = await fetch('/api/chat/background', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contactId: targetChat.id,
                  contactName: targetChat.name,
                  contactRole: targetChat.role,
                  messageHistory: targetChat.messages
                })
              });
              if (res.ok) {
                const data = await res.json();
                if (data && data.reply) {
                  return data.reply;
                }
              }
            } catch (err) {
              console.warn("Background AI message generation failed, using static fallback:", err);
            }
            // Static fallback
            const staticContact = randomIncomingMessages.find(rc => rc.chatId === targetChat.id) || randomIncomingMessages[0];
            return staticContact.texts[Math.floor(Math.random() * staticContact.texts.length)];
          };

          getBgMessage().then(text => {
            if (!text) return;

            const now = new Date();
            const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const botMsg = {
              id: `b-bg-${Date.now()}`,
              sender: 'contact' as const,
              text,
              timestamp
            };

            setChats(latestChats => latestChats.map(c => {
              if (c.id === targetChat.id) {
                const isCurrentlyViewing = (activeApp === 'mensagens' && selectedChatId === targetChat.id);
                return {
                  ...c,
                  unread: !isCurrentlyViewing,
                  messages: [...c.messages, botMsg]
                };
              }
              return c;
            }));

            const isCurrentlyViewing = (activeApp === 'mensagens' && selectedChatId === targetChat.id);
            if (!isCurrentlyViewing) {
              triggerNotification(targetChat.name, text, 'mensagens', targetChat.avatar, targetChat.id);
            }
          });

          return prevChats;
        });
      };

      sendRandomMessage();

      intervalId = setInterval(sendRandomMessage, 150000);
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeApp, selectedChatId]);

  const [swipeUpStartY, setSwipeUpStartY] = useState<number | null>(null);
  const [swipeUpCurrentY, setSwipeUpCurrentY] = useState<number | null>(null);
  const swipeUpTimerRef = useRef<any>(null);
  const touchStartYRef = useRef<number>(0);
  const touchCurrentYRef = useRef<number>(0);
  const isHoldingBottomSwipeRef = useRef<boolean>(false);

  // 2. Volume Change HUD display trigger (disabled by user request)
  useEffect(() => {
    // Disabled volume HUD display
  }, [volume]);

  // Auto-close multitasking/recent apps panel when there are no opened apps left
  useEffect(() => {
    if (recentAppsOpen && openedApps.length === 0) {
      setRecentAppsOpen(false);
    }
  }, [openedApps, recentAppsOpen]);

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
    let batteryObj: any = null;
    let onLevelChange: (() => void) | null = null;
    let onChargingChange: (() => void) | null = null;

    if (!useManualBattery && typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        onLevelChange = () => setBatteryLevel(Math.round(battery.level * 100));
        onChargingChange = () => setIsCharging(battery.charging);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);
      }).catch((err: any) => {
        console.warn("Battery API not supported or blocked by policy:", err);
      });
    }

    return () => {
      if (batteryObj) {
        if (onLevelChange) batteryObj.removeEventListener('levelchange', onLevelChange);
        if (onChargingChange) batteryObj.removeEventListener('chargingchange', onChargingChange);
      }
    };
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

  // Trigger system-wide notification with a popup
  const triggerNotification = (title: string, body: string, app: string, avatar?: string, chatId?: string) => {
    const newNotif: NotificationItem = {
      id: `${app}-${Date.now()}`,
      title,
      body,
      time: "Agora",
      app,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Show popup
    setActivePopup({
      id: newNotif.id,
      title,
      body,
      app,
      avatar,
      chatId,
    });
  };

  // Handle click or swipe-down action on popup notification
  const handlePopupAction = (popup: PopupNotification) => {
    if (popup.app === 'mensagens') {
      if (popup.chatId) {
        setSelectedChatId(popup.chatId);
      }
      openApp('mensagens');
    } else {
      openApp(popup.app);
    }
    setActivePopup(null);
  };

  // Open an app safely
  const openApp = (appName: string) => {
    setActiveApp(appName);
    setAppDrawerOpen(false);
    setNotificationsOpen(false);
    setUtilitiesOpen(false);
    setRecentAppsOpen(false);
    setOpenedApps(prev => {
      if (prev.includes(appName)) return prev;
      return [...prev, appName];
    });
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

    // Se o toque iniciar muito próximo à borda inferior da tela (evita conflitos com scrolls longos nos apps)
    if (y > window.innerHeight - 25) {
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
      // Começou bem na borda direita (gesto de voltar do Android/iOS)
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

  const renderAppPreviewContent = (appName: string) => {
    switch (appName) {
      case 'configuracoes':
        return (
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
            isActive={false}
            installedApps={installedApps}
            onUninstall={handleUninstallApp}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        );
      case 'calculadora':
        return <Calculator />;
      case 'galeria':
        return (
          <div className={`no-scrollbar pt-4 pb-24 px-5 space-y-4 overflow-y-auto h-full ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
            <div className="space-y-1">
              <h3 className="font-bold text-base">Minha Galeria</h3>
              <p className="text-xs opacity-65">Escolha um gradiente para ser seu papel de parede.</p>
            </div>
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {wallpapersList.map((wp, idx) => (
                <div
                  key={idx}
                  className="aspect-[9/16] rounded-2xl overflow-hidden relative shadow-md border border-white/5"
                  style={{ background: wp.gradient }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 text-white">
                    <p className="font-bold text-xs leading-tight">{wp.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'mensagens':
        return (
          <MessagesApp
            chats={chats}
            setChats={setChats}
            darkMode={darkMode}
            isActive={false}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
          />
        );
      case 'musica':
        return (
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
        );
      case 'navegador':
        return <Browser darkMode={darkMode} isActive={false} />;
      case 'arquivos':
        return (
          <FilesApp
            folders={folders}
            setFolders={setFolders}
            darkMode={darkMode}
            onSetWallpaper={handleSetWallpaperFromFile}
            onPlayTrack={handlePlayTrackFromFile}
            isActive={false}
          />
        );
      case 'loja':
        return (
          <StoreApp
            darkMode={darkMode}
            installedApps={installedApps}
            onInstall={handleInstallApp}
            onUninstall={handleUninstallApp}
            onOpenApp={openApp}
          />
        );
      case 'notas':
        return <NotesApp darkMode={darkMode} />;
      case 'flappy':
        return <FlappyApp darkMode={darkMode} isActive={false} />;
      case 'clima':
        return <WeatherApp darkMode={darkMode} />;
      case 'paint':
        return <PaintApp darkMode={darkMode} />;
      case 'telefone':
        return <PhoneApp darkMode={darkMode} onOpenApp={openApp} />;
      case 'contatos':
        return (
          <ContactsApp 
            darkMode={darkMode} 
            onOpenApp={openApp} 
            contacts={contacts}
            onAddContact={addContact}
            onDeleteContact={deleteContact}
          />
        );
      case 'camera':
        return <CameraApp darkMode={darkMode} isActive={false} />;
      default:
        return null;
    }
  };

  return (
    <div onClick={handleScreenClick} className="w-screen h-screen overflow-hidden select-none bg-black">
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
                <button 
                  onClick={() => toggleFullscreen()}
                  className={`toggle-btn ${isFullscreen ? 'active bg-blue-600 text-white' : ''}`}
                  title="Esconder barra de status do celular Android (Tela Cheia)"
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  <span>{isFullscreen ? 'Minimizar' : 'Tela Cheia'}</span>
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
          <div className="drawer-list no-scrollbar flex flex-col gap-1">
            {[...installedApps]
              .sort((a, b) => {
                const labelA = appMetadata[a]?.label || '';
                const labelB = appMetadata[b]?.label || '';
                return labelA.localeCompare(labelB, 'pt-BR');
              })
              .map((appName) => {
                const meta = appMetadata[appName];
                if (!meta) return null;
                return (
                  <button 
                    key={appName} 
                    className="drawer-item flex items-center p-2.5 transition-transform active:scale-95 cursor-pointer text-left w-full hover:bg-white/10" 
                    onClick={() => openApp(appName)}
                  >
                    <div className={`app-icon flex items-center justify-center text-xl shadow-sm ${meta.iconBgClass} rounded-2xl w-11 h-11 flex-shrink-0`}>
                      {meta.icon}
                    </div>
                    <span className="app-label text-[11px] font-bold text-white truncate flex-1">{meta.label}</span>
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
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
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
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              onIncomingMessage={(senderName, text, chatId) => {
                const chatObj = chats.find(c => c.id === chatId);
                triggerNotification(senderName, text, 'mensagens', chatObj?.avatar, chatId);
              }}
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

        {/* APP M: TELEFONE */}
        <div className={`app-window ${activeApp === 'telefone' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <PhoneApp darkMode={darkMode} onOpenApp={openApp} />
          </div>
        </div>

        {/* APP N: CONTATOS */}
        <div className={`app-window ${activeApp === 'contatos' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <ContactsApp 
              darkMode={darkMode} 
              onOpenApp={openApp} 
              contacts={contacts}
              onAddContact={addContact}
              onDeleteContact={deleteContact}
            />
          </div>
        </div>

        {/* APP O: CÂMERA */}
        <div className={`app-window ${activeApp === 'camera' ? '' : 'closed'} dark bg-black text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <CameraApp darkMode={darkMode} isActive={activeApp === 'camera'} />
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
            className="absolute inset-0 bg-black/75 backdrop-blur-2xl z-40 flex flex-col justify-between p-6 text-white select-none transition-all duration-300"
          >
            
            {/* Middle Carousel of cards */}
            <div 
              className="flex-1 flex items-center justify-start overflow-x-auto gap-5 py-8 no-scrollbar px-6 w-full snap-x snap-mandatory"
            >
              {openedApps.length === 0 ? (
                <div className="text-center w-full flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-400 font-medium tracking-wide">nenhum app aberto</p>
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
                      <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-lg ${meta.iconBgClass} flex items-center justify-center text-xs shadow`}>
                            {meta.icon}
                          </div>
                          <span className="font-bold text-[11px] truncate text-white">{meta.label}</span>
                        </div>
                        
                        {isActive ? (
                          <span className="flex items-center gap-1 text-[8px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[8px] font-medium text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded-full border border-slate-500/10">
                            2º Plano
                          </span>
                        )}
                      </div>

                      {/* Real Preview Content */}
                      <div className="flex-1 overflow-hidden pointer-events-none select-none relative bg-slate-900">
                        <div 
                          className="absolute top-0 left-0 origin-top-left" 
                          style={{ 
                            width: '384px', 
                            height: '488px', 
                            transform: 'scale(0.5)',
                          }}
                        >
                          {renderAppPreviewContent(appName)}
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
            >
              {openedApps.length > 0 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
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
              )}
            </div>
          </div>
        )}

        {/* ==========================================
           10. POPUP NOTIFICATION CAP (Deslizar para Cima para Fechar, Deslizar para Baixo para Abrir)
           ========================================== */}
        <AnimatePresence>
          {activePopup && (
            <motion.div
              key={activePopup.id}
              initial={{ x: "-50%", y: -120, opacity: 0, scale: 0.95 }}
              animate={{ x: "-50%", y: 0, opacity: 1, scale: 1 }}
              exit={{ x: "-50%", y: -120, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: -150, bottom: 150 }}
              dragElastic={{ top: 0.15, bottom: 0.4 }}
              onDragEnd={(event, info) => {
                if (info.offset.y < -35 || info.velocity.y < -300) {
                  // Swipe up: close/dismiss
                  setActivePopup(null);
                } else if (info.offset.y > 50 || info.velocity.y > 300) {
                  // Swipe down: open/activate
                  handlePopupAction(activePopup);
                }
              }}
              onClick={() => handlePopupAction(activePopup)}
              className="absolute top-14 left-1/2 z-[200] w-[calc(100%-24px)] max-w-[360px] flex items-center gap-3.5 p-3.5 rounded-3xl bg-slate-900/95 dark:bg-[#1a1c22]/95 text-white shadow-[0_20px_45px_rgba(0,0,0,0.55)] border border-white/10 backdrop-blur-xl cursor-pointer select-none active:scale-[0.99] transition-transform duration-100"
            >
              {/* Avatar / App Icon on Left */}
              <div className="flex-shrink-0 relative">
                {activePopup.avatar ? (
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                    <span className="text-xl">{activePopup.avatar}</span>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center border border-white/10 text-white shadow-inner">
                    <Bell size={20} />
                  </div>
                )}
                {/* Secondary tiny app icon indicator */}
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-lg p-1 border border-slate-900 shadow">
                  <MessageSquare size={10} className="text-white" />
                </div>
              </div>

              {/* Text content in middle */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[12.5px] tracking-tight truncate text-white">
                    {activePopup.title}
                  </span>
                  <span className="text-[9.5px] font-mono text-white/40 flex-shrink-0">
                    Agora
                  </span>
                </div>
                <p className="text-[11.5px] text-white/80 line-clamp-2 leading-snug mt-0.5">
                  {activePopup.body}
                </p>
              </div>

              {/* Pull handle / Drag hint line at the bottom of the card */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/20" />
            </motion.div>
          )}
        </AnimatePresence>

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
