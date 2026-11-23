
/* ================= LAYERS (evidence, stages, callbacks, room tools) ================= */
var mtnReady=false,evEl=null,evCfg=null,evAll=false,evOpener=null,lastBeat=-1;
const NSv='http://www.w3.org/2000/svg';
const pOf=id=>id.split('-')[0];
const nameOf=i=>TD.codes[i].n;
function pick(arr,n){const seen=new Set(),out=[];arr.forEach(x=>{const p=pOf(x[0]);if(!seen.has(p)&&out.length<n){seen.add(p);out.push(x)}});arr.forEach(x=>{if(out.length<n&&!out.includes(x))out.push(x)});return out}
function chip(i,label,q,k,p){return `<button class="chip2" data-ev="${i}"${k?` data-evk="${esc(k)}"`:''}${p?` data-evp="${p}"`:''}>${esc(label)}${q!=null?`<small>${q}</small>`:''}</button>`}
function topCodes(t){return TD.codes.map((c,i)=>[i,c]).filter(x=>x[1].i===t).sort((a,b)=>b[1].q-a[1].q).slice(0,3)}
function pulse(el){if(!el)return;el.classList.remove('pulse');void el.getBoundingClientRect();el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),2600)}

/* ---- counter-evidence, from my research notes ---- */
const CE={43:['Practice is split','P2 and P3 write detailed specs. P4, P5 and P6 explicitly do not, and P1 sort of does.'],
 24:['Automated checks are thin','P1 and P2 describe detailed checks. P4 to P6 mention one code each. Human review dominates.'],
 52:['Not everyone misses the why','P4 rates AI explanations as rarely lacking. P1 says they lack the why.'],
 23:['Review has not changed for everyone','P3 says review has not changed. P1 and P2 say it is longer and harder.'],
 51:['Questions can be too many','P6 wants the AI to ask before and during code, but too many questions are annoying.']};

/* ---- evidence drawer ---- */
function evShow(cfg){evCfg=cfg;evAll=false;renderEv()}
function evCode(i,o){evShow(Object.assign({i},o||{}))}
function closeEv(noFocus){if(evEl){evEl.remove();evEl=null}evCfg=null;if(!noFocus&&evOpener&&document.contains(evOpener)&&evOpener.focus)evOpener.focus();evOpener=null}
function renderEv(){
  const c=evCfg;if(!c)return;
  if(!evEl){evEl=document.createElement('aside');evEl.id='ev';evEl.setAttribute('aria-label','Evidence');evEl.addEventListener('click',evClick);document.body.appendChild(evEl)}
  const code=c.i!=null?TD.codes[c.i]:null;
  let base=code?(Q[c.i]||[]):[];if(c.p)base=base.filter(x=>x[0].startsWith('P'+c.p+'-'));
  const arr=evAll?base:pick(base,3);
  const kk=[c.k||'Evidence'];if(code)kk.push(c.p?`${base.length} quote${base.length===1?'':'s'} from P${c.p}`:`${code.q} quotes · ${code.p} of 6 participants`);
  const title=c.title||(code?code.n:'');
  const ce=code&&!c.p?CE[c.i]:null;
  evEl.innerHTML=`<div class="evh"><div><span class="k">${esc(kk.join(' · '))}</span><b>${esc(title)}</b>${c.title&&code?`<span class="lbl">Closest code: ${esc(code.n)}</span>`:''}</div><button class="btn" id="evx" aria-label="Close evidence">✕</button></div>`
   +(c.note?`<p class="cap" style="margin:0">${esc(c.note)}</p>`:'')
   +arr.map(x=>`<blockquote><span class="tag">${pOf(x[0])}</span>“${esc(x[1])}”</blockquote>`).join('')
   +(code&&base.length>arr.length?`<div><button class="chip2" data-evall="1">Show all ${base.length} quotes</button></div>`:'')
   +(evAll&&base.length>3?`<div><button class="chip2" data-evall="0">Show fewer</button></div>`:'')
   +(ce?`<div class="ce"><b>Pushes back: ${esc(ce[0])}</b><span>${esc(ce[1])}</span></div>`:'')
   +(c.chips?`<div class="chips">${c.chips.map(x=>chip(x[0],x[1],x[2],c.title)).join('')}</div>`:'')
   +((c.actions||[]).length?`<div class="evf">${c.actions.map((a,k)=>`<button class="btn" data-evact="${k}">${esc(a.label)}</button>`).join('')}</div>`:'')
   +(code?`<span class="lbl">Verbatim from my interview codebook. Six participants, so counts describe this sample (P1 was a pilot).</span>`:'');
}
function evClick(e){
  if(e.target.closest('#evx')){closeEv();return}
  const al=e.target.closest('[data-evall]');if(al){evAll=al.dataset.evall==='1';renderEv();return}
  const ac=e.target.closest('[data-evact]');if(ac&&evCfg){const a=evCfg.actions[+ac.dataset.evact];a&&a.fn()}
}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-ev]');if(!t)return;
  if(!t.closest('#ev'))evOpener=t;
  evShow({i:+t.dataset.ev,k:t.dataset.evk||'Evidence',p:t.dataset.evp?+t.dataset.evp:0})});
