import React, { useEffect, useState } from 'react';
import { CloudSun, Battery, CalendarDays, Music, SkipBack, Play, Pause, SkipForward, Clock as ClockIcon, Cpu, StickyNote, ListChecks, Image as PhotoIcon, Hourglass, Footprints, Quote, X as XIcon } from 'lucide-react';
import { useMemory, fmtMem } from '../memorySim';
import { listMedia } from '../mediaStorage';
import { WSIZE, ClockCfg, DEFAULT_CLOCK } from '../homeGrid';

export const WIDGETS: Record<string, { w: number; h: number; label: string; icon: React.ReactNode }> = {
  calendario: { ...WSIZE.calendario, label: 'Calendário', icon: <CalendarDays size={18} /> },
  clima: { ...WSIZE.clima, label: 'Clima', icon: <CloudSun size={18} /> },
  bateria: { ...WSIZE.bateria, label: 'Bateria', icon: <Battery size={18} /> },
  musica: { ...WSIZE.musica, label: 'Música', icon: <Music size={18} /> },
  relogio: { ...WSIZE.relogio, label: 'Relógio', icon: <ClockIcon size={18} /> },
  memoria: { ...WSIZE.memoria, label: 'Memória', icon: <Cpu size={18} /> },
  notas: { ...WSIZE.notas, label: 'Nota rápida', icon: <StickyNote size={18} /> },
  tarefas: { ...WSIZE.tarefas, label: 'Tarefas', icon: <ListChecks size={18} /> },
  foto: { ...WSIZE.foto, label: 'Foto', icon: <PhotoIcon size={18} /> },
  contagem: { ...WSIZE.contagem, label: 'Contagem', icon: <Hourglass size={18} /> },
  passos: { ...WSIZE.passos, label: 'Passos', icon: <Footprints size={18} /> },
  frase: { ...WSIZE.frase, label: 'Frase do dia', icon: <Quote size={18} /> }
};

const ring = (frac: number, color: string, size = 64, stroke = 6) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, frac)))} style={{ transition: 'stroke-dashoffset .8s ease' }} />
    </svg>
  );
};

function MemoryWidget() {
  const m = useMemory();
  const frac = (m.used + m.cached * 0.3) / m.total;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <div className="relative">
        {ring(frac, frac > 0.85 ? '#E5484D' : '#fff', 72, 7)}
        <span className="absolute inset-0 flex items-center justify-center text-[15px] font-medium tabular-nums">{Math.round(frac * 100)}%</span>
      </div>
      <div className="text-center leading-tight">
        <div className="text-[12px] font-semibold">Memória</div>
        <div className="text-[11px] opacity-65">{fmtMem(m.free)} livres</div>
      </div>
    </div>
  );
}

function NoteWidget() {
  const [text, setText] = useState(() => { try { return localStorage.getItem('os_widget_note') || ''; } catch { return ''; } });
  useEffect(() => { try { localStorage.setItem('os_widget_note', text); } catch { /* ok */ } }, [text]);
  return (
    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escreva uma nota…" maxLength={400} aria-label="Nota rápida"
      className="w-full h-full resize-none bg-transparent outline-none text-[13px] leading-snug placeholder-white/50 text-white" />
  );
}

function TodoWidget() {
  const [items, setItems] = useState<{ t: string; d: boolean }[]>(() => { try { return JSON.parse(localStorage.getItem('os_widget_todos') || '[]'); } catch { return []; } });
  const [draft, setDraft] = useState('');
  useEffect(() => { try { localStorage.setItem('os_widget_todos', JSON.stringify(items)); } catch { /* ok */ } }, [items]);
  return (
    <div className="w-full h-full flex flex-col gap-1 min-h-0">
      <div className="text-[12px] font-semibold flex items-center justify-between"><span>Tarefas</span><span className="opacity-60 tabular-nums">{items.filter(i => !i.d).length}</span></div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1">
        {items.length === 0 && <p className="text-[11px] opacity-55 pt-1">Nada por fazer</p>}
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[12px]">
            <button type="button" onClick={() => setItems(p => p.map((x, j) => (j === i ? { ...x, d: !x.d } : x)))} aria-label="Concluir"
              className="w-4 h-4 rounded-full border border-white/70 shrink-0" style={{ background: it.d ? '#fff' : 'transparent' }} />
            <span className={`flex-1 truncate ${it.d ? 'line-through opacity-50' : ''}`}>{it.t}</span>
            <button type="button" onClick={() => setItems(p => p.filter((_, j) => j !== i))} aria-label="Remover" className="opacity-50"><XIcon size={11} /></button>
          </div>
        ))}
      </div>
      <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Nova tarefa" maxLength={60}
        onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { setItems(p => [...p, { t: draft.trim(), d: false }].slice(-12)); setDraft(''); } }}
        className="w-full bg-white/10 rounded-lg px-2 py-1 text-[12px] outline-none placeholder-white/50 text-white" />
    </div>
  );
}

