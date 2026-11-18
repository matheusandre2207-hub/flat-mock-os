// Nome e ícones personalizados de qualquer app (padrão do sistema, da loja ou importado).
// Cada app tem dois ícones: o do modo normal (colorido) e o do modo "cor do sistema" (escuro, claro ou papel de parede).

export interface AppOverride { name?: string; iconNormal?: string; iconSystem?: string }

const KEY = 'os_app_overrides';
let registry: Record<string, AppOverride> = {};

export function loadOverrides(): Record<string, AppOverride> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}
export function saveOverrides(m: Record<string, AppOverride>) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* cota cheia: vale só nesta sessão */ }
}
export function setOverrideRegistry(m: Record<string, AppOverride>) { registry = m; }
export function getAppOverride(id: string): AppOverride | undefined { return registry[id]; }

/** Recorta a imagem em quadrado e reduz para 128 px (leve para guardar). */
export function iconFromFile(file: File, size = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const side = Math.min(img.width, img.height);
      c.getContext('2d')?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const webp = c.toDataURL('image/webp', 0.88);
      resolve(webp.startsWith('data:image/webp') ? webp : c.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem inválida')); };
    img.src = url;
  });
}
