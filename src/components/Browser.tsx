import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Globe, Search, 
  BookOpen, Github, Languages, ChevronRight
} from 'lucide-react';

interface BrowserProps {
  darkMode: boolean;
  isActive?: boolean;
}

interface PageHistory {
  url: string;
  type: 'home' | 'google' | 'wiki' | 'github' | 'translate' | 'results';
  query?: string;
}

export default function Browser({ darkMode, isActive = false }: BrowserProps) {
  const [addressInput, setAddressInput] = useState('mocksearch.com');
  const [history, setHistory] = useState<PageHistory[]>([{ url: 'mocksearch.com', type: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Search, Translate, etc. temporary forms states
  const [searchQuery, setSearchQuery] = useState('');
  const [translateText, setTranslateText] = useState('');
  const [targetLang, setTargetLang] = useState<'pt' | 'en' | 'es'>('en');
  const [translationOutput, setTranslationOutput] = useState('');

  const currentPage = history[historyIndex] || { url: 'mocksearch.com', type: 'home' };

  const navigateTo = (url: string, type: PageHistory['type'], extra?: Partial<PageHistory>) => {
    const newPage: PageHistory = { url, type, ...extra };
    const truncatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...truncatedHistory, newPage]);
    setHistoryIndex(truncatedHistory.length);
    setAddressInput(url);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setAddressInput(history[idx].url);
    }
  };

  // Handle system back gesture
  React.useEffect(() => {
    const handleBack = (e: Event) => {
      if (!isActive) return;
      if (historyIndex > 0) {
        handleGoBack();
        e.preventDefault();
      }
    };
    window.addEventListener('mockos-back', handleBack);
    return () => window.removeEventListener('mockos-back', handleBack);
  }, [historyIndex, history, isActive]);

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setAddressInput(history[idx].url);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = addressInput.toLowerCase().trim();
    if (!url) return;

    if (url.includes('google')) {
      navigateTo('google.com', 'google');
    } else if (url.includes('wikipedia') || url.includes('wiki')) {
      navigateTo('wikipedia.org/wiki/MockOS', 'wiki');
    } else if (url.includes('github')) {
      navigateTo('github.com/mateus-oliveira/mock-os', 'github');
    } else if (url.includes('translate') || url.includes('tradutor')) {
      navigateTo('translate.google.com', 'translate');
    } else {
      // General Google Search fallback
      navigateTo(`google.com/search?q=${encodeURIComponent(url)}`, 'results', { query: url });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo(`google.com/search?q=${encodeURIComponent(searchQuery)}`, 'results', { query: searchQuery });
    }
  };

  const handleTranslate = () => {
    if (!translateText.trim()) {
      setTranslationOutput('');
      return;
    }

    const dict: Record<string, Record<'pt' | 'en' | 'es', string>> = {
      'olá': { pt: 'Olá', en: 'Hello', es: 'Hola' },
      'bom dia': { pt: 'Bom dia', en: 'Good morning', es: 'Buenos días' },
      'bateria': { pt: 'Bateria', en: 'Battery', es: 'Batería' },
      'brilho': { pt: 'Brilho', en: 'Brightness', es: 'Brillo' },
      'computador': { pt: 'Computador', en: 'Computer', es: 'Computadora' },
      'te amo': { pt: 'Te amo', en: 'I love you', es: 'Te amo' },
      'projeto': { pt: 'Projeto', en: 'Project', es: 'Proyecto' },
      'sistema operacional': { pt: 'Sistema Operacional', en: 'Operating System', es: 'Sistema Operativo' }
    };

    const cleanInput = translateText.toLowerCase().trim();
    
    // Exact word translation
    if (dict[cleanInput]) {
      setTranslationOutput(dict[cleanInput][targetLang]);
      return;
    }

    // fallback silly mock translation
    if (targetLang === 'en') {
      setTranslationOutput(translateText + " [translated to English]");
    } else if (targetLang === 'es') {
      setTranslationOutput("El " + translateText + "o [translated to Spanish]");
    } else {
      setTranslationOutput(translateText + " [traduzido para o Português]");
    }
  };

  return (
    <div className={`h-full flex flex-col rounded-none overflow-hidden ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Browser address bar / navigation controls header */}
      <div className={`pt-3 pb-3 px-5 border-b flex items-center gap-2 ${
        darkMode ? 'bg-slate-900/60 border-white/10' : 'bg-slate-200/50 border-slate-200'
      }`}>
        <button 
          onClick={handleGoBack}
          disabled={historyIndex === 0}
          className="p-1 rounded-lg hover:bg-black/10 disabled:opacity-30 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <button 
          onClick={handleGoForward}
          disabled={historyIndex === history.length - 1}
          className="p-1 rounded-lg hover:bg-black/10 disabled:opacity-30 cursor-pointer"
        >
          <ArrowRight size={16} />
        </button>
        <button 
          onClick={() => setAddressInput(currentPage.url)}
          className="p-1 rounded-lg hover:bg-black/10"
        >
          <RotateCw size={14} />
        </button>

        {/* Address text box */}
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <div className={`flex items-center px-3 py-1 rounded-xl border ${
            darkMode ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <Globe size={12} className="opacity-40 mr-1.5" />
            <input
              type="text"
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              className="w-full text-xs bg-transparent outline-none"
            />
          </div>
        </form>
      </div>

      {/* WEB VIEWPORT SCREEN AREA */}
      <div className={`flex-1 overflow-y-auto no-scrollbar bg-white text-slate-800`}>
        
        {/* VIEW 1: HOME/SHORTCUTS SCREEN */}
        {currentPage.type === 'home' && (
          <div className="p-6 max-w-sm mx-auto text-center space-y-8 pt-10">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MockSearch
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Navegue na rede simulada do Mock OS</p>
            </div>

            {/* Quick shortcuts grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                onClick={() => navigateTo('google.com', 'google')}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-slate-800"
              >
                <Search size={24} className="text-blue-500" />
                <span className="text-[11px] font-bold">Google</span>
              </button>

              <button 
                onClick={() => navigateTo('wikipedia.org/wiki/MockOS', 'wiki')}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-slate-800"
              >
                <BookOpen size={24} className="text-emerald-500" />
                <span className="text-[11px] font-bold">Wikipedia</span>
              </button>

              <button 
                onClick={() => navigateTo('github.com/mateus-oliveira/mock-os', 'github')}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-slate-800"
              >
                <Github size={24} className="text-purple-600" />
                <span className="text-[11px] font-bold">GitHub</span>
              </button>

              <button 
                onClick={() => navigateTo('translate.google.com', 'translate')}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-slate-800"
              >
                <Languages size={24} className="text-amber-500" />
                <span className="text-[11px] font-bold">Tradutor</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              Digite "google", "wiki" ou "github" acima para navegar!
            </div>
          </div>
        )}

        {/* VIEW 2: MOCK GOOGLE SEARCH */}
        {currentPage.type === 'google' && (
          <div className="p-6 text-center space-y-6 pt-12">
            <h1 className="text-3xl font-black">
              <span className="text-blue-600">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-600">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </h1>

            <form onSubmit={handleSearchSubmit} className="max-w-xs mx-auto flex items-center bg-slate-100 border border-slate-200 rounded-full px-4 py-2 shadow-sm">
              <Search size={14} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Pesquisar na rede..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-slate-800"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* VIEW 3: MOCK GOOGLE SEARCH RESULTS */}
        {currentPage.type === 'results' && (
          <div className="p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center gap-3">
              <span className="text-blue-600 font-bold text-sm">Google</span>
              <span className="text-xs text-slate-500 font-mono">Resultados para: "{currentPage.query}"</span>
            </div>

            <div className="space-y-4 max-w-md">
              {/* Result item 1 */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 truncate">https://www.mockos.org/mateus-oliveira</p>
                <h3 className="text-blue-600 font-bold hover:underline text-sm cursor-pointer" onClick={() => navigateTo('wikipedia.org/wiki/MockOS', 'wiki')}>
                  Mock OS - O melhor simulador em React de Mateus Oliveira
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore recursos de bateria realistas de 3 pontinhos (...), controle de brilho uniforme por overlay, e aplicativos de música e mensagens de alta fidelidade de Mateus.
                </p>
              </div>

              {/* Result item 2 */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 truncate">https://github.com/mateus-oliveira/mock-os</p>
                <h3 className="text-blue-600 font-bold hover:underline text-sm cursor-pointer" onClick={() => navigateTo('github.com/mateus-oliveira/mock-os', 'github')}>
                  GitHub - mateus-oliveira/mock-os: Full implementation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Código fonte aberto para o Mock OS. Estrelando calculadora elegante, galeria com alteração de wallpaper dinâmica, navegador com histórico de páginas e muito mais.
                </p>
              </div>

              {/* Result item 3 */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 truncate">https://www.wikipedia.org/wiki/Sistemas</p>
                <h3 className="text-blue-600 font-bold hover:underline text-sm cursor-pointer">
                  O que é um Sistema Operacional Simulado?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Um sistema operacional simulado é um software que roda dentro do navegador imitando as propriedades gráficas de um smartphone real, oferecendo diversão e valor educacional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: MOCK WIKIPEDIA */}
        {currentPage.type === 'wiki' && (
          <div className="p-4 space-y-3.5">
            <div className="border-b border-slate-200 pb-2.5 flex items-center gap-1.5">
              <span className="text-xl">📖</span>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight leading-none">Wikipédia</h2>
                <span className="text-[9px] text-slate-400 font-mono">A enciclopédia livre</span>
              </div>
            </div>

            <div className="space-y-2.5 max-w-md">
              <h1 className="text-xl font-bold tracking-tight border-b border-slate-100 pb-1">Mock OS</h1>
              <p className="text-xs text-slate-700 leading-relaxed">
                O <b>Mock OS</b> é um simulador de sistema operacional móvel experimental, codificado inteiramente utilizando <b>React</b>, <b>TypeScript</b> e <b>Tailwind CSS</b>. 
              </p>
              <h3 className="font-bold text-xs border-b border-slate-100 pt-2 pb-0.5">Arquitetura</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Ao contrário de sistemas tradicionais baseados em Iframe que podem gerar distorções de tamanho, o Mock OS renderiza seus aplicativos modularmente em blocos HTML nativos, assegurando 100% de responsividade tanto em computadores desktop quanto em aparelhos de smartphone físicos.
              </p>
              <h3 className="font-bold text-xs border-b border-slate-100 pt-2 pb-0.5">Recursos Principais</h3>
              <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                <li><b>Controle de Brilho Avançado:</b> Utiliza um overlay de opacidade em tela cheia para simular dimerização perfeitamente neutra em cores.</li>
                <li><b>Sistema de Bateria de 3 Pontos (...):</b> Um design minimalista de bateria em formato de três esferas que acendem ou piscam dependendo se o cabo de recarga está ativo ou em descarga.</li>
                <li><b>Aplicativo de Mensagens Ativo:</b> Oferece um robô chatbot inteligente local para bater papo em tempo real.</li>
              </ul>
            </div>
          </div>
        )}

        {/* VIEW 5: MOCK GITHUB */}
        {currentPage.type === 'github' && (
          <div className="bg-slate-900 text-slate-100 min-h-full p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Github size={20} className="text-white" />
                <span className="text-xs font-mono font-bold hover:underline cursor-pointer">mateus-oliveira / <b>mock-os</b></span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold">★ 412 stars</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs font-mono">
              <p className="text-green-400 text-[10px] font-bold">README.md</p>
              <h2 className="text-sm font-bold text-white">🚀 Mock OS v1.0.4</h2>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Este repositório contém a versão completa e otimizada do simulador móvel de Mateus Oliveira. Desenvolvido para resolver bugs de brilho, persistência de estados e simulação de bateria.
              </p>
              <div className="text-[10px] bg-slate-900 p-2 rounded-lg border border-slate-800 mt-2 space-y-1 text-slate-300">
                <p className="text-blue-400 font-bold">$ npm install</p>
                <p className="text-blue-400 font-bold">$ npm run dev</p>
                <p className="text-slate-500">// Servidor rodando em http://localhost:3000</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: MOCK TRANSLATE */}
        {currentPage.type === 'translate' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-2">
              <Languages size={18} />
              <span className="text-xs">Google Tradutor</span>
            </div>

            <div className="space-y-3.5">
              <textarea
                placeholder="Escreva algo em Português... (ex: 'olá', 'bateria', 'bom dia')"
                value={translateText}
                onChange={e => setTranslateText(e.target.value)}
                className="w-full h-20 p-2 text-xs border border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-blue-500 resize-none"
              />

              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Para:</span>
                  <select 
                    value={targetLang}
                    onChange={e => setTargetLang(e.target.value as any)}
                    className="p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="en">Inglês 🇺🇸</option>
                    <option value="es">Espanhol 🇪🇸</option>
                    <option value="pt">Português 🇧🇷</option>
                  </select>
                </div>
                <button 
                  onClick={handleTranslate}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Traduzir
                </button>
              </div>

              {translationOutput && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                  <span className="text-[10px] text-blue-400 block font-bold uppercase font-mono">Tradução</span>
                  <p className="text-xs font-semibold text-blue-900 mt-1">{translationOutput}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
