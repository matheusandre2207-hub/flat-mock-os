import React, { useEffect, useState } from 'react';
import { Cpu, Smartphone, Moon, Terminal, RefreshCw, Check, X } from 'lucide-react';
import { usePrefs, setPrefs, DEFAULTS } from '../prefs';
import { useMemory, fmtMem, freedByClosing } from '../memorySim';
import { GlassSection } from './DisplayPrefs';

const Card = ({ dark, children, className = '' }: { dark: boolean; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-4 ${dark ? 'bg-slate-900' : 'bg-white'} ${className}`}>{children}</div>
);
const Title = ({ children }: { children: React.ReactNode }) => <h3 className="text-[11px] font-bold opacity-50 uppercase tracking-wider px-1 mb-2">{children}</h3>;
const Row = ({ k, v, onClick }: { k: string; v: React.ReactNode; onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-start justify-between gap-4 py-2.5 border-b border-slate-200/40 dark:border-white/5 last:border-0 ${onClick ? 'cursor-pointer active:opacity-60' : ''}`}>
    <span className="text-[13px] opacity-60 shrink-0">{k}</span>
    <span className="text-[13px] font-medium text-right break-words min-w-0">{v}</span>
  </div>
);
const Switch = ({ title, desc, checked, onChange }: { title: string; desc?: string; checked: boolean; onChange: (b: boolean) => void }) => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <div className="min-w-0"><div className="text-[14px] font-medium">{title}</div>{desc && <div className="text-[11.5px] opacity-55 mt-0.5">{desc}</div>}</div>
    <input type="checkbox" className="os-switch" checked={checked} onChange={e => onChange(e.target.checked)} aria-label={title} />
  </div>
);

const hashStr = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0; return Math.abs(h); };
const digits = (seed: number, n: number) => { let x = seed || 1, out = ''; for (let i = 0; i < n; i++) { x = (Math.imul(x, 1103515245) + 12345) & 0x7fffffff; out += String(x % 10); } return out; };

