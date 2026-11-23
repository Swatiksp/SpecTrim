
/* ================= part6 ================= */
/* thematic map colours */
const CL=['#9AA6FF','#F08BC4','#5CCB8A','#FF7A6B'];
const KIND={ctx:{c:'#9AA6FF'},int:{c:'#FF7A6B'},ver:{c:'#F08BC4'},set:{c:'#5CCB8A'}};
const MK=TD.metas.map(m=>/lacks context/i.test(m.name)?'ctx':/intent|rules/i.test(m.name)?'int':/verify|control/i.test(m.name)?'ver':'set');
const MC=MK.map(k=>KIND[k].c);
function tint(svg){const dts=$$('.dt',svg);dts.forEach(d=>{const c=TD.codes[+d.dataset.i];d.style.setProperty('--c',CL[c.pc])});
  $$('.mt',svg).forEach(m=>m.style.setProperty('--c',MC[+m.dataset.m]));
  $$('.th',svg).forEach(t=>t.style.setProperty('--c',MC[TD.themeMeta[+t.dataset.t]]));
  $$('text.tn2[data-m]',svg).forEach(t=>t.style.fill='#0C0D0F')}
tint($('#tm5'));tint($('#tm6'));
/* beat 6: connections */
const MEANK={c:{ctx:'Its core job. It gathers repo patterns, stack and dependencies so the engineer stops filling the gap by hand.',int:'Gaps become suggested lines, so intent and rules reach the AI in writing, not unevenly.',ver:'Flagging gaps before code exists means less line-by-line checking afterwards.',set:'Dependencies across teams and repos are part of what it reads, so the setting is accounted for.'},
 g:{ctx:'Assumptions the AI would make silently are surfaced, so context gaps become visible.',int:'The gate is where intent becomes explicit: a line is approved and recorded with a reason.',ver:'It gives engineers a control point and an audit trail instead of reviewing every line.',set:'Company limits on AI use turn into a visible approval step.'}};
const MEAN={c:MK.map(k=>MEANK.c[k]),g:MK.map(k=>MEANK.g[k])};
const conn=$('#conn');
function renderConn(){const a=$('#iA').getAttribute('aria-pressed')==='true',g=$('#iB').getAttribute('aria-pressed')==='true';const svg=$('#tm6');const tm=svg.closest('.tm');
  $$('.th,.mt',svg).forEach(e=>e.classList.remove('cxa','cxg'));tm.classList.toggle('cxon',a||g);
  if(!a&&!g){conn.hidden=true;return}
  const keys=[a&&'c',g&&'g'].filter(Boolean);const cds=TD.codes.filter(c=>keys.includes(c.i));
  const mc=[0,0,0,0],tc={};cds.forEach(c=>{c.m.forEach(m=>mc[m]++);c.t.forEach(t=>tc[t]=(tc[t]||0)+1)});
  keys.forEach(k=>{TD.codes.filter(c=>c.i===k).forEach(c=>{c.t.forEach(t=>{const e=$$('.th',svg)[t];e&&e.classList.add(k==='c'?'cxa':'cxg')});c.m.forEach(m=>{const e=$$('.mt',svg)[m];e&&e.classList.add(k==='c'?'cxa':'cxg')})})});
  const top=Object.entries(tc).sort((x,y)=>y[1]-x[1]).slice(0,5);const mx=Math.max(...mc,1);
  const name=a&&g?'Both ideas':a?'Context Compiler':'Assumption log and gating';
  conn.hidden=false;
  conn.innerHTML=`<h4>${name}: how it connects</h4><div class="ths">${top.map(([t,n])=>`<span><b>${n}</b> ${esc(cut(TD.themes[t],34))}</span>`).join('')}</div>`
   +TD.metas.map((m,i)=>`<div class="cr ${mc[i]?'':'dim'}" style="--c:${MC[i]}"><b class="m">${'ABCD'[i]}</b><div><span class="nm">${esc(m.name)}</span>${mc[i]?esc(a&&g?MEAN.c[i]+' '+MEAN.g[i]:MEAN[keys[0]][i]):'No supporting codes land here.'}</div><i>${mc[i]}/${cds.length}</i></div>`).join('')
   +'<div class="note">Codes counted by my judgement. The meaning lines are my reading, not participant data.</div>'}
