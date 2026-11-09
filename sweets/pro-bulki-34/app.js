'use strict';

(() => {
  const $ = (selector) => document.querySelector(selector);
  const foods = {
    loaf: { name: 'Хлеб', asset: 'assets/loaf.svg' },
    baguette: { name: 'Багет', asset: 'assets/baguette.svg' },
    croissant: { name: 'Круассан', asset: 'assets/croissant.svg' },
    bun: { name: 'Булочка', asset: 'assets/bun.svg' },
    pie: { name: 'Пирог', asset: 'assets/pie.svg' },
    coffee: { name: 'Кофе', asset: 'assets/coffee.svg' }
  };
  const selected = new Set();
  const choices = [...document.querySelectorAll('[data-food]')];
  const bagImages = [...document.querySelectorAll('.bag-item')];
  const resetBag = $('#bag-reset');
  const bagContact = $('#bag-contact');
  const count = $('#bag-count');

  function bagConcept(items) {
    const bread = items.includes('loaf') || items.includes('baguette');
    const sweet = items.includes('croissant') || items.includes('bun');
    if (items.includes('coffee') && sweet) return ['Пауза с кофе', 'Выпечка и кофе — начните с этой пары. Третью позицию оставьте для следующей паузы или поделитесь с близким.'];
    if (items.includes('pie') && bread) return ['К общему столу', 'Пирог — в центр стола, хлеб — к любимому блюду. Третья позиция дополнит встречу. Такое сочетание приятно разделить.'];
    if (bread && sweet) return ['От завтрака до чаепития', 'Хлеб оставьте для любимого бутерброда, а выпечку — к чаю. В одном пакете нашлась идея для двух маленьких перерывов.'];
    if (items.includes('coffee')) return ['Перерыв среди дел', 'Кофе задаёт настроение, а две позиции из пекарни дополняют паузу. Можно разделить сочетание на завтрак и перекус.'];
    return ['Пакет для компании', 'Разделите выпечку и пирог на общий стол. Каждый сможет выбрать своё, а вы — попробовать несколько сочетаний.'];
  }

  function renderBag() {
    const items = [...selected];
    for (const button of choices) button.setAttribute('aria-pressed', String(selected.has(button.dataset.food)));
    bagImages.forEach((image, index) => {
      const item = items[index];
      image.hidden = !item;
      if (item) image.src = foods[item].asset;
      else image.removeAttribute('src');
    });
    count.textContent = `Выбрано ${items.length} из 3`;
    resetBag.disabled = items.length === 0;
    bagContact.hidden = items.length !== 3;
    if (items.length === 3) {
      const concept = bagConcept(items);
      $('#result-title').textContent = concept[0];
      $('#result-description').textContent = concept[1];
    } else {
      $('#result-title').textContent = items.length ? 'Уже пахнет хорошим планом' : 'Пока только предвкушение';
      $('#result-description').textContent = items.length ? `Добавьте ещё ${3 - items.length === 1 ? 'одну позицию' : 'две позиции'}, чтобы увидеть идею сочетания.` : 'Добавьте в пакет то, что любите. Здесь появится ваше сочетание.';
    }
    $('#result-items').textContent = items.map(item => foods[item].name).join(' · ');
  }
  choices.forEach(button => button.addEventListener('click', () => {
    const food = button.dataset.food;
    if (selected.has(food)) selected.delete(food);
    else if (selected.size < 3) selected.add(food);
    else {
      count.textContent = 'В пакете уже три позиции. Уберите одну, чтобы выбрать другую.';
      return;
    }
    renderBag();
  }));
  resetBag.addEventListener('click', () => {
    selected.clear();
    renderBag();
    choices[0].focus({ preventScroll: true });
  });
  $('.food-choices').disabled = false;

  const form = $('#callback');
  const trigger = $('#topic-trigger');
  const list = $('#topic-options');
  const options = [...list.querySelectorAll('[role=option]')];
  const picker = $('.topic-picker');
  const customerName = $('#customer-name');
  const customerPhone = $('#customer-phone');
  let topic = '';
  let activeOption = 0;

  function closeTopics(returnFocus = false) {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus({ preventScroll: true });
  }
  function placeTopics() {
    const rect = trigger.getBoundingClientRect();
    const headerBottom = $('.header').getBoundingClientRect().bottom;
    const below = window.innerHeight - rect.bottom - 16;
    const above = rect.top - headerBottom - 16;
    const openUp = below < 210 && above > below;
    list.classList.toggle('open-up', openUp);
    list.style.maxHeight = `${Math.max(80, Math.min(220, openUp ? above : below))}px`;
  }
  function focusOption(index) {
    activeOption = (index + options.length) % options.length;
    options.forEach((option, i) => { option.tabIndex = i === activeOption ? 0 : -1; });
    options[activeOption].focus({ preventScroll: true });
    options[activeOption].scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  function openTopics(index) {
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    placeTopics();
    focusOption(index ?? Math.max(0, options.findIndex(option => option.dataset.value === topic)));
  }
  function chooseTopic(value, returnFocus = false) {
    topic = value;
    const chosen = options.find(option => option.dataset.value === value);
    $('#topic-value').textContent = chosen ? chosen.textContent : 'Выберите тему';
    options.forEach(option => option.setAttribute('aria-selected', String(option === chosen)));
    trigger.removeAttribute('aria-invalid');
    $('#topic-error').textContent = '';
    closeTopics(returnFocus);
  }
  trigger.addEventListener('click', () => list.hidden ? openTopics() : closeTopics());
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openTopics(event.key === 'ArrowUp' ? options.length - 1 : undefined);
    }
  });
  options.forEach(option => option.addEventListener('click', () => chooseTopic(option.dataset.value, true)));
  list.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption(activeOption + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseTopic(options[activeOption].dataset.value, true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeTopics(true);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      closeTopics();
      (event.shiftKey ? trigger : $('.form-submit')).focus();
    } else if (event.key.length === 1) {
      const found = options.findIndex(option => option.textContent.toLocaleLowerCase('ru').startsWith(event.key.toLocaleLowerCase('ru')));
      if (found >= 0) { event.preventDefault(); focusOption(found); }
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!list.hidden && !picker.contains(event.target)) closeTopics();
  });
  picker.addEventListener('focusout', event => {
    // A null destination can precede an option click; outside pointers and Tab close separately.
    if (event.relatedTarget && !picker.contains(event.relatedTarget)) closeTopics();
  });
  window.addEventListener('resize', () => { if (!list.hidden) placeTopics(); }, { passive: true });
  window.addEventListener('scroll', () => { if (!list.hidden) placeTopics(); }, { passive: true });

  function clearError(input, error) {
    input.removeAttribute('aria-invalid');
    $(error).textContent = '';
  }
  customerName.addEventListener('input', () => clearError(customerName, '#name-error'));
  customerPhone.addEventListener('input', () => clearError(customerPhone, '#phone-error'));
  function resetForm() {
    form.reset();
    customerName.value = '';
    customerPhone.value = '';
    clearError(customerName, '#name-error');
    clearError(customerPhone, '#phone-error');
    chooseTopic('');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors = [];
    clearError(customerName, '#name-error');
    clearError(customerPhone, '#phone-error');
    if (customerName.value.trim().length < 2) {
      customerName.setAttribute('aria-invalid', 'true');
      $('#name-error').textContent = 'Введите имя: минимум два символа.';
      errors.push(customerName);
    }
    const phone = customerPhone.value.trim();
    const digits = phone.replace(/\D/g, '');
    if (!/^\+?[\d\s()\-]+$/.test(phone) || digits.length < 10 || digits.length > 15) {
      customerPhone.setAttribute('aria-invalid', 'true');
      $('#phone-error').textContent = 'Введите номер из 10–15 цифр. Можно использовать +, пробелы, скобки и дефисы.';
      errors.push(customerPhone);
    }
    if (!topic) {
      trigger.setAttribute('aria-invalid', 'true');
      $('#topic-error').textContent = 'Выберите тему обращения.';
      errors.push(trigger);
    }
    if (errors.length) { closeTopics(); errors[0].focus(); return; }
    resetForm();
    form.hidden = true;
    $('#form-success').hidden = false;
    $('#form-success').focus({ preventScroll: true });
  });
  $('#form-repeat').addEventListener('click', () => {
    resetForm();
    $('#form-success').hidden = true;
    form.hidden = false;
    customerName.focus();
  });
  bagContact.addEventListener('click', () => {
    $('#form-success').hidden = true;
    form.hidden = false;
    chooseTopic('breakfast');
  });
  $('#form-fields').disabled = false;
  window.addEventListener('pagehide', resetForm);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sections = [...document.querySelectorAll('.motion-section')];
  const header = $('.header');
  const contact = $('.header-contact');
  const face = $('.magnet-face');
  const visible = new Set(sections);
  let scrollFrame = 0;
  let pointerFrame = 0;
  let trackedSection = null;
  let pointerX = 0;
  let pointerY = 0;
  let sectionBounds = null;

  function updateScroll() {
    scrollFrame = 0;
    const height = window.innerHeight;
    for (const section of visible) {
      const top = section.getBoundingClientRect().top;
      const scatter = reduced.matches ? 0 : Math.max(0, Math.min(1, (top - height * .14) / (height * .86)));
      section.style.setProperty('--scatter', scatter.toFixed(3));
    }
  }
  function scheduleScroll() {
    sectionBounds = null;
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    scheduleScroll();
  }, { rootMargin: '80px' });
  sections.forEach(section => {
    observer.observe(section);
    section.addEventListener('pointermove', event => {
      if (reduced.matches || !pointer.matches) return;
      if (trackedSection !== section) { trackedSection = section; sectionBounds = null; }
      sectionBounds ||= section.getBoundingClientRect();
      pointerX = Math.max(-12, Math.min(12, ((event.clientX - sectionBounds.left) / sectionBounds.width - .5) * 24));
      pointerY = Math.max(-10, Math.min(10, ((event.clientY - sectionBounds.top) / sectionBounds.height - .5) * 20));
      if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!trackedSection) return;
        trackedSection.style.setProperty('--px', `${pointerX.toFixed(1)}px`);
        trackedSection.style.setProperty('--py', `${pointerY.toFixed(1)}px`);
      });
    });
    section.addEventListener('pointerleave', () => {
      section.style.setProperty('--px', '0px');
      section.style.setProperty('--py', '0px');
      trackedSection = null;
      sectionBounds = null;
    });
  });
  contact.addEventListener('pointermove', event => {
    if (reduced.matches || !pointer.matches) return;
    const rect = contact.getBoundingClientRect();
    face.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width - .5) * 8}px`);
    face.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height - .5) * 8}px`);
  });
  function resetMagnet() { face.style.setProperty('--mx', '0px'); face.style.setProperty('--my', '0px'); }
  contact.addEventListener('pointerleave', resetMagnet);
  contact.addEventListener('blur', resetMagnet);
  reduced.addEventListener('change', () => {
    resetMagnet();
    sections.forEach(section => {
      section.style.setProperty('--px', '0px');
      section.style.setProperty('--py', '0px');
    });
    scheduleScroll();
  });
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    scheduleScroll();
  }).observe(header);
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  updateScroll();
})();
