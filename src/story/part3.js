(function(){
"use strict";
const QD=__QDATA__;const TD=QD.td,Q=QD.Q;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cut=(t,n)=>t.length>n?t.slice(0,n-1).replace(/\s+\S*$/,'')+'…':t;
function wrap(str,max){const w=str.split(' ');const L=[];let cur='';w.forEach(x=>{if((cur+' '+x).trim().length>max&&cur){L.push(cur);cur=x}else cur=(cur+' '+x).trim()});if(cur)L.push(cur);return L}
function tspans(lines,x,dy){return lines.map((l,i)=>`<tspan x="${x}" dy="${i?dy:0}">${esc(l)}</tspan>`).join('')}
function replay(el){el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}
function tabs(root,onSel){
  const bs=$$('[role=tab]',root);let cur=0;
  function sel(i,focus){cur=i;bs.forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1});onSel(i);if(focus)bs[i].focus()}
  bs.forEach((b,i)=>{b.onclick=()=>sel(i);b.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();sel(clamp(i+(e.key==='ArrowRight'?1:-1),0,bs.length-1),true)}}});
  return {sel,get:()=>cur,n:bs.length};
}
const REG={};

/* ================= HUD / navigation ================= */
const ALL=$$('.beat');
const IX=id=>ALL.indexOf(document.getElementById(id));
ALL.forEach(b=>{if(b.hasAttribute('data-off'))b.hidden=true});
const beats=ALL.filter(b=>!b.hasAttribute('data-off'));let cur=0;
const OI=i=>ALL.indexOf(beats[i]);
const TT=beats.map(b=>[b.dataset.t,b.dataset.m||'']);
const NB=beats.length-1;
function pad(n){return String(n).padStart(2,'0')}
beats.forEach((b,i)=>{const k=b.querySelector('.kick b');if(k)k.textContent=pad(i);const u=b.querySelector('.kick u');if(u&&b.dataset.m)u.textContent=b.dataset.m});
const dotsEl=$('#dots');
beats.forEach((b,i)=>{const d=document.createElement('button');d.dataset.t=TT[i][0];d.setAttribute('aria-label',TT[i][0]);d.onclick=()=>go(i);dotsEl.appendChild(d)});
function goId(id){go(beats.indexOf($('#'+id)))}
function setCur(i){cur=i;mtnUpd(i);$$('#dots button').forEach((d,j)=>d.classList.toggle('on',j===i));
  $('#cnt').innerHTML=i?`<b>${pad(i)}</b> / ${pad(NB)} <span class="t">&nbsp;·&nbsp; ${TT[i][0]}</span> &nbsp;·&nbsp; ${TT[i][1]}`:'<b>Start</b>';
  $('#bar').style.width=(i/NB*100)+'%'}
const ENTER={};
let animating=false,lastWheel=0,raf=0;
const HJ={matches:false}; /* native scrolling: no wheel hijack */
function activate(i){const t=beats[i];if(!t)return;const was=t.classList.contains('active');
  beats.forEach(b=>b.classList.toggle('active',b===t));if(i!==cur||!was)setCur(i);if(!was){const o=OI(i);ENTER[o]&&ENTER[o]()}}
/* smooth scrolling (Lenis, bundled): wheel glides; every programmatic move goes through goY */
let LEN=null;try{if(typeof Lenis!=='undefined'&&!reduce&&!matchMedia('(pointer:coarse)').matches){LEN=new Lenis({lerp:.085,wheelMultiplier:.95,smoothWheel:true,autoRaf:true});document.documentElement.classList.add('lenis')}}catch(e){LEN=null}
const goY=(y,dur)=>{if(LEN)LEN.scrollTo(y,{duration:dur||1.1,easing:t=>1-Math.pow(1-t,4)});else scrollTo({top:y,behavior:reduce?'auto':'smooth'})};
function tween(y1,done){cancelAnimationFrame(raf);const y0=scrollY;const d=Math.abs(y1-y0);
  if(LEN&&!reduce&&d>=2){const T=clamp(.5+d*0.00025,.6,1.15);animating=true;clearTimeout(tween.t);tween.t=setTimeout(()=>{animating=false;done&&done()},T*1000+120);LEN.scrollTo(y1,{duration:T,easing:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,force:true});return}
  if(reduce||d<2){if(LEN)LEN.scrollTo(y1,{immediate:true});else scrollTo(0,y1);animating=false;done&&done();return}
  const T=clamp(380+d*0.18,480,760),t0=performance.now();animating=true;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  (function step(now){const k=clamp((now-t0)/T,0,1);scrollTo(0,y0+(y1-y0)*ease(k));if(k<1)raf=requestAnimationFrame(step);else{animating=false;done&&done()}})(t0)}
function go(i){i=clamp(i,0,beats.length-1);activate(i);tween(beats[i].getBoundingClientRect().top+scrollY)}
$$('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go));
const io=new IntersectionObserver(es=>{if(animating)return;es.forEach(e=>{if(e.isIntersecting)activate(beats.indexOf(e.target))})},{rootMargin:'-45% 0px -45% 0px',threshold:0});
beats.forEach(b=>io.observe(b));
setCur(0);
/* one beat per wheel gesture on desktop: ignore momentum, never skip */
addEventListener('wheel',e=>{
  if(!HJ.matches||e.ctrlKey)return;
  if(e.target.closest&&e.target.closest('#ev,#pr,#fb'))return;
  if($('#ov').classList.contains('show'))return;
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if(e.target.closest&&e.target.closest('.lc-wrap,.scrollx,input,textarea'))if(Math.abs(e.deltaX)>0)return;
  const now=performance.now();const gap=now-lastWheel;lastWheel=now;
  if(animating){e.preventDefault();return}
  const dir=e.deltaY>0?1:-1;const r=beats[cur].getBoundingClientRect();
  // taller-than-screen beat: scroll inside it first
  if(dir>0&&r.bottom>innerHeight+6)return;
  if(dir<0&&r.top<-6)return;
  e.preventDefault();
  if(gap<160)return;            // still the tail of the previous gesture
  if(Math.abs(e.deltaY)<2)return;
  const n=cur+dir;if(n<0||n>=beats.length)return;
  go(n)},{passive:false});
document.addEventListener('keydown',e=>{
  const t=e.target;const tag=t&&t.tagName;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='Escape'){closeOv();return}
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||tag==='SUMMARY')return;
  if(t.closest&&t.closest('[role=tablist]')&&(e.key==='ArrowLeft'||e.key==='ArrowRight'))return;
  if(e.key==='ArrowDown'||e.key==='PageDown'||(e.key===' '&&(tag==='BODY'||!tag))){e.preventDefault();go(cur+1)}
  else if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();go(cur-1)}
  else if(e.key==='Home'){e.preventDefault();go(0)}
  else if(e.key==='End'){e.preventDefault();go(beats.length-1)}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const r=REG[OI(cur)];if(r){e.preventDefault();r.set(clamp(r.get()+(e.key==='ArrowRight'?1:-1),0,r.n-1))}}
});
addEventListener('scroll',()=>{if(scrollY>40)$('#hint').style.opacity=0},{passive:true});
$('#thm').onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=dark?'light':'dark'};