function ideaEv(t){const A=t==='A';const tc=topCodes(A?'c':'g');
  evShow({k:'Strong idea',title:A?'Context Compiler':'Assumption log and gating',
   note:(A?'Context and dependency gaps came up with 6 of 6 participants.':'Intent and traceability came up with 5 of 6 participants.')+' The codes below are the ones I matched to it, my judgement.',
   chips:tc.map(([i,c])=>[i,c.n,c.q]),
   actions:[{label:'See it on the thematic map',fn:()=>{closeEv(true);goId('b6');setTimeout(()=>{s6=A?1:2;setIdeas(A,!A)},850)}}]})}

/* ---- story mountain in the HUD ---- */
(function(){
  const Y=[24,20,15,10,5,3,12,20],X=i=>6+i*(120/(Y.length-1));
  const d='M'+Y.map((y,i)=>X(i)+' '+y).join('L');
  const h=document.createElement('span');h.style.cssText='display:flex;align-items:center;gap:8px';
  h.innerHTML=`<svg id="mtn" viewBox="0 0 132 30" role="img" aria-label="Story arc"><path d="${d}"/><circle r="3.4" cx="${X(0)}" cy="${Y[0]}"/></svg><span id="act"></span>`;
  $('#cnt').parentNode.insertBefore(h,$('#cnt'));
  const ACT=['Start','Setup','Setup','Rising','Rising','Turning point','Resolution','Proof'];
  window.__mtn={Y,X,ACT};
  mtnReady=true;
})();
function mtnUpd(i){
  if(!mtnReady)return;
  const m=window.__mtn,c=$('#mtn circle');if(c){c.setAttribute('cx',m.X(i));c.setAttribute('cy',m.Y[i])}
  const a=$('#act');if(a)a.textContent=m.ACT[i];
  if(lastBeat!==i){lastBeat=i;closeEv(true);if(typeof renderPr==='function'&&$('#pr'))renderPr()}
}
mtnUpd(cur);

/* ================= beat 1: a real quote behind the assumed tags ================= */
(function(){const q=(Q[9]||[]).find(x=>x[0]==='P6-39')||(Q[9]||[])[0];if(!q)return;
  const qc=$('#qchip1');if(qc)qc.innerHTML=`<button class="chip2" data-ev="9" data-evk="Behind the “assumed” tags">“${esc(cut(q[1],80))}” · ${pOf(q[0])}</button>`})();

/* ================= beat 2: real-life callback ================= */
$('#tseenc').innerHTML=[48,46,47,59].map(i=>chip(i,cut(nameOf(i),44),TD.codes[i].q,'Seen in the interviews')).join('');
new MutationObserver(()=>{$('#tseen').hidden=$('#tout').hidden}).observe($('#tout'),{attributes:true,attributeFilter:['hidden']});

