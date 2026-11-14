// Apps HTML importados pelo usuário na App Store.
// Cada app roda isolado num iframe sandbox (sem acesso ao localStorage nem ao sistema).

export interface CustomApp {
  id: string;
  name: string;
  html: string;
  color: string;
  /** data: URL de imagem, ou um emoji; vem de <meta name="aeroos-icon"> no HTML */
  iconUrl?: string;
  /** Quando true, o app recebe as cores do papel de parede (variáveis --aero-*) */
  followWallpaper?: boolean;
  size: string;
  createdAt: number;
}

export const CUSTOM_APPS_KEY = 'os_custom_apps';
export const MAX_CUSTOM_APP_BYTES = 1_500_000;

const PALETTE = [
  '#E5484D', '#F76B15', '#E5A100', '#30A46C', '#12A594',
  '#1E8FE1', '#3E63DD', '#6E56CF', '#8E4EC6', '#D6409F',
];

// Registro em memória usado pelos ícones (que não recebem props da App)
let registry: CustomApp[] = [];

export function loadCustomApps(): CustomApp[] {
  try {
    const v = JSON.parse(localStorage.getItem(CUSTOM_APPS_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function setCustomAppRegistry(list: CustomApp[]) {
  registry = list;
}

export function getCustomApp(id: string): CustomApp | undefined {
  return registry.find(a => a.id === id);
}

export function isCustomAppId(id: string) {
  return id.startsWith('custom-');
}

export function pickColor(seed: number) {
  return PALETTE[Math.abs(seed) % PALETTE.length];
}

export function makeCustomAppId() {
  return `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Ícone do app: <meta name="aeroos-icon" content="data:image/...;base64,..."> ou um emoji
// (também aceita <link rel="icon" href="data:image/...">)
export function extractIcon(html: string): string | undefined {
  const meta = html.match(/<meta[^>]+name=["']aeroos-icon["'][^>]*content=["']([^"']{1,200000})["']/i);
  if (meta) return meta[1].trim();
  const link = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*href=["'](data:image\/[^"']+)["']/i);
  return link ? link[1] : undefined;
}

// Injeta valores padrão e uma ponte que recebe o tema do sistema por postMessage
const THEME_DEFAULTS = '<style>:root{--aero-accent:#3E63DD;--aero-accent-soft:rgba(62,99,221,.16);--aero-bg:#0b0b0d;--aero-surface:#18181b;--aero-fg:#f4f4f5;--aero-muted:#8a8a94;--aero-mode:dark}</style>';
const THEME_BRIDGE = "<script>(function(){var r=document.documentElement;function apply(v){if(!v)return;for(var k in v){r.style.setProperty('--aero-'+k,v[k]);}r.setAttribute('data-aero-mode',v.mode||'dark');}window.addEventListener('message',function(e){if(e.data&&e.data.type==='aeroos-theme')apply(e.data.vars);});window.parent.postMessage({type:'aeroos-ready'},'*');})();</script>";

export function withThemeBridge(html: string): string {
  const inject = THEME_DEFAULTS + THEME_BRIDGE;
  const m = html.match(/<head[^>]*>/i);
  return m ? html.replace(m[0], m[0] + inject) : inject + html;
}

export function extractTitle(html: string, fallback: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const t = m?.[1]?.replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, 40) : fallback;
}