/* ================= BEAT 2 chinese whispers ================= */
const SYN={add:'build',login:'accounts','sign-in':'login',app:'system',show:'display',button:'control',simple:'basic',fast:'quick',users:'accounts',user:'account',screen:'page',list:'table',create:'build',send:'push',edit:'change',delete:'remove',fix:'update',page:'view',tracker:'manager',repair:'service',track:'monitor',check:'review',make:'build',file:'document',data:'records',small:'minimal',quick:'fast',view:'show',manager:'admin',system:'platform'};
const EXTRA=['for all users','with admin roles','across every team','with notifications','and a dashboard'];
const SCRIPT=['Add sign-in to the Repair Tracker app','Add login to the Repair Tracker app','Add login for repair technicians','Add accounts for repair technicians','Add accounts and roles for the Repair Tracker','Add user accounts with admin roles to the tracker'];
const NODES=['You','Requirements','Design','Tasks','Implement','Verify'];
const WHO=['says it','hears it','reads it','splits it','builds it','checks it'];
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function mutate(msg,k){const w=msg.split(/\s+/);const h=hash(msg+k);const idx=[];w.forEach((x,i)=>{if(SYN[x.toLowerCase().replace(/[.,!?]/g,'')])idx.push(i)});
  if(idx.length&&h%3!==0){const i=idx[h%idx.length];const key=w[i].toLowerCase().replace(/[.,!?]/g,'');w[i]=SYN[key];return w.join(' ')}
  if(w.length>4&&h%2===0){w.splice(1+((h>>3)%(w.length-2)),1);return w.join(' ')}
  if(w.length>13){w.pop();return w.join(' ')}
  return msg+' '+EXTRA[h%EXTRA.length]}
const wh=$('#wh');
wh.innerHTML=NODES.map((n,i)=>`<div class="wn" id="wn${i}"><div class="wb" aria-live="polite"><span class="wt"></span></div><div class="wc"><span class="wd"></span><b>${n}</b><small>${WHO[i]}</small></div></div>`).join('');
let tt=[],tdone=false;
let dvT=0,dvCur=100;function setDrift(p,instant){const el=$('#dv'),bar=$('#dbar'),box=$('#drift');bar.style.width=p+'%';box.style.setProperty('--k',p/100);cancelAnimationFrame(dvT);
  if(instant||reduce){dvCur=p;el.textContent=p+'%';return}const a=dvCur,t0=performance.now();(function f(n){const k=clamp((n-t0)/700,0,1);const v=Math.round(a+(p-a)*(1-Math.pow(1-k,3)));el.textContent=v+'%';dvCur=v;if(k<1)dvT=requestAnimationFrame(f)})(t0)}
function keptPct(orig,msg){const o=orig.toLowerCase().split(/\s+/).filter(Boolean),m=new Set(msg.toLowerCase().split(/\s+/));return o.length?Math.round(100*o.filter(w=>m.has(w)).length/o.length):100}
function resetTel(){tt.forEach(clearTimeout);tt=[];tdone=false;$('#b2 .tel').classList.remove('dim');$('#drift').classList.remove('on');setDrift(100,true);$('#tout').hidden=true;$$('.wn',wh).forEach(n=>{n.classList.remove('on','done');n.querySelector('.wt').innerHTML=''});wh.classList.remove('run');document.dispatchEvent(new CustomEvent('spt-mood',{detail:'neutral'}))}
function runTel(){resetTel();const orig=($('#tin').value||'').trim()||SCRIPT[0];const msgs=[orig];
  if(orig===SCRIPT[0])for(let i=1;i<6;i++)msgs.push(SCRIPT[i]);else for(let i=1;i<6;i++)msgs.push(mutate(msgs[i-1],i));
  const step=reduce?60:1000;$('#tgo').disabled=true;wh.classList.add('run');
  msgs.forEach((m,i)=>{tt.push(setTimeout(()=>{
    $$('.wn',wh).forEach((n,j)=>{n.classList.toggle('on',j===i);n.classList.toggle('done',j<i)});
    const prev=new Set((msgs[i-1]||'').toLowerCase().split(/\s+/));
    $('#wn'+i+' .wt').innerHTML='“'+m.split(/\s+/).map(w=>(i&&!prev.has(w.toLowerCase()))?'<em>'+esc(w)+'</em>':esc(w)).join(' ')+'”';
    $('#drift').classList.add('on');setDrift(keptPct(orig,m));if(i>=3)document.dispatchEvent(new CustomEvent('spt-mood',{detail:'sad'}))},i*step))});
  tt.push(setTimeout(()=>{const o=new Set(orig.toLowerCase().split(/\s+/));const fin=msgs[5];
    $$('.wn',wh).forEach(n=>{n.classList.remove('on');n.classList.add('done')});
    $('#o1').textContent='“'+orig+'”';
    $('#o2').innerHTML='“'+fin.split(/\s+/).map(w=>o.has(w.toLowerCase())?esc(w):'<em>'+esc(w)+'</em>').join(' ')+'”';
    $('#tout').hidden=false;tdone=true;$('#b2 .tel').classList.add('dim');$('#tgo').disabled=false},6*step+300));}
