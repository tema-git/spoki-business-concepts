/* Original code-only ceramic scene. No photography, third-party media or data collection. */
(() => {
  'use strict';
  const roots = [...document.querySelectorAll('[data-coded-scene="pottery-hero"]')];
  if (!roots.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const stages = [
    ['Сначала прикосновение.', 'Податливая глина и первые очертания будущей вещи.', 'Сырая глина с мягкими следами гончарного круга'],
    ['Потом — ваша форма.', 'Чуть выше горлышко. Чуть мягче изгиб. Уже совсем другая история.', 'Высокая ваза с плавным изгибом и узким горлышком'],
    ['И свой характер.', 'Шалфейная глазурь, живая фактура и тёплая глина у основания.', 'Готовая ваза с шалфейной глазурью и открытой терракотовой основой']
  ];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  let frame = 0;
  const states = roots.map(root => {
    const figure = root.querySelector('.pottery-hero-art');
    const buttons = [...root.querySelectorAll('[data-hero-story]')];
    const state = { root, figure, x: 0, y: 0, visible: false };
    function select(index) {
      if (!stages[index]) return;
      root.dataset.stage = String(index);
      figure.setAttribute('aria-label', stages[index][2]);
      root.querySelector('#hero-story-title').textContent = stages[index][0];
      root.querySelector('#hero-story-description').textContent = stages[index][1];
      root.querySelector('#hero-story-count').textContent = `0${index + 1} / 03`;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.heroStory) === index)));
    }
    buttons.forEach(button => button.addEventListener('click', () => select(Number(button.dataset.heroStory))));
    figure.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || !fine.matches || reduced.matches) return;
      const rect = figure.getBoundingClientRect();
      state.x = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      state.y = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      queue();
    }, { passive: true });
    figure.addEventListener('pointerleave', () => { state.x = state.y = 0; queue(); });
    select(0);
    return state;
  });
  function queue() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
  function paint() {
    frame = 0;
    const measured = states.map(state => [state, state.figure.getBoundingClientRect()]);
    for (const [state, box] of measured) {
      const active = fine.matches && !reduced.matches;
      const progress = reduced.matches ? 1 : clamp((innerHeight - box.top) / (innerHeight * .56 + box.height * .14), 0, 1);
      state.root.style.setProperty('--pottery-enter', progress.toFixed(4));
      state.root.style.setProperty('--pottery-x', active ? state.x.toFixed(4) : '0');
      state.root.style.setProperty('--pottery-y', active ? state.y.toFixed(4) : '0');
      state.root.classList.toggle('pottery-in-view', state.visible && !document.hidden && !reduced.matches);
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.find(item => item.figure === entry.target);
      state.visible = entry.isIntersecting;
    }
    queue();
  }, { threshold: 0 });
  states.forEach(state => observer.observe(state.figure));
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  function reset() { states.forEach(state => { state.x = state.y = 0; }); queue(); }
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame); frame = 0;
      states.forEach(state => state.root.classList.remove('pottery-in-view'));
    } else reset();
  });
  queue();
})();
