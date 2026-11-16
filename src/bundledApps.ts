// Mini-apps que já vêm com o AeroOS e aparecem na loja. Cada um é um HTML isolado, igual aos
// apps importados, e usa as variáveis --aero-* (ficam com as cores do papel de parede quando
// o interruptor "Mudar com o papel de parede" está ligado, que aqui já vem ligado).
import type { CustomApp } from './customApps';

const head = (title: string, css = '') => `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${title}</title><style>
*{box-sizing:border-box;margin:0;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{height:100%;background:var(--aero-bg);color:var(--aero-fg);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;touch-action:manipulation}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px}
button{font:inherit;color:inherit;border:0;cursor:pointer}
.btn{background:var(--aero-accent);color:#fff;padding:12px 24px;border-radius:999px;font-weight:600}
.btn.alt{background:var(--aero-surface);color:var(--aero-fg)}
.card{background:var(--aero-surface);border-radius:20px}
.muted{color:var(--aero-muted);font-size:12px}
h1{font-weight:300;font-size:26px;letter-spacing:.02em}
${css}</style></head><body>`;

const mix = (pct: string, base = 'var(--aero-surface)') => `color-mix(in srgb,var(--aero-accent) ${pct}%,${base})`;

const G2048 = head('2048', `
#b{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;width:min(86vw,360px);aspect-ratio:1;background:var(--aero-accent-soft);border-radius:20px;touch-action:none}
.t{border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:clamp(18px,6vw,28px);background:var(--aero-surface);transition:background .15s}
.row{display:flex;gap:14px;align-items:center}`) + `
<h1>2048</h1><div class="row"><div class="muted">Pontos <b id="s" style="color:var(--aero-fg);font-size:18px">0</b></div><button class="btn alt" onclick="init()">Novo</button></div>
<div id="b"></div><p class="muted" id="m">Deslize para juntar números iguais</p>
<script>
var N=4,g,score=0;
function init(){g=[0,1,2,3].map(function(){return[0,0,0,0]});score=0;add();add();draw();document.getElementById('m').textContent='Deslize para juntar números iguais'}
function add(){var e=[];g.forEach(function(r,i){r.forEach(function(v,j){if(!v)e.push([i,j])})});if(!e.length)return;var c=e[Math.random()*e.length|0];g[c[0]][c[1]]=Math.random()<.9?2:4}
function slide(r){var a=r.filter(Boolean);for(var i=0;i<a.length-1;i++)if(a[i]==a[i+1]){a[i]*=2;score+=a[i];a.splice(i+1,1)}while(a.length<N)a.push(0);return a}
function move(d){var o=JSON.stringify(g);
 if(d=='L')g=g.map(slide);
 if(d=='R')g=g.map(function(r){return slide(r.slice().reverse()).reverse()});
 if(d=='U'||d=='D')for(var j=0;j<N;j++){var c=g.map(function(r){return r[j]});if(d=='D')c.reverse();c=slide(c);if(d=='D')c.reverse();for(var i=0;i<N;i++)g[i][j]=c[i]}
 if(JSON.stringify(g)!=o){add();draw();if(!can())document.getElementById('m').textContent='Fim de jogo!'}}
function can(){for(var i=0;i<N;i++)for(var j=0;j<N;j++){if(!g[i][j])return 1;if(j<3&&g[i][j]==g[i][j+1])return 1;if(i<3&&g[i][j]==g[i+1][j])return 1}return 0}
function draw(){document.getElementById('s').textContent=score;document.getElementById('b').innerHTML=g.map(function(r){return r.map(function(v){var p=v?Math.min(92,12+Math.log2(v)*8):0;return '<div class="t" style="'+(v?'background:color-mix(in srgb,var(--aero-accent) '+p+'%,var(--aero-surface));color:'+(p>40?'#fff':'var(--aero-fg)'):'')+'">'+(v||'')+'</div>'}).join('')}).join('')}
var x0,y0;document.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'))});
document.addEventListener('keydown',function(e){var m={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D'}[e.key];if(m){e.preventDefault();move(m)}});
init();
</script></body></html>`;