$('#tgo').onclick=runTel;$('#trs').onclick=()=>{resetTel();$('#tgo').disabled=false};
$('#tin').addEventListener('keydown',e=>{if(e.key==='Enter')runTel()});
REG[2]={n:2,get:()=>tdone?1:0,set:i=>i?runTel():resetTel()};
ENTER[2]=()=>{resetTel();$('#tgo').disabled=false};

/* ================= BEAT 3 ladder ================= */
const PP={1:['Senior full-stack engineer','Pilot interview'],2:['Senior / lead engineer',''],3:['Principal backend engineer',''],4:['Junior engineer','10 months in the role'],5:['Director, Software Engineering','Leads 12 engineers'],6:['Senior full-stack engineer','On a new greenfield application']};
const who=$('#who');let senOn=false;
$$('#lad .pp button').forEach(b=>b.onclick=()=>{const p=b.dataset.p;$$('#lad .pp button').forEach(x=>x.setAttribute('aria-pressed',x===b));who.innerHTML=`<b>P${p} · ${esc(PP[p][0])}</b><span class="cap">${esc(PP[p][1]||'Interviewed once')}</span>`;});
function setSen(on){senOn=on;$('#senbtn').setAttribute('aria-pressed',on);$('#senbtn').classList.toggle('sol',on);$$('#lad .rung').forEach(r=>r.classList.toggle('hot',on&&r.dataset.l==='sen'));
  if(on){$$('#lad .pp button').forEach(x=>x.setAttribute('aria-pressed','false'));who.innerHTML='<b>Senior and lead engineers</b><span class="cap">They run spec development. Principals hand it down. Juniors don’t call the shots. That’s why the design is for them.</span>'}
  else who.innerHTML='<b>Tap a participant</b><span class="cap">Roles as listed in my research.</span>'}
$('#senbtn').onclick=()=>setSen(!senOn);
REG[IX('b3')]={n:2,get:()=>senOn?1:0,set:i=>setSen(!!i)};
ENTER[IX('b3')]=()=>setSen(false);

/* ================= BEAT 4 maps ================= */
const f1=n=>+n.toFixed(1);
function nodeBox(cx,cy,text,cls,maxc,attr){const L=wrap(text,maxc||14);const w=Math.max(...L.map(l=>l.length))*6.2+16;const h=L.length*13+9;
  return `<g class="node ${cls||''}" ${attr||''} tabindex="0" transform="translate(${f1(cx)} ${f1(cy)})"><rect x="${f1(-w/2)}" y="${f1(-h/2)}" width="${f1(w)}" height="${h}" rx="3"/><text y="${f1(-h/2+14-1)}" font-size="11">${tspans(L,0,13)}</text></g>`}
const SHC={'Engineers':8,'Product Owner':48,'Product Manager':48,'Project Manager':48,'Associate Manager':48,'Teams Owning Other Repos':46,'Other Developers & Testers':47,'SEC':11,'FDIC':11,'Policies':11,'GitHub Copilot':1,'Claude Code':1,'VS Code':1,'Sub-Agent':1};
function stakeholder(){
  const cx=380,cy=226,RX=[140,200,255,300],RY=[66,108,148,188];let s=`<svg viewBox="0 0 760 468" role="img" aria-label="Simplified stakeholder map">`;
  RX.forEach((rx,i)=>{s+=`<ellipse class="rg" cx="${cx}" cy="${cy}" rx="${rx}" ry="${RY[i]}"/><text class="rgl m" x="${cx+4}" y="${cy-RY[i]+11}">${i+1}</text>`});
  s+=`<g class="node hi"><ellipse cx="${cx}" cy="${cy}" rx="92" ry="44" style="fill:var(--hi);stroke:var(--line);stroke-width:1.5"/><text y="${cy-8}" font-size="11" text-anchor="middle">${tspans(wrap('Missing context detected before code is generated',22),cx,13)}</text></g>`;
  const P=(ri,i,n,st)=>{const a=(st+i*360/n)*Math.PI/180;return [cx+RX[ri]*Math.cos(a),cy+RY[ri]*Math.sin(a)]};
  const rings=[[['Engineers',0],['Product Owner',0]],[['Project Manager',0],['Product Manager',0],['Product Designer',0],['Other Developers & Testers',0],['Teams Owning Other Repos',0],['Associate Manager',0]],[['Client',0],['CTO',0],['CEO',0],['COO',0]],[['SEC',0],['FDIC',0],['Policies',0],['AI Relevance',0],['Industrial Trends',0],['Customer Testing Environment',1],['Tech Stack',1],['GitHub Copilot',1],['Claude Code',1],['VS Code',1],['Sub-Agent',1]]];
  const st=[180,30,45,15];
  rings.forEach((r,ri)=>r.forEach((it,i)=>{const p=P(ri,i,r.length,st[ri]);s+=nodeBox(p[0],p[1],it[0],it[1]?'dsh':'',ri===3?16:14,SHC[it[0]]!=null?`data-code="${SHC[it[0]]}"`:'')}));
  s+=`<text class="m" x="10" y="462" font-size="10" style="font-family:var(--mono);fill:var(--ink3)">solid = people and policy · dashed = tools and environment · rings 1 to 4 = closest to furthest</text></svg>`;return s}