/* ===================== MEMÓRIA E ARMAZENAMENTO ===================== */
export function MemoryPanel({ darkMode, installedApps, openedApps, appNames, onCloseApps }: { darkMode: boolean; installedApps: string[]; openedApps: string[]; appNames: Record<string, string>; onCloseApps: (ids: string[]) => void }) {
  const { prefs } = usePrefs();
  const m = useMemory();
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { navigator.storage?.estimate?.().then(e => setEst({ usage: e.usage ?? 0, quota: e.quota ?? 0 })).catch(() => {}); }, []);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); }, [msg]);

  // anel: sistema, apps, cache e livre
  const R = 70, C = 2 * Math.PI * R;
  const segs = [
    { v: m.system, c: '#3E63DD', n: 'Sistema' }, { v: m.appsTotal, c: '#E5A100', n: 'Apps' }, { v: m.cached, c: '#8b93a1', n: 'Cache' },
  ];
  let acc = 0;
  const hist = m.history;
  const max = Math.max(m.total * 0.9, ...hist), min = Math.min(...hist, max * 0.2);
  const path = hist.map((v, i) => `${i ? 'L' : 'M'}${(i / Math.max(1, hist.length - 1)) * 300},${70 - ((v - min) / Math.max(1, max - min)) * 62}`).join(' ');
  const bg = openedApps.filter(id => id !== 'configuracoes');

  const totalGb = prefs.dev.storageGb;
  const sysGb = Math.min(14.2, totalGb * 0.14);
  const appsGb = 0.6 + installedApps.length * 0.045;
  const dataGb = (est?.usage ?? 0) / 1e9;
  const otherGb = 2.1;
  const usedGb = sysGb + appsGb + dataGb + otherGb;
  const parts = [{ n: 'Sistema', v: sysGb, c: '#3E63DD' }, { n: 'Apps', v: appsGb, c: '#E5A100' }, { n: 'Dados do AeroOS', v: dataGb, c: '#30A46C' }, { n: 'Outros', v: otherGb, c: '#8b93a1' }];
  const fmtGb = (g: number) => (g < 1 ? `${Math.round(g * 1024)} MB` : `${g.toFixed(1).replace('.', ',')} GB`);

  return (
    <div className="space-y-5">
      <div>
        <Title>Memória RAM</Title>
        <Card dark={darkMode} className="flex flex-col items-center gap-4">
          <div className="relative w-[170px] h-[170px]">
            <svg viewBox="0 0 170 170" className="-rotate-90 w-full h-full">
              <circle cx="85" cy="85" r={R} fill="none" stroke={darkMode ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'} strokeWidth="14" />
              {segs.map(s => {
                const len = (s.v / m.total) * C; const el = <circle key={s.n} cx="85" cy="85" r={R} fill="none" stroke={s.c} strokeWidth="14" strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-acc} style={{ transition: 'all .8s ease' }} />;
                acc += len; return el;
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-light tabular-nums leading-none">{fmtMem(m.used)}</span>
              <span className="text-[11px] opacity-55 mt-1">de {fmtMem(m.total)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] w-full">
            {segs.map(s => <div key={s.n} className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: s.c }} /><span className="opacity-60">{s.n}</span><b className="ml-auto tabular-nums">{fmtMem(s.v)}</b></div>)}
            <div className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full border border-slate-400" /><span className="opacity-60">Livre</span><b className="ml-auto tabular-nums">{fmtMem(m.free)}</b></div>
          </div>
          <div className="w-full">
            <svg viewBox="0 0 300 70" className="w-full h-16"><path d={path} fill="none" stroke="var(--accent, #3E63DD)" strokeWidth="2" strokeLinejoin="round" /></svg>
            <div className="flex justify-between text-[10px] opacity-45"><span>há ~2 min</span><span>agora</span></div>
          </div>
          <div className="w-full flex items-center justify-between text-[12px]">
            <span className="opacity-60">Pressão de memória</span>
            <b className={m.pressure === 'ok' ? 'text-emerald-500' : m.pressure === 'alta' ? 'text-amber-500' : 'text-rose-500'}>{m.pressure === 'ok' ? 'Normal' : m.pressure === 'alta' ? 'Alta' : 'Crítica'}</b>
          </div>
        </Card>
      </div>

      <div>
        <Title>Apps em execução</Title>
        <Card dark={darkMode} className="space-y-1">
          {m.apps.length === 0 && <p className="text-[13px] opacity-55 py-2">Nenhum app aberto.</p>}
          {m.apps.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{appNames[a.id] ?? a.id}</div>
                <div className="h-1.5 rounded-full mt-1.5 overflow-hidden bg-slate-200/70 dark:bg-white/10"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (a.mb / 700) * 100)}%`, background: '#E5A100', transition: 'width .8s ease' }} /></div>
              </div>
              <span className="text-[12px] tabular-nums opacity-70 w-16 text-right">{fmtMem(a.mb)}</span>
              {a.id !== 'configuracoes' && <button type="button" onClick={() => { const mb = freedByClosing([a.id]); onCloseApps([a.id]); setMsg(`${fmtMem(mb)} liberados`); }} aria-label="Fechar app" className="opacity-55"><X size={15} /></button>}
            </div>
          ))}
          <button type="button" disabled={bg.length === 0} onClick={() => { const mb = freedByClosing(bg); onCloseApps(bg); setMsg(mb ? `${fmtMem(mb)} liberados` : 'Nada para liberar'); }}
            className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'var(--accent, #3E63DD)' }}>Limpar memória</button>
          {msg && <p className="text-[12px] text-emerald-500 text-center font-medium pt-1"><Check size={13} className="inline -mt-0.5 mr-1" />{msg}</p>}
        </Card>
      </div>

      <div>
        <Title>Armazenamento</Title>
        <Card dark={darkMode} className="space-y-3">
          <div className="flex items-baseline justify-between"><span className="text-[22px] font-light tabular-nums">{fmtGb(usedGb)}</span><span className="text-[12px] opacity-55">de {totalGb} GB usados</span></div>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-200/70 dark:bg-white/10">
            {parts.map(p => <div key={p.n} style={{ width: `${(p.v / totalGb) * 100}%`, background: p.c }} />)}
          </div>
          <div className="space-y-1.5">
            {parts.map(p => <div key={p.n} className="flex items-center gap-2 text-[12px]"><i className="w-2.5 h-2.5 rounded-full" style={{ background: p.c }} /><span className="opacity-60">{p.n}</span><b className="ml-auto tabular-nums">{fmtGb(p.v)}</b></div>)}
            <div className="flex items-center gap-2 text-[12px]"><i className="w-2.5 h-2.5 rounded-full border border-slate-400" /><span className="opacity-60">Livre</span><b className="ml-auto tabular-nums">{fmtGb(totalGb - usedGb)}</b></div>
          </div>
          {est && est.quota > 0 && <p className="text-[11px] opacity-45">Dados do AeroOS: uso real do navegador, {fmtGb(est.usage / 1e9)} de {fmtGb(est.quota / 1e9)} permitidos.</p>}
        </Card>
      </div>
    </div>
  );
}

/* ===================== NÃO PERTURBE ===================== */
export function DndPanel({ darkMode, dnd, setDnd }: { darkMode: boolean; dnd: boolean; setDnd: (b: boolean) => void }) {
  const { prefs } = usePrefs();
  return (
    <div className="space-y-5">
      <Card dark={darkMode} className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white" style={{ background: dnd ? '#6E56CF' : '#8b93a1', transition: 'background .3s' }}><Moon size={30} /></div>
        <div><div className="text-[17px] font-semibold">{dnd ? 'Não perturbe ativado' : 'Não perturbe desativado'}</div><div className="text-[12px] opacity-55 mt-1">Também está na central de controle e aparece como uma lua na barra de status.</div></div>
        <input type="checkbox" className="os-switch" checked={dnd} onChange={e => setDnd(e.target.checked)} aria-label="Não perturbe" />
      </Card>
      <div>
        <Title>O que muda</Title>
        <Card dark={darkMode} className="divide-y divide-slate-200/40 dark:divide-white/5">
          <Switch title="Esconder avisos na tela de bloqueio" desc="Com o Não perturbe ligado, a tela de bloqueio não lista as notificações." checked={prefs.dndHideLock} onChange={b => setPrefs({ dndHideLock: b })} />
          <div className="py-2.5 text-[12.5px] opacity-70 space-y-1.5">
            <p>• Os pop-ups no topo da tela não aparecem.</p>
            <p>• Os sons de notificação ficam mudos.</p>
            <p>• As mensagens continuam chegando e ficam no histórico de notificações.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ===================== SOBRE O APARELHO ===================== */
export function AboutPanel({ darkMode, userName, language, battery, email, checking, updateMessage, onCheck, onDevTap }: {
  darkMode: boolean; userName: string; language: string; battery: number; email?: string; checking: boolean; updateMessage: string; onCheck: () => void; onDevTap: () => string;
}) {
  const { prefs } = usePrefs();
  const d = prefs.dev;
  const [uptime, setUptime] = useState(0);
  const [toast, setToast] = useState('');
  useEffect(() => { const t0 = performance.now(); const i = setInterval(() => setUptime(Math.floor((performance.now() - t0) / 1000) + Math.floor(t0 / 1000)), 1000); return () => clearInterval(i); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t); }, [toast]);
  const seed = hashStr(userName + d.model);
  const dpr = window.devicePixelRatio || 1;
  const up = `${Math.floor(uptime / 3600)}h ${String(Math.floor((uptime % 3600) / 60)).padStart(2, '0')}min`;
  const patch = new Date(); patch.setDate(1);
  const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return '—'; } })();
  const name = d.deviceName || `${d.model} de ${userName}`;
  return (
    <div className="space-y-5">
      <Card dark={darkMode} className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#6E56CF,#3E63DD)' }}><Smartphone size={26} /></div>
        <div className="min-w-0"><div className="text-[16px] font-semibold truncate">{name}</div><div className="text-[12px] opacity-55">{d.maker} {d.model}</div></div>
      </Card>
      <div><Title>Sistema</Title><Card dark={darkMode}>
        <Row k="Sistema operacional" v={`${d.osName} ${d.osVersion} “${d.codename}”`} />
        <Row k="Número da versão" v={d.build} onClick={() => setToast(onDevTap())} />
        <Row k="Patch de segurança" v={patch.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', { month: 'long', year: 'numeric' })} />
        <Row k="Kernel" v="aero-kernel 6.1.0-universe" />
        <Row k="Tempo ligado" v={up} />
        <div className="pt-3"><button type="button" onClick={onCheck} disabled={checking} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50" style={{ background: 'var(--accent, #3E63DD)' }}>
          <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />{checking ? 'Buscando atualizações…' : 'Verificar atualização'}</button>
          {updateMessage && <p className="text-[11px] text-emerald-500 font-bold mt-2"><Check size={13} className="inline mr-1 -mt-0.5" />{updateMessage}</p>}</div>
      </Card></div>
      {toast && <div className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 px-4 py-2 rounded-full text-xs font-semibold bg-black/80 text-white">{toast}</div>}
      <div><Title>Hardware</Title><Card dark={darkMode}>
        <Row k="Processador" v="Aero A1 · 8 núcleos · 3,2 GHz" />
        <Row k="Gráficos" v="Aero G1 · 6 núcleos" />
        <Row k="Memória RAM" v={`${d.ramGb} GB`} />
        <Row k="Armazenamento" v={`${d.storageGb} GB`} />
        <Row k="Tela" v={`${Math.round(window.innerWidth * dpr)} × ${Math.round(window.innerHeight * dpr)} px · ${Math.round(dpr * 160)} dpi`} />
        <Row k="Taxa de atualização" v="Até 120 Hz" />
        <Row k="Bateria" v={`${Math.round(battery)}% · saúde 97%`} />
      </Card></div>
      <div><Title>Identificação</Title><Card dark={darkMode}>
        <Row k="Conta" v={email ?? 'Sem conta'} />
        <Row k="Número de série" v={`AERO${seed.toString(16).toUpperCase().padStart(8, '0')}`} />
        <Row k="IMEI" v={digits(seed, 15)} />
        <Row k="Endereço Wi-Fi" v={Array.from({ length: 6 }, (_, i) => digits(seed + i * 17, 2)).join(':')} />
        <Row k="Idioma" v={language === 'en' ? 'English' : 'Português (Brasil)'} />
        <Row k="Fuso horário" v={tz} />
      </Card></div>
    </div>
  );
}

/* ===================== OPÇÕES DO DESENVOLVEDOR ===================== */
export function DeveloperPanel({ darkMode }: { darkMode: boolean }) {
  const { prefs } = usePrefs();
  const d = prefs.dev;
  const set = (patch: Partial<typeof d>) => setPrefs({ dev: { ...d, ...patch } });
  const field = (label: string, key: 'osName' | 'osVersion' | 'codename' | 'build' | 'model' | 'maker' | 'deviceName', ph?: string) => (
    <label className="block py-1.5">
      <span className="text-[11px] font-semibold opacity-55">{label}</span>
      <input value={d[key]} placeholder={ph} onChange={e => set({ [key]: e.target.value } as any)} maxLength={40}
        className={`mt-1 w-full px-3 py-2 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500/50 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
    </label>
  );
  const seg = (title: string, value: number, opts: number[], unit: string, key: 'ramGb' | 'storageGb') => (
    <div className="py-2 space-y-1.5">
      <span className="text-[11px] font-semibold opacity-55">{title}</span>
      <div className={`flex p-1 rounded-xl gap-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {opts.map(o => <button key={o} type="button" onClick={() => set({ [key]: o } as any)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer ${value === o ? 'bg-blue-600 text-white' : 'bg-transparent opacity-70'}`}>{o}{unit}</button>)}
      </div>
    </div>
  );
  const now = new Date(Date.now() + d.timeOffsetMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return (
    <div className="space-y-5">
      <Card dark={darkMode} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-black text-emerald-400 flex items-center justify-center"><Terminal size={20} /></div>
        <div className="text-[12px] opacity-65 leading-snug">Opções avançadas. Mudar estas informações altera só o que o AeroOS mostra e simula.</div>
      </Card>
      <div><Title>Informações do sistema</Title><Card dark={darkMode}>
        {field('Nome do sistema', 'osName')}{field('Versão', 'osVersion')}{field('Codinome', 'codename')}{field('Número da versão (build)', 'build')}
        {field('Fabricante', 'maker')}{field('Modelo', 'model')}{field('Nome do dispositivo', 'deviceName', `${d.model} de você`)}
        {seg('Memória RAM', d.ramGb, [4, 6, 8, 12, 16], ' GB', 'ramGb')}
        {seg('Armazenamento', d.storageGb, [64, 128, 256, 512], ' GB', 'storageGb')}
      </Card></div>
      <div><Title>Data e hora do sistema</Title><Card dark={darkMode} className="space-y-2">
        <input type="datetime-local" value={local} onChange={e => { const t = new Date(e.target.value).getTime(); if (!Number.isNaN(t)) set({ timeOffsetMs: t - Date.now() }); }}
          className={`w-full px-3 py-2 rounded-xl text-sm outline-none ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
        <div className="flex items-center justify-between text-[12px]"><span className="opacity-55">{d.timeOffsetMs ? 'Usando hora personalizada' : 'Usando a hora real'}</span>
          {d.timeOffsetMs !== 0 && <button type="button" onClick={() => set({ timeOffsetMs: 0 })} className="font-semibold text-blue-500 border-0 bg-transparent cursor-pointer">Usar hora real</button>}</div>
      </Card></div>
      <div><Title>Aparência avançada</Title><Card dark={darkMode}><GlassSection /></Card></div>
      <div className="space-y-2">
        <button type="button" onClick={() => setPrefs({ dev: { ...DEFAULTS.dev, enabled: true } })} className={`w-full py-3 rounded-2xl text-sm font-semibold border-0 cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>Restaurar informações padrão</button>
        <button type="button" onClick={() => setPrefs({ dev: { ...d, enabled: false } })} className="w-full py-3 rounded-2xl text-sm font-semibold border-0 cursor-pointer bg-red-500/10 text-red-500">Desativar modo desenvolvedor</button>
      </div>
    </div>
  );
}
