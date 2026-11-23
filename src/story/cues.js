/* cues: wordless idle cues (ghost-cursor demos plug in via CUE.demo, scroll cue lives here) */
const CUE={done:new Set(),idleMs:4000,demoMs:2500,demo:{},cancel(){}};
(function(){
const root=document.documentElement;
if(matchMedia('(pointer:coarse)').matches)root.classList.add('cue-touch');
const sc=document.createElement('div');sc.id='cue-scroll';sc.setAttribute('aria-hidden','true');
sc.innerHTML='<span class="cm"><i></i></span><span class="cs"><i></i></span>';
const pt=document.createElement('div');pt.id='cue-ptr';pt.setAttribute('aria-hidden','true');
document.body.appendChild(sc);document.body.appendChild(pt);
let idle=0,demoT=0,running=null,lx=null,ly=null;
const curId=()=>beats[cur]?beats[cur].id:'';
function hideScroll(){sc.classList.remove('on')}
function arm(){clearTimeout(idle);idle=setTimeout(onIdle,CUE.idleMs)}
function end(){clearTimeout(demoT);const r=running;if(!r)return null;running=null;try{r.stop&&r.stop()}catch(e){}pt.className='';pt.innerHTML='';CUE.done.add(r.id);return r}
function finish(id){if(!running||running.id!==id)return;end();arm()}
function onIdle(){
  if(document.hidden){arm();return}
  const id=curId();
  if(CUE.demo[id]&&!CUE.done.has(id)){
    const r=running={id,stop:null};
    demoT=setTimeout(()=>finish(id),CUE.demoMs);
    try{r.stop=CUE.demo[id]({layer:pt,reduce,touch:root.classList.contains('cue-touch'),done:()=>finish(id)})||null}
    catch(e){finish(id)}
    return}
  if(id==='b12')return;                 /* last section: never */
  if(id==='b2'&&!tdone){idle=setTimeout(onIdle,500);return}   /* wait for the Pass it on chain */
  sc.classList.add('on')}
function cancel(){
  hideScroll();end();arm()}
CUE.cancel=cancel;window.CUE=CUE;
/* a click or key inside the active section means the visitor already acted: its demo must not play (body-level paging does not count) */
['pointerdown','keydown'].forEach(t=>window.addEventListener(t,e=>{const b=beats[cur];if(b&&e.target instanceof Node&&b.contains(e.target))CUE.done.add(b.id)},{capture:true,passive:true}));
['pointerdown','wheel','keydown','touchstart','scroll'].forEach(t=>window.addEventListener(t,cancel,{capture:true,passive:true}));
window.addEventListener('pointermove',e=>{
  const far=lx===null||Math.hypot(e.clientX-lx,e.clientY-ly)>8;
  if(far){lx=e.clientX;ly=e.clientY;cancel()}},{capture:true,passive:true});
const mo=new MutationObserver(ms=>{if(ms.some(m=>m.target.classList.contains('active')))cancel()});
beats.forEach(b=>mo.observe(b,{attributes:true,attributeFilter:['class']}));
/* ghost-cursor demos: DEMO maps beat id to the control the cursor glides to; it never clicks it */
const DEMO={
  b0:{target:()=>$('#b0 .btn')},
  b2:{target:()=>$('#tgo')},
  b5:{target:()=>$$('#b5 .qd').find(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})||null,hover:true},
  b11:{target:()=>$('#t11 [role=tab]:nth-child(2)')},
  b12:{target:()=>$('#scn .scn-item:first-child .scn')}
};
CUE.DEMO=DEMO;
function cueAim(el){   /* aim at the arrow chip of a .btn, otherwise the centre */
  const r=el.getBoundingClientRect();
  if(el.classList.contains('btn')&&r.height>0){const cs=r.height-10;return{x:r.right-3-cs/2,y:r.top+r.height/2}}
  return{x:r.left+r.width/2,y:r.top+r.height/2}}
Object.keys(DEMO).forEach(id=>{
  CUE.demo[id]=ctx=>{
    const D=DEMO[id];let el=null;
    try{el=D.target()}catch(e){}
    if(!el){setTimeout(ctx.done,0);return}
    const r0=el.getBoundingClientRect();
    if(!(r0.width>0&&r0.height>0&&r0.bottom>0&&r0.top<innerHeight&&r0.right>0&&r0.left<innerWidth)){setTimeout(ctx.done,0);return}
    const timers=[];let raf=0,fb=0,stopped=false;
    if(ctx.reduce){
      el.classList.add('cue-ring');
      timers.push(setTimeout(ctx.done,2400));
      return()=>{stopped=true;timers.forEach(clearTimeout);el.classList.remove('cue-ring')}}
    const L=ctx.layer,c=document.createElement('div');c.className='cue-c';
    c.innerHTML=ctx.touch?'<i class="cue-dot"></i>':'<svg class="cue-arw" width="20" height="20" viewBox="0 0 20 20"><path d="M3 2l12 6.2-5.2 1.6L7.6 15z" fill="#fff" stroke="#14161A" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    const rip=document.createElement('b');rip.className='cue-rip';c.appendChild(rip);
    L.appendChild(c);
    const sx=innerWidth-40,sy=innerHeight-60,GL=D.hover?1100:1400,CL=D.hover?1600:1400,FD=2200,t0=performance.now();
    let clicked=false;
    const place=(x,y)=>{c.style.transform='translate3d('+x+'px,'+y+'px,0)'};
    place(sx,sy);
    function frame(){
      if(stopped)return;const now=performance.now();
      const t=now-t0,a=cueAim(el);
      const k=clamp(t/GL,0,1),e=1-Math.pow(1-k,3);
      place(sx+(a.x-sx)*e,sy+(a.y-sy)*e);
      if(D.hover&&t>GL&&t<CL)c.classList.add('hov');else c.classList.remove('hov');
      if(!clicked&&t>=CL){clicked=true;c.classList.remove('hov');c.classList.add('tap');rip.classList.add('go')}
      c.style.opacity=t>FD?String(clamp(1-(t-FD)/200,0,1)):'1';
      tick()}
    /* rAF for smoothness, 50 ms timer as fallback (rAF is paused in some headless/background contexts) */
    function tick(){cancelAnimationFrame(raf);clearTimeout(fb);raf=requestAnimationFrame(frame);fb=setTimeout(frame,50)}
    tick();
    timers.push(setTimeout(ctx.done,2400));
    return()=>{stopped=true;cancelAnimationFrame(raf);clearTimeout(fb);timers.forEach(clearTimeout)}
  }});

arm();
})();
