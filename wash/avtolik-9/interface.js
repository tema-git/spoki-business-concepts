(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const contact = document.querySelector('.header a[href="#contacts"]');
  if (contact) {
    const inner = document.createElement('span');
    inner.className = 'magnetic-inner';
    while (contact.firstChild) inner.append(contact.firstChild);
    contact.append(inner);contact.classList.add('magnetic-contact');
    let bounds, frame=0, target={x:0,y:0};
    const paint=()=>{frame=0;inner.style.transform=`translate(${target.x}px,${target.y}px)`;};
    const reset=()=>{target={x:0,y:0};if(!frame)frame=requestAnimationFrame(paint);};
    contact.addEventListener('pointerenter',()=>{bounds=contact.getBoundingClientRect();});
    contact.addEventListener('pointermove',event=>{
      if(reduce.matches||!fine.matches||event.pointerType==='touch'||!bounds)return;
      target={x:Math.max(-4,Math.min(4,(event.clientX-bounds.left-bounds.width/2)*.075)),y:Math.max(-4,Math.min(4,(event.clientY-bounds.top-bounds.height/2)*.14))};
      if(!frame)frame=requestAnimationFrame(paint);
    },{passive:true});
    contact.addEventListener('pointerleave',reset);contact.addEventListener('blur',reset);
    window.addEventListener('resize',()=>{bounds=null;reset();},{passive:true});
    reduce.addEventListener('change',reset);
  }

  // Progressive enhancement: the native select remains the form value and no-JS fallback.
  const select=document.querySelector('#service');
  if(!select)return;
  const root=document.createElement('div');root.className='service-picker-wrap';
  root.innerHTML='<button type="button" id="service-picker" class="field-picker" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="service-options" aria-labelledby="service-label service-value"><span id="service-value"></span><svg class="arrow" aria-hidden="true"><use href="#arrow"/></svg></button><div id="service-options" class="service-options" role="listbox" aria-labelledby="service-label" hidden></div>';
  select.after(root);select.hidden=true;select.tabIndex=-1;
  document.querySelector('#service-label').htmlFor='service-picker';
  const trigger=root.querySelector('button'),list=root.querySelector('[role=listbox]'),value=root.querySelector('#service-value');
  const options=[...select.options].map((option,index)=>{
    const node=document.createElement('div');node.id=`service-option-${index}`;node.setAttribute('role','option');node.dataset.index=index;
    const text=document.createElement('span');text.textContent=option.textContent;node.append(text);
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#check');icon.append(use);node.append(icon);list.append(node);return node;
  });
  // A viewport portal keeps the menu outside clipped decorative section containers.
  document.body.append(list);list.style.position='fixed';list.style.zIndex='150';
  let open=false,active=select.selectedIndex,search='',searchTime=0,menuFrame=0;
  function sync(){value.textContent=select.selectedOptions[0]?.textContent||'';active=select.selectedIndex;options.forEach((node,i)=>node.setAttribute('aria-selected',String(i===active)));highlight();}
  function highlight(){options.forEach((node,i)=>node.classList.toggle('is-active',open&&i===active));if(open)trigger.setAttribute('aria-activedescendant',options[active].id);else trigger.removeAttribute('aria-activedescendant');}
  function placeMenu(){
    const rect=trigger.getBoundingClientRect(),headerBottom=document.querySelector('.header')?.getBoundingClientRect().bottom||0;
    const viewport=window.visualViewport,vx=viewport?.offsetLeft||0,vy=viewport?.offsetTop||0,vw=viewport?.width||innerWidth,vh=viewport?.height||innerHeight;
    const topLimit=Math.max(vy+12,headerBottom+8),bottomLimit=vy+vh-12,width=Math.min(rect.width,vw-24);
    list.style.width=`${width}px`;list.style.left=`${Math.max(vx+12,Math.min(vx+vw-width-12,rect.left))}px`;list.style.maxHeight='286px';
    const natural=Math.min(286,list.scrollHeight),below=bottomLimit-rect.bottom-8,above=rect.top-topLimit-8;
    const upwards=below<natural&&above>below,available=upwards?above:below,height=Math.max(48,Math.min(natural,available));
    list.style.maxHeight=`${height}px`;list.style.top=`${Math.max(topLimit,Math.min(bottomLimit-height,upwards?rect.top-8-height:rect.bottom+8))}px`;list.style.bottom='auto';
  }
  function revealActive(){const node=options[active];if(node.offsetTop<list.scrollTop)list.scrollTop=node.offsetTop;else if(node.offsetTop+node.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=node.offsetTop+node.offsetHeight-list.clientHeight;}
  function followScroll(){
    if(!open||menuFrame)return;
    menuFrame=requestAnimationFrame(()=>{
      menuFrame=0;if(!open)return;
      const rect=trigger.getBoundingClientRect(),viewport=window.visualViewport;
      const top=viewport?.offsetTop||0,bottom=top+(viewport?.height||innerHeight);
      const headerBottom=document.querySelector('.header')?.getBoundingClientRect().bottom||0;
      if(rect.bottom<=Math.max(top,headerBottom)||rect.top>=bottom)setOpen(false);else placeMenu();
    });
  }
  function setOpen(next){open=next;list.hidden=!next;trigger.setAttribute('aria-expanded',String(next));root.classList.toggle('is-open',next);if(next){active=select.selectedIndex;placeMenu();revealActive();}highlight();}
  function choose(index){select.selectedIndex=index;select.dispatchEvent(new Event('change',{bubbles:true}));setOpen(false);trigger.focus({preventScroll:true});}
  trigger.addEventListener('click',()=>setOpen(!open));
  trigger.addEventListener('keydown',event=>{
    if(event.key==='Escape'){if(open){event.preventDefault();setOpen(false);}return;}
    if(event.key==='Tab'){setOpen(false);return;}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();if(open)choose(active);else setOpen(true);return;}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();if(!open){setOpen(true);return;}
      if(event.key==='Home')active=0;else if(event.key==='End')active=options.length-1;else active=Math.max(0,Math.min(options.length-1,active+(event.key==='ArrowDown'?1:-1)));
      highlight();revealActive();return;
    }
    if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
      const now=performance.now();search=now-searchTime>650?event.key:search+event.key;searchTime=now;
      const index=[...select.options].findIndex(option=>option.textContent.toLocaleLowerCase('ru').startsWith(search.toLocaleLowerCase('ru')));
      if(index>=0){event.preventDefault();if(!open)setOpen(true);active=index;highlight();revealActive();}
    }
  });
  list.addEventListener('click',event=>{const option=event.target.closest('[role=option]');if(option)choose(Number(option.dataset.index));});
  document.addEventListener('pointerdown',event=>{if(open&&!root.contains(event.target)&&!list.contains(event.target))setOpen(false);});
  select.addEventListener('change',sync);
  select.form.addEventListener('reset',()=>queueMicrotask(()=>{setOpen(false);sync();}));
  window.addEventListener('resize',()=>setOpen(false),{passive:true});
  window.addEventListener('scroll',followScroll,{passive:true});
  window.visualViewport?.addEventListener('resize',()=>{if(open)placeMenu();},{passive:true});
  window.visualViewport?.addEventListener('scroll',followScroll,{passive:true});
  sync();
})();
