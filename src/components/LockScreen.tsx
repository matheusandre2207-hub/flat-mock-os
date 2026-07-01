import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowUp, RefreshCw, Delete } from 'lucide-react';

interface LockScreenProps {
  language: 'pt' | 'en';
  userName: string;
  userAvatar: string;
  pincode: string;
  wallpaper?: { gradient: string; isAnimated?: boolean };
  notifications?: Array<{
    id: string;
    app: string;
    title: string;
    message: string;
    time: string;
  }>;
  onOpenApp?: (appId: string) => void;
  onUnlock: () => void;
  onReset: () => void;
}

export default function LockScreen({
  language,
  userName,
  userAvatar,
  pincode,
  wallpaper,
  notifications,
  onOpenApp,
  onUnlock,
  onReset
}: LockScreenProps) {
  
  const [showKeypad, setShowKeypad] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);
  const [timeStr, setTimeStr] = useState('00:00');
  const [dateStr, setDateStr] = useState('');
  const [pendingApp, setPendingApp] = useState<string | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
      
      if (language === 'en') {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        setDateStr(now.toLocaleDateString('en-US', options));
      } else {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        setDateStr(now.toLocaleDateString('pt-BR', options));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

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

  const handleUnlockAttempt = (targetApp?: string) => {
    if (targetApp) {
      setPendingApp(targetApp);
    }
    if (!pincode) {
      playTone(600, 0.1);
      if (targetApp && onOpenApp) {
        onOpenApp(targetApp);
      } else {
        onUnlock();
      }
    } else {
      setShowKeypad(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const diffY = touchStartY - e.changedTouches[0].clientY;
      if (diffY > 40) {
        handleUnlockAttempt();
      }
      setTouchStartY(null);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      playTone(500 + (parseInt(num) * 15), 0.06);

      if (nextPin.length === 4) {
        if (nextPin === pincode) {
          playTone(800, 0.12);
          if (pendingApp && onOpenApp) {
            onOpenApp(pendingApp);
          } else {
            onUnlock();
          }
        } else {
          playTone(200, 0.2);
          setIsWiggling(true);
          setTimeout(() => {
            setIsWiggling(false);
            setPinInput('');
          }, 400);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pinInput.length > 0) {
      setPinInput(prev => prev.slice(0, -1));
      playTone(400, 0.06);
    }
  };

  return (
    <div 
      className="absolute inset-0 z-[9999] flex flex-col justify-between p-6 select-none text-white font-sans overflow-hidden bg-zinc-950"
      onClick={() => { if (!showKeypad) handleUnlockAttempt(); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background wallpaper if set */}
      {wallpaper && (
        <div 
          className="absolute inset-0 z-0 bg-center bg-cover transition-all duration-700 scale-105"
          style={{ background: wallpaper.gradient }}
        />
      )}
      <div className="absolute inset-0 z-[1] bg-black/45 backdrop-blur-[20px]" />

      {/* Top Lock Indicator */}
      <div className="w-full flex justify-center mt-4 z-10">
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md py-1.5 px-3.5 rounded-full border border-white/15 text-[10px] font-medium uppercase tracking-widest text-white/80 shadow-sm">
          <Lock size={11} className="text-sky-300" />
          <span>{language === 'en' ? 'Locked' : 'Bloqueado'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showKeypad ? (
          <motion.div 
            key="lock-main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-between w-full py-6 z-10"
          >
            {/* Clock, Date & Notifications */}
            <div className="flex flex-col items-center mt-4 text-center">
              <span className="text-7xl font-extralight tracking-tighter text-white font-mono drop-shadow-md">{timeStr}</span>
              <span className="text-xs font-semibold tracking-widest text-white/70 mt-1 uppercase drop-shadow">{dateStr}</span>

              {/* Lock Screen Notifications */}
              {notifications && notifications.length > 0 && (
                <div className="w-full max-w-[300px] mx-auto mt-6 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {notifications.slice(0, 3).map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockAttempt(notif.app);
                      }}
                      className="w-full bg-white/15 hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 flex flex-col gap-1 cursor-pointer text-left shadow-lg group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-white/80">
                        <span className="capitalize font-bold text-sky-300 group-hover:text-sky-200">{notif.app}</span>
                        <span className="text-[10px] text-white/60 font-mono">{notif.time}</span>
                      </div>
                      <div className="font-bold text-xs text-white leading-tight">{notif.title}</div>
                      <div className="text-[11px] text-white/80 line-clamp-2 leading-snug font-normal">{notif.message}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* Profile badge */}
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full max-w-max mx-auto shadow-md">
                <span className="text-base">{userAvatar}</span>
                <span className="text-xs font-medium text-white/90 truncate max-w-[120px]">{userName}</span>
              </div>

              {/* Bottom Swipe hint */}
              <div className="flex flex-col items-center gap-1.5 text-center animate-bounce cursor-pointer opacity-80">
                <ArrowUp size={16} className="text-white" />
                <span className="text-[10px] font-semibold tracking-widest uppercase text-white drop-shadow">
                  {pincode 
                    ? (language === 'en' ? 'Swipe up or tap for PIN' : 'Deslize para cima ou toque') 
                    : (language === 'en' ? 'Swipe up to unlock' : 'Deslize para Desbloquear')}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="lock-pin"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-[280px] mx-auto my-auto z-10 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile */}
            <div className="flex flex-col items-center mb-6 text-center">
              <span className="text-3xl mb-1.5 drop-shadow-md">{userAvatar}</span>
              <p className="text-sm font-semibold text-white tracking-wide">{userName}</p>
              <p className="text-[10px] font-mono text-white/70 uppercase tracking-wider mt-1">
                {language === 'en' ? 'Enter Passcode' : 'Digite a Senha de 4 Dígitos'}
              </p>
            </div>

            {/* PIN Dots */}
            <div className={`flex justify-center gap-4 mb-8 ${isWiggling ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
              {[0, 1, 2, 3].map((dotIdx) => {
                const filled = pinInput.length > dotIdx;
                return (
                  <div 
                    key={dotIdx} 
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      filled 
                        ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-110' 
                        : 'border border-white/40 bg-white/10'
                    }`} 
                  />
                );
              })}
            </div>

            {/* Numeric Grid with round centralized iOS/modern aesthetic */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-6 mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 border border-white/20 text-white text-2xl font-light font-sans flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 mx-auto backdrop-blur-md select-none"
                >
                  {num}
                </button>
              ))}
              
              <button
                onClick={() => {
                  setShowKeypad(false);
                  setPinInput('');
                  setPendingApp(null);
                  playTone(350);
                }}
                className="w-16 h-16 rounded-full hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer mx-auto uppercase tracking-wider"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 border border-white/20 text-white text-2xl font-light font-sans flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 mx-auto backdrop-blur-md select-none"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                className="w-16 h-16 rounded-full hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer mx-auto active:scale-95"
                title={language === 'en' ? 'Delete' : 'Apagar'}
              >
                <Delete size={22} />
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                if (window.confirm(language === 'en' 
                  ? 'Are you sure you want to completely reset the system? This will clear all settings.' 
                  : 'Tem certeza que deseja restaurar as configurações de fábrica do celular? Isso reiniciará o aparelho.')) {
                  onReset();
                }
              }}
              className="text-[10px] font-mono text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer py-2 px-4 rounded-full hover:bg-white/5 max-w-max mx-auto uppercase tracking-wider mt-2"
            >
              <RefreshCw size={10} />
              <span>{language === 'en' ? 'Forgot PIN? Reset' : 'Esqueceu a Senha? Resetar'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
