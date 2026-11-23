/* Test task list: bottom-left panel for the live user test. Reads ?scenario=1|2 (or #scenario=2); the tabs switch it. */
(function(){
  const SC=[
    {n:'Scenario 1',t:'Sign-in for an existing app',tasks:['Open an item that blocks export.','Read the AI’s reasoning. If you disagree, reject it.','Reply to the AI and say why.','Read its new answer. Approve it when you are happy.']},
    {n:'Scenario 2',t:'Understand the review list',tasks:['Find the Review list on the spec map.','Look at To approve, then Review later. Tell me what you think each one means.','Find Decided by rule. Tell me what you think it means.','Open an item there. Tell me whether it looks right, and why.']}];
  let cur=0,open=true;const done=[new Set(),new Set()];
  try{const m=(location.search+'&'+location.hash.replace('#','')).match(/scenario=(\d)/);if(m&&SC[+m[1]-1])cur=+m[1]-1}catch(e){}
  const host=document.createElement('div');host.setAttribute('data-test-tasks','');
  host.style.cssText='position:fixed;left:16px;bottom:16px;z-index:2147483000;font-family:"IBM Plex Sans",system-ui,sans-serif';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML='<style>\
  *{box-sizing:border-box;margin:0;padding:0}\
  button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}\
  button:focus-visible{outline:2px solid #9AA6FF;outline-offset:2px}\
  .p{width:232px;max-width:calc(100vw - 32px);background:#141517;border:1px solid #4A4F56;border-radius:14px;color:#ECEDEF;box-shadow:0 10px 24px rgba(0,0,0,.5);overflow:hidden}\
  .h{display:flex;align-items:center;gap:6px;padding:10px 10px 10px 12px;border-bottom:1px solid #2B2E33}\
  .h b{flex:1;font-size:14px;font-weight:600;cursor:grab;touch-action:none;user-select:none}\
  .h b:active{cursor:grabbing}\
  .tabs{display:flex;gap:4px}\
  .tab{height:28px;min-width:28px;padding:0 9px;border-radius:8px;border:1px solid #2B2E33;font-size:12px;font-weight:500;color:#9096A0;text-align:center}\
  .tab[aria-pressed="true"]{background:#222659;border-color:#4457F0;color:#ECEDEF}\
  .x{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:#9096A0;font-size:16px;line-height:1}\
  .x:hover,.tab:hover{color:#ECEDEF;border-color:#6B717B}\
  .b{padding:10px 12px 12px;display:grid;gap:10px}\
  .sc{font-size:12px;color:#9096A0;line-height:1.4}.sc b{display:block;font-size:14px;color:#ECEDEF;font-weight:600;margin-top:2px}\
  ol{list-style:none;display:grid;gap:6px}\
  li button{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:start;width:100%;padding:8px;border:1px solid #2B2E33;background:#1B1D20;border-radius:10px;font-size:14px;line-height:1.35}\
  li button:hover{border-color:#6B717B}\
  .n{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#222659;color:#9AA6FF;font:600 12px "IBM Plex Mono",monospace}\
  li.d .n{background:#193422;color:#83ECAF}\
  li.d span.t{color:#9096A0;text-decoration:line-through}\
  .chip{display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;background:#141517;border:1px solid #4A4F56;border-radius:12px;font-size:14px;font-weight:500;color:#ECEDEF;box-shadow:0 10px 24px rgba(0,0,0,.5)}\
  .chip:hover{border-color:#9096A0}\
  .chip i{font-style:normal;font-size:12px;color:#9096A0;font-family:"IBM Plex Mono",monospace}\
  @media (prefers-reduced-motion:no-preference){.p,.chip{animation:in .3s cubic-bezier(.22,.8,.2,1)}@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}\
  </style><div id="m"></div>';
  const m=root.getElementById('m');
  function draw(){
    const S=SC[cur];
    if(!open){m.innerHTML='<button class="chip" id="o" aria-expanded="false">Tasks <i>'+done[cur].size+'/'+S.tasks.length+'</i></button>';root.getElementById('o').onclick=()=>{open=true;draw()};return}
    m.innerHTML='<section class="p" aria-label="Test tasks"><div class="h"><b>Tasks</b><div class="tabs" role="group" aria-label="Scenario">'+SC.map((c,i)=>'<button class="tab" data-i="'+i+'" aria-pressed="'+(i===cur)+'" aria-label="'+c.n+'">'+(i+1)+'</button>').join('')+'</div><button class="x" id="c" aria-label="Hide the task list">−</button></div><div class="b"><p class="sc">'+S.n+'<b>'+S.t+'</b></p><ol>'+S.tasks.map((t,i)=>'<li class="'+(done[cur].has(i)?'d':'')+'"><button data-k="'+i+'" role="checkbox" aria-checked="'+done[cur].has(i)+'"><span class="n">'+(done[cur].has(i)?'✓':i+1)+'</span><span class="t">'+t+'</span></button></li>').join('')+'</ol></div></section>';
    const hb=m.querySelector('.h b');if(hb)hb.onpointerdown=e=>{const r=host.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;hb.setPointerCapture(e.pointerId);
      hb.onpointermove=ev=>{const w=host.offsetWidth,h=host.offsetHeight;host.style.left=Math.max(0,Math.min(innerWidth-w,ev.clientX-dx))+'px';host.style.top=Math.max(0,Math.min(innerHeight-h,ev.clientY-dy))+'px';host.style.bottom='auto'};
      hb.onpointerup=()=>{hb.onpointermove=null}};
    m.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;draw()});
    m.querySelectorAll('li button').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;done[cur].has(k)?done[cur].delete(k):done[cur].add(k);draw()});
    root.getElementById('c').onclick=()=>{open=false;draw()};
  }
  draw();
  function mount(){document.body.appendChild(host)}
  if(document.body)mount();else addEventListener('DOMContentLoaded',mount);
})();
