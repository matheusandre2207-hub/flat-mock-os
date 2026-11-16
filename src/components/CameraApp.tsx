import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Zap, ZapOff, Grid3x3, Timer, RefreshCw, Check } from 'lucide-react';
import { listMedia, putMedia, photoFromFile } from '../mediaStorage';

interface CameraAppProps {
  darkMode?: boolean;
  isActive?: boolean;
  /** Abre a Galeria (toque na miniatura da última foto) */
  onOpenGallery?: () => void;
}

const FILTERS = [
  { id: 'none', label: 'Original', css: '' },
  { id: 'soft', label: 'Suave', css: 'brightness(1.08) contrast(0.93) saturate(1.1)' },
  { id: 'warm', label: 'Quente', css: 'sepia(0.28) saturate(1.4) brightness(1.05)' },
  { id: 'retro', label: 'Retrô', css: 'sepia(0.55) contrast(1.1) saturate(1.2)' },
  { id: 'cyber', label: 'Neon', css: 'hue-rotate(160deg) saturate(1.8) contrast(1.15)' },
  { id: 'mono', label: 'P&B', css: 'grayscale(1) contrast(1.2)' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

const ZOOMS = [1, 2, 3];

/** Câmera: visor limpo, controles mínimos. As fotos são salvas de verdade e aparecem na Galeria. */
export default function CameraApp({ isActive = true, onOpenGallery }: CameraAppProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const [filter, setFilter] = useState<FilterId>('none');
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState(false);
  const [grid, setGrid] = useState(false);
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [count, setCount] = useState<number | null>(null);
  const [flashing, setFlashing] = useState(false);
  const [thumb, setThumb] = useState('');
  const [saved, setSaved] = useState(false);
  const [focus, setFocus] = useState<{ x: number; y: number; k: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const thumbUrl = useRef('');
  const busy = useRef(false);

  // Fluxo da câmera real (se não houver permissão, entra o visor simulado)
  useEffect(() => {
    if (!isActive) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('sem câmera');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        setHasCamera(true);
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      } catch { if (!cancelled) setHasCamera(false); }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach(t => t.stop()); };
  }, [facing, isActive]);

  // Miniatura da última foto (acompanha a Galeria)
  const loadThumb = useCallback(() => {
    listMedia('photo').then(list => {
      if (thumbUrl.current) URL.revokeObjectURL(thumbUrl.current);
      thumbUrl.current = list[0] ? URL.createObjectURL(list[0].thumb ?? list[0].blob) : '';
      setThumb(thumbUrl.current);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    loadThumb();
    window.addEventListener('aeroos-media-changed', loadThumb);
    return () => { window.removeEventListener('aeroos-media-changed', loadThumb); if (thumbUrl.current) URL.revokeObjectURL(thumbUrl.current); };
  }, [loadThumb]);
  useEffect(() => () => { audioRef.current?.close().catch(() => {}); }, []);

  const shutterSound = () => {
    try {
      audioRef.current = audioRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      const c = audioRef.current; if (c.state === 'suspended') c.resume();
      const o = c.createOscillator(); const g = c.createGain();
      o.frequency.setValueAtTime(900, c.currentTime); o.frequency.exponentialRampToValueAtTime(160, c.currentTime + 0.09);
      g.gain.setValueAtTime(0.1, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.11);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.12);
    } catch { /* sem áudio */ }
  };

  // Gera a imagem final: quadro do vídeo (com zoom, espelho e filtro) ou uma cena do visor simulado
  const snapshot = (): Promise<Blob | null> => {
    const css = FILTERS.find(f => f.id === filter)?.css || 'none';
    const v = videoRef.current;
    const c = document.createElement('canvas');
    let ctx: CanvasRenderingContext2D | null;
    if (hasCamera && v && v.videoWidth) {
      const W = v.videoWidth, H = v.videoHeight, sw = W / zoom, sh = H / zoom;
      c.width = Math.round(sw); c.height = Math.round(sh);
      ctx = c.getContext('2d');
      if (!ctx) return Promise.resolve(null);
      if (facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
      (ctx as any).filter = css;
      ctx.drawImage(v, (W - sw) / 2, (H - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    } else {
      c.width = 1080; c.height = 1440;
      ctx = c.getContext('2d');
      if (!ctx) return Promise.resolve(null);
      const h = Math.floor(Math.random() * 360);
      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, `hsl(${h} 70% 55%)`); g.addColorStop(1, `hsl(${(h + 70) % 360} 65% 28%)`);
      (ctx as any).filter = css;
      ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `hsla(${(h + i * 40) % 360} 80% 70% / 0.22)`;
        ctx.beginPath(); ctx.arc(Math.random() * c.width, Math.random() * c.height, 120 + Math.random() * 280, 0, 7); ctx.fill();
      }
    }
    return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', 0.9));
  };

  const shoot = async () => {
    if (busy.current) return;
    busy.current = true;
    shutterSound();
    if (flash) { setFlashing(true); setTimeout(() => setFlashing(false), 220); }
    const blob = await snapshot();
    if (blob) {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      const file = new File([blob], `IMG_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.jpg`, { type: 'image/jpeg' });
      try {
        const item = await photoFromFile(file);
        await putMedia(item);
        window.dispatchEvent(new Event('aeroos-media-changed'));
        setSaved(true); setTimeout(() => setSaved(false), 1800);
      } catch { /* não salvou */ }
    }
    busy.current = false;
  };

  const press = () => {
    if (count !== null || busy.current) return;
    if (!timer) { shoot(); return; }
    let n: number = timer;
    setCount(n);
    const iv = window.setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(iv); setCount(null); shoot(); } else setCount(n);
    }, 1000);
  };

  const tapFocus = (e: React.MouseEvent) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    setFocus({ x: e.clientX - r.left, y: e.clientY - r.top, k: Date.now() });
    window.setTimeout(() => setFocus(f => (f && Date.now() - f.k > 900 ? null : f)), 1000);
  };

  const css = FILTERS.find(f => f.id === filter)?.css || 'none';
  const chip = (on: boolean): React.CSSProperties => ({
    padding: '6px 13px', borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', border: 0, cursor: 'pointer',
    background: on ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.1)', color: on ? '#111' : 'rgba(255,255,255,0.8)', transition: 'all .2s ease',
  });
  const circleBtn: React.CSSProperties = {
    width: 38, height: 38, borderRadius: 99, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    background: 'rgba(0,0,0,0.35)', color: '#fff', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
  };

  return (
    <div className="h-full w-full relative flex flex-col bg-black text-white select-none" style={{ paddingTop: 'calc(var(--top, 36px) + 4px)' }}>
      {/* Visor */}
      <div ref={boxRef} onClick={tapFocus} className="relative flex-1 min-h-0 mx-2 overflow-hidden bg-zinc-900" style={{ borderRadius: 30 }}>
        {hasCamera ? (
          <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `${facing === 'user' ? 'scaleX(-1) ' : ''}scale(${zoom})`, filter: css || undefined, transition: 'transform .35s cubic-bezier(.22,1,.36,1)' }} />
        ) : (
          <div className="absolute inset-0 flex items-end justify-center pb-24" style={{ background: 'linear-gradient(160deg,#243b55,#141e30 55%,#2b1740)', filter: css || undefined }}>
            <p className="text-[11px] tracking-wide text-white/45">Visor simulado: a câmera do aparelho não está disponível</p>
          </div>
        )}

        {grid && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.28) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.28) 1px,transparent 1px)',
            backgroundSize: '33.333% 33.333%', backgroundPosition: '0 0' }} />
        )}
        {flashing && <div className="absolute inset-0 bg-white pointer-events-none" style={{ animation: 'camFlash .22s ease-out both' }} />}
        {focus && <div key={focus.k} className="absolute pointer-events-none rounded-2xl border border-amber-300" style={{ left: focus.x - 32, top: focus.y - 32, width: 64, height: 64, animation: 'camFocus .9s ease-out both' }} />}
        {count !== null && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[120px] font-extralight" style={{ textShadow: '0 4px 30px rgba(0,0,0,.5)' }}>{count}</div>}

        {/* Controles do topo */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <button type="button" style={circleBtn} onClick={e => { e.stopPropagation(); setFlash(f => !f); }} aria-label="Flash">
            {flash ? <Zap size={17} fill="currentColor" /> : <ZapOff size={17} />}
          </button>
          <div className="flex gap-2">
            <button type="button" style={{ ...circleBtn, width: 'auto', padding: '0 12px', gap: 6, fontSize: 12, fontWeight: 600 }}
              onClick={e => { e.stopPropagation(); setTimer(t => (t === 0 ? 3 : t === 3 ? 10 : 0)); }} aria-label="Temporizador">
              <Timer size={16} />{timer ? `${timer}s` : ''}
            </button>
            <button type="button" style={{ ...circleBtn, background: grid ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.35)', color: grid ? '#111' : '#fff' }}
              onClick={e => { e.stopPropagation(); setGrid(g => !g); }} aria-label="Grade"><Grid3x3 size={16} /></button>
          </div>
        </div>

        {/* Zoom */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center">
          <div className="flex gap-1 p-1 rounded-full" style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
            {ZOOMS.map(z => (
              <button key={z} type="button" onClick={e => { e.stopPropagation(); setZoom(z); }}
                style={{ width: 34, height: 34, borderRadius: 99, border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: zoom === z ? '#111' : '#fff', background: zoom === z ? '#fff' : 'transparent', transition: 'all .2s' }}>{z}×</button>
            ))}
          </div>
        </div>

        {saved && (
          <button type="button" onClick={e => { e.stopPropagation(); onOpenGallery?.(); }}
            className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', animation: 'camFocus .3s ease-out both reverse' }}>
            <Check size={14} className="text-emerald-400" /> Salva na Galeria
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3.5 pb-1">
        {FILTERS.map(f => <button key={f.id} type="button" style={chip(filter === f.id)} onClick={() => setFilter(f.id)}>{f.label}</button>)}
      </div>

      {/* Obturador */}
      <div className="shrink-0 flex items-center justify-between px-9 pt-3 pb-4">
        <button type="button" onClick={onOpenGallery} aria-label="Abrir Galeria"
          className="w-[52px] h-[52px] rounded-2xl overflow-hidden border border-white/25 bg-zinc-800 active:scale-95 transition-transform">
          {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" />}
        </button>
        <button type="button" onClick={press} aria-label="Tirar foto"
          className="w-[78px] h-[78px] rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ border: '3px solid #fff', padding: 5, background: 'transparent' }}>
          <span className="w-full h-full rounded-full bg-white block" style={{ transition: 'transform .12s' }} />
        </button>
        <button type="button" onClick={() => setFacing(f => (f === 'user' ? 'environment' : 'user'))} aria-label="Virar câmera"
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,.12)' }}>
          <RefreshCw size={20} />
        </button>
      </div>

      <style>{`
        @keyframes camFlash { from { opacity: .95; } to { opacity: 0; } }
        @keyframes camFocus { from { transform: scale(1.5); opacity: 0; } 35% { opacity: 1; } to { transform: scale(1); opacity: 0.9; } }
      `}</style>
    </div>
  );
}
