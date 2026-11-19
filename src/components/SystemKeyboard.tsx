import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Delete as DeleteIcon, ArrowBigUp, CornerDownLeft, Search as SearchIcon } from 'lucide-react';
import { usePrefs } from '../prefs';
import { getIconTint } from '../wallpaperTint';

// Teclado do AeroOS. Qualquer campo de texto do sistema abre este teclado (o do celular não aparece):
// os campos recebem inputmode="none" e as teclas são inseridas direto no campo em foco.
// Dentro de apps HTML importados, o campo avisa por mensagem (ver KB_BRIDGE em customApps.ts).

type Layer = 'abc' | 'sym' | 'sym2';
type Shift = 'off' | 'once' | 'lock';
type Kind = 'text' | 'numeric' | 'email' | 'url' | 'password' | 'search';
type Target =
  | { kind: 'dom'; el: HTMLElement; type: string; im: string }
  | { kind: 'frame'; win: Window; type: string };
type Op = { op: 'insert'; text: string } | { op: 'backspace' } | { op: 'enter' };

const TEXT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number', '']);
const ACCENTS: Record<string, string[]> = {
  a: ['á', 'à', 'â', 'ã', 'ä'], e: ['é', 'è', 'ê', 'ë'], i: ['í', 'ì', 'î', 'ï'],
  o: ['ó', 'ò', 'ô', 'õ', 'ö'], u: ['ú', 'ù', 'û', 'ü'], n: ['ñ'],
};
const R1 = 'qwertyuiop'.split('');
const R2 = 'asdfghjklç'.split('');
const R3 = 'zxcvbnm'.split('');
const S1 = '1234567890'.split('');
const S2 = ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'];
const S2B = ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='];
const S3B = ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'];

function editableOf(t: EventTarget | null): HTMLElement | null {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return null;
  if (el.closest?.('[data-sys-kb]') || el.closest?.('[data-native-kb]')) return null;
  if (el.tagName === 'TEXTAREA') return (el as HTMLTextAreaElement).readOnly || (el as HTMLTextAreaElement).disabled ? null : el;
  if (el.tagName === 'INPUT') {
    const i = el as HTMLInputElement;
    const ty = (i.getAttribute('type') || 'text').toLowerCase();
    return TEXT_TYPES.has(ty) && !i.readOnly && !i.disabled ? el : null;
  }
  return el.isContentEditable ? el : null;
}

function kindOf(type: string, im: string): Kind {
  if (type === 'number' || type === 'tel' || im === 'numeric' || im === 'decimal' || im === 'tel') return 'numeric';
  if (type === 'email' || im === 'email') return 'email';
  if (type === 'url' || im === 'url') return 'url';
  if (type === 'password') return 'password';
  if (type === 'search' || im === 'search') return 'search';
  return 'text';
}

const nativeSet = (el: HTMLInputElement | HTMLTextAreaElement, v: string) => {
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
};
function selOf(el: HTMLInputElement | HTMLTextAreaElement): [number, number] {
  const n = el.value.length;
  try { return [el.selectionStart ?? n, el.selectionEnd ?? n]; } catch { return [n, n]; }
}
const caret = (el: HTMLInputElement | HTMLTextAreaElement, p: number) => { try { el.setSelectionRange(p, p); } catch { /* tipo sem seleção */ } };

