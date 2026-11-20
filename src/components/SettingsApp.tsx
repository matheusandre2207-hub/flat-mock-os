import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Bluetooth, Sun, Moon, Volume2, Smartphone, RefreshCw, User, Info, BatteryCharging, Check, ChevronRight, ChevronLeft, Search, Bell, Lock, Grid, Accessibility, Play, Shield, Activity, Smartphone as PhoneIcon, Volume1, VolumeX, Eye, Sparkles, CheckCircle2, ChevronDown, Trash2, Maximize, Plus, X, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallpaper } from '../types';
import DisplayPrefs, { KeyboardSection } from './DisplayPrefs';
import SettingsMenu from './SettingsMenu';
import { MemoryPanel, DndPanel, AboutPanel, DeveloperPanel, CloudPanel } from './SettingsExtra';
import { usePrefs, setPrefs } from '../prefs';
import { useMemory, fmtMem } from '../memorySim';

interface SettingsAppProps {
  dnd: boolean;
  setDnd: (b: boolean) => void;
  openedApps: string[];
  appNames: Record<string, string>;
  onCloseApps: (ids: string[]) => void;
  email?: string;
  profilePhoto?: string | null;
  setProfilePhoto: (p: string | null) => void;
  userName: string;
  setUserName: (n: string) => void;
  wifi: boolean;
  setWifi: (b: boolean) => void;
  bluetooth: boolean;
  setBluetooth: (b: boolean) => void;
  cellular: boolean;
  setCellular: (b: boolean) => void;
  airplaneMode: boolean;
  setAirplaneMode: (b: boolean) => void;
  darkMode: boolean;
  setDarkMode: (b: boolean) => void;
  nightMode: boolean;
  setNightMode: (b: boolean) => void;
  brightness: number;
  setBrightness: (n: number) => void;
  volume: number;
  setVolume: (n: number) => void;
  selectedRingtone: string;
  setSelectedRingtone: (s: string) => void;
  
  // Battery simulator controls
  useManualBattery: boolean;
  setUseManualBattery: (b: boolean) => void;
  simulatedLevel: number;
  setSimulatedLevel: (n: number) => void;
  simulatedCharging: boolean;
  setSimulatedCharging: (b: boolean) => void;
  
  // System Wallpapers
  wallpapers: Wallpaper[];
  currentWallpaperIndex: number;
  setWallpaperIndex: (n: number) => void;

  isActive?: boolean;
  installedApps: string[];
  onUninstall: (id: string) => void;

  // Fullscreen controls
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  autoFullscreen?: boolean;
  setAutoFullscreen?: (b: boolean) => void;

  // System Setup & Boot Preferences
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
  pincode: string;
  setPincode: (pin: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  onResetOS: () => void;
  onOpenGallery?: () => void;
}

let sharedAudioContext: AudioContext | null = null;

// Simple synthesizer for audio feedback using Web Audio API
const playTone = (frequency: number, type: OscillatorType = 'sine', duration = 0.15, volume = 0.08) => {
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = sharedAudioContext;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Dynamic envelope
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Audio synthesis not supported or blocked:', err);
  }
};

const playRingtone = (type: string) => {
  if (type === 'classic') {
    playTone(523.25, 'sine', 0.1);
    setTimeout(() => playTone(659.25, 'sine', 0.1), 120);
    setTimeout(() => playTone(783.99, 'sine', 0.15), 240);
  } else if (type === 'synth') {
    playTone(880, 'sawtooth', 0.08, 0.04);
    setTimeout(() => playTone(1760, 'sawtooth', 0.15, 0.03), 100);
  } else if (type === 'bell') {
    playTone(987.77, 'triangle', 0.2, 0.1);
    setTimeout(() => playTone(1318.51, 'triangle', 0.3, 0.08), 150);
  } else if (type === 'marimba') {
    const scale = [440, 554.37, 659.25, 880];
    scale.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'sine', 0.15, 0.06), idx * 80);
    });
  } else if (type === 'cyberpunk') {
    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    scale.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, idx % 2 === 0 ? 'sawtooth' : 'square', 0.1, 0.05), idx * 70);
    });
  } else if (type === 'diamond') {
    const scale = [1046.50, 1318.51, 1567.98, 2093.00];
    scale.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'sine', 0.25, 0.07), idx * 90);
    });
  } else if (type === 'crystal') {
    playTone(1567.98, 'sine', 0.12, 0.06);
    setTimeout(() => playTone(2093.00, 'triangle', 0.15, 0.08), 80);
    setTimeout(() => playTone(2637.02, 'sine', 0.25, 0.05), 160);
  } else if (type === 'gold') {
    playTone(392.00, 'triangle', 0.12, 0.07);
    setTimeout(() => playTone(523.25, 'triangle', 0.12, 0.07), 100);
    setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.07), 200);
    setTimeout(() => playTone(1046.50, 'sine', 0.35, 0.09), 300);
  }
};