const SNAKE = head('Cobrinha', `canvas{border-radius:20px;background:var(--aero-surface);touch-action:none}`) + `
<h1>Cobrinha</h1><canvas id="c"></canvas><div class="muted">Pontos <b id="s" style="color:var(--aero-fg);font-size:18px">0</b> &nbsp; Deslize para virar</div><button class="btn" id="go" onclick="start()">Jogar</button>
<script>
var cv=document.getElementById('c'),x=cv.getContext('2d'),S=Math.min(innerWidth-40,360,innerHeight-260)|0,N=18,C=(S/N);cv.width=cv.height=S;
var sn,dir,nd,food,sc,t=null;
function cs(v){return getComputedStyle(document.documentElement).getPropertyValue(v)||'#888'}
function start(){sn=[[9,9],[8,9],[7,9]];dir=nd=[1,0];sc=0;food=pf();clearInterval(t);t=setInterval(tick,125);document.getElementById('go').style.display='none';draw()}
function pf(){var p;do{p=[Math.random()*N|0,Math.random()*N|0]}while(sn.some(function(s){return s[0]==p[0]&&s[1]==p[1]}));return p}
function tick(){dir=nd;var h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];
 if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||sn.some(function(s){return s[0]==h[0]&&s[1]==h[1]})){clearInterval(t);var b=document.getElementById('go');b.textContent='Jogar de novo';b.style.display='';return}
 sn.unshift(h);if(h[0]==food[0]&&h[1]==food[1]){sc++;food=pf();document.getElementById('s').textContent=sc}else sn.pop();draw()}
function draw(){x.clearRect(0,0,S,S);x.fillStyle=cs('--aero-muted');x.beginPath();x.arc((food[0]+.5)*C,(food[1]+.5)*C,C*.32,0,7);x.fill();
 x.fillStyle=cs('--aero-accent');sn.forEach(function(s,i){x.globalAlpha=1-i/(sn.length+6);x.beginPath();x.roundRect(s[0]*C+1,s[1]*C+1,C-2,C-2,C*.3);x.fill()});x.globalAlpha=1}
function turn(a,b){if(dir[0]!==-a||dir[1]!==-b)nd=[a,b]}
var x0,y0;document.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;Math.abs(dx)>Math.abs(dy)?turn(dx>0?1:-1,0):turn(0,dy>0?1:-1)});
document.addEventListener('keydown',function(e){var m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(m){e.preventDefault();turn(m[0],m[1])}});
sn=[[9,9]];food=[3,3];dir=[1,0];draw();
</script></body></html>`;

const TTT = head('Jogo da Velha', `
#b{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:min(80vw,320px);aspect-ratio:1}
.c{border-radius:18px;background:var(--aero-surface);font-size:clamp(34px,13vw,56px);font-weight:300;display:flex;align-items:center;justify-content:center}
.c.x{color:var(--aero-accent)}.c.win{background:var(--aero-accent-soft)}`) + `
<h1>Jogo da Velha</h1><div class="muted" id="m">Sua vez: você é o X</div><div id="b"></div><button class="btn alt" onclick="init()">Reiniciar</button>
<script>
var B,over,L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function win(b){for(var i=0;i<8;i++){var l=L[i];if(b[l[0]]&&b[l[0]]==b[l[1]]&&b[l[0]]==b[l[2]])return l}return 0}
function init(){B=Array(9).fill('');over=0;draw();document.getElementById('m').textContent='Sua vez: você é o X'}
function draw(){var w=win(B);document.getElementById('b').innerHTML=B.map(function(v,i){return '<button class="c '+(v=='X'?'x':'')+(w&&w.indexOf(i)>-1?' win':'')+'" onclick="play('+i+')">'+v+'</button>'}).join('')}
function end(){var w=win(B),m=document.getElementById('m');if(w){over=1;m.textContent=B[w[0]]=='X'?'Você venceu!':'A máquina venceu';}else if(B.every(Boolean)){over=1;m.textContent='Empate'}draw();return over}
function bot(){var e=[];B.forEach(function(v,i){if(!v)e.push(i)});function find(p){for(var k=0;k<e.length;k++){B[e[k]]=p;var w=win(B);B[e[k]]='';if(w)return e[k]}return -1}
 var m=find('O');if(m<0)m=find('X');if(m<0&&!B[4])m=4;if(m<0)m=e[Math.random()*e.length|0];B[m]='O'}
function play(i){if(over||B[i])return;B[i]='X';if(end())return;bot();end()}
init();
</script></body></html>`;

