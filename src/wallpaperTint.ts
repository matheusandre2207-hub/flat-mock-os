import { useEffect, useMemo, useState } from 'react';

// Cor dos ícones a partir do papel de parede.
// Cores (hex/rgb) são lidas direto do CSS; fotos são amostradas num canvas pequeno.

export interface TintHS { h: number; s: number }
const FALLBACK: TintHS = { h: 226, s: 60 };
const NEUTRAL: TintHS = { h: 220, s: 18 };

// Estado lido pelos ícones (que não recebem props da App)
let iconTintState = { enabled: false, h: 226, s: 60 };
export function setIconTint(v: { enabled: boolean; h: number; s: number }) { iconTintState = v; }
export function getIconTint() { return iconTintState; }

function toHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  let h = 0;
  if (d) {
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h, s, l };
}

// Média circular da tonalidade, pesada pela saturação: o matiz "colorido" dominante vence os cinzas
function summarize(pixels: Array<[number, number, number]>): TintHS {
  let x = 0, y = 0, total = 0, satSum = 0, count = 0;
  for (const [r, g, b] of pixels) {
    const { h, s, l } = toHsl(r, g, b);
    if (s < 0.12 || l < 0.12 || l > 0.9) continue;
    const rad = (h * Math.PI) / 180;
    x += Math.cos(rad) * s;
    y += Math.sin(rad) * s;
    total += s;
    satSum += s;
    count++;
  }
  if (!count) return NEUTRAL;
  const hue = (Math.atan2(y, x) * 180) / Math.PI;
  const sat = Math.round(Math.min(60, Math.max(35, (satSum / count) * 100)));
  return { h: Math.round((hue + 360) % 360), s: sat };
}

// Cores escritas no CSS do papel de parede (hex ou rgb)
function tintFromGradient(gradient: string): TintHS | null {
  const px: Array<[number, number, number]> = [];
  (gradient.match(/#[0-9a-fA-F]{6}/g) || []).forEach(hx => {
    px.push([parseInt(hx.slice(1, 3), 16), parseInt(hx.slice(3, 5), 16), parseInt(hx.slice(5, 7), 16)]);
  });
  const re = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(gradient))) px.push([+m[1], +m[2], +m[3]]);
  return px.length ? summarize(px) : null;
}

// Foto (data URL ou URL): amostra uma grade 32×32
function tintFromImage(src: string): Promise<TintHS | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 32;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const px: Array<[number, number, number]> = [];
        for (let i = 0; i < data.length; i += 4) px.push([data[i], data[i + 1], data[i + 2]]);
        resolve(summarize(px));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function useWallpaperTint(gradient: string): TintHS {
  const fromColors = useMemo(() => tintFromGradient(gradient), [gradient]);
  const [fromPhoto, setFromPhoto] = useState<TintHS | null>(null);

  useEffect(() => {
    if (fromColors) { setFromPhoto(null); return; }
    const m = gradient.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
    if (!m) { setFromPhoto(null); return; }
    let alive = true;
    tintFromImage(m[2]).then(t => { if (alive) setFromPhoto(t); });
    return () => { alive = false; };
  }, [gradient, fromColors]);

  return fromColors ?? fromPhoto ?? FALLBACK;
}

// Fundo de um ícone: matiz do papel de parede com uma variação própria por app
export function tintBackground(h: number, s: number, seed: number): string {
  const hue = (h + ((seed % 45) - 22) + 360) % 360;
  const sat = Math.max(20, Math.min(75, s + (((seed >> 5) % 21) - 10)));
  const light = 45 + (((seed >> 10) % 13) - 6);
  return `linear-gradient(155deg, hsl(${hue} ${sat}% ${light}%) 0%, hsl(${(hue + 26) % 360} ${sat}% ${light - 10}%) 100%)`;
}

// Paleta de destaque (azul do sistema) tirada da cor média dos ícones.
// Vira as variáveis --accent e as escalas blue/sky/indigo do próprio sistema, só na tela.
export function buildAccentPalette(h: number, s: number): Record<string, string> {
  const sat = Math.max(35, Math.min(62, s));
  const steps: Array<[string, number]> = [
    ['50', 96], ['100', 92], ['200', 85], ['300', 76], ['400', 66], ['500', 56],
    ['600', 46], ['700', 40], ['800', 33], ['900', 26], ['950', 18],
  ];
  const vars: Record<string, string> = {};
  for (const fam of ['blue', 'sky', 'indigo']) {
    for (const [k, l] of steps) vars[`--color-${fam}-${k}`] = `hsl(${h} ${sat}% ${l}%)`;
  }
  vars['--accent'] = `hsl(${h} ${sat}% 46%)`;
  vars['--accent-soft'] = `hsl(${h} ${sat}% 46% / 0.16)`;
  return vars;
}

// Cores que um app HTML recebe quando marcado para "mudar com o papel de parede" (--aero-*)
export function buildAppTheme(h: number, s: number, dark: boolean): Record<string, string> {
  if (dark) {
    return {
      mode: 'dark',
      accent: `hsl(${h} ${s}% 58%)`,
      'accent-soft': `hsl(${h} ${s}% 58% / 0.18)`,
      bg: `hsl(${h} 18% 7%)`,
      surface: `hsl(${h} 16% 12%)`,
      fg: '#f4f4f5',
      muted: '#8a8a94',
    };
  }
  return {
    mode: 'light',
    accent: `hsl(${h} ${s}% 46%)`,
    'accent-soft': `hsl(${h} ${s}% 46% / 0.14)`,
    bg: `hsl(${h} 25% 97%)`,
    surface: '#ffffff',
    fg: '#18181b',
    muted: '#71717a',
  };
}
