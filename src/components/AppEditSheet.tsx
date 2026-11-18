import React, { useRef, useState } from 'react';
import { iconFromFile } from '../appOverrides';

interface Props {
  defaultName: string;
  name: string;
  iconNormal?: string;
  iconSystem?: string;
  darkMode: boolean;
  customized: boolean;
  onSave: (v: { name: string; iconNormal?: string; iconSystem?: string }) => void;
  onReset: () => void;
  onCancel: () => void;
}

/** Editor de um app: nome e os dois ícones (modo normal e modo cor do sistema). Serve para qualquer app. */
export default function AppEditSheet({ defaultName, name: initialName, iconNormal: n0, iconSystem: s0, darkMode, customized, onSave, onReset, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const [normal, setNormal] = useState<string | undefined>(n0);
  const [system, setSystem] = useState<string | undefined>(s0);
  const normalRef = useRef<HTMLInputElement>(null);
  const systemRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');

  const pick = async (file: File | undefined, set: (v: string) => void) => {
    if (!file) return;
    try { set(await iconFromFile(file)); setErr(''); } catch { setErr('Não foi possível usar essa imagem.'); }
  };
  const slot = (title: string, hint: string, value: string | undefined, set: (v: string | undefined) => void, ref: React.RefObject<HTMLInputElement>, fallbackBg: string) => (
    <div className="flex-1 min-w-0 flex flex-col items-center gap-2">
      <button type="button" onClick={() => ref.current?.click()} aria-label={`Escolher ${title}`}
        className="w-20 h-20 rounded-[22px] overflow-hidden flex items-center justify-center text-[10px] font-semibold border border-slate-300 dark:border-white/10 cursor-pointer"
        style={{ background: value ? 'transparent' : fallbackBg, color: darkMode ? '#cbd5e1' : '#475569' }}>
        {value?.startsWith('data:image') ? <img src={value} alt="" className="w-full h-full object-cover" /> : value ? <span className="text-3xl">{value}</span> : 'Padrão'}
      </button>
      <span className="text-xs font-semibold text-center leading-tight">{title}</span>
      <span className="text-[10px] opacity-55 text-center leading-snug">{hint}</span>
      <div className="flex gap-3 text-[11px] font-semibold">
        <button type="button" onClick={() => ref.current?.click()} className="text-blue-500 border-0 bg-transparent cursor-pointer">Escolher</button>
        {value && <button type="button" onClick={() => set(undefined)} className="text-slate-500 border-0 bg-transparent cursor-pointer">Remover</button>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { pick(e.target.files?.[0], v => set(v)); e.target.value = ''; }} />
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-center">Editar app</h3>
      <label className="block">
        <span className="text-[11px] font-semibold opacity-60">Nome</span>
        <input value={name} maxLength={30} onChange={e => setName(e.target.value)} placeholder={defaultName}
          className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500/50" />
      </label>
      <div className="flex gap-4">
        {slot('Ícone normal', 'Modo colorido', normal, setNormal, normalRef, darkMode ? '#1e293b' : '#e2e8f0')}
        {slot('Ícone cor do sistema', 'Modo escuro, claro ou papel de parede', system, setSystem, systemRef, darkMode ? '#1e293b' : '#e2e8f0')}
      </div>
      {err && <p className="text-xs text-rose-400 text-center">{err}</p>}
      <p className="text-[11px] opacity-50 text-center">Sem imagem, o app usa o desenho padrão. O estilo dos ícones muda em Configurações &gt; Tela.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-slate-100 dark:bg-white/10 border-0 cursor-pointer">Cancelar</button>
        <button type="button" onClick={() => onSave({ name: name.trim() || defaultName, iconNormal: normal, iconSystem: system })}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 border-0 cursor-pointer">Salvar</button>
      </div>
      {customized && <button type="button" onClick={onReset} className="w-full text-xs font-semibold text-red-500 border-0 bg-transparent cursor-pointer">Restaurar nome e ícones originais</button>}
    </div>
  );
}