/* ================= beat 3: what each participant said most ================= */
function partTop(p){const n=TD.codes.map((c,i)=>[i,(Q[i]||[]).filter(x=>x[0].startsWith('P'+p+'-')).length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);return {top:n.slice(0,3),tot:n.reduce((a,x)=>a+x[1],0),codes:n.length}}
$$('#lad .pp button').forEach(b=>b.addEventListener('click',()=>{const p=+b.dataset.p;const t=partTop(p);
  who.insertAdjacentHTML('beforeend',`<span class="cap" style="display:block;margin-top:6px">${t.tot} quotes across ${t.codes} codes. Most-said:</span><div class="chips">${t.top.map(x=>chip(x[0],cut(nameOf(x[0]),40),x[1],'P'+p+' · most-said',p)).join('')}</div>`)}));

/* ================= beat 4: evidence in the maps ================= */
const PAINT=['Context across repos won’t fit in one prompt','At gaps, the agent just assumes','Review drops to skimming as volume rises','Hard to trace where it went wrong','Repetitive, tiring rework'];
const PHN=['Direction','Generation','Output','Realization','Revision'];
const PAINC=[46,9,23,52,33],PCL=[0,0,3,3,3];
(function(){const svg=$('#m-jo svg');let h='';PHN.forEach((p,i)=>{const x=100+i*128;h+=`<g class="pn" data-ph="${i}" tabindex="0" role="button" aria-label="Pain in ${p}: ${esc(PAINT[i])}. Read the quotes."><rect class="pnr" x="${x}" y="148" width="124" height="72" rx="3"/></g>`});svg.insertAdjacentHTML('beforeend',h)})();
function goMap(i,sel){T4.sel(i);closeEv(true);setTimeout(()=>pulse($(sel)),200)}
function openMapNode(n){
  const mp=n.closest('.mp');const k=mp?({'m-st':'Stakeholder map','m-ec':'Ecosystem map','m-mi':'Mind map','m-jo':'Journey map'})[mp.id]:'Map';
  evOpener=n;
  if(n.classList.contains('pn')){const ph=+n.dataset.ph;
    evCode(PAINC[ph],{k:'Pain · '+PHN[ph],title:PAINT[ph],note:'Closest code, matched by me.',actions:[{label:'See it in the mind map',fn:()=>goMap(3,`#m-mi .node[data-cl="${PCL[ph]}"]`)}]});return}
  if(n.dataset.idea){ideaEv(n.dataset.idea);return}
  const txt=n.textContent.replace(/\s+/g,' ').trim();const acts=[];
  if(n.dataset.jp!=null)acts.push({label:'See where it hits the journey',fn:()=>goMap(2,`#m-jo .pn[data-ph="${n.dataset.jp}"]`)});
  evCode(+n.dataset.code,{k,title:txt,note:'Closest interview evidence, matched by me.',actions:acts})}
$('#mw4').addEventListener('click',e=>{const n=e.target.closest('.pn,[data-code],[data-idea]');if(n)openMapNode(n)});
$('#mw4').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.pn,[data-code],[data-idea]')){e.preventDefault();e.stopPropagation();openMapNode(e.target)}},true);
$('#jtog').onclick=()=>{const on=$('#jtog').getAttribute('aria-pressed')!=='true';$('#jtog').setAttribute('aria-pressed',on);$('#m-jo svg').classList.toggle('jI',on);
  $('#jcap').textContent=on?'My hypothesis, not measured: with both ideas the first two pains shrink (struck through) and the curve stays higher. Dashed line is today.':'Today’s curve. Tap a pain to read the quotes behind it.'};

/* ================= beat 5: 252 → 62 → 15 → 4, plus a filter by person ================= */
const svg5=$('#tm5');
const QL=[];Q.forEach((arr,ci)=>arr.forEach(x=>QL.push({id:x[0],t:x[1],c:ci})));
const ctr=TD.codes.map((c,i)=>{const d=$('.dt[data-i="'+i+'"]',svg5);if(!d)return [0,0];if(d.tagName==='circle')return [+d.getAttribute('cx'),+d.getAttribute('cy')];const pts=d.getAttribute('points').split(' ').map(s=>s.split(',').map(Number));return [pts.reduce((a,p)=>a+p[0],0)/pts.length,pts.reduce((a,p)=>a+p[1],0)/pts.length]});
(function(){let seed=11;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const N=QL.length,order=QL.map((_,k)=>k);for(let k=N-1;k>0;k--){const m=Math.floor(rnd()*(k+1));[order[k],order[m]]=[order[m],order[k]]}
  let h='<g class="qdg">';for(let s=0;s<N;s++){const qi=order[s];const r=150*Math.sqrt((s+.5)/N),a=s*2.39996;const x=r*Math.cos(a),y=r*Math.sin(a);const c=ctr[QL[qi].c];
    h+=`<circle class="qd" data-q="${qi}" cx="${f1(x)}" cy="${f1(y)}" r="3" style="--dx:${f1(c[0]-x)}px;--dy:${f1(c[1]-y)}px"/>`}
  svg5.insertAdjacentHTML('beforeend',h+'</g>')})();
let stTimer=[],fp=0;
function setStage(s,manual){if(manual)stTimer.forEach(clearTimeout);stage5=s;svg5.dataset.s=s;$$('#stg5 [data-s]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.s===s));$$('.qd.on',svg5).forEach(q=>q.classList.remove('on'));tm5.reset();if(fp)filterInfo()}
function playStages(){stTimer.forEach(clearTimeout);if(reduce){setStage(3);return}setStage(0);stTimer=[setTimeout(()=>setStage(1),1700),setTimeout(()=>setStage(2),3500),setTimeout(()=>setStage(3),5300)]}
$$('#stg5 [data-s]').forEach(b=>b.onclick=()=>setStage(+b.dataset.s,true));
$('#rp5').onclick=playStages;
svg5.dataset.s=3;
svg5.addEventListener('click',e=>{const q=e.target.closest('.qd');if(!q||svg5.dataset.s!=='0')return;const o=QL[+q.dataset.q];$$('.qd.on',svg5).forEach(x=>x.classList.remove('on'));q.classList.add('on');
  info5.innerHTML=`<div class="k">Quote · ${o.id}</div><div class="quote" style="font-size:14px;color:var(--ink)"><span class="tag">${pOf(o.id)}</span>“${esc(cut(o.t,220))}”</div><p>Coded as</p><div class="chips">${chip(o.c,cut(nameOf(o.c),46),TD.codes[o.c].q,'Quote '+o.id)}</div>`});
function applyFilter(){$$('.dt',svg5).forEach(d=>{const c=TD.codes[+d.dataset.i];d.classList.toggle('pdim',!!fp&&!c.pp.includes('P'+fp))});$$('.qd',svg5).forEach(d=>d.classList.toggle('pdim',!!fp&&!QL[+d.dataset.q].id.startsWith('P'+fp+'-')))}
function filterInfo(){const t=partTop(fp);info5.innerHTML=`<div class="k">Only P${fp}</div><h3>${t.tot} quotes · ${t.codes} codes</h3><p>Everything else is dimmed. What P${fp} said most:</p><div class="chips">${t.top.map(x=>chip(x[0],cut(nameOf(x[0]),40),x[1],'P'+fp+' · most-said',fp)).join('')}</div>`}
function setFilter(p){fp=p;$$('#pf5 [data-p]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.p===p));applyFilter();tm5.reset();if(p)filterInfo()}
$$('#pf5 [data-p]').forEach(b=>b.onclick=()=>setFilter(fp===+b.dataset.p?0:+b.dataset.p));
ENTER[IX('b5')]=()=>{setFilter(0);playStages()};
REG[IX('b5')]={n:4,get:()=>stage5,set:i=>setStage(i,true)};

/* ================= beat 6: the strongest codes behind each idea ================= */
[['iA','c','Supports the Context Compiler'],['iB','g','Supports assumption gating']].forEach(([id,t,k])=>{const b=$('#'+id);const w=document.createElement('div');w.className='ideawrap';b.parentNode.insertBefore(w,b);w.appendChild(b);
  const c=document.createElement('div');c.className='chips';c.innerHTML=topCodes(t).map(([i,cd])=>chip(i,cut(cd.n,38),cd.q,k)).join('');w.appendChild(c)});

/* ================= beat 7: tap a step ================= */
const LCD={'Context Compiler':{min:1,t:'Gathers repo patterns, tech stack and dependencies. Flags gaps with a suggested line each.',c:[12,42,46],it:1},
 'Approve Lines':{min:2,t:'Engineer approves the compiler’s lines. Blocking ones must be approved.',c:[41,39],it:1},
 'Design':{min:0,t:{0:'The agent drafts the design from the requirements. Where the spec has gaps, it fills them.',2:'Agent drafts the design with that context and records each assumption with a reason.'},c:[9,51]},
 'Review Panel':{min:2,t:'One review: context used + assumptions made.',c:[23,24]},
 'Tasks':{min:2,t:'Each task carries its context package and its approved assumptions.',c:[43,44]},
 'Update Spec':{min:2,t:'Approved assumptions are saved to the spec and audit log.',c:[59,48]}};
const lcName=n=>n.firstChild.textContent.trim();
function lcRefresh(){$$('#lc .lcb').forEach(n=>{const d=LCD[lcName(n)];const ok=d&&st7>=d.min;const vis=!n.closest('.ins')||n.closest('.ins').classList.contains('show');
  if(ok&&vis){n.dataset.n='1';n.tabIndex=0;n.setAttribute('role','button')}else{delete n.dataset.n;n.removeAttribute('role');n.removeAttribute('tabindex');if(n.classList.contains('sel'))n.classList.remove('sel')}});
  const sel=$('#lc .lcb.sel');if(!sel)$('#d7').hidden=true}
function lcOpen(n){const nm=lcName(n);const d=LCD[nm];if(!d)return;$$('#lc .lcb.sel').forEach(x=>x.classList.remove('sel'));n.classList.add('sel');
  const t=typeof d.t==='string'?d.t:(st7>=2?d.t[2]:d.t[0]);
  $('#d7').innerHTML=`<div class="k">Step</div><h3>${esc(nm)}</h3><p style="font-size:14px;color:var(--ink)">${esc(t)}</p>${d.it&&st7>=1?'<p>Iteration: in the final flow the gate moved to right after the compiler, before design.</p>':''}<p class="cap" style="margin:0">Closest interview evidence, matched by me:</p><div class="chips">${d.c.map(i=>chip(i,cut(nameOf(i),44),TD.codes[i].q,'Step · '+nm)).join('')}</div>`;$('#d7').hidden=false}
$('#lc').addEventListener('click',e=>{const n=e.target.closest('.lcb[data-n]');if(n)lcOpen(n)});
$('#lc').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.lcb[data-n]')){e.preventDefault();lcOpen(e.target)}});
new MutationObserver(lcRefresh).observe($('#lc'),{attributes:true,subtree:true,attributeFilter:['class']});
lcRefresh();

/* ================= beat 8: trace a problem to a screen ================= */
const HMW='How might we automatically detect and surface architectural and query missing context gaps before code is generated to prevent unauthorized agent inferences?';
const STORY='As a Senior Software Engineer, I want the system to detect and surface missing context gaps before code generation, so that I can prevent unauthorized agent inferences.';
const TRC=[{f:'Context Compiler, then Approve lines',s:2,sn:'Spec map and review list: the shared-table change in api-core is one of the three blockers.'},
 {f:'Approve lines',s:3,sn:'The gap card: why the line matters and where it was found, so context is not buried in a chat.'},
 {f:'Context Compiler',s:2,sn:'Spec map: gaps appear where they are, each with a suggested line, so no exhaustive prompt.'}];
st8.addEventListener('click',e=>{const b=e.target.closest('[data-tr]');if(!b)return;const i=+b.dataset.tr;$$('[data-tr]',st8).forEach(x=>x.setAttribute('aria-pressed',x===b));const t=TRC[i];
  $('#trc').innerHTML=`<div class="row2" style="--d:0"><b>Trace</b><span class="cap" style="margin:0">My reading of how each step connects.</span></div>`
   +[['Problem',PS[i]],['HMW',cut(HMW,120)],['Story',cut(STORY,120)],['Flow',t.f],['Screen',t.sn]].map((r,k)=>`<div class="row2" style="--d:${k+1}"><b>${r[0]}</b><span>${esc(r[1])}</span></div>`).join('')
   +`<div class="row2" style="--d:6"><b></b><span><button class="btn" data-open="${t.s}">Open this screen →</button></span></div>`});
st8.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;goId('b9');setTimeout(()=>stepTo9(+b.dataset.open),700)});

/* ================= beat 10: the type scale, before and after ================= */
(function(){const before=[10,11,12,13],after=[12,14,20,36];const T='Approve 3 items first';
  $('#tsx').innerHTML=before.map(s=>`<div class="tl"><i>${s}px</i><span style="font-size:${s}px">${T}</span></div>`).join('');
  $('#tsb').onclick=()=>{const on=$('#tsb').getAttribute('aria-pressed')!=='true';$('#tsb').setAttribute('aria-pressed',on);$('#tsb').textContent=on?'Show what was flagged':'Show the new scale';
    $$('#tsx .tl').forEach((l,k)=>{const s=(on?after:before)[k];$('span',l).style.fontSize=s+'px';$('i',l).textContent=s+'px'})};
  $('#tsb').textContent='Show the new scale'})();

/* ================= presenter, feedback, glossary ================= */
const TARGET=270,SLOT=480;
const NOTES=[['Open with one sentence: SDD needs a single source of truth, and nobody has defined one.','About 4 to 5 minutes of talk, then the prototype test.'],
 ['Scroll through the spectrum: Traditional, Vibe coding, Spec-driven. The audience already knows them.','Land on “We are here”, then the question under it: what counts as a spec?'],
 ['Invite someone to type a sentence and press Pass it on.','Point at the changed words and the “words kept” score falling. It is an illustration, not a model.'],
 ['Scroll: the line “Is this a problem you face yourself?” shows alone. Scroll again: “You are not alone.” Pause. Scroll once more: “I interviewed six engineers…”. Scroll again: a real quote from P5.'],
 ['Scroll: 252 quotes, 62 codes, 15 themes, 4 meta-themes. The side text changes on its own.','Then the problem: when a spec has gaps, the AI fills them with guesses nobody approved. Then the evidence points at two ideas. Tap an idea for the codes behind it.'],
 ['What if you could see your spec’s anatomy? The spec, its parts, its gaps.','It is an illustration; the real interface is next.'],
 ['Scroll through the 10 steps, from pasting the spec to export.','Right arrow also steps through them.'],
 ['Choose Scenario 1 or 2. Hand over the devices. Start the 4:00 timer.','Pair 1 on Device A, pair 2 on Device B. Stay quiet and watch.']];
const QA=[['Why only senior engineers?','Senior and lead engineers run spec development. Principals hand it down and juniors do not call the shots, so the design is for them.'],
 ['Six interviews is a small sample.','Agreed: the counts describe this sample. P1 was a pilot with slightly different questions. 252 quotes became 62 codes, 15 themes and 4 meta-themes. [add your answer: what you would do next]'],
 ['Is the emotion curve measured?','No. The “with my ideas” curve is a hypothesis, labelled as one.'],
 ['Why did the gate move?','The final flow puts the gate right after the compiler, before design.'],
 ['How do you know it works?','Test 1: two participants on the spec map. Test 2: three people, a professor as stakeholder with three tasks, then two classmates. [add your answer: findings from the testing report]'],
 ['What if engineers ignore the gate?','Blocking items must be approved before export; optional ones can wait. [add your answer]'],
 ['How is this different from what Copilot or Claude Code already do?','[add your answer]'],
 ['Are the compiler’s suggested lines right?','This is low fidelity: file names and reasons are placeholders. [add your answer: how you would check them]'],
 ['What would it cost or slow down?','[add your answer]']];
let prT=0,prRun=false,prIv=null,pr=null,fb=null;
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function openPanel(which){closePanels();const el=document.createElement('aside');el.id=which;el.setAttribute('role','dialog');el.setAttribute('aria-label',which==='pr'?'Presenter':'Feedback');document.body.appendChild(el);return el}
function closePanels(){['pr','fb'].forEach(id=>{const e=$('#'+id);if(e)e.remove()});pr=fb=null;const a=$('#prb');a&&a.setAttribute('aria-expanded','false')}
function togglePr(){if($('#pr')){closePanels();return}pr=openPanel('pr');
  pr.innerHTML=`<div class="prh"><div class="tm2"><b id="prt">${fmt(prT)}</b><span id="prs"></span></div><div class="evf"><button class="btn" id="prp">${prRun?'Pause':'Start'}</button><button class="btn" id="prr">Reset</button><button class="btn" id="prx" aria-label="Close presenter">✕</button></div></div><div class="pbarx"><i id="prfill"></i><u style="left:${TARGET/SLOT*100}%"></u></div><div id="prbody"></div>`;
  $('#prx').onclick=closePanels;$('#prp').onclick=()=>{prRun=!prRun;$('#prp').textContent=prRun?'Pause':'Start';prTick()};$('#prr').onclick=()=>{prT=0;prRun=false;$('#prp').textContent='Start';prTick()};
  $('#prb').setAttribute('aria-expanded','true');renderPr();prTick();$('#prx').focus()}
function prTick(){const t=$('#prt');if(!t)return;t.textContent=fmt(prT);$('#prs').textContent=prT>TARGET?'over the 4:30 talk target':'talk target 4:30 · slot about 8:00 with testing';$('#prfill').style.transform=`scaleX(${Math.min(prT/SLOT,1)})`}
clearInterval(prIv);prIv=setInterval(()=>{if(prRun){prT++;prTick()}},1000);
function renderPr(){const b=$('#prbody');if(!b)return;const i=cur;const nx=TT[i+1];
  b.innerHTML=`<div><span class="cap" style="margin:0">Now · beat ${i||'Start'} · ${esc(TT[i][0])}${TT[i][1]?' · '+TT[i][1]:''}</span><ul>${NOTES[i].map(n=>`<li>${esc(n)}</li>`).join('')}</ul>${nx?`<p class="cap" style="margin:8px 0 0">Next: ${esc(nx[0])}</p>`:''}</div><p class="cap" style="margin:0">Draft prompts built from the page. Edit to your own voice.</p><div><b style="font:600 14px var(--sans)">Likely questions</b><div style="margin-top:8px">${QA.map(q=>`<details><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join('')}</div></div>`}
$('#prb').onclick=togglePr;

/* feedback */
let DB=null,fbLocal=[],fbKind='Question',fbUnsub=null,fbAll=[];
(async()=>{try{if(typeof claude==='undefined'||!claude.use)return;DB=await claude.use('db');if(!DB)return;
  fbUnsub=DB.collection('feedback').orderBy('at','desc').limit(200).onSnapshot(s=>{fbAll=s.docs.map(d=>d.data());if($('#fbl'))renderFbList()},()=>{})}catch(e){DB=null}})();
function renderFbList(){const el=$('#fbl');if(!el)return;const own=fbLocal.slice().reverse();const all=fbAll.length?fbAll:own;
  el.innerHTML=(all.length?`<span class="lbl">${fbAll.length?'All notes ('+all.length+')':'Your notes (this visit)'}</span>`:'')+all.slice(0,30).map(n=>`<div class="fbr"><small>${esc(n.beat||'General')} · ${esc(n.kind||'')}</small>${esc(n.text||'')}</div>`).join('')}
function toggleFb(beat){if($('#fb')){closePanels();return}fb=openPanel('fb');const bi=beat!=null?beat:cur;
  fb.innerHTML=`<div class="prh"><h3>Leave a note</h3><button class="btn" id="fbx" aria-label="Close feedback">✕</button></div><label class="cap" for="fbs" style="margin:0">About</label><select id="fbs"><option value="0">General</option>${TT.slice(1).map((t,i)=>`<option value="${i+1}">${i+1} · ${esc(t[0])}</option>`).join('')}</select><div class="chipsrow" id="fbk" role="group" aria-label="Kind of note">${['Question','Idea','Concern'].map(k=>`<button aria-pressed="${k===fbKind}" data-k="${k}">${k}</button>`).join('')}</div><label class="cap" for="fbt" style="margin:0">Your note</label><textarea id="fbt" maxlength="600" placeholder="What stood out, or what would you ask?"></textarea><div class="evf"><button class="btn sol" id="fbsend">Send</button><button class="btn" id="fbcopy">Copy</button></div><p class="cap" id="fbst" style="margin:0" aria-live="polite"></p><div id="fbl"></div>`;
  $('#fbs').value=String(bi>0?bi:0);$('#fbx').onclick=closePanels;
  $$('#fbk [data-k]').forEach(b=>b.onclick=()=>{fbKind=b.dataset.k;$$('#fbk [data-k]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('#fbcopy').onclick=async()=>{const t=$('#fbt').value.trim();if(!t)return;try{await navigator.clipboard.writeText(`[${$('#fbs').selectedOptions[0].textContent} · ${fbKind}] ${t}`);$('#fbst').textContent='Copied.'}catch(e){$('#fbst').textContent='Could not copy here. Select the text and copy it.'}};
  $('#fbsend').onclick=async()=>{const t=$('#fbt').value.trim();if(!t){$('#fbst').textContent='Write a note first.';return}
    const n={beat:$('#fbs').selectedOptions[0].textContent,kind:fbKind,text:t,at:Date.now()};fbLocal.push(n);
    if(!DB){$('#fbst').textContent='Noted on this screen only. Saving needs sharing with contribute access, so use Copy to send it.';renderFbList();return}
    try{await DB.collection('feedback').add(n);$('#fbst').textContent='Saved. Thank you.';$('#fbt').value=''}catch(e){$('#fbst').textContent='Could not save it. Use Copy to send it instead.'}renderFbList()};
  renderFbList();$('#fbt').focus()}
$('#fbb').onclick=()=>toggleFb();$('#fbb2').onclick=()=>toggleFb(10);
document.addEventListener('keydown',e=>{const t=e.target,tag=t&&t.tagName;if(e.key==='Escape'){if($('#pr')||$('#fb'))closePanels();else if(evEl)closeEv();return}
  if(e.metaKey||e.ctrlKey||e.altKey||tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;if(e.key==='p'||e.key==='P')togglePr()});

/* glossary */
const GLOS=[['spec-driven development','Spec-driven development: the spec, not a chat, is what the AI builds from.'],['SDD','Spec-driven development: the spec, not a chat, is what the AI builds from.'],['vibe coding','Prompting an AI in a running chat and steering by feel, with no written spec.'],['thematic analysis','Coding interview quotes, grouping the codes into themes, then into broader meta-themes.'],['meta-themes?','A broad group made of several related themes.'],['journey map','A map of one person’s steps, pains and emotions through a task.'],['HMW','How might we: a design question that turns a problem into a prompt for ideas.'],['single source of truth','One place the whole team treats as the real answer.']];
(function(){const tip=document.createElement('div');tip.id='tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
  beats.forEach(b=>{const used=new Set();const w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('button,svg,input,textarea,script,style,.gl,.tabs,.kick,[role=tab]')||!n.nodeValue.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(n=>{for(const [term,def] of GLOS){const key=def;if(used.has(key))continue;const m=new RegExp('\\b('+term+')\\b','i').exec(n.nodeValue);if(!m)continue;used.add(key);
      const before=n.nodeValue.slice(0,m.index),after=n.nodeValue.slice(m.index+m[0].length);const s=document.createElement('span');s.className='gl';s.tabIndex=0;s.dataset.g=def;s.setAttribute('aria-describedby','tip');s.textContent=m[0];
      const f=document.createDocumentFragment();f.append(document.createTextNode(before),s,document.createTextNode(after));n.replaceWith(f);break}})});
  const show=el=>{tip.textContent=el.dataset.g;tip.style.opacity=1;const r=el.getBoundingClientRect();const w=Math.min(260,innerWidth-16);tip.style.left=clamp(r.left,8,innerWidth-w-8)+'px';const h=tip.offsetHeight;tip.style.top=(r.bottom+h+12<innerHeight?r.bottom+8:r.top-h-8)+'px'};
  const hide=()=>{tip.style.opacity=0};
  document.addEventListener('pointerover',e=>{const g=e.target.closest&&e.target.closest('.gl');if(g&&e.pointerType==='mouse')show(g)});
  document.addEventListener('pointerout',e=>{if(e.target.closest&&e.target.closest('.gl'))hide()});
  document.addEventListener('focusin',e=>{const g=e.target.closest&&e.target.closest('.gl');if(g)show(g);else hide()});
  document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('.gl');if(g){tip.style.opacity==='1'&&tip.textContent===g.dataset.g&&e.pointerType!=='mouse'?hide():show(g)}else hide()});
  addEventListener('scroll',hide,{passive:true})})();
