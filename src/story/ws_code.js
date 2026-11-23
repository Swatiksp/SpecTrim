
/* ===== beat 9: the website's own 10-step scene (lifted from swatik.site), scrubbed by scroll ===== */
const ST9=[
 {t:'Start with the spec.',b:'Paste the spec you want an AI agent to build from, then map it.',m:'n',c:0},
 {t:'Your spec stays live.',b:'It becomes one card in the middle of the map, and updates as you approve lines.',m:'n',c:.115},
 {t:'The map builds the anatomy of your spec.',b:'Scope, requirements, edge cases, acceptance and goals each grow their own ring of lines.',m:'n',c:.19},
 {t:'Weak areas ask for you.',b:'Every part shows how many lines the AI added and how many need your attention.',m:'s',c:.275},
 {t:'Open a part to see every line.',b:'Requirements, opened up: lines grouped by priority, with the ones that need you first.',m:'n',c:.35},
 {t:'Answer a gap in one place.',b:'Open a line, see why it is here and what the AI looked for, then answer it. Your answer joins the spec.',m:'n',c:.5},
 {t:'Back on the map, it is green.',b:'Every part reports no gaps found, so nothing is left that blocks export.',m:'h',c:.6},
 {t:'Three marks to read the map by.',b:'AI shows what was added. No gaps found shows what is covered. The export ring shows whether anything still blocks you.',m:'h',c:.7},
 {t:'The review list shows the way out.',b:'Every must-approve item is approved, so export is ready.',m:'h',c:.8},
 {t:'Export carries every change.',b:'Send it as a Copilot issue, a Jira ticket or a PDF. Each one lists every line added during review, and unreviewed lines travel on as suggestions.',m:'h',c:.93}];
