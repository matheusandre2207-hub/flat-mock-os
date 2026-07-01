import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, Bluetooth, Sun, Moon, Volume2, 
  Smartphone, RefreshCw, User, Info, BatteryCharging, Check,
  ChevronRight, ChevronLeft, Search, Bell, Lock, Grid,
  Accessibility, Play, Shield, Activity, Smartphone as PhoneIcon,
  Volume1, VolumeX, Eye, Sparkles, CheckCircle2, ChevronDown, Trash2,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallpaper } from '../types';

interface SettingsAppProps {
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
  brightness, setBrightness,
  volume, setVolume,
  useManualBattery, setUseManualBattery,
  simulatedLevel, setSimulatedLevel,
  simulatedCharging, setSimulatedCharging,
  wallpapers, currentWallpaperIndex, setWallpaperIndex,
  isActive = false,
  installedApps,
  onUninstall,
  isFullscreen = false,
  onToggleFullscreen
}: SettingsAppProps) {
  
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
  const [selectedRingtone, setSelectedRingtone] = useState('marimba');
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
    { id: 'tela', label: 'Configurações da tela', description: 'Brilho, Tema Escuro, Papel de Parede', keywords: 'tela brilho wallpaper papel de parede escuro dark modo noturno protecao ocular' },
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
      darkMode ? 'text-white bg-black' : 'text-slate-950 bg-[#f2f2f7]'
    } ${grayscaleMode ? 'grayscale' : ''}`}>
      
      {/* HEADER BAR (Customizable transition sliding pages) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* MAIN PANEL */}
        {currentPanel === null && (
          <div className="px-4 pt-5 max-w-md mx-auto w-full flex flex-col gap-6">
            
            {/* Title */}
            <div className="text-left py-1 relative">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Configurações</h1>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center mb-1">
              <Search size={16} className="absolute left-3 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 ${
                  darkMode 
                    ? 'bg-[#1c1c1e] text-white border border-white/5' 
                    : 'bg-white text-slate-900 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                } placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center"
                >
                  <span className="text-[10px] leading-none text-slate-500">✕</span>
                </button>
              )}
            </div>

            {/* SEARCH RESULTS VIEW */}
            {searchQuery.trim() !== '' ? (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  Resultados da busca
                </h3>
                {filteredSearch.length > 0 ? (
                  <div className={`rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] border ${
                    darkMode ? 'bg-[#1c1c1e] border-white/5 divide-y divide-white/5' : 'bg-white border-slate-200/60 divide-y divide-slate-100'
                  }`}>
                    {filteredSearch.map(item => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setCurrentPanel(item.id);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between p-4 transition-all text-left ${
                          darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{item.description}</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Nenhuma configuração encontrada para "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              // DEFAULT MENU WITH GAPS AND SECTION HEADINGS
              <div className="flex flex-col gap-6">
                
                {/* 1. Profile / ID Apple Section */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
                    Conta e Perfil
                  </span>
                  <button 
                    onClick={() => {
                      setCurrentPanel('perfil');
                      playTone(440, 'sine', 0.08, 0.03);
                    }}
                    className={`w-full flex items-center justify-between py-5.5 px-4.5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-all text-left border ${
                      darkMode 
                        ? 'bg-[#1c1c1e] border-white/5 hover:bg-[#2c2c2e]' 
                        : 'bg-white border-slate-200/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-13 h-13 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-md">
                        <User size={26} fill="white" className="opacity-95" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-[16.5px] leading-tight truncate">{userName}</h3>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">Apple ID, iCloud, Mídia e Compras</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0 ml-2" />
                  </button>
                </div>

                {/* 2. Connectivity List Container */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
                    Rede e Conexões
                  </span>
                  <div className={`rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border divide-y ${
                    darkMode ? 'bg-[#1c1c1e] border-white/5 divide-white/5' : 'bg-white border-slate-200/60 divide-slate-100'
                  }`}>
                    {/* Wi-Fi option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('wifi');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`flex items-center justify-between p-4 w-full rounded-t-2xl active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                          wifi ? 'bg-blue-600 text-white' : 'bg-slate-400 dark:bg-slate-600 text-white'
                        }`}>
                          <Wifi size={18} />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold leading-tight text-slate-900 dark:text-white">Wi-Fi</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[150px]">
                            {wifi ? (connectedWifi || "Conectado") : "Inativo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span className="truncate max-w-[100px]">{wifi ? (connectedWifi || "Ativo") : "Inativo"}</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Cellular option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('celular');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`flex items-center justify-between p-4 w-full active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                          cellular ? 'bg-green-600 text-white' : 'bg-slate-400 dark:bg-slate-600 text-white'
                        }`}>
                          <Activity size={18} />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold leading-tight text-slate-900 dark:text-white">Rede móvel</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {cellular ? "Dados móveis ativos" : "Inativo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>{cellular ? "5G Ativo" : "Inativo"}</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Bluetooth option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('bluetooth');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`flex items-center justify-between p-4 w-full active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                          bluetooth ? 'bg-[#007aff] text-white' : 'bg-slate-400 dark:bg-slate-600 text-white'
                        }`}>
                          <Bluetooth size={18} />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold leading-tight text-slate-900 dark:text-white">Bluetooth</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {bluetooth ? "Ativado" : "Inativo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>{bluetooth ? "Ativo" : "Inativo"}</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Airplane Mode option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('aviao');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`flex items-center justify-between p-4 w-full rounded-b-2xl active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                          airplaneMode ? 'bg-amber-500 text-white' : 'bg-slate-400 dark:bg-slate-600 text-white'
                        }`}>
                          <span className="text-[14px] leading-none">✈️</span>
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold leading-tight text-slate-900 dark:text-white">Modo avião</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {airplaneMode ? "Todas as conexões pausadas" : "Desativado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>{airplaneMode ? "Ativo" : "Inativo"}</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Main System Options List - Stacked Group 1 (Display, Sounds, Accessibility) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
                    Geral e Aparência
                  </span>
                  <div className={`rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border divide-y ${
                    darkMode ? 'bg-[#1c1c1e] border-white/5 divide-white/5' : 'bg-white border-slate-200/60 divide-slate-100'
                  }`}>
                    {/* Notifications option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('notificacoes');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-t-2xl active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center relative shadow-sm shrink-0">
                          <Bell size={17} />
                          <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1c1c1e]" />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Notificações</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>Ativadas</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Display Settings option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('tela');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Sun size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Configurações da tela</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>{darkMode ? "Escuro" : "Claro"}</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Sound & Vibration option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('som');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Volume2 size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Som e vibração</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>{volume}%</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Accessibility option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('acessibilidade');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-b-2xl active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Accessibility size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Acessibilidade</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>Inativo</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Main System Options List - Stacked Group 2 (Battery, Apps, Privacy, About) */}
                <div className="flex flex-col gap-1.5 pb-6">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
                    Sistema e Outros
                  </span>
                  <div className={`rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border divide-y ${
                    darkMode ? 'bg-[#1c1c1e] border-white/5 divide-white/5' : 'bg-white border-slate-200/60 divide-slate-100'
                  }`}>
                    {/* Battery option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('bateria');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-t-2xl active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <BatteryCharging size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Bateria</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span className="font-bold text-green-500">{simulatedLevel}%</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Privacy & Security option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('privacidade');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Lock size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Privacidade e segurança</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* Applications List option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('apps');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Grid size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Aplicativos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>{installedApps.length} instalados</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>

                    {/* About the device option */}
                    <button 
                      onClick={() => {
                        setCurrentPanel('sobre');
                        playTone(440, 'sine', 0.08, 0.03);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-b-2xl active:scale-[0.99] transition-all text-left ${
                        darkMode ? 'hover:bg-[#2c2c2e]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Info size={17} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Sobre o Aparelho</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                        <span>v1.0.4</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
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
                   currentPanel === 'perfil' ? "Perfil" : 
                   currentPanel === 'wifi' ? "Wi-Fi" : 
                   currentPanel === 'celular' ? "Rede Móvel" : 
                   currentPanel === 'bluetooth' ? "Bluetooth" : 
                   currentPanel}
                </h2>
                <div className="w-16" /> {/* Spacer */}
              </div>

              {/* PANEL 1: PROFILE / EDIT NAME */}
              {currentPanel === 'perfil' && (
                <div className="space-y-4">
                  <div className={`p-5 rounded-2.5xl text-center space-y-3 shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div className="w-20 h-20 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white border-2 border-slate-300 dark:border-slate-500 mx-auto shadow-sm">
                      <User size={40} fill="white" className="opacity-95" />
                    </div>
                    
                    {editingName ? (
                      <div className="space-y-3 max-w-xs mx-auto">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          maxLength={18}
                          className={`w-full px-4 py-2 text-sm rounded-xl text-center font-bold outline-none border focus:ring-2 focus:ring-blue-500/50 ${
                            darkMode ? 'bg-black text-white border-white/10' : 'bg-slate-100 text-slate-900 border-slate-200'
                          }`}
                          autoFocus
                        />
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={saveName} 
                            className="px-5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingName(false)} 
                            className="px-5 py-1.5 bg-slate-400 text-white text-xs font-bold rounded-lg hover:bg-slate-500 shadow-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">{userName}</h3>
                        <p className="text-xs opacity-50">Conta Mock OS ativa • Usuário Padrão</p>
                        <button 
                          onClick={() => setEditingName(true)}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Alterar nome do usuário
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-2.5xl shadow-sm space-y-3 text-xs leading-normal ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <h4 className="font-bold text-sm">Armazenamento iCloud</h4>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '0.5%' }} />
                    </div>
                    <div className="flex justify-between opacity-70">
                      <span>24 MB de 5 GB usados</span>
                      <span>100% Livre</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 2: WI-FI NETWORK */}
              {currentPanel === 'wifi' && (
                <div className="space-y-4">
                  
                  {/* Wi-Fi Switch Card */}
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Wi-Fi</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Permite conectar a redes sem fio locais</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={airplaneMode}
                      checked={wifi}
                      onChange={(e) => toggleWifi(e.target.checked)}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-600 disabled:opacity-30 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  {airplaneMode && (
                    <p className="text-xs text-amber-500 font-medium px-1">
                      ⚠️ Desative o Modo Avião para usar o Wi-Fi.
                    </p>
                  )}

                  {/* Available Networks */}
                  {wifi && !airplaneMode ? (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">
                        Redes Disponíveis
                      </h3>
                      <div className={`rounded-2.5xl overflow-hidden divide-y shadow-sm ${
                        darkMode ? 'bg-[#1c1c1e] divide-white/5' : 'bg-white divide-slate-100'
                      }`}>
                        {[
                          { name: 'MockOS-Guest_5G', speed: 'Rápida' },
                          { name: 'Starlink-SpaceX', speed: 'Ultra Rápida' },
                          { name: 'Home-WiFi_Secure', speed: 'Média' },
                          { name: 'Cafeteria_Free', speed: 'Aberta' }
                        ].map((net) => {
                          const isConnected = connectedWifi === net.name;
                          const isLoading = wifiLoading === net.name;
                          
                          return (
                            <button
                              key={net.name}
                              onClick={() => handleConnectWifiSim(net.name)}
                              disabled={isLoading}
                              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <Wifi size={16} className={isConnected ? "text-blue-500" : "opacity-40"} />
                                <div>
                                  <span className={`text-sm ${isConnected ? "font-bold text-blue-500" : "font-semibold"}`}>
                                    {net.name}
                                  </span>
                                  <p className="text-[10px] opacity-50 mt-0.5">{net.speed} • Segurança WPA3</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {isLoading && (
                                  <RefreshCw size={14} className="animate-spin text-blue-500" />
                                )}
                                {isConnected && !isLoading && (
                                  <Check size={16} className="text-blue-500 font-bold" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    !airplaneMode && (
                      <div className="p-8 text-center text-xs opacity-50 font-medium">
                        O Wi-Fi está desligado.
                      </div>
                    )
                  )}
                </div>
              )}

              {/* PANEL 3: REDE MOVEL (CELLULAR) */}
              {currentPanel === 'celular' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Dados Móveis (Rede)</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Usa conexão chip móvel para internet</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={airplaneMode}
                      checked={cellular}
                      onChange={(e) => toggleCellular(e.target.checked)}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-green-600 disabled:opacity-30 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  {cellular && !airplaneMode && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-2.5xl shadow-sm space-y-3 text-xs ${
                        darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                      }`}>
                        <h4 className="font-bold text-sm">Uso do Pacote de Dados</h4>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '42%' }} />
                        </div>
                        <div className="flex justify-between opacity-70 font-mono text-[10px]">
                          <span>4.2 GB de 10 GB usados</span>
                          <span>5.8 GB Restantes</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-2.5xl shadow-sm flex items-center justify-between text-xs ${
                        darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                      }`}>
                        <span className="font-semibold">Economia de Dados</span>
                        <input
                          type="checkbox"
                          checked={dataLimitEnabled}
                          onChange={(e) => {
                            setDataLimitEnabled(e.target.checked);
                            playTone(440, 'triangle', 0.05);
                          }}
                          className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-green-600 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 4: BLUETOOTH */}
              {currentPanel === 'bluetooth' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Bluetooth</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Parear fones de ouvido e acessórios</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={airplaneMode}
                      checked={bluetooth}
                      onChange={(e) => toggleBluetooth(e.target.checked)}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-indigo-600 disabled:opacity-30 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  {bluetooth && !airplaneMode ? (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1 flex items-center gap-2">
                        <span>Dispositivos Pareados</span>
                        <RefreshCw size={10} className="animate-spin opacity-60" />
                      </h3>
                      <div className={`rounded-2.5xl overflow-hidden divide-y shadow-sm ${
                        darkMode ? 'bg-[#1c1c1e] divide-white/5' : 'bg-white divide-slate-100'
                      }`}>
                        {bluetoothDevices.map((d) => {
                          const isConnecting = connectingBtId === d.id;
                          return (
                            <button
                              key={d.id}
                              onClick={() => handleConnectBt(d.id, d.connected)}
                              disabled={isConnecting}
                              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <Bluetooth size={16} className={d.connected ? "text-indigo-500" : "opacity-40"} />
                                <div>
                                  <span className={`text-sm ${d.connected ? "font-bold text-indigo-500" : "font-semibold"}`}>
                                    {d.name}
                                  </span>
                                  <p className="text-[10px] opacity-50">{d.type === 'headphones' ? 'Fones' : d.type === 'watch' ? 'Relógio Smart' : 'Som do Carro'}</p>
                                </div>
                              </div>
                              <div className="text-xs font-semibold flex items-center gap-1 opacity-70">
                                {isConnecting ? (
                                  <RefreshCw size={12} className="animate-spin text-indigo-500" />
                                ) : d.connected ? (
                                  <span className="text-indigo-600 font-bold">Conectado</span>
                                ) : (
                                  <span>Desconectado</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    !airplaneMode && (
                      <div className="p-8 text-center text-xs opacity-50 font-medium">
                        O Bluetooth está desligado.
                      </div>
                    )
                  )}
                </div>
              )}

              {/* PANEL 5: AIRPLANE MODE DETAILS */}
              {currentPanel === 'aviao' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Modo de Voo</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Suspende conexões para voos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={airplaneMode}
                      onChange={(e) => toggleAirplaneMode(e.target.checked)}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-amber-500 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  <div className={`p-4 rounded-2.5xl shadow-sm text-xs opacity-75 leading-relaxed space-y-2 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <p>O Modo de Voo desativa:</p>
                    <ul className="list-disc pl-4 space-y-1 font-medium">
                      <li>Sinal de Rede Móvel (Dados e chamadas)</li>
                      <li>Sinal Wi-Fi</li>
                      <li>Antena de rádio Bluetooth</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* PANEL 6: NOTIFICATIONS */}
              {currentPanel === 'notificacoes' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Permitir Notificações</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Exibe alertas no topo da tela</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowedNotifications}
                      onChange={(e) => {
                        setAllowedNotifications(e.target.checked);
                        playTone(500, 'sine', 0.1, 0.05);
                      }}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  {allowedNotifications && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">Formato de Exibição</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'stack', label: 'Pilha', desc: 'Agrupadas' },
                          { id: 'list', label: 'Lista', desc: 'Seqüencial' },
                          { id: 'count', label: 'Contagem', desc: 'Discreta' }
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => {
                              setNotificationStyle(style.id as any);
                              playTone(600, 'sine', 0.05);
                            }}
                            className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${
                              notificationStyle === style.id 
                                ? 'border-blue-600 bg-blue-500/10 font-bold' 
                                : 'border-transparent bg-[#e3e3e9] dark:bg-[#1c1c1e] opacity-70'
                            }`}
                          >
                            <div>{style.label}</div>
                            <span className="text-[10px] opacity-60 mt-1 block">{style.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 7: DISPLAY & THEME SETTINGS */}
              {currentPanel === 'tela' && (
                <div className="space-y-4">
                  
                  {/* Visual Theme Previews Selection (iOS Style Cards) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">Aparência do Sistema</h3>
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Light Card */}
                      <button
                        onClick={() => {
                          setDarkMode(false);
                          playTone(700, 'sine', 0.1, 0.05);
                        }}
                        className={`p-4 rounded-2.5xl text-center space-y-3 border-3 transition-all ${
                          !darkMode 
                            ? 'border-blue-600 bg-white shadow-md' 
                            : 'border-transparent bg-neutral-900 opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="h-16 w-full rounded-lg bg-slate-100 flex items-center justify-center shadow-sm">
                          <Sun size={24} className="text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Claro</span>
                      </button>

                      {/* Dark Card */}
                      <button
                        onClick={() => {
                          setDarkMode(true);
                          playTone(300, 'sine', 0.1, 0.05);
                        }}
                        className={`p-4 rounded-2.5xl text-center space-y-3 border-3 transition-all ${
                          darkMode 
                            ? 'border-blue-600 bg-[#1c1c1e] shadow-md' 
                            : 'border-transparent bg-white opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="h-16 w-full rounded-lg bg-black flex items-center justify-center shadow-sm">
                          <Moon size={24} className="text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Escuro</span>
                      </button>
                    </div>
                  </div>

                  {/* Brightness slider */}
                  <div className={`p-4 rounded-2.5xl shadow-sm space-y-3 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sun size={15} className="text-amber-500" /> Brilho da Tela
                      </span>
                      <span className="font-bold font-mono text-[11px]">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Proteção Ocular */}
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Proteção Ocular (Night Comfort)</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Filtra luz azul (tons quentes)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={nightMode}
                      onChange={(e) => {
                        setNightMode(e.target.checked);
                        playTone(e.target.checked ? 600 : 400, 'sine', 0.05);
                      }}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-amber-500 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  {/* Modo Tela Cheia / Esconder Barra de Status (Android) */}
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <Maximize size={15} className="text-blue-500" /> Esconder Barra de Status (Android)
                      </h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Força o app a ocupar toda a tela (Modo Nativo)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isFullscreen}
                      onChange={() => {
                        if (onToggleFullscreen) {
                          onToggleFullscreen();
                        }
                        playTone(isFullscreen ? 400 : 600, 'sine', 0.05);
                      }}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  {/* Wallpapers Selection */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">Papéis de Parede do Sistema</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {wallpapers.map((wp, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setWallpaperIndex(idx);
                            playTone(750, 'sine', 0.05);
                          }}
                          className={`relative aspect-[9/15] rounded-xl overflow-hidden border-2 transition-transform active:scale-95 shadow-sm ${
                            currentWallpaperIndex === idx ? 'border-blue-600 scale-[0.97]' : 'border-transparent opacity-85 hover:opacity-100'
                          }`}
                          style={{ background: wp.gradient }}
                        >
                          <div className="absolute inset-0 flex items-end justify-center pb-1 text-[8px] font-bold text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                            <span className="truncate max-w-[90%] px-1">{wp.name}</span>
                          </div>
                          {currentWallpaperIndex === idx && (
                            <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5 text-white">
                              <Check size={8} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 8: BATTERY SETTINGS & CONTROLS */}
              {currentPanel === 'bateria' && (
                <div className="space-y-4">
                  
                  {/* Status Card */}
                  <div className={`p-5 rounded-2.5xl shadow-sm text-center space-y-3.5 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">Energia Atual</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        useManualBattery ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {useManualBattery ? 'Simulação' : 'Bateria Real'}
                      </span>
                    </div>

                    {/* Massive Graphic Charge Battery Meter */}
                    <div className="relative inline-flex flex-col items-center justify-center p-3">
                      <div className="text-4xl font-black font-mono tracking-tight text-blue-600">
                        {simulatedLevel}%
                      </div>
                      <p className="text-[11px] opacity-55 font-semibold mt-1">
                        {simulatedCharging ? "Carregando (Simulado)" : "Uso de Bateria saudável"}
                      </p>
                    </div>

                    {/* Sim Battery Graphics */}
                    <div className="w-40 h-8 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 mx-auto relative flex items-center overflow-hidden">
                      <div 
                        className={`h-full rounded-md transition-all duration-300 ${
                          simulatedLevel <= 20 
                            ? 'bg-red-500 animate-pulse' 
                            : simulatedCharging 
                              ? 'bg-green-500' 
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${simulatedLevel}%` }}
                      />
                      {simulatedCharging && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <BatteryCharging size={16} className="animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Simulator Toggles */}
                  <div className={`rounded-2.5xl overflow-hidden divide-y shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e] divide-white/5' : 'bg-white divide-slate-100'
                  }`}>
                    {/* Simulator Switch */}
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <span className="text-sm font-semibold block">Usar Simulador Manual</span>
                        <span className="text-[10px] opacity-50">Controlar energia para testes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useManualBattery}
                        onChange={(e) => {
                          setUseManualBattery(e.target.checked);
                          playTone(440, 'triangle', 0.05);
                        }}
                        className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                      />
                    </div>

                    {/* Charger State Toggle */}
                    {useManualBattery && (
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <span className="text-sm font-semibold block">Simular Cabo Conectado</span>
                          <span className="text-[10px] opacity-50">Ativa recarga automática gradual</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={simulatedCharging}
                          onChange={(e) => {
                            setSimulatedCharging(e.target.checked);
                            playTone(e.target.checked ? 880 : 330, 'sine', 0.1);
                          }}
                          className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-green-500 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Level Slider slider */}
                  {useManualBattery && (
                    <div className={`p-4 rounded-2.5xl shadow-sm space-y-3 ${
                      darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                    }`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-amber-500">Definir Nível da Carga</span>
                        <span className="font-bold font-mono text-[11px]">{simulatedLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={simulatedLevel}
                        onChange={(e) => setSimulatedLevel(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-amber-500/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  )}

                  {/* Simulated usage chart */}
                  <div className={`p-4 rounded-2.5xl shadow-sm space-y-3 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Uso nas últimas 24 Horas</h4>
                    <div className="h-20 flex items-end justify-between gap-1 pt-4">
                      {[70, 65, 60, 52, 45, 38, 55, 68, 75, 71, 62, 50, 41, 35, 29, 21, 60, 85, 95, 90, 84, 75, 66, 58].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500/10 hover:bg-blue-500 rounded-t-sm h-full flex items-end">
                          <div className="w-full bg-blue-500 rounded-t-sm transition-all" style={{ height: `${h}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] opacity-50 font-mono">
                      <span>00:00</span>
                      <span>12:00</span>
                      <span>24:00</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 9: PRIVACY & PERMISSIONS */}
              {currentPanel === 'privacidade' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Serviço de Localização (GPS)</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Permite apps determinarem as coordenadas</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={locationServices}
                      onChange={(e) => {
                        setLocationServices(e.target.checked);
                        playTone(500, 'sine', 0.05);
                      }}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">
                      Acesso de Permissões
                    </h3>
                    <div className={`rounded-2.5xl overflow-hidden divide-y shadow-sm text-xs font-medium ${
                      darkMode ? 'bg-[#1c1c1e] divide-white/5' : 'bg-white divide-slate-100'
                    }`}>
                      {[
                        { name: 'Câmera do Dispositivo', status: 'Sempre Permitir' },
                        { name: 'Microfone e Gravador', status: 'Perguntar ao usar' },
                        { name: 'Galeria de fotos', status: 'Acesso Completo' },
                        { name: 'Contatos locais', status: 'Bloqueado' }
                      ].map((perm) => (
                        <div key={perm.name} className="flex justify-between p-3.5">
                          <span>{perm.name}</span>
                          <span className="opacity-60 font-semibold">{perm.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 10: SOUNDS & VOLUME & SYNTH */}
              {currentPanel === 'som' && (
                <div className="space-y-4">
                  
                  {/* Volume System Slider */}
                  <div className={`p-4 rounded-2.5xl shadow-sm space-y-3 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Volume2 size={15} className="text-blue-500" /> Volume do Sistema
                      </span>
                      <span className="font-bold font-mono text-[11px]">{volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Ringtone selection playing custom synthesizers */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">
                      Sons & Toques (Toque para ouvir)
                    </h3>
                    
                    <div className={`rounded-2.5xl overflow-hidden divide-y shadow-sm ${
                      darkMode ? 'bg-[#1c1c1e] divide-white/5' : 'bg-white divide-slate-100'
                    }`}>
                      {[
                        { id: 'marimba', label: 'Marimba OS (Futurista)', desc: 'Sequência alegre senoidal' },
                        { id: 'classic', label: 'Classic Chimes (Clássico)', desc: 'Notas musicais suaves' },
                        { id: 'synth', label: 'Digital Synth (Tecnológico)', desc: 'Onda dente-de-serra espacial' },
                        { id: 'bell', label: 'Triangle Bell (Sino)', desc: 'Timbre cristalino relaxante' }
                      ].map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => {
                            setSelectedRingtone(tone.id);
                            playRingtone(tone.id);
                          }}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors"
                        >
                          <div>
                            <span className={`text-sm ${selectedRingtone === tone.id ? "font-bold text-blue-500" : "font-semibold"}`}>
                              {tone.label}
                            </span>
                            <p className="text-[10px] opacity-50 mt-0.5">{tone.desc}</p>
                          </div>
                          {selectedRingtone === tone.id && (
                            <Play size={14} className="text-blue-500 fill-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 11: INSTALLED APPLICATIONS DETAILS */}
              {currentPanel === 'apps' && (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">
                      Armazenamento de Aplicativos
                    </h3>
                    
                    <div className={`rounded-2.5xl overflow-hidden divide-y shadow-sm ${
                      darkMode ? 'bg-[#1c1c1e] divide-white/5' : 'bg-white divide-slate-100'
                    }`}>
                      {[
                        { id: 'navegador', name: 'Navegador Web', version: 'v1.4.2', size: '22 MB', isCore: true },
                        { id: 'mensagens', name: 'Mensagens Chat', version: 'v2.1.0', size: '12 MB', isCore: true },
                        { id: 'musica', name: 'Música Player', version: 'v1.0.8', size: '36 MB', isCore: true },
                        { id: 'arquivos', name: 'Arquivos Local', version: 'v1.1.5', size: '8 MB', isCore: true },
                        { id: 'galeria', name: 'Minha Galeria', version: 'v1.0.0', size: '18 MB', isCore: true },
                        { id: 'calculadora', name: 'Calculadora OS', version: 'v1.2.0', size: '3 MB', isCore: true },
                        { id: 'configuracoes', name: 'Configurações', version: 'v1.0.4', size: '5 MB', isCore: true },
                        { id: 'loja', name: 'App Store', version: 'v1.5.0', size: '10 MB', isCore: true },
                        { id: 'notas', name: 'Bloco de Notas', version: 'v1.1.0', size: '4 MB', isCore: false },
                        { id: 'flappy', name: 'Flappy Bird', version: 'v1.3.0', size: '9 MB', isCore: false },
                        { id: 'clima', name: 'Previsão do Tempo', version: 'v1.2.1', size: '6 MB', isCore: false },
                        { id: 'paint', name: 'Mini Paint', version: 'v1.0.5', size: '7 MB', isCore: false },
                      ].filter(app => installedApps.includes(app.id)).map((app) => (
                        <div key={app.id} className="p-3.5 flex justify-between items-center text-xs font-medium">
                          <div>
                            <span className="font-bold block">{app.name}</span>
                            <span className="opacity-50 text-[10px]">{app.version}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-500">{app.size}</span>
                            <button 
                              onClick={() => {
                                if (app.isCore) {
                                  playTone(120, 'triangle', 0.2, 0.05);
                                  alert(`Cache do aplicativo "${app.name}" limpo com sucesso!`);
                                } else {
                                  playTone(300, 'triangle', 0.1);
                                  const confirmed = window.confirm(`Deseja desinstalar o aplicativo "${app.name}"?`);
                                  if (confirmed) {
                                    onUninstall(app.id);
                                    playTone(220, 'triangle', 0.15);
                                  }
                                }
                              }}
                              className="p-1.5 hover:bg-red-500/10 text-red-500 hover:text-red-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                              title={app.isCore ? "Limpar Cache" : "Desinstalar"}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 12: ACCESSIBILITY */}
              {currentPanel === 'acessibilidade' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2.5xl flex items-center justify-between shadow-sm ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold">Filtro de Escala de Cinza</h3>
                      <p className="text-[11px] opacity-50 mt-0.5">Torna a tela preta e branca</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={grayscaleMode}
                      onChange={(e) => {
                        setGrayscaleMode(e.target.checked);
                        playTone(550, 'sine', 0.05);
                      }}
                      className="w-11 h-6 bg-slate-300 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative transition-all duration-200 focus:outline-none before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-all before:shadow-sm before:duration-200"
                    />
                  </div>

                  <div className={`p-4 rounded-2.5xl shadow-sm text-xs opacity-75 space-y-2.5 leading-relaxed ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <h4 className="font-bold text-sm">Acessibilidade Ativa</h4>
                    <p>O filtro de escala de cinza reduz a distração visual e ajuda usuários sensíveis ao contraste visual a usar o Mock OS com conforto.</p>
                  </div>
                </div>
              )}

              {/* PANEL 13: SOBRE (ABOUT DEVICE) */}
              {currentPanel === 'sobre' && (
                <div className="space-y-4">
                  <div className={`p-4.5 rounded-2.5xl shadow-sm space-y-3.5 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Smartphone size={24} className="text-purple-500" />
                      <div>
                        <h3 className="text-sm font-bold">Mock Phone 16 Pro</h3>
                        <p className="text-[10px] opacity-50">Projetado com React 19 & Tailwind v4</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/40 dark:border-white/5 pt-3 font-mono">
                      <div className="bg-black/10 dark:bg-black/35 p-2 rounded-lg">
                        <span className="opacity-50 block text-[9px] uppercase tracking-wide">Processador</span>
                        <span className="font-bold truncate block">Antigravity i5</span>
                      </div>
                      <div className="bg-black/10 dark:bg-black/35 p-2 rounded-lg">
                        <span className="opacity-50 block text-[9px] uppercase tracking-wide">Memória RAM</span>
                        <span className="font-bold truncate block">8 GB LPDDR5X</span>
                      </div>
                      <div className="bg-black/10 dark:bg-black/35 p-2 rounded-lg">
                        <span className="opacity-50 block text-[9px] uppercase tracking-wide">Armazenamento</span>
                        <span className="font-bold truncate block">128 GB UFS 4.0</span>
                      </div>
                      <div className="bg-black/10 dark:bg-black/35 p-2 rounded-lg">
                        <span className="opacity-50 block text-[9px] uppercase tracking-wide">S.O. Versão</span>
                        <span className="font-bold truncate block">v1.0.4 stable</span>
                      </div>
                    </div>
                  </div>

                  {/* Software update check */}
                  <div className={`p-4.5 rounded-2.5xl shadow-sm text-center space-y-3.5 ${
                    darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
                  }`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Atualizações de Software</h4>
                    <button
                      onClick={runUpdateCheck}
                      disabled={checkingUpdate}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <RefreshCw size={12} className={checkingUpdate ? "animate-spin" : ""} />
                      {checkingUpdate ? "Buscando atualizações..." : "Verificar Software"}
                    </button>
                    {updateMessage && (
                      <p className="text-[10px] text-green-500 font-bold mt-1 animate-pulse">
                        ✓ {updateMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
