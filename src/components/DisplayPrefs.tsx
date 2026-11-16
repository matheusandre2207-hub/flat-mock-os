import React from 'react';
import { usePrefs, setPrefs, ClockPref, NavStyle, DrawerStyle, KbPrefs } from '../prefs';
import { getIconTint } from '../wallpaperTint';

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

function Range({ title, value, min, max, unit, onChange }: { title: string; value: number; min: number; max: number; unit: string; onChange: (n: number) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs"><span className="font-medium">{title}</span><span className="opacity-55 tabular-nums">{value}{unit}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} aria-label={title}
        className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-300 dark:bg-slate-700" />
    </div>
  );
}

function AccentExplainer({ on }: { on: boolean }) {
  const t = getIconTint();
  const sw = [-22, -12, 0, 10, 22].map(d => `hsl(${(t.h + d + 360) % 360} ${t.s}% 46%)`);
  return (
    <div className="rounded-xl p-3.5 space-y-2.5 bg-slate-100 dark:bg-slate-800/70 text-xs leading-relaxed">
      <div className="flex items-center gap-2">
        <div className="flex">{sw.map((c, i) => <span key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 -ml-1.5 first:ml-0" style={{ background: c }} />)}</div>
        <span className="font-semibold">Cor do seu papel de parede</span>
      </div>
      <p className="opacity-70">1. O AeroOS lê as cores do papel de parede (se for foto, ele amostra a imagem) e calcula uma tonalidade média.</p>
      <p className="opacity-70">2. Cada ícone ganha uma variação própria dessa tonalidade, com matiz, saturação e brilho levemente diferentes. É por isso que não ficam todos iguais.</p>
      <p className="opacity-70">3. O azul de destaque do sistema (barras, botões, interruptores, controles rápidos, notificações e teclado) passa a usar o meio dessa faixa de cores.</p>
      <p className="opacity-70">4. Apps HTML podem receber essas cores pelas variáveis <code>--aero-*</code>, se o interruptor "Mudar com o papel de parede" estiver ligado no app, dentro da loja.</p>
      <p className="font-medium">{on ? 'Ligado: as cores acima estão em uso agora.' : 'Desligado: tudo usa o azul padrão. Ligue o interruptor acima para ver a diferença.'}</p>
    </div>
  );
}

function KeyboardSection() {
  const { prefs } = usePrefs();
  const kb = prefs.kb;
  const set = (patch: Partial<KbPrefs>) => setPrefs({ kb: { ...kb, ...patch } });
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Teclado do sistema</h3>
        <p className="text-xs opacity-55 mt-0.5">Todos os campos de texto usam o teclado do AeroOS, e o teclado do celular não aparece.</p>
      </div>
      <Switch title="Usar o teclado do AeroOS" desc="Desligue para voltar ao teclado do celular." checked={kb.enabled} onChange={b => set({ enabled: b })} />
      <div className="space-y-2">
        <h4 className="text-xs font-semibold opacity-70">Tema</h4>
        <Seg value={kb.theme} onChange={v => set({ theme: v as KbPrefs['theme'] })}
          options={[['auto', 'Automático'], ['dark', 'Escuro'], ['light', 'Claro'], ['wallpaper', 'Papel de parede']]} />
        <p className="text-xs opacity-55">{kb.theme === 'auto' ? 'Segue o modo claro/escuro do sistema.' : kb.theme === 'wallpaper' ? 'Usa a cor do seu papel de parede nas teclas.' : 'Fixo, independente do tema do sistema.'}</p>
      </div>
      <Range title="Transparência" value={kb.opacity} min={30} max={100} unit="%" onChange={n => set({ opacity: n })} />
      <Range title="Desfoque do fundo" value={kb.blur} min={0} max={40} unit="px" onChange={n => set({ blur: n })} />
      <Range title="Altura das teclas" value={kb.height} min={34} max={60} unit="px" onChange={n => set({ height: n })} />
      <Range title="Arredondamento" value={kb.radius} min={4} max={22} unit="px" onChange={n => set({ radius: n })} />
      <Switch title="Maiúscula automática" desc="Começa frases com letra maiúscula." checked={kb.autoCap} onChange={b => set({ autoCap: b })} />
      <Switch title="Acentos ao segurar" desc="Segure uma vogal para ver á, ã, é, ô e outras." checked={kb.accents} onChange={b => set({ accents: b })} />
      <Switch title="Vibração" desc="Vibra levemente ao tocar nas teclas." checked={kb.vibrate} onChange={b => set({ vibrate: b })} />
      <Switch title="Som das teclas" desc="Toca um clique suave." checked={kb.sound} onChange={b => set({ sound: b })} />
      <input type="text" placeholder="Toque aqui para testar o teclado"
        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 outline-none border border-transparent focus:border-blue-500/50" />
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
      <AccentExplainer on={prefs.iconTint} />
      <Switch title="Dois toques para apagar a tela" desc="Na tela inicial, toque duas vezes num espaço vazio. Dois toques na tela apagada ligam a tela de bloqueio." checked={prefs.doubleTapSleep} onChange={b => setPrefs({ doubleTapSleep: b })} />
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <ClockSection scope="home" title="Relógio da tela inicial" />
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <ClockSection scope="lock" title="Relógio da tela de bloqueio" />
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <div className="space-y-2.5">
        <div>
          <h3 className="text-sm font-semibold">Estilo de navegação</h3>
          <p className="text-xs opacity-55 mt-0.5">
            {prefs.navStyle === 'buttons'
              ? 'Botões fixos embaixo: voltar, início e apps em segundo plano, como no Android.'
              : 'Gestos: deslize da borda para voltar, de baixo para cima para ir ao início.'}
          </p>
        </div>
        <Seg value={prefs.navStyle} onChange={v => setPrefs({ navStyle: v as NavStyle })}
          options={[['gestures', 'Gestos'], ['buttons', 'Botões']]} />
      </div>
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <div className="space-y-2.5">
        <div>
          <h3 className="text-sm font-semibold">Gaveta de apps (barra lateral)</h3>
          <p className="text-xs opacity-55 mt-0.5">
            {prefs.drawerStyle === 'grid' ? 'Grade de ícones com o nome embaixo.' : 'Lista clássica, como antes.'}
          </p>
        </div>
        <Seg value={prefs.drawerStyle} onChange={v => setPrefs({ drawerStyle: v as DrawerStyle })}
          options={[['list', 'Lista'], ['grid', 'Grade']]} />
      </div>
      <div className="h-px bg-slate-200 dark:bg-white/10" />
      <KeyboardSection />
    </div>
  );
}