new MutationObserver(renderConn).observe($('#iA'),{attributes:true,attributeFilter:['aria-pressed']});
new MutationObserver(renderConn).observe($('#iB'),{attributes:true,attributeFilter:['aria-pressed']});
/* lifecycle: mark ends of rows */
function lcEol(){const ns=[...$$('#lc>div')].filter(n=>n.offsetParent!==null&&n.getBoundingClientRect().width>2);ns.forEach((n,i)=>{const nx=ns[i+1];n.classList.toggle('eol',!nx||nx.offsetTop>n.offsetTop+10)})}
addEventListener('resize',lcEol);new MutationObserver(()=>setTimeout(lcEol,760)).observe($('#lc'),{attributes:true,subtree:true,attributeFilter:['class']});setTimeout(lcEol,300);
$('#lc').insertAdjacentHTML('afterend','');

function bigTM(){openOv('<div class="bigtm"><div class="tm"><svg id="tmBig" viewBox="-310 -310 620 620" role="img" aria-label="Thematic map, enlarged"></svg></div><aside class="info" id="tmBigInfo" aria-live="polite"><div class="k">Enlarged</div><h3>Thematic map</h3><p>Hover or tap a dot, a theme or a meta-theme.</p></aside></div>');
  const bi=$('#tmBigInfo');const t=buildTM($('#tmBig'),{info:d=>{
    if(!d){bi.innerHTML='<div class="k">Four meta-themes</div>'+TD.metas.map((m,i)=>`<p><b class="mono">${'ABCD'[i]}</b> ${esc(m.name)}</p>`).join('');return}
    if(d.code){const c=d.code;bi.innerHTML=`<div class="k">Code · ${c.q} quotes · ${c.p} participant${c.p>1?'s':''}</div><h3>${esc(c.n)}</h3><p>Feeds themes ${c.t.map(x=>x+1).join(', ')}. Closest cluster: ${esc(TD.clusters[c.pc])}${c.ja?' (placed by my judgement)':''}.</p>`}
    else if(d.theme!=null){const x=d.theme;bi.innerHTML=`<div class="k">Theme ${x+1}</div><h3>${esc(TD.themes[x])}</h3><p>Meta-theme ${'ABCD'[TD.themeMeta[x]]}: ${esc(TD.metas[TD.themeMeta[x]].name)}</p>`}
    else{const m=d.meta;bi.innerHTML=`<div class="k">Meta-theme ${'ABCD'[m]}</div><h3>${esc(TD.metas[m].name)}</h3><p>${TD.metas[m].themes.length} themes</p>`}}});
  tint($('#tmBig'));const f=$('#tmBig');f.querySelectorAll('.dt').forEach(d=>d.addEventListener('click',()=>setTimeout(()=>tint(f),0)))}
$('#tmEnl').onclick=bigTM;$('#tmEnl6').onclick=bigTM;

/* ================= anatomy (idea) ================= */
const C11=['Your spec, as it is written today: one long document.','Its parts: the five areas a spec has to cover, and what sits inside each.','Its gaps: what is missing or assumed, and which ones should block export.'];
let a11a=0,a11b=0,auto11=false;
const T11=tabs($('#t11'),i=>{$('#an').dataset.s=i;$('#c11').textContent=C11[i];if(!auto11){clearTimeout(a11a);clearTimeout(a11b)}});
T11.sel(0);
REG[ALL.indexOf($("#b11"))]={n:3,get:T11.get,set:T11.sel};
ENTER[ALL.indexOf($("#b11"))]=()=>{clearTimeout(a11a);clearTimeout(a11b);auto11=true;T11.sel(0);auto11=false;
  a11a=setTimeout(()=>{auto11=true;T11.sel(1);auto11=false},1500);
  a11b=setTimeout(()=>{auto11=true;T11.sel(2);auto11=false},3800)};

/* ================= your turn ================= */
const SCN=[
 {n:'Scenario 1',t:'Sign-in for an existing app',d:'You are adding sign-in to the Repair Tracker mobile app. Check the spec before an agent builds it.',tasks:['Open an item that blocks export.','Read the AI’s reasoning. If you disagree, reject it.','Reply to the AI and say why.','Read its new answer. Approve it when you are happy.']},
 {n:'Scenario 2',t:'Understand the review list',d:'You have a spec with several items to check. See how the review list sorts them.',tasks:['Find the Review list on the spec map.','Look at To approve, then Review later. Tell me what you think each one means.','Find Decided by rule. Tell me what you think it means.','Open an item there. Tell me whether it looks right, and why.']}];
