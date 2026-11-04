(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = () => reduced.matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sections = Array.from(document.querySelectorAll('.motion-section'));
  const movingLine = document.querySelector('.moving-line');
  const flowSets = new Map();
  for (const section of sections) { const paths = Array.from(section.querySelectorAll('.studio-flow path, .flow-lines path')); if (paths.length) flowSets.set(section, paths); }
  function shapeFlow(section, progress, pointer = 0) {
    const paths = flowSets.get(section); if (!paths) return;
    const large = section.classList.contains('studio');
    for (let i = 0; i < paths.length; i++) {
      const shift = i * (large ? 21 : 13);
      const sweep = (1 - progress) * 135 + pointer * 42;
      paths[i].setAttribute('d', large ? `M-40 ${40 + shift}C${560 + sweep} ${-100 - sweep} ${70 - sweep} ${560 + sweep} 640 ${360 + shift}` : `M-30 ${45 + shift}C${150 + sweep * .45} ${108 - shift} ${300 - sweep * .4} ${8 + shift} 500 ${48 + shift}S${900 + sweep * .5} ${112 - shift} 1130 ${43 + shift}`);
    }
  }
  const magneticContact = document.querySelector('.header-contact');
  const magnet = { x: 0, y: 0, bounds: null };
  magneticContact.addEventListener('pointerenter', () => { magnet.bounds = magneticContact.getBoundingClientRect(); });
  magneticContact.addEventListener('pointermove', event => {
    if (isReduced() || !finePointer.matches || event.pointerType === 'touch' || !magnet.bounds) return;
    magnet.x = Math.max(-4.5, Math.min(4.5, ((event.clientX - magnet.bounds.left) / magnet.bounds.width - .5) * 9));
    magnet.y = Math.max(-4, Math.min(4, ((event.clientY - magnet.bounds.top) / magnet.bounds.height - .5) * 8));
    scheduleScroll();
  });
  magneticContact.addEventListener('pointerleave', () => { magnet.x = 0; magnet.y = 0; scheduleScroll(); });
  magneticContact.addEventListener('blur', () => { magnet.x = 0; magnet.y = 0; scheduleScroll(); });
  const motionState = new Map(sections.map(section => [section, { top: 0, height: 0, left: 0, width: 0, x: 0, y: 0, progress: -1, pointerDirty: true }]));
  let frame = 0;
  let measureNeeded = true;
  let pageActive = true;
  function updateScroll() {
    frame = 0;
    if (!pageActive || document.hidden) return;
    const height = window.innerHeight;
    const scroll = window.scrollY;
    if (measureNeeded) {
      // Read every box before changing styles; scroll-only frames reuse these metrics.
      for (const section of sections) {
        const box = section.getBoundingClientRect();
        const item = motionState.get(section);
        item.top = box.top + scroll; item.height = box.height; item.left = box.left; item.width = box.width;
      }
      measureNeeded = false;
    }
    const off = isReduced();
    for (const section of sections) {
      const item = motionState.get(section);
      const top = item.top - scroll;
      if (!off && (top > height + 100 || top + item.height < -100)) continue;
      const progress = off ? 1 : Math.max(0, Math.min(1, (height - top) / (height * .85)));
      const progressChanged = Math.abs(progress - item.progress) > .0001;
      if (progressChanged) {
        section.style.setProperty('--progress', progress.toFixed(4));
        section.dataset.progress = progress.toFixed(4);
      }
      if (item.pointerDirty) {
        section.style.setProperty('--mx', off ? 0 : item.x.toFixed(3));
        section.style.setProperty('--my', off ? 0 : item.y.toFixed(3));
      }
      if (progressChanged || item.pointerDirty) shapeFlow(section, progress, off ? 0 : item.x);
      item.progress = progress; item.pointerDirty = false;
    }
    movingLine.style.setProperty('--line-progress', off ? 0 : Math.min(3, scroll / 1200));
    magneticContact.style.setProperty('--magnet-x', off ? '0px' : magnet.x.toFixed(2) + 'px');
    magneticContact.style.setProperty('--magnet-y', off ? '0px' : magnet.y.toFixed(2) + 'px');
  }
  function scheduleScroll() { if (pageActive && !document.hidden && !frame) frame = requestAnimationFrame(updateScroll); }
  function scheduleMeasure() { measureNeeded = true; scheduleScroll(); }
  function resetPointers() {
    for (const item of motionState.values()) { item.x = 0; item.y = 0; item.pointerDirty = true; }
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('load', scheduleMeasure);
  if (document.fonts) document.fonts.ready.then(scheduleMeasure);
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(scheduleMeasure) : null;
  if (resizeObserver) sections.forEach(section => resizeObserver.observe(section));
  for (const section of document.querySelectorAll('[data-pointer]')) {
    const item = motionState.get(section);
    if (!item) continue;
    section.addEventListener('pointerenter', scheduleMeasure);
    section.addEventListener('pointermove', event => {
      if (isReduced() || !finePointer.matches || event.pointerType === 'touch' || !item.width || !item.height) return;
      item.x = Math.max(-1, Math.min(1, (event.clientX - item.left) / item.width * 2 - 1));
      item.y = Math.max(-1, Math.min(1, (event.clientY - (item.top - window.scrollY)) / item.height * 2 - 1));
      item.pointerDirty = true; scheduleScroll();
    });
    section.addEventListener('pointerleave', () => { item.x = 0; item.y = 0; item.pointerDirty = true; scheduleScroll(); });
  }
  finePointer.addEventListener('change', () => { resetPointers(); scheduleScroll(); });
  function reflectMotion() {
    document.body.classList.toggle('motion-reduced', isReduced());
    document.documentElement.style.scrollBehavior = isReduced() ? 'auto' : '';
    magnet.x = 0; magnet.y = 0;
    resetPointers(); scheduleScroll();
  }
  reduced.addEventListener('change', reflectMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (frame) cancelAnimationFrame(frame); frame = 0; } else scheduleMeasure(); });
  window.addEventListener('pagehide', () => { pageActive = false; if (frame) cancelAnimationFrame(frame); frame = 0; resizeObserver?.disconnect(); });
  window.addEventListener('pageshow', () => { pageActive = true; if (resizeObserver) sections.forEach(section => resizeObserver.observe(section)); scheduleMeasure(); });
  reflectMotion();

  const directionData = {
    shape: { title: 'Найти свою линию', copy: 'Сохранить длину или открыть шею. Добавить лёгкие слои или выбрать выразительный срез. Начните с формы, которая подходит вашему ритму.', label: 'Чёткая линия. Мягкое движение.' },
    color: { title: 'Сменить настроение', copy: 'Мягкий блик, тёплый медный или глубокий тёмный. Покажите мастеру любимый оттенок: возможность перехода зависит от состояния и истории ваших волос.', label: 'Тёплый медный. Новое настроение.' },
    texture: { title: 'Позволить движение', copy: 'Гладкое полотно, лёгкая волна или выразительные завитки. Соберите референсы любимой текстуры и расскажите, сколько времени вы готовы уделять укладке.', label: 'Свободный объём. Живая текстура.' }
  };
  const tabs = Array.from(document.querySelectorAll('[data-direction]'));
  const horizontalTabs = window.matchMedia('(min-width: 391px) and (max-width: 1050px)');
  const reflectTabOrientation = () => document.querySelector('.direction-list').setAttribute('aria-orientation', horizontalTabs.matches ? 'horizontal' : 'vertical');
  horizontalTabs.addEventListener('change', reflectTabOrientation);
  reflectTabOrientation();
  function setDirection(button) {
    const data = directionData[button.dataset.direction];
    for (const tab of tabs) { const current = tab === button; tab.classList.toggle('active', current); tab.setAttribute('aria-selected', String(current)); tab.tabIndex = current ? 0 : -1; }
    document.getElementById('direction-title').textContent = data.title;
    document.getElementById('direction-copy').textContent = data.copy;
    document.getElementById('direction-label').textContent = data.label;
    document.querySelector('.direction-visual').dataset.scene = button.dataset.direction;
    for (const scene of document.querySelectorAll('.direction-scene')) scene.hidden = !scene.classList.contains('scene-' + button.dataset.direction);
    document.getElementById('direction-panel').setAttribute('aria-labelledby', button.id);
    scheduleMeasure();
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => setDirection(button));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); setDirection(tabs[next]); tabs[next].focus();
    });
  });

  const lab = document.querySelector('.lab-preview');
  const state = { length: 'medium', texture: 'wave', tone: 'dark' };
  const labels = { length: { short: 'Короткая длина', medium: 'Средняя длина', long: 'Длинные волосы' }, texture: { sleek: 'Гладкость', wave: 'Волна', volume: 'Объём' }, tone: { cool: 'Холодный', warm: 'Тёплый', dark: 'Тёмный' } };
  const palettes = { dark: ['#29272c', '#746d70', '#302c33'], warm: ['#713b25', '#cb8355', '#8e4427'], cool: ['#7e7872', '#ded4bf', '#9c9183'] };
  function hairEdge(x0, y0, x1, y1, amplitude, cycles, reverse = false, bow = 0) {
    const k = Math.PI * 2 * cycles, steps = 16;
    const point = t => ({ x: x0 + (x1 - x0) * t + amplitude * Math.sin(k * t) * Math.sin(Math.PI * t) + bow * Math.sin(Math.PI * t), y: y0 + (y1 - y0) * t });
    const slope = t => ({ x: x1 - x0 + amplitude * (k * Math.cos(k * t) * Math.sin(Math.PI * t) + Math.PI * Math.sin(k * t) * Math.cos(Math.PI * t)) + bow * Math.PI * Math.cos(Math.PI * t), y: y1 - y0 });
    const n = value => Math.round(value * 100) / 100;
    let d = '';
    for (let i = 0; i < steps; i++) {
      const a = reverse ? 1 - i / steps : i / steps, b = reverse ? 1 - (i + 1) / steps : (i + 1) / steps;
      const pa = point(a), pb = point(b), sa = slope(a), sb = slope(b), dt = (b - a) / 3;
      d += `C${n(pa.x + sa.x * dt)} ${n(pa.y + sa.y * dt)} ${n(pb.x - sb.x * dt)} ${n(pb.y - sb.y * dt)} ${n(pb.x)} ${n(pb.y)}`;
    }
    return d;
  }
  function hairGeometry(length, texture) {
    const end = { short: 318, medium: 393, long: 473 }[length];
    const amplitude = { sleek: 0, wave: 12, volume: 23 }[texture];
    const cycles = { short: 1, medium: 1.35, long: 1.8 }[length];
    const spread = texture === 'volume' ? 15 : texture === 'wave' ? 5 : 0;
    const leftEnd = 103 - spread, rightEnd = 299 + spread;
    const back = `M111 179C${105 - spread} 108 141 ${77 - spread * .2} 201 78C267 77 ${298 + spread} 119 288 184${hairEdge(288,184,rightEnd,end-15,-amplitude*.65,cycles,false,spread)}Q250 ${end+18} 201 ${end-5}Q151 ${end+18} ${leftEnd} ${end-15}${hairEdge(111,179,leftEnd,end-15,amplitude*.65,cycles,true,-spread)}Z`;
    const frontLeft = `M112 176C111 104 158 77 207 78Q240 77 259 101C219 106 198 128 163 144Q146 164 145 206${hairEdge(145,206,137,end-7,amplitude*.72,cycles,false,-5)}Q120 ${end+6} ${leftEnd} ${end-3}${hairEdge(112,176,leftEnd,end-3,amplitude,cycles,true,-spread*.5)}Z`;
    const frontRight = `M252 98C291 124 295 154 286 198${hairEdge(286,198,rightEnd,end-8,-amplitude,cycles,false,spread*.5)}Q283 ${end+5} 267 ${end+2}${hairEdge(259,230,267,end+2,-amplitude*.72,cycles,true,5)}C270 173 263 132 232 113Z`;
    return { paths: [back, frontLeft, frontRight], end, amplitude, cycles, spread };
  }
  function drawStrands(geometry, texture) {
    let lines = '';
    const {end, amplitude, cycles, spread} = geometry;
    for (let i = 0; i < 18; i++) {
      const x = 112 + i * 1.6, y = 183 + i * .8;
      const r = 262 + i * 1.6, ry = 185 + i * 1.1;
      const weight = i % 4 === 0 ? 1.5 : .7;
      lines += `<path stroke-width="${weight}" d="M${x} ${y}${hairEdge(x,y,x-spread*.4-1,end-12,amplitude*.85,cycles,false,-spread*.22)}"/>`;
      lines += `<path stroke-width="${weight}" d="M${r} ${ry}${hairEdge(r,ry,r+spread*.4+2,end-12,-amplitude*.85,cycles,false,spread*.22)}"/>`;
    }
    for (let i = 0; i < 12; i++) lines += `<path d="M${119 + i * 1.7} ${170 - i * 2}C${120 + i * 2} ${117 - i} ${169 + i * 2} ${92 + i} ${237 - i * 1.3} ${99 + i * 1.7}"/>`;
    const group = document.querySelector('.hair-strands');
    group.innerHTML = lines;
    group.setAttribute('stroke', { dark: '#c6aa9d', warm: '#f1c093', cool: '#fff0d6' }[state.tone]);
    group.setAttribute('stroke-opacity', texture === 'volume' ? '.42' : texture === 'wave' ? '.34' : '.25');
    group.style.opacity = '.85';
  }
  let savedLook = '';
  const selectedLook = document.getElementById('selected-look');
  const bookingInterest = document.getElementById('booking-interest');
  let syncInterest = () => {};
  function setInterestValue(value) { bookingInterest.value = value; syncInterest(); }
  function clearAttachedLook(resetInterest = false) {
    selectedLook.hidden = true; selectedLook.textContent = '';
    if (resetInterest && bookingInterest.value === 'Образ из конструктора') setInterestValue('');
  }
  function updateLook() {
    savedLook = '';
    clearAttachedLook(true);
    lab.dataset.length = state.length; lab.dataset.texture = state.texture; lab.dataset.tone = state.tone;
    const geometry = hairGeometry(state.length, state.texture);
    const paths = geometry.paths;
    ['.hair-back', '.hair-front-left', '.hair-front-right'].forEach((selector, i) => { const el = document.querySelector(selector); el.setAttribute('d', paths[i]); });
    const stops = palettes[state.tone];
    ['.tone-start', '.tone-mid', '.tone-end'].forEach((selector, i) => document.querySelector(selector).setAttribute('stop-color', stops[i]));
    drawStrands(geometry, state.texture);
    document.getElementById('preview-caption').textContent = [labels.length[state.length], labels.texture[state.texture], labels.tone[state.tone]].join(' / ');
    document.getElementById('look-result').hidden = true;
    document.querySelector('.hair-model').setAttribute('aria-label', 'Эскиз: ' + document.getElementById('preview-caption').textContent);
    scheduleMeasure();
  }
  for (const input of document.querySelectorAll('.lab-controls input[type=radio]')) input.addEventListener('change', () => { state[input.name] = input.value; updateLook(); });
  document.getElementById('create-look').addEventListener('click', () => {
    const titles = { sleek: 'Спокойная геометрия', wave: 'Мягкое движение', volume: 'Свободный характер' };
    const lengthCopy = { short: 'Выразительный короткий силуэт', medium: 'Гибкая средняя длина', long: 'Длинная линия волос' };
    const textureCopy = { sleek: 'с гладкой текстурой', wave: 'с мягкой волной', volume: 'с заметным объёмом' };
    savedLook = [labels.length[state.length], labels.texture[state.texture], labels.tone[state.tone]].join(' / ');
    document.getElementById('look-title').textContent = titles[state.texture];
    document.getElementById('look-description').textContent = `${lengthCopy[state.length]} ${textureCopy[state.texture]}. Направление оттенка — ${labels.tone[state.tone].toLowerCase()}. Обсудите с мастером форму, текущую базу цвета и привычную укладку.`;
    document.getElementById('look-result').hidden = false;
    scheduleMeasure();
  });
  document.getElementById('reset-look').addEventListener('click', () => {
    state.length = 'medium'; state.texture = 'wave'; state.tone = 'dark'; savedLook = '';
    for (const [name, value] of Object.entries(state)) document.querySelector(`input[name="${name}"][value="${value}"]`).checked = true;
    clearAttachedLook(true);
    updateLook();
  });
  document.getElementById('use-look').addEventListener('click', () => {
    if (!savedLook) return;
    setInterestValue('Образ из конструктора');
    selectedLook.textContent = 'Ваш образ: ' + savedLook; selectedLook.hidden = false;
    showError(bookingInterest, '');
    const form = document.getElementById('booking-form'); form.hidden = false; document.getElementById('form-success').hidden = true;
    scheduleMeasure();
  });

  const form = document.getElementById('booking-form');
  const success = document.getElementById('form-success');
  const fields = [document.getElementById('booking-name'), document.getElementById('booking-phone'), document.getElementById('booking-interest')];
  function showError(field, message) { field.setAttribute('aria-invalid', String(!!message)); if (field === bookingInterest) document.getElementById('booking-interest-trigger').setAttribute('aria-invalid', String(!!message)); const id = field.name === 'interest' ? 'interest-error' : `${field.name}-error`; document.getElementById(id).textContent = message; }
  const combo = document.getElementById('booking-interest-trigger');
  const comboValue = document.getElementById('booking-interest-value');
  const menu = document.getElementById('booking-interest-list');
  document.body.append(menu);
  const choices = Array.from(bookingInterest.options).slice(1);
  let activeChoice = 0, menuOpen = false, searchText = '', searchTimer = 0;
  const optionNodes = choices.map((option, index) => {
    const node = document.createElement('div'); node.id = 'interest-option-' + index; node.className = 'select-option'; node.setAttribute('role', 'option'); node.textContent = option.textContent; node.dataset.value = option.value;
    node.addEventListener('pointerdown', event => event.preventDefault());
    node.addEventListener('pointermove', () => { activeChoice = index; highlightChoice(false); });
    node.addEventListener('click', () => commitChoice(index, true));
    menu.append(node); return node;
  });
  function positionMenu() {
    if (!menuOpen) return;
    const box = combo.getBoundingClientRect();
    const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom + 10;
    const gap = 7, naturalHeight = Math.min(300, optionNodes.length * 50 + 14);
    const below = innerHeight - box.bottom - 14;
    const above = box.top - headerBottom - gap;
    const opensUp = below < naturalHeight && above > below;
    const available = Math.max(80, opensUp ? above : below);
    const height = Math.min(naturalHeight, available);
    menu.style.width = Math.min(box.width, innerWidth - 24) + 'px';
    menu.style.maxHeight = height + 'px';
    menu.style.left = Math.max(12, Math.min(box.left, innerWidth - box.width - 12)) + 'px';
    const renderedHeight = menu.getBoundingClientRect().height;
    menu.style.top = (opensUp ? Math.max(headerBottom, box.top - renderedHeight - gap) : Math.max(headerBottom, box.bottom + gap)) + 'px';
  }
  function highlightChoice(scrollOption = true) {
    optionNodes.forEach((node,index) => node.classList.toggle('is-active', index === activeChoice));
    if (menuOpen) combo.setAttribute('aria-activedescendant', optionNodes[activeChoice].id);
    if (scrollOption) {
      const node = optionNodes[activeChoice];
      if (node.offsetTop < menu.scrollTop) menu.scrollTop = node.offsetTop;
      else if (node.offsetTop + node.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = node.offsetTop + node.offsetHeight - menu.clientHeight;
    }
  }
  syncInterest = () => {
    comboValue.textContent = bookingInterest.value || 'Выберите направление';
    combo.classList.toggle('is-placeholder', !bookingInterest.value);
    optionNodes.forEach(node => node.setAttribute('aria-selected', String(node.dataset.value === bookingInterest.value)));
  };
  function openMenu() {
    if (menuOpen) return;
    menuOpen = true; menu.hidden = false; combo.setAttribute('aria-expanded','true');
    activeChoice = Math.max(0, choices.findIndex(option => option.value === bookingInterest.value));
    positionMenu(); highlightChoice();
  }
  function closeMenu(returnFocus = false) {
    menuOpen = false; menu.hidden = true; combo.setAttribute('aria-expanded','false'); combo.removeAttribute('aria-activedescendant'); searchText = ''; clearTimeout(searchTimer);
    if (returnFocus) combo.focus({preventScroll:true});
  }
  function commitChoice(index, returnFocus = false) {
    setInterestValue(choices[index].value);
    bookingInterest.dispatchEvent(new Event('change', {bubbles:true}));
    closeMenu(returnFocus);
  }
  combo.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  combo.addEventListener('keydown', event => {
    const key = event.key;
    if (key === 'Escape') { if (menuOpen) { event.preventDefault(); closeMenu(true); } return; }
    if (key === 'Tab') { if (menuOpen) commitChoice(activeChoice); return; }
    if (key === 'Enter' || key === ' ') { event.preventDefault(); if (menuOpen) commitChoice(activeChoice, true); else openMenu(); return; }
    if (['ArrowDown','ArrowUp','Home','End'].includes(key)) {
      event.preventDefault();
      if (!menuOpen) { openMenu(); if (key === 'Home') activeChoice = 0; if (key === 'End') activeChoice = choices.length - 1; }
      else if (key === 'Home') activeChoice = 0;
      else if (key === 'End') activeChoice = choices.length - 1;
      else activeChoice = Math.max(0, Math.min(choices.length - 1, activeChoice + (key === 'ArrowDown' ? 1 : -1)));
      highlightChoice(); return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); if (!menuOpen) openMenu(); searchText += key.toLocaleLowerCase('ru');
      const match = choices.findIndex(option => option.textContent.toLocaleLowerCase('ru').startsWith(searchText));
      if (match >= 0) { activeChoice = match; highlightChoice(); }
      clearTimeout(searchTimer); searchTimer = setTimeout(() => {searchText='';}, 650);
    }
  });
  document.addEventListener('pointerdown', event => { if (menuOpen && !combo.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
  combo.addEventListener('blur', () => { if (menuOpen) closeMenu(); });
  window.addEventListener('scroll', () => { if (menuOpen) closeMenu(); }, {passive:true});
  window.addEventListener('resize', () => { if (menuOpen) closeMenu(); }, {passive:true});
  syncInterest();
  for (const field of fields) field.addEventListener('input', () => showError(field, ''));
  bookingInterest.addEventListener('change', () => {
    syncInterest();
    showError(bookingInterest, '');
    if (bookingInterest.value === 'Образ из конструктора' && savedLook) {
      selectedLook.textContent = 'Ваш образ: ' + savedLook; selectedLook.hidden = false;
    } else clearAttachedLook();
    scheduleMeasure();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = fields[0].value.trim(); const phone = fields[1].value.trim(); const digits = phone.replace(/\D/g, '');
    const errors = [name.replace(/[^\p{L}]/gu, '').length < 2 || !/^[\p{L}\s.'’\-]+$/u.test(name) ? 'Введите имя: хотя бы две буквы, без цифр.' : '', !/^\+?[\d\s()\-]+$/.test(phone) || digits.length < 10 || digits.length > 15 ? 'Введите телефон: 10–15 цифр, без букв.' : '', !fields[2].value ? 'Выберите направление.' : ''];
    errors.forEach((message, index) => showError(fields[index], message));
    const first = errors.findIndex(Boolean); if (first >= 0) { document.getElementById('form-status').textContent = 'Проверьте поля: ' + errors.filter(Boolean).join(' '); scheduleMeasure(); (first === 2 ? document.getElementById('booking-interest-trigger') : fields[first]).focus(); return; }
    form.reset(); syncInterest(); clearAttachedLook(); document.getElementById('form-status').textContent = '';
    for (const field of fields) showError(field, '');
    form.hidden = true; success.hidden = false; success.focus({ preventScroll: true }); scheduleMeasure();
  });
  updateLook();
  document.getElementById('form-reset').addEventListener('click', () => { form.reset(); syncInterest(); clearAttachedLook(); document.getElementById('form-status').textContent = ''; for (const field of fields) showError(field, ''); form.hidden = false; success.hidden = true; fields[0].focus({ preventScroll: true }); scheduleMeasure(); });
  function clearDemoForNavigation() {
    form.reset();
    syncInterest();
    clearAttachedLook();
    closeMenu();
    for (const field of fields) showError(field, '');
    document.getElementById('form-status').textContent = '';
    form.hidden = false;
    success.hidden = true;
  }
  // Register after form/combobox bindings exist. A restored BFCache page starts clean.
  window.addEventListener('pagehide', clearDemoForNavigation);
  window.addEventListener('pageshow', event => { if (event.persisted) { clearDemoForNavigation(); scheduleMeasure(); } });
})();
