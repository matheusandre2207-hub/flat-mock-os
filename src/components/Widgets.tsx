import React from 'react';
import { CloudSun, Battery, CalendarDays, Music, SkipBack, Play, Pause, SkipForward, Clock as ClockIcon } from 'lucide-react';
import { WSIZE, ClockCfg, DEFAULT_CLOCK } from '../homeGrid';

export const WIDGETS: Record<string, { w: number; h: number; label: string; icon: React.ReactNode }> = {
  calendario: { ...WSIZE.calendario, label: 'Calendário', icon: <CalendarDays size={18} /> },
  clima: { ...WSIZE.clima, label: 'Clima', icon: <CloudSun size={18} /> },
  bateria: { ...WSIZE.bateria, label: 'Bateria', icon: <Battery size={18} /> },
  musica: { ...WSIZE.musica, label: 'Música', icon: <Music size={18} /> },
  relogio: { ...WSIZE.relogio, label: 'Relógio', icon: <ClockIcon size={18} /> }
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
  time?: string;
  date?: string;
  cfg?: ClockCfg;
  size?: { w: number; h: number };
}

/** Relógio da tela inicial: estilo, tamanho, cor, fundo e alinhamento são do próprio widget. */
export function ClockWidget({ cfg, time, date, w, h }: { cfg: ClockCfg; time: string; date: string; w: number; h: number }) {
  const [hh, mm] = time.split(':');
  const color = cfg.color === 'auto' ? '#fff' : cfg.color;
  const ai = cfg.align === 'left' ? 'flex-start' : cfg.align === 'right' ? 'flex-end' : 'center';
  const big = h >= 3 ? 118 : h === 2 ? (w >= 4 ? 94 : 58) : (w >= 4 ? 58 : 38);
  const surface: React.CSSProperties =
    cfg.bg === 'glass' ? { background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)', border: '1px solid rgba(255,255,255,0.16)' }
    : cfg.bg === 'solid' ? { background: 'rgba(18,18,24,0.88)', border: '1px solid rgba(255,255,255,0.08)' } : {};
  const base: React.CSSProperties = {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: ai, justifyContent: 'center',
    color, textAlign: cfg.align, borderRadius: 26, padding: '4px 14px', overflow: 'hidden',
    textShadow: cfg.bg === 'none' ? '0 2px 18px rgba(0,0,0,0.32)' : 'none', ...surface,
  };
  const dateEl = cfg.date ? <span style={{ fontSize: Math.max(12, Math.round(big * 0.2)), opacity: 0.85, marginTop: 2, fontWeight: 500 }}>{date}</span> : null;
  const num: React.CSSProperties = { fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: cfg.weight };

  if (cfg.style === 'analog') {
    const H = parseInt(hh, 10) % 12, M = parseInt(mm, 10);
    const hd = H * 30 + M * 0.5, md = M * 6;
    const face = (
      <svg viewBox="0 0 100 100" style={{ height: h >= 2 ? '90%' : '94%', aspectRatio: '1', flex: 'none' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="50" y1="8" x2="50" y2={i % 3 === 0 ? 15 : 12} stroke="currentColor" strokeWidth={i % 3 === 0 ? 2.4 : 1.2} strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} opacity={i % 3 === 0 ? 1 : 0.6} />
        ))}
        <line x1="50" y1="50" x2="50" y2="28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hd} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${md} 50 50)`} />
        <circle cx="50" cy="50" r="2.6" fill="var(--accent, #3E63DD)" />
      </svg>
    );
    return (
      <div style={{ ...base, flexDirection: w >= 4 ? 'row' : 'column', justifyContent: 'center', gap: 14 }}>
        {face}
        {w >= 4 && cfg.date && <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.9, maxWidth: '45%' }}>{date}</span>}
      </div>
    );
  }
  if (cfg.style === 'stacked' && h >= 2) {
    return (
      <div style={base}>
        <span style={{ ...num, fontSize: Math.round(big * 0.82), lineHeight: 0.88 }}>{hh}</span>
        <span style={{ ...num, fontSize: Math.round(big * 0.82), lineHeight: 0.88 }}>{mm}</span>
        {dateEl}
      </div>
    );
  }
  if (cfg.style === 'minimal') {
    return (
      <div style={{ ...base, flexDirection: 'row', gap: 10, justifyContent: cfg.align === 'left' ? 'flex-start' : cfg.align === 'right' ? 'flex-end' : 'center', alignItems: 'baseline' }}>
        <span style={{ ...num, fontSize: Math.round(big * 0.6) }}>{time}</span>
        {cfg.date && <span style={{ fontSize: Math.max(12, Math.round(big * 0.2)), opacity: 0.85, fontWeight: 500 }}>{date}</span>}
      </div>
    );
  }
  return (
    <div style={base}>
      <span style={{ ...num, fontSize: big, fontWeight: cfg.style === 'thin' ? 200 : cfg.weight }}>{time}</span>
      {dateEl}
    </div>
  );
}

export function WidgetView({ type, batteryLevel, isCharging, track, playing, onPrev, onToggle, onNext, onOpen, time = '00:00', date = '', cfg, size }: Props) {
  if (type === 'relogio') {
    return <ClockWidget cfg={cfg ?? DEFAULT_CLOCK} time={time} date={date} w={size?.w ?? 4} h={size?.h ?? 2} />;
  }
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
