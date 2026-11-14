// Instalação de pacotes de pasta (jogos HTML5 com JS, CSS, imagens, áudio...).
import { type CustomApp, makeCustomAppId, pickColor, extractTitle } from './customApps';
import { putFileBatch, deleteAppFiles, type FileRecord } from './appStorage';

export const MAX_FOLDER_BYTES = 1_500_000_000;
const BASE: string = (import.meta as any).env?.BASE_URL ?? '/';
const SKIP = /\.(exe|dll|msi|bat|cmd|sh|dmg|app)$|\.zip(\.part\d+)?$/i;

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8', mjs: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8', json: 'application/json', map: 'application/json',
  txt: 'text/plain; charset=utf-8', xml: 'application/xml', wasm: 'application/wasm',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon', bmp: 'image/bmp',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', oga: 'audio/ogg',
  mp4: 'video/mp4', webm: 'video/webm',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
};

export function mimeFor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return MIME[ext] ?? 'application/octet-stream';
}

/** URL do jogo instalado, servida pelo Service Worker a partir do IndexedDB. */
export function folderUrl(appId: string): string {
  return `${BASE}aeroapps/${encodeURIComponent(appId)}/index.html`;
}

/** Registra o Service Worker que serve os pacotes. Resolve false se o navegador não permitir (ex.: http). */
export async function registerFolderServer(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    // Usa o mesmo sw.js do AeroOS (um Service Worker por escopo): ele também serve os pacotes
    await navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE });
    await navigator.serviceWorker.ready;
    return true;
  } catch {
    return false;
  }
}

const relPath = (f: File) => (f as any).webkitRelativePath || f.name;

export interface FolderPick {
  base: string;
  entries: Array<{ path: string; file: File }>;
  totalBytes: number;
  index: File;
}

/** Acha o index.html mais raso e separa só os arquivos dessa pasta (ignora .exe, zips etc.). */
export function pickFolder(files: File[]): FolderPick {
  const indexes = files
    .filter(f => relPath(f).split('/').pop()?.toLowerCase() === 'index.html')
    .sort((a, b) => relPath(a).split('/').length - relPath(b).split('/').length);
  if (!indexes.length) throw new Error('A pasta precisa ter um index.html (a página do jogo).');
  const index = indexes[0];
  const idxPath = relPath(index);
  const base = idxPath.slice(0, idxPath.length - 'index.html'.length);
  const entries = files
    .filter(f => relPath(f).startsWith(base))
    .map(f => ({ path: relPath(f).slice(base.length), file: f }))
    .filter(e => e.path.length > 0 && !SKIP.test(e.path));
  const totalBytes = entries.reduce((n, e) => n + e.file.size, 0);
  return { base, entries, totalBytes, index };
}

export function fmtBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${Math.round(n / 1e6)} MB`;
  return `${Math.max(1, Math.round(n / 1e3))} KB`;
}

function readDataUrl(file: File): Promise<string | undefined> {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => resolve(undefined);
    r.readAsDataURL(file);
  });
}

/** Grava a pasta no IndexedDB e devolve o app pronto para a loja. */
export async function installFolderApp(files: File[], onProgress: (pct: number) => void): Promise<CustomApp> {
  const pick = pickFolder(files);
  if (pick.totalBytes > MAX_FOLDER_BYTES) throw new Error('Pasta muito grande (máximo 1,5 GB).');

  const id = makeCustomAppId();
  const folderName = pick.base.split('/').filter(Boolean).pop() || 'Pacote';
  const indexText = await pick.index.text();
  const name = extractTitle(indexText, folderName);

  try {
    const CHUNK = 25;
    let done = 0;
    for (let i = 0; i < pick.entries.length; i += CHUNK) {
      const slice = pick.entries.slice(i, i + CHUNK);
      const records: FileRecord[] = slice.map(e => ({
        key: `${id}|${e.path}`,
        appId: id,
        path: e.path,
        type: mimeFor(e.path),
        blob: e.file,
      }));
      await putFileBatch(records);
      done += slice.reduce((n, e) => n + e.file.size, 0);
      onProgress(Math.round((done / Math.max(1, pick.totalBytes)) * 100));
    }
  } catch (err) {
    await deleteAppFiles(id).catch(() => {});
    throw err;
  }

  const icon = pick.entries.find(e => /(^|\/)favicon\.(png|ico|svg|jpe?g|webp)$/i.test(e.path))
    ?? pick.entries.find(e => /^favicon\//i.test(e.path) && /\.(png|ico|svg|jpe?g|webp)$/i.test(e.path));
  const iconUrl = icon && icon.file.size < 400_000 ? await readDataUrl(icon.file) : undefined;

  return {
    id,
    name,
    html: '',
    color: pickColor(Math.floor(Math.random() * 10)),
    size: fmtBytes(pick.totalBytes),
    createdAt: Date.now(),
    kind: 'folder',
    entry: 'index.html',
    fileCount: pick.entries.length,
    iconUrl,
  };
}
