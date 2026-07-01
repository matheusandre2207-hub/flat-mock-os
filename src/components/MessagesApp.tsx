import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, MessageSquare, Sparkles, Heart, Wrench, FileText, User } from 'lucide-react';
import { Chat, Message } from '../types';

function renderAvatarIcon(avatarName: string, size: number = 18) {
  switch (avatarName) {
    case 'Sparkles': return <Sparkles size={size} className="text-blue-500 animate-pulse" />;
    case 'Heart': return <Heart size={size} className="text-red-500" fill="currentColor" />;
    case 'Wrench': return <Wrench size={size} className="text-slate-400" />;
    case 'FileText': return <FileText size={size} className="text-yellow-500" />;
    case 'User': return <User size={size} className="text-blue-400" />;
    default: return <User size={size} className="text-blue-400" />;
  }
}

interface MessagesAppProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  darkMode: boolean;
  isActive?: boolean;
  onIncomingMessage?: (senderName: string, text: string, chatId: string) => void;
  selectedChatId?: string | null;
  setSelectedChatId?: (id: string | null) => void;
}

export default function MessagesApp({ 
  chats, 
  setChats, 
  darkMode, 
  isActive = false, 
  onIncomingMessage,
  selectedChatId: propsSelectedChatId,
  setSelectedChatId: propsSetSelectedChatId
}: MessagesAppProps) {
  const [localSelectedChatId, setLocalSelectedChatId] = useState<string | null>(null);
  const selectedChatId = propsSelectedChatId !== undefined ? propsSelectedChatId : localSelectedChatId;
  const setSelectedChatId = propsSetSelectedChatId !== undefined ? propsSetSelectedChatId : setLocalSelectedChatId;
  const [textInput, setTextInput] = useState('');
  const [typingChatId, setTypingChatId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const selectedChatIdRef = useRef(selectedChatId);
  const isActiveRef = useRef(isActive);
  const chatsRef = useRef(chats);
  const pendingResponsesRef = useRef<Record<string, { typingId: any; responseId: any }>>({});

  const activeChat = chats.find(c => c.id === selectedChatId) || null;

  // Sync chats state with a mutable ref to avoid stale closures in setTimeout
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Sync selectedChatId with a mutable ref for background callbacks
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Sync isActive with mutable ref to avoid stale closure when exiting the app before reply
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Clean up all pending timeouts on unmount to prevent state memory leaks
  useEffect(() => {
    return () => {
      Object.values(pendingResponsesRef.current).forEach((p: any) => {
        if (p) {
          clearTimeout(p.typingId);
          clearTimeout(p.responseId);
        }
      });
    };
  }, []);

  // Auto-scroll to bottom of conversation safely
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      try {
        if (typeof messagesContainerRef.current.scrollTo === 'function') {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      } catch (err) {
        console.warn("Smooth scroll failed, falling back to scrollTop:", err);
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
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

  // Fast, conversational delay logic:
  // Dynamically ranges between 1s and 2.5s to keep the conversation flowing smoothly.
  const getRandomDelay = () => {
    return Math.floor(Math.random() * 1500) + 1000; // 1.0s - 2.5s
  };

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

    const targetChatId = selectedChatId;

    // 1. Add user message to active chat
    setChats(prev => prev.map(c => {
      if (c.id === targetChatId) {
        return { ...c, messages: [...c.messages, userMsg] };
      }
      return c;
    }));

    // Clear any previous scheduled responses for this specific contact to avoid overlap
    if (pendingResponsesRef.current[targetChatId]) {
      clearTimeout(pendingResponsesRef.current[targetChatId].typingId);
      clearTimeout(pendingResponsesRef.current[targetChatId].responseId);
    }

    // Determine the response delay (up to 2 minutes, mostly < 10s)
    const delay = getRandomDelay();

    // typing bubble triggers almost immediately to simulate someone starting to type
    const typingStartTime = 200;

    const typingId = setTimeout(() => {
      setTypingChatId(targetChatId);
    }, typingStartTime);

    const responseId = setTimeout(async () => {
      let responseText = '';
      const query = userMsgText.toLowerCase();

      // Retrieve the absolute freshest message history to avoid stale closures
      const latestChats = chatsRef.current;
      const latestActiveChat = latestChats.find(c => c.id === targetChatId);
      if (!latestActiveChat) return;

      // Try fetching from the server-side Gemini API
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: targetChatId,
            contactName: latestActiveChat.name,
            contactRole: latestActiveChat.role,
            messageHistory: latestActiveChat.messages.filter((m: Message) => m.id !== userMsg.id),
            userMessage: userMsgText
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            responseText = data.reply;
          }
        }
      } catch (err) {
        console.warn("Real AI chat fetch failed or not configured, using local fallback replies:", err);
      }

      if (!responseText) {
        // Simple keyword triggers for the AI Assistant Chatbot
        if (targetChatId === 'ai-assistant') {
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
        else if (targetChatId === 'mother') {
          if (query.includes('oi') || query.includes('olá') || query.includes('tudo bem') || query.includes('bom dia') || query.includes('boa tarde') || query.includes('boa noite')) {
            responseText = "Oi meu filho lindo! Tudo ótimo por aqui graças a Deus. E com você, tudo bem? Já comeu alguma coisa hoje? ❤️";
          } else if (query.includes('comi') || query.includes('almoço') || query.includes('janta') || query.includes('comida') || query.includes('fome')) {
            responseText = "Que bom meu filho! Fico mais tranquila. Come bastante salada e toma uma aguinha também, viu? Se cuida e não fica só comendo besteira! Beijo 😘";
          } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando')) {
            responseText = "Deus abençoe seu trabalho meu filho, você é muito inteligente e esforçado! Só não vai dormir muito tarde hoje hein, o descanso também é importante. Te amo! 🥰🙏";
          } else if (query.includes('te amo') || query.includes('amo você')) {
            responseText = "Eu também te amo mais que tudo nessa vida, meu amor! Você é a maior riqueza da minha vida. Que Deus te abençoe e te proteja sempre! Mãe te ama ❤️😘";
          } else if (query.includes('vó') || query.includes('vovó') || query.includes('avó')) {
            responseText = "A vovó estava comentando ontem mesmo de você, disse que fez aquele bolo de cenoura delicioso. Manda uma mensagem pra ela, ela vai amar receber notícias suas! 👵💖";
          } else {
            responseText = "Que bom meu amor! Fico muito feliz. Qualquer coisa me liga tá? Não esquece de levar o casaco que o tempo pode mudar! Beijos, te amo muito ❤️";
          }
        } 
        // Love replies
        else if (targetChatId === 'love') {
          if (query.includes('oi') || query.includes('olá') || query.includes('amor') || query.includes('vida') || query.includes('lindo')) {
            responseText = "Oi meu amor!!! ❤️ Que saudade de você! Como tá sendo seu dia? Estava pensando na gente agorinha mesmo 🥰";
          } else if (query.includes('tudo bem') || query.includes('como vc ta') || query.includes('como você está')) {
            responseText = "Tudo ótimo por aqui amor, só com um pouquinho de preguiça hj kkkk e vc? Tudo certinho? 😘";
          } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando') || query.includes('projeto')) {
            responseText = "Ahhh vc trabalha demais hein! Mas fico muito orgulhosa de ver vc focado assim, vc é incrível de verdade! Bom trabalho vida, não esquece de descansar um pouco tá? Me avisa quando terminar! 💕";
          } else if (query.includes('comer') || query.includes('fome') || query.includes('jantar') || query.includes('almoçar') || query.includes('pizza') || query.includes('lanche')) {
            responseText = "Nossa, me deu uma fome agora tbm kkkk 😋 Que tal a gente pedir um japa ou uma pizza hj de noite pra assistir um filme? Vc escolhe o sabor! 🍕🍿";
          } else if (query.includes('saudade') || query.includes('saudades')) {
            responseText = "Eu também tô morrendo de saudade de vc, amor! Não vejo a hora da gente se encontrar pra te dar aquele abraço bem gostoso... Quando vamos nos ver? 🥺❤️";
          } else if (query.includes('te amo') || query.includes('amo você')) {
            responseText = "Ahhh eu te amo muito mais, sabia? Vc é a melhor parte do meu dia. Sou muito sortuda de ter vc comigo 🥰💖";
          } else if (query.includes('bom dia')) {
            responseText = "Bom dia meu amor! Que seu dia seja maravilhoso e bem produtivo. Se cuida tá? Te amooo! ☀️💋";
          } else if (query.includes('boa noite')) {
            responseText = "Boa noite vida! Durma bem e sonha comigo hein! Te amo demais, até amanhã 😘💤";
          } else {
            responseText = "Amei vida! Vc é um fofo msm. Vamos nos falando, daqui a pouco te mando mais mensagem pq tô terminando uma coisinha aqui. Te amo muito! 😘❤️";
          }
        }
        // Grandmother replies
        else if (targetChatId === 'grandmother') {
          if (query.includes('oi') || query.includes('olá') || query.includes('vó') || query.includes('vovó') || query.includes('avó') || query.includes('tudo bem')) {
            responseText = "Oi meu netinho querido... a bênção de Deus... Por aqui está tudo bem graças ao bom Deus... Como você está? Se cuidando?... ❤️👵";
          } else if (query.includes('benção') || query.includes('bênção') || query.includes('bencao')) {
            responseText = "Deus te abençoe muito meu filho... que ele ilumine seus caminhos sempre... amém... 🙏✨";
          } else if (query.includes('comer') || query.includes('comida') || query.includes('almoço') || query.includes('fome') || query.includes('bolo') || query.includes('janta')) {
            responseText = "Vem aqui na casa da vovó... fiz aquele bolo de cenoura com cobertura de chocolate bem quentinho... fiz pensando em você... vem lanchar comigo hoje meu querido... 👵🍰";
          } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando')) {
            responseText = "Que orgulho que a vovó tem de você... sempre tão trabalhador e estudioso... Deus te dê muita saúde para vencer na vida... mas não canse muito os olhos nesse computador hein... 💻🙏";
          } else if (query.includes('te amo') || query.includes('amo você')) {
            responseText = "A vovó também te ama demais... você mora no meu coração meu anjo... você é a alegria da minha vida... Deus te guarde... 😘👵";
          } else {
            responseText = "Fico muito feliz meu netinho... o importante é ter saúde e paz... vou rezar por você hoje na igreja... manda um beijo para todos por aí... Deus te acompanhe... 🙏🌸";
          }
        }
        // Lucas Friend replies
        else if (targetChatId === 'friend-lucas') {
          if (query.includes('oi') || query.includes('eae') || query.includes('fala') || query.includes('mano') || query.includes('salve') || query.includes('beleza')) {
            responseText = "Eae mano! Beleza pura? O que tá aprontando de bom por aí?";
          } else if (query.includes('tudo bem') || query.includes('tudo certo') || query.includes('tranquilo')) {
            responseText = "Tudo tranquilo por aqui tbm, mano! Só de boa kkk e aí?";
          } else if (query.includes('bora') || query.includes('sair') || query.includes('cerveja') || query.includes('role') || query.includes('rolê') || query.includes('futebol') || query.includes('fut') || query.includes('jogar')) {
            responseText = "Bora sim, demorou! Só marcar o dia. Se for rolar aquele futebol ou um chopp de lei me avisa que tô dentro total kkk ⚽🍻";
          } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando') || query.includes('projeto')) {
            responseText = "Eita cara, só trampo e foco kkkk tá certo! Tem que garantir o sustento do homem. Mas descansa um pouco aí senão a cabeça pifa mano. Sucesso no código!";
          } else if (query.includes('jogar') || query.includes('game') || query.includes('pc') || query.includes('discord')) {
            responseText = "Bora fechar um game mais tarde então! Me grita no Discord quando vc entrar que eu puxo a call 🎮⚡";
          } else if (query.includes('kkk') || query.includes('haha') || query.includes('rs')) {
            responseText = "kkkkkkkk caraca mano, rindo alto aqui. Vc é figura demais!";
          } else {
            responseText = "Show de bola mano! Tamo junto demais. Qualquer coisa me dá um salve por aqui ou liga pra gente agilizar. Abraço! 👊";
          }
        }
        // Tech Support replies
        else if (targetChatId === 'tech-support') {
          responseText = "Olá! Obrigado pelo retorno. O sistema de gerenciamento de bateria e o filtro de brilho estão 100% calibrados. Caso encontre problemas, por favor limpe o cache do app de arquivos ou mude de wallpaper!";
        } 
        // Notes replies (notes to self, repeats)
        else if (targetChatId === 'self-notes') {
          responseText = "📝 Nota registrada nas anotações do sistema.";
        } else {
          responseText = `Olá! Que bom falar com você. Estou pronto para conversar! 😊`;
        }
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'contact',
        text: responseText,
        timestamp
      };

      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          const isCurrentlyViewing = (selectedChatIdRef.current === targetChatId);
          return { 
            ...c, 
            unread: !isCurrentlyViewing, 
            messages: [...c.messages, botMsg] 
          };
        }
        return c;
};

      if (!isActiveRef.current && onIncomingMessage) {
        const chatObj = chatsRef.current.find(c => c.id === targetChatId);
        if (chatObj) {
          onIncomingMessage(chatObj.name, botMsg.text, targetChatId);
        }
      }

      setTypingChatId(prev => prev === targetChatId ? null : prev);
    }, delay);

    // Save both timeouts to control the typing bubble and response accurately
    pendingResponsesRef.current[targetChatId] = { typingId, responseId };
  };

  return (
    <div className={`h-full flex overflow-hidden ${darkMode ? 'text-white bg-slate-950' : 'text-slate-900 bg-white'}`}>
      
      {/* 1. CHATS SIDEBAR LIST (Shown when no chat selected on small, or split) */}
      <div className={`w-full md:w-80 flex flex-col border-r flex-shrink-0 ${darkMode ? 'border-white/10 bg-slate-950' : 'border-slate-100 bg-slate-50'} ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="pt-4 pb-3 px-5 border-b border-white/5 flex items-center gap-2.5">
          <MessageSquare className="text-blue-500" size={22} />
          <h2 className="font-extrabold text-lg tracking-tight">Conversas</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar pb-20">
          {chats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full p-4 text-left flex items-start gap-3.5 transition-colors cursor-pointer border-none ${
                  selectedChatId === chat.id 
                    ? (darkMode ? 'bg-white/10' : 'bg-blue-50/80') 
                    : (darkMode ? 'hover:bg-white/5 bg-transparent' : 'hover:bg-slate-100 bg-transparent')
                }`}
              >
                <div className="w-12 h-12 rounded-2.5xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center relative flex-shrink-0 shadow-sm border border-white/10">
                  {renderAvatarIcon(chat.avatar, 22)}
                  {chat.id !== 'self-notes' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-extrabold text-[13.5px] truncate text-slate-900 dark:text-white">{chat.name}</span>
                    <span className="text-[10px] opacity-45 font-mono ml-2 shrink-0">{lastMsg?.timestamp || ''}</span>
                  </div>
                  <p className="text-[12px] opacity-65 truncate leading-snug font-medium text-slate-600 dark:text-slate-300">{lastMsg?.text || ''}</p>
                </div>
                {chat.unread && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0 shadow-sm animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHAT DETAILS BOX */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${selectedChatId ? 'flex' : 'hidden md:flex bg-slate-900/10 items-center justify-center'}`}>
        {activeChat ? (
          <div className={`flex-1 flex flex-col w-full h-full relative ${
            darkMode ? 'bg-[#121214]' : 'bg-[#f8f9fa]'
          }`}>
            {/* Conversation Header */}
            <div className={`pt-3.5 pb-3.5 px-5 border-b flex items-center justify-between shrink-0 z-10 ${
              darkMode ? 'border-white/10 bg-[#1c1c1e]/90 backdrop-blur-md' : 'border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-current transition-colors border-none bg-transparent cursor-pointer mr-1"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-2.5xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-white/10 shadow-sm shrink-0">
                  {renderAvatarIcon(activeChat.avatar, 20)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[14.5px] truncate text-slate-900 dark:text-white">{activeChat.name}</h3>
                    {activeChat.id !== 'self-notes' && (
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-60 flex items-center gap-1.5 truncate mt-0.5 font-medium">
                    {activeChat.id === 'ai-assistant' && <Bot size={12} className="text-blue-500 shrink-0" />}
                    <span>{activeChat.role}</span>
                    {activeChat.id !== 'self-notes' && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="text-[10px] text-emerald-500 font-bold tracking-wide uppercase">Online</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation Messages area */}
            <div 
              ref={messagesContainerRef} 
              className="flex-1 px-5 py-6 overflow-y-auto space-y-4 no-scrollbar"
            >
              {activeChat.messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div 
                    className={`px-4 py-3 rounded-2.5xl text-[13.5px] font-medium leading-relaxed shadow-sm transition-all ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs' 
                        : (darkMode ? 'bg-[#262628] text-white rounded-bl-xs border border-white/10' : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-xs')
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-semibold opacity-45 px-1 mt-1.5 font-mono">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing simulation feedback */}
              {typingChatId === activeChat.id && (
                <div className={`flex items-center gap-1.5 px-4 py-3 rounded-2.5xl rounded-bl-xs max-w-max mr-auto shadow-sm ${
                  darkMode ? 'bg-[#262628] border border-white/10' : 'bg-white border border-slate-200/80'
                }`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce duration-500" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce duration-500 delay-150" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce duration-500 delay-300" />
                </div>
              )}
            </div>

            {/* Message input bar (Elevated above gestures with pb-8) */}
            <form 
              onSubmit={handleSend} 
              className={`px-5 pt-3.5 pb-8 border-t flex gap-3 items-center shrink-0 ${
                darkMode ? 'border-white/10 bg-[#1c1c1e]/95 backdrop-blur-md' : 'border-slate-200/80 bg-white/95 backdrop-blur-md shadow-lg'
              }`}
            >
              <div className={`flex-1 flex items-center rounded-2.5xl border px-4 py-1 transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${
                darkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-100 border-slate-200/80 text-slate-900'
              }`}>
                <input
                  type="text"
                  placeholder={activeChat.id === 'self-notes' ? "Anotar lembrete..." : "Escreva uma mensagem..."}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="w-full py-2.5 text-[13.5px] font-medium bg-transparent outline-none border-none placeholder:text-slate-400 dark:placeholder:text-white/40"
                />
              </div>
              <button 
                type="submit" 
                className="w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2.5xl flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0 shadow-md border-none"
              >
                <Send size={18} className="translate-x-[1px]" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center p-6 opacity-40">
            <Bot size={44} className="mx-auto mb-3 text-blue-500 animate-pulse" />
            <p className="text-sm font-semibold">Selecione uma conversa para começar a digitar</p>
          </div>
        )}
      </div>

    </div>
  );
}