const MEMORY = head('Memória', `
#b{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:min(86vw,360px)}
.k{aspect-ratio:1;border-radius:16px;background:var(--aero-surface);font-size:clamp(24px,9vw,38px);display:flex;align-items:center;justify-content:center;transition:transform .25s,background .25s}
.k.up{background:var(--aero-accent-soft);transform:rotateY(0)}.k.ok{background:var(--aero-accent);opacity:.9}`) + `
<h1>Memória</h1><div class="muted">Jogadas <b id="n" style="color:var(--aero-fg);font-size:18px">0</b></div><div id="b"></div><p class="muted" id="m">Encontre os pares</p><button class="btn alt" onclick="init()">Novo jogo</button>
<script>
var E=['🌸','🌙','⭐','🍀','🔥','🎈','🍓','🎧'],D,M,open,lock,moves,found;
function init(){D=E.concat(E).sort(function(){return Math.random()-.5});M={};open=[];lock=0;moves=0;found=0;document.getElementById('n').textContent=0;document.getElementById('m').textContent='Encontre os pares';draw()}
function draw(){document.getElementById('b').innerHTML=D.map(function(v,i){var s=M[i]?'ok':open.indexOf(i)>-1?'up':'';return '<button class="k '+s+'" onclick="flip('+i+')">'+(s?v:'')+'</button>'}).join('')}
function flip(i){if(lock||open.indexOf(i)>-1||M[i])return;open.push(i);draw();if(open.length==2){moves++;document.getElementById('n').textContent=moves;var a=open[0],b=open[1];lock=1;
 if(D[a]==D[b]){setTimeout(function(){M[a]=M[b]=1;open=[];lock=0;found++;draw();if(found==8)document.getElementById('m').textContent='Você achou todos em '+moves+' jogadas!'},350)}
 else setTimeout(function(){open=[];lock=0;draw()},750)}}
init();
</script></body></html>`;