(function(){const row=$('#scn');let sel=-1;const PU='./prototype/index.html';
  row.innerHTML=SCN.map((c,i)=>`<div class="scn-item" data-i="${i}"><button class="scn" aria-expanded="false" aria-controls="scb${i}"><span class="cps">${esc(c.n)}</span><b>${esc(c.t)}</b><span class="sdesc">${esc(c.d)}</span></button><div class="scn-body" id="scb${i}" inert><div class="scn-in"><div class="scn-pad"><ol class="tasks">${(c.tasks.length?c.tasks.map(t=>`<li>${esc(t)}</li>`):[1,2,3].map(k=>`<li class="ph">Task ${k} to be added</li>`)).join('')}</ol><div class="scn-go"><a class="btn sol" href="${PU}?scenario=${i+1}" target="_blank" rel="noopener">Open in prototype</a></div></div></div></div></div>`).join('');
  function draw(){$$('.scn-item',row).forEach((it,i)=>{const on=i===sel;it.classList.toggle('open',on);it.querySelector('.scn').setAttribute('aria-expanded',on);const bd=it.querySelector('.scn-body');if(on)bd.removeAttribute('inert');else bd.setAttribute('inert','')})}
  row.addEventListener('click',e=>{const b=e.target.closest('.scn');if(!b)return;const i=+b.parentNode.dataset.i;sel=sel===i?-1:i;draw()});
  REG[IX('b12')]={n:SCN.length,get:()=>Math.max(sel,0),set:i=>{sel=i;draw()}};draw()})();

/* ===== merged scene: the map builds, then the two ideas ===== */
(function(){
const sc=$('#sc5'),N5=6;sc.style.setProperty('--n',N5);
[['iA5','c','Supports the Context Compiler'],['iB5','g','Supports assumption gating']].forEach(([id,t,k])=>{const b=$('#'+id);const w=document.createElement('div');w.className='ideawrap';b.parentNode.insertBefore(w,b);w.appendChild(b);
  const c=document.createElement('div');c.className='chips';c.innerHTML=topCodes(t).map(([i,cd])=>chip(i,cut(cd.n,38),cd.q,k)).join('');w.appendChild(c)});
let iA5=true,iB5=true,s5=-1;
function paintI(){$('#iA5').setAttribute('aria-pressed',iA5);$('#iB5').setAttribute('aria-pressed',iB5);tm5.setIdeas(iA5,iB5)}
function show5(s){if(s===s5)return;s5=s;sc.dataset.s=s;
  const ideas=s===N5-1,prob=s===N5-2;$('#pa5').inert=ideas||prob;$('#pb5').inert=!ideas;$('#pc5').inert=!prob;
  if(ideas){if(stage5!==3)setStage(3);iA5=iB5=true;paintI()}
  else if(prob){setStage(3);iA5=iB5=true}
  else{setStage(s);iA5=iB5=true}}
function span5(){return Math.max(1,sc.offsetHeight-innerHeight*.85)}
function upd5(){const r=sc.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50)return;const p=clamp((-r.top+innerHeight*.12)/span5(),0,.9999);show5(Math.floor(p*N5))}
addEventListener('scroll',upd5,{passive:true});addEventListener('resize',upd5);
function stepTo5(i){i=clamp(i,0,N5-1);const top=sc.getBoundingClientRect().top+scrollY;goY(top+((i+.5)/N5)*span5()-innerHeight*.12)}
$$('#stg5 [data-s]').forEach(b=>b.onclick=()=>stepTo5(+b.dataset.s));
$('#iA5').onclick=()=>{iA5=!iA5;paintI()};$('#iB5').onclick=()=>{iB5=!iB5;paintI()};
ENTER[IX('b5')]=()=>{setFilter(0);if(s5===N5-1)paintI()};
REG[IX('b5')]={n:N5,get:()=>Math.max(s5,0),set:stepTo5};
$('#pb5').inert=true;show5(0);upd5()})();

