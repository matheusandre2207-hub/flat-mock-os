import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, MessageSquare } from 'lucide-react';
import { Chat, Message } from '../types';

interface MessagesAppProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  darkMode: boolean;
  isActive?: boolean;
}

export default function MessagesApp({ chats, setChats, darkMode, isActive = false }: MessagesAppProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [typingChatId, setTypingChatId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === selectedChatId) || null;

  // Auto-scroll to bottom of conversation safely
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeChat?.messages, typingChatId]);

  // Handle Mark Chat as Read when opened
  useEffect(() => {
    if (selectedChatId) {
      setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, unread: false } : c));
    }
  }, [selectedChatId]);

  // Handle system back gesture
  useEffect(() => {
    const handleBack = (e: Event) => {
      if (!isActive) return;
      if (selectedChatId !== null) {
        setSelectedChatId(null);
        e.preventDefault();
      }
    };
    window.addEventListener('mockos-back', handleBack);
    return () => window.removeEventListener('mockos-back', handleBack);
  }, [selectedChatId, isActive]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !selectedChatId || !activeChat) return;

    const userMsgText = textInput.trim();
    setTextInput('');

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp
    };

    // 1. Add user message to active chat
    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return { ...c, messages: [...c.messages, userMsg] };
      }
      return c;
    }));

    // 2. Trigger chatbot simulated typing & response
    setTypingChatId(selectedChatId);

    setTimeout(() => {
      let responseText = '';
      const query = userMsgText.toLowerCase();

      // Simple keyword triggers for the AI Assistant Chatbot
      if (selectedChatId === 'ai-assistant') {
        if (query.includes('ajuda') || query.includes('como funciona')) {
          responseText = "Comandos do Mock OS! Você pode abrir o painel deslizando ou clicando na hora (Notificações) ou nos ícones da direita (Painel de Atalhos). Use o app de Configurações para simular a bateria.";
        } else if (query.includes('bateria') || query.includes('pontos') || query.includes('carregar')) {
          responseText = "Para ver os 3 pontinhos mudarem, use o 'Simulador de Bateria' nas Configurações! Ele permite simular o cabo conectado ou mudar a carga de 0 a 100% de forma interativa.";
        } else if (query.includes('brilho') || query.includes('tela') || query.includes('escuro')) {
          responseText = "O controle de brilho usa uma camada escura super realista que reduz a luz uniformemente sem quebrar o visual da sua tela! Tente ajustar na barra de utilitários.";
        } else if (query.includes('clima') || query.includes('tempo')) {
          responseText = "Sol entre nuvens! Temperatura simulada de 24°C com ventos calmos no Mock OS.";
        } else if (query.includes('criador') || query.includes('mateus')) {
          responseText = "O Mock OS foi idealizado por Mateus Oliveira para simular um celular perfeito, interativo e leve.";
        } else {
          responseText = "Entendido! Como Inteligência Artificial de teste, posso te ajudar a explorar. Experimente perguntar sobre: 'bateria', 'brilho' ou 'ajuda'!";
        }
      } 
      // Mom replies
      else if (selectedChatId === 'mother') {
        if (query.includes('comi') || query.includes('almoço') || query.includes('janta') || query.includes('comida')) {
          responseText = "Que bom meu filho! Come bastante salada também tá? Se cuida e não dorme muito tarde! Beijo 😘";
        } else if (query.includes('estudando') || query.includes('trabalho') || query.includes('programando')) {
          responseText = "Estou tão orgulhosa de você! Sei que vai dar tudo certo nesse projeto. Te amo! ❤️";
        } else {
          responseText = "Que legal! Depois vem me visitar para comer um bolo de cenoura fresquinho. Te amo, Deus te abençoe! 🙏👵";
        }
      } 
      // Tech Support replies
      else if (selectedChatId === 'tech-support') {
        responseText = "Olá! Obrigado pelo retorno. O sistema de gerenciamento de bateria e o filtro de brilho estão 100% calibrados. Caso encontre problemas, por favor limpe o cache do app de arquivos ou mude de wallpaper!";
      } 
      // Notes replies (notes to self, repeats)
      else if (selectedChatId === 'self-notes') {
        responseText = "📝 Nota registrada nas anotações do sistema.";
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'contact',
        text: responseText,
        timestamp
      };

      setChats(prev => prev.map(c => {
        if (c.id === selectedChatId) {
          return { ...c, messages: [...c.messages, botMsg] };
        }
        return c;
      }));

      setTypingChatId(null);
    }, 1200);
  };

  return (
    <div className={`h-full flex rounded-none overflow-hidden ${darkMode ? 'text-white bg-slate-950' : 'text-slate-900 bg-white'}`}>
      
      {/* 1. CHATS SIDEBAR LIST (Shown when no chat selected on small, or split) */}
      <div className={`w-full md:w-80 flex flex-col border-r ${darkMode ? 'border-white/10 bg-slate-950' : 'border-slate-100 bg-slate-50'} ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="pt-3 pb-3 px-5 border-b border-white/5 flex items-center gap-2">
          <MessageSquare className="text-blue-500" size={20} />
          <h2 className="font-bold text-base">Conversas</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar">
          {chats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                  selectedChatId === chat.id 
                    ? (darkMode ? 'bg-white/5' : 'bg-slate-200/50') 
                    : (darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100')
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg shadow-sm">
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-xs truncate">{chat.name}</h4>
                    <span className="text-[9px] opacity-40 font-mono">{lastMsg?.timestamp || ''}</span>
                  </div>
                  <p className="text-xs opacity-60 truncate mt-0.5">{lastMsg?.text || ''}</p>
                </div>
                {chat.unread && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHAT DETAILS BOX */}
      <div className={`flex-1 flex flex-col ${selectedChatId ? 'flex' : 'hidden md:flex bg-slate-900/10 justify-center items-center'}`}>
        {activeChat ? (
          <>
            {/* Conversation Header */}
            <div className={`pt-3 pb-3 px-5 border-b flex items-center gap-3 ${darkMode ? 'border-white/10 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
              <button 
                onClick={() => setSelectedChatId(null)}
                className="md:hidden p-1 hover:bg-black/10 rounded-lg"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-base">
                {activeChat.avatar}
              </div>
              <div>
                <h3 className="font-bold text-xs">{activeChat.name}</h3>
                <p className="text-[10px] opacity-60 flex items-center gap-1">
                  {activeChat.id === 'ai-assistant' && <Bot size={10} className="text-blue-500" />}
                  {activeChat.role}
                </p>
              </div>
            </div>

            {/* Conversation Messages area */}
            <div 
              ref={messagesContainerRef} 
              className={`flex-1 px-5 py-4 overflow-y-auto space-y-3.5 no-scrollbar ${darkMode ? 'bg-slate-950/20' : 'bg-slate-50/50'}`}
            >
              {activeChat.messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : (darkMode ? 'bg-white/10 text-white rounded-tl-none' : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none')
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] opacity-40 mt-1 font-mono">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing simulation feedback */}
              {typingChatId === activeChat.id && (
                <div className="flex items-center gap-1 bg-white/5 p-2 rounded-xl text-[10px] opacity-60 max-w-max mr-auto">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce duration-500" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce duration-500 delay-150" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce duration-500 delay-300" />
                </div>
              )}
            </div>

            {/* Message input bar */}
            <form 
              onSubmit={handleSend} 
              className={`px-5 py-3.5 border-t flex gap-2.5 items-center ${darkMode ? 'border-white/10 bg-slate-900/20' : 'border-slate-100 bg-white'}`}
            >
              <input
                type="text"
                placeholder={activeChat.id === 'self-notes' ? "Anotar lembrete..." : "Escreva uma mensagem..."}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                className={`flex-1 px-4 py-2.5 text-xs rounded-xl border outline-none focus:border-blue-500 ${
                  darkMode 
                    ? 'bg-black/30 border-white/10 text-white placeholder-white/35' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button 
                type="submit" 
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-6 opacity-40">
            <Bot size={40} className="mx-auto mb-2 text-blue-500 animate-pulse" />
            <p className="text-xs">Selecione uma conversa para começar a digitar</p>
          </div>
        )}
      </div>

    </div>
  );
}