const CRONO = head('Cronômetro', `
.big{font-size:clamp(48px,17vw,72px);font-weight:200;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.tabs{display:flex;background:var(--aero-surface);border-radius:999px;padding:4px}.tabs button{padding:8px 20px;border-radius:999px;background:none;font-size:13px;font-weight:600;color:var(--aero-muted)}.tabs .on{background:var(--aero-accent);color:#fff}
.row{display:flex;gap:12px}#laps{max-height:22vh;overflow:auto;width:min(80vw,300px);font-size:13px;color:var(--aero-muted)}#laps div{display:flex;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--aero-accent-soft)}`) + `
<div class="tabs"><button id="t1" class="on" onclick="mode(1)">Cronômetro</button><button id="t2" onclick="mode(2)">Timer</button></div>
<div class="big" id="d">00:00.0</div>
<div class="row" id="adj" style="display:none"><button class="btn alt" onclick="adj(-1)">− 1 min</button><button class="btn alt" onclick="adj(1)">+ 1 min</button></div>
<div class="row"><button class="btn alt" id="b2" onclick="second()">Volta</button><button class="btn" id="b1" onclick="main()">Iniciar</button></div><div id="laps"></div>
<script>
var M=1,run=0,t0=0,acc=0,tm=5*60000,iv,laps=[];
function f(ms){ms=Math.max(0,ms);var m=ms/60000|0,s=(ms%60000)/1000;return String(m).padStart(2,'0')+':'+s.toFixed(1).padStart(4,'0')}
function cur(){return M==1?acc+(run?Date.now()-t0:0):Math.max(0,tm-(acc+(run?Date.now()-t0:0)))}
function show(){document.getElementById('d').textContent=f(cur());if(M==2&&run&&cur()<=0){beep();stop(1)}}
function main(){run?stop():go()}
function go(){if(M==2&&cur()<=0)acc=0;run=1;t0=Date.now();iv=setInterval(show,50);document.getElementById('b1').textContent='Pausar'}
function stop(done){if(run)acc+=Date.now()-t0;run=0;clearInterval(iv);document.getElementById('b1').textContent=done?'Reiniciar':'Continuar';show()}
function second(){if(M==1&&run){laps.unshift(f(cur()));document.getElementById('laps').innerHTML=laps.map(function(l,i){return '<div><span>Volta '+(laps.length-i)+'</span><span>'+l+'</span></div>'}).join('')}else{stop();acc=0;laps=[];document.getElementById('laps').innerHTML='';document.getElementById('b1').textContent='Iniciar';show()}}
function adj(n){if(run)return;tm=Math.max(60000,tm+n*60000);acc=0;show()}
function mode(m){stop();M=m;acc=0;laps=[];document.getElementById('laps').innerHTML='';document.getElementById('t1').className=m==1?'on':'';document.getElementById('t2').className=m==2?'on':'';document.getElementById('adj').style.display=m==2?'flex':'none';document.getElementById('b2').textContent=m==1?'Volta':'Zerar';document.getElementById('b1').textContent='Iniciar';show()}
function beep(){try{var a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.setValueAtTime(.2,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.2);o.start();o.stop(a.currentTime+1.2)}catch(e){}}
show();
</script></body></html>`;

const BREATH = head('Respirar', `
.o{width:min(60vw,230px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--aero-accent),var(--aero-accent-soft));box-shadow:0 0 80px var(--aero-accent-soft);transition:transform 4s ease-in-out;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:300;color:#fff}`) + `
<h1>Respirar</h1><div class="o" id="o">Pronto?</div><p class="muted" id="m">Toque para começar</p><button class="btn" id="b" onclick="toggle()">Começar</button>
<script>
var on=0,tm=[];
function step(txt,sc,dur,next,after){var o=document.getElementById('o');o.style.transitionDuration=dur+'s';o.style.transform='scale('+sc+')';o.textContent=txt;document.getElementById('m').textContent=txt=='Inspire'?'Pelo nariz, devagar':txt=='Segure'?'Sem tensão':'Solte o ar pela boca';tm.push(setTimeout(next,after*1000))}
function cycle(){if(!on)return;step('Inspire',1.35,4,function(){step('Segure',1.35,4,function(){step('Expire',1,6,cycle,6)},4)},4)}
function toggle(){on=!on;document.getElementById('b').textContent=on?'Parar':'Começar';tm.forEach(clearTimeout);tm=[];if(on)cycle();else{var o=document.getElementById('o');o.style.transform='scale(1)';o.textContent='Pronto?';document.getElementById('m').textContent='Toque para começar'}}
</script></body></html>`;