/* labels drawn on the map itself: cluster names inside the disc, ring names on the top axis */
(function(){const svg=$('#tm5');const SLA=[[180,270],[270,360],[0,90],[90,180]];
  const NM=['Context gaps','Guardrails','Handoff','Intent & traceability'];
  let h='<g class="lbl" pointer-events="none">';
  NM.forEach((n,i)=>{const top=i<2,r=top?151:162,pad=top&&i===0?12:12;const [a0,a1]=SLA[i];const A0=top?a0+pad:a1-pad,A1=top?a1-pad:a0+pad;const p0=polar(r,A0),p1=polar(r,A1);
    h+=`<path id="cla${i}" d="M${f1(p0[0])} ${f1(p0[1])}A${r} ${r} 0 0 ${top?1:0} ${f1(p1[0])} ${f1(p1[1])}" fill="none"/><text class="clb" style="fill:${CL[i]}"><textPath href="#cla${i}" startOffset="50%" text-anchor="middle">${esc(n.toUpperCase())}</textPath></text>`});
  [['q','QUOTES',-172],['c','CODES',-172],['t','THEMES',-229],['m','META-THEMES',-292]].forEach(([k,n,y])=>{const w=Math.round(n.length*7.2+18);
    h+=`<g class="pl pl-${k}" transform="translate(0 ${y})"><rect x="${-w/2}" y="-9" width="${w}" height="18" rx="9"/><text>${n}</text></g>`});
  svg.insertAdjacentHTML('beforeend',h+'</g>')})();

['ov','ev','pr','fb','tmBig'].forEach(i=>{const e=document.getElementById(i);if(e)e.setAttribute('data-lenis-prevent','')});
/* dark only: no light mode */
(function(){const r=document.documentElement;const f=()=>{if(r.dataset.theme!=='dark')r.dataset.theme='dark'};f();new MutationObserver(f).observe(r,{attributes:true,attributeFilter:['data-theme']})})();
/* refresh: reload the page and start again from the cover */
(function(){try{history.scrollRestoration='manual'}catch(e){}
$('#rfb').onclick=()=>{try{scrollTo(0,0)}catch(e){}location.reload()}})();

/* ===== scroll-driven scenes: slide 1 and the statements ===== */
function scene(id,n,onStep){const sc=$('#'+id),stk=sc.firstElementChild;let cur=-1;
  const span=()=>Math.max(1,sc.offsetHeight-stk.offsetHeight);
  const prog=()=>clamp((64-sc.getBoundingClientRect().top)/span(),0,1);
  function upd(){const r=sc.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50)return;const s=Math.min(n-1,Math.floor(prog()*n));if(s!==cur){cur=s;onStep(s)}}
  addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});addEventListener('resize',upd);
  function to(i){i=clamp(i,0,n-1);const r=sc.getBoundingClientRect();goY(r.top+scrollY-64+((i+.5)/n)*span())}
  onStep(0);cur=0;upd();return {get:()=>Math.max(cur,0),to}}
(function(){const spx=$('#spx'),cs=$$('.spc',spx);
  const L=[0,0,.5,1,1],Yl=['16.667%','16.667%','50%','83.333%','83.333%'];
  const S1=scene('sc1',5,s=>{spx.dataset.s=s;spx.style.setProperty('--lp',L[s]);spx.style.setProperty('--yl',Yl[s]);cs.forEach((c,i)=>c.classList.toggle('on',i<Math.min(s,3)))});
  REG[IX('b1')]={n:5,get:S1.get,set:S1.to}})();
/* statements: scroll-scrubbed hand-overs (problem, not alone, six engineers, a real quote) */
(function(){const sc=$('#sc3'),stk=sc.firstElementChild;let cur=-1,lt1=-1,lt2=-1,lt3=-1;
  const span=()=>Math.max(1,sc.offsetHeight-stk.offsetHeight);
  const prog=()=>clamp((64-sc.getBoundingClientRect().top)/span(),0,1);
  const sm=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
  const set=(k,v)=>sc.style.setProperty(k,v.toFixed(3));
  function upd(){const r=sc.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50)return;const p=prog();
    const t1=sm((p-.07)/.14),t2=clamp((p-.32)/.22,0,1),t3=clamp((p-.64)/.22,0,1);
    if(Math.abs(t1-lt1)>.002){lt1=t1;set('--t1',t1)}
    if(Math.abs(t2-lt2)>.002){lt2=t2;set('--ta',sm(t2/.55));set('--tb',sm((t2-.45)/.55))}
    if(Math.abs(t3-lt3)>.002){lt3=t3;set('--tc',sm(t3/.55));set('--td',sm((t3-.45)/.55))}
    const s=p<.17?0:p<.45?1:p<.77?2:3;if(s!==cur){cur=s;sc.dataset.s=s}}
  addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});addEventListener('resize',upd);
  const C=[.02,.28,.6,.97];
  function to(i){i=clamp(i,0,3);const r=sc.getBoundingClientRect();goY(r.top+scrollY-64+C[i]*span())}
  ['--t1','--ta','--tb','--tc','--td'].forEach(k=>sc.style.setProperty(k,0));cur=0;upd();
  REG[IX('bS1')]={n:4,get:()=>Math.max(cur,0),set:to}})();
