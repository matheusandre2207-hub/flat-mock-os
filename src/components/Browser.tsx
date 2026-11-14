import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, House, Lock, Search, WifiOff, Globe, Cloud, CloudRain, Sun } from 'lucide-react';
import { SITES, ARTICLES, FORECAST, Article, Site, parseInput, findSite, searchArticles } from '../web/internet';
import type { PublicAccount } from '../accountDb';

interface BrowserProps {
  darkMode: boolean;
  isActive?: boolean;
  /** Vem do Wi-Fi / dados: sem conexão, a internet simulada mostra a página de offline */
  online?: boolean;
  account?: PublicAccount | null;
}

interface Entry {
  host: string;
  path: string;
  query: string;
  raw: string;
}

const HOME: Entry = { host: 'aerofind.com', path: '/', query: '', raw: 'aerofind.com' };

function entryFrom(input: { host: string; path: string; query: string }, raw?: string): Entry {
  const url = input.host + (input.path === '/' ? '' : input.path) + (input.query ? '?' + input.query : '');
  return { ...input, raw: raw ?? url };
}

type Route =
  | { kind: 'offline' }
  | { kind: 'dns'; host: string }
  | { kind: 'notfound'; host: string }
  | { kind: 'home' }
  | { kind: 'search'; q: string }
  | { kind: 'news' }
  | { kind: 'article'; article: Article }
  | { kind: 'wiki' }
  | { kind: 'weather' }
  | { kind: 'account' };

function routeFor(e: Entry, online: boolean): Route {
  if (!online) return { kind: 'offline' };
  const site = findSite(e.host);
  if (!site) return { kind: 'dns', host: e.host };
  const seg = e.path.split('/').filter(Boolean);
  const q = new URLSearchParams(e.query).get('q') ?? '';

  switch (e.host) {
    case 'aerofind.com':
      if (seg.length === 0) return { kind: 'home' };
      if (seg[0] === 'search') return { kind: 'search', q };
      break;
    case 'news.aero': {
      if (seg.length === 0) return { kind: 'news' };
      const a = ARTICLES.find(x => x.host === 'news.aero' && x.id === seg[1]);
      if (seg[0] === 'a' && a) return { kind: 'article', article: a };
      break;
    }
    case 'wiki.aero': {
      if (seg.length === 0) return { kind: 'wiki' };
      const a = ARTICLES.find(x => x.host === 'wiki.aero' && x.id === seg[1]);
      if (seg[0] === 'wiki' && a) return { kind: 'article', article: a };
      break;
    }
    case 'clima.aero':
      if (seg.length === 0) return { kind: 'weather' };
      break;
    case 'aeroaccount.id':
      if (seg.length === 0) return { kind: 'account' };
      break;
  }
  return { kind: 'notfound', host: e.host };
}

