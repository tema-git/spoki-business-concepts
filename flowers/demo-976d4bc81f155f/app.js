(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const roseMarkup = '<svg class="rose-icon" viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="#863d58" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><g class="rose-outer"><path d="M35 53C25 40 30 24 46 24C51 13 68 13 77 24C92 23 100 40 90 53C79 52 68 45 60 39C50 46 42 50 35 53Z" fill="#f8dce4"/><path d="M38 43C23 38 14 50 18 64C15 79 28 91 43 88C46 74 50 62 59 54C51 47 45 44 38 43Z" fill="#f4cbd8"/><path d="M79 42C94 37 105 50 101 64C105 80 92 92 77 88C74 74 68 62 59 54C66 47 72 44 79 42Z" fill="#f7d4df"/><path d="M32 73C28 88 42 101 57 96C72 103 89 91 88 76C75 75 65 67 59 58C50 66 42 71 32 73Z" fill="#efb8ca"/></g><g class="rose-middle"><path d="M37 54C38 40 52 35 63 42C77 36 88 49 81 63C71 69 61 71 52 65C45 63 40 59 37 54Z" fill="#f6cbd7"/><path d="M41 64C40 77 54 85 66 78C80 79 87 65 80 55C68 54 55 58 41 64Z" fill="#eaa7bd"/></g><path class="rose-heart" d="M49 55C50 46 63 43 70 50C77 57 71 68 63 69C54 70 46 64 49 55Z" fill="#cb6b8b"/><path d="M52 55C55 48 65 49 68 55C72 62 62 66 57 60C54 56 59 53 63 56" fill="none" stroke="#fff0f4" stroke-width="2.2"/></svg>';
  const moods = {
    soft: { title: 'Тихое утро', feeling: 'Нежное', colors: ['#f4c5d2','#ba8baf','#e8d6b1','#f7e8e2'], core: '#8d4c66' },
    bold: { title: 'Смелый жест', feeling: 'Смелое', colors: ['#d94731','#f47854','#a92c55','#f4bd86'], core: '#592448' },
    wild: { title: 'Летний ветер', feeling: 'Свободное', colors: ['#f8d749','#c9a9d9','#f9efe1','#a4bf7b'], core: '#6a5b25' }
  };
  const sizeNames = ['Камерный', 'Выразительный', 'Большой жест'];
  const form = document.querySelector('#bouquet-form');
  const sizeInput = document.querySelector('#bouquet-size');
  const messageInput = document.querySelector('#card-message');
  const preview = document.querySelector('#bouquet-preview');
  let summary = '';

  function flower(x, y, r, color, core, turn) {
    let petals = '';
    for (let i = 0; i < 10; i++) {
      petals += `<ellipse cx="0" cy="${-r*.6}" rx="${r*.26}" ry="${r*.63}" transform="rotate(${i*36})" fill="${color}" stroke="#3b1733" stroke-opacity=".12" stroke-width=".9"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${turn})">${petals}<circle r="${r*.28}" fill="${core}"/><g fill="#fff4d2"><circle cx="-3" cy="-3" r="1.2"/><circle cx="4" cy="-2" r="1.2"/><circle cx="0" cy="4" r="1.2"/></g></g>`;
  }
  function bouquet(moodKey, size) {
    const mood = moods[moodKey];
    const positions = [[100,190,37],[180,125,48],[257,183,39],[136,258,42],[231,266,40],[72,277,30],[286,295,31],[99,101,27],[278,98,29]];
    const count = [5,7,9][size-1];
    let stems = '', heads = '';
    for (let i = 0; i < count; i++) {
      const [x,y,r] = positions[i];
      stems += `<path d="M180 400 Q${180+(x-180)*.4} ${y+90} ${x} ${y}" stroke="#557341" stroke-width="3" fill="none"/><path d="M${(180+x)/2} ${(400+y)/2} q-39 -42 -42 -14 q4 29 42 14" fill="#859f64"/><path d="M${(180+x)/2} ${(400+y)/2-22} q40 -43 41 -14 q-4 29 -41 14" fill="#5e784b"/>`;
      heads += flower(x,y,r,mood.colors[i%mood.colors.length],mood.core,(i*19)-12);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 460" aria-hidden="true"><ellipse cx="180" cy="434" rx="87" ry="10" fill="#3b1733" opacity=".08"/>${stems}<path d="M118 336 Q180 351 242 336 L223 424 Q180 441 137 424Z" fill="#e6d9c4" stroke="#746344" stroke-opacity=".22"/><path d="M180 348 L176 434M137 350l16 79M225 348l-17 82" stroke="#746344" stroke-opacity=".18" fill="none"/>${heads}<path d="M139 377q42 14 82 0l-4 15q-39 13-74 0z" fill="#3b1733"/><path d="M180 389q-56-37-43-8q8 19 43 8q57-38 43-8q-9 19-43 8" fill="none" stroke="#f7b7ca" stroke-width="5"/><path d="m180 390-11 35m12-35 15 28" stroke="#f7b7ca" stroke-width="5" fill="none"/></svg>`;
  }
  function getState() {
    return { mood: form.elements.mood.value, size: Number(sizeInput.value), message: messageInput.value.trim() };
  }
  function updatePreview(animate = false) {
    const state = getState();
    const mood = moods[state.mood];
    preview.innerHTML = bouquet(state.mood, state.size);
    preview.setAttribute('aria-label', `${mood.feeling} настроение, ${sizeNames[state.size-1].toLowerCase()} букет. Концептуальная иллюстрация.`);
    document.querySelector('#bouquet-caption').textContent = `${mood.title} / ${sizeNames[state.size-1].toLowerCase()}`;
    document.querySelector('#size-label').value = sizeNames[state.size-1];
    document.querySelector('#message-count').textContent = messageInput.value.length;
    if (animate && !reducedMotion.matches && preview.animate) preview.animate([{transform:'translateY(6px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:230,easing:'ease-out'});
  }
  try {
    const saved = JSON.parse(localStorage.getItem('demo-976d4bc81f155f-idea-v1'));
    if (saved && moods[saved.mood] && [1,2,3].includes(saved.size)) {
      form.elements.mood.value = saved.mood; sizeInput.value = saved.size;
      if (typeof saved.message === 'string') messageInput.value = saved.message.slice(0,120);
    }
  } catch (_) { /* Browser storage is optional. */ }
  updatePreview();
  document.querySelectorAll('[data-mini-bouquet]').forEach(el => el.innerHTML = bouquet(el.dataset.miniBouquet,2));

  const gardenFlowers = [
    { name: 'Протея', color: '#ce647f', core: '#6f2d51', kind: 'protea' },
    { name: 'Ромашка', color: '#fffaf4', core: '#bd6d16', kind: 'daisy' },
    { name: 'Тюльпан', color: '#ee7151', core: '#70284a', kind: 'tulip' },
    { name: 'Василёк', color: '#8a75c6', core: '#40235d', kind: 'cornflower' },
    { name: 'Мак', color: '#c7494b', core: '#3b1733', kind: 'poppy' },
    { name: 'Георгин', color: '#e5ad39', core: '#7f4a24', kind: 'dahlia' }
  ];
  function gardenFlower(type) {
    const f = gardenFlowers[type];
    let head = '';
    if (f.kind === 'protea') {
      for (let i = 0; i < 13; i++) {
        const angle = -73 + i * 12;
        head += `<path d="M0 20 Q-16-8 0-48 Q16-8 0 20" transform="rotate(${angle})" fill="${i%2?'#e7a6b5':f.color}" stroke="#8a3753" stroke-width="1"/>`;
      }
      head += '<ellipse cy="-9" rx="16" ry="27" fill="#f5d8be"/><path d="M-10-21v25M-5-29V9M1-31V12M7-27V7M12-18V0" stroke="#9a6c77" stroke-width="2"/>';
    } else if (f.kind === 'tulip') {
      head = `<path d="M-32-29Q-27 46 0 33Q29 43 33-29L12-17L0-40L-13-16Z" fill="${f.color}" stroke="#a74035" stroke-width="1.5"/><path d="M-13-15Q-7 8 0 33Q10 13 12-16" fill="none" stroke="#a74035" stroke-width="1.5"/>`;
    } else if (f.kind === 'poppy') {
      for (let i = 0; i < 5; i++) head += `<ellipse cx="0" cy="-18" rx="23" ry="28" transform="rotate(${i*72})" fill="${f.color}" stroke="#a93249" stroke-width="1.5"/>`;
      head += `<circle r="12" fill="${f.core}"/><circle r="5" fill="#e8b885"/>`;
    } else if (f.kind === 'cornflower') {
      for (let i = 0; i < 10; i++) head += `<path d="M-8-14L-13-36L-5-31L0-46L5-31L13-36L8-14Z" transform="rotate(${i*36})" fill="${f.color}" stroke="#6853aa" stroke-width="1"/>`;
      head += `<circle r="15" fill="${f.core}"/><circle r="7" fill="#b6a4df"/>`;
    } else if (f.kind === 'dahlia') {
      for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 12; i++) head += `<ellipse cy="${-29+ring*8}" rx="${7-ring}" ry="${20-ring*4}" transform="rotate(${i*30+ring*15})" fill="${['#e8b645','#f1ca62','#d4972c'][ring]}" stroke="#b57b27" stroke-width=".8"/>`;
      head += `<circle r="7" fill="${f.core}"/>`;
    } else {
      for (let i = 0; i < 12; i++) head += `<ellipse cy="-26" rx="8" ry="22" transform="rotate(${i*30})" fill="${f.color}" stroke="#d7c5be" stroke-width="1"/>`;
      head += `<circle r="14" fill="${f.core}"/><circle r="9" fill="#e9ba48"/>`;
    }
    return `<svg viewBox="0 0 120 145" aria-hidden="true"><path d="M60 135Q55 100 60 60" fill="none" stroke="#5f7445" stroke-width="3"/><path d="M58 114Q24 112 25 90Q52 91 58 114M60 99Q87 96 90 77Q64 76 60 99" fill="#7b9453"/><g transform="translate(60 53)">${head}</g></svg>`;
  }
  document.querySelector('.garden-sprig').innerHTML = gardenFlower(0) + gardenFlower(1);
  const gardenBoard = document.querySelector('#garden-board');
  const gardenStatus = document.querySelector('#garden-status');
  const gardenResult = document.querySelector('#garden-result');
  let deck = [], opened = [], found = 0, turns = 0, mismatchTimer = null;
  function resetGarden(announce = true) {
    clearTimeout(mismatchTimer); mismatchTimer = null;
    deck = [...gardenFlowers.keys(), ...gardenFlowers.keys()];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    opened = []; found = 0; turns = 0;
    document.querySelector('#garden-pairs').textContent = '0';
    document.querySelector('#garden-turns').textContent = '0';
    gardenResult.hidden = true;
    gardenBoard.classList.remove('is-complete');
    gardenBoard.innerHTML = deck.map((type, index) => `<button class="garden-card" type="button" data-card="${index}" aria-label="Карточка ${index+1}, закрыта" aria-pressed="false"><span class="card-cover" aria-hidden="true">${roseMarkup}<span>\u0426\u0432\u0435\u0442\u043e\u0447\u043d\u0438\u0446\u0430 \u041c\u0430\u0440\u0438</span></span><span class="card-flower" aria-hidden="true">${gardenFlower(type)}<span>${gardenFlowers[type].name}</span></span><span class="card-found" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg></span></button>`).join('');
    gardenStatus.textContent = announce ? 'Новый сад. Карточки перемешаны — найдите все шесть пар.' : 'Откройте любые две карточки. Цветы ждут встречи.';
  }
  gardenBoard.addEventListener('click', event => {
    const card = event.target.closest('[data-card]');
    if (!card || card.getAttribute('aria-disabled') === 'true' || opened.length === 2 || opened.includes(card)) return;
    const index = Number(card.dataset.card);
    card.classList.add('is-revealed');
    card.setAttribute('aria-label', `Карточка ${index+1}: ${gardenFlowers[deck[index]].name}`);
    card.setAttribute('aria-pressed', 'true');
    opened.push(card);
    if (opened.length === 1) {
      gardenStatus.textContent = `${gardenFlowers[deck[index]].name}. Теперь найдите для этого цветка пару.`;
      return;
    }
    turns++;
    document.querySelector('#garden-turns').textContent = turns;
    if (deck[Number(opened[0].dataset.card)] === deck[index]) {
      found++;
      for (const match of opened) {
        match.classList.add('is-matched');
        match.setAttribute('aria-disabled', 'true');
        match.setAttribute('aria-label', `${gardenFlowers[deck[index]].name}, пара найдена`);
      }
      opened = [];
      document.querySelector('#garden-pairs').textContent = found;
      if (found === 6) {
        gardenBoard.classList.add('is-complete');
        gardenStatus.textContent = `Сад расцвёл! Все шесть пар вместе. Ходов: ${turns}. Можно сыграть ещё или собрать свой букет.`;
        gardenResult.hidden = false;
      } else gardenStatus.textContent = `Есть пара: ${gardenFlowers[deck[index]].name}! Найдено ${found} из 6. Откройте следующую карточку.`;
    } else {
      gardenStatus.textContent = 'У этих цветов другие пары. Через секунду карточки закроются — попробуйте снова.';
      mismatchTimer = setTimeout(() => {
        for (const missedCard of opened) {
          missedCard.classList.remove('is-revealed');
          missedCard.setAttribute('aria-pressed', 'false');
          missedCard.setAttribute('aria-label', `Карточка ${Number(missedCard.dataset.card)+1}, закрыта`);
        }
        opened = []; mismatchTimer = null;
        gardenStatus.textContent = 'Попробуйте другую пару. Уже найденные цветы остаются открытыми.';
      }, 1000);
    }
  });
  document.querySelector('#garden-restart').addEventListener('click', () => resetGarden());
  resetGarden(false);


  // One complete repeated group gives an exact 50% loop; no GSAP owns this transform.
  const feelingStrip = document.querySelector('.feeling-strip');
  const feelingTrack = feelingStrip.querySelector('.feeling-track');
  let marqueePaused = false;
  let marqueeVisible = false;
  function updateMarquee() {
    const staticMode = reducedMotion.matches;
    feelingStrip.classList.toggle('marquee-running', marqueeVisible && !document.hidden && !marqueePaused && !staticMode);
    feelingStrip.classList.toggle('marquee-paused', marqueePaused);
  }
  function measureMarquee() {
    const width = feelingTrack.querySelector('.feeling-group').getBoundingClientRect().width;
    feelingTrack.style.setProperty('--marquee-time', `${Math.max(35, width / 42)}s`);
  }
  if ('IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver(entries => { marqueeVisible = entries[0].isIntersecting; updateMarquee(); });
    marqueeObserver.observe(feelingStrip);
  } else { marqueeVisible = true; updateMarquee(); }
  if ('ResizeObserver' in window) new ResizeObserver(measureMarquee).observe(feelingStrip);
  if (document.fonts) document.fonts.ready.then(measureMarquee);
  window.addEventListener('resize', measureMarquee, { passive: true });
  document.addEventListener('visibilitychange', updateMarquee);
  reducedMotion.addEventListener('change', () => { updateMarquee(); measureMarquee(); });
  measureMarquee(); updateMarquee();

  // Every major section has its own botanical response. Only decorative layers move:
  // links, readable copy, game hit targets and form fields keep stable coordinates.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pointerScenes = [];
  function pointerScene(surface, layers = []) {
    if (!surface) return;
    layers = layers.filter(layer => layer.el);
    surface.classList.add('cursor-scene');
    const atmosphere = document.createElement('span');
    atmosphere.className = 'cursor-garden'; atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML = '<i></i><i></i><i></i><span class="garden-rose">' + roseMarkup + '</span>';
    surface.append(atmosphere);
    const state = { surface, layers, rect: null, visible: false, x: 0, y: 0, targetX: 0, targetY: 0, frame: 0, lastTime: 0 };
    pointerScenes.push(state);
    function draw() {
      surface.style.setProperty('--scene-x', `${state.x * 34}px`);
      surface.style.setProperty('--scene-y', `${state.y * 26}px`);
      surface.style.setProperty('--scene-turn', `${state.x * 8}deg`);
      surface.style.setProperty('--pointer-x', `${50 + state.x * 42}%`);
      surface.style.setProperty('--pointer-y', `${50 + state.y * 42}%`);
      for (const layer of layers) {
        layer.el.style.translate = `${state.x * layer.move}px ${state.y * layer.move}px`;
        layer.el.style.rotate = `${state.x * layer.rotate}deg`;
      }
    }
    function settle(time) {
      state.frame = 0;
      if (!state.visible || document.hidden || reducedMotion.matches) { state.stop(); return; }
      const delta = state.lastTime ? Math.min(time - state.lastTime, 64) : 16;
      state.lastTime = time;
      const ease = 1 - Math.pow(.72, delta / 16);
      state.x += (state.targetX - state.x) * ease;
      state.y += (state.targetY - state.y) * ease;
      if (Math.abs(state.x-state.targetX) < .002 && Math.abs(state.y-state.targetY) < .002) {
        state.x = state.targetX; state.y = state.targetY; state.lastTime = 0;
      } else state.frame = requestAnimationFrame(settle);
      draw();
    }
    function start() { if (!state.frame) state.frame = requestAnimationFrame(settle); }
    state.stop = () => {
      cancelAnimationFrame(state.frame); state.frame = 0; state.lastTime = 0;
      state.x = state.y = state.targetX = state.targetY = 0;
      surface.classList.remove('is-pointer-active', 'is-touch-active');
      for (const property of ['--scene-x','--scene-y','--scene-turn','--pointer-x','--pointer-y']) surface.style.removeProperty(property);
      for (const layer of layers) { layer.el.style.removeProperty('translate'); layer.el.style.removeProperty('rotate'); }
    };
    surface.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches || !state.visible || document.hidden || event.pointerType === 'touch') return;
      if (!state.rect) state.rect = surface.getBoundingClientRect();
      state.targetX = Math.max(-1, Math.min(1, (event.clientX-state.rect.left)/state.rect.width*2-1));
      state.targetY = Math.max(-1, Math.min(1, (event.clientY-state.rect.top)/state.rect.height*2-1));
      surface.classList.add('is-pointer-active'); start();
    }, { passive: true });
    surface.addEventListener('pointerenter', () => { state.rect = null; }, { passive: true });
    surface.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') surface.classList.add('is-touch-active'); }, { passive: true });
    surface.addEventListener('pointerup', () => surface.classList.remove('is-touch-active'), { passive: true });
    surface.addEventListener('pointercancel', state.stop, { passive: true });
    surface.addEventListener('pointerleave', () => {
      state.rect = null; surface.classList.remove('is-pointer-active');
      if (state.frame || state.x || state.y) { state.targetX = state.targetY = 0; start(); }
    }, { passive: true });
    return state;
  }
  const layer = (selector, move, rotate) => ({ el: document.querySelector(selector), move, rotate });
  pointerScene(document.querySelector('.hero'));
  pointerScene(document.querySelector('.feeling-strip'));
  pointerScene(document.querySelector('.moods'));
  document.querySelectorAll('.mood-card').forEach(card => pointerScene(card, [
    { el: card.querySelector('svg'), move: 25, rotate: 8 }
  ]));
  pointerScene(document.querySelector('.garden-section'), [
    layer('.garden-sprig>svg:first-child', 30, 9), layer('.garden-sprig>svg:last-child', -22, -8)
  ]);
  pointerScene(document.querySelector('.composer-section'), [layer('.preview-dot', -32, 18)]);
  pointerScene(document.querySelector('.manifesto'), [layer('.manifesto>.flower-mark', 40, 18)]);
  pointerScene(document.querySelector('.visit'), [layer('.map-bloom', -25, 20)]);
  pointerScene(document.querySelector('.callback-panel'));
  pointerScene(document.querySelector('.footer'), [layer('.footer .logo>span', 9, 15)]);
  const sceneObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = pointerScenes.find(scene => scene.surface === entry.target);
      state.visible = entry.isIntersecting;
      if (!state.visible) state.stop();
    }
  });
  for (const state of pointerScenes) sceneObserver.observe(state.surface);
  function stopPointerScenes() { for (const state of pointerScenes) { state.rect = null; state.stop(); } }
  reducedMotion.addEventListener('change', stopPointerScenes);
  finePointer.addEventListener('change', stopPointerScenes);
  document.addEventListener('visibilitychange', stopPointerScenes);
  window.addEventListener('resize', stopPointerScenes, { passive: true });
  window.addEventListener('pagehide', stopPointerScenes);
  window.addEventListener('blur', stopPointerScenes);
  window.addEventListener('scroll', () => { for (const state of pointerScenes) state.rect = null; }, { passive: true });
  form.addEventListener('input', event => {
    if (event.target === messageInput) { messageInput.value = messageInput.value.slice(0,120); document.querySelector('#message-count').textContent = messageInput.value.length; }
    else updatePreview(event.target.type !== 'range');
  });
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    form.elements.mood.value = button.dataset.preset; updatePreview(true);
    document.querySelector('#composer').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const state = getState();
    let saved = false;
    try { localStorage.setItem('demo-976d4bc81f155f-idea-v1',JSON.stringify(state)); saved = true; } catch (_) {}
    summary = `Здравствуйте! Хочу обсудить букет.\nНастроение: ${moods[state.mood].feeling.toLowerCase()} (${moods[state.mood].title}).\nМасштаб: ${sizeNames[state.size-1].toLowerCase()}.` + (state.message ? `\nДля открытки: ${state.message}` : '') + '\nПодскажите, пожалуйста, возможный состав и стоимость.';
    document.querySelector('#idea-summary').textContent = summary;
    document.querySelector('#result-title').textContent = saved ? 'Чувство сохранено.' : 'Идея готова.';
    document.querySelector('#save-status').textContent = saved ? 'Идея сохранена в этом браузере. В лавку ничего не отправлено.' : 'Идея готова. Автосохранение недоступно — скопируйте текст ниже.';
    document.querySelector('#copy-status').textContent = '';
    document.querySelector('#idea-dialog').showModal();
  });
  document.querySelector('#copy-idea').addEventListener('click', async () => {
    const copied = await copyText(summary);
    document.querySelector('#copy-status').textContent = copied ? 'Текст скопирован. Его можно отправить флористу самостоятельно.' : 'Не удалось скопировать автоматически. Выделите и скопируйте текст идеи выше.';
  });
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) {
      const el = document.createElement('textarea'); el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.querySelector('#idea-dialog').append(el); el.select(); let result = false;
      try { result = document.execCommand('copy'); } catch (_) {} el.remove(); document.querySelector('#copy-idea').focus(); return result;
    }
  }
  const callbackForm = document.querySelector('#callback-form');
  const callbackFields = document.querySelector('#callback-fields');
  const callbackSuccess = document.querySelector('#callback-success');
  const contactInputs = [...callbackForm.querySelectorAll('input,select')];
  function contactError(input) {
    const value = input.value.trim();
    if (input.id === 'callback-name') {
      if (value.length < 2 || value.length > 60) return 'Введите имя длиной от 2 до 60 символов.';
      if (!/^[\p{L}][\p{L}\p{M} .’'–-]*$/u.test(value) || value.replace(/[^\p{L}]/gu, '').length < 2) return 'В имени используйте буквы, пробелы или дефис.';
    }
    if (input.id === 'callback-phone') {
      const digits = value.replace(/\D/g, '');
      if (!/^\+?[\d()\s-]+$/.test(value) || !/^[78]\d{10}$/.test(digits)) return 'Введите 11 цифр российского номера, начиная с 7 или 8.';
      if (/^([78])0{10}$/.test(digits)) return 'Проверьте номер: он не может состоять только из нулей после кода страны.';
    }
    if (input.id === 'callback-topic' && !['bouquet','visit','callback'].includes(value)) return 'Выберите тему обращения.';
    return '';
  }
  function showContactError(input) {
    const error = contactError(input);
    input.setAttribute('aria-invalid', String(Boolean(error)));
    document.querySelector(`#${input.id}-error`).textContent = error;
    return error;
  }
  contactInputs.forEach(input => {
    input.addEventListener('blur', () => { if (input.value || input.hasAttribute('aria-invalid')) showContactError(input); });
    input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) showContactError(input); });
    input.addEventListener('change', () => { if (input.hasAttribute('aria-invalid')) showContactError(input); });
  });
  callbackForm.addEventListener('submit', event => {
    event.preventDefault();
    let firstInvalid = null;
    for (const input of contactInputs) if (showContactError(input) && !firstInvalid) firstInvalid = input;
    if (firstInvalid) {
      const visibleControl = firstInvalid.closest('.batch-select')?.querySelector('.batch-select-trigger') || firstInvalid;
      visibleControl.focus();
      return;
    }
    callbackForm.reset();
    for (const input of contactInputs) { input.removeAttribute('aria-invalid'); document.querySelector(`#${input.id}-error`).textContent = ''; }
    callbackFields.hidden = true; callbackSuccess.hidden = false;
    callbackSuccess.focus({preventScroll: true});
    callbackSuccess.scrollIntoView({block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  document.querySelector('#callback-submit').disabled = false;
  document.querySelector('#callback-again').addEventListener('click', () => {
    callbackFields.hidden = false; callbackSuccess.hidden = true;
    document.querySelector('#callback-name').focus({preventScroll: true});
    callbackForm.scrollIntoView({block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  window.addEventListener('pagehide', () => {
    callbackForm.reset();
    if (mismatchTimer !== null) {
      clearTimeout(mismatchTimer); mismatchTimer = null;
      for (const card of opened) { card.classList.remove('is-revealed'); card.setAttribute('aria-pressed', 'false'); card.setAttribute('aria-label', `Карточка ${Number(card.dataset.card)+1}, закрыта`); }
      opened = [];
    }
  });

  if (window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    const motionMedia = gsap.matchMedia();
    motionMedia.add({ desktop: '(min-width: 861px)', small: '(max-width: 860px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions.reduce) return;
      const desktop = context.conditions.desktop;

      document.querySelectorAll('.mood-art').forEach((art, index) => {
        gsap.fromTo(art, { y: desktop ? 95 + index * 25 : 45, rotation: [-7, 6, -5][index], scale: .9 }, { y: 0, rotation: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: art.closest('.mood-card'), start: 'top 95%', end: 'top 35%', scrub: .55 } });
      });
      gsap.fromTo('.garden-sprig', { y: 35, rotation: -16, scale: .8 }, { y: -20, rotation: 12, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.garden-intro', start: 'top bottom', end: 'bottom 25%', scrub: .6 } });
      gsap.fromTo('.composer-visual', { y: 50, rotation: -4 }, { y: -20, rotation: 2, ease: 'none', scrollTrigger: { trigger: '.composer-section', start: 'top 90%', end: 'bottom top', scrub: .7 } });
      gsap.fromTo('.manifesto>.flower-mark', { rotation: -60, scale: .7 }, { rotation: 250, scale: 1.3, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: .5 } });

    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), {once: true});
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Открыть меню'); }
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('is-open',open); menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню'); if(open) nav.querySelector('a').focus(); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  document.querySelector('.header-contact').addEventListener('click',closeMenu);
  document.addEventListener('keydown', event => { if(event.key==='Escape' && nav.classList.contains('is-open')) { closeMenu(); menuButton.focus(); } });
  document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click',() => document.querySelector('#demo-dialog').showModal()));
  document.querySelectorAll('dialog').forEach(dialog => { dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close()); dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}); });
})();
