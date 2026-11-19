// Memória simulada, mas orgânica: o uso muda com o que está aberto, cada app "respira",
// apps em segundo plano são comprimidos, o cache cresce e encolhe sob pressão.
import { useSyncExternalStore } from 'react';

export interface MemApp { id: string; mb: number }
export interface MemSnap {
  total: number; used: number; system: number; apps: MemApp[]; appsTotal: number;
  cached: number; free: number; swap: number; history: number[]; pressure: 'ok' | 'alta' | 'crítica';
}

const BASE: Record<string, number> = {
  navegador: 430, camera: 360, galeria: 280, musica: 200, configuracoes: 170, mensagens: 190, loja: 220,
  arquivos: 150, calculadora: 90, relogio: 100, notas: 110, clima: 140, flappy: 320, paint: 240, telefone: 160, contatos: 130,
};

let inputs = { open: [] as string[], active: null as string | null, ramMb: 8192, heavy: new Set<string>() };
const appMb: Record<string, number> = {};
let sys = 2300, cache = 700, history: number[] = [], tickN = 0;
let snap: MemSnap = compute();
const listeners = new Set<() => void>();
let timer = 0;

const seedOf = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0; return Math.abs(h) % 1000; };
const baseFor = (id: string) => inputs.heavy.has(id) ? 640 : id.startsWith('custom-') ? 170 : (BASE[id] ?? 130);
const noise = (a: number) => (Math.random() - 0.5) * 2 * a;

function compute(): MemSnap {
  const apps = Object.entries(appMb).map(([id, mb]) => ({ id, mb: Math.round(mb) })).sort((a, b) => b.mb - a.mb);
  const appsTotal = apps.reduce((n, a) => n + a.mb, 0);
  const used = Math.round(sys + appsTotal);
  const total = inputs.ramMb;
  const free = Math.max(0, Math.round(total - used - cache));
  const swap = Math.max(0, Math.round(used + cache - total * 0.97));
  const pressure = free < total * 0.04 ? 'crítica' : free < total * 0.1 ? 'alta' : 'ok';
  return { total, used, system: Math.round(sys), apps, appsTotal, cached: Math.round(cache), free, swap, history: history.slice(), pressure };
}

function tick() {
  tickN++;
  const t = tickN / 4;
  const open = new Set(inputs.open);
  // apps novos nascem pequenos e crescem; apps fechados liberam e viram cache
  for (const id of Object.keys(appMb)) if (!open.has(id)) { cache += appMb[id] * 0.2; delete appMb[id]; }
  for (const id of open) {
    const target = baseFor(id) * (id === inputs.active ? 1 : 0.58) * (1 + 0.06 * Math.sin(t / 3 + seedOf(id)));
    if (appMb[id] === undefined) appMb[id] = target * 0.3;
    appMb[id] += (target - appMb[id]) * 0.12 + noise(id === inputs.active ? 5 : 1.5);
    if (appMb[id] < 20) appMb[id] = 20;
  }
  sys += (2250 + 180 * Math.sin(t / 5) - sys) * 0.1 + noise(6);
  const want = Math.min(1500, 500 + tickN * 1.2);
  cache += (want - cache) * 0.02 + noise(8);
  const projected = sys + Object.values(appMb).reduce((n, v) => n + v, 0) + cache;
  if (projected > inputs.ramMb * 0.95) cache -= Math.min(cache * 0.5, 90);
  cache = Math.max(120, cache);
  history.push(Math.round(sys + Object.values(appMb).reduce((n, v) => n + v, 0)));
  if (history.length > 90) history.shift();
  snap = compute();
  listeners.forEach(l => l());
}

function ensureTimer() { if (!timer && typeof window !== 'undefined') timer = window.setInterval(tick, 1500); }

export function setMemoryInputs(i: { open: string[]; active: string | null; ramMb: number; heavy?: string[] }) {
  inputs = { open: i.open, active: i.active, ramMb: i.ramMb, heavy: new Set(i.heavy ?? []) };
  ensureTimer();
}
/** Apps em segundo plano liberam memória (o App cuida de fechá-los). Devolve quantos MB foram liberados. */
export function freedByClosing(ids: string[]): number {
  let mb = 0;
  for (const id of ids) { mb += appMb[id] ?? 0; cache += (appMb[id] ?? 0) * 0.15; delete appMb[id]; }
  snap = compute(); listeners.forEach(l => l());
  return Math.round(mb);
}
export function useMemory(): MemSnap {
  ensureTimer();
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => snap);
}
export const fmtMem = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(1).replace('.', ',')} GB` : `${Math.round(mb)} MB`);