export default function Browser({ darkMode, isActive = false, online = true, account = null }: BrowserProps) {
  const [history, setHistory] = useState<Entry[]>([HOME]);
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState(HOME.raw);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const timerRef = useRef<number | null>(null);

  const current = history[index] ?? HOME;
  const route = routeFor(current, online);

  // Carregamento simulado: barra de progresso e um pequeno atraso, como uma rede de verdade
  useEffect(() => {
    setLoading(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setLoading(false), 360 + Math.random() * 480);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, reloadKey, online]);

  useEffect(() => {
    setAddress(current.raw);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (raw: string) => {
    const parsed = parseInput(raw);
    if (!parsed) return;
    const entry = entryFrom(parsed, raw.trim());
    const next = [...history.slice(0, index + 1), entry];
    setHistory(next);
    setIndex(next.length - 1);
  };

  // Gesto/botão de voltar do sistema: volta uma página do navegador antes de fechar o app
  useEffect(() => {
    const handleBack = (e: Event) => {
      if (!isActive) return;
      if (index > 0) {
        setIndex(i => i - 1);
        e.preventDefault();
      }
    };
    window.addEventListener('mockos-back', handleBack);
    return () => window.removeEventListener('mockos-back', handleBack);
  }, [index, isActive]);

  const canBack = index > 0;
  const canForward = index < history.length - 1;

  const bg = darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900';
  const muted = darkMode ? 'text-zinc-400' : 'text-zinc-500';
  const card = darkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100';
  const site = findSite(current.host);
  const accent = site?.accent ?? '#71717a';

  const page = (() => {
    switch (route.kind) {
      case 'offline':
        return (
          <Centered icon={<WifiOff size={30} />} title="Sem conexão com a internet" muted={muted}>
            <p className={`text-xs ${muted}`}>Ative o Wi-Fi ou os dados móveis e tente de novo.</p>
            <button className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" onClick={() => setReloadKey(k => k + 1)}>
              Tentar novamente
            </button>
          </Centered>
        );
      case 'dns':
        return (
          <Centered icon={<Globe size={30} />} title="Não foi possível encontrar o servidor" muted={muted}>
            <p className={`text-xs ${muted}`}>
              Verifique o endereço <b>{route.host}</b> ou pesquise no AeroFind.
            </p>
            <button className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white" onClick={() => go('aerofind.com')}>
              Ir para o AeroFind
            </button>
          </Centered>
        );
      case 'notfound':
        return (
          <Centered icon={<span className="text-3xl font-light">404</span>} title="Página não encontrada" muted={muted}>
            <p className={`text-xs ${muted}`}>{route.host} não tem esta página.</p>
            <button className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" onClick={() => go(site ? site.host : 'aerofind.com')}>
              Voltar ao início do site
            </button>
          </Centered>
        );
      case 'home':
        return (
          <div className="flex flex-col items-center px-6 pt-10 pb-8 gap-6">
            <div className="text-center">
              <h1 className="text-3xl font-light tracking-tight"><span style={{ color: '#6366f1' }}>Aero</span>Find</h1>
              <p className={`text-xs mt-1 ${muted}`}>Pesquise na web simulada</p>
            </div>
            <SearchBox darkMode={darkMode} onSubmit={q => go(`aerofind.com/search?q=${encodeURIComponent(q)}`)} />
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
              {SITES.filter(s => s.host !== 'aerofind.com').map(s => (
                <button key={s.host} onClick={() => go(s.host)} className={`text-left p-3 rounded-2xl border transition-colors ${card}`}>
                  <span className="block w-6 h-6 rounded-lg mb-2" style={{ background: s.accent }} />
                  <span className="block text-xs font-semibold">{s.name}</span>
                  <span className={`block text-[10px] mt-0.5 ${muted}`}>{s.host}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'search': {
        const results = searchArticles(route.q);
        const siteHits = SITES.filter(s => route.q && s.name.toLowerCase().includes(route.q.toLowerCase()));
        return (
          <div className="px-5 pt-5 pb-8">
            <SearchBox darkMode={darkMode} initial={route.q} onSubmit={q => go(`aerofind.com/search?q=${encodeURIComponent(q)}`)} compact />
            <p className={`text-[11px] mt-4 mb-3 ${muted}`}>
              {results.length + siteHits.length} resultado(s) para &ldquo;{route.q}&rdquo; (simulados)
            </p>
            <div className="flex flex-col gap-3">
              {siteHits.map(s => (
                <button key={s.host} onClick={() => go(s.host)} className={`text-left p-3.5 rounded-2xl border ${card}`}>
                  <span className="text-[11px]" style={{ color: s.accent }}>{s.host}</span>
                  <span className="block text-sm font-semibold mt-0.5">{s.name}</span>
                  <span className={`block text-xs mt-0.5 ${muted}`}>{s.tagline}</span>
                </button>
              ))}
              {results.map(a => (
                <button key={a.id} onClick={() => go(`${a.host}/${a.host === 'news.aero' ? 'a' : 'wiki'}/${a.id}`)} className={`text-left p-3.5 rounded-2xl border ${card}`}>
                  <span className={`text-[11px] ${muted}`}>{a.host}</span>
                  <span className="block text-sm font-semibold mt-0.5">{a.title}</span>
                  <span className={`block text-xs mt-1 ${muted}`}>{a.summary}</span>
                </button>
              ))}
              {results.length === 0 && siteHits.length === 0 && (
                <p className={`text-xs py-8 text-center ${muted}`}>Nada encontrado. Tente outras palavras.</p>
              )}
            </div>
          </div>
        );
      }
      case 'news':
        return (
          <div className="px-5 pt-5 pb-8">
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: accent }}>Aero News</h1>
            <p className={`text-xs mb-4 ${muted}`}>Notícias simuladas para demonstração</p>
            <div className="flex flex-col gap-3">
              {ARTICLES.filter(a => a.host === 'news.aero').map(a => (
                <button key={a.id} onClick={() => go(`news.aero/a/${a.id}`)} className={`text-left p-4 rounded-2xl border ${card}`}>
                  <span className={`text-[10px] ${muted}`}>{a.date}</span>
                  <span className="block text-sm font-semibold mt-1 leading-snug">{a.title}</span>
                  <span className={`block text-xs mt-1.5 leading-relaxed ${muted}`}>{a.summary}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'article':
        return (
          <article className="px-5 pt-5 pb-10 max-w-prose">
            <button onClick={() => go(route.article.host)} className={`text-[11px] mb-3 ${muted}`}>← {route.article.host}</button>
            <h1 className="text-xl font-semibold tracking-tight leading-snug">{route.article.title}</h1>
            <p className={`text-[11px] mt-1 mb-4 ${muted}`}>{route.article.date}</p>
            {route.article.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed mb-3 opacity-90">{p}</p>
            ))}
          </article>
        );
      case 'wiki':
        return (
          <div className="px-5 pt-5 pb-8">
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: accent }}>AeroWiki</h1>
            <p className={`text-xs mb-4 ${muted}`}>Enciclopédia livre (conteúdo simulado)</p>
            <div className="flex flex-col gap-3">
              {ARTICLES.filter(a => a.host === 'wiki.aero').map(a => (
                <button key={a.id} onClick={() => go(`wiki.aero/wiki/${a.id}`)} className={`text-left p-4 rounded-2xl border ${card}`}>
                  <span className="block text-sm font-semibold">{a.title}</span>
                  <span className={`block text-xs mt-1 ${muted}`}>{a.summary}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'weather': {
        const now = FORECAST[0];
        return (
          <div className="px-5 pt-6 pb-8 flex flex-col gap-6">
            <div>
              <p className={`text-xs ${muted}`}>Sua cidade (simulado)</p>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-6xl font-extralight tabular-nums">{now.max}°</span>
                <span className={`text-sm pb-2 ${muted}`}>Mín {now.min}°</span>
              </div>
            </div>
            <div className={`grid grid-cols-5 gap-1 text-center rounded-2xl border p-2 ${card}`}>
              {FORECAST.map(f => (
                <div key={f.day} className="flex flex-col items-center gap-1.5 py-2">
                  <span className={`text-[10px] ${muted}`}>{f.day}</span>
                  <WeatherIcon kind={f.icon} />
                  <span className="text-xs font-semibold">{f.max}°</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'account':
        return (
          <div className="px-5 pt-6 pb-8">
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: accent }}>AeroAccount</h1>
            <p className={`text-xs mb-6 ${muted}`}>Sua identidade no AeroOS</p>
            {account ? (
              <div className={`rounded-3xl border p-5 flex flex-col gap-4 ${card}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-purple-500/15">{account.avatar}</div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold truncate">{account.name}</p>
                    <p className={`text-xs font-mono truncate ${muted}`}>{account.email}</p>
                  </div>
                </div>
                <div className={`text-[11px] ${muted}`}>
                  Conta criada em {new Date(account.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            ) : (
              <p className={`text-sm ${muted}`}>Nenhuma conta AeroOS neste aparelho ainda.</p>
            )}
          </div>
        );
    }
  })();

  return (
    <div className={`flex flex-col h-full ${bg}`}>
      {/* Barra de endereços */}
      <div className={`shrink-0 px-3 pt-2 pb-2 flex items-center gap-1.5 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <button disabled={!canBack} onClick={() => setIndex(i => i - 1)} className={`w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`} aria-label="Voltar">
          <ArrowLeft size={16} />
        </button>
        <button disabled={!canForward} onClick={() => setIndex(i => i + 1)} className={`w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`} aria-label="Avançar">
          <ArrowRight size={16} />
        </button>
        <form
          className={`flex-1 min-w-0 flex items-center gap-1.5 px-3 h-9 rounded-full ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}
          onSubmit={(e) => { e.preventDefault(); go(address); }}
        >
          <Lock size={11} className={online ? 'text-emerald-500' : 'opacity-40'} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 bg-transparent outline-none text-xs font-mono"
            aria-label="Endereço"
            spellCheck={false}
          />
        </form>
        <button onClick={() => setReloadKey(k => k + 1)} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`} aria-label="Recarregar">
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={() => go('aerofind.com')} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`} aria-label="Início">
          <House size={14} />
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="h-0.5 shrink-0 overflow-hidden">
        {loading && <div className="h-full w-1/3 animate-[nav-progress_0.9s_ease-in-out_infinite]" style={{ background: accent }} />}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity .2s' }}>
        {page}
      </div>

      <style>{`
        @keyframes nav-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(320%); } }
      `}</style>
    </div>
  );
}

function SearchBox({ darkMode, onSubmit, initial = '', compact = false }: { darkMode: boolean; onSubmit: (q: string) => void; initial?: string; compact?: boolean }) {
  const [q, setQ] = useState(initial);
  return (
    <form
      className={`w-full ${compact ? 'max-w-none' : 'max-w-xs'} flex items-center gap-2 px-4 h-11 rounded-full border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) onSubmit(q.trim()); }}
    >
      <Search size={14} className="opacity-50" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar no AeroFind" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
    </form>
  );
}

function Centered({ icon, title, children, muted }: { icon: React.ReactNode; title: string; children: React.ReactNode; muted: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-16 min-h-[60%]">
      <div className={`mb-4 ${muted}`}>{icon}</div>
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function WeatherIcon({ kind }: { kind: 'sun' | 'cloud' | 'rain' }) {
  if (kind === 'sun') return <Sun size={16} className="text-amber-400" />;
  if (kind === 'cloud') return <Cloud size={16} className="opacity-70" />;
  return <CloudRain size={16} className="text-sky-400" />;
}

export type { Site };