function polar(r,a){const t=a*Math.PI/180;return [r*Math.cos(t),r*Math.sin(t)]}
function secPath(r0,r1,a0,a1){const lg=(a1-a0)>180?1:0;const [x1,y1]=polar(r1,a0),[x2,y2]=polar(r1,a1),[x3,y3]=polar(r0,a1),[x4,y4]=polar(r0,a0);return `M${f1(x1)} ${f1(y1)}A${r1} ${r1} 0 ${lg} 1 ${f1(x2)} ${f1(y2)}`+(r0>0?`L${f1(x3)} ${f1(y3)}A${r0} ${r0} 0 ${lg} 0 ${f1(x4)} ${f1(y4)}Z`:`L0 0Z`)}
function ecosystem(){
  const R=[50,100,150,205];let s=`<svg viewBox="0 0 660 500" role="img" aria-label="Simplified ecosystem map"><g transform="translate(330 245)">`;
  const Q=[['Specify',180,270],['Executing',270,360],['Testing',0,90],['Maintain',90,180]];
  Q.forEach(q=>{s+=`<g class="ph"><path class="q" d="${secPath(0,q[0]==='Executing'?232:205,q[1],q[2])}"/></g>`});
  s+=`<path d="${secPath(205,232,270,360)}" fill="var(--fill2)" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  R.forEach((r,i)=>{s+=`<circle class="rg" r="${r}"/>`});
  s+=`<line x1="-205" y1="0" x2="205" y2="0" stroke="var(--line)" stroke-width="1.5"/><line x1="0" y1="-232" x2="0" y2="205" stroke="var(--line)" stroke-width="1.5"/>`;
  s+=`<text class="m" x="0" y="248" font-size="9.5" text-anchor="middle" style="font-family:var(--mono);fill:var(--ink3)">rings from the centre: phases · touchpoints · interactions · needs</text>`;
  const tile=(r,a,txt,cls,w)=>{const p=polar(r,a);w=w||80;return `<g class="node ${cls||''}" ${txt==='context lost'?'data-code="46" tabindex="0"':''} transform="translate(${f1(p[0])} ${f1(p[1])})"><rect x="${-w/2}" y="-11" width="${w}" height="22" rx="3"/><text y="3.5" font-size="10">${esc(txt)}</text></g>`};
  [[225,'Specify'],[45,'Testing'],[135,'Maintain']].forEach(([a])=>{s+=tile(75,a,'tools','dsh')+tile(125,a,'people, process','dsh',96)+tile(178,a,'context lost','dsh',86)});
  s+=tile(75,315,'tools','dsh')+tile(178,330,'context lost','dsh',86)+tile(125,296,'Idea 1','hi',60)+tile(125,344,'Idea 2','hi',60);
  s+=`<text x="-322" y="-218" font-size="13" font-weight="600">SPECIFY</text><text x="322" y="-218" font-size="13" font-weight="600" text-anchor="end">EXECUTING</text><text x="322" y="-200" font-size="10" text-anchor="end" class="m" style="font-family:var(--mono);fill:var(--ink2)">plan · tasks · implement</text>`;
  s+=`<text x="322" y="228" font-size="13" font-weight="600" text-anchor="end">TESTING</text><text x="-322" y="228" font-size="13" font-weight="600">MAINTAIN</text>`;
  s+=`<text x="322" y="-182" font-size="10" text-anchor="end" class="m" style="font-family:var(--mono);fill:var(--ink3)">where the ideas act</text>`;
  return s+'</g></svg>'}
function journey(){
  const PH=['Direction','Generation','Output','Realization','Revision'];const X0=100,W=128;
  const ACT=['Types a plain-English prompt','Watches the reasoning and edits stream','Reads against the spec, or skims','Hunts the chat for the assumption','Rewrites the prompt, or undoes and re-prompts'];
  const PAIN=['Context across repos won’t fit in one prompt','At gaps, the agent just assumes','Review drops to skimming as volume rises','Hard to trace where it went wrong','Repetitive, tiring rework'];
  const EM=['Expectant','Optimistic','Cautious','Exasperated','Fatigued'];const EY=[262,242,278,300,312];
  let s=`<svg viewBox="0 0 744 430" role="img" aria-label="Simplified journey map">`;
  s+=`<rect x="8" y="6" width="728" height="30" rx="3" fill="var(--fill)" stroke="var(--line)" stroke-width="1.5"/><text x="18" y="25" font-size="11"><tspan class="m" style="font-family:var(--mono);fill:var(--ink3)">ARCHETYPE </tspan> The Conductor: a domain-aware software engineer who guides an agent</text>`;
  PH.forEach((p,i)=>{const x=X0+i*W;s+=`<g class="ph"><rect class="q" x="${x}" y="44" width="${W-4}" height="344"/><rect x="${x}" y="44" width="${W-4}" height="30" rx="3" fill="var(--hi)"/><text x="${x+(W-4)/2}" y="63" font-size="12" font-weight="600" text-anchor="middle" style="fill:var(--hiInk)">${p}</text>`;
    wrap(ACT[i],20).forEach((l,k)=>{s+=`<text x="${x+6}" y="${96+k*12.5}" font-size="10.5">${esc(l)}</text>`});
    wrap(PAIN[i],20).forEach((l,k)=>{s+=`<text class="pt" data-ph="${i}" x="${x+6}" y="${170+k*12.5}" font-size="10.5">${esc(l)}</text>`});
    s+='</g>'});
  [['ACTIONS',80,64],['PAINS',154,64],['EMOTION',228,110],['OPPORTUNITIES',344,44]].forEach(l=>{s+=`<text class="m" x="10" y="${l[1]+12}" font-size="9" style="font-family:var(--mono);fill:var(--ink3)">${l[0]}</text><line x1="8" x2="736" y1="${l[1]-2}" y2="${l[1]-2}" stroke="var(--line2)"/>`});
  let pts=EM.map((e,i)=>[X0+i*W+(W-4)/2,EY[i]]);
  s+=`<path class="jbefore" d="M${pts.map(p=>p.join(' ')).join('L')}" fill="none" stroke="var(--line)" stroke-width="1.8"/>`;
  const EY2=[262,236,252,262,272];const pts2=EY2.map((y,i)=>[X0+i*W+(W-4)/2,y]);
  s+=`<path class="jafter" d="M${pts2.map(p=>p.join(' ')).join('L')}" fill="none" stroke="var(--hi)" stroke-width="2.4"/>`;pts2.forEach(p=>{s+=`<circle class="jafter" cx="${p[0]}" cy="${p[1]}" r="5.5" fill="var(--bg)" stroke="var(--hi)" stroke-width="2.4"/>`});
  pts.forEach((p,i)=>{s+=`<circle class="jbefore" cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--hi)"/><text x="${p[0]}" y="${p[1]+19}" font-size="10" text-anchor="middle" class="m" style="font-family:var(--mono)">${EM[i]}</text>`});
  s+=`<g class="pillsvg"><rect x="${X0+4}" y="350" width="${W-12}" height="32" rx="3"/><text x="${X0+10}" y="364" font-size="9.5">${tspans(['Intervention 1:','Context Compiler'],X0+10,12)}</text><rect x="${X0+W+4}" y="350" width="${W-12}" height="32" rx="3"/><text x="${X0+W+10}" y="364" font-size="9.5">${tspans(['Intervention 2:','Assumption gating'],X0+W+10,12)}</text></g>`;
  s+=`<text class="m" x="10" y="412" font-size="9.5" style="font-family:var(--mono);fill:var(--ink3)">+ needs · backstage · gains · experience · software · actors · sources (more lanes in the full map)</text></svg>`;return s}
