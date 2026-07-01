import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowUp, RefreshCw, Delete } from 'lucide-react';

interface LockScreenProps {
  language: 'pt' | 'en';
  userName: string;
  userAvatar: string;
  pincode: string;
  onUnlock: () => void;
  onReset: () => void;
}

export default function LockScreen({
  language,
  userName,
  userAvatar,
  pincode,
  onUnlock,
  onReset
}: LockScreenProps) {
  
  const [showKeypad, setShowKeypad] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);
  const [timeStr, setTimeStr] = useState('00:00');
  const [dateStr, setDateStr] = useState('');

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

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      playTone(500 + (parseInt(num) * 15), 0.06);

      if (nextPin.length === 4) {
        if (nextPin === pincode) {
          playTone(800, 0.12);
          onUnlock();
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

  const handleScreenClick = () => {
    if (!pincode) {
      playTone(600, 0.1);
      onUnlock();
    } else {
      setShowKeypad(true);
    }
  };

  return (
    <div 
      className="absolute inset-0 z-[9999] flex flex-col justify-between p-6 select-none text-zinc-100 font-sans overflow-hidden bg-zinc-950/80 backdrop-blur-[15px]"
      onClick={() => { if (!showKeypad) handleScreenClick(); }}
    >
      {/* Top Lock Indicator */}
      <div className="w-full flex justify-center mt-3">
        <div className="flex items-center gap-1.5 bg-zinc-900/60 backdrop-blur-md py-1.5 px-3 rounded-full border border-zinc-800 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
          <Lock size={10} className="text-zinc-500" />
          <span>{language === 'en' ? 'Locked' : 'Bloqueado'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showKeypad ? (
          <motion.div 
            key="lock-main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col justify-between w-full py-10"
          >
            {/* Clock & Date */}
            <div className="flex flex-col items-center mt-6 text-center cursor-pointer">
              <span className="text-6xl font-light tracking-tighter text-zinc-100 font-mono">{timeStr}</span>
              <span className="text-xs font-mono tracking-wider text-zinc-500 mt-2 uppercase">{dateStr}</span>
            </div>

            {/* Profile badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/30 border border-zinc-900/80 rounded-xl max-w-max mx-auto">
              <span className="text-sm">{userAvatar}</span>
              <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[100px]">{userName}</span>
            </div>

            {/* Bottom Swipe hint */}
            <div className="flex flex-col items-center gap-1.5 text-center animate-pulse cursor-pointer">
              <ArrowUp size={14} className="text-zinc-600" />
              <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-500">
                {pincode 
                  ? (language === 'en' ? 'Tap to Enter PIN' : 'Toque para digitar PIN') 
                  : (language === 'en' ? 'Tap to Unlock' : 'Toque para Desbloquear')}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="lock-pin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-1 flex flex-col justify-end w-full max-w-[260px] mx-auto pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile */}
            <div className="flex flex-col items-center mb-6 text-center">
              <span className="text-2xl mb-1.5">{userAvatar}</span>
              <p className="text-xs font-mono text-zinc-400">{userName}</p>
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mt-1">
                {language === 'en' ? 'Enter Passcode' : 'Insira o PIN'}
              </p>
            </div>

            {/* PIN Dots */}
            <div className={`flex justify-center gap-4 mb-8 ${isWiggling ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
              {[0, 1, 2, 3].map((dotIdx) => {
                const filled = pinInput.length > dotIdx;
                return (
                  <div 
                    key={dotIdx} 
                    className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 ${
                      filled 
                        ? 'bg-zinc-200 border-zinc-200 scale-105' 
                        : 'border-zinc-800 bg-transparent'
                    }`} 
                  />
                );
              })}
            </div>

            {/* Numeric Grid with flat minimalist aesthetic */}
            <div className="grid grid-cols-3 gap-y-3.5 gap-x-6 mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="w-14 h-14 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 text-zinc-300 text-lg font-mono flex items-center justify-center transition-all cursor-pointer mx-auto"
                >
                  {num}
                </button>
              ))}
              
              <button
                onClick={() => {
                  setShowKeypad(false);
                  setPinInput('');
                  playTone(350);
                }}
                className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center cursor-pointer"
              >
                {language === 'en' ? 'Back' : 'Voltar'}
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                className="w-14 h-14 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 text-zinc-300 text-lg font-mono flex items-center justify-center transition-all cursor-pointer mx-auto"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                className="w-14 h-14 rounded-xl hover:bg-zinc-900/50 text-zinc-500 flex items-center justify-center transition-all cursor-pointer mx-auto"
                title={language === 'en' ? 'Delete' : 'Apagar'}
              >
                <Delete size={16} />
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
              className="text-[9px] font-mono text-zinc-700 hover:text-zinc-500 transition-colors flex items-center justify-center gap-1 cursor-pointer py-1 max-w-max mx-auto uppercase tracking-wider"
            >
              <RefreshCw size={8} />
              <span>{language === 'en' ? 'Forgot PIN? Reset' : 'Esqueceu o PIN? Resetar'}</span>
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
