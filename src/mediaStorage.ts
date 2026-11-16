// Biblioteca de mídia do AeroOS (fotos e músicas importadas). Fica no IndexedDB, num banco
// separado ('aeroos-media') para não depender da versão do banco de apps/pacotes.

export type MediaKind = 'photo' | 'audio';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  name: string;
  blob: Blob;
  thumb?: Blob;
  size: number;
  createdAt: number;
  favorite?: boolean;
  width?: number;
  height?: number;
  durationSec?: number;
  artist?: string;
  color?: string;
}

const DB = 'aeroos-media';
const STORE = 'items';
let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbp = null; reject(req.error); };
    });
  }
  return dbp;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(r.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error ?? new Error('abortado'));
  }));
}

export async function listMedia(kind: MediaKind): Promise<MediaItem[]> {
  const all = await tx<MediaItem[]>('readonly', s => s.getAll());
  return all.filter(m => m.kind === kind).sort((a, b) => b.createdAt - a.createdAt);
}
export const putMedia = (m: MediaItem) => tx('readwrite', s => s.put(m)).then(() => undefined);
export const deleteMedia = (id: string) => tx('readwrite', s => s.delete(id)).then(() => undefined);
export async function updateMedia(id: string, patch: Partial<MediaItem>) {
  const cur = await tx<MediaItem | undefined>('readonly', s => s.get(id));
  if (cur) await putMedia({ ...cur, ...patch });
}

export const newMediaId = () => `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Cores de capa das músicas importadas (classes literais para o Tailwind enxergar)
export const TRACK_COLORS = [
  'from-purple-500 to-pink-500', 'from-sky-500 to-indigo-500', 'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500', 'from-rose-500 to-red-500', 'from-fuchsia-500 to-violet-500',
];

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem inválida')); };
    img.src = url;
  });
}

function drawToBlob(img: HTMLImageElement, maxSide: number, quality: number): Promise<Blob | null> {
  const k = Math.min(1, maxSide / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.width * k));
  c.height = Math.max(1, Math.round(img.height * k));
  c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', quality));
}

/** Foto → item da biblioteca, com miniatura leve para a grade. */
export async function photoFromFile(file: File): Promise<MediaItem> {
  const img = await loadImage(file);
  const thumb = await drawToBlob(img, 420, 0.8);
  return {
    id: newMediaId(), kind: 'photo', name: file.name.replace(/\.[^.]+$/, '') || 'Foto',
    blob: file, thumb: thumb ?? undefined, size: file.size, createdAt: Date.now(),
    width: img.width, height: img.height,
  };
}

/** Música → item da biblioteca (lê a duração do arquivo). */
export function audioFromFile(file: File, index: number): Promise<MediaItem> {
  const base = file.name.replace(/\.[^.]+$/, '');
  const [a, ...t] = base.split(' - ');
  const hasArtist = t.length > 0;
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const au = new Audio();
    const done = (d: number) => {
      URL.revokeObjectURL(url);
      resolve({
        id: newMediaId(), kind: 'audio', name: (hasArtist ? t.join(' - ') : base).trim(),
        artist: hasArtist ? a.trim() : 'Importada', blob: file, size: file.size, createdAt: Date.now() + index,
        durationSec: Number.isFinite(d) && d > 0 ? Math.round(d) : 0, color: TRACK_COLORS[index % TRACK_COLORS.length],
      });
    };
    au.preload = 'metadata';
    au.onloadedmetadata = () => done(au.duration);
    au.onerror = () => done(0);
    au.src = url;
  });
}

/** Versão leve (JPEG até 1080 px) para usar como papel de parede sem estourar o armazenamento. */
export async function wallpaperDataUrl(blob: Blob): Promise<string> {
  const img = await loadImage(blob);
  const out = await drawToBlob(img, 1080, 0.82);
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(out ?? blob);
  });
}

export const fmtDuration = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
