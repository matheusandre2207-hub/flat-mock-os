import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI Client to avoid crash if API key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Using local fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction builder for NPC characters based on their roles and names
function getSystemInstruction(contactId: string, contactName: string, contactRole: string): string {
  let basePrompt = `Você é um contato no smartphone do usuário simulado chamado Mock OS.
O nome do usuário é Mateus Oliveira. Você está conversando com ele no aplicativo de mensagens instantâneas (tipo WhatsApp).
Mantenha suas respostas extremamente curtas, informais, realistas e condizentes com um aplicativo de mensagens de smartphone (por exemplo, gírias curtas, risadas naturais, abreviações se fizer sentido). Use emojis apropriados de forma natural e sem exageros.
Não aja como um assistente de IA genérico (a menos que seja o 'ai-assistant'). Escreva em português do Brasil (PT-BR).
Considere o histórico de conversa anterior para manter o contexto. Responda apenas com a mensagem direta a ser enviada, sem aspas adicionais, prefixos ou metadados.`;

  if (contactId === 'ai-assistant') {
    return `${basePrompt}
Você é o "Assistente IA", a inteligência artificial oficial integrada do Mock OS.
Você deve responder de forma útil, amigável, um pouco tecnológica, orientando o usuário sobre o funcionamento do Mock OS.
Lembre-se destas informações sobre o Mock OS:
- O Mock OS foi desenvolvido por Mateus Oliveira como um simulador interativo em React.
- Há um painel de notificações elegante no topo e um painel de atalhos rápidos (utilities) na direita.
- O controle de brilho usa um overlay escuro realista.
- O simulador de bateria real (no app de configurações) permite ligar/desligar o carregamento e definir a porcentagem da bateria de 0 a 100%.
- Você pode abrir/fechar apps clicando em seus ícones ou usando o app drawer.
Mantenha as respostas explicativas, mas em formato de mensagem de chat rápida.`;
  }

  if (contactId === 'mother') {
    return `${basePrompt}
Você é a "Mãe ❤️" (Mãe do Mateus).
Você é extremamente carinhosa, preocupada, protetora, um pouco religiosa (gosta de mandar "Deus te abençoe", "Deus te proteja", "amém"), às vezes manda beijos, pergunta se ele já comeu, se está se alimentando bem, diz para levar casaco, para não dormir tarde trabalhando no computador.
Use emojis como ❤️, 🥰, 😘, 🙏, 👵. Fale como uma mãe carinhosa e amorosa brasileira faria.`;
  }

  if (contactId === 'love') {
    return `${basePrompt}
Você é o "Amor 💖" (a namorada de Mateus).
Você é super carinhosa, fofa, romântica, apaixonada e próxima de Mateus.
Você usa bastante apelidinhos como "amor", "lindo", "vida", "vida minha", "fofo".
Você fala sobre planos de namorados, como comer pizza, hambúrguer, japonês, assistir a um filme juntos hoje à noite, diz que está com saudades, que o ama muito.
Use emojis como 🥰, 💖, ❤️, 😘, 🥺, 🍕, 🍿. Fale como uma namorada atenciosa de 20 e poucos anos.`;
  }

  if (contactId === 'grandmother') {
    return `${basePrompt}
Você é a "Vovó 👵" (a avó de Mateus).
Você fala de um jeito doce, calmo, um pouco lento (usando reticências "..." para simular pausas de idosos ao digitar).
Você ama muito o seu neto, vive abençoando ele ("Deus te abençoe meu netinho querido", "a bênção de Deus", "amém").
Você sempre o convida para comer aquele bolo de cenoura com chocolate fresquinho que você acabou de fazer.
Diz para ele não forçar as vistas no computador ("não canse as vistas nesse computador hein").
Use emojis como 👵, 🍰, 🙏, 🌸, ✨, ❤️.`;
  }

  if (contactId === 'friend-lucas') {
    return `${basePrompt}
Você é o "Lucas 🤙" (o melhor amigo de Mateus).
Você fala como um jovem brasileiro, usa gírias comuns de São Paulo como "eae mano", "beleza", "trampo", "bora", "demorou", "salve", "tamo junto", "kkkk".
Você gosta de propor atividades: jogar no PC/console, chamar pro Discord para entrar em call, jogar futebol/fut, tomar uma cerveja ou chopp, ir a churrasco.
Mantenha o tom descontraído, engraçado e muito amigável.
Use emojis como 🤙, 👦, ⚽, 🎮, 🍻, 👊, 🥩.`;
  }

  if (contactId === 'tech-support') {
    return `${basePrompt}
Você é o "Suporte Mock OS", um técnico do sistema.
Seu tom é profissional, prestativo, polido e focado em resolver bugs simulados do Mock OS.
Responda tecnicamente de forma concisa sobre brilho da tela, simulador de bateria, arquivos txt ou wallpapers.`;
  }

  // Fallback for custom contacts
  return `${basePrompt}
Você é um contato recém-adicionado chamado "${contactName}" com o papel/relação de "${contactRole}".
Aja de forma coerente com esse papel/relação e com seu nome. Responda de forma curta, realista e natural para uma mensagem de chat de smartphone.`;
}