export default function SettingsApp({
  userName, setUserName,
  wifi, setWifi,
  bluetooth, setBluetooth,
  cellular, setCellular,
  airplaneMode, setAirplaneMode,
  darkMode, setDarkMode,
  nightMode, setNightMode,
  brightness: brightness, setBrightness: setBrightness,
  volume: volume, setVolume: setVolume,
  selectedRingtone: selectedRingtone, setSelectedRingtone: setSelectedRingtone,
  useManualBattery, setUseManualBattery,
  simulatedLevel, setSimulatedLevel,
  simulatedCharging, setSimulatedCharging,
  wallpapers, currentWallpaperIndex, setWallpaperIndex,
  isActive = false,
  onOpenGallery,
  installedApps,
  onUninstall,
  isFullscreen = false,
  onToggleFullscreen,
  autoFullscreen = false,
  setAutoFullscreen,
  language,
  setLanguage,
  pincode,
  setPincode,
  userAvatar,
  setUserAvatar,
  onResetOS,
  dnd, setDnd, openedApps, appNames, onCloseApps, email, profilePhoto, setProfilePhoto
}: SettingsAppProps) {
  const { prefs } = usePrefs();
  const mem = useMemory();
  const devTaps = useRef(0);
  const onDevTap = (): string => {
    if (prefs.dev.enabled) return 'O modo desenvolvedor já está ativado';
    devTaps.current += 1;
    const left = 7 - devTaps.current;
    if (left <= 0) { setPrefs({ dev: { ...prefs.dev, enabled: true } }); devTaps.current = 0; return 'Você agora é um desenvolvedor!'; }
    return left <= 3 ? `Faltam ${left} toques para ativar o modo desenvolvedor` : '';
  };
  
  const [currentPanel, setCurrentPanel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // Local sub-panel simulated states
  const [connectedWifi, setConnectedWifi] = useState<string | null>(wifi ? 'MockOS-Guest_5G' : null);
  const [wifiLoading, setWifiLoading] = useState<string | null>(null);
  const [bluetoothDevices, setBluetoothDevices] = useState([
    { id: '1', name: 'MockPods Pro', type: 'headphones', connected: bluetooth },
    { id: '2', name: 'SmartWatch v3', type: 'watch', connected: false },
    { id: '3', name: 'Car-Stereo System', type: 'audio', connected: false },
  ]);
  const [connectingBtId, setConnectingBtId] = useState<string | null>(null);
  const [allowedNotifications, setAllowedNotifications] = useState(true);
  const [notificationStyle, setNotificationStyle] = useState<'stack' | 'list' | 'count'>('stack');
  const [locationServices, setLocationServices] = useState(true);
  const [dataLimitEnabled, setDataLimitEnabled] = useState(false);
  const [grayscaleMode, setGrayscaleMode] = useState(false);
  
  // Filterable options for search query
  const allSettingsItems = [
    { id: 'perfil', label: 'Editar Perfil / Nome', description: 'Apple ID, iCloud, Mídia e Compras', keywords: 'nome perfil usuario mateus oliveira cloud' },
    { id: 'wifi', label: 'Wi-Fi', description: 'Redes sem fio e conexões de internet', keywords: 'wifi rede internet conexao sinal' },
    { id: 'celular', label: 'Rede móvel', description: 'Dados móveis, 4G, 5G e roaming', keywords: 'celular rede dados internet chip 4g 5g mobile' },
    { id: 'bluetooth', label: 'Bluetooth', description: 'Conexão sem fio e pareamento', keywords: 'bluetooth pareamento conexao sem fio fone' },
    { id: 'aviao', label: 'Modo avião', description: 'Desativa todas as redes transmissoras', keywords: 'aviao rede desligar sinal voo' },
    { id: 'notificacoes', label: 'Notificações', description: 'Banner, sons, avisos e contagens', keywords: 'notificacoes avisos alertas som barulho' },
    { id: 'tela', label: 'Configurações da tela', description: 'Brilho, Tema Escuro, Papel de Parede', keywords: 'tela brilho wallpaper papel de parede escuro dark modo noturno protecao ocular navegacao botoes gestos android' },
    { id: 'bateria', label: 'Bateria', description: 'Nível, saúde e simulador manual', keywords: 'bateria nivel simulador carga carregador carregando' },
    { id: 'privacidade', label: 'Privacidade e segurança', description: 'Permissões de câmera, microfone, GPS', keywords: 'privacidade seguranca permissao gps localizacao' },
    { id: 'som', label: 'Som e vibração', description: 'Volume, toque e feedback tátil', keywords: 'som volume toque vibracao ringtone barulho' },
    { id: 'apps', label: 'Aplicativos', description: 'Gerenciar aplicativos instalados e caches', keywords: 'aplicativos apps programas instalados versao cache' },
    { id: 'acessibilidade', label: 'Acessibilidade', description: 'Tamanho do texto, filtros de cor', keywords: 'acessibilidade zoom fonte contraste escala filtro' },
    { id: 'sobre', label: 'Sobre o Aparelho', description: 'Especificações, atualizações do OS', keywords: 'sobre atualizacao processador memoria ram hardware sistema' },
  ];

  // System back gesture listener mapping
  useEffect(() => {
    const handleBack = (e: Event) => {
      if (!isActive) return;
      if (currentPanel !== null) {
        setCurrentPanel(null);
        e.preventDefault();
      }
    };
    window.addEventListener('mockos-back', handleBack);
    return () => window.removeEventListener('mockos-back', handleBack);
  }, [currentPanel, isActive]);

  // Sync state if external changes happen
  useEffect(() => {
    if (wifi) {
      if (!connectedWifi) setConnectedWifi('MockOS-Guest_5G');
    } else {
      setConnectedWifi(null);
    }
  }, [wifi]);

  useEffect(() => {
    setBluetoothDevices(prev => 
      prev.map(d => d.id === '1' ? { ...d, connected: bluetooth } : d)
    );
  }, [bluetooth]);

  const saveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      playTone(600, 'sine', 0.1, 0.05);
    }
    setEditingName(false);
  };

  const runUpdateCheck = () => {
    setCheckingUpdate(true);
    setUpdateMessage('');
    playTone(440, 'triangle', 0.05);
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateMessage('O Mock OS está na versão mais recente (v1.0.4).');
      playTone(880, 'sine', 0.2, 0.08);
    }, 1800);
  };

  const toggleWifi = (val: boolean) => {
    setWifi(val);
    if (!val) {
      setConnectedWifi(null);
    } else {
      setConnectedWifi('MockOS-Guest_5G');
    }
    playTone(val ? 659.25 : 329.63, 'sine', 0.08, 0.05);
  };

  const toggleBluetooth = (val: boolean) => {
    setBluetooth(val);
    playTone(val ? 783.99 : 392.00, 'sine', 0.08, 0.05);
  };

  const toggleCellular = (val: boolean) => {
    setCellular(val);
    playTone(val ? 587.33 : 293.66, 'sine', 0.08, 0.05);
  };

  const toggleAirplaneMode = (val: boolean) => {
    setAirplaneMode(val);
    if (val) {
      setWifi(false);
      setBluetooth(false);
      setCellular(false);
      setConnectedWifi(null);
    }
    playTone(val ? 880 : 220, 'sine', 0.1, 0.05);
  };

  const handleConnectBt = (id: string, currentlyConnected: boolean) => {
    if (!bluetooth) return;
    setConnectingBtId(id);
    playTone(500, 'triangle', 0.05);
    
    setTimeout(() => {
      setBluetoothDevices(prev => 
        prev.map(d => d.id === id ? { ...d, connected: !currentlyConnected } : d)
      );
      if (id === '1') {
        setBluetooth(!currentlyConnected);
      }
      setConnectingBtId(null);
      playTone(!currentlyConnected ? 880 : 330, 'sine', 0.12, 0.06);
    }, 1200);
  };

  const handleConnectWifiSim = (name: string) => {
    if (!wifi) return;
    setWifiLoading(name);
    playTone(550, 'triangle', 0.05);
    
    setTimeout(() => {
      setConnectedWifi(name);
      setWifiLoading(null);
      playTone(880, 'sine', 0.15, 0.06);
    }, 1500);
  };

  // Filter search matches
  const filteredSearch = searchQuery.trim() !== '' 
    ? allSettingsItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${
 darkMode ? 'text-white bg-black' : 'text-slate-950 bg-slate-100'
 } ${grayscaleMode ? 'grayscale' : ''}`}>
      
      {/* HEADER BAR (Customizable transition sliding pages) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* MENU PRINCIPAL */}
        {currentPanel === null && (
          <SettingsMenu
            darkMode={darkMode}
            userName={userName}
            userAvatar={userAvatar}
            email={email}
            photo={profilePhoto}
            query={searchQuery}
            setQuery={setSearchQuery}
            devUnlocked={prefs.dev.enabled}
            onOpen={(id) => { setCurrentPanel(id); playTone(500, 'sine', 0.08, 0.03); }}
            summaries={{
              wifi: wifi ? (connectedWifi ?? 'Conectado') : 'Desativado',
              celular: cellular ? 'Dados ativados' : 'Desativado',
              bluetooth: bluetooth ? 'Ativado' : 'Desativado',
              aviao: airplaneMode ? 'Ativado' : 'Desativado',
              notificacoes: allowedNotifications ? 'Permitidas' : 'Bloqueadas',
              dnd: dnd ? 'Ativado' : 'Desativado',
              som: `Volume ${volume}%`,
              tela: `${darkMode ? 'Modo escuro' : 'Modo claro'} · brilho ${brightness}%`,
              bateria: `${Math.round(simulatedLevel)}%${simulatedCharging ? ' · carregando' : ''}`,
              memoria: `${fmtMem(mem.used)} de ${fmtMem(mem.total)} em uso`,
              apps: `${installedApps.length} instalados`,
              sobre: `${prefs.dev.osName} ${prefs.dev.osVersion} · ${prefs.dev.model}`,
              teclado: prefs.kb.autoCorrect ? 'Correção automática ligada' : 'Correção automática desligada',
              dev: 'Ativado',
            }}
          />
        )}

        {/* SUB-PAGES WRAPPERS WITH INTERACTIVE ELEMENTS */}
        <AnimatePresence mode="wait">
          {currentPanel !== null && (
            <motion.div 
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="px-4.5 pt-3 space-y-4"
            >
              
              {/* Universal Sub-page Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200/40 dark:border-white/5">
                <button 
                  onClick={() => {
                    setCurrentPanel(null);
                    playTone(400, 'sine', 0.08, 0.03);
                  }}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600"
                >
                  <ChevronLeft size={18} />
                  <span>Ajustes</span>
                </button>
                <h2 className="text-sm font-bold capitalize truncate max-w-[50%]">
                  {currentPanel === 'aviao' ? "Modo Avião" : 
                   currentPanel === 'tela' ? "Configurações da Tela" : 
                   currentPanel === 'notificacoes' ? "Notificações" : 
                   currentPanel === 'bateria' ? "Bateria" : 
                   currentPanel === 'privacidade' ? "Privacidade" : 
                   currentPanel === 'som' ? "Som e Vibração" : 
                   currentPanel === 'apps' ? "Aplicativos" : 
                   currentPanel === 'acessibilidade' ? "Acessibilidade" : 
                   currentPanel === 'sobre' ? "Sobre o Aparelho" : 
                   currentPanel === 'perfil' ? "AeroCloud" : 
                   currentPanel === 'teclado' ? "Teclado" : 
                   currentPanel === 'wifi' ? "Wi-Fi" : 
                   currentPanel === 'celular' ? "Rede Móvel" : 
                   currentPanel === 'bluetooth' ? "Bluetooth" : 
                   currentPanel === 'memoria' ? "Memória e armazenamento" : 
                   currentPanel === 'dnd' ? "Não perturbe" : 
                   currentPanel === 'dev' ? "Opções do desenvolvedor" : 
                   currentPanel}
                </h2>
                <div className="w-16" /> {/* Spacer */}
              </div>

              {/* PANEL 1: PROFILE / EDIT NAME */}
              {currentPanel === 'perfil' && (
                <CloudPanel darkMode={darkMode} userName={userName} setUserName={setUserName} userAvatar={userAvatar} email={email} photo={profilePhoto} setPhoto={setProfilePhoto} />
              )}
              {currentPanel === 'teclado' && (
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'}`}><KeyboardSection /></div>
              )}
              {currentPanel === 'memoria' && (
                <MemoryPanel darkMode={darkMode} installedApps={installedApps} openedApps={openedApps} appNames={appNames} onCloseApps={onCloseApps} />
              )}
              {currentPanel === 'dnd' && <DndPanel darkMode={darkMode} dnd={dnd} setDnd={setDnd} />}
              {currentPanel === 'dev' && <DeveloperPanel darkMode={darkMode} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