function domInsert(el: HTMLElement, text: string) {
  if (el.isContentEditable) { document.execCommand('insertText', false, text); return; }
  const i = el as HTMLInputElement;
  const [s, e] = selOf(i);
  const n = i.value.slice(0, s) + text + i.value.slice(e);
  if (i.maxLength > 0 && n.length > i.maxLength) return;
  nativeSet(i, n);
  caret(i, s + text.length);
}
function domBackspace(el: HTMLElement) {
  if (el.isContentEditable) { document.execCommand('delete'); return; }
  const i = el as HTMLInputElement;
  const [s, e] = selOf(i);
  if (s !== e) { nativeSet(i, i.value.slice(0, s) + i.value.slice(e)); caret(i, s); }
  else if (s > 0) { nativeSet(i, i.value.slice(0, s - 1) + i.value.slice(s)); caret(i, s - 1); }
}
function domEnter(el: HTMLElement) {
  const kd = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true } as KeyboardEventInit);
  if (!el.dispatchEvent(kd)) return; // o app tratou o Enter (ex.: enviar mensagem)
  if (el.tagName === 'TEXTAREA' || el.isContentEditable) { domInsert(el, '\n'); return; }
  const f = (el as HTMLInputElement).form;
  if (f) { if (f.requestSubmit) f.requestSubmit(); else f.submit(); } else el.blur();
}

let audioCtx: AudioContext | null = null;
function clickSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = 900;
    g.gain.setValueAtTime(0.04, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.05);
  } catch { /* sem áudio */ }
}

interface Look { bg: string; key: string; special: string; fg: string; accent: string; shadow: string; h: number; radius: number; dark: boolean }

interface KeyProps {
  label: React.ReactNode;
  flex?: number;
  variant?: 'letter' | 'special' | 'accent';
  onTap: () => void;
  alts?: string[];
  onAlt?: (a: string) => void;
  repeat?: boolean;
  align?: 'left' | 'center' | 'right';
  look: Look;
  active?: boolean;
  bubble?: string;
  aria: string;
  buzz: () => void;
}

