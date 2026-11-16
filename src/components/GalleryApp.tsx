import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Heart, Trash2, Check, X, ChevronLeft, Palette, Info, ImagePlus, CheckCircle2 } from 'lucide-react';
import { listMedia, putMedia, deleteMedia, updateMedia, photoFromFile, wallpaperDataUrl, type MediaItem } from '../mediaStorage';

type Target = 'home' | 'lock' | 'both';
type Tab = 'photos' | 'favs' | 'wall';

interface Props {
  darkMode: boolean;
  language: 'pt' | 'en';
  isActive: boolean;
  wallpapers: { name: string; gradient: string }[];
  wallpaperIndex: number;
  lockWallpaperIndex: number;
  onApplyBuiltin: (idx: number, target: Target) => void;
  onUsePhoto: (dataUrl: string, name: string, target: Target) => void;
}

const fmtSize = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

export default function GalleryApp({ darkMode, language, isActive, wallpapers, wallpaperIndex, lockWallpaperIndex, onApplyBuiltin, onUsePhoto }: Props) {
  const pt = language !== 'en';
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [tab, setTab] = useState<Tab>('photos');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewer, setViewer] = useState<number | null>(null);
  const [chrome, setChrome] = useState(true);
  const [zoom, setZoom] = useState(false);
  const [info, setInfo] = useState(false);
  const [sheet, setSheet] = useState<null | { kind: 'wall'; photo?: MediaItem; builtin?: number } | { kind: 'delete'; ids: string[] }>(null);
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbUrls = useRef<Map<string, string>>(new Map());
  const lastTap = useRef(0);

  useEffect(() => { listMedia('photo').then(setPhotos).catch(() => {}); }, []);
  useEffect(() => () => { thumbUrls.current.forEach(u => URL.revokeObjectURL(u)); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t); }, [toast]);

  const thumbOf = (m: MediaItem) => {
    let u = thumbUrls.current.get(m.id);
    if (!u) { u = URL.createObjectURL(m.thumb ?? m.blob); thumbUrls.current.set(m.id, u); }
    return u;
  };

  const visible = useMemo(() => (tab === 'favs' ? photos.filter(p => p.favorite) : photos), [photos, tab]);

  // Foto em tamanho cheio do visualizador (URL temporária)
  const [fullUrl, setFullUrl] = useState('');
  useEffect(() => {
    if (viewer === null || !visible[viewer]) { setFullUrl(''); return; }
    const u = URL.createObjectURL(visible[viewer].blob);
    setFullUrl(u); setZoom(false); setInfo(false);
    return () => URL.revokeObjectURL(u);
  }, [viewer, visible]);

  // Botão voltar do sistema: fecha o visualizador antes de sair do app
  useEffect(() => {
    if (!isActive) return;
    const onBack = (e: Event) => {
      if (sheet) { setSheet(null); e.preventDefault(); }
      else if (viewer !== null) { setViewer(null); e.preventDefault(); }
      else if (selecting) { setSelecting(false); setSelected(new Set()); e.preventDefault(); }
    };
    window.addEventListener('mockos-back', onBack);
    return () => window.removeEventListener('mockos-back', onBack);
  }, [isActive, viewer, selecting, sheet]);

  const importFiles = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      setBusy(pt ? `Importando ${i + 1} de ${list.length}…` : `Importing ${i + 1} of ${list.length}…`);
      try {
        const item = await photoFromFile(list[i]);
        await putMedia(item);
        setPhotos(prev => [item, ...prev]);
        ok++;
      } catch { /* arquivo ignorado */ }
    }
    setBusy('');
    setToast(ok ? (pt ? `${ok} foto(s) adicionada(s)` : `${ok} photo(s) added`) : (pt ? 'Nenhuma imagem válida' : 'No valid images'));
  };

  const remove = async (ids: string[]) => {
    for (const id of ids) {
      await deleteMedia(id).catch(() => {});
      const u = thumbUrls.current.get(id); if (u) { URL.revokeObjectURL(u); thumbUrls.current.delete(id); }
    }
    setPhotos(prev => prev.filter(p => !ids.includes(p.id)));
    setSelected(new Set()); setSelecting(false); setSheet(null);
    setViewer(v => (v === null ? null : null));
    setToast(pt ? 'Excluída' : 'Deleted');
  };

  const toggleFav = (m: MediaItem) => {
    const favorite = !m.favorite;
    updateMedia(m.id, { favorite }).catch(() => {});
    setPhotos(prev => prev.map(p => (p.id === m.id ? { ...p, favorite } : p)));
  };

  const applyWall = async (target: Target) => {
    const s = sheet; setSheet(null);
    if (!s || s.kind !== 'wall') return;
    if (s.photo) {
      try {
        const url = await wallpaperDataUrl(s.photo.blob);
        onUsePhoto(url, s.photo.name, target);
        setToast(pt ? 'Papel de parede definido' : 'Wallpaper set');
      } catch { setToast(pt ? 'Não foi possível usar esta foto' : 'Could not use this photo'); }
    } else if (s.builtin !== undefined) {
      onApplyBuiltin(s.builtin, target);
      setToast(pt ? 'Papel de parede definido' : 'Wallpaper set');
    }
  };

  const dayLabel = (t: number) => {
    const d = new Date(t), n = new Date();
    const key = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
    if (key(d) === key(n)) return pt ? 'Hoje' : 'Today';
    const y = new Date(n); y.setDate(n.getDate() - 1);
    if (key(d) === key(y)) return pt ? 'Ontem' : 'Yesterday';
    return d.toLocaleDateString(pt ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'long', year: d.getFullYear() === n.getFullYear() ? undefined : 'numeric' });
  };
  const groups = useMemo(() => {
    const out: { label: string; items: { m: MediaItem; i: number }[] }[] = [];
    visible.forEach((m, i) => {
      const label = dayLabel(m.createdAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push({ m, i }); else out.push({ label, items: [{ m, i }] });
    });
    return out;
  }, [visible, pt]); // eslint-disable-line react-hooks/exhaustive-deps

  const tapTile = (m: MediaItem, i: number) => {
    if (selecting) {
      setSelected(prev => { const n = new Set(prev); n.has(m.id) ? n.delete(m.id) : n.add(m.id); return n; });
    } else { setViewer(i); setChrome(true); }
  };

  const goto = useCallback((d: number) => {
    setViewer(v => (v === null ? v : Math.min(visible.length - 1, Math.max(0, v + d))));
  }, [visible.length]);

  const shell = darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  const sub = darkMode ? 'text-white/55' : 'text-slate-500';
  const chip = (on: boolean) => `px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${on ? (darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white') : (darkMode ? 'bg-white/10 text-white/70' : 'bg-slate-200/70 text-slate-600')}`;
  const cur = viewer !== null ? visible[viewer] : null;

  return (
    <div className={`h-full relative flex flex-col overflow-hidden ${shell}`}>
      {/* Cabeçalho */}
      <div className="shrink-0 px-5 pt-3 pb-2 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{pt ? 'Galeria' : 'Gallery'}</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{pt ? `${photos.length} foto(s)` : `${photos.length} photo(s)`}</p>
        </div>
        <div className="flex items-center gap-2">
          {tab !== 'wall' && photos.length > 0 && (
            <button onClick={() => { setSelecting(s => !s); setSelected(new Set()); }} className={chip(selecting)}>
              {selecting ? (pt ? 'Cancelar' : 'Cancel') : (pt ? 'Selecionar' : 'Select')}
            </button>
          )}
          <button onClick={() => fileRef.current?.click()} aria-label={pt ? 'Adicionar fotos' : 'Add photos'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent, #3E63DD)' }}>
            <Plus size={18} />
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { importFiles(e.target.files); e.target.value = ''; }} />

      <div className="shrink-0 px-5 pb-3 flex gap-2">
        <button className={chip(tab === 'photos')} onClick={() => setTab('photos')}>{pt ? 'Fotos' : 'Photos'}</button>
        <button className={chip(tab === 'favs')} onClick={() => setTab('favs')}>{pt ? 'Favoritas' : 'Favorites'}</button>
        <button className={chip(tab === 'wall')} onClick={() => setTab('wall')}>{pt ? 'Papéis de parede' : 'Wallpapers'}</button>
      </div>

      {busy && <div className="mx-5 mb-2 text-xs px-3 py-2 rounded-xl bg-blue-500/15 text-blue-400">{busy}</div>}

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-24">
        {tab === 'wall' ? (
          <div className="px-5 grid grid-cols-3 gap-2.5">
            {wallpapers.map((w, i) => (
              <button key={i} onClick={() => setSheet({ kind: 'wall', builtin: i })}
                className="aspect-[9/16] rounded-2xl overflow-hidden relative border border-white/10 text-left" style={{ background: w.gradient }}>
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <p className="text-[11px] font-semibold truncate">{w.name}</p>
                  <p className="text-[10px] opacity-70">{[i === wallpaperIndex && (pt ? 'Início' : 'Home'), i === lockWallpaperIndex && (pt ? 'Bloqueio' : 'Lock')].filter(Boolean).join(' · ')}</p>
                </div>
              </button>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 gap-3">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}><ImagePlus size={26} className={sub} /></div>
            <h3 className="font-semibold">{tab === 'favs' ? (pt ? 'Nenhuma favorita ainda' : 'No favorites yet') : (pt ? 'Sua galeria está vazia' : 'Your gallery is empty')}</h3>
            <p className={`text-xs ${sub}`}>{tab === 'favs' ? (pt ? 'Toque no coração ao ver uma foto.' : 'Tap the heart while viewing a photo.') : (pt ? 'Adicione fotos do seu dispositivo para vê-las aqui.' : 'Add photos from your device to see them here.')}</p>
            {tab === 'photos' && <button onClick={() => fileRef.current?.click()} className="mt-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--accent, #3E63DD)' }}>{pt ? 'Adicionar fotos' : 'Add photos'}</button>}
          </div>
        ) : (
          groups.map(g => (
            <div key={g.label} className="mb-4">
              <h3 className={`px-5 pb-2 text-xs font-semibold uppercase tracking-wider ${sub}`}>{g.label}</h3>
              <div className="px-1 grid grid-cols-3 gap-0.5">
                {g.items.map(({ m, i }) => {
                  const on = selected.has(m.id);
                  return (
                    <button key={m.id} onClick={() => tapTile(m, i)} className="aspect-square relative overflow-hidden bg-black/20">
                      <img src={thumbOf(m)} alt={m.name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-200 ${on ? 'scale-90 rounded-xl' : ''}`} />
                      {m.favorite && !selecting && <Heart size={12} className="absolute bottom-1.5 left-1.5 text-white drop-shadow" fill="currentColor" />}
                      {selecting && (
                        <span className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${on ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/80 bg-black/20'}`}>
                          {on && <Check size={12} strokeWidth={3} />}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Barra de seleção */}
      {selecting && (
        <div className={`absolute left-4 right-4 bottom-4 rounded-2xl px-4 py-3 flex items-center justify-between backdrop-blur-xl border ${darkMode ? 'bg-slate-900/85 border-white/10' : 'bg-white/90 border-slate-200'}`}>
          <span className="text-sm font-semibold">{selected.size} {pt ? 'selecionada(s)' : 'selected'}</span>
          <button disabled={!selected.size} onClick={() => setSheet({ kind: 'delete', ids: Array.from(selected) })}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-500 disabled:opacity-40"><Trash2 size={16} />{pt ? 'Excluir' : 'Delete'}</button>
        </div>
      )}

      {/* Visualizador */}
      <AnimatePresence>
        {cur && (
          <motion.div key="viewer" className="absolute inset-0 z-30 bg-black text-white overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.div key={cur.id} className="absolute inset-0 flex items-center justify-center"
              drag={zoom ? true : 'x'} dragElastic={zoom ? 0.15 : 0.35} dragMomentum={false} dragSnapToOrigin={!zoom}
              onDragEnd={(_, i) => { if (!zoom) { if (i.offset.x < -90 || i.velocity.x < -500) goto(1); else if (i.offset.x > 90 || i.velocity.x > 500) goto(-1); } }}
              onClick={() => {
                const now = Date.now();
                if (now - lastTap.current < 300) setZoom(z => !z); else setChrome(c => !c);
                lastTap.current = now;
              }}
              style={{ touchAction: 'none' }}>
              {fullUrl && <motion.img src={fullUrl} alt={cur.name} draggable={false} animate={{ scale: zoom ? 2.4 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="max-w-full max-h-full object-contain select-none" />}
            </motion.div>

            <AnimatePresence>
              {chrome && (
                <>
                  <motion.div key="top" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-0 inset-x-0 px-3 pt-3 pb-8 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent">
                    <button onClick={() => setViewer(null)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur"><ChevronLeft size={20} /></button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{cur.name}</p>
                      <p className="text-[11px] opacity-60">{viewer! + 1} / {visible.length} · {dayLabel(cur.createdAt)}</p>
                    </div>
                  </motion.div>
                  <motion.div key="bot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-0 inset-x-0 px-6 pt-8 pb-5 flex items-center justify-around bg-gradient-to-t from-black/75 to-transparent">
                    <button onClick={() => toggleFav(cur)} className="flex flex-col items-center gap-1 text-[11px]"><Heart size={22} fill={cur.favorite ? 'currentColor' : 'none'} className={cur.favorite ? 'text-rose-400' : ''} />{pt ? 'Favoritar' : 'Favorite'}</button>
                    <button onClick={() => setSheet({ kind: 'wall', photo: cur })} className="flex flex-col items-center gap-1 text-[11px]"><Palette size={22} />{pt ? 'Papel de parede' : 'Wallpaper'}</button>
                    <button onClick={() => setInfo(i => !i)} className="flex flex-col items-center gap-1 text-[11px]"><Info size={22} />Info</button>
                    <button onClick={() => setSheet({ kind: 'delete', ids: [cur.id] })} className="flex flex-col items-center gap-1 text-[11px] text-red-400"><Trash2 size={22} />{pt ? 'Excluir' : 'Delete'}</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {info && (
              <div className="absolute left-4 right-4 bottom-28 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 p-4 text-xs space-y-1.5">
                <p className="font-semibold text-sm">{cur.name}</p>
                <p className="opacity-70">{cur.width}×{cur.height} · {fmtSize(cur.size)}</p>
                <p className="opacity-70">{new Date(cur.createdAt).toLocaleString(pt ? 'pt-BR' : 'en-US')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folhas inferiores */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="absolute inset-0 z-40 bg-black/50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(null)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              onClick={e => e.stopPropagation()}
              className={`w-full rounded-t-3xl p-5 pb-8 space-y-2.5 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              {sheet.kind === 'wall' ? (
                <>
                  <h3 className="font-semibold text-center mb-1">{pt ? 'Definir papel de parede' : 'Set wallpaper'}</h3>
                  {([['home', pt ? 'Tela inicial' : 'Home screen'], ['lock', pt ? 'Tela de bloqueio' : 'Lock screen'], ['both', pt ? 'As duas' : 'Both']] as [Target, string][]).map(([t, l]) => (
                    <button key={t} onClick={() => applyWall(t)} className={`w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}><CheckCircle2 size={16} className="opacity-60" />{l}</button>
                  ))}
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-center">{pt ? `Excluir ${sheet.ids.length} foto(s)?` : `Delete ${sheet.ids.length} photo(s)?`}</h3>
                  <p className={`text-xs text-center ${sub}`}>{pt ? 'Isso não pode ser desfeito.' : 'This cannot be undone.'}</p>
                  <button onClick={() => remove(sheet.ids)} className="w-full py-3 rounded-2xl text-sm font-semibold bg-red-500 text-white">{pt ? 'Excluir' : 'Delete'}</button>
                  <button onClick={() => setSheet(null)} className={`w-full py-3 rounded-2xl text-sm font-semibold ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>{pt ? 'Cancelar' : 'Cancel'}</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2 rounded-full text-xs font-semibold bg-black/80 text-white backdrop-blur">{toast}</div>
      )}
    </div>
  );
}
