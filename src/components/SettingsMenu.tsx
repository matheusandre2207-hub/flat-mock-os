import React from 'react';
import { Wifi, Signal, Bluetooth, Plane, Bell, Moon, Volume2, Sun, Accessibility, BatteryCharging, Cpu, LayoutGrid, Shield, Info, Terminal, Search, X, ChevronRight, User } from 'lucide-react';

export interface MenuItem { id: string; label: string; desc: string; keywords: string; icon: React.ReactNode; color: string; group: string }

export const MENU_ITEMS: MenuItem[] = [
  { id: 'wifi', label: 'Wi-Fi', desc: 'Redes sem fio', keywords: 'wifi rede internet conexao sinal', icon: <Wifi size={17} />, color: '#3E63DD', group: 'Conexões' },
  { id: 'celular', label: 'Rede móvel', desc: 'Dados móveis, 4G e 5G', keywords: 'celular dados internet chip 4g 5g mobile', icon: <Signal size={17} />, color: '#30A46C', group: 'Conexões' },
  { id: 'bluetooth', label: 'Bluetooth', desc: 'Pareamento de dispositivos', keywords: 'bluetooth pareamento fone', icon: <Bluetooth size={17} />, color: '#4F5BD5', group: 'Conexões' },
  { id: 'aviao', label: 'Modo avião', desc: 'Desliga todas as redes', keywords: 'aviao rede desligar voo', icon: <Plane size={17} />, color: '#F76B15', group: 'Conexões' },
  { id: 'notificacoes', label: 'Notificações', desc: 'Avisos, estilo e contagens', keywords: 'notificacoes avisos alertas', icon: <Bell size={17} />, color: '#E5484D', group: 'Avisos e som' },
  { id: 'dnd', label: 'Não perturbe', desc: 'Silencie avisos e pop-ups', keywords: 'nao perturbe silencio foco dnd', icon: <Moon size={17} />, color: '#6E56CF', group: 'Avisos e som' },
  { id: 'som', label: 'Som e vibração', desc: 'Volume, toque e feedback', keywords: 'som volume toque vibracao ringtone', icon: <Volume2 size={17} />, color: '#D6409F', group: 'Avisos e som' },
  { id: 'tela', label: 'Tela e personalização', desc: 'Tema, papel de parede, ícones, dock e teclado', keywords: 'tela brilho wallpaper papel de parede escuro dark icones dock teclado navegacao', icon: <Sun size={17} />, color: '#0091FF', group: 'Aparência' },
  { id: 'acessibilidade', label: 'Acessibilidade', desc: 'Texto, contraste e filtros', keywords: 'acessibilidade zoom fonte contraste filtro', icon: <Accessibility size={17} />, color: '#12A594', group: 'Aparência' },
  { id: 'bateria', label: 'Bateria', desc: 'Nível, saúde e simulador', keywords: 'bateria nivel carga carregador', icon: <BatteryCharging size={17} />, color: '#30A46C', group: 'Dispositivo' },
  { id: 'memoria', label: 'Memória e armazenamento', desc: 'RAM, apps em execução e espaço', keywords: 'memoria ram armazenamento espaco limpar cache apps execucao', icon: <Cpu size={17} />, color: '#E5A100', group: 'Dispositivo' },
  { id: 'apps', label: 'Aplicativos', desc: 'Instalados e caches', keywords: 'aplicativos apps programas instalados cache', icon: <LayoutGrid size={17} />, color: '#697177', group: 'Dispositivo' },
  { id: 'privacidade', label: 'Privacidade e segurança', desc: 'Permissões, localização e PIN', keywords: 'privacidade seguranca permissao gps localizacao senha pin', icon: <Shield size={17} />, color: '#3E63DD', group: 'Sistema' },
  { id: 'sobre', label: 'Sobre o aparelho', desc: 'Modelo, versão e especificações', keywords: 'sobre atualizacao processador memoria ram hardware sistema versao build', icon: <Info size={17} />, color: '#838a92', group: 'Sistema' },
  { id: 'dev', label: 'Opções do desenvolvedor', desc: 'Informações do sistema e aparência avançada', keywords: 'desenvolvedor dev sistema avancado desfoque opacidade build hora data', icon: <Terminal size={17} />, color: '#1c1c1f', group: 'Sistema' },
];

interface Props {
  darkMode: boolean;
  userName: string;
  userAvatar: string;
  email?: string;
  query: string;
  setQuery: (q: string) => void;
  summaries: Record<string, string>;
  devUnlocked: boolean;
  onOpen: (id: string) => void;
}

/** Menu principal das Configurações: perfil, busca e seções agrupadas, cada uma com ícone colorido e resumo ao vivo. */
export default function SettingsMenu({ darkMode, userName, userAvatar, email, query, setQuery, summaries, devUnlocked, onOpen }: Props) {
  const items = MENU_ITEMS.filter(i => i.id !== 'dev' || devUnlocked);
  const q = query.trim().toLowerCase();
  const found = q ? items.filter(i => (i.label + ' ' + i.desc + ' ' + i.keywords).toLowerCase().includes(q)) : [];
  const groups = Array.from(new Set(items.map(i => i.group)));
  const card = `rounded-2xl overflow-hidden border ${darkMode ? 'bg-slate-900 border-white/5 divide-y divide-white/5' : 'bg-white border-slate-200/60 divide-y divide-slate-100'}`;

  const row = (it: MenuItem) => (
    <button key={it.id} type="button" onClick={() => onOpen(it.id)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left active:bg-slate-500/10 transition-colors">
      <span className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white shrink-0" style={{ background: it.color }}>{it.icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-medium truncate">{it.label}</span>
        <span className="block text-[11.5px] opacity-55 truncate">{q ? it.desc : (summaries[it.id] ?? it.desc)}</span>
      </span>
      <ChevronRight size={16} className="opacity-35 shrink-0" />
    </button>
  );

  return (
    <div className="px-4 pt-5 max-w-md mx-auto w-full flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>

      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3 opacity-45" />
        <input type="text" placeholder="Buscar nas configurações" value={query} onChange={e => setQuery(e.target.value)}
          className={`w-full pl-9 pr-10 py-2.5 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${darkMode ? 'bg-slate-900 text-white border border-white/5' : 'bg-white text-slate-900 border border-slate-200'}`} />
        {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 p-1 rounded-full" aria-label="Limpar"><X size={13} className="opacity-55" /></button>}
      </div>

      {q ? (
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold opacity-50 px-1 uppercase tracking-wider">Resultados</h3>
          {found.length ? <div className={card}>{found.map(row)}</div> : <p className="text-sm opacity-55 text-center py-8">Nada encontrado para “{query}”</p>}
        </div>
      ) : (
        <>
          <button type="button" onClick={() => onOpen('perfil')} className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200/60'}`}>
            <span className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shrink-0" style={{ background: 'color-mix(in srgb, var(--accent, #3E63DD) 18%, transparent)' }}>{userAvatar || <User />}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[17px] font-semibold truncate">{userName}</span>
              <span className="block text-[12px] opacity-55 truncate font-mono">{email ?? 'AeroAccount'}</span>
            </span>
            <ChevronRight size={16} className="opacity-35" />
          </button>
          {groups.map(g => (
            <div key={g} className="space-y-2">
              <h3 className="text-[11px] font-bold opacity-50 px-1 uppercase tracking-wider">{g}</h3>
              <div className={card}>{items.filter(i => i.group === g).map(row)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