const LF={'0-0':'data-code="6"','0-1':'data-code="9" data-jp="1"','0-2':'data-idea="A"','1-0':'data-code="39"','1-1':'data-code="44"','2-0':'data-code="48"','2-1':'data-code="59"','3-0':'data-code="52" data-jp="3"','3-1':'data-code="23" data-jp="2"','3-2':'data-idea="B"'};
function mindmap(){
  let s=`<svg viewBox="0 0 880 450" role="img" aria-label="Simplified mind map">`;
  const cx=440,cy=220;
  const CL=[['Context & Dependency Gaps','6 of 6',255,110,'l',['Specs omit edge cases and rules','Agents make unauthorized inferences'],'Automated Pre-Ingestion Context Compiler'],
    ['Architectural Guardrails & System Rules','5 of 6',625,110,'r',['Unapproved libraries and frameworks','Style and file structure ignored'],null],
    ['Cross-Functional Handoff & Alignment','5 of 6',625,330,'r',['Static mockups miss interactive states','Design intent and code drift apart'],null],
    ['Intent Verification & Decision Traceability','5 of 6',255,330,'l',['Decisions trapped in private chats','Reviews turn to skimming'],'Record AI assumptions and force explicit human gating']];
  CL.forEach(c=>{s+=`<path d="M${cx} ${cy}Q${(cx+c[2])/2} ${cy} ${c[2]} ${c[3]}" fill="none" stroke="var(--line)" stroke-width="1.5"/>`});
  CL.forEach((c,ci)=>{const side=c[4]==='l'?-1:1;const lx=c[4]==='l'?70:810;const ex=c[2]+side*95;const ys=c[3]<200?[40,104,170]:[274,340,404];
    const leaves=c[5].slice();if(c[6])leaves.push(c[6]);
    leaves.forEach((t,k)=>{const y=ys[k];const strong=c[6]&&k===leaves.length-1;
      s+=`<path d="M${ex} ${c[3]}C${(ex+lx-side*65)/2} ${c[3]} ${(ex+lx-side*65)/2} ${y} ${lx-side*65} ${y}" fill="none" stroke="var(--${strong?'line':'ink3'})" stroke-width="1.3" ${strong?'':'stroke-dasharray="3 4"'}/>`;
      s+=nodeBox(lx,y,(strong?'STRONG · ':'')+t,strong?'hi':'dsh',22,LF[ci+'-'+k]||'')});
  });
  s+=`<g class="node hi"><rect x="${cx-100}" y="${cy-40}" width="200" height="80" rx="5" style="fill:var(--hi);stroke:var(--line);stroke-width:1.5"/><text y="${cy-18}" font-size="11.5">${tspans(wrap('How might we detect and surface missing context gaps before code is generated?',25),cx,14)}</text></g>`;
  CL.forEach(c=>{const L=wrap(c[0],27);const h=L.length*13+26;s+=`<g class="node" data-cl="${CL.indexOf(c)}" tabindex="0" transform="translate(${c[2]} ${c[3]})"><rect x="-95" y="${-h/2}" width="190" height="${h}" rx="4"/><text y="${-h/2+15}" font-size="11.5" font-weight="600">${tspans(L,0,13)}<tspan x="0" dy="15" font-size="10" font-weight="400" class="m" style="font-family:var(--mono)">${c[1]} participants</tspan></text></g>`});
  s+=`<text class="m" x="10" y="444" font-size="9.5" style="font-family:var(--mono);fill:var(--ink3)">pain clusters in the middle · dashed = pain points · solid = strongest actions (4+ of 6 participants)</text></svg>`;return s}
$('#m-st').innerHTML=stakeholder();$('#m-ec').innerHTML=ecosystem();$('#m-jo').innerHTML=journey();$('#m-mi').innerHTML=mindmap();
const C4=['Who surrounds the work: engineers and the Product Owner closest in, then the wider team, leadership and the client, then policy, environment and tools. It showed why I focused on senior engineers. Bolder nodes carry interview evidence.','The tools, people and processes around each stage of SDD, and where my idea sits. Context gets lost between the rings.','One engineer’s run with an agent, from direction to revision, with pains and emotion along the way.','Every pain point, grouped into four clusters, with the actions that came out of them.'];
const T4=tabs($('#t4'),i=>{$$('#mw4 .mp').forEach((m,j)=>m.classList.toggle('on',j===i));$('#c4').textContent=C4[i];$('#par4').hidden=!(i===2||i===3);$('#jx').hidden=i!==2;if(i>=2){const b=$('#par4 .bar i');b.style.animation='none';void b.offsetWidth;b.style.animation=''}});
T4.sel(0);REG[IX('b4')]={n:4,get:T4.get,set:T4.sel};
$('#mw4').addEventListener('click',e=>{const n=e.target.closest('.node');if(!n||n.classList.contains('hi'))return;n.classList.toggle('sel')});
$('#mw4').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('node')){e.preventDefault();e.target.classList.toggle('sel')}});
function openOv(html){$('#ovin').innerHTML=html;$('#ov').classList.add('show');$('#ovx').focus()}
function closeOv(){$('#ov').classList.remove('show')}
$('#ovx').onclick=closeOv;
$('#enl').onclick=()=>{const m=$('#mw4 .mp.on svg');if(m)openOv(m.outerHTML.replace('<svg ','<svg style="width:100%;height:auto;min-width:0" '))};

