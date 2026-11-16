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
  /** 'html' = arquivo único; 'folder' = pacote de pasta servido pelo Service Worker */
  kind?: 'html' | 'folder';
  /** Apps que já vêm com o sistema e aparecem na loja (não ficam no IndexedDB até serem editados) */
  bundled?: boolean;
  desc?: string;
  category?: 'games' | 'productivity' | 'utilities' | 'creativity' | 'system';
  rating?: number;
  downloads?: string;
  /** Tom da barra de status em paisagem */
  statusTone?: 'auto' | 'dark' | 'light';
  /** Orientação ao abrir o app (se não definida, mantém a atual) */
  orientation?: 'portrait' | 'landscape';
  entry?: string;
  fileCount?: number;
  size: string;
  createdAt: number;
}

export const CUSTOM_APPS_KEY = 'os_custom_apps';
export const MAX_CUSTOM_APP_BYTES = 10_000_000;

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

// Teclado do sistema dentro de apps HTML: o app avisa quando um campo ganha foco e recebe as teclas por mensagem
const KB_BRIDGE = String.raw`<script>(function(){
var TXT={text:1,search:1,email:1,url:1,tel:1,password:1,number:1};
function ed(el){if(!el||!el.tagName)return null;if(el.tagName==='TEXTAREA')return(el.readOnly||el.disabled)?null:el;if(el.tagName==='INPUT'){var t=(el.getAttribute('type')||'text').toLowerCase();return(TXT[t]&&!el.readOnly&&!el.disabled)?el:null}return el.isContentEditable?el:null}
function before(el){try{var v=el.value!==undefined?el.value:el.textContent;var s=el.selectionStart;return v.slice(0,s==null?v.length:s)}catch(e){return ''}}
function post(m){window.parent.postMessage(m,'*')}
var ds=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value'),dt=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');
function setv(el,v){(el.tagName==='TEXTAREA'?dt:ds).set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))}
document.addEventListener('focusin',function(e){var el=ed(e.target);if(!el)return;el.setAttribute('inputmode','none');post({type:'aeroos-kb-focus',inputType:(el.getAttribute('type')||el.tagName).toLowerCase(),before:before(el)})});
document.addEventListener('focusout',function(){setTimeout(function(){if(!ed(document.activeElement))post({type:'aeroos-kb-blur'})},60)});
window.addEventListener('message',function(e){var d=e.data;if(!d||d.type!=='aeroos-kb-op')return;var el=ed(document.activeElement);if(!el)return;
if(el.isContentEditable){if(d.op==='insert')document.execCommand('insertText',false,d.text);else if(d.op==='backspace')document.execCommand('delete');else document.execCommand('insertText',false,'\n');post({type:'aeroos-kb-state',before:before(el)});return}
var v=el.value,s=v.length,en=v.length;try{s=el.selectionStart==null?v.length:el.selectionStart;en=el.selectionEnd==null?v.length:el.selectionEnd}catch(x){}
function caret(p){try{el.setSelectionRange(p,p)}catch(x){}}
if(d.op==='insert'){var n=v.slice(0,s)+d.text+v.slice(en);if(!(el.maxLength>0&&n.length>el.maxLength)){setv(el,n);caret(s+d.text.length)}}
else if(d.op==='backspace'){if(s!==en){setv(el,v.slice(0,s)+v.slice(en));caret(s)}else if(s>0){setv(el,v.slice(0,s-1)+v.slice(s));caret(s-1)}}
else if(d.op==='enter'){var kd=new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true});if(el.dispatchEvent(kd)){if(el.tagName==='TEXTAREA'){setv(el,v.slice(0,s)+'\n'+v.slice(en));caret(s+1)}else if(el.form&&el.form.requestSubmit){el.form.requestSubmit()}else el.blur()}}
post({type:'aeroos-kb-state',before:before(el)})});
})();</script>`;

export function withThemeBridge(html: string): string {
  const inject = THEME_DEFAULTS + THEME_BRIDGE + KB_BRIDGE;
  const m = html.match(/<head[^>]*>/i);
  return m ? html.replace(m[0], m[0] + inject) : inject + html;
}

export function extractTitle(html: string, fallback: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const t = m?.[1]?.replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, 40) : fallback;
}
