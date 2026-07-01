import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, User, Check, ChevronRight, ChevronLeft, 
  Lock, Unlock, Eye, EyeOff, Palette
} from 'lucide-react';
import { wallpapersList } from '../data';

interface BootSetupScreenProps {
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
  userName: string;
  setUserName: (name: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  pincode: string;
  setPincode: (pin: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  wallpaperIndex: number;
  setWallpaperIndex: (index: number) => void;
  isSetupCompleted: boolean;
  onComplete: () => void;
}

export default function BootSetupScreen({
  language, setLanguage,
  userName, setUserName,
  userAvatar, setUserAvatar,
  pincode, setPincode,
  darkMode, setDarkMode,
  wallpaperIndex, setWallpaperIndex,
  isSetupCompleted,
  onComplete
}: BootSetupScreenProps) {
  
  const [step, setStep] = useState<'boot' | 'lang' | 'account' | 'prefs' | 'complete'>('boot');
  const [bootProgress, setBootProgress] = useState(0);
  const [ellipsis, setEllipsis] = useState('.');
  
  const [localName, setLocalName] = useState(userName || 'User');
  const [localAvatar, setLocalAvatar] = useState(userAvatar || '👤');
  const [localPin, setLocalPin] = useState(pincode || '');
  const [showPin, setShowPin] = useState(false);

  // Minimal set of sleek avatars
  const avatarList = ['👤', '🪐', '💻', '🎨', '🧠', '🌟', '☕', '🍿', '🦊', '🍀'];

  // Animate the dots
  useEffect(() => {
    if (step !== 'boot') return;
    const interval = setInterval(() => {
      setEllipsis(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 450);
    return () => clearInterval(interval);
  }, [step]);

  // Boot progress simulation
  useEffect(() => {
    if (step !== 'boot') return;
    
    const interval = setInterval(() => {
      setBootProgress(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 8;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (isSetupCompleted) {
              onComplete();
            } else {
              setStep('lang');
            }
          }, 850);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step, isSetupCompleted]);

  // Audio tone generator
  const playTone = (freq: number, duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  const handleNext = () => {
    playTone(600, 0.05);
    if (step === 'lang') {
      setStep('account');
    } else if (step === 'account') {
      setUserName(localName.trim() || 'User');
      setUserAvatar(localAvatar);
      setPincode(localPin);
      setStep('prefs');
    } else if (step === 'prefs') {
      setStep('complete');
    }
  };

  const handleBack = () => {
    playTone(450, 0.05);
    if (step === 'account') {
      setStep('lang');
    } else if (step === 'prefs') {
      setStep('account');
    } else if (step === 'complete') {
      setStep('prefs');
    }
  };

  const handleFinish = () => {
    playTone(700, 0.15);
    setUserName(localName.trim() || 'User');
    setUserAvatar(localAvatar);
    setPincode(localPin);
    
    localStorage.setItem('os_setup_completed', 'true');
    localStorage.setItem('os_language', language);
    localStorage.setItem('os_user_name', localName.trim() || 'User');
    localStorage.setItem('os_user_avatar', localAvatar);
    localStorage.setItem('os_pincode', localPin);
    
    onComplete();
  };

  return (
    <div className="absolute inset-0 z-[99999] flex flex-col items-center justify-center bg-zinc-950 font-sans text-zinc-100 overflow-hidden p-6 select-none">
      <AnimatePresence mode="wait">
        
        {/* ================= STEP 1: BOOT SEQUENCE ================= */}
        {step === 'boot' && (
          <motion.div 
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-sm flex flex-col items-center justify-center relative min-h-[350px]"
          >
            {/* Elegant Saturn Vector */}
            <motion.div 
              animate={{ 
                rotate: 360 
              }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="w-32 h-32 flex items-center justify-center mb-8"
            >
              <svg className="w-24 h-24 text-zinc-300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Back of ring */}
                <path d="M 16 54 C 16 43, 84 43, 84 54" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" strokeLinecap="round" />
                {/* Planet body */}
                <circle cx="50" cy="50" r="18" fill="#09090b" stroke="currentColor" strokeWidth="1.5" />
                {/* Front of ring */}
                <path d="M 10 50 C 10 63, 90 63, 90 50" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                {/* Small star / satellite indicator */}
                <circle cx="34" cy="32" r="1" fill="currentColor" opacity="0.7" />
              </svg>
            </motion.div>

            <h1 className="text-sm font-light tracking-[0.25em] text-zinc-400 font-mono mb-2">
              FlatOS
            </h1>

            <div className="flex items-center justify-center gap-1.5 h-6">
              <span className="text-[11px] text-zinc-600 font-mono tracking-wider">
                {language === 'en' ? 'Loading' : 'Carregando'}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono font-bold tracking-widest w-8 text-left">
                {ellipsis}
              </span>
            </div>

            <div className="absolute bottom-4 text-[10px] text-zinc-600 font-mono tracking-[0.18em] uppercase">
              Powered by FlatOS
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: LANGUAGE SELECTION ================= */}
        {step === 'lang' && (
          <motion.div 
            key="lang"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -15 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center mb-6 text-zinc-400">
              <Globe size={18} strokeWidth={1.5} />
            </div>

            <h2 className="text-lg font-medium tracking-tight text-zinc-200 mb-1">
              Select Language
            </h2>
            <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase mb-8">
              FlatOS / Setup
            </p>

            <div className="w-full flex flex-col gap-2.5 mb-10">
              <button
                onClick={() => {
                  setLanguage('pt');
                  playTone(400);
                }}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                  language === 'pt' 
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 font-medium' 
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">🇧🇷</span>
                  <span className="text-xs font-mono">Português</span>
                </div>
                {language === 'pt' && <Check size={14} className="text-zinc-300" />}
              </button>

              <button
                onClick={() => {
                  setLanguage('en');
                  playTone(400);
                }}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                  language === 'en' 
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 font-medium' 
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-xs font-mono">English</span>
                </div>
                {language === 'en' && <Check size={14} className="text-zinc-300" />}
              </button>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {language === 'en' ? 'Continue' : 'Continuar'}
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {/* ================= STEP 3: ACCOUNT CREATION ================= */}
        {step === 'account' && (
          <motion.div 
            key="account"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="w-full max-w-sm flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={handleBack}
                className="w-8 h-8 rounded-lg border border-zinc-900 flex items-center justify-center hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <div>
                <h2 className="text-sm font-medium text-zinc-200">
                  {language === 'en' ? 'Create Account' : 'Crie sua Conta'}
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">02 / 03</p>
              </div>
            </div>

            {/* Choose Avatar */}
            <div className="mb-6">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2.5 block">
                {language === 'en' ? 'Choose Avatar' : 'Escolha o Avatar'}
              </label>
              <div className="grid grid-cols-5 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                {avatarList.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setLocalAvatar(emoji);
                      playTone(550);
                    }}
                    className={`h-10 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                      localAvatar === emoji 
                        ? 'bg-zinc-800 text-white border border-zinc-600 scale-105' 
                        : 'bg-zinc-900/30 hover:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2 block">
                {language === 'en' ? 'Your Name' : 'Seu Nome'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder={language === 'en' ? 'Enter your name' : 'Digite seu nome'}
                  className="w-full py-2.5 pl-9 pr-4 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 placeholder-zinc-700 transition-all"
                />
              </div>
            </div>

            {/* Security Pin Input */}
            <div className="mb-8">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2 block">
                {language === 'en' ? '4-Digit PIN (Optional)' : 'PIN de 4 dígitos (Opcional)'}
              </label>
              <form onSubmit={(e) => { e.preventDefault(); if (localName.trim()) handleNext(); }} className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={localPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setLocalPin(val);
                    if (val.length > 0) playTone(650);
                  }}
                  placeholder="••••"
                  className="w-full py-2.5 px-4 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-mono text-zinc-100 tracking-widest focus:outline-none focus:border-zinc-700 placeholder-zinc-800 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                  {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </form>
            </div>

            <button
              onClick={handleNext}
              disabled={!localName.trim()}
              className={`w-full py-3 px-6 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                localName.trim() 
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950' 
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-900'
              }`}
            >
              {language === 'en' ? 'Next step' : 'Próximo passo'}
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {/* ================= STEP 4: PREFERENCES ================= */}
        {step === 'prefs' && (
          <motion.div 
            key="prefs"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="w-full max-w-sm flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={handleBack}
                className="w-8 h-8 rounded-lg border border-zinc-900 flex items-center justify-center hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <div>
                <h2 className="text-sm font-medium text-zinc-200">
                  {language === 'en' ? 'Personalize OS' : 'Personalizar Aparelho'}
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">03 / 03</p>
              </div>
            </div>

            {/* Theme selection */}
            <div className="mb-6">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2.5 block">
                {language === 'en' ? 'System Theme' : 'Tema do Sistema'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDarkMode(false);
                    playTone(440);
                  }}
                  className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    !darkMode 
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 font-medium' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                  }`}
                >
                  <span className="text-sm">☀️</span>
                  <span className="text-xs font-mono">{language === 'en' ? 'Light' : 'Claro'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDarkMode(true);
                    playTone(440);
                  }}
                  className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    darkMode 
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 font-medium' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                  }`}
                >
                  <span className="text-sm">🌙</span>
                  <span className="text-xs font-mono">{language === 'en' ? 'Dark' : 'Escuro'}</span>
                </button>
              </div>
            </div>

            {/* Quick Wallpaper */}
            <div className="mb-8">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2.5 block">
                {language === 'en' ? 'Default Wallpaper' : 'Papel de Parede'}
              </label>
              <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                {wallpapersList.slice(0, 4).map((wp, idx) => (
                  <button
                    key={wp.name}
                    type="button"
                    onClick={() => {
                      setWallpaperIndex(idx);
                      playTone(500);
                    }}
                    className={`h-11 rounded-lg border relative overflow-hidden transition-all cursor-pointer active:scale-95 ${
                      wallpaperIndex === idx 
                        ? 'border-zinc-400' 
                        : 'border-transparent hover:border-zinc-800'
                    }`}
                    style={{ background: wp.gradient }}
                  >
                    {wallpaperIndex === idx && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {language === 'en' ? 'Continue' : 'Continuar'}
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {/* ================= STEP 5: COMPLETED ================= */}
        {step === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center mb-6 text-zinc-300">
              <Check size={18} strokeWidth={2} />
            </div>

            <h2 className="text-lg font-medium tracking-tight text-zinc-200 mb-1">
              {language === 'en' ? 'All Configured' : 'Tudo Pronto'}
            </h2>
            <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase mb-8">
              FlatOS / Active
            </p>

            {/* Minimalist Summary Card */}
            <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 mb-8 text-left flex flex-col gap-3 font-mono text-[11px] text-zinc-400">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span>{language === 'en' ? 'USER PROFILE' : 'PERFIL'}</span>
                <span className="text-zinc-200">{localAvatar} {localName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span>{language === 'en' ? 'THEME' : 'TEMA'}</span>
                <span className="text-zinc-200">{darkMode ? 'DARK' : 'LIGHT'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{language === 'en' ? 'SECURITY' : 'SEGURANÇA'}</span>
                <span className="text-zinc-200">{localPin ? 'PIN_LOCKED' : 'SLIDE_TO_UNLOCK'}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {language === 'en' ? 'Start FlatOS' : 'Iniciar FlatOS'}
              <Check size={14} strokeWidth={3} />
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
