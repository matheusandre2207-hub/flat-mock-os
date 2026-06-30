import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Delete, Voicemail, Play, Volume2, Mic, Grid, HelpCircle, History, Video, Star } from 'lucide-react';

interface PhoneAppProps {
  darkMode: boolean;
  onOpenApp?: (appId: string) => void;
}

interface RecentCall {
  id: string;
  name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: string;
  number: string;
}

export default function PhoneApp({ darkMode, onOpenApp }: PhoneAppProps) {
  const [activeTab, setActiveTab] = useState<'keypad' | 'recents'>('keypad');
  const [dialNumber, setDialNumber] = useState('');
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [activeCallName, setActiveCallName] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [recents, setRecents] = useState<RecentCall[]>([
    { id: '1', name: 'Amor 💖', type: 'incoming', time: 'Ontem, 20:15', number: '(11) 99888-7766' },
    { id: '2', name: 'Vovó 👵', type: 'missed', time: 'Ontem, 16:30', number: '(11) 98765-4321' },
    { id: '3', name: 'Lucas 🤙', type: 'outgoing', time: 'Ontem, 14:10', number: '(11) 99111-2233' },
    { id: '4', name: 'Mãe ❤️', type: 'incoming', time: '2 dias atrás', number: '(11) 99222-3344' },
  ]);

  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Play a mock dual-tone multi-frequency (DTMF) sound or dialing beep
  const playDialBeep = (freq1: number, freq2: number = 0) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.frequency.value = freq1;
      osc1.connect(gainNode);
      
      let osc2;
      if (freq2 > 0) {
        osc2 = ctx.createOscillator();
        osc2.frequency.value = freq2;
        osc2.connect(gainNode);
      }

      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc1.start();
      if (osc2) osc2.start();

      osc1.stop(ctx.currentTime + 0.15);
      if (osc2) osc2.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext fails gracefully
    }
  };

  const handleKeyPress = (num: string) => {
    if (dialNumber.length < 15) {
      setDialNumber(prev => prev + num);
      // Play a standard keypad beep (e.g. frequency based on digits)
      const freqs: Record<string, number> = {
        '1': 697, '2': 770, '3': 852,
        '4': 1209, '5': 1336, '6': 1477,
        '7': 941, '8': 350, '9': 440,
        '*': 480, '0': 520, '#': 580
      };
      playDialBeep(freqs[num] || 440);
    }
  };

  const handleBackspace = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const startCall = (numberOrName: string) => {
    if (!numberOrName.trim()) return;
    setActiveCallName(numberOrName);
    setCallState('calling');
    
    // Simulate connection delay
    setTimeout(() => {
      setCallState('active');
    }, 2000);
  };

  const endCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      // Add to recents
      const newRecent: RecentCall = {
        id: String(Date.now()),
        name: activeCallName.includes('(') ? 'Número Desconhecido' : activeCallName,
        number: activeCallName.includes('(') ? activeCallName : 'Privado',
        type: 'outgoing',
        time: 'Agora'
      };
      setRecents(prev => [newRecent, ...prev]);
    }, 1000);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans select-none`}>
      {/* Active Call UI overlay */}
      {callState !== 'idle' && (
        <div className="absolute inset-0 z-50 bg-slate-900/98 backdrop-blur-xl flex flex-col justify-between py-16 px-6 text-white text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-4xl shadow-lg border border-white/10">
              👤
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{activeCallName}</h2>
              <p className="text-xs text-slate-400 font-medium">
                {callState === 'calling' && 'Ligando...'}
                {callState === 'active' && `Em chamada • ${formatDuration(callDuration)}`}
                {callState === 'ended' && 'Chamada encerrada'}
              </p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-3 gap-y-6 max-w-xs mx-auto w-full px-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex flex-col items-center gap-1.5 focus:outline-none bg-transparent border-none cursor-pointer ${isMuted ? 'text-blue-400' : 'text-white'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/15'}`}>
                <Mic size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Mudo</span>
            </button>

            <button 
              className="flex flex-col items-center gap-1.5 focus:outline-none opacity-40 bg-transparent border-none cursor-not-allowed"
              disabled
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10">
                <Grid size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Teclado</span>
            </button>

            <button 
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`flex flex-col items-center gap-1.5 focus:outline-none bg-transparent border-none cursor-pointer ${isSpeaker ? 'text-blue-400' : 'text-white'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSpeaker ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/15'}`}>
                <Volume2 size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Alto-falante</span>
            </button>
          </div>

          {/* End Call Button */}
          <div className="flex justify-center">
            <button 
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center border-none cursor-pointer text-white shadow-lg"
            >
              <PhoneOff size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content View (Dialer or Recents) */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar">
        {activeTab === 'keypad' ? (
          <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full">
            {/* Number Display */}
            <div className="h-24 flex flex-col items-center justify-center px-4 relative">
              <span className="text-3xl font-semibold tracking-wide font-mono truncate max-w-full">
                {dialNumber || <span className="text-slate-400 font-sans text-lg">Discar número</span>}
              </span>
              {dialNumber && (
                <button 
                  onClick={handleBackspace}
                  className="absolute right-2 p-2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  <Delete size={20} />
                </button>
              )}
            </div>

            {/* Dialpad Matrix */}
            <div className="grid grid-cols-3 gap-4 px-2">
              {[
                { n: '1', l: ' ' }, { n: '2', l: 'A B C' }, { n: '3', l: 'D E F' },
                { n: '4', l: 'G H I' }, { n: '5', l: 'J K L' }, { n: '6', l: 'M N O' },
                { n: '7', l: 'P Q R S' }, { n: '8', l: 'T U V' }, { n: '9', l: 'W X Y Z' },
                { n: '*', l: ' ' }, { n: '0', l: '+' }, { n: '#', l: ' ' }
              ].map(item => (
                <button
                  key={item.n}
                  onClick={() => handleKeyPress(item.n)}
                  className={`h-16 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:scale-95 border-none cursor-pointer ${
                    darkMode 
                      ? 'bg-slate-900/60 hover:bg-slate-800 text-white border border-white/5' 
                      : 'bg-white hover:bg-slate-100 text-slate-900 shadow-sm border border-slate-200'
                  }`}
                >
                  <span className="text-2xl font-semibold leading-none">{item.n}</span>
                  <span className={`text-[8px] font-bold tracking-wider uppercase mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.l}</span>
                </button>
              ))}
            </div>

            {/* Bottom Dialer Action Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => startCall(dialNumber)}
                disabled={!dialNumber}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border-none ${
                  dialNumber 
                    ? 'bg-green-500 hover:bg-green-600 active:scale-95 text-white cursor-pointer' 
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <Phone size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xl font-bold tracking-tight">Recentes</h2>
              <button 
                onClick={() => setRecents([])}
                className="text-xs text-blue-500 font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Limpar
              </button>
            </div>

            <div className="space-y-2">
              {recents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-1">
                  <p className="text-xs">Nenhum registro de chamada recente.</p>
                </div>
              ) : (
                recents.map(call => (
                  <div 
                    key={call.id} 
                    onClick={() => startCall(call.name)}
                    className={`p-3.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-900/40 hover:bg-slate-900/70 border border-white/5' : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
                        call.type === 'missed' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {call.type === 'missed' ? '✖' : call.type === 'incoming' ? '↙' : '↗'}
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${call.type === 'missed' ? 'text-red-500' : ''}`}>{call.name}</h4>
                        <p className="text-[10px] opacity-60 mt-0.5">{call.time} • {call.number}</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-500 flex items-center justify-center border-none cursor-pointer">
                      <Phone size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* App bottom tabs bar */}
      <footer className={`border-t flex justify-around py-3 ${darkMode ? 'border-white/5 bg-slate-950/60' : 'border-slate-200 bg-slate-100/80'}`}>
        <button 
          onClick={() => setActiveTab('keypad')}
          className={`flex flex-col items-center gap-1 focus:outline-none bg-transparent border-none cursor-pointer ${activeTab === 'keypad' ? 'text-green-500' : 'text-slate-400'}`}
        >
          <Grid size={18} />
          <span className="text-[9px] font-bold">Teclado</span>
        </button>
        <button 
          onClick={() => setActiveTab('recents')}
          className={`flex flex-col items-center gap-1 focus:outline-none bg-transparent border-none cursor-pointer ${activeTab === 'recents' ? 'text-green-500' : 'text-slate-400'}`}
        >
          <History size={18} />
          <span className="text-[9px] font-bold">Recentes</span>
        </button>
      </footer>
    </div>
  );
}