function PhotoWidget({ onOpen }: { onOpen: (id: string) => void }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [i, setI] = useState(0);
  useEffect(() => {
    let alive = true; const made: string[] = [];
    const load = () => listMedia('photo').then(list => {
      if (!alive) return;
      made.splice(0).forEach(u => URL.revokeObjectURL(u));
      const u = list.slice(0, 12).map(m => URL.createObjectURL(m.thumb ?? m.blob));
      made.push(...u); setUrls(u);
    }).catch(() => {});
    load();
    window.addEventListener('aeroos-media-changed', load);
    return () => { alive = false; window.removeEventListener('aeroos-media-changed', load); made.forEach(u => URL.revokeObjectURL(u)); };
  }, []);
  useEffect(() => { if (urls.length < 2) return; const t = setInterval(() => setI(n => n + 1), 9000); return () => clearInterval(t); }, [urls.length]);
  if (!urls.length) return <button type="button" onClick={() => onOpen('galeria')} className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[12px] opacity-80"><PhotoIcon size={26} strokeWidth={1.5} />Adicione fotos</button>;
  return (
    <button type="button" onClick={() => onOpen('galeria')} className="w-full h-full rounded-[inherit] overflow-hidden relative block p-0">
      <img key={i % urls.length} src={urls[i % urls.length]} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ animation: 'storeFade .8s ease both' }} />
    </button>
  );
}

function StepsWidget() {
  // Passos organicos: sobem ao longo do dia, com pequenas variações
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const steps = Math.round(mins * 5.6 + Math.sin(mins / 37) * 180);
  const goal = 8000;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <div className="relative">
        {ring(steps / goal, '#30A46C', 72, 7)}
        <Footprints size={20} className="absolute inset-0 m-auto" />
      </div>
      <div className="text-center leading-tight">
        <div className="text-[15px] font-semibold tabular-nums">{steps.toLocaleString('pt-BR')}</div>
        <div className="text-[11px] opacity-65">{(steps * 0.00072).toFixed(1).replace('.', ',')} km · {Math.round(steps * 0.04)} kcal</div>
      </div>
    </div>
  );
}

const QUOTES = ['Um passo de cada vez.', 'Faça simples, faça bem.', 'O hoje é o que você constrói.', 'Respire fundo e continue.', 'Pequenos hábitos, grandes mudanças.', 'Curiosidade é combustível.', 'Descanso também é produtivo.', 'Comece antes de estar pronto.', 'Foco no que importa.', 'Gentileza nunca sai de moda.', 'Errar faz parte de aprender.', 'Você está indo melhor do que pensa.'];

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
  if (type === 'memoria') return <MemoryWidget />;
  if (type === 'notas') return <NoteWidget />;
  if (type === 'tarefas') return <TodoWidget />;
  if (type === 'foto') return <PhotoWidget onOpen={onOpen} />;
  if (type === 'passos') return <StepsWidget />;
  if (type === 'contagem') {
    const n = new Date();
    const end = new Date(n.getFullYear(), 11, 31, 23, 59, 59);
    const days = Math.max(0, Math.ceil((end.getTime() - n.getTime()) / 86400000));
    return (
      <div className="w-full h-full flex items-center gap-3">
        <Hourglass size={30} strokeWidth={1.5} className="shrink-0" />
        <div><div className="text-[26px] leading-none font-light tabular-nums">{days}</div><div className="text-[12px] opacity-70 mt-1">dias para o fim de {n.getFullYear()}</div></div>
      </div>
    );
  }
  if (type === 'frase') {
    const n = new Date();
    const doy = Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86400000);
    return (
      <div className="w-full h-full flex items-center gap-3">
        <Quote size={22} strokeWidth={1.6} className="shrink-0 opacity-70" />
        <div className="text-[14px] font-medium leading-snug">{QUOTES[doy % QUOTES.length]}</div>
      </div>
    );
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