/* ================= thematic map builder ================= */
function buildTM(svg,opt){
  const mini=!!opt.mini;const R0=172,T0=184,T1=274,M0=284,M1=300,GT=1.6,GM=2.2;
  const SL=[[180,270],[270,360],[0,90],[90,180]];
  const NS='http://www.w3.org/2000/svg';
  let h='';
  SL.forEach(s=>{h+=`<path class="sl" d="${secPath(0,R0,s[0],s[1])}"/>`});
  const CLN=['Context','Guardrails','Handoff','Intent'];
  SL.forEach((s,i)=>{const p=polar(R0-9,(s[0]+s[1])/2);h+=`<text class="m" x="${f1(p[0])}" y="${f1(p[1])}" text-anchor="middle" font-size="8.5" style="font-family:var(--mono);fill:var(--ink3);letter-spacing:.08em">${CLN[i].toUpperCase()}</text>`});
  const A=i=>-90+24*i;
  TD.themes.forEach((t,i)=>{const mid=A(i)+12;const p=polar(229,mid);h+=`<path class="th" data-t="${i}" d="${secPath(T0,T1,A(i)+GT/2,A(i+1)-GT/2)}"/>`;if(!mini)h+=`<text class="tn2" data-t="${i}" x="${f1(p[0])}" y="${f1(p[1])}">${i+1}</text>`});
  TD.metas.forEach((m,i)=>{const a=m.themes[0],b=m.themes[m.themes.length-1];const mid=(A(a)+A(b+1))/2;const p=polar(292,mid);
    h+=`<path class="mt" data-m="${i}" d="${secPath(M0,M1,A(a)+GM/2,A(b+1)-GM/2)}"/>`;if(!mini)h+=`<text class="tn2" data-m="${i}" x="${f1(p[0])}" y="${f1(p[1])}" style="font-size:10px">${'ABCD'[i]}</text>`});
  h+='<g class="lkg"></g>';
  // dots
  const byC=[[],[],[],[]];TD.codes.forEach((c,i)=>byC[c.pc].push(i));
  const pos=new Array(TD.codes.length);
  byC.forEach((list,ci)=>{const s=SL[ci];const mid=(s[0]+s[1])/2;const anc=polar(105,mid);const cand=[];
    for(let j=-9;j<=9;j++)for(let k=-9;k<=9;k++){const x=(k+(j&1)*.5)*21,y=j*21*.866;const r=Math.hypot(x,y);if(r<30||r>126)continue;if(Math.abs(x)<13||Math.abs(y)<13)continue;
      const q=(x<0?(y<0?0:3):(y<0?1:2));if(q!==ci)continue;cand.push([x,y,Math.hypot(x-anc[0],y-anc[1])])}
    cand.sort((a,b)=>a[2]-b[2]);list.sort((a,b)=>TD.codes[b].q-TD.codes[a].q).forEach((ci2,k)=>{pos[ci2]=cand[k]})});
  TD.codes.forEach((c,i)=>{const p=pos[i];if(!p)return;
    if(c.ja){const pts=[0,1,2,3,4,5].map(k=>{const a=(30+60*k)*Math.PI/180;return f1(p[0]+9.5*Math.cos(a))+','+f1(p[1]+9.5*Math.sin(a))}).join(' ');h+=`<polygon class="dt" data-i="${i}" tabindex="0" role="button" aria-label="${esc(c.n)}" points="${pts}"/>`}
    else h+=`<circle class="dt" data-i="${i}" tabindex="0" role="button" aria-label="${esc(c.n)}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="7.2"/>`});
  svg.innerHTML=h;
  const lkg=$('.lkg',svg);const dots=$$('.dt',svg);const ths=$$('.th',svg),mts=$$('.mt',svg);const nums=$$('text.tn2[data-t]',svg),mnums=$$('text.tn2[data-m]',svg);
  let pinned=-1,hov=-1,ideas=[false,false];
  function clear(){$$('.on',svg).forEach(e=>e.classList.remove('on'));dots.forEach(d=>d.classList.remove('dim'));lkg.innerHTML=''}
  function link(i,t){const p=pos[i];const tm=A(t)+12;const e=polar(T0,tm);const c=[p[0]*.35+e[0]*.1,p[1]*.35+e[1]*.1];
    let d=document.createElementNS(NS,'path');d.setAttribute('class','lk');d.setAttribute('d',`M${f1(p[0])} ${f1(p[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(e[0])} ${f1(e[1])}`);lkg.appendChild(d);
    const a=polar(T1,tm),b=polar(M0,tm);d=document.createElementNS(NS,'path');d.setAttribute('class','lk sec');d.setAttribute('d',`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`);lkg.appendChild(d)}
  function paint(){clear();const i=pinned>=0?pinned:hov;if(i<0){opt.info&&opt.info(null);if(ideas[0]||ideas[1])paintIdeas();return}
    const c=TD.codes[i];dots.forEach((d,j)=>{d.classList.toggle('dim',j!==i)});dots[i].classList.add('on');
    c.t.forEach(t=>{ths[t].classList.add('on');nums[t]&&nums[t].classList.add('on');link(i,t)});
    c.m.forEach(m=>{mts[m].classList.add('on');mnums[m]&&mnums[m].classList.add('on')});
    opt.info&&opt.info({code:c,pinned:pinned>=0})}
  function paintGroup(kind,idx){clear();
    if(kind==='t'){ths[idx].classList.add('on');nums[idx]&&nums[idx].classList.add('on');dots.forEach((d,j)=>d.classList.toggle('dim',!TD.codes[j].t.includes(idx)));opt.info&&opt.info({theme:idx})}
    else{mts[idx].classList.add('on');mnums[idx]&&mnums[idx].classList.add('on');TD.metas[idx].themes.forEach(t=>{ths[t].classList.add('on');nums[t]&&nums[t].classList.add('on')});dots.forEach((d,j)=>d.classList.toggle('dim',!TD.codes[j].m.includes(idx)));opt.info&&opt.info({meta:idx})}}
  function paintIdeas(){dots.forEach((d,j)=>{const t=TD.codes[j].i;const hi=(ideas[0]&&t==='c')||(ideas[1]&&t==='g');d.classList.toggle('ic',ideas[0]&&t==='c');d.classList.toggle('ig',ideas[1]&&t==='g');d.classList.toggle('dim',(ideas[0]||ideas[1])&&!hi)})}
  if(mini){dots.forEach((d,j)=>{const show=()=>opt.cap&&opt.cap(TD.codes[j]);d.addEventListener('pointerenter',show);d.addEventListener('focus',show);d.addEventListener('click',show)})}
  else{
    dots.forEach((d,j)=>{d.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hov=j;if(pinned<0)paint()}});d.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hov=-1;if(pinned<0)paint()}});
      d.addEventListener('focus',()=>{hov=j;if(pinned<0)paint()});d.addEventListener('blur',()=>{hov=-1;if(pinned<0)paint()});
      d.addEventListener('click',e=>{e.stopPropagation();pinned=pinned===j?-1:j;paint()});d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click()}})});
    [[ths,'t'],[mts,'m']].forEach(([arr,k])=>arr.forEach((el,idx)=>{el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&pinned<0)paintGroup(k,idx)});el.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&pinned<0)paint()});el.addEventListener('click',e=>{e.stopPropagation();pinned=-1;paintGroup(k,idx)})}));
    svg.addEventListener('click',()=>{pinned=-1;paint()});paint();}
  return {setIdeas(a,b){ideas=[a,b];paintIdeas()},reset(){pinned=-1;hov=-1;ideas=[false,false];if(mini){paintIdeas()}else paint()}}}
