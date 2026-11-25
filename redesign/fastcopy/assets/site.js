(() => {
  'use strict';
  const one = (q, parent = document) => parent.querySelector(q);
  const all = (q, parent = document) => [...parent.querySelectorAll(q)];
  const whole = new Intl.NumberFormat('ru-RU', {useGrouping:'always'});
  const two = new Intl.NumberFormat('ru-RU', {minimumFractionDigits:2, maximumFractionDigits:2, useGrouping:'always'});
  const money = x => (Number.isInteger(x) ? whole : two).format(x) + ' ₽';
  const params = new URLSearchParams(location.search);
  const draft = one('#draft');
  let specification = null;
  let subject = '';
  let syncDraft = () => {};
  let openPicker = null;

  const menu = one('#mobile-nav'), toggle = one('.menu-toggle');
  function menuState(open, focus = false) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (focus) toggle.focus();
  }
  toggle.addEventListener('click', () => menuState(menu.hidden));
  menu.addEventListener('click', event => { if (event.target.closest('a')) menuState(false); });
  document.addEventListener('pointerdown', event => {
    if (!menu.hidden && !event.target.closest('.mast')) menuState(false);
    if (openPicker && !openPicker.contains(event.target)) closePicker(false);
  });
  matchMedia('(min-width:801px)').addEventListener('change',e => { if(e.matches) menuState(false); });
  document.addEventListener('keydown',event => {
    if (event.key !== 'Escape') return;
    if (draft.open) return;
    if (openPicker) { event.preventDefault(); closePicker(true); }
    else if (!menu.hidden) { event.preventDefault(); menuState(false, true); }
  });
  menu.addEventListener('focusout', event => {
    if(event.relatedTarget && !event.relatedTarget.closest('.mast')) menuState(false);
  });

  function fillDraft() {
    syncDraft();
    if (!specification) return false;
    one('#draft-text').value = specification;
    one('#mail-draft').href = 'mailto:info@fastcopy.ru?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(specification.replace(/\n/g,'\r\n'));
    return true;
  }
  function presentDraft() {
    if (!fillDraft()) return;
    all('.copy-status').forEach(p=>p.textContent='');
    if(!draft.open) draft.showModal();
  }
  one('[data-close]',draft).addEventListener('click',()=>draft.close());
  draft.addEventListener('click',e=>{
    if(e.target!==draft) return;
    const r=draft.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) draft.close();
  });
  all('[data-copy]').forEach(button=>button.addEventListener('click', async()=>{
    if(!fillDraft()) return;
    const report = one('.copy-status',button.closest('dialog,section')||document);
    try {
      await navigator.clipboard.writeText(specification);
      if(report) report.textContent='Расчёт скопирован.';
    } catch {
      if(!draft.open) draft.showModal();
      const field=one('#draft-text');
      field.focus(); field.select();
      let copied=false;
      try { copied=document.execCommand('copy'); } catch {}
      one('.copy-status',draft).textContent=copied?'Расчёт скопирован.':'Текст выделен. Выберите «Скопировать» в меню устройства.';
    }
  }));

  function closePicker(focus) {
    if(!openPicker) return;
    const picker=openPicker;
    openPicker=null;
    picker.classList.remove('open','above');
    one('.pick-list',picker).hidden=true;
    const trigger=one('.pick-trigger',picker);
    trigger.setAttribute('aria-expanded','false');
    if(focus) trigger.focus({preventScroll:true});
  }
  function focusOption(option) {
    if(!option) return;
    option.focus({preventScroll:true});
    const list=option.parentElement;
    if(option.offsetTop < list.scrollTop) list.scrollTop=option.offsetTop;
    if(option.offsetTop+option.offsetHeight>list.scrollTop+list.clientHeight) list.scrollTop=option.offsetTop+option.offsetHeight-list.clientHeight;
  }
  function placePicker(picker){
    const trigger=one('.pick-trigger',picker), list=one('.pick-list',picker);
    const rect=trigger.getBoundingClientRect();
    const lower=innerHeight-rect.bottom-(one('#mini-total:not([hidden])')?.offsetHeight||0)-10;
    const upper=rect.top-one('.mast').offsetHeight-12;
    const above=lower<185 && upper>lower;
    picker.classList.toggle('above',above);
    list.style.setProperty('--available',Math.max(74,above?upper:lower)+'px');
  }
  function connectPicker(picker,select){
    const trigger=one('.pick-trigger',picker), list=one('.pick-list',picker);
    const options=all('[role=option]',list);
    function open() {
      closePicker(false); openPicker=picker;
      picker.classList.add('open');list.hidden=false;trigger.setAttribute('aria-expanded','true');
      placePicker(picker);focusOption(one('[aria-selected=true]',list)||options[0]);
    }
    trigger.addEventListener('click',()=>openPicker===picker?closePicker(true):open());
    trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open();}});
    list.addEventListener('click',e=>{
      const item=e.target.closest('[role=option]'); if(!item) return;
      select(item.dataset.id);
      if(picker.dataset.multi==='true') focusOption(item); else closePicker(true);
    });
    list.addEventListener('keydown',e=>{
      const i=options.indexOf(document.activeElement);
      const target=({ArrowDown:Math.min(i+1,options.length-1),ArrowUp:Math.max(i-1,0),Home:0,End:options.length-1})[e.key];
      if(target!==undefined){e.preventDefault();focusOption(options[target]);}
      else if(e.key==='Tab'){closePicker(true);}
      else if(e.key.length===1 && /[\p{L}\p{N}]/u.test(e.key)){
        const next=[...options.slice(i+1),...options.slice(0,i+1)].find(o=>o.textContent.trim().toLocaleLowerCase('ru').startsWith(e.key.toLocaleLowerCase('ru')));
        if(next)focusOption(next);
      }
    });
    picker.addEventListener('focusout',e=>{if(openPicker===picker && e.relatedTarget && !picker.contains(e.relatedTarget))closePicker(false);});
  }

  const form=one('#print-form');
  if(form) {
    const r=globalThis.FastcopyRates;
    const data={paper:r.papers,front:r.inks,back:r.inks,cut:r.cuts,fold:r.folds,crease:r.creases};
    let state=structuredClone(r.defaults);
    let itemTitle=(params.get('item')||'Листовки').trim().slice(0,120)||'Листовки';
    if(r.formats.some(x=>x.id===params.get('format')))state.format=params.get('format');
    if(params.has('quantity'))state.quantity=params.get('quantity');
    Object.entries(data).forEach(([key,items])=>{
      if(!params.has(key)) return;
      const value=params.get(key);
      if(Array.isArray(state[key]))state[key]=items.filter(x=>value.split(',').includes(x.id)).map(x=>x.id);
      else if(items.some(x=>x.id===value))state[key]=value;
    });
    const qty=one('#quantity'), bench=one('.workbench'), mini=one('#mini-total'), quote=one('.proof-column>section');
    const fieldError=one('#quantity-error'), message=one('#price-message');
    const getLabel=(items,id)=>items.find(x=>x.id===id)?.label||id;
    const inkLabels=(ids)=>ids.length?ids.map(id=>getLabel(r.inks,id)).join(', '):'Без печати';
    const numberQty=()=>Number(String(state.quantity).replace(/\s/g,''));
    const picks=all('.picker',form);
    function paintPicker(picker){
      const key=picker.dataset.key, value=state[key], multi=Array.isArray(value);
      one('#val-'+key,picker).textContent=multi?inkLabels(value):getLabel(data[key],value);
      const current=one('.pick-dots',picker);
      current.replaceChildren();
      if(multi) value.forEach(id=>{
        const dot=document.createElement('i');dot.className='ink-dot';dot.style.setProperty('--dot',r.inks.find(x=>x.id===id).hex);current.append(dot);
      });
      all('[role=option]',picker).forEach(o=>{
        const id=o.dataset.id;
        o.setAttribute('aria-selected',String(multi?(id==='none'?!value.length:value.includes(id)):value===id));
      });
    }
    function updateURL(){
      const url=new URL(location.href);
      for(const key of Object.keys(r.defaults)){
        const val=state[key], d=r.defaults[key];
        if(String(val)===String(d))url.searchParams.delete(key);
        else url.searchParams.set(key,String(val));
      }
      if(itemTitle==='Листовки') url.searchParams.delete('item'); else url.searchParams.set('item',itemTitle);
      history.replaceState(null,'',url);
    }
    function paint(writeURL=true){
      const result=r.calculate(state), fmt=r.formats.find(x=>x.id===state.format);
      const q=numberQty(), good=result.status==='ok', bad=result.status==='invalid', qtyBad=bad && (!/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)$/.test(String(state.quantity).trim()) || !(q>0));
      const qLabel=Number.isSafeInteger(q)?whole.format(q):String(state.quantity).trim();
      qty.value=state.quantity;
      qty.setAttribute('aria-invalid',String(qtyBad));
      one('input[name=format][value="'+state.format+'"]').checked=true;
      one('#format-size').textContent=fmt.size;
      picks.forEach(paintPicker);
      all('[data-quantity]').forEach(b=>b.setAttribute('aria-pressed',String(q===Number(b.dataset.quantity))));
      fieldError.textContent=qtyBad?result.message:'';
      const total=good?money(result.total):(bad?'Уточните параметры':'Расчёт менеджера');
      const unit=good?two.format(result.unit)+' ₽ за экземпляр':'';
      one('#quote-total').textContent=total;
      one('#quote-total').classList.toggle('long',!good||total.length>12);
      one('#quote-unit').textContent=unit;
      one('#quote-format').textContent=fmt.label+(q>0&&Number.isSafeInteger(q)?' · '+qLabel+' шт.':'');
      one('#mini-price').textContent=good?total:(bad?'Проверьте тираж':'У менеджера');
      one('#mini-unit').textContent=unit;
      const notices=[...new Set([result.message,...(result.warnings||[])].filter(Boolean))];
      message.textContent=notices.join(' ');message.hidden=!notices.length;
      const cutNote=one('#cut-note'), localWarning=one('#calc-warning');
      cutNote.textContent=fmt.perSheet>1?'Резка в выбранный формат уже входит в оценку. Дополнительную обработку можно выбрать отдельно.':'Дополнительную резку, фальцовку и биговку можно выбрать отдельно.';
      localWarning.textContent=qtyBad?'':notices.join(' ');
      localWarning.hidden=!localWarning.textContent;
      const context=one('#product-context');
      if(context){context.textContent='Изделие — '+itemTitle;context.hidden=itemTitle==='Листовки';}
      all('[data-prepare]').forEach(b=>{b.disabled=bad;});
      all('[data-copy]').forEach(b=>{b.disabled=bad;});
      all('.copy-status').forEach(p=>p.textContent='');
      specification = bad ? null : [
        'Здравствуйте! Прошу подтвердить расчёт и срок изготовления.',
        '', 'Изделие — '+itemTitle+'. Способ печати — ризография.',
        'Формат — '+fmt.label+' ('+fmt.size+').', 'Тираж — '+qLabel+' шт.',
        'Бумага — '+getLabel(r.papers,state.paper)+'.', 'Лицо — '+inkLabels(state.front)+'.', 'Оборот — '+inkLabels(state.back)+'.',
        'Дополнительная резка — '+getLabel(r.cuts,state.cut)+'.', 'Фальцовка — '+getLabel(r.folds,state.fold)+'.', 'Биговка — '+getLabel(r.creases,state.crease)+'.',
        ...(good&&result.pieces!==q?['Выход после резки — '+whole.format(result.pieces)+' шт.']:[]),
        good?'Оценка за тираж — '+total+'. Цена за экземпляр — '+two.format(result.unit)+' ₽.':'Стоимость и совместимость прошу уточнить у менеджера.',
        ...notices, '', 'Контактное лицо и телефон: ', 'Макет приложу к письму.'
      ].join('\n');
      subject='Заказ в типографию — '+itemTitle+', '+fmt.label+', '+qLabel+' шт.';
      if(writeURL)updateURL();
    }
    form.addEventListener('submit',e=>{e.preventDefault();if(!fieldError.textContent)presentDraft();});
    qty.addEventListener('input',()=>{state.quantity=qty.value;paint();});
    qty.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(specification)presentDraft();}});
    all('[name=format]',form).forEach(radio=>radio.addEventListener('change',()=>{state.format=radio.value;paint();}));
    all('[data-qty]').forEach(b=>b.addEventListener('click',()=>{state.quantity=String(Math.max(1,(Number.isSafeInteger(numberQty())?numberQty():0)+Number(b.dataset.qty)));paint();}));
    all('[data-quantity]').forEach(b=>b.addEventListener('click',()=>{state.quantity=b.dataset.quantity;paint();}));
    picks.forEach(p=>{
      const key=p.dataset.key;
      connectPicker(p,id=>{
        if(Array.isArray(state[key]))state[key]=id==='none'?[]:state[key].includes(id)?state[key].filter(x=>x!==id):[...state[key],id];
        else state[key]=id;
        paint();
      });
    });
    one('#reset-calc').addEventListener('click',()=>{closePicker(false);state=structuredClone(r.defaults);itemTitle='Листовки';one('.finishing').open=false;paint();});
    all('[data-prepare]').forEach(b=>b.addEventListener('click',presentDraft));
    paint(false);
    function miniVisibility(){
      const box=quote.getBoundingClientRect(), head=one('.mast').offsetHeight;
      const quoteButton=one('[data-prepare]',quote).getBoundingClientRect();
      mini.hidden=box.top>=head-2 && quoteButton.bottom<=innerHeight-4;
      if(openPicker)placePicker(openPicker);
    }
    const ro=new ResizeObserver(miniVisibility);ro.observe(bench);ro.observe(quote);
    window.addEventListener('scroll',miniVisibility,{passive:true});window.addEventListener('resize',miniVisibility);miniVisibility();
  }

  const request=one('.request-form');
  if(request){
    const type=one('[name=product]',request);
    if([...type.options].some(x=>x.value===params.get('product')))type.value=params.get('product');
    const label=()=>type.selectedOptions[0]?.textContent||'Изделие';
    const heading=one('#request-product');if(heading)heading.textContent=label();
    type.addEventListener('change',()=>{if(heading)heading.textContent=label();});
    syncDraft=()=>{
      const values=new FormData(request);
      specification=['Здравствуйте! Прошу рассчитать заказ.','','Изделие или услуга — '+label()+'.',
        ...[['quantity','Тираж'],['format','Формат'],['paper','Бумага или материал'],['sides','Печать и стороны'],['finish','Обработка'],['details','Пожелания']].map(([key,title])=>title+' — '+(String(values.get(key)||'').trim()||'уточнить с менеджером')+'.'),
        'Стоимость и срок прошу подтвердить.','','Контактное лицо и телефон: ','Макет приложу к письму.'].join('\n');
      subject='Заказ в типографию — '+label();
    };
    request.addEventListener('submit',e=>{e.preventDefault();if(request.reportValidity())presentDraft();});
  }
  const search=one('#filter');
  if(search){
    const cards=all('[data-search]'), empty=one('#filter-empty');
    const filter=s=>s.toLocaleLowerCase('ru').replaceAll('ё','е').trim();
    search.addEventListener('input',()=>{const term=filter(search.value);cards.forEach(c=>c.hidden=!filter(c.dataset.search).includes(term));empty.hidden=cards.some(c=>!c.hidden);});
  }

  const board=one('.registration-board');
  if(board){
    const vectors={up:[0,-1],left:[-1,0],lower:[0,1],right:[1,0]}, layer=one('.game-layer',board), panel=board.closest('.game-panel');
    const starts=[[4,-3],[-5,2],[3,4],[-3,-4]];
    let round=0,x=4,y=-3,step=1,drag=null,won=false;
    const clamp=v=>Math.max(-9,Math.min(9,v));
    function paintGame(){
      won=x===0&&y===0;
      layer.setAttribute('transform','translate('+x*4+' '+y*4+')');
      panel.classList.toggle('won',won);
      const axes=[x?(x>0?'Вправо ':'Влево ')+Math.abs(x)+' мм':'',y?(y>0?'вниз ':'вверх ')+Math.abs(y)+' мм':''].filter(Boolean);
      one('#game-feedback').textContent=won?'Метки совпали. Оттиск готов!':'Смещение: '+axes.join(', ')+'.';
      one('#game-reset').lastChild.textContent=won?' Повторить':' Начать заново';
    }
    function move(dir){if(won)return;const [dx,dy]=vectors[dir];x=clamp(x+dx*step);y=clamp(y+dy*step);paintGame();}
    all('[data-move]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.move)));
    all('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=Number(b.dataset.step);all('[data-step]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));}));
    board.addEventListener('keydown',e=>{
      const dir=({ArrowUp:'up',ArrowDown:'lower',ArrowLeft:'left',ArrowRight:'right'})[e.key];
      if(dir){e.preventDefault();move(dir);}
      if(e.key==='Enter' && won){e.preventDefault();one('#game-reset').click();}
    });
    board.addEventListener('pointerdown',e=>{
      if(won || (e.pointerType==='mouse' && e.button!==0))return;
      const svg=one('svg',board), r=svg.getBoundingClientRect();
      drag={id:e.pointerId,px:e.clientX,py:e.clientY,x,y,scale:Math.min(r.width/280,r.height/176)*4};
      board.setPointerCapture(e.pointerId);
    });
    board.addEventListener('pointermove',e=>{
      if(!drag || e.pointerId!==drag.id || won)return;
      x=clamp(drag.x+Math.round((e.clientX-drag.px)/drag.scale/step)*step);
      y=clamp(drag.y+Math.round((e.clientY-drag.py)/drag.scale/step)*step);paintGame();
    });
    const endDrag=()=>{drag=null;};
    board.addEventListener('lostpointercapture',endDrag);board.addEventListener('pointercancel',endDrag);
    one('#game-reset').addEventListener('click',()=>{round=(round+1)%starts.length;[x,y]=starts[round];drag=null;paintGame();});
    paintGame();
  }

  const motion=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(pointer: fine)');
  const magnet=one('.contact-target');
  magnet.addEventListener('pointermove',e=>{
    if(motion.matches||!fine.matches)return;
    const r=magnet.getBoundingClientRect();
    magnet.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*6+'px');
    magnet.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*5+'px');
  });
  magnet.addEventListener('pointerleave',()=>{magnet.style.removeProperty('--mx');magnet.style.removeProperty('--my');});
  const scene=one('[data-motion]');
  if(scene){
    const switchProof=one('#proof-switch');
    switchProof.addEventListener('click',()=>{
      const real=switchProof.getAttribute('aria-pressed')==='false';
      switchProof.setAttribute('aria-pressed',String(real));
      switchProof.firstChild.textContent=real?'Графическая проба ':'Оттиск типографии ';
      one('.real-proof',scene).hidden=!real;one('.paper-stack',scene).hidden=real;
      scene.classList.toggle('real',real);
      scene.setAttribute('aria-label',real?'Образец типографии на белой бумаге':'Графический образец двухкрасочной печати');
      one('#proof-caption').textContent=real?'Краски ризографа':'Графическая проба';
    });
    scene.addEventListener('pointermove',e=>{if(motion.matches||!fine.matches)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*2);scene.style.setProperty('--py',((e.clientY-r.top)/r.height-.5)*2);});
    scene.addEventListener('pointerleave',()=>{scene.style.removeProperty('--px');scene.style.removeProperty('--py');});
    let queued=false;
    const scrollArt=()=>{if(queued||motion.matches)return;queued=true;requestAnimationFrame(()=>{queued=false;const r=scene.getBoundingClientRect();if(r.bottom>=0 && r.top<innerHeight)scene.style.setProperty('--scroll',Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height))));});};
    window.addEventListener('scroll',scrollArt,{passive:true});scrollArt();
  }
})();
