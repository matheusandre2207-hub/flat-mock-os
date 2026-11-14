// Apps HTML importados pelo usuário na App Store.
// Cada app roda isolado num iframe sandbox (sem acesso ao localStorage nem ao sistema).

export interface CustomApp {
  id: string;
  name: string;
  html: string;
  color: string;
  /** data: URL de imagem, ou um emoji; vem de <meta name="aeroos-icon"> no HTML */
  iconUrl?: string;
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

export function extractTitle(html: string, fallback: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const t = m?.[1]?.replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, 40) : fallback;
}