const DADOS = head('Dados', `
.row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.d{width:84px;height:84px;border-radius:22px;background:var(--aero-surface);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:300;transition:transform .35s}
.d.r{transform:rotate(360deg) scale(1.08);background:var(--aero-accent-soft)}.sel button{padding:8px 14px;border-radius:999px;background:var(--aero-surface);font-size:13px;font-weight:600;margin:3px}.sel .on{background:var(--aero-accent);color:#fff}`) + `
<h1>Dados</h1><div class="row" id="r"></div><div class="muted" id="t"></div>
<div class="sel" id="q"></div><button class="btn" onclick="roll()">Rolar</button>
<script>
var n=2,sides=6;
function ui(){document.getElementById('q').innerHTML=[1,2,3,4].map(function(i){return '<button class="'+(i==n?'on':'')+'" onclick="n='+i+';ui();roll()">'+i+' dado'+(i>1?'s':'')+'</button>'}).join('')+'<br>'+[6,12,20].map(function(s){return '<button class="'+(s==sides?'on':'')+'" onclick="sides='+s+';ui();roll()">d'+s+'</button>'}).join('')}
function roll(){var v=[];for(var i=0;i<n;i++)v.push(1+Math.random()*sides|0);document.getElementById('r').innerHTML=v.map(function(x){return '<div class="d r">'+x+'</div>'}).join('');document.getElementById('t').textContent='Total: '+v.reduce(function(a,b){return a+b},0);setTimeout(function(){document.querySelectorAll('.d').forEach(function(d){d.classList.remove('r')})},380)}
ui();roll();
</script></body></html>`;

interface B { id: string; name: string; emoji: string; color: string; category: NonNullable<CustomApp['category']>; rating: number; downloads: string; desc: string; html: string }

const LIST: B[] = [
  { id: 'custom-b-2048', name: '2048', emoji: '🔢', color: '#E5A100', category: 'games', rating: 4.8, downloads: '4,1 mi', desc: 'Deslize e junte os números iguais até chegar ao 2048. Vicia fácil.', html: G2048 },
  { id: 'custom-b-cobrinha', name: 'Cobrinha', emoji: '🐍', color: '#30A46C', category: 'games', rating: 4.7, downloads: '3,3 mi', desc: 'O clássico da cobrinha, com controle por deslize e as cores do seu papel de parede.', html: SNAKE },
  { id: 'custom-b-velha', name: 'Jogo da Velha', emoji: '❌', color: '#3E63DD', category: 'games', rating: 4.5, downloads: '1,8 mi', desc: 'Jogue contra a máquina. Ela bloqueia, ataca e raramente deixa você ganhar fácil.', html: TTT },
  { id: 'custom-b-memoria', name: 'Memória', emoji: '🃏', color: '#D6409F', category: 'games', rating: 4.6, downloads: '2,2 mi', desc: 'Vire as cartas e encontre todos os pares no menor número de jogadas.', html: MEMORY },
  { id: 'custom-b-crono', name: 'Cronômetro e Timer', emoji: '⏱️', color: '#12A594', category: 'utilities', rating: 4.8, downloads: '5,0 mi', desc: 'Cronômetro com voltas e timer com alarme sonoro. Simples e preciso.', html: CRONO },
  { id: 'custom-b-respirar', name: 'Respirar', emoji: '🫧', color: '#6E56CF', category: 'creativity', rating: 4.9, downloads: '2,9 mi', desc: 'Respiração guiada 4-4-6 com uma animação calma que combina com o seu tema.', html: BREATH },
  { id: 'custom-b-dados', name: 'Dados', emoji: '🎲', color: '#F76B15', category: 'games', rating: 4.4, downloads: '1,2 mi', desc: 'Role de 1 a 4 dados de 6, 12 ou 20 lados. Ótimo para jogos de mesa.', html: DADOS },
];

export const BUNDLED_APPS: CustomApp[] = LIST.map((b, i) => ({
  id: b.id, name: b.name, html: b.html, color: b.color, iconUrl: b.emoji, size: `${Math.max(2, Math.round(b.html.length / 1024))} KB`,
  createdAt: 1_700_000_000_000 + i, kind: 'html', bundled: true, desc: b.desc, category: b.category,
  rating: b.rating, downloads: b.downloads, followWallpaper: true,
}));
export const isBundledId = (id: string) => LIST.some(b => b.id === id);