const STB9=[.07,.14,.23,.30,.40,.54,.63,.76,.86];
(function(){
const sc9=$('#sc9'),stk=$('.stk',sc9),vp=$('#vp9'),host=$('#ws9');sc9.style.setProperty('--n',ST9.length);
const root=host.attachShadow({mode:'open'});
root.innerHTML='<style>:host{display:block;position:relative;width:571px;height:600px;transform-origin:0 0;font-family:"IBM Plex Sans",sans-serif;color:#ECEDEF;line-height:1.5;text-align:left;-webkit-font-smoothing:antialiased}*,*::before,*::after{box-sizing:border-box;border-width:0;border-style:solid}img,svg{display:block;vertical-align:middle}img{max-width:100%;height:auto}@keyframes concept-ring-drift{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.025) rotate(1.6deg)}}.concept-ring{animation:concept-ring-drift 9s ease-in-out infinite;transform-origin:50% 50%}@media (prefers-reduced-motion:reduce){.concept-ring{animation:none}}</style>'+WS.h;
const st=root.lastElementChild,all=[...st.querySelectorAll('*')],N=WS.T.length;
const KF=new Map();
WS.T.forEach((d,s)=>d.forEach(([k,val])=>{if(k>=348)return;const p=val.indexOf('\u0001');let e=KF.get(k);if(!e){e={ks:[],sv:[],tv:[],leaf:!all[k].children.length};KF.set(k,e)}e.ks.push(s);e.sv.push(val.slice(0,p));e.tv.push(val.slice(p+1))}));
const NUM=/-?\d*\.?\d+(?:e-?\d+)?/g,SK=new Map(),skel=s=>{let v=SK.get(s);if(v===undefined){v=s.replace(NUM,'#');SK.set(s,v)}return v};
function at(e,s){let lo=0,hi=e.ks.length-1,j=0;while(lo<=hi){const m=(lo+hi)>>1;if(e.ks[m]<=s){j=m;lo=m+1}else hi=m-1}return j}
function lerp(a,b,t){if(a===b||t<=0)return a;if(skel(a)!==skel(b))return t<.5?a:b;const nb=b.match(NUM);let i=0;return a.replace(NUM,x=>{const y=+nb[i++],xv=+x;return String(+(xv+(y-xv)*t).toFixed(6))})}
let lastI=-1;
function apply(i){i=clamp(i,0,N-1);if(Math.abs(i-lastI)<.001)return;lastI=i;const a=Math.floor(i),t=i-a,b=Math.min(a+1,N-1);
  KF.forEach((e,k)=>{const ja=at(e,a),jb=at(e,b);const sa=e.sv[ja],sb=e.sv[jb];const out=lerp(sa,sb,t);const el=all[k];
    if(el.getAttribute('style')!==out)el.setAttribute('style',out);
    if(e.leaf){const tx=t<.5?e.tv[ja]:e.tv[jb];if(el.textContent!==tx)el.textContent=tx}})}
/* the export panel (the site's last layer) remounts its markup three times near the end (Copilot, Jira, PDF): replay the captured states */
let pn=[],pg=null;const exS=EX.S.map(s=>{const n=pg===s.g?pn.slice():[];for(const k in s.d)n[+k]=s.d[k];pg=s.g;pn=n;return{f:s.f,g:s.g,r:s.r,st:n.map(v=>v.slice(0,v.indexOf('\u0001'))),tx:n.map(v=>v.slice(v.indexOf('\u0001')+1))}});
const exEls={};let exCur=null,lastF=-1;
function exMount(g){if(exCur&&exCur.g===g)return exCur;let e=exEls[g];if(!e){const tp=document.createElement('template');tp.innerHTML=EX.V[g];const el=tp.content.firstElementChild;e={g,el,all:[...el.querySelectorAll('*')]};exEls[g]=e}const old=st.children[6];if(old!==e.el)st.replaceChild(e.el,old);exCur=e;return e}
function applyEx(f){if(Math.abs(f-lastF)<.0004)return;lastF=f;let j=0;while(j<exS.length-1&&exS[j+1].f<=f)j++;const a=exS[j],b=exS[Math.min(j+1,exS.length-1)];
  const t=b===a?0:clamp((f-a.f)/(b.f-a.f),0,1),same=a.g===b.g,m=exMount((same||t<.5?a:b).g);
  const r=same?lerp(a.r,b.r,t):(t<.5?a.r:b.r);if(m.el.getAttribute('style')!==r)m.el.setAttribute('style',r);
  const A=same||t<.5?a:b;
  for(let k=0;k<m.all.length;k++){const el=m.all[k];const out=same?lerp(a.st[k],b.st[k],t):A.st[k];if(el.getAttribute('style')!==out)el.setAttribute('style',out);
    if(!el.children.length){const tx=same?(t<.5?a.tx[k]:b.tx[k]):A.tx[k];if(el.textContent!==tx)el.textContent=tx}}}
apply(0);applyEx(0);
/* fit the 571 x 600 scene to the space */
function fit(){const mob=innerWidth<900;const availH=mob?innerHeight*.56:innerHeight-64-40;const availW=mob?innerWidth-32:Math.min(740,innerWidth*.56);const k=Math.min(availH/600,availW/571,1.45);
  host.style.transform='scale('+k+')';vp.style.width=Math.round(571*k)+'px';vp.style.height=Math.round(600*k)+'px'}
fit();addEventListener('resize',()=>{fit();upd()});
/* captions + steps */
$('#st9').innerHTML=ST9.map((s,i)=>`<button aria-label="Step ${i+1}: ${esc(s.t)}" data-i="${i}">${i+1}</button>`).join('');
let step9=-1;
function setStep(s){if(s===step9)return;step9=s;const S=ST9[s];const c=$('#cap9');c.classList.remove('sw');void c.offsetWidth;c.classList.add('sw');
  $('#cps9').textContent=(s+1)+' / '+ST9.length;$('#cpt9').textContent=S.t;$('#cpb9').textContent=S.b;
  $$('#st9 button').forEach((b,i)=>{b.classList.toggle('on',i===s);b.classList.toggle('pas',i<s)});
  document.dispatchEvent(new CustomEvent('spt-mood',{detail:S.m}))}
function prog(){const r=sc9.getBoundingClientRect();const span=Math.max(1,sc9.offsetHeight-stk.offsetHeight);return clamp((64-r.top)/span,0,1)}
function upd(){const r=sc9.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50)return;const f=prog();apply(f*(N-1));applyEx(f);setStep(STB9.filter(x=>x<=f).length)}
addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});
function stepTo9(i){i=clamp(i,0,ST9.length-1);const r=sc9.getBoundingClientRect();const span=Math.max(1,sc9.offsetHeight-stk.offsetHeight);goY(r.top+scrollY-64+ST9[i].c*span)}
$('#st9').addEventListener('click',e=>{const b=e.target.closest('button');if(b)stepTo9(+b.dataset.i)});
setStep(0);
REG[IX('b9')]={n:ST9.length,get:()=>Math.max(step9,0),set:stepTo9};
})();
