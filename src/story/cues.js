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
['pointerdown','wheel','keydown','touchstart','scroll'].forEach(t=>window.addEventListener(t,cancel,{capture:true,passive:true}));
window.addEventListener('pointermove',e=>{
  const far=lx===null||Math.hypot(e.clientX-lx,e.clientY-ly)>8;
  if(far){lx=e.clientX;ly=e.clientY;cancel()}},{capture:true,passive:true});
const mo=new MutationObserver(ms=>{if(ms.some(m=>m.target.classList.contains('active')))cancel()});
beats.forEach(b=>mo.observe(b,{attributes:true,attributeFilter:['class']}));
arm();
})();
