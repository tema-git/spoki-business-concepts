(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = matchMedia('(hover: hover) and (pointer: fine)');
  let reduced = reduceQuery.matches;
  let frame = 0;
  const scenes = $$('[data-scroll]').map(el => ({el, top:0, height:0, x:0, y:0, mx:50, my:50, box:null}));
  function renderMotion() {
    frame = 0;
    const sy = scrollY;
    const vh = innerHeight;
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const t = s.top - sy;
      if (t > vh + 150 || t + s.height < -150) continue;
      const progress = reduced ? 1 : Math.max(0, Math.min(1, (vh - t) / (vh * 1.05)));
      s.el.style.setProperty('--scroll', progress.toFixed(4));
      s.el.style.setProperty('--px', reduced ? 0 : s.x.toFixed(3));
      s.el.style.setProperty('--py', reduced ? 0 : s.y.toFixed(3));
      s.el.style.setProperty('--mx', `${s.mx}%`);
      s.el.style.setProperty('--my', `${s.my}%`);
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(renderMotion); }
  function measure() {
    for (let i = 0; i < scenes.length; i++) {
      const rect = scenes[i].el.getBoundingClientRect();
      scenes[i].top = rect.top + scrollY;
      scenes[i].height = rect.height;
      scenes[i].box = rect;
    }
    schedule();
  }
  function syncMotion() {
    reduced = reduceQuery.matches;
    document.body.classList.toggle('motion-off', reduced);
    document.documentElement.style.scrollBehavior = reduced ? 'auto' : '';

    if (reduced) resetMagnet();
    measure();
  }
  reduceQuery.addEventListener('change', syncMotion);
  for (const s of scenes) {
    if (!s.el.classList.contains('pointer-scene')) continue;
    s.el.addEventListener('pointerenter', () => { s.box = s.el.getBoundingClientRect(); });
    s.el.addEventListener('pointermove', e => {
      if (reduced || !pointerQuery.matches || !s.box) return;
      const x = (e.clientX - s.box.left) / s.box.width;
      const y = (e.clientY - (s.top - scrollY)) / s.height;
      s.x = Math.max(-1, Math.min(1, (x - .5) * 2));
      s.y = Math.max(-1, Math.min(1, (y - .5) * 2));
      s.mx = Math.round(x * 100); s.my = Math.round(y * 100);
      schedule();
    });
    s.el.addEventListener('pointerleave', () => { s.x = 0; s.y = 0; s.mx = 50; s.my = 50; schedule(); });
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  addEventListener('load', measure);
  $$('details').forEach(el => el.addEventListener('toggle', measure));
  document.fonts.ready.then(measure);

  const shapePaths = {
    almond:'M50 6C24 20 5 60 5 110V167C5 190 22 204 50 204S95 190 95 167V110C95 60 76 20 50 6Z',
    square:'M17 17Q50 10 83 17Q95 19 95 34V167C95 190 78 204 50 204S5 190 5 167V34Q5 19 17 17Z',
    oval:'M50 14C20 14 5 44 5 84V167C5 190 22 204 50 204S95 190 95 167V84C95 44 80 14 50 14Z'
  };
  const shapeNames = {almond:'Миндаль',square:'Квадрат',oval:'Овал'};
  const finishNames = {gloss:'Глянец',matte:'Матовый',french:'Френч'};
  const state = {color:'#e5372f',colorName:'Красный',shape:'almond',finish:'gloss'};
  const bookingService = $('#booking-service');
  const bookingDesign = $('#booking-design');
  const serviceDropdown = createServiceDropdown(bookingService);
  let designPrefilled = false;
  let previousService = bookingService.value;
  const nailGroup = $('.nail-groups');
  const positions = [[55,128,.72,-15],[157,75,.94,-6],[272,53,1.04,0],[395,75,.94,6],[497,123,.74,15]];
  const svgNS = 'http://www.w3.org/2000/svg';
  positions.forEach((pos,index) => {
    const group = document.createElementNS(svgNS,'g');
    group.setAttribute('transform',`translate(${pos[0]} ${pos[1]}) rotate(${pos[3]} 50 100) scale(${pos[2]})`);
    group.classList.add('individual-nail');
    group.style.setProperty('--nail-offset',`${(index-2)*43}px`);
    group.style.setProperty('--nail-y',`${Math.abs(index-2)*22}px`);
    group.innerHTML = `<g class="nail-motion"><path class="nail-body" d="${shapePaths.almond}"/><path class="nail-shade" fill="url(#nail-base)" d="${shapePaths.almond}"/><path class="nail-french" fill="url(#french-pattern)" d="${shapePaths.almond}"/><path class="nail-shine" d="M30 62C22 90 21 125 23 158Q28 175 33 155V75Z" fill="url(#shine)"/></g>`;
    nailGroup.append(group);
  });
  function description() { return `${state.colorName} / ${shapeNames[state.shape]} / ${finishNames[state.finish]}`; }
  function updatePreview(announce = true) {
    if (designPrefilled) {
      if (bookingService.value === 'Дизайн из nail-lab') bookingService.value = previousService;
      serviceDropdown.sync();
      designPrefilled = false;
      bookingDesign.hidden = true;
      bookingDesign.textContent = '';
    }
    const stage = $('#nail-preview');
    stage.style.setProperty('--nail',state.color);
    stage.dataset.shape = state.shape;
    stage.dataset.finish = state.finish;
    $$('.nail-body,.nail-shade,.nail-french').forEach(path => path.setAttribute('d',shapePaths[state.shape]));
    $('#preview-name').textContent = description();
    $('#nail-title').textContent = `Визуализация маникюра: ${description()}`;
    if (announce) $('#lab-announcement').textContent = description();
    $('#design-result').hidden = true;
    $$('.color-choice').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === state.color)));
    $$('button[data-shape]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.shape === state.shape)));
    $$('button[data-finish]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.finish === state.finish)));
    measure();
  }
  $$('.color-choice').forEach(button => button.addEventListener('click',() => {if(state.color===button.dataset.color)return;state.color=button.dataset.color;state.colorName=button.dataset.label;updatePreview();}));
  $$('button[data-shape]').forEach(button => button.addEventListener('click',() => {if(state.shape===button.dataset.shape)return;state.shape=button.dataset.shape;updatePreview();}));
  $$('button[data-finish]').forEach(button => button.addEventListener('click',() => {if(state.finish===button.dataset.finish)return;state.finish=button.dataset.finish;updatePreview();}));
  $('#finish-design').addEventListener('click',() => {
    $('#result-title').textContent = description();
    $('#result-description').textContent = 'Ваша идея готова. Покажите сочетание мастеру и уточните доступность оттенка, материалов и дизайна.';
    $('#design-result').hidden = false;
    $('#lab-announcement').textContent = `Идея готова: ${description()}. Можно обсудить её со студией или собрать заново.`;
    measure();
    $('#design-result').focus({preventScroll:true});
    $('#design-result').scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});
  });
  $('#design-booking').addEventListener('click', () => {
    if (!designPrefilled) previousService = bookingService.value;
    openBooking('Дизайн из nail-lab', description());
    designPrefilled = true;
  });
  bookingService.addEventListener('change', () => { designPrefilled = false;bookingDesign.hidden=true;bookingDesign.textContent=''; });
  $('#reset-design').addEventListener('click',() => {
    Object.assign(state,{color:'#e5372f',colorName:'Красный',shape:'almond',finish:'gloss'});
    updatePreview(false);
    $('#lab-announcement').textContent = 'Конструктор сброшен. Выберите новое сочетание.';
    $('.color-choice').focus({preventScroll:true});
    $('#nail-preview').scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});
  });

  const form = $('#booking-form');
  const nameInput = $('#guest-name');
  const phoneInput = $('#guest-phone');
  function fieldError(input,id,message) {input.setAttribute('aria-invalid',String(Boolean(message)));$(id).textContent=message;}
  function openBooking(service, design = '') {
    form.hidden = false;
    $('#booking-success').hidden = true;
    if (service) bookingService.value = service;
    serviceDropdown.sync();
    serviceDropdown.close();
    fieldError(nameInput,'#name-error','');
    fieldError(phoneInput,'#phone-error','');
    bookingDesign.textContent = design ? `Ваш дизайн: ${design}` : '';
    bookingDesign.hidden = !design;
    $('#form-announcement').textContent = '';
    measure();
  }
  nameInput.addEventListener('input',() => fieldError(nameInput,'#name-error',''));
  phoneInput.addEventListener('input',() => fieldError(phoneInput,'#phone-error',''));
  form.addEventListener('submit',event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const phone = phoneInput.value.replace(/\D/g,'');
    const letterCount = (name.match(/\p{L}/gu) || []).length;
    const nameError = letterCount<2 ? 'Введите имя: минимум две буквы.' : !/^[\p{L}\s.'’-]+$/u.test(name) ? 'Используйте буквы, пробелы или дефис.' : '';
    const phoneError = !/^\+?[\d\s()\-]+$/.test(phoneInput.value.trim()) || !/^[78]\d{10}$/.test(phone) ? 'Введите номер из 11 цифр, начиная с +7 или 8.' : '';
    fieldError(nameInput,'#name-error',nameError);
    fieldError(phoneInput,'#phone-error',phoneError);
    if(nameError || phoneError) {$('#form-announcement').textContent='Проверьте имя и телефон. Данные не отправлены.';measure();(nameError?nameInput:phoneInput).focus();return;}
    form.reset();
    serviceDropdown.sync();
    serviceDropdown.close();
    designPrefilled = false;
    bookingDesign.hidden = true;
    bookingDesign.textContent = '';
    form.hidden=true;
    $('#booking-success').hidden=false;
    $('#form-announcement').textContent='Демосценарий пройден. Данные очищены. Реальная запись не создана.';
    $('#booking-success').focus({preventScroll:true});
    measure();
  });
  $('#booking-again').addEventListener('click',() => {
    form.reset();
    designPrefilled = false;
    openBooking();
    $('#form-announcement').textContent='Можно повторить демосценарий.';
    nameInput.focus({preventScroll:true});
    measure();
  });
  $$('[data-service]').forEach(link => link.addEventListener('click',() => {openBooking(link.dataset.service);designPrefilled=false;}));
  addEventListener('pagehide',() => {if(frame)cancelAnimationFrame(frame);frame=0;form.reset();serviceDropdown.sync();serviceDropdown.close();designPrefilled=false;bookingDesign.hidden=true;bookingDesign.textContent='';resetMagnet();});
  addEventListener('pageshow',measure);

  const magnetTarget = $('.header-contact');
  const magnetVisual = $('.contact-magnet');
  let magnetBox = null;
  let magnetFrame = 0;
  let magnetX = 0;
  let magnetY = 0;
  function resetMagnet() {
    cancelAnimationFrame(magnetFrame);magnetFrame=0;
    magnetX=0;magnetY=0;
    magnetVisual.style.transform='translate(0px,0px)';
  }
  magnetTarget.addEventListener('pointerenter',() => {magnetBox=magnetTarget.getBoundingClientRect();});
  magnetTarget.addEventListener('pointermove',event => {
    if(reduced || !pointerQuery.matches || !magnetBox)return;
    magnetX=Math.max(-5,Math.min(5,((event.clientX-magnetBox.left)/magnetBox.width-.5)*10));
    magnetY=Math.max(-4,Math.min(4,((event.clientY-magnetBox.top)/magnetBox.height-.5)*8));
    if(!magnetFrame)magnetFrame=requestAnimationFrame(() => {magnetFrame=0;magnetVisual.style.transform=`translate(${magnetX.toFixed(2)}px,${magnetY.toFixed(2)}px)`;});
  });
  magnetTarget.addEventListener('pointerleave',resetMagnet);
  magnetTarget.addEventListener('focus',resetMagnet);

  function createServiceDropdown(select) {
    const trigger=$('#service-trigger');
    const valueLabel=$('#service-value');
    const list=$('#service-listbox');
    const options=Array.from(select.options);
    let active=Math.max(0,select.selectedIndex);
    let open=false;
    let typeBuffer='';
    let typeTimer=0;
    const items=options.map((option,index) => {
      const item=document.createElement('div');
      item.id=`service-option-${index}`;
      item.className='select-option';item.setAttribute('role','option');
      item.textContent=option.textContent;
      item.addEventListener('pointerdown',event=>event.preventDefault());
      item.addEventListener('click',()=>{active=index;commit(true);});
      list.append(item);return item;
    });
    document.body.append(list);
    function sync() {
      const selected=Math.max(0,select.selectedIndex);
      valueLabel.textContent=options[selected].textContent;
      items.forEach((item,index)=>item.setAttribute('aria-selected',String(index===selected)));
      if(!open)active=selected;
    }
    function position() {
      if(!open)return;
      const rect=trigger.getBoundingClientRect();
      const headerBottom=$('.header').getBoundingClientRect().bottom+8;
      if(rect.bottom<=headerBottom || rect.top>=innerHeight-8){close();return;}
      const below=innerHeight-rect.bottom-12;
      const above=rect.top-headerBottom-12;
      const natural=Math.min(options.length*54+16,280);
      const up=below<natural && above>below;
      const available=Math.max(100,Math.min(natural,up?above:below));
      list.style.width=`${Math.min(rect.width,innerWidth-24)}px`;
      list.style.left=`${Math.max(12,Math.min(rect.left,innerWidth-rect.width-12))}px`;
      list.style.maxHeight=`${available}px`;
      list.style.top=up?`${Math.max(headerBottom,rect.top-available-8)}px`:`${rect.bottom+8}px`;
      list.dataset.side=up?'up':'down';
    }
    function highlight(index) {
      active=Math.max(0,Math.min(items.length-1,index));
      items.forEach((item,i)=>item.classList.toggle('is-active',i===active));
      trigger.setAttribute('aria-activedescendant',items[active].id);
      const item=items[active];
      if(item.offsetTop<list.scrollTop)list.scrollTop=item.offsetTop;
      else if(item.offsetTop+item.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=item.offsetTop+item.offsetHeight-list.clientHeight;
    }
    function show() {
      if(open)return;
      open=true;active=Math.max(0,select.selectedIndex);list.hidden=false;
      trigger.setAttribute('aria-expanded','true');position();highlight(active);
    }
    function close(focus=false) {
      open=false;list.hidden=true;trigger.setAttribute('aria-expanded','false');
      trigger.removeAttribute('aria-activedescendant');
      clearTimeout(typeTimer);typeBuffer='';
      if(focus)trigger.focus({preventScroll:true});
    }
    function commit(focus) {
      const changed=select.selectedIndex!==active;
      select.selectedIndex=active;sync();close(focus);
      if(changed)select.dispatchEvent(new Event('change',{bubbles:true}));
    }
    trigger.addEventListener('click',()=>open?close():show());
    trigger.addEventListener('keydown',event=>{
      const key=event.key;
      if(key==='ArrowDown'||key==='ArrowUp'){
        event.preventDefault();if(!open)show();else highlight(active+(key==='ArrowDown'?1:-1));return;
      }
      if(key==='Home'||key==='End'){event.preventDefault();show();highlight(key==='Home'?0:items.length-1);return;}
      if(key==='Enter'||key===' '){event.preventDefault();open?commit(true):show();return;}
      if(key==='Escape'&&open){event.preventDefault();close(true);return;}
      if(key==='Tab'){if(open)commit(false);return;}
      if(key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
        event.preventDefault();show();clearTimeout(typeTimer);
        typeBuffer+=key.toLocaleLowerCase('ru');
        const repeated=Array.from(typeBuffer).every(letter=>letter===typeBuffer[0]);
        const query=repeated?typeBuffer[0]:typeBuffer;
        for(let step=1;step<=options.length;step++){
          const index=(active+step)%options.length;
          if(options[index].textContent.toLocaleLowerCase('ru').startsWith(query)){highlight(index);break;}
        }
        typeTimer=setTimeout(()=>{typeBuffer='';},700);
      }
    });
    document.addEventListener('pointerdown',event=>{if(open&&!trigger.contains(event.target)&&!list.contains(event.target))close();});
    document.addEventListener('focusin',event=>{if(open&&event.target!==trigger&&!list.contains(event.target))close();});
    addEventListener('scroll',position,{passive:true});addEventListener('resize',position,{passive:true});
    select.addEventListener('change',sync);
    sync();return {sync,close};
  }
  updatePreview(false);
  syncMotion();
})();
