import React from 'react';
import { Trash2 } from 'lucide-react';
import { ClockCfg } from '../homeGrid';

interface Props {
  cfg: ClockCfg;
  size: { w: number; h: number };
  onCfg: (patch: Partial<ClockCfg>) => void;
  /** Devolve false se o tamanho não couber na tela */
  onSize: (w: number, h: number) => boolean;
  onRemove: () => void;
  onClose: () => void;
}

const STYLES: [ClockCfg['style'], string][] = [['digital', 'Digital'], ['thin', 'Fino'], ['stacked', 'Empilhado'], ['minimal', 'Minimal'], ['analog', 'Analógico']];
const SIZES: [number, number, string][] = [[2, 1, '2×1'], [4, 1, '4×1'], [2, 2, '2×2'], [4, 2, '4×2'], [4, 3, '4×3']];
const COLORS = ['auto', '#ffffff', '#fde68a', '#fda4af', '#86efac', '#7dd3fc', '#c4b5fd', '#111111'];

/** Folha de edição do relógio: estilo, tamanho, cor, fundo e alinhamento. A posição se muda arrastando o widget. */
export default function ClockWidgetEditor({ cfg, size, onCfg, onSize, onRemove, onClose }: Props) {
  const [err, setErr] = React.useState('');
  const chip = (on: boolean) => `px-3.5 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${on ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`;
  const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2"><h4 className="text-[11px] font-bold tracking-wider uppercase opacity-55">{title}</h4><div className="flex flex-wrap gap-2">{children}</div></div>
  );
  return (
    <div className="space-y-4 pb-2">
      <div className="sheet-title"><span>Relógio</span><button type="button" className="sheet-action" onClick={onClose}>Pronto</button></div>
      <Row title="Estilo">{STYLES.map(([v, l]) => <button key={v} type="button" className={chip(cfg.style === v)} onClick={() => onCfg({ style: v })}>{l}</button>)}</Row>
      <Row title="Tamanho">
        {SIZES.map(([w, h, l]) => (
          <button key={l} type="button" className={chip(size.w === w && size.h === h)}
            onClick={() => setErr(onSize(w, h) ? '' : 'Não há espaço para esse tamanho. Libere espaço na tela inicial.')}>{l}</button>
        ))}
      </Row>
      {err && <p className="text-xs text-rose-400">{err}</p>}
      <Row title="Cor">
        {COLORS.map(c => (
          <button key={c} type="button" aria-label={c === 'auto' ? 'Automática' : c} onClick={() => onCfg({ color: c })}
            className="w-9 h-9 rounded-full border-2 cursor-pointer text-[10px] font-bold flex items-center justify-center"
            style={{ background: c === 'auto' ? 'linear-gradient(135deg,#fff 50%,#111 50%)' : c, borderColor: cfg.color === c ? 'var(--accent, #3E63DD)' : 'rgba(255,255,255,.25)' }} />
        ))}
        <label className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/25 cursor-pointer relative" style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }}>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(cfg.color) ? cfg.color : '#ffffff'} onChange={e => onCfg({ color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Cor personalizada" />
        </label>
      </Row>
      <Row title="Fundo">{([['none', 'Sem fundo'], ['glass', 'Vidro'], ['solid', 'Sólido']] as const).map(([v, l]) => <button key={v} type="button" className={chip(cfg.bg === v)} onClick={() => onCfg({ bg: v })}>{l}</button>)}</Row>
      <Row title="Alinhamento">{([['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']] as const).map(([v, l]) => <button key={v} type="button" className={chip(cfg.align === v)} onClick={() => onCfg({ align: v })}>{l}</button>)}</Row>
      <Row title="Espessura">{([[200, 'Fina'], [400, 'Normal'], [700, 'Negrito']] as const).map(([v, l]) => <button key={v} type="button" className={chip(cfg.weight === v)} onClick={() => onCfg({ weight: v })}>{l}</button>)}</Row>
      <Row title="Data"><button type="button" className={chip(cfg.date)} onClick={() => onCfg({ date: !cfg.date })}>{cfg.date ? 'Mostrando' : 'Oculta'}</button></Row>
      <p className="text-[11px] opacity-50">Para mudar a posição, arraste o widget na tela inicial em modo de edição.</p>
      <button type="button" onClick={onRemove} className="w-full py-3 rounded-2xl text-sm font-semibold border-0 cursor-pointer bg-red-500/15 text-red-400 flex items-center justify-center gap-2"><Trash2 size={15} />Remover relógio</button>
    </div>
  );
}