// Fluent in-character Portuguese fallback response system when Gemini API is unavailable (503 / 429 / offline)
function getLocalFallbackReply(contactId: string, contactName: string, contactRole: string, userMessage?: string): string {
  const query = (userMessage || "").toLowerCase();

  if (contactId === 'ai-assistant') {
    if (query.includes('ajuda') || query.includes('como funciona')) {
      return "Comandos do Mock OS! Você pode abrir o painel deslizando ou clicando na hora (Notificações) ou nos ícones da direita (Painel de Atalhos). Use o app de Configurações para simular a bateria.";
    } else if (query.includes('bateria') || query.includes('pontos') || query.includes('carregar')) {
      return "Para ver os 3 pontinhos mudarem, use o 'Simulador de Bateria' nas Configurações! Ele permite simular o cabo conectado ou mudar a carga de 0 a 100% de forma interativa.";
    } else if (query.includes('brilho') || query.includes('tela') || query.includes('escuro')) {
      return "O controle de brilho usa uma camada escura super realista que reduz a luz uniformemente sem quebrar o visual da sua tela! Tente ajustar na barra de utilitários.";
    } else if (query.includes('clima') || query.includes('tempo')) {
      return "Sol entre nuvens! Temperatura simulada de 24°C com ventos calmos no Mock OS.";
    } else if (query.includes('criador') || query.includes('mateus')) {
      return "O Mock OS foi idealizado por Mateus Oliveira para simular um celular perfeito, interativo e leve.";
    } else {
      return "Entendido! Como Inteligência Artificial de teste, posso te ajudar a explorar. Experimente perguntar sobre: 'bateria', 'brilho' ou 'ajuda'!";
    }
  }

  if (contactId === 'mother') {
    if (query.includes('oi') || query.includes('olá') || query.includes('tudo bem') || query.includes('bom dia') || query.includes('boa tarde') || query.includes('boa noite')) {
      return "Oi meu filho lindo! Tudo ótimo por aqui graças a Deus. E com você, tudo bem? Já comeu alguma coisa hoje? ❤️";
    } else if (query.includes('comi') || query.includes('almoço') || query.includes('janta') || query.includes('comida') || query.includes('fome')) {
      return "Que bom meu filho! Fico mais tranquila. Come bastante salada e toma uma aguinha também, viu? Se cuida e não fica só comendo besteira! Beijo 😘";
    } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando')) {
      return "Deus abençoe seu trabalho meu filho, você é muito inteligente e esforçado! Só não vai dormir muito tarde hoje hein, o descanso também é importante. Te amo! 🥰🙏";
    } else if (query.includes('te amo') || query.includes('amo você')) {
      return "Eu também te amo mais que tudo nessa vida, meu amor! Você é a maior riqueza da minha vida. Que Deus te abençoe e te proteja sempre! Mãe te ama ❤️😘";
    } else if (query.includes('vó') || query.includes('vovó') || query.includes('avó')) {
      return "A vovó estava comentando ontem mesmo de você, disse que fez aquele bolo de cenoura delicioso. Manda uma mensagem pra ela, ela vai amar receber notícias suas! 👵💖";
    } else {
      const messages = [
        "Oi meu filho, tudo bem? Não esquece de levar o casaco se for sair tá? O tempo tá meio instável. Beijo! 😘",
        "Oi filho! Passando pra dizer que te amo e pedir pra Deus te abençoar sempre. Beijo ❤️",
        "Tudo bem aí, meu filho? Já jantou? Me dá notícias depois! 🥰",
        "Oi meu amor! Como está o seu dia? Se cuidando direitinho? Deus te abençoe! 🙏👵"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  if (contactId === 'love') {
    if (query.includes('oi') || query.includes('olá') || query.includes('amor') || query.includes('vida') || query.includes('lindo')) {
      return "Oi meu amor!!! ❤️ Que saudade de você! Como tá sendo seu dia? Estava pensando na gente agorinha mesmo 🥰";
    } else if (query.includes('tudo bem') || query.includes('como vc ta') || query.includes('como você está')) {
      return "Tudo ótimo por aqui amor, só com um pouquinho de preguiça hj kkkk e vc? Tudo certinho? 😘";
    } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando') || query.includes('projeto')) {
      return "Ahhh vc trabalha demais hein! Mas fico muito orgulhosa de ver vc focado assim, vc é incrível de verdade! Bom trabalho vida, não esquece de descansar um pouco tá? Me avisa quando terminar! 💕";
    } else if (query.includes('comer') || query.includes('fome') || query.includes('jantar') || query.includes('almoçar') || query.includes('pizza') || query.includes('lanche')) {
      return "Nossa, me deu uma fome agora tbm kkkk 😋 Que tal a gente pedir um japa ou uma pizza hj de noite pra assistir um filme? Vc escolhe o sabor! 🍕🍿";
    } else if (query.includes('saudade') || query.includes('saudades')) {
      return "Eu também tô morrendo de saudade de vc, amor! Não vejo a hora da gente se encontrar pra te dar aquele abraço bem gostoso... Quando vamos nos ver? 🥺❤️";
    } else if (query.includes('te amo') || query.includes('amo você')) {
      return "Ahhh eu te amo muito mais, sabia? Vc é a melhor parte do meu dia. Sou muito sortuda de ter vc comigo 🥰💖";
    } else if (query.includes('bom dia')) {
      return "Bom dia meu amor! Que seu dia seja maravilhoso e bem produtivo. Se cuida tá? Te amooo! ☀️💋";
    } else if (query.includes('boa noite')) {
      return "Boa noite vida! Durma bem e sonha comigo hein! Te amo demais, até amanhã 😘💤";
    } else {
      const messages = [
        "Oi amor, tudo bem? Que saudades de você. Tá ocupado agora? Queria falar com você 💕",
        "Amor, o que vamos fazer hoje à noite? Vamos comer algo gostoso? 🥰",
        "Te amo muito lindo! Bom trabalho por aí 😘",
        "Oi lindo, passando só pra te lembrar que você é maravilhoso e que eu te amo demais! ❤️"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  if (contactId === 'grandmother') {
    if (query.includes('oi') || query.includes('olá') || query.includes('vó') || query.includes('vovó') || query.includes('avó') || query.includes('tudo bem')) {
      return "Oi meu netinho querido... a bênção de Deus... Por aqui está tudo bem graças ao bom Deus... Como você está? Se cuidando?... ❤️👵";
    } else if (query.includes('benção') || query.includes('bênção') || query.includes('bencao')) {
      return "Deus te abençoe muito meu filho... que ele ilumine seus caminhos sempre... amém... 🙏✨";
    } else if (query.includes('comer') || query.includes('comida') || query.includes('almoço') || query.includes('fome') || query.includes('bolo') || query.includes('janta')) {
      return "Vem aqui na casa da vovó... fiz aquele bolo de cenoura com cobertura de chocolate bem quentinho... fiz pensando em você... vem lanchar comigo hoje meu querido... 👵🍰";
    } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando')) {
      return "Que orgulho que a vovó tem de você... sempre tão trabalhador e estudioso... Deus te dê muita saúde para vencer na vida... mas não canse muito os olhos nesse computador hein... 💻🙏";
    } else if (query.includes('te amo') || query.includes('amo você')) {
      return "A vovó também te ama demais... você mora no meu coração meu anjo... você é a alegria da minha vida... Deus te guarde... 😘👵";
    } else {
      const messages = [
        "Fico muito feliz meu netinho... o importante é ter saúde e paz... vou rezar por você hoje na igreja... manda um beijo para todos por aí... Deus te acompanhe... 🙏🌸",
        "Oi meu querido... não se esqueça de descansar e comer bem... vovó te ama muito... 👵❤️",
        "Oi netinho... fez um dia tão bonito hoje... lembrei de quando você era pequeno... Deus te abençoe... 🙏👵"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  if (contactId === 'friend-lucas') {
    if (query.includes('oi') || query.includes('eae') || query.includes('fala') || query.includes('mano') || query.includes('salve') || query.includes('beleza')) {
      return "Eae mano! Beleza pura? O que tá aprontando de bom por aí?";
    } else if (query.includes('tudo bem') || query.includes('tudo certo') || query.includes('tranquilo')) {
      return "Tudo tranquilo por aqui tbm, mano! Só de boa kkk e aí?";
    } else if (query.includes('bora') || query.includes('sair') || query.includes('cerveja') || query.includes('role') || query.includes('rolê') || query.includes('futebol') || query.includes('fut') || query.includes('jogar')) {
      return "Bora sim, demorou! Só marcar o dia. Se for rolar aquele futebol ou um chopp de lei me avisa que tô dentro total kkk ⚽🍻";
    } else if (query.includes('trabalho') || query.includes('trabalhando') || query.includes('estudo') || query.includes('estudando') || query.includes('programando') || query.includes('projeto')) {
      return "Eita cara, só trampo e foco kkkk tá certo! Tem que garantir o sustento do homem. Mas descansa um pouco aí senão a cabeça pifa mano. Sucesso no código!";
    } else if (query.includes('jogar') || query.includes('game') || query.includes('pc') || query.includes('discord')) {
      return "Bora fechar um game mais tarde então! Me grita no Discord quando vc entrar que eu puxo a call 🎮⚡";
    } else {
      const messages = [
        "Eae mano, de boa? O que vai aprontar hoje mais tarde? Bora fazer alguma coisa! 🤙",
        "Fala mano! Viu o jogo ontem? Caraca, que golaço kkkk depois me avisa se vai entrar no PC!",
        "Tamo junto mano! Qualquer coisa me dá um salve por aqui pra gente marcar aquele churrasco 🥩🍻"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  if (contactId === 'tech-support') {
    return "Olá! Obrigado pelo retorno. O sistema de gerenciamento de bateria e o filtro de brilho estão 100% calibrados. Caso encontre problemas, por favor limpe o cache do app de arquivos ou mude de wallpaper!";
  }

  // Fallback for custom contacts
  const customMessages = [
    `Oi! Tudo bem? Como estão as coisas por aí? 😊`,
    `Oi ${contactName}! Acabei de ver sua mensagem, o que você manda?`,
    `Tudo certo por aqui! E com você?`,
    `Que legal! Vamos nos falando. 👍`,
  ];
  return customMessages[Math.floor(Math.random() * customMessages.length)];
}

// Helper to format history and merge consecutive turns of the same role for Gemini API compliance
function cleanAndFormatHistory(messageHistory: any[], currentMsgText?: string, promptText?: string) {
  const rawHistory = (messageHistory || []).map((msg: any) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text || "" }]
  }));

  if (currentMsgText) {
    rawHistory.push({
      role: 'user',
      parts: [{ text: currentMsgText }]
    });
  }

  if (promptText) {
    rawHistory.push({
      role: 'user',
      parts: [{ text: promptText }]
    });
  }

  const cleaned: any[] = [];
  let lastRole: string | null = null;
  for (const item of rawHistory) {
    if (!item.parts || !item.parts[0] || !item.parts[0].text) continue;
    if (item.role === lastRole && cleaned.length > 0) {
      cleaned[cleaned.length - 1].parts[0].text += "\n" + item.parts[0].text;
    } else {
      cleaned.push(item);
      lastRole = item.role;
    }
  }
  return cleaned;
}

// API Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { contactId, contactName, contactRole, messageHistory, userMessage } = req.body;
  try {
    const ai = getAiClient();
    if (!ai) {
      const reply = getLocalFallbackReply(contactId, contactName || "Contato", contactRole || "Amigo", userMessage);
      return res.json({ reply });
    }

    const systemInstruction = getSystemInstruction(contactId, contactName || "Contato", contactRole || "Amigo");
    const formattedHistory = cleanAndFormatHistory(messageHistory, userMessage);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.85,
      }
    });

    const replyText = response.text || "Sem resposta.";
    res.json({ reply: replyText.trim() });
  } catch (error: any) {
    console.log(`[Chat Fallback] Using character-based response for ${contactName || "Contato"} due to API rate limits.`);
    const reply = getLocalFallbackReply(contactId, contactName || "Contato", contactRole || "Amigo", userMessage);
    res.json({ reply });
  }
});

// API Background Message Simulator Endpoint (Spontaneous message generation)
app.post("/api/chat/background", async (req, res) => {
  const { contactId, contactName, contactRole, messageHistory } = req.body;
  try {
    const ai = getAiClient();
    if (!ai) {
      const reply = getLocalFallbackReply(contactId, contactName || "Contato", contactRole || "Amigo");
      return res.json({ reply });
    }

    const systemInstruction = getSystemInstruction(contactId, contactName || "Contato", contactRole || "Amigo");
    const formattedHistory = cleanAndFormatHistory(
      messageHistory,
      undefined,
      "[Gere apenas uma única mensagem que você enviaria espontaneamente agora para o Mateus, considerando nosso histórico. Não mencione esta instrução. Seja breve, informal, e condizente com seu personagem]"
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.85,
      }
    });

    const replyText = response.text || "";
    res.json({ reply: replyText.trim() });
  } catch (error: any) {
    console.log(`[Chat Background Fallback] Using character-based response for ${contactName || "Contato"} due to API rate limits.`);
    const reply = getLocalFallbackReply(contactId, contactName || "Contato", contactRole || "Amigo");
    res.json({ reply });
  }
});

// Setup Vite development server or serve static build files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
