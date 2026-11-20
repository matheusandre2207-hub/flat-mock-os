// Dicionário pequeno para sugestões e correção automática do teclado do AeroOS.
// As palavras estão em ordem aproximada de frequência (as primeiras vencem empates).

const PT = `de não que e a o um uma para com se por mais mas como já eu você ele ela nós eles tudo bem sim oi olá obrigado obrigada
por favor desculpa talvez claro certo ok beleza valeu tchau até logo amanhã hoje ontem agora depois antes sempre nunca quando onde
porque porquê quanto quem qual quais aqui ali lá casa trabalho escola amigo amiga família mãe pai filho filha irmão irmã dia noite
tarde manhã semana mês ano hora minuto segundo tempo vida mundo coisa pessoa gente homem mulher criança cidade país rua carro ônibus
metrô avião viagem comer beber dormir acordar falar ouvir ver olhar ler escrever estudar trabalhar jogar brincar correr andar sair
chegar voltar ir vir ficar querer poder dever saber conhecer gostar amar precisar pensar achar acreditar esperar tentar começar
terminar parar continuar mudar abrir fechar pegar levar trazer dar receber mandar enviar compartilhar comprar vender pagar ganhar
perder encontrar procurar perguntar responder explicar entender lembrar esquecer ligar desligar telefone celular mensagem foto vídeo
música aplicativo internet bateria tela som volume brilho configurações câmera galeria notas calculadora relógio alarme agenda
contato conta senha email arquivo pasta estou está estava estamos estão vou vai vamos vão tenho tem temos têm faço faz fazemos fazem
posso pode podemos podem quero quer queremos querem preciso precisa sei sabe sabemos são sou é somos era foi será fui fomos foram
bom boa ótimo ótima legal bonito bonita lindo linda grande pequeno novo nova velho rápido devagar fácil difícil feliz triste cansado
cansada ocupado livre pronto perto longe cedo muito pouco menos nada todo toda todos todas algum alguma alguns algumas outro outra
outros outras mesmo mesma cada também ainda então assim aí né pra pro tá tô vc você mim ti nosso nossa seu sua meu minha dele dela
isso isto esse essa este esta aquele aquela aquilo coisa algo alguém ninguém qualquer sobre entre sem até desde durante contra
depois porém contudo portanto enquanto embora conforme segundo conosco comigo contigo vamos bora fala diga conta conte olha veja
espera calma pera nossa caramba demais bastante realmente verdade mentira problema solução ideia pergunta resposta nome número
endereço telefone mensagem notificação configuração atualização versão sistema aparelho dispositivo tecla teclado digitar escrever
texto palavra frase linha página livro filme série jogo esporte futebol festa comida café almoço jantar lanche água suco cerveja
dinheiro preço barato caro loja mercado farmácia hospital médico remédio saúde dor feliz aniversário parabéns saudade abraço beijo`;

const EN = `the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all
would there their what so up out if about who get which go me when make can like time no just him know take people into year your good
some could them see other than then now look only come its over think also back after use two how our work first well way even new
want because any these give day most us hello hi thanks thank please sorry yes okay ok maybe sure today tomorrow yesterday tonight
morning afternoon evening night week month phone message photo video music app battery screen sound volume settings camera gallery
notes calculator clock alarm contact account password email file folder home work school friend family mother father love need
help where why when what how very really great nice happy sad tired busy free ready near far early late more less nothing everything
something someone anyone everyone people place world life thing man woman child city country street car bus train plane trip eat
drink sleep wake talk listen read write study play run walk leave arrive return stay start stop continue change open close send
receive buy sell pay win lose find search ask answer explain understand remember forget turn keyboard type text word`;

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const build = (raw: string) => {
  const list = Array.from(new Set(raw.split(/\s+/).filter(Boolean)));
  const set = new Set(list);
  const byBase = new Map<string, string>();
  list.forEach(w => { const b = norm(w); if (b !== w && !byBase.has(b) && !set.has(b)) byBase.set(b, w); });
  return { list, set, byBase };
};
const DICT = { pt: build(PT), en: build(EN) };

const LEARN_KEY = 'os_kb_learned';
let learned: Record<string, number> | null = null;
const loadLearned = () => {
  if (learned) return learned;
  try { learned = JSON.parse(localStorage.getItem(LEARN_KEY) || '{}') || {}; } catch { learned = {}; }
  return learned as Record<string, number>;
};
/** Palavras digitadas e mantidas pelo usuário passam a ser aceitas (a partir de 2 vezes). */
export function learnWord(w: string) {
  const k = w.toLowerCase();
  if (k.length < 2 || /[\d@]/.test(k)) return;
  const l = loadLearned();
  l[k] = (l[k] ?? 0) + 1;
  try { localStorage.setItem(LEARN_KEY, JSON.stringify(l)); } catch { /* ok */ }
}
export function clearLearned() { learned = {}; try { localStorage.removeItem(LEARN_KEY); } catch { /* ok */ } }

export function isKnown(w: string, lang: 'pt' | 'en'): boolean {
  const k = w.toLowerCase();
  return DICT[lang].set.has(k) || (loadLearned()[k] ?? 0) >= 2;
}

/** Sugestões a partir do começo da palavra (até 3). */
export function suggest(prefix: string, lang: 'pt' | 'en'): string[] {
  const p = prefix.toLowerCase();
  if (!p) return [];
  const out: string[] = [];
  const l = loadLearned();
  Object.keys(l).filter(w => l[w] >= 2 && w.startsWith(p) && w !== p).sort((a, b) => l[b] - l[a]).slice(0, 2).forEach(w => out.push(w));
  for (const w of DICT[lang].list) {
    if (out.length >= 3) break;
    if (w.startsWith(p) && w !== p && !out.includes(w)) out.push(w);
  }
  if (out.length < 3) {
    const np = norm(p);
    for (const w of DICT[lang].list) { if (out.length >= 3) break; if (norm(w).startsWith(np) && w !== p && !out.includes(w)) out.push(w); }
  }
  return out.slice(0, 3);
}

function dist(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}

/** Devolve a correção para uma palavra desconhecida, ou null se estiver certa ou não houver candidata boa. */
export function correct(word: string, lang: 'pt' | 'en'): string | null {
  const w = word.toLowerCase();
  if (w.length < 2 || /[\d@_]/.test(w) || isKnown(w, lang)) return null;
  const dc = DICT[lang];
  let fix: string | null = dc.byBase.get(w) ?? null;                // "nao" -> "não", "voce" -> "você"
  if (!fix && w.length >= 3) {
    const max = w.length <= 4 ? 1 : 2;
    let best = Infinity;
    for (const c of dc.list) {
      if (Math.abs(c.length - w.length) > max) continue;
      const dd = Math.min(dist(w, c), dist(norm(w), norm(c)));
      if (dd < best && dd <= max && (c[0] === w[0] || dd <= 1)) { best = dd; fix = c; if (dd === 1 && c[0] === w[0]) break; }
    }
  }
  if (!fix) return null;
  const cap = word[0] !== word[0].toLowerCase();
  const all = word.length > 1 && word === word.toUpperCase();
  return all ? fix.toUpperCase() : cap ? fix.charAt(0).toUpperCase() + fix.slice(1) : fix;
}
