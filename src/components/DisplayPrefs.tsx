import React from 'react';
import { usePrefs, setPrefs, ClockPref } from '../prefs';

function Seg({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium press ${value === v ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Switch({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs opacity-55 mt-0.5">{desc}</p>
      </div>
      <input type="checkbox" className="os-switch" checked={checked} aria-label={title} onChange={e => onChange(e.target.checked)} />
    </div>
  );
}

function ClockSection({ scope, title }: { scope: 'home' | 'lock'; title: string }) {
  const { prefs } = usePrefs();
  const p = prefs[scope];
  const set = (patch: Partial<ClockPref>) => setPrefs({ [scope]: { ...p, ...patch } } as any);
  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Seg value={p.style} onChange={v => set({ style: v as ClockPref['style'] })}
        options={[['light', 'Fino'], ['bold', 'Negrito'], ['stacked', 'Empilhado'], ['mono', 'Compacto'], ['none', 'Oculto']]} />
      {p.style !== 'none' && (
        <>
          <Seg value={p.pos} onChange={v => set({ pos: v as ClockPref['pos'] })} options={[['top', 'Topo'], ['center', 'Centro'], ['bottom', 'Base']]} />
          <Seg value={p.align} onChange={v => set({ align: v as ClockPref['align'] })} options={[['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']]} />
        </>
      )}
    </div>
  );
}

export default function DisplayPrefs() {
  const { prefs } = usePrefs();
  return (
    <div className="rounded-2xl p-4 space-y-5 bg-white dark:bg-slate-900">
      <Switch title="Ícones combinando com o papel de parede" desc="Pinta os ícones dos apps com a cor do papel de parede da tela inicial." checked={prefs.iconTint} onChange={b => setPrefs({ iconTint: b })} />
      <Switch title="Dois toques para apagar a tela" desc="Na tela inicial, toque duas vezes num espaço vazio. Dois toques na tela apagada ligam a tela de bloqueio." checked={prefs.doubleTapSleep} onChange={b => setPrefs({ doubleTapSleep: b })} />
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <ClockSection scope="home" title="Relógio da tela inicial" />
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <ClockSection scope="lock" title="Relógio da tela de bloqueio" />
    </div>
  );
}
