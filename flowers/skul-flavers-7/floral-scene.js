(() => {
  'use strict';
  const root = document.querySelector('[data-coded-scene="flowers-hero"]');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const canvas = root.querySelector('.floral-canvas');
  const palettes = {
    soft: ['#ffe8e4','#efbdc4','#d68eaa','#9f4b75','#904663','#e39aa5','#a95878','#63324d','Нежный розовый букет.'],
    warm: ['#fff1d6','#f4c9a5','#e69d78','#b15a4e','#985950','#efb59a','#c57865','#7a4245','Тёплый персиковый букет.'],
    wine: ['#f6d9e4','#d9a2bc','#b46b94','#7e365f','#713650','#d49cb3','#914d72','#4b294b','Букет в глубоких винных оттенках.']
  };
  const properties = ['petal-light','petal-mid','petal-base','petal-deep','petal-edge','wine-light','wine-mid','wine-deep'];
  root.querySelectorAll('[data-floral-palette]').forEach(button => {
    button.addEventListener('click', () => {
      const palette = palettes[button.dataset.floralPalette];
      properties.forEach((property, i) => root.style.setProperty(`--${property}`,palette[i]));
      root.querySelectorAll('[data-floral-palette]').forEach(choice => choice.setAttribute('aria-pressed',String(choice === button)));
      root.querySelector('[data-floral-status]').textContent = palette[8];
      if (!reduced.matches && window.gsap) {
        gsap.fromTo(root.querySelectorAll('.floral-head'),{scale:.94},{scale:1,duration:.65,stagger:.045,ease:'power2.out',overwrite:true});
      }
    });
  });
  // A single eased frame loop exists only while a visible scene is settling.
  let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0, visible = true;
  function draw() {
    frame = 0;
    if (reduced.matches || !fine.matches || !visible || document.hidden) return;
    x += (targetX-x)*.1; y += (targetY-y)*.1;
    root.style.setProperty('--floral-x',`${x*25}px`);
    root.style.setProperty('--floral-y',`${y*19}px`);
    root.style.setProperty('--floral-sway-x',`${x*9}px`);
    root.style.setProperty('--floral-sway-y',`${y*6}px`);
    root.style.setProperty('--floral-turn',`${x*2.6}deg`);
    if (Math.abs(targetX-x)+Math.abs(targetY-y)>.002) frame=requestAnimationFrame(draw);
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(draw); }
  function reset() { targetX=targetY=0; schedule(); }
  canvas.addEventListener('pointermove',event=>{
    if (!fine.matches || reduced.matches || event.pointerType==='touch') return;
    const bounds=canvas.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,2*(event.clientX-bounds.left)/bounds.width-1));
    targetY=Math.max(-1,Math.min(1,2*(event.clientY-bounds.top)/bounds.height-1));
    schedule();
  },{passive:true});
  canvas.addEventListener('pointerleave',reset);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if (!visible) {cancelAnimationFrame(frame);frame=0;targetX=targetY=x=y=0;}
  }).observe(root);
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;x=y=targetX=targetY=0;['--floral-x','--floral-y','--floral-sway-x','--floral-sway-y','--floral-turn'].forEach(p=>root.style.removeProperty(p));});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});

  // Petals arrive from the edges as the scene enters, before its centre is reached.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const motion=gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)',()=>{
      const flowers=root.querySelectorAll('.floral-assembly');
      const entrance=gsap.timeline({scrollTrigger:{trigger:root,start:'top 98%',end:'top 22%',scrub:.8,invalidateOnRefresh:true}});
      entrance.fromTo(flowers,{x:(_,el)=>Number(el.dataset.flyX),y:(_,el)=>Number(el.dataset.flyY),rotation:(_,el)=>Number(el.dataset.turn),scale:.82},{x:0,y:0,rotation:0,scale:1,ease:'power1.out',duration:1,stagger:.035});
      // The desktop first screen is already in view: keep a short natural opening.
      if(root.getBoundingClientRect().top<innerHeight*.4) gsap.fromTo(root.querySelectorAll('.floral-head'),{scale:.88},{scale:1,duration:1.15,stagger:.06,ease:'power2.out'});
      const stock=document.querySelector('#availability');
      if(stock){
        gsap.fromTo(stock.querySelectorAll('.floral-product-image'),{y:55},{y:0,stagger:.08,ease:'none',scrollTrigger:{trigger:stock,start:'top 95%',end:'top 30%',scrub:.7}});
        gsap.fromTo(stock.querySelector('.floral-stock-sprig'),{rotation:-24,x:-18},{rotation:0,x:0,ease:'none',scrollTrigger:{trigger:stock.querySelector('.floral-stock-note'),start:'top 98%',end:'top 65%',scrub:.6}});
      }
    });
  }

  document.querySelectorAll('.floral-product').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      if(!fine.matches || reduced.matches) return;
      const bounds=card.getBoundingClientRect(), px=(event.clientX-bounds.left)/bounds.width, py=(event.clientY-bounds.top)/bounds.height;
      card.style.setProperty('--catalog-x',`${px*100}%`);card.style.setProperty('--catalog-y',`${py*100}%`);
      card.style.setProperty('--catalog-tx',`${(px-.5)*6}px`);card.style.setProperty('--catalog-ty',`${(py-.5)*6}px`);
    },{passive:true});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--catalog-tx','0px');card.style.setProperty('--catalog-ty','0px');});
  });
  document.querySelectorAll('[data-floral-enquiry]').forEach(link=>link.addEventListener('click',()=>{
    const topic=document.querySelector('#callback-topic');
    if(topic){topic.value='bouquet';topic.dispatchEvent(new Event('change',{bubbles:true}));}
  }));

  // Canonical sites have no shared batch.js; copied sites keep its existing controls.
  const contact=document.querySelector('.header-contact');
  if(contact && !document.querySelector('script[src*="batch.js"]') && !contact.firstElementChild){
    const surface=document.createElement('span');surface.className='floral-contact-surface';surface.textContent=contact.textContent;contact.replaceChildren(surface);
    document.addEventListener('pointermove',event=>{
      if(!fine.matches || reduced.matches) return;
      const r=contact.getBoundingClientRect(),dx=event.clientX-(r.left+r.width/2),dy=event.clientY-(r.top+r.height/2);
      const near=Math.abs(dx)<r.width/2+40&&Math.abs(dy)<r.height/2+35;
      surface.style.setProperty('--contact-x',near?`${Math.max(-4,Math.min(4,dx*.055))}px`:'0px');
      surface.style.setProperty('--contact-y',near?`${Math.max(-3,Math.min(3,dy*.055))}px`:'0px');
    },{passive:true});
  }
  const select=document.querySelector('#callback-topic');
  if(select && !document.querySelector('script[src*="batch.js"]') && !select.closest('.floral-topic')){
    const holder=document.createElement('div');holder.className='floral-topic';select.before(holder);holder.append(select);
    select.tabIndex=-1;select.setAttribute('aria-hidden','true');
    const trigger=document.createElement('button');trigger.type='button';trigger.className='floral-select-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','О чём хотите поговорить');trigger.setAttribute('aria-controls','floral-topic-options');trigger.setAttribute('aria-describedby','callback-topic-error');
    const menu=document.createElement('div');menu.id='floral-topic-options';menu.className='floral-select-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Тема обращения');menu.hidden=true;
    const label=document.createElement('span');trigger.append(label);trigger.insertAdjacentHTML('beforeend','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
    const options=[...select.options].filter(o=>o.value).map(option=>{const button=document.createElement('button');button.type='button';button.className='floral-select-option';button.setAttribute('role','option');button.dataset.value=option.value;button.textContent=option.text;button.tabIndex=-1;menu.append(button);return button;});
    holder.append(trigger,menu);
    function sync(){label.textContent=select.selectedOptions[0].text;options.forEach(o=>o.setAttribute('aria-selected',String(o.dataset.value===select.value)));trigger.setAttribute('aria-invalid',select.getAttribute('aria-invalid')||'false');}
    function close(focus=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
    function open(){menu.hidden=false;trigger.setAttribute('aria-expanded','true');(options.find(o=>o.dataset.value===select.value)||options[0]).focus();}
    trigger.addEventListener('click',()=>menu.hidden?open():close());
    trigger.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open();}});
    options.forEach(option=>option.addEventListener('click',()=>{select.value=option.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));close(true);}));
    menu.addEventListener('keydown',e=>{const current=options.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?options.length-1:(current+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[index].focus();}if(e.key==='Escape'){e.preventDefault();close(true);}if(e.key==='Tab')close();});
    document.addEventListener('pointerdown',e=>{if(!holder.contains(e.target))close();});
    holder.addEventListener('focusout',()=>queueMicrotask(()=>{if(!holder.contains(document.activeElement))close();}));
    select.addEventListener('change',sync);select.addEventListener('focus',()=>trigger.focus());
    select.form?.addEventListener('reset',()=>setTimeout(()=>{sync();close();},0));
    new MutationObserver(sync).observe(select,{attributes:true,attributeFilter:['aria-invalid']});sync();
  }
})();
