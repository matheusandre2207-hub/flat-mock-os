export const COLS = 4;
export const ROWS = 6;
export interface Cell { c: number; r: number }
export interface ClockCfg {
  style: 'digital' | 'thin' | 'stacked' | 'minimal' | 'analog';
  color: string;                         // 'auto' = branco do sistema
  date: boolean;
  weight: 200 | 400 | 700;
  align: 'left' | 'center' | 'right';
  bg: 'none' | 'glass' | 'solid';
}
export const DEFAULT_CLOCK: ClockCfg = { style: 'digital', color: 'auto', date: true, weight: 200, align: 'center', bg: 'none' };

export interface WidgetItem { id: string; type: string; c: number; r: number; w?: number; h?: number; cfg?: ClockCfg }

export const WSIZE: Record<string, { w: number; h: number }> = {
  calendario: { w: 2, h: 2 },
  clima: { w: 2, h: 1 },
  bateria: { w: 2, h: 1 },
  musica: { w: 4, h: 1 },
  relogio: { w: 4, h: 2 },
  memoria: { w: 2, h: 2 },
  notas: { w: 2, h: 2 },
  tarefas: { w: 2, h: 2 },
  foto: { w: 2, h: 2 },
  contagem: { w: 2, h: 1 },
  passos: { w: 2, h: 2 },
  frase: { w: 4, h: 1 }
};

// Tamanho de um widget: o escolhido pelo usuário ou o padrão do tipo
export function widgetSize(w: WidgetItem): { w: number; h: number } | null {
  const s = WSIZE[w.type];
  if (!s) return null;
  return { w: w.w ?? s.w, h: w.h ?? s.h };
}

const key = (c: number, r: number) => `${c},${r}`;

export function widgetCells(w: WidgetItem): string[] {
  const s = widgetSize(w);
  const out: string[] = [];
  if (!s) return out;
  for (let dc = 0; dc < s.w; dc++) for (let dr = 0; dr < s.h; dr++) out.push(key(w.c + dc, w.r + dr));
  return out;
}

// Posição de cada app: usa a escolhida pelo usuário; quem não tem ocupa a primeira célula livre
export function resolveLayout(apps: string[], layout: Record<string, Cell>, widgets: WidgetItem[], autoStart: number) {
  const occ = new Set<string>();
  widgets.forEach(w => widgetCells(w).forEach(k => occ.add(k)));
  const out: Record<string, Cell> = {};
  apps.forEach(a => {
    const p = layout[a];
    if (p && p.c >= 0 && p.c < COLS && p.r >= 0 && p.r < ROWS && !occ.has(key(p.c, p.r))) {
      out[a] = p;
      occ.add(key(p.c, p.r));
    }
  });
  apps.forEach(a => {
    if (out[a]) return;
    for (const start of [autoStart, 0]) {
      for (let r = start; r < ROWS && !out[a]; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!occ.has(key(c, r))) { out[a] = { c, r }; occ.add(key(c, r)); break; }
        }
      }
      if (out[a]) break;
    }
  });
  return out;
}

export function occupiedCells(placed: Record<string, Cell>, widgets: WidgetItem[], ignore?: string) {
  const occ = new Set<string>();
  Object.entries(placed).forEach(([k, p]) => { if (k !== ignore) occ.add(key(p.c, p.r)); });
  widgets.forEach(w => widgetCells(w).forEach(k => occ.add(k)));
  return occ;
}

// Célula livre (w×h) mais próxima do ponto desejado
export function findFree(occ: Set<string>, w: number, h: number, from: Cell): Cell | null {
  let best: Cell | null = null;
  let bd = 1e9;
  for (let r = 0; r <= ROWS - h; r++) {
    for (let c = 0; c <= COLS - w; c++) {
      let ok = true;
      for (let dc = 0; dc < w && ok; dc++) for (let dr = 0; dr < h; dr++) if (occ.has(key(c + dc, r + dr))) { ok = false; break; }
      if (ok) {
        const d = Math.abs(c - from.c) + Math.abs(r - from.r);
        if (d < bd) { bd = d; best = { c, r }; }
      }
    }
  }
  return best;
}
