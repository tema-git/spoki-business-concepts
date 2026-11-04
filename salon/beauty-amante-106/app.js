(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.SALON_CONFIG || {};
  document.querySelectorAll('[data-company]').forEach(el => { if (config[el.dataset.company]) el.textContent = config[el.dataset.company]; });
  document.querySelectorAll('[data-company-link]').forEach(el => { const key = el.dataset.companyLink; if (config[key]) el.href = `${key === 'phone' ? 'tel' : 'mailto'}:${config[key]}`; });

  // Fine details are real vector geometry, generated once, never frame sequences.
  const strandColors = ['#9f6a75','#c99a9e','#e5bcc0','#6c384c','#f6d6d2'];
  for (let i = 0; i < 34; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${178+i*5.2} 78C${500+i*1.3} 132 ${90+i*5} 246 ${306+i*3} 348S${374-i*2} 516 ${162+i*5} 566`);
    path.setAttribute('stroke', strandColors[i % 5]); path.setAttribute('stroke-width', 2 + (i % 3) * .7); path.setAttribute('opacity', '.8');
    $('hair-strands').append(path);
  }
  $('comb-teeth').setAttribute('d', Array.from({length:20}, (_,i) => `M${i*7} 0V74`).join(''));
  $('brow-hairs').setAttribute('d', Array.from({length:27}, (_,i) => `M${145+i*8} ${225-36*Math.sin(i/26*Math.PI)}l${10+i*.17} ${-16+i*.28}`).join(''));
  $('brush-bristles').setAttribute('d', Array.from({length:18}, (_,i) => `M${-19+(i%3)*2} ${i*5}Q0 ${i*5-6} ${19-(i%3)*2} ${i*5}`).join(''));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const bounds = new WeakMap();
  const progress = new Float64Array(scenes.length);
  let frame = 0, pointerFrame = 0, pendingScene = null, pointerX = 0, pointerY = 0;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  function updateScroll() {
    frame = 0;
    const height = window.innerHeight;
    scenes.forEach((scene, i) => {
      const rect = scene.getBoundingClientRect(); bounds.set(scene, rect);
      progress[i] = reducedMotion.matches ? 1 : clamp((height - rect.top) / (height * .65 + Math.min(rect.height * .3, 230)));
    });
    scenes.forEach((scene, i) => scene.style.setProperty('--scroll', progress[i].toFixed(3)));
    if (!menu.hidden) positionMenu();
  }
  function scheduleScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
  const header = document.querySelector('.header');
  function syncHeaderHeight() {
    document.documentElement.style.setProperty('--header', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    scheduleScroll();
  }
  if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
  function flushPointer() {
    pointerFrame = 0;
    if (!pendingScene || reducedMotion.matches || !finePointer.matches) return;
    pendingScene.style.setProperty('--px', pointerX.toFixed(3)); pendingScene.style.setProperty('--py', pointerY.toFixed(3));
  }
  scenes.forEach(scene => {
    scene.addEventListener('pointerenter', () => bounds.set(scene, scene.getBoundingClientRect()));
    scene.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
      const rect = bounds.get(scene); if (!rect) return;
      pointerX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      pointerY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      pendingScene = scene; if (!pointerFrame) pointerFrame = requestAnimationFrame(flushPointer);
    });
    scene.addEventListener('pointerleave', () => { if (pendingScene === scene) pendingScene = null; scene.style.setProperty('--px','0'); scene.style.setProperty('--py','0'); });
  });
  const magnetic = document.querySelector('.magnetic-contact');
  function resetMagnet() { magnetic.style.setProperty('--mx','0px'); magnetic.style.setProperty('--my','0px'); }
  magnetic.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    const rect = magnetic.getBoundingClientRect();
    magnetic.style.setProperty('--mx', `${clamp((event.clientX-rect.left)/rect.width*2-1,-1,1)*5}px`);
    magnetic.style.setProperty('--my', `${clamp((event.clientY-rect.top)/rect.height*2-1,-1,1)*4}px`);
  });
  magnetic.addEventListener('pointerleave', resetMagnet); magnetic.addEventListener('focus', resetMagnet);
  reducedMotion.addEventListener('change', () => { scenes.forEach(scene => {scene.style.setProperty('--px','0');scene.style.setProperty('--py','0');});resetMagnet();scheduleScroll(); });
  finePointer.addEventListener('change', () => { resetMagnet();scenes.forEach(scene => {scene.style.setProperty('--px','0');scene.style.setProperty('--py','0');}); });
  window.addEventListener('scroll', scheduleScroll, {passive:true}); window.addEventListener('resize', syncHeaderHeight, {passive:true});
  window.addEventListener('load', syncHeaderHeight); window.addEventListener('pageshow', syncHeaderHeight); document.fonts.ready.then(syncHeaderHeight);

  const form = $('booking-form'), nameField = $('name'), phoneField = $('phone'), serviceField = $('service');
  const success = $('booking-success'), selectedPlan = $('selected-plan'), feedback = $('form-feedback');
  const trigger = $('service-trigger'), menu = $('service-listbox'), serviceValue = $('service-value');
  const options = [...menu.querySelectorAll('[role=option]')];
  let activeOption = 0, typeBuffer = '', typeStamp = 0, planAttached = false;
  function setError(field, message) {
    field.setAttribute('aria-invalid', String(Boolean(message)));
    $(field === trigger ? 'service-error' : `${field.id}-error`).textContent = message;
  }
  function clearAttachedPlan(resetService = false) {
    const attached = planAttached; planAttached = false; selectedPlan.textContent = ''; selectedPlan.hidden = true;
    if (resetService && attached) setService('');
  }
  function setService(value, userChoice = false) {
    const previousValue = serviceField.value;
    serviceField.value = options.some(option => option.dataset.value === value) ? value : '';
    serviceValue.textContent = serviceField.value || 'Выберите направление';
    options.forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === serviceField.value)));
    setError(trigger, '');
    if (userChoice) { if (previousValue !== serviceField.value) clearAttachedPlan(); feedback.textContent = ''; }
  }
  function positionMenu() {
    const rect = trigger.getBoundingClientRect();
    const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
    if (rect.top < headerBottom + 6 || rect.bottom > window.innerHeight - 6) {
      closeMenu(false);
      return false;
    }
    const availableBelow = window.innerHeight - rect.bottom - 12;
    const availableAbove = rect.top - Math.max(0, headerBottom) - 12;
    const above = availableBelow < 225 && availableAbove > availableBelow;
    const height = Math.min(230, Math.max(65, above ? availableAbove : availableBelow));
    const width = Math.min(rect.width, window.innerWidth - 24);
    menu.style.width = `${width}px`; menu.style.maxHeight = `${height}px`;
    menu.style.left = `${clamp(rect.left,12,window.innerWidth-width-12)}px`;
    menu.style.top = `${above ? rect.top-height-6 : rect.bottom+6}px`;
    return true;
  }
  function highlight(index, scroll = true) {
    activeOption = clamp(index, 0, options.length - 1);
    options.forEach((option, i) => option.classList.toggle('active', i === activeOption));
    trigger.setAttribute('aria-activedescendant', options[activeOption].id);
    if (scroll) {
      const option = options[activeOption];
      if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
    }
  }
  function openMenu() {
    menu.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    if (positionMenu()) highlight(Math.max(0, options.findIndex(option => option.dataset.value === serviceField.value)));
  }
  function closeMenu(commit = false, returnFocus = false) {
    if (commit && !menu.hidden) setService(options[activeOption].dataset.value, true);
    menu.hidden = true; trigger.setAttribute('aria-expanded','false'); trigger.removeAttribute('aria-activedescendant');
    typeBuffer = ''; if (returnFocus) trigger.focus({preventScroll:true});
  }
  trigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu(false));
  trigger.addEventListener('keydown', event => {
    const key = event.key;
    if (key === 'Escape') { if (!menu.hidden) {event.preventDefault();closeMenu(false);} return; }
    if (key === 'Tab') { closeMenu(!menu.hidden); return; }
    if (key === 'Enter' || key === ' ') { event.preventDefault(); if (menu.hidden) openMenu(); else closeMenu(true); return; }
    if (['ArrowDown','ArrowUp','Home','End'].includes(key)) {
      event.preventDefault(); const wasClosed = menu.hidden; if (wasClosed) openMenu();
      if (key === 'Home') highlight(0); else if (key === 'End') highlight(options.length-1);
      else if (!wasClosed) highlight(activeOption + (key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); const now = Date.now(); typeBuffer = now-typeStamp > 700 ? key.toLocaleLowerCase('ru') : typeBuffer + key.toLocaleLowerCase('ru'); typeStamp = now;
      if (menu.hidden) openMenu();
      const index = options.findIndex(option => option.dataset.value.toLocaleLowerCase('ru').startsWith(typeBuffer));
      if (index >= 0) highlight(index);
    }
  });
  options.forEach((option, i) => {
    option.addEventListener('pointerdown', event => { if (event.pointerType !== 'touch') event.preventDefault(); });
    option.addEventListener('click', () => {highlight(i,false);closeMenu(true,true);});
  });
  document.addEventListener('pointerdown', event => {if (!menu.hidden && !menu.contains(event.target) && !trigger.contains(event.target)) closeMenu(false);});
  document.addEventListener('focusin', event => {if (!menu.hidden && event.target !== trigger && !menu.contains(event.target)) closeMenu(false);});
  serviceField.addEventListener('change', () => setService(serviceField.value,true));

  function openBooking(service, summary = '') {
    closeMenu(); if (form.hidden) form.reset(); form.hidden = false; success.hidden = true;
    setError(nameField,'');setError(phoneField,'');feedback.textContent='';setService(service);
    planAttached = Boolean(summary); selectedPlan.textContent = summary ? `Ваш план: ${summary}` : ''; selectedPlan.hidden = !summary; scheduleScroll();
  }
  const serviceNames = {hair:'Hair',brows:'Regard',spa:'Slow'};
  const serviceButtons = [...document.querySelectorAll('.service-toggle')];
  serviceButtons.forEach((button, index) => button.addEventListener('click', () => {
    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    serviceButtons.forEach(other => {const open = other === button && !wasOpen;other.setAttribute('aria-expanded',String(open));other.closest('.service-item').classList.toggle('open',open);$(other.getAttribute('aria-controls')).hidden=!open;});
    document.querySelector('.service-art').dataset.view = button.dataset.service;
    document.querySelectorAll('.service-scene').forEach(scene => {const active=scene.dataset.serviceScene===button.dataset.service;scene.classList.toggle('active',active);scene.setAttribute('aria-hidden',String(!active));});
    $('service-word').textContent = serviceNames[button.dataset.service];document.querySelector('.service-art-index').textContent=`0${index+1} / 03`;scheduleScroll();
  }));
  document.querySelectorAll('[data-book-service]').forEach(link => link.addEventListener('click', () => openBooking(link.dataset.bookService)));
  const state = {occasion:null,budget:null,priority:null};
  const labels = {everyday:'На каждый день',event:'К событию',change:'Хочу перемен',short:'До часа',medium:'1–2 часа',long:'Без спешки',hair:'Образ',brows:'Детали образа',spa:'Уход'};
  const planCard = $('plan-card'), planResult = $('plan-result'), choiceStatus = $('choice-status');
  const fields = ['occasion','budget','priority'];
  const focusCopy = {
    hair:{everyday:'Начните с образа, который подходит вашему ежедневному ритму. Обсудите привычки и пожелания.',event:'Выберите настроение образа. Расскажите о событии и уточните подходящий формат визита.',change:'Определите одну главную перемену и то, что хочется сохранить. Обсудите с салоном возможные варианты.'},
    brows:{everyday:'Обсудите детали, которые впишутся в привычный образ и подчеркнут его характер.',event:'Выберите один акцент под настроение события. Сначала согласуйте желаемый эффект.',change:'Определите, чего хочется больше: мягкости, выразительности или естественности. Сравните идею с привычным образом.'},
    spa:{everyday:'Выберите один приоритет ухода: приятная пауза или конкретный запрос, который хочется обсудить с мастером.',event:'Обсудите привычный вам уход и желаемый результат к событию. Формат и дату процедуры согласуйте заранее.',change:'Начните с обсуждения привычного ухода и того, что хочется в нём изменить. Вместе с мастером выберите первый шаг.'}
  };
  const preparationCopy = {
    hair:{everyday:'Фото привычного образа и 2–3 примера желаемого настроения.',event:'Фото одежды и аксессуаров, которые планируете использовать. Сообщите дату и время события.',change:'2–3 референса. Отметьте, какие изменения вам нравятся, а какие точно не подходят.'},
    brows:{everyday:'Фото привычного образа и пример понравившихся деталей.',event:'Референс и дату события. Обсудите с мастером доступные варианты заранее.',change:'Один пример желаемого эффекта и один того, что не нравится. Расскажите о предыдущем опыте.'},
    spa:{everyday:'Короткий список пожеланий к уходу и любимые средства. Сообщите о чувствительности и известных реакциях.',event:'Дату события и названия привычных средств. Расскажите мастеру о предыдущем опыте ухода.',change:'Список нынешних средств и того, чего не хватает в уходе. Обсудите пожелания и чувствительность.'}
  };
  function getPlan() {
    const focus = focusCopy[state.priority][state.occasion];
    const time = state.budget === 'short'
      ? `У вас до часа: оставьте главным одно направление — ${labels[state.priority].toLocaleLowerCase('ru')}. Уточните у салона, какой формат действительно помещается в это окно.`
      : state.budget === 'medium'
        ? 'Сообщите салону, что располагаете 1–2 часами. Сначала подтвердите длительность главной услуги; дополнительные шаги добавляйте только после согласования.'
        : 'Можно спокойно обсудить консультацию и последовательность ухода. Попросите салон заранее назвать общую длительность и стоимость выбранного формата.';
    const preparation = preparationCopy[state.priority][state.occasion];
    const title = state.budget === 'short' ? 'Один точный акцент.' : state.occasion === 'event' ? 'Ваш особенный день.' : state.occasion === 'change' ? 'Место для перемен.' : 'В своём ритме.';
    return {focus,time,preparation,title};
  }
  function updatePreview() {
    const chosen = fields.filter(field => state[field]).length;
    $('plan-count').textContent = `${chosen} / 3`;planCard.style.setProperty('--chosen',chosen);
    fields.forEach(field => { $(`preview-${field}`).textContent = state[field] ? labels[state[field]] : field === 'budget' ? 'Ещё не выбрано' : 'Ещё не выбран'; });
    $('reset-plan').hidden = chosen === 0;
    choiceStatus.classList.remove('error');
    choiceStatus.textContent = chosen === 3 ? 'Все детали на месте. Составьте план и сохраните его в демоформе.' : `Выбрано ${chosen} из 3. ${state.occasion ? state.budget ? 'Осталось выбрать главный приоритет.' : 'Теперь определите время на визит.' : 'Начните с повода для визита.'}`;
  }
  function invalidatePlan() {
    planResult.hidden=true;planCard.classList.remove('complete');$('plan-title').textContent='Время для вас.';$('plan-description').textContent='Соберите желания в один понятный план.';
    ['result-focus','result-time','result-preparation'].forEach(id => {$(id).textContent='';});clearAttachedPlan(true);
  }
  document.querySelectorAll('.planner-controls input[type=radio]').forEach(input => input.addEventListener('change', () => {
    if (!input.checked || state[input.name] === input.value) return;
    state[input.name]=input.value;invalidatePlan();updatePreview();scheduleScroll();
  }));
  $('reveal-plan').addEventListener('click', () => {
    const missing = fields.find(field => !state[field]);
    if (missing) {choiceStatus.textContent='Выберите по одному варианту во всех трёх шагах — тогда план будет личным.';choiceStatus.classList.add('error');document.querySelector(`input[name="${missing}"]`).focus();return;}
    const plan=getPlan();$('plan-title').textContent=plan.title;$('plan-description').textContent=`${labels[state.priority]} — главный приоритет. Остальное подстроим под вас.`;
    $('result-focus').textContent=plan.focus;$('result-time').textContent=plan.time;$('result-preparation').textContent=plan.preparation;
    planResult.hidden=false;planCard.classList.add('complete');choiceStatus.classList.remove('error');choiceStatus.textContent='План готов: фокус, время и подготовка. Перенесите его в форму, чтобы обсудить детали.';
    planCard.focus({preventScroll:true});if(window.innerWidth<621)planCard.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});scheduleScroll();
  });
  $('reset-plan').addEventListener('click', () => {
    fields.forEach(field => {state[field]=null;});document.querySelectorAll('.planner-controls input[type=radio]').forEach(input=>{input.checked=false;});
    invalidatePlan();updatePreview();document.querySelector('input[name="occasion"]').focus();scheduleScroll();
  });
  $('use-plan').addEventListener('click', () => {
    if(planResult.hidden || fields.some(field=>!state[field]))return;
    const plan=getPlan();openBooking(labels[state.priority],`${labels[state.occasion]} · ${labels[state.budget]} · ${labels[state.priority]}. ${plan.focus} ${plan.time} Подготовка: ${plan.preparation}`);
  });

  [nameField,phoneField].forEach(field=>field.addEventListener('input',()=>{setError(field,'');feedback.textContent='';}));
  form.addEventListener('submit',event=>{
    event.preventDefault();closeMenu();
    const name=nameField.value.trim();const phone=phoneField.value.trim();const digits=phone.replace(/\D/g,'');
    const nameValid=(name.match(/\p{L}/gu)||[]).length>=2&&/^[\p{L}\p{M}\s'’\-]+$/u.test(name);
    const phoneValid=digits.length>=10&&digits.length<=15&&/^\+?[\d\s()\-]+$/.test(phone);
    const serviceValid=options.some(option=>option.dataset.value===serviceField.value);
    setError(nameField,nameValid?'':'Введите имя: минимум 2 буквы; допустимы пробелы, апостроф и дефис.');
    setError(phoneField,phoneValid?'':'Введите 10–15 цифр; знак + допустим только в начале.');
    setError(trigger,serviceValid?'':'Выберите направление, которое хотите обсудить.');
    if(!nameValid||!phoneValid||!serviceValid){feedback.textContent='Проверьте отмеченные поля.';(!nameValid?nameField:!phoneValid?phoneField:trigger).focus();return;}
    form.reset();setService('');clearAttachedPlan();feedback.textContent='';form.hidden=true;success.hidden=false;success.focus({preventScroll:true});
    success.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});scheduleScroll();
  });
  $('booking-reset').addEventListener('click',()=>{
    form.reset();setService('');clearAttachedPlan();form.hidden=false;success.hidden=true;setError(nameField,'');setError(phoneField,'');feedback.textContent='';nameField.focus();scheduleScroll();
  });
  window.addEventListener('pagehide',()=>{
    cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);frame=0;pointerFrame=0;pendingScene=null;closeMenu();form.reset();setService('');clearAttachedPlan();resetMagnet();
  });
  setService('');syncHeaderHeight();
})();
