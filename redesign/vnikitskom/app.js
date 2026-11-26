(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
    );
  const arrow =
    '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const link = (url, label, cls = 'text-link') =>
    '<a class="' + cls + '" href="' + esc(url) + '">' + esc(label) + arrow + '</a>';
  const path = (file, params = {}) => {
    const p = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) if (val != null && val !== '') p.set(key, val);
    return file + (p.size ? '?' + p : '');
  };
  const cache = new Map();
  const get = (name) => {
    if (!cache.has(name))
      cache.set(
        name,
        fetch('assets/' + name).then((r) => {
          if (!r.ok) throw Error('Не удалось открыть каталог');
          return r.json();
        }),
      );
    return cache.get(name);
  };
  const money = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  window.Nik = { $, esc, arrow, link, path, get, money };
  const menu = $('#site-menu'),
    toggle = $('.menu-toggle');
  toggle.addEventListener('click', () => menu.showModal());
  $('.close-dialog', menu).addEventListener('click', () => menu.close());
  menu.addEventListener('click', (e) => {
    if (e.target === menu && e.clientX < menu.getBoundingClientRect().left) menu.close();
  });
  let navigatingFromMenu = false;
  menu.addEventListener('click', (event) => {
    const destination = event.target.closest('a[href]');
    if (!destination) return;
    navigatingFromMenu = true;
    menu.close();
    const url = new URL(destination.href);
    if (url.pathname === location.pathname && url.search === location.search && url.hash) {
      const section = document.getElementById(url.hash.slice(1));
      if (section) {
        section.setAttribute('tabindex', '-1');
        requestAnimationFrame(() => section.focus({ preventScroll: true }));
      }
    }
  });
  menu.addEventListener('close', () => {
    if (!navigatingFromMenu) toggle.focus({ preventScroll: true });
    navigatingFromMenu = false;
  });
  document.querySelectorAll('.desktop-nav a').forEach((a) => {
    if (new URL(a.href).pathname === location.pathname) a.setAttribute('aria-current', 'page');
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover:hover) and (pointer:fine)');
  function tracking(el, xprop, yprop, distance) {
    if (!el) return;
    const reset = () => {
      el.style.removeProperty(xprop);
      el.style.removeProperty(yprop);
    };
    el.addEventListener('pointermove', (e) => {
      if (!pointer.matches || motion.matches) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty(xprop, ((e.clientX - r.left) / r.width - 0.5) * distance + 'px');
      el.style.setProperty(yprop, ((e.clientY - r.top) / r.height - 0.5) * distance + 'px');
    });
    el.addEventListener('pointerleave', reset);
    motion.addEventListener('change', reset);
  }
  tracking($('.contact-hit'), '--mx', '--my', 6);
  tracking($('.plate-link'), '--dx', '--dy', 11);
  const lines = [
    ...document.querySelectorAll('.section-head .kicker i,.study .kicker i,.split-call .kicker i'),
  ];
  let frame = 0;
  function scrollLines() {
    frame = 0;
    for (const line of lines) {
      const progress = Math.max(
        0,
        Math.min(1, (innerHeight - line.getBoundingClientRect().top) / innerHeight),
      );
      line.style.transform = motion.matches ? '' : 'scaleX(' + (0.5 + progress * 0.8) + ')';
      line.style.transformOrigin = 'left';
    }
  }
  if (lines.length) {
    addEventListener(
      'scroll',
      () => {
        if (!frame) frame = requestAnimationFrame(scrollLines);
      },
      { passive: true },
    );
    motion.addEventListener('change', scrollLines);
    scrollLines();
  }
  if ($('#study')) {
    const notes = [
      [
        'Переплёт',
        'Крышки и корешок покрывает золотое тиснение. Кожаный переплёт сохранился со времени издания.',
      ],
      [
        'Титульный лист',
        'Титул выгравирован. Внутри книги набор изображений продолжают девять разворотных гравюр.',
      ],
      [
        'След воды',
        'У верхнего края листа виден развод от воды. Дом отдельно отмечает его в описании сохранности.',
      ],
    ];
    const seen = new Set(),
      buttons = [...document.querySelectorAll('[data-mark]')];
    const count = $('#mark-count'),
      annotation = $('#annotation'),
      reset = $('#study-reset');
    function progress() {
      count.textContent = seen.size === 3 ? 'Все три детали найдены' : seen.size + ' из 3 деталей';
      document.querySelectorAll('.ticks i').forEach((el, i) => el.classList.toggle('on', i < seen.size));
      reset.hidden = seen.size !== 3;
    }
    buttons.forEach((button, i) =>
      button.addEventListener('click', () => {
        seen.add(i);
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        annotation.innerHTML = '<strong>' + notes[i][0] + '</strong><p>' + notes[i][1] + '</p>';
        progress();
      }),
    );
    reset.addEventListener('click', () => {
      seen.clear();
      buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      annotation.innerHTML = '<strong>С чего начать?</strong><p>Выберите метку на фотографии.</p>';
      progress();
      buttons[0].focus({ preventScroll: true });
    });
  }
  if ($('#letter-form')) {
    const form = $('#letter-form'),
      panel = $('#letter-preview'),
      params = new URLSearchParams(location.search);
    const topics = {
      buy: 'Участие в торгах',
      sell: 'Оценка предмета',
      shop: 'Издание магазина',
      visit: 'Посещение дома',
    };
    const topic = params.get('topic');
    if (Object.hasOwn(topics, topic)) form.elements.topic.value = topic;
    form.elements.subject.value = (params.get('subject') || '').slice(0, 260);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = form.elements.message,
        body = message.value.trim();
      if (!body) {
        message.setCustomValidity('Введите вопрос');
        message.reportValidity();
        return;
      }
      const subject = [topics[form.elements.topic.value], form.elements.subject.value.trim()]
        .filter(Boolean)
        .join(' — ');
      $('#mail-subject').textContent = subject;
      $('#mail-body').textContent = body;
      $('#open-mail').href =
        'mailto:info@vnikitskom.ru?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);
      form.hidden = true;
      panel.hidden = false;
      panel.focus();
    });
    form.elements.message.addEventListener('input', () => form.elements.message.setCustomValidity(''));
    $('#edit-letter').addEventListener('click', () => {
      panel.hidden = true;
      form.hidden = false;
      form.elements.message.focus();
    });
  }
})();
