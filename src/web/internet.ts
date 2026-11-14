// Internet simulada do AeroOS (inspirada no E-Browser do ElysiaOS, mas com roteamento,
// busca, histórico e estados de erro). Todo o conteúdo é fictício e local.

export interface Site {
  host: string;
  name: string;
  tagline: string;
  accent: string;
}

export const SITES: Site[] = [
  { host: 'aerofind.com', name: 'AeroFind', tagline: 'Pesquise na web simulada', accent: '#6366f1' },
  { host: 'news.aero', name: 'Aero News', tagline: 'Notícias do dia (simuladas)', accent: '#0ea5e9' },
  { host: 'wiki.aero', name: 'AeroWiki', tagline: 'Enciclopédia livre', accent: '#10b981' },
  { host: 'clima.aero', name: 'Clima Aero', tagline: 'Previsão do tempo', accent: '#f59e0b' },
  { host: 'aeroaccount.id', name: 'AeroAccount', tagline: 'Sua conta AeroOS', accent: '#a855f7' },
];

export interface Article {
  id: string;
  host: 'news.aero' | 'wiki.aero';
  title: string;
  summary: string;
  body: string[];
  keywords: string[];
  date: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'aeroos-lancado', host: 'news.aero', date: '14 nov 2026',
    title: 'AeroOS ganha conta própria e internet simulada',
    summary: 'Novidades do sistema: cadastro de conta, navegador com sites e busca.',
    body: [
      'A nova versão do AeroOS começa com a criação de uma conta, com endereço no domínio aeroaccount.id.',
      'O navegador agora abre sites simulados, com busca, histórico e páginas de erro.',
      'Esta notícia é fictícia e serve apenas para demonstrar a internet simulada.',
    ],
    keywords: ['aeroos', 'conta', 'navegador', 'novidade', 'sistema'],
  },
  {
    id: 'telas-moveis', host: 'news.aero', date: '12 nov 2026',
    title: 'Telas de bloqueio ficam mais fluidas em celulares de teste',
    summary: 'Gestos de deslizar e animações ganham novo ritmo nos testes.',
    body: [
      'Testes internos apontam que a tela de bloqueio ficou mais natural ao deslizar.',
      'Conteúdo simulado para o ambiente de demonstração.',
    ],
    keywords: ['tela', 'bloqueio', 'gestos', 'celular', 'animação'],
  },
  {
    id: 'wiki-aeroos', host: 'wiki.aero', date: '—',
    title: 'AeroOS',
    summary: 'Sistema operacional de demonstração com interface de celular.',
    body: [
      'AeroOS é um sistema operacional de demonstração que roda no navegador.',
      'Inclui tela de bloqueio, tela inicial, gaveta de apps, loja e configurações.',
    ],
    keywords: ['aeroos', 'sistema', 'operacional', 'celular'],
  },
  {
    id: 'wiki-internet', host: 'wiki.aero', date: '—',
    title: 'Internet',
    summary: 'Rede mundial de computadores que troca informação por protocolos.',
    body: [
      'A internet conecta redes de computadores usando protocolos como o HTTP.',
      'Neste ambiente, a internet é simulada: os sites são fictícios e ficam no próprio aparelho.',
    ],
    keywords: ['internet', 'rede', 'protocolo', 'http', 'web'],
  },
  {
    id: 'wiki-navegador', host: 'wiki.aero', date: '—',
    title: 'Navegador web',
    summary: 'Programa para acessar páginas e sites.',
    body: [
      'Um navegador exibe páginas, guarda o histórico e permite buscar informações.',
    ],
    keywords: ['navegador', 'browser', 'web', 'site', 'pagina'],
  },
];

export interface Forecast { day: string; max: number; min: number; icon: 'sun' | 'cloud' | 'rain' }
export const FORECAST: Forecast[] = [
  { day: 'Hoje', max: 27, min: 18, icon: 'sun' },
  { day: 'Amanhã', max: 25, min: 17, icon: 'cloud' },
  { day: 'Dom', max: 22, min: 16, icon: 'rain' },
  { day: 'Seg', max: 24, min: 18, icon: 'sun' },
  { day: 'Ter', max: 26, min: 19, icon: 'sun' },
];

export function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, '');
}

/** Interpreta o que foi digitado na barra de endereços. */
export function parseInput(raw: string): { host: string; path: string; query: string } | null {
  let s = raw.trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^https?:\/\//, '');
  const isUrl = /\./.test(s) && !/\s/.test(s);
  if (!isUrl) {
    return { host: 'aerofind.com', path: '/search', query: `q=${encodeURIComponent(raw.trim())}` };
  }
  const [hostPart, ...rest] = s.split('/');
  const pathAndQuery = rest.join('/');
  const [pathPart, query = ''] = pathAndQuery.split('?');
  return {
    host: normalizeHost(hostPart),
    path: '/' + (pathPart || ''),
    query,
  };
}

export function findSite(host: string): Site | undefined {
  return SITES.find(s => s.host === host);
}

export function searchArticles(query: string): Article[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (!terms.length) return [];
  return ARTICLES
    .map(a => {
      const hay = (a.title + ' ' + a.summary + ' ' + a.keywords.join(' ')).toLowerCase();
      const score = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      return { a, score };
    })
    .filter(x => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map(x => x.a);
}
