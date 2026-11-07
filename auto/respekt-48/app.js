(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.COMPANY;
  if (!config) return;
  // Company data is isolated so future copies can replace real facts together.
  $$('[data-company-phone]').forEach(link => {
    link.href = config.phoneHref;
    if (link.classList.contains('header-phone') || link.parentElement.classList.contains('mobile-menu')) link.textContent = config.phone;
    if (link.classList.contains('contact-call')) {
      let label = $('[data-phone-label]', link) || $('span', link);
      if (!label) {
        label = document.createElement('span');
        label.dataset.phoneLabel = '';
        [...link.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
        link.prepend(label);
      }
      label.textContent = config.phone;
    }
  });
  $$('[data-company-email]').forEach(link => { link.href = `mailto:${config.email}`; });
  $$('[data-company-address]').forEach(el => { el.textContent = config.address; });
  $$('[data-company-hours]').forEach(el => { el.textContent = config.hours; });
  $$('[data-company-map]').forEach(el => { el.href = config.mapUrl; });
  $$('[data-company-source]').forEach(el => { el.href = config.source; });

  const menuToggle = $('.menu-toggle');
  const menu = $('#mobile-menu');
  function closeMenu() {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.site-header a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
  });

  const tabs = $$('.service-tab');
  const panel = $('#service-panel');
  const serviceSelect = $('#service-choice');
  let selectedService = serviceSelect.value;
  let formChoice = serviceSelect.value;
  // Progressive enhancement: without this script the native select remains usable.
  const selectShell = document.createElement('div');
  selectShell.className = 'custom-select';
  selectShell.innerHTML = '<button class="select-trigger" id="service-select-trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="service-options" aria-labelledby="service-choice-label service-select-value"><span id="service-select-value"></span><svg class="arrow" aria-hidden="true"><use href="#arrow"/></svg></button><div class="select-options" id="service-options" role="listbox" aria-labelledby="service-choice-label" hidden></div>';
  serviceSelect.after(selectShell);
  const selectTrigger = $('#service-select-trigger');
  const selectList = $('#service-options');
  // A body-level fixed portal cannot be clipped by the contact section's artwork.
  document.body.append(selectList);
  const selectOptions = [...serviceSelect.options].map((item, index) => {
    const option = document.createElement('div');
    option.id = `service-option-${index}`;
    option.className = 'select-option';
    option.setAttribute('role', 'option');
    option.dataset.value = item.value;
    option.textContent = item.textContent;
    selectList.append(option);
    return option;
  });
  let activeOption = serviceSelect.selectedIndex;
  let typed = '', typedAt = 0;
  let pointerInOptions = false;
  function syncServiceControl() {
    activeOption = serviceSelect.selectedIndex;
    $('#service-select-value').textContent = serviceSelect.options[activeOption].textContent;
    selectOptions.forEach((option, index) => {
      option.setAttribute('aria-selected', String(index === activeOption));
      option.classList.toggle('is-highlighted', index === activeOption);
    });
  }
  function setActiveOption(index) {
    activeOption = Math.max(0, Math.min(selectOptions.length - 1, index));
    selectOptions.forEach((option, i) => option.classList.toggle('is-highlighted', i === activeOption));
    selectTrigger.setAttribute('aria-activedescendant', selectOptions[activeOption].id);
    const option = selectOptions[activeOption];
    if (option.offsetTop - 10 < selectList.scrollTop) selectList.scrollTop = Math.max(0, option.offsetTop - 10);
    else if (option.offsetTop + option.offsetHeight + 10 > selectList.scrollTop + selectList.clientHeight) selectList.scrollTop = option.offsetTop + option.offsetHeight + 10 - selectList.clientHeight;
  }
  let selectPositionFrame = 0;
  function positionServiceSelect() {
    selectPositionFrame = 0;
    if (selectList.hidden) return;
    const box = selectTrigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportTop = viewport ? viewport.offsetTop : 0;
    const viewportLeft = viewport ? viewport.offsetLeft : 0;
    const viewportWidth = viewport ? viewport.width : window.innerWidth;
    const viewportHeight = viewport ? viewport.height : window.innerHeight;
    const safeTop = Math.max(viewportTop + 12, $('.site-header').getBoundingClientRect().bottom + 12);
    const safeBottom = viewportTop + viewportHeight - 12;
    if (box.bottom < safeTop || box.top > safeBottom) { closeServiceSelect(); return; }
    const below = Math.max(0, safeBottom - box.bottom - 8);
    const above = Math.max(0, box.top - safeTop - 8);
    const opensUp = below < 260 && above > below;
    const available = opensUp ? above : below;
    const maxHeight = Math.min(320, Math.max(64, available), Math.max(1, safeBottom - safeTop));
    const width = Math.min(box.width, viewportWidth - 24);
    const left = Math.max(viewportLeft + 12, Math.min(box.left, viewportLeft + viewportWidth - width - 12));
    selectList.style.width = `${width}px`;
    selectList.style.left = `${left}px`;
    selectList.style.maxHeight = `${maxHeight}px`;
    const height = selectList.offsetHeight;
    const preferredTop = opensUp ? box.top - height - 8 : box.bottom + 8;
    selectList.style.top = `${Math.max(safeTop, Math.min(preferredTop, safeBottom - height))}px`;
  }
  function scheduleSelectPosition() {
    if (!selectList.hidden && !selectPositionFrame) selectPositionFrame = requestAnimationFrame(positionServiceSelect);
  }
  function openServiceSelect() {
    selectList.hidden = false;
    positionServiceSelect();
    if (selectList.hidden) return;
    selectTrigger.setAttribute('aria-expanded', 'true');
    setActiveOption(serviceSelect.selectedIndex);
  }
  function closeServiceSelect(commit = false) {
    if (commit && !selectList.hidden) {
      formChoice = selectOptions[activeOption].dataset.value;
      serviceSelect.value = formChoice;
      if (config.services.some(service => service.id === formChoice)) selectService(formChoice);
    }
    selectList.hidden = true;
    cancelAnimationFrame(selectPositionFrame); selectPositionFrame = 0;
    selectTrigger.setAttribute('aria-expanded', 'false');
    selectTrigger.removeAttribute('aria-activedescendant');
    syncServiceControl();
    typed = '';
  }
  selectTrigger.addEventListener('click', () => selectList.hidden ? openServiceSelect() : closeServiceSelect());
  selectTrigger.addEventListener('keydown', event => {
    const open = !selectList.hidden;
    if (event.key === 'Tab') { if (open) closeServiceSelect(true); return; }
    if (event.key === 'Escape') { if (open) { event.preventDefault(); closeServiceSelect(); } return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (!open) openServiceSelect();
      if (event.key === 'Home') setActiveOption(0);
      else if (event.key === 'End') setActiveOption(selectOptions.length - 1);
      else if (open && event.key === 'ArrowDown') setActiveOption(activeOption + 1);
      else if (open && event.key === 'ArrowUp') setActiveOption(activeOption - 1);
      else if (open && (event.key === 'Enter' || event.key === ' ')) closeServiceSelect(true);
      return;
    }
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      if (!open) openServiceSelect();
      const now = performance.now();
      typed = now - typedAt > 700 ? event.key.toLocaleLowerCase('ru') : typed + event.key.toLocaleLowerCase('ru');
      typedAt = now;
      const repeated = [...typed].every(character => character === typed[0]);
      const search = repeated ? typed[0] : typed;
      const start = repeated ? activeOption + 1 : activeOption;
      for (let offset = 0; offset < selectOptions.length; offset++) {
        const index = (start + offset) % selectOptions.length;
        if (selectOptions[index].textContent.toLocaleLowerCase('ru').startsWith(search)) { setActiveOption(index); break; }
      }
    }
  });
  selectOptions.forEach((option, index) => {
    option.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') event.preventDefault(); });
    option.addEventListener('click', () => { setActiveOption(index); closeServiceSelect(true); selectTrigger.focus({ preventScroll: true }); });
  });
  // Touch can blur a focused button before its option click is dispatched.
  selectList.addEventListener('pointerdown', () => { pointerInOptions = true; });
  function endOptionPointer() {
    if (!pointerInOptions) return;
    pointerInOptions = false;
    if (!selectList.hidden) selectTrigger.focus({ preventScroll: true });
  }
  document.addEventListener('pointerup', endOptionPointer, { passive: true });
  document.addEventListener('pointercancel', endOptionPointer, { passive: true });
  document.addEventListener('pointerdown', event => { if (!selectShell.contains(event.target) && !selectList.contains(event.target) && !selectList.hidden) closeServiceSelect(); });
  window.visualViewport?.addEventListener('resize', scheduleSelectPosition, { passive: true });
  window.visualViewport?.addEventListener('scroll', scheduleSelectPosition, { passive: true });
  selectTrigger.addEventListener('blur', () => { if (!selectList.hidden && !pointerInOptions) closeServiceSelect(true); });
  serviceSelect.hidden = true;
  serviceSelect.tabIndex = -1;
  $('#service-choice-label').htmlFor = selectTrigger.id;
  syncServiceControl();
  function selectService(id, focus = false) {
    const item = config.services.find(service => service.id === id);
    if (!item) return;
    tabs.forEach(tab => {
      const selected = tab.dataset.service === id;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus({ preventScroll: true });
    });
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    $('#service-title').textContent = item.title;
    $('#service-short').textContent = item.short;
    $('#service-description').textContent = item.detail;
    $('#service-tags').replaceChildren(...item.tags.map(tag => {
      const el = document.createElement('span'); el.textContent = tag; return el;
    }));
    $('.mechanism-scene').dataset.zone = item.zone;
    selectedService = id;
    serviceSelect.value = selectedService;
    formChoice = selectedService;
    syncServiceControl();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(tab.dataset.service));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectService(tabs[next].dataset.service, true);
      tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
  });

  let guideService = selectedService;
  const guideChoices = $('#guide-choices');
  const guideResult = $('#guide-result');
  const symptomCopy = {
    suspension: 'Расскажите, с какой стороны слышен стук и на какой дороге он возникает. Начните с обсуждения осмотра ходовой части.',
    diagnostics: 'Уточните, какой индикатор появился и изменилось ли поведение автомобиля. Компьютерная диагностика помогает прочитать ошибки системы.',
    climate: 'Опишите, когда кондиционер стал хуже охлаждать и есть ли непривычный звук или запах. Обсудите проверку климатической системы.',
    maintenance: 'Подготовьте марку, модель и текущий пробег. Сервис поможет уточнить перечень планового обслуживания.'
  };
  $$('[data-symptom]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.symptom;
    const service = config.services.find(item => item.id === id);
    if (!service) return;
    guideService = id;
    selectService(id);
    $('#guide-result-title').textContent = service.title;
    $('#guide-result-copy').textContent = symptomCopy[id];
    guideChoices.hidden = true;
    guideResult.hidden = false;
    $('#guide-book').focus({ preventScroll: true });
  }));
  $('#guide-reset').addEventListener('click', () => {
    guideResult.hidden = true;
    guideChoices.hidden = false;
    $('[data-symptom]', guideChoices).focus({ preventScroll: true });
  });

  const form = $('#booking-form');
  const nameInput = $('#customer-name');
  const phoneInput = $('#customer-phone');
  function clearFieldError(input, errorId) {
    input.removeAttribute('aria-invalid');
    $(`#${errorId}`).textContent = '';
  }
  nameInput.addEventListener('input', () => clearFieldError(nameInput, 'name-error'));
  phoneInput.addEventListener('input', () => clearFieldError(phoneInput, 'phone-error'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFieldError(nameInput, 'name-error');
    clearFieldError(phoneInput, 'phone-error');
    let firstInvalid = null;
    if ((nameInput.value.match(/\p{L}/gu) || []).length < 2) {
      nameInput.setAttribute('aria-invalid', 'true');
      $('#name-error').textContent = 'Введите имя — не меньше двух букв.';
      firstInvalid = nameInput;
    }
    const phone = phoneInput.value.trim();
    const digits = phone.replace(/\D/g, '');
    const validPhone = /^\+?[\d\s().-]+$/.test(phone) && (/^\d{10}$/.test(digits) || /^[78]\d{10}$/.test(digits));
    if (!validPhone || /^([0-9])\1+$/.test(digits)) {
      phoneInput.setAttribute('aria-invalid', 'true');
      $('#phone-error').textContent = 'Введите российский номер: 10 цифр или 11 с 7/8 в начале.';
      firstInvalid ||= phoneInput;
    }
    if (firstInvalid) { firstInvalid.focus(); return; }
    // The demo never transmits, persists or logs personal data.
    form.reset();
    form.hidden = true;
    $('#form-success').hidden = false;
    $('#form-success').focus({ preventScroll: true });
  });
  $('#booking-submit').disabled = false;
  function resetForm(focus = true) {
    $('#form-success').hidden = true;
    form.hidden = false;
    form.reset();
    serviceSelect.value = formChoice;
    syncServiceControl();
    clearFieldError(nameInput, 'name-error'); clearFieldError(phoneInput, 'phone-error');
    if (focus) nameInput.focus({ preventScroll: true });
  }
  $('#form-reset').addEventListener('click', () => resetForm());
  ['#service-book', '#guide-book'].forEach(selector => $(selector).addEventListener('click', () => {
    if (form.hidden) resetForm(false);
    formChoice = selector === '#guide-book' ? guideService : selectedService;
    serviceSelect.value = formChoice;
    syncServiceControl();
  }));

  const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const magnet = $('.contact-magnet');
  let magnetFrame = 0;
  let magnetBox = null;
  let magnetX = 0, magnetY = 0;
  function resetMagnet() {
    cancelAnimationFrame(magnetFrame); magnetFrame = 0; magnetBox = null;
    magnet.style.setProperty('--magnet-x', '0px'); magnet.style.setProperty('--magnet-y', '0px');
  }
  magnet.addEventListener('pointerenter', () => { magnetBox = magnet.getBoundingClientRect(); });
  magnet.addEventListener('pointermove', event => {
    if (motionMedia.matches || !finePointer.matches) return;
    magnetBox ||= magnet.getBoundingClientRect();
    magnetX = Math.max(-4, Math.min(4, ((event.clientX - magnetBox.left) / magnetBox.width - .5) * 8));
    magnetY = Math.max(-4, Math.min(4, ((event.clientY - magnetBox.top) / magnetBox.height - .5) * 8));
    if (!magnetFrame) magnetFrame = requestAnimationFrame(() => {
      magnetFrame = 0;
      magnet.style.setProperty('--magnet-x', `${magnetX}px`); magnet.style.setProperty('--magnet-y', `${magnetY}px`);
    });
  }, { passive: true });
  magnet.addEventListener('pointerleave', resetMagnet);
  magnet.addEventListener('blur', resetMagnet);
  const inspection = $('.inspection-zone');
  let inspectionFrame = 0;
  let inspectionX = 0, inspectionY = 0;
  function resetInspection() {
    cancelAnimationFrame(inspectionFrame); inspectionFrame = 0;
    inspection.classList.remove('is-inspecting');
  }
  inspection.addEventListener('pointermove', event => {
    if (motionMedia.matches || !finePointer.matches) return;
    inspectionX = event.clientX; inspectionY = event.clientY;
    if (!inspectionFrame) inspectionFrame = requestAnimationFrame(() => {
      inspectionFrame = 0;
      const box = inspection.getBoundingClientRect();
      inspection.style.setProperty('--inspect-x', `${inspectionX - box.left}px`);
      inspection.style.setProperty('--inspect-y', `${inspectionY - box.top}px`);
      inspection.classList.add('is-inspecting');
    });
  }, { passive: true });
  inspection.addEventListener('pointerleave', resetInspection);
  const scenes = $$('[data-motion]');
  const visibleScenes = new Set();
  const pointerStates = new Map();
  const assembly = $('.assembly');
  const assemblySection = $('.approach-section');
  const hero = $('.hero');
  const clamp = value => Math.max(0, Math.min(1, value));
  let motionEnabled = !motionMedia.matches;
  let frame = 0;
  function updateMotionPreference() {
    motionEnabled = !motionMedia.matches;
    document.documentElement.toggleAttribute('data-motion-off', !motionEnabled);
    scenes.forEach(scene => {
      scene.style.setProperty('--px', 0); scene.style.setProperty('--py', 0);
      scene.style.setProperty('--progress', motionEnabled ? 0 : 1);
      scene.style.setProperty('--lit', 0);
    });
    assemblySection.style.setProperty('--assembly-progress', motionEnabled ? 0 : 1);
    hero.style.setProperty('--hero-progress', 0);
    resetMagnet(); resetInspection();
    scheduleScroll();
  }
  function updateScroll() {
    frame = 0;
    if (!motionEnabled) return;
    const height = window.innerHeight;
    // Read geometry together before writing styles; scrolling invalidates viewport bounds.
    const readings = [...visibleScenes].map(scene => ({ scene, box: scene.getBoundingClientRect() }));
    const assemblyTop = visibleScenes.has(assemblySection) ? assembly.getBoundingClientRect().top : null;
    readings.forEach(({ scene, box }) => {
      const state = pointerStates.get(scene);
      if (state && state.box) state.box = box;
      scene.style.setProperty('--progress', clamp((height - box.top) / (height * .95)).toFixed(4));
      if (scene === hero) scene.style.setProperty('--hero-progress', clamp(-box.top / (box.height * .8)).toFixed(4));
      if (state && state.box) state.schedule();
    });
    if (assemblyTop !== null) assemblySection.style.setProperty('--assembly-progress', clamp((height - assemblyTop) / (height * .78)).toFixed(4));
  }
  function scheduleScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleScenes.add(entry.target);
      else visibleScenes.delete(entry.target);
    });
    scheduleScroll();
  }, { rootMargin: '100px 0px 100px 0px' });
  scenes.forEach(scene => {
    observer.observe(scene);
    const state = { box: null, frame: 0, x: 0, y: 0, schedule: () => {
      if (!state.frame && motionEnabled) state.frame = requestAnimationFrame(paintPointer);
    } };
    pointerStates.set(scene, state);
    function paintPointer() {
      state.frame = 0;
      if (!motionEnabled || !state.box) return;
      const x = clamp((state.x - state.box.left) / state.box.width);
      const y = clamp((state.y - state.box.top) / state.box.height);
      scene.style.setProperty('--px', ((x - .5) * 2).toFixed(3));
      scene.style.setProperty('--py', ((y - .5) * 2).toFixed(3));
      scene.style.setProperty('--pointer-x', `${x * 100}%`);
      scene.style.setProperty('--pointer-y', `${y * 100}%`);
      scene.style.setProperty('--lit', '1');
    }
    scene.addEventListener('pointerenter', event => {
      state.box = scene.getBoundingClientRect(); state.x = event.clientX; state.y = event.clientY;
      state.schedule();
    });
    scene.addEventListener('pointermove', event => {
      if (!motionEnabled) return;
      state.box ||= scene.getBoundingClientRect();
      state.x = event.clientX; state.y = event.clientY;
      state.schedule();
    }, { passive: true });
    scene.addEventListener('pointerdown', event => {
      state.box = scene.getBoundingClientRect(); state.x = event.clientX; state.y = event.clientY;
      state.schedule();
    }, { passive: true });
    scene.addEventListener('pointerleave', () => {
      cancelAnimationFrame(state.frame); state.frame = 0; state.box = null;
      scene.style.setProperty('--px', 0); scene.style.setProperty('--py', 0); scene.style.setProperty('--lit', 0);
    });
  });
  motionMedia.addEventListener('change', updateMotionPreference);
  window.addEventListener('scroll', () => { resetInspection(); scheduleSelectPosition(); scheduleScroll(); }, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); resetMagnet(); resetInspection(); scheduleSelectPosition(); scheduleScroll(); }, { passive: true });
  window.addEventListener('pageshow', () => {
    scheduleScroll();
  });
  window.addEventListener('pagehide', () => {
    closeServiceSelect(); resetMagnet(); resetInspection();
    cancelAnimationFrame(frame); frame = 0;
    pointerStates.forEach(state => { cancelAnimationFrame(state.frame); state.frame = 0; state.box = null; });
  });
  updateMotionPreference();
})();
