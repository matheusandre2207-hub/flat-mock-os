import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Lock, RefreshCw, Delete } from 'lucide-react';
import ClockFace from './ClockFace';
import SwipeDismiss from './SwipeDismiss';
import { usePrefs } from '../prefs';

interface LockNotification {
  id: string;
  app: string;
  title: string;
  message: string;
  time: string;
}

interface LockScreenProps {
  language: 'pt' | 'en';
  userName: string;
  userAvatar: string;
  pincode: string;
  wallpaper?: { gradient: string; isAnimated?: boolean };
  notifications?: LockNotification[];
  onOpenApp?: (appId: string) => void;
  onDismissNotification?: (id: string) => void;
  renderAppIcon?: (appId: string) => React.ReactNode;
  appLabel?: (appId: string) => string;
  onUnlock: () => void;
  onReset: () => void;
  onSignOut?: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Tela de bloqueio: a camada inteira sobe ao arrastar para cima, revelando a tela
 * de início desfocada por baixo. Com senha, deslizar abre o teclado (nunca desbloqueia direto).
 */
export default function LockScreen({
  language,
  userName,
  userAvatar,
  pincode,
  wallpaper,
  notifications,
  onOpenApp,
  onDismissNotification,
  renderAppIcon,
  appLabel,
  onUnlock,
  onReset,
  onSignOut,
}: LockScreenProps) {
  const { prefs: lockPrefs } = usePrefs();
  const lockPos = lockPrefs.lock.pos;
  const [showKeypad, setShowKeypad] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);
  const [timeStr, setTimeStr] = useState('00:00');
  const [dateStr, setDateStr] = useState('');
  const [pendingApp, setPendingApp] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const controls = useAnimation();
  const leavingRef = useRef(false);
  const draggedRef = useRef(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      setDateStr(
        language === 'en'
          ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
          : now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // A dica de deslizar some sozinha depois de um tempo
  useEffect(() => {
    const t = window.setTimeout(() => setHintVisible(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

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
    } catch {
      // som indisponível
    }
  };

  // Sobe a tela inteira e só então entrega o controle ao sistema
  const leave = async (targetApp?: string) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setHintVisible(false);
    await controls.start({ y: -(window.innerHeight + 60) }, { duration: 0.55, ease: EASE }).catch(() => {});
    if (targetApp && onOpenApp) onOpenApp(targetApp);
    else onUnlock();
  };

  const snapBack = () => {
    controls.start({ y: 0 }, { type: 'spring', stiffness: 460, damping: 40 });
  };

  const openFromNotification = (app: string) => {
    if (pincode) {
      setPendingApp(app);
      setShowKeypad(true);
    } else {
      leave(app);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pinInput.length >= 4) return;
    const nextPin = pinInput + num;
    setPinInput(nextPin);
    playTone(500 + parseInt(num, 10) * 15, 0.06);
    if (nextPin.length === 4) {
      if (nextPin === pincode) {
        playTone(800, 0.12);
        leave(pendingApp ?? undefined);
      } else {
        playTone(200, 0.2);
        setIsWiggling(true);
        setTimeout(() => {
          setIsWiggling(false);
          setPinInput('');
        }, 400);
      }
    }
  };

  const handleDelete = () => {
    if (pinInput.length > 0) {
      setPinInput(prev => prev.slice(0, -1));
      playTone(400, 0.06);
    }
  };

  const hintText = pincode
    ? (language === 'en' ? 'Swipe up or tap for passcode' : 'Deslize para cima ou toque para a senha')
    : (language === 'en' ? 'Swipe up to unlock' : 'Deslize para cima para desbloquear');

  return (
    <motion.div
      className="absolute inset-0 z-[9999] flex flex-col justify-between p-6 select-none text-white font-sans overflow-hidden bg-zinc-950"
      animate={controls}
      drag={showKeypad ? false : 'y'}
      dragMomentum={false}
      dragConstraints={{ top: -window.innerHeight, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0.08 }}
      onDragStart={() => {
        draggedRef.current = true;
        setHintVisible(false);
      }}
      onDragEnd={(_, info) => {
        window.setTimeout(() => { draggedRef.current = false; }, 0);
        const up = info.offset.y < -110 || info.velocity.y < -550;
        if (!up) {
          snapBack();
        } else if (pincode) {
          setShowKeypad(true);
          snapBack();
        } else {
          leave();
        }
      }}
      onClick={() => {
        if (draggedRef.current) return;
        if (!showKeypad && pincode) setShowKeypad(true);
      }}
    >
      {wallpaper && (
        <div className="absolute inset-0 z-0 bg-center bg-cover" style={{ background: wallpaper.gradient }} />
      )}
      <div className="absolute inset-0 z-[1] bg-black/45" />

      {/* Indicador superior */}
      <div className="w-full flex justify-center mt-4 z-10">
        <div className="flex items-center gap-1.5 bg-white/10 py-1.5 px-3.5 rounded-full border border-white/15 text-[11px] font-medium text-white/80">
          <Lock size={11} className="text-sky-300" />
          <span>{language === 'en' ? 'Locked' : 'Bloqueado'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showKeypad ? (
          <motion.div
            key="lock-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-between w-full py-6 z-10"
          >
            <div
              className="flex flex-col flex-1 w-full text-center"
              style={{ justifyContent: lockPos === 'top' ? 'flex-start' : lockPos === 'center' ? 'center' : 'flex-end' }}
            >
              <ClockFace scope="lock" time={timeStr} date={dateStr} />

              {notifications && notifications.length > 0 && (
                <div className="w-full max-w-[320px] mx-auto mt-7 flex flex-col gap-2.5 max-h-[260px] overflow-y-auto no-scrollbar">
                  {notifications.slice(0, 3).map((notif) => (
                    <SwipeDismiss
                      key={notif.id}
                      className="w-full"
                      onTap={() => openFromNotification(notif.app)}
                      onDismiss={() => onDismissNotification?.(notif.id)}
                    >
                      <div className="flex items-start gap-3 w-full rounded-[22px] bg-white/12 backdrop-blur-xl border border-white/15 p-3.5 text-left">
                        <div className="shrink-0">{renderAppIcon?.(notif.app)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-white/65">
                            <span className="font-semibold truncate">{appLabel?.(notif.app) ?? notif.app}</span>
                            <time className="font-mono shrink-0">{notif.time}</time>
                          </div>
                          <div className="mt-0.5 text-[13px] font-semibold text-white truncate">{notif.title}</div>
                          <div className="text-[12px] text-white/75 line-clamp-2 leading-snug">{notif.message}</div>
                        </div>
                      </div>
                    </SwipeDismiss>
                  ))}
                </div>
              )}
            </div>

            {/* Indicativo de deslizar: uma barra que respira, com legenda; some sozinho */}
            <div className="flex flex-col items-center gap-4 min-h-[64px] justify-end">
              <AnimatePresence>
                {hintVisible && (
                  <motion.div
                    key="swipe-hint"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex flex-col items-center gap-3 pointer-events-none"
                  >
                    <motion.div
                      className="w-12 h-1.5 rounded-full bg-white/85"
                      animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.82, 1, 0.82] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className="text-[12px] font-medium tracking-wide text-white/75">{hintText}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {onSignOut && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSignOut(); }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/45 hover:text-white/80 py-1.5 px-3 rounded-full"
              >
                {language === 'en' ? 'Sign out of account' : 'Sair da conta'}
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="lock-pin"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-[280px] mx-auto my-auto z-10 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-6 text-center">
              <span className="text-3xl mb-1.5">{userAvatar}</span>
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-[11px] font-mono text-white/70 mt-1">
                {language === 'en' ? 'Enter Passcode' : 'Digite a senha de 4 dígitos'}
              </p>
            </div>

            <div className={`flex justify-center gap-4 mb-8 ${isWiggling ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
              {[0, 1, 2, 3].map((dotIdx) => {
                const filled = pinInput.length > dotIdx;
                return (
                  <div
                    key={dotIdx}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${filled ? 'bg-white scale-110' : 'border border-white/40 bg-white/10'}`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-y-4 gap-x-6 mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 border border-white/20 text-white text-2xl font-light flex items-center justify-center transition-all cursor-pointer active:scale-95 mx-auto select-none"
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
                className="w-16 h-16 rounded-full hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer mx-auto"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 border border-white/20 text-white text-2xl font-light flex items-center justify-center transition-all cursor-pointer active:scale-95 mx-auto select-none"
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

            <button
              onClick={() => {
                if (window.confirm(language === 'en'
                  ? 'Are you sure you want to completely reset the system? This will clear all settings.'
                  : 'Tem certeza que deseja restaurar as configurações de fábrica do celular? Isso reiniciará o aparelho.')) {
                  onReset();
                }
              }}
              className="text-[11px] font-mono text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer py-2 px-4 rounded-full hover:bg-white/5 max-w-max mx-auto mt-2"
            >
              <RefreshCw size={10} />
              <span>{language === 'en' ? 'Forgot PIN? Reset' : 'Esqueceu a senha? Resetar'}</span>
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
    </motion.div>
  );
}