/* beat 5 */
const info5=$('#tmInfo');
let stage5=3;
const STT=[['252 quotes','Every dot is one thing an engineer said, in their own words, across the six interviews. Tap a dot to read it.'],['62 codes','Quotes that say the same thing collapse into one code, a short label. Codes sit in four clusters.'],['15 themes','Codes that belong together form a theme.'],['4 meta-themes','Themes that point the same way group into four big ideas.']];
const HEXP=[0,1,2,3,4,5].map(k=>{const a=(30+60*k)*Math.PI/180;return f1(9.5*Math.cos(a))+','+f1(9.5*Math.sin(a))}).join(' ');
const LIC={dot:'<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="3.6"/></svg>',circ:'<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="7.2"/></svg>',hex:`<svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="${HEXP}"/></svg>`,seg:`<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="${secPath(3,12,-128,-52)}" transform="translate(0,6)"/></svg>`};
const metaCol=m=>/lacks context/i.test(m.name)?'#9AA6FF':/intent|rules/i.test(m.name)?'#FF7A6B':/verify|control/i.test(m.name)?'#F08BC4':'#5CCB8A';
function legend(){const s=Math.min(stage5,3),S=STT[s];
  const L=[];if(s===0)L.push(['dot','One dot is one quote']);
  if(s>=1){L.push(['circ','Circle: a code grouped by the analysis']);L.push(['hex','Hexagon: a code I placed by judgement'])}
  if(s>=2)L.push(['seg','Numbered segment: one theme']);
  let h=`<div class="k">Stage ${s+1} of 4</div><h3>${S[0]}</h3><p>${S[1]}</p><ul class="lg">`+L.map(([k,x])=>`<li><i class="lgi">${LIC[k]}</i><span>${x}</span></li>`).join('')+'</ul>';
  if(s>=3)h+='<ul class="lg lgm">'+TD.metas.map((m,i)=>`<li><i class="lgb" style="--c:${metaCol(m)}">${'ABCD'[i]}</i><span>${esc(m.name)}</span></li>`).join('')+'</ul>';
  info5.innerHTML=h}
const tm5=buildTM($('#tm5'),{info:d=>{
  if(!d){legend();return}
  if(d.code){const c=d.code;const ci=TD.codes.indexOf(c);const q0=(Q[ci]||[])[0];info5.innerHTML=`<div class="k">Code · ${c.q} quotes · ${c.p} participant${c.p>1?'s':''}</div><h3>${esc(c.n)}</h3><p>Feeds themes ${c.t.map(t=>t+1).join(', ')}. Closest cluster: ${esc(TD.clusters[c.pc])}${c.ja?' (placed by my judgement)':''}.</p>${q0?`<div class="quote"><span class="tag">${q0[0].split('-')[0]}</span>“${esc(cut(q0[1],150))}”</div>`:''}${d.pinned?`<div class="chips"><button class="chip2" data-ev="${ci}">All ${c.q} quotes →</button></div>`:'<p class="cap" style="margin:0">Click the dot to pin it and open all its quotes.</p>'}`}
  else if(d.theme!=null){const t=d.theme;const n=TD.codes.filter(c=>c.t.includes(t)).length;info5.innerHTML=`<div class="k">Theme ${t+1} · ${n} codes</div><h3>${esc(TD.themes[t])}</h3><p>Meta-theme ${'ABCD'[TD.themeMeta[t]]}: ${esc(TD.metas[TD.themeMeta[t]].name)}</p>`}
  else{const m=d.meta;const n=TD.codes.filter(c=>c.m.includes(m)).length;info5.innerHTML=`<div class="k">Meta-theme ${'ABCD'[m]} · ${n} codes</div><h3>${esc(TD.metas[m].name)}</h3><p>${TD.metas[m].themes.length} themes</p>`}}});
legend();
ENTER[IX('b5')]=()=>{tm5.reset()};