function Key({ label, flex = 1, variant = 'letter', onTap, alts, onAlt, repeat, align = 'center', look, active, bubble, aria, buzz }: KeyProps) {
  const [down, setDown] = useState(false);
  const [pop, setPop] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const t1 = useRef(0);
  const rep = useRef(0);
  const popped = useRef(false);
  const clear = () => { clearTimeout(t1.current); clearInterval(rep.current); };
  useEffect(() => clear, []);

  const altAt = (x: number, y: number) =>
    (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-alt]')?.getAttribute('data-alt') ?? null;

  const bg = variant === 'accent' ? look.accent : variant === 'special' ? look.special : look.key;
  const fg = variant === 'accent' ? '#fff' : look.fg;
  const popPos: React.CSSProperties = align === 'left' ? { left: 0 } : align === 'right' ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' };

  return (
    <div style={{ flex, minWidth: 0, height: look.h, position: 'relative' }}>
      <button
        type="button"
        aria-label={aria}
        onMouseDown={e => e.preventDefault()}
        onPointerDown={e => {
          e.preventDefault();
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
          setDown(true); popped.current = false; buzz();
          if (alts?.length) t1.current = window.setTimeout(() => { popped.current = true; setPop(true); }, 380);
          else {
            onTap();
            if (repeat) t1.current = window.setTimeout(() => { rep.current = window.setInterval(onTap, 55); }, 420);
          }
        }}
        onPointerMove={e => { if (pop) setHover(altAt(e.clientX, e.clientY)); }}
        onPointerUp={e => {
          clear(); setDown(false);
          if (alts?.length) {
            if (popped.current) { const a = altAt(e.clientX, e.clientY); if (a) onAlt?.(a); setPop(false); setHover(null); }
            else onTap();
          }
        }}
        onPointerCancel={() => { clear(); setDown(false); setPop(false); setHover(null); }}
        onContextMenu={e => e.preventDefault()}
        style={{
          width: '100%', height: '100%', border: 0, padding: 0, borderRadius: look.radius,
          background: active ? look.fg : bg, color: active ? (look.dark ? '#111' : '#fff') : fg,
          boxShadow: look.shadow, fontSize: typeof label === 'string' && label.length > 2 ? 13 : 20, fontWeight: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transform: down ? 'scale(0.93)' : 'none', transition: 'transform .08s ease, background .15s ease', touchAction: 'none',
          fontFamily: 'inherit',
        }}
      >{label}</button>
      {bubble && down && !pop && (
        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, zIndex: 5, pointerEvents: 'none',
          minWidth: look.h * 0.95, height: look.h * 1.15, borderRadius: look.radius + 4, background: look.dark ? '#3a3a42' : '#fff', color: look.fg,
          fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,.35)' }}>{bubble}</div>
      )}
      {pop && alts && (
        <div style={{ position: 'absolute', bottom: '100%', marginBottom: 6, zIndex: 6, display: 'flex', gap: 4, padding: 5, borderRadius: look.radius + 6,
          background: look.dark ? '#2b2b33' : '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.4)', ...popPos }}>
          {alts.map(a => (
            <div key={a} data-alt={a} style={{ width: look.h * 0.8, height: look.h * 0.95, borderRadius: look.radius, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: hover === a ? '#fff' : look.fg, background: hover === a ? look.accent : 'transparent' }}>{a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SystemKeyboard({ darkMode, overlay }: { darkMode: boolean; overlay: boolean }) {
  const { prefs } = usePrefs();
  const kb = prefs.kb;
  const [open, setOpen] = useState(false);
  const [layer, setLayer] = useState<Layer>('abc');
  const [shift, setShift] = useState<Shift>('off');
  const [kind, setKind] = useState<Kind>('text');
  const targetRef = useRef<Target | null>(null);
  const beforeRef = useRef('');
  const lastShift = useRef(0);
  const enabledRef = useRef(kb.enabled);
  enabledRef.current = kb.enabled;

  const getBefore = (): string => {
    const t = targetRef.current;
    if (!t) return '';
    if (t.kind === 'frame') return beforeRef.current;
    const el = t.el as HTMLInputElement;
    try {
      if (el.isContentEditable) return el.textContent || '';
      return el.value.slice(0, selOf(el)[0]);
    } catch { return ''; }
  };
  const refreshCap = () => {
    if (!kb.autoCap || kind !== 'text') return;
    if (/(^|[.!?]\s+)$/.test(getBefore())) setShift(s => (s === 'off' ? 'once' : s));
  };
  const capRef = useRef(refreshCap);
  capRef.current = refreshCap;

  const close = useCallback(() => { setOpen(false); targetRef.current = null; }, []);

  // Inputs do sistema: nunca abrem o teclado do celular (inputmode="none") e abrem este
  useEffect(() => {
    if (!kb.enabled) return;
    const force = (el: Element) => {
      if (!editableOf(el)) return;
      const cur = el.getAttribute('inputmode');
      if (cur !== 'none') { if (cur) (el as HTMLElement).dataset.origIm = cur; el.setAttribute('inputmode', 'none'); }
    };
    const scan = (root: ParentNode) => root.querySelectorAll('input,textarea,[contenteditable]').forEach(force);
    scan(document);
    const mo = new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'attributes') force(m.target as Element);
        else m.addedNodes.forEach(n => { if (n.nodeType === 1) { force(n as Element); scan(n as Element); } });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['inputmode', 'type'] });
    const early = (e: Event) => { const el = editableOf(e.target); if (el) force(el); };
    document.addEventListener('pointerdown', early, true);
    document.addEventListener('touchstart', early, true);
    return () => { mo.disconnect(); document.removeEventListener('pointerdown', early, true); document.removeEventListener('touchstart', early, true); };
  }, [kb.enabled]);

  // Foco: abre, fecha e acompanha o campo
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (!enabledRef.current) return;
      const el = editableOf(e.target);
      if (!el) return;
      const type = el.tagName === 'TEXTAREA' ? 'textarea' : (el.getAttribute('type') || 'text').toLowerCase();
      const im = (el.dataset.origIm || '').toLowerCase();
      targetRef.current = { kind: 'dom', el, type, im };
      setKind(kindOf(type, im)); setLayer('abc'); setShift('off'); setOpen(true);
      window.setTimeout(() => { capRef.current(); try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch { /* ok */ } }, 120);
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (targetRef.current?.kind === 'frame') return;
        const a = document.activeElement as HTMLElement | null;
        if (a && (editableOf(a) || a.closest?.('[data-sys-kb]'))) return;
        close();
      }, 80);
    };
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (!enabledRef.current || !d || typeof d.type !== 'string' || !d.type.startsWith('aeroos-kb-')) return;
      if (d.type === 'aeroos-kb-focus') {
        const ty = String(d.inputType || 'text');
        targetRef.current = { kind: 'frame', win: e.source as Window, type: ty };
        beforeRef.current = String(d.before || '');
        setKind(kindOf(ty, '')); setLayer('abc'); setShift('off'); setOpen(true);
        window.setTimeout(() => capRef.current(), 30);
      } else if (d.type === 'aeroos-kb-blur') {
        if (targetRef.current?.kind === 'frame') close();
      } else if (d.type === 'aeroos-kb-state') {
        beforeRef.current = String(d.before || '');
        capRef.current();
      }
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('message', onMsg);
    // campo removido da tela (app fechado): esconde o teclado
    const watch = window.setInterval(() => {
      const t = targetRef.current;
      if (t?.kind === 'dom' && (!document.contains(t.el) || (t.el as HTMLElement).offsetParent === null)) close();
    }, 600);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('message', onMsg);
      clearInterval(watch);
    };
  }, [close]);

  // Layout
  const rows = 4, gap = 7;
  const total = 30 + rows * kb.height + (rows - 1) * gap + 22 + (kb.suggestions ? 30 : 0);
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--kb-h', open ? `${total}px` : '0px');
    r.dataset.kb = open ? '1' : '0';
    return () => { r.style.setProperty('--kb-h', '0px'); r.dataset.kb = '0'; };
  }, [open, total]);

  // Aparência
  const dark = kb.theme === 'dark' || kb.theme === 'wallpaper' || (kb.theme === 'auto' && darkMode);
  const op = kb.opacity / 100;
  const wp = getIconTint();
  const look: Look = kb.theme === 'wallpaper'
    ? { bg: `hsla(${wp.h}, ${Math.min(wp.s, 40)}%, 11%, ${op})`, key: `hsla(${wp.h}, ${wp.s}%, 34%, 0.5)`, special: `hsla(${wp.h}, ${wp.s}%, 24%, 0.6)`, fg: '#fff', accent: `hsl(${wp.h} ${wp.s}% 52%)`, shadow: '0 1px 0 rgba(0,0,0,.28)', h: kb.height, radius: kb.radius, dark: true }
    : dark
      ? { bg: `rgba(18,18,23,${op})`, key: 'rgba(255,255,255,0.13)', special: 'rgba(255,255,255,0.07)', fg: '#f4f4f5', accent: 'var(--accent, #3E63DD)', shadow: '0 1px 0 rgba(0,0,0,.3)', h: kb.height, radius: kb.radius, dark: true }
      : { bg: `rgba(232,235,241,${op})`, key: 'rgba(255,255,255,0.92)', special: 'rgba(196,201,212,0.7)', fg: '#18181b', accent: 'var(--accent, #3E63DD)', shadow: '0 1px 0 rgba(0,0,0,.14)', h: kb.height, radius: kb.radius, dark: false };

  // Ações
  const buzz = () => { if (kb.vibrate) navigator.vibrate?.(7); if (kb.sound) clickSound(); };
  const send = (op: Op) => {
    const t = targetRef.current;
    if (!t) return;
    if (t.kind === 'frame') { t.win.postMessage({ type: 'aeroos-kb-op', ...op }, '*'); return; }
    if (!document.contains(t.el)) { close(); return; }
    if (document.activeElement !== t.el) (t.el as HTMLElement).focus({ preventScroll: true });
    if (op.op === 'insert') domInsert(t.el, op.text);
    else if (op.op === 'backspace') domBackspace(t.el);
    else domEnter(t.el);
    window.setTimeout(() => capRef.current(), 0);
  };
  const up = shift !== 'off';
  const corrections: Record<string, string> = { 'vc':'você', 'vcs':'vocês', 'pq':'porque', 'tb':'também', 'naum':'não', 'nao':'não', 'voce':'você', 'voces':'vocês', 'tambem':'também', 'ola':'olá', 'ate':'até', 'entao':'então', 'obg':'obrigado', 'q':'que', 'ñ':'não' };
  const currentWord = (getBefore().match(/[\p{L}]+$/u) || [''])[0].toLowerCase();
  const suggestionWords = ['você','vocês','porque','também','não','sim','olá','hoje','amanhã','obrigado','tudo','como','estou','vamos','certo','beleza'];
  const suggestions = currentWord ? Array.from(new Set([currentWord, ...suggestionWords.filter(w => w.startsWith(currentWord)), ...Object.keys(corrections).filter(w => w.startsWith(currentWord) || currentWord.startsWith(w)).map(w => corrections[w])])).slice(0,3) : ['Olá','Tudo','Você'];
  const applySuggestion = (word: string) => {
    const before = getBefore();
    const last = (before.match(/[\p{L}]+$/u) || [''])[0];
    for (let n=0;n<last.length;n++) send({op:'backspace'});
    send({op:'insert', text:word});
  };
  const typeText = (t: string, isLetter = true) => {
    if (t === ' ' && kb.autoCorrect) {
      const liveWord = ((getBefore().match(/[\p{L}]+$/u) || [''])[0]).toLowerCase();
      const correction = corrections[liveWord];
      if (correction) applySuggestion(correction);
    }
    send({ op: 'insert', text: t });
    if (isLetter && shift === 'once') setShift('off');
  };
  const onShift = () => {
    const now = Date.now();
    if (now - lastShift.current < 350) setShift('lock');
    else setShift(s => (s === 'off' ? 'once' : 'off'));
    lastShift.current = now;
  };
  const hide = () => { (document.activeElement as HTMLElement | null)?.blur?.(); close(); };

  const kp = { look, buzz }; // props comuns das teclas (Key é um componente estável: não remonta a cada toque)
  const charKey = (c: string, align: 'left' | 'center' | 'right' = 'center') => {
    const shown = up ? c.toUpperCase() : c;
    const alts = kb.accents && layer === 'abc' && ACCENTS[c] ? ACCENTS[c].map(a => (up ? a.toUpperCase() : a)) : undefined;
    return <Key {...kp} key={c} label={shown} aria={shown} align={align} bubble={shown} alts={alts} onAlt={a => typeText(a)} onTap={() => typeText(shown)} />;
  };
  const symKey = (c: string) => <Key {...kp} key={c} label={c} aria={c} bubble={c} onTap={() => typeText(c, false)} />;
  const row = (children: React.ReactNode, pad = 0) => <div style={{ display: 'flex', gap: 6, padding: `0 ${pad}px` }}>{children}</div>;

  const enterIcon = kind === 'search' ? <SearchIcon size={20} /> : <CornerDownLeft size={20} />;
  const back = <Key {...kp} key="bk" flex={1.5} variant="special" repeat label={<DeleteIcon size={21} />} aria="Apagar" onTap={() => send({ op: 'backspace' })} />;
  const enter = <Key {...kp} key="en" flex={1.7} variant="accent" label={enterIcon} aria="Enter" onTap={() => send({ op: 'enter' })} />;
  const space = <Key {...kp} key="sp" flex={kind === 'email' || kind === 'url' ? 3.6 : 4.4} label={<span style={{ fontSize: 12, opacity: 0.55, letterSpacing: '0.08em' }}>AeroOS</span>} aria="Espaço" onTap={() => typeText(' ', false)} />;
  const sideKey = kind === 'email' ? '@' : kind === 'url' ? '/' : ',';

  let body: React.ReactNode;
  if (kind === 'numeric') {
    const n = (c: string, v: 'letter' | 'special' = 'letter') => <Key {...kp} key={c} variant={v} label={c} aria={c} onTap={() => typeText(c, false)} />;
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {row([n('1'), n('2'), n('3'), <Key {...kp} key="bk" variant="special" repeat label={<DeleteIcon size={21} />} aria="Apagar" onTap={() => send({ op: 'backspace' })} />])}
        {row([n('4'), n('5'), n('6'), n('-', 'special')])}
        {row([n('7'), n('8'), n('9'), n('.', 'special')])}
        {row([n(',', 'special'), n('0'), <Key {...kp} key="sp" label="␣" variant="special" aria="Espaço" onTap={() => typeText(' ', false)} />, <Key {...kp} key="en" variant="accent" label={enterIcon} aria="Enter" onTap={() => send({ op: 'enter' })} />])}
      </div>
    );
  } else if (layer === 'abc') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {row(R1.map((c, i) => charKey(c, i === 0 ? 'left' : i === R1.length - 1 ? 'right' : 'center')))}
        {row(R2.map((c, i) => charKey(c, i === 0 ? 'left' : i === R2.length - 1 ? 'right' : 'center')))}
        {row([
          <Key {...kp} key="sh" flex={1.5} variant="special" active={shift !== 'off'} aria="Maiúsculas" onTap={onShift}
            label={<ArrowBigUp size={22} fill={shift === 'lock' ? 'currentColor' : 'none'} />} />,
          ...R3.map(c => charKey(c)),
          back,
        ])}
        {row([
          <Key {...kp} key="l1" flex={1.5} variant="special" label="?123" aria="Números e símbolos" onTap={() => setLayer('sym')} />,
          <Key {...kp} key="sd" flex={1} label={sideKey} aria={sideKey} onTap={() => typeText(sideKey, false)} />,
          space,
          <Key {...kp} key="dt" flex={1} label="." aria="Ponto" onTap={() => typeText('.', false)} />,
          enter,
        ])}
      </div>
    );
  } else {
    const second = layer === 'sym2';
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {row((second ? S2B : S1).map(symKey))}
        {row((second ? S3B : S2).map(symKey))}
        {row([
          <Key {...kp} key="lt" flex={1.5} variant="special" label={second ? '123' : '#+='} aria="Mais símbolos" onTap={() => setLayer(second ? 'sym' : 'sym2')} />,
          ...['.', ',', '?', '!', "'"].map(symKey),
          back,
        ])}
        {row([
          <Key {...kp} key="l2" flex={1.5} variant="special" label="ABC" aria="Letras" onTap={() => setLayer('abc')} />,
          space,
          enter,
        ])}
      </div>
    );
  }

  return (
    <div
      data-sys-kb=""
      role="group"
      aria-label="Teclado AeroOS"
      onMouseDown={e => e.preventDefault()}
      style={{
        position: 'absolute', left: 0, right: 0, bottom: overlay ? 'var(--sab, 0px)' : 'var(--sys-bottom, 0px)', zIndex: 10050,
        padding: '0 6px 12px', background: look.bg, color: look.fg,
        backdropFilter: `blur(${kb.blur}px) saturate(1.5)`, WebkitBackdropFilter: `blur(${kb.blur}px) saturate(1.5)`,
        borderTop: `1px solid ${look.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        transform: open ? 'translateY(0)' : 'translateY(105%)',
        visibility: open ? 'visible' : 'hidden',
        transition: `transform .28s cubic-bezier(.22,1,.36,1), visibility 0s linear ${open ? '0s' : '.28s'}`,
        touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', fontFamily: 'inherit',
      }}
    >
      <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.4 }}>Teclado AeroOS</span>
        <button type="button" aria-label="Esconder teclado" onMouseDown={e => e.preventDefault()} onPointerDown={e => { e.preventDefault(); hide(); }}
          style={{ width: 32, height: 26, border: 0, background: 'transparent', color: 'inherit', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronDown size={20} />
        </button>
      </div>
      {body}
    </div>
  );
}
