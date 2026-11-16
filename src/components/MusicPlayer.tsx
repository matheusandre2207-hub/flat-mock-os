import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Music, ListMusic, Plus, Trash2 } from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerProps {
  tracks: Track[];
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (n: number) => void;
  volume: number;
  setVolume: (n: number) => void;
  darkMode: boolean;
  /** Player de áudio real (só na instância principal). Sem ele, a faixa importada fica parada. */
  audio?: HTMLAudioElement | null;
  onImport?: (files: FileList) => void;
  onDeleteTrack?: (mediaId: string) => void;
  importing?: string;
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function MusicPlayer({
  tracks, isPlaying, setIsPlaying, currentTrackIndex, setCurrentTrackIndex, volume, setVolume, darkMode,
  audio = null, onImport, onDeleteTrack, importing,
}: MusicPlayerProps) {
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = tracks[currentTrackIndex] || tracks[0];
  const real = !!active.mediaId;
  const live = real && !!audio;

  const next = () => {
    if (tracks.length < 2) return;
    if (shuffle) {
      let r = currentTrackIndex;
      while (r === currentTrackIndex) r = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(r);
    } else setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
  };
  const prev = () => {
    if (cur > 3) { if (live && audio) audio.currentTime = 0; setCur(0); }
    else setCurrentTrackIndex(currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1);
  };

  // Faixas de demonstração: relógio simulado
  useEffect(() => {
    setCur(0);
    setDur(active.durationSec);
    if (real || !isPlaying) return;
    const iv = setInterval(() => setCur(p => {
      if (p + 1 >= active.durationSec) { if (repeat) return 0; next(); return 0; }
      return p + 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [currentTrackIndex, isPlaying, repeat, shuffle, real]); // eslint-disable-line react-hooks/exhaustive-deps

  // Faixas importadas: áudio de verdade
  useEffect(() => {
    if (!live || !audio) return;
    const onT = () => setCur(audio.currentTime);
    const onM = () => { if (Number.isFinite(audio.duration)) setDur(audio.duration); };
    const onEnd = () => { if (repeat) { audio.currentTime = 0; audio.play().catch(() => {}); } else next(); };
    audio.addEventListener('timeupdate', onT);
    audio.addEventListener('loadedmetadata', onM);
    audio.addEventListener('ended', onEnd);
    onT(); onM();
    return () => {
      audio.removeEventListener('timeupdate', onT);
      audio.removeEventListener('loadedmetadata', onM);
      audio.removeEventListener('ended', onEnd);
    };
  }, [live, audio, currentTrackIndex, repeat, shuffle, tracks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const seek = (v: number) => {
    setCur(v);
    if (live && audio) audio.currentTime = v;
  };

  const shell = darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  const card = darkMode ? 'bg-white/5' : 'bg-white shadow-sm';
  const total = Math.max(1, Math.round(dur || active.durationSec));

  return (
    <div className={`h-full overflow-y-auto no-scrollbar pb-24 ${shell}`}>
      <div className="px-6 pt-4 flex flex-col items-center gap-5">
        {/* Capa */}
        <div className="relative w-56 h-56">
          <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${active.color} opacity-60 blur-2xl`} />
          <div className={`relative w-full h-full rounded-[2rem] bg-gradient-to-br ${active.color} flex items-center justify-center text-white shadow-xl transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-95'}`}>
            <Music size={64} strokeWidth={1.4} className="opacity-90" />
          </div>
        </div>

        <div className="text-center w-full">
          <h3 className="font-semibold text-xl tracking-tight truncate">{active.title}</h3>
          <p className="text-sm opacity-60 truncate mt-0.5">{active.artist}</p>
        </div>

        {/* Barras */}
        <div className="h-8 flex items-end justify-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((_, i) => (
            <div key={i} className={`w-1 rounded-full bg-blue-600 ${isPlaying ? `audio-bar-${(i % 5) + 1}` : 'h-1.5 opacity-30'}`} />
          ))}
        </div>

        {/* Progresso */}
        <div className="w-full space-y-1">
          <input type="range" min={0} max={total} step={1} value={Math.min(Math.floor(cur), total)}
            onChange={e => seek(parseInt(e.target.value))} aria-label="Progresso"
            className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-300 dark:bg-slate-800" />
          <div className="flex justify-between text-[11px] font-mono opacity-50"><span>{fmt(cur)}</span><span>{fmt(total)}</span></div>
        </div>

        {/* Controles */}
        <div className="w-full flex items-center justify-between px-2">
          <button onClick={() => setShuffle(!shuffle)} className={`p-2 ${shuffle ? 'text-blue-500' : 'opacity-40'}`} aria-label="Embaralhar"><Shuffle size={18} /></button>
          <button onClick={prev} className="p-2 active:scale-90 transition-transform" aria-label="Anterior"><SkipBack size={24} fill="currentColor" /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center active:scale-95 transition-transform shadow-lg" aria-label={isPlaying ? 'Pausar' : 'Tocar'}>
            {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={next} className="p-2 active:scale-90 transition-transform" aria-label="Próxima"><SkipForward size={24} fill="currentColor" /></button>
          <button onClick={() => setRepeat(!repeat)} className={`p-2 ${repeat ? 'text-blue-500' : 'opacity-40'}`} aria-label="Repetir"><Repeat size={18} /></button>
        </div>

        <div className="flex items-center gap-2 opacity-70">
          <Volume2 size={14} />
          <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(parseInt(e.target.value))} aria-label="Volume"
            className="w-32 h-1 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-300 dark:bg-slate-800" />
        </div>
      </div>

      {/* Biblioteca */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold opacity-60 flex items-center gap-1.5"><ListMusic size={14} className="text-blue-500" /> Sua biblioteca · {tracks.length}</h4>
          {onImport && (
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-blue-600 text-white active:scale-95 transition-transform">
              <Plus size={13} /> Importar músicas
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="audio/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) onImport?.(e.target.files); e.target.value = ''; }} />
        {importing && <p className="text-xs text-blue-400 mb-2">{importing}</p>}
        <div className="space-y-1.5">
          {tracks.map((t, idx) => {
            const on = currentTrackIndex === idx;
            return (
              <div key={`${t.mediaId ?? t.title}-${idx}`} className={`flex items-center gap-1 rounded-2xl ${on ? 'bg-blue-600 text-white' : card}`}>
                <button onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }} className="flex-1 min-w-0 p-2.5 flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shrink-0`}>
                    {on && isPlaying ? <Volume2 size={16} /> : <Music size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{t.title}</p>
                    <p className="text-[11px] opacity-70 truncate">{t.artist}</p>
                  </div>
                  <span className="font-mono text-[11px] opacity-60">{t.duration}</span>
                </button>
                {t.mediaId && onDeleteTrack && (
                  <button onClick={() => onDeleteTrack(t.mediaId!)} className="p-2.5 opacity-60 hover:opacity-100" aria-label="Remover música"><Trash2 size={15} /></button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] opacity-40 mt-4 text-center">Dica: nomeie os arquivos como "Artista - Música.mp3" para preencher o artista.</p>
      </div>
    </div>
  );
}