/* beat 6 */
const nA=TD.codes.filter(c=>c.i==='c').length,nB=TD.codes.filter(c=>c.i==='g').length;
$('#nA').textContent=nA+' supporting codes (my judgement)';$('#nB').textContent=nB+' supporting codes (my judgement)';
const tm6=buildTM($('#tm6'),{mini:true,cap:c=>{$('#miniCap').textContent=c.n+' · '+c.q+' quotes'}});
let iA=false,iB=false;
function setIdeas(a,b){iA=a;iB=b;$('#iA').setAttribute('aria-pressed',a);$('#iB').setAttribute('aria-pressed',b);tm6.setIdeas(a,b);
  $('#miniCap').textContent=a&&b?'Both ideas highlighted. Filled = Context Compiler, outlined = Assumption gating.':a?nA+' codes support the Context Compiler.':b?nB+' codes support Assumption gating.':'Hover a dot for its code. Highlight counts are my judgement.'}
$('#iA').onclick=()=>setIdeas(!iA,iB);$('#iB').onclick=()=>setIdeas(iA,!iB);
const S6=[[0,0],[1,0],[0,1],[1,1]];let s6=0;
REG[IX('b6')]={n:4,get:()=>s6,set:i=>{s6=i;setIdeas(!!S6[i][0],!!S6[i][1])}};
ENTER[IX('b6')]=()=>{s6=0;setIdeas(false,false)};
$('#iA').addEventListener('click',()=>{s6=iA&&iB?3:iA?1:iB?2:0});$('#iB').addEventListener('click',()=>{s6=iA&&iB?3:iA?1:iB?2:0});

/* ================= BEAT 7 lifecycle ================= */
const C7=['The standard flow: prompt, requirements, design, tasks, implement, verify. Where the spec has gaps, the AI fills them.','Idea 1 goes in before Design. It gathers repo patterns, tech stack and dependencies, and flags the gaps with a suggested line each.','Idea 2 closes the loop: the engineer approves the lines (blocking ones must pass), the agent records every assumption with a reason, one review shows context used and assumptions made, and approved assumptions are saved to the spec and audit log.'];
let st7=0,p7=null;
function setLC(i){st7=i;$$('#lc .ins').forEach(n=>n.classList.toggle('show',i>=+n.dataset.s));$('#upd').classList.toggle('hi',i>=2);$('#updS').style.display=i>=2?'block':'none';$('#c7').textContent=C7[i];T7.sel(i)}
const T7=tabs($('#t7'),i=>{if(i!==st7)setLC(i);else{$('#c7').textContent=C7[i];$$('#lc .ins').forEach(n=>n.classList.toggle('show',i>=+n.dataset.s))}});
function play7(){clearInterval(p7);setLC(0);let k=0;p7=setInterval(()=>{k++;setLC(k);if(k>=2)clearInterval(p7)},reduce?200:1700)}
$('#play7').onclick=play7;
REG[IX('b7')]={n:3,get:()=>st7,set:i=>{clearInterval(p7);setLC(i)}};
ENTER[IX('b7')]=()=>{clearInterval(p7);setLC(0)};

/* ================= BEAT 8 pipeline ================= */
const PS=['Generated code hides architectural violations.','Context stays trapped in private chats, so reviews turn into skimming.','Short prompts let agents guess. Exhaustive prompts take too long.'];
const P8=[
 `<div class="parl">Problem statements · three of them · tap one to trace it</div>${PS.map((t,i)=>`<button class="stm btn2" data-tr="${i}" aria-pressed="false"><b>${i+1}</b><q>${t}</q></button>`).join('')}<div class="trace" id="trc" aria-live="polite"></div>`,
 `<div class="parl">How might we</div><div class="stm"><b>HMW</b><q>How might we automatically detect and surface architectural and query missing context gaps before code is generated to prevent unauthorized agent inferences?</q></div>`,
 `<div class="parl">User story</div><div class="stm"><b>Senior software engineer</b><q>As a Senior Software Engineer, I want the system to detect and surface missing context gaps before code generation, so that I can prevent unauthorized agent inferences.</q></div>`,
 `<div class="parl">User flow</div><div class="flowrow"><span class="nd">Add spec</span><span class="ar">→</span><span class="nd hi">Context Compiler</span><span class="ar">→</span><span class="nd rd hi">Approve lines</span><span class="ar">→</span><span class="nd">Design</span><span class="ar">→</span><span class="nd">Tasks</span><span class="ar">→</span><span class="nd">Export</span></div><div class="stm"><b>What changed</b><q>The gate moved to right after the compiler, before design.</q></div>`,
 `<div class="parl">Visuals · hover or tap a version</div><div class="v12"><div class="wf" data-wf="1"><b>Version 1 · core flow</b><div class="bl s">step 1 · spec</div><div class="bl">step 2 · gaps</div><div class="bl">step 3 · review</div><div class="wfs"><i class="on"></i><i></i><i></i></div></div><div class="wf"><b>Version 2 · spec map</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><div class="bl">Scope</div><div class="bl s">Requirements</div><div class="bl">Edge cases</div><div class="bl s">Acceptance</div><div class="bl" style="grid-column:span 2">Goals & Context</div></div></div></div><div class="stm"><b>Why version 2</b><q>Version 1 felt too jarring. The spec map shows the whole spec in one place, with gaps shown where they are.</q></div>`];
const st8=$('#st8');
const T8=tabs($('#pp8'),i=>{st8.innerHTML=`<div style="animation:fin .4s ease both;display:grid;gap:10px">${P8[i]}</div>`;
  const w=$('.wf[data-wf]',st8);if(w){let k=0;const bl=$$('.bl',w),dots=$$('.wfs i',w);const tick=()=>{k=(k+1)%3;bl.forEach((b,j)=>b.classList.toggle('s',j===k));dots.forEach((d,j)=>d.classList.toggle('on',j===k))};let iv=null;
    const start=()=>{if(!iv)iv=setInterval(tick,650)},stop=()=>{clearInterval(iv);iv=null};w.addEventListener('pointerenter',start);w.addEventListener('pointerleave',stop);w.addEventListener('click',()=>iv?stop():start())}});
T8.sel(0);REG[IX('b8')]={n:5,get:T8.get,set:T8.sel};ENTER[IX('b8')]=()=>T8.sel(T8.get());


})();
