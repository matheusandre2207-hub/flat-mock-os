import React from 'react';
import { CloudSun, Battery, CalendarDays, Music, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { WSIZE } from '../homeGrid';

export const WIDGETS: Record<string, { w: number; h: number; label: string; icon: React.ReactNode }> = {
  calendario: { ...WSIZE.calendario, label: 'Calendário', icon: <CalendarDays size={18} /> },
  clima: { ...WSIZE.clima, label: 'Clima', icon: <CloudSun size={18} /> },
  bateria: { ...WSIZE.bateria, label: 'Bateria', icon: <Battery size={18} /> },
  musica: { ...WSIZE.musica, label: 'Música', icon: <Music size={18} /> }
};

interface Props {
  type: string;
  batteryLevel: number;
  isCharging: boolean;
  track: { title: string; artist: string };
  playing: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  onOpen: (id: string) => void;
}

export function WidgetView({ type, batteryLevel, isCharging, track, playing, onPrev, onToggle, onNext, onOpen }: Props) {
  if (type === 'calendario') {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    const wk = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    return (
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex items-baseline justify-between text-[12px] font-medium opacity-80">
          <span className="capitalize">{wk}</span>
          <span className="capitalize">{now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] gap-y-1">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="opacity-50">{'DSTQQSS'[i]}</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-medium ${d.getDate() === now.getDate() ? 'bg-blue-600 text-white' : ''}`}>{d.getDate()}</span>
            </div>
          ))}
        </div>
        <div className="text-[56px] leading-none font-light tracking-tight tabular-nums">{now.getDate()}</div>
      </div>
    );
  }
  if (type === 'clima') {
    return (
      <button type="button" className="w-full h-full flex items-center gap-3 text-left" onClick={() => onOpen('clima')}>
        <CloudSun size={34} strokeWidth={1.6} />
        <div className="min-w-0">
          <div className="text-[28px] leading-none font-light">24°</div>
          <div className="text-[12px] font-medium mt-1">Ensolarado</div>
          <div className="text-[11px] opacity-60">Máx 27° · Mín 18°</div>
        </div>
      </button>
    );
  }
  if (type === 'bateria') {
    const r = 22, circ = 2 * Math.PI * r;
    return (
      <div className="w-full h-full flex items-center gap-3">
        <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 -rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
          <circle cx="28" cy="28" r={r} fill="none" stroke={batteryLevel <= 20 && !isCharging ? '#E5484D' : isCharging ? '#30A46C' : '#fff'} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - batteryLevel / 100)} style={{ transition: 'stroke-dashoffset .6s' }} />
        </svg>
        <div>
          <div className="text-[26px] leading-none font-light tabular-nums">{Math.round(batteryLevel)}%</div>
          <div className="text-[12px] opacity-65 mt-1">{isCharging ? 'Carregando' : 'Bateria'}</div>
        </div>
      </div>
    );
  }
  if (type === 'musica') {
    return (
      <div className="w-full h-full flex items-center gap-3">
        <button type="button" onClick={() => onOpen('musica')} className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shrink-0"><Music size={24} /></button>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[14px] font-semibold truncate">{track.title}</div>
          <div className="text-[12px] opacity-65 truncate">{track.artist}</div>
        </div>
        <div className="flex items-center">
          <button type="button" className="icon-btn" style={{ color: '#fff' }} onClick={onPrev}><SkipBack size={16} /></button>
          <button type="button" className="icon-btn solid" style={{ background: '#fff', color: '#000' }} onClick={onToggle}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
          <button type="button" className="icon-btn" style={{ color: '#fff' }} onClick={onNext}><SkipForward size={16} /></button>
        </div>
      </div>
    );
  }
  return null;
}
