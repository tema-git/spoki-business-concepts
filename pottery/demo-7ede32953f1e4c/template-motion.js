(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const scenes = [...document.querySelectorAll('[data-pointer-scene]')];
  const assembly = document.querySelector('.assembly-scene');
  const contact = document.querySelector('.header-contact');
  const header = document.querySelector('.header');
  const pending = new Map();
  let frame = 0, scrollDirty = true, contactDirty = false, pointerX = -1000, pointerY = -1000;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function queue() { if(!frame && !document.hidden) frame=requestAnimationFrame(paint); }
  function paint() {
    frame=0;
    if(document.hidden)return;
    const sceneBox=scrollDirty?assembly.getBoundingClientRect():null;
    const contactBox=contactDirty?contact.getBoundingClientRect():null;
    const measured=[];
    for(const [element,pointer] of pending) measured.push([element,pointer,element.getBoundingClientRect()]);
    if(sceneBox) {
      const progress=reduced.matches?1:clamp((innerHeight-sceneBox.top)/(innerHeight*.72+sceneBox.height*.12),0,1);
      assembly.style.setProperty('--scene-progress',progress.toFixed(4));
      scrollDirty=false;
    }
    if(contactBox) {
      let x=0,y=0;
      if(fine.matches&&!reduced.matches) {
        const dx=pointerX-(contactBox.left+contactBox.width/2),dy=pointerY-(contactBox.top+contactBox.height/2);
        const distance=Math.hypot(Math.max(0,Math.abs(dx)-contactBox.width/2),Math.max(0,Math.abs(dy)-contactBox.height/2));
        const strength=clamp(1-distance/65,0,1);
        x=clamp(dx*.055,-5,5)*strength;y=clamp(dy*.07,-4,4)*strength;
      }
      contact.style.setProperty('--contact-x',`${x.toFixed(2)}px`);contact.style.setProperty('--contact-y',`${y.toFixed(2)}px`);contactDirty=false;
    }
    for(const [element,pointer,rect] of measured) {
      const enabled=fine.matches&&!reduced.matches&&pointer;
      const x=enabled?clamp((pointer.x-rect.left)/rect.width*2-1,-1,1):0;
      const y=enabled?clamp((pointer.y-rect.top)/rect.height*2-1,-1,1):0;
      element.style.setProperty('--pointer-x',String(x));element.style.setProperty('--pointer-y',String(y));
    }
    pending.clear();
  }
  for(const scene of scenes) {
    scene.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||!fine.matches||reduced.matches)return;
      pending.set(scene,{x:event.clientX,y:event.clientY});queue();
    },{passive:true});
    scene.addEventListener('pointerleave',()=>{pending.set(scene,null);queue();});
  }
  addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||!fine.matches||reduced.matches)return;
    pointerX=event.clientX;pointerY=event.clientY;contactDirty=true;queue();
  },{passive:true});
  document.addEventListener('pointerleave',()=>{pointerX=pointerY=-1000;contactDirty=true;queue();});
  addEventListener('scroll',()=>{scrollDirty=true;contactDirty=true;queue();},{passive:true});
  addEventListener('resize',()=>{scrollDirty=contactDirty=true;queue();},{passive:true});
  function reset(){for(const scene of scenes)pending.set(scene,null);scrollDirty=contactDirty=true;pointerX=pointerY=-1000;queue();}
  reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else reset();});
  new ResizeObserver(()=>document.documentElement.style.setProperty('--measured-header-height',`${header.getBoundingClientRect().height}px`)).observe(header);
  queue();
})();
