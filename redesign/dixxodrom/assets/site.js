'use strict';
(() => {
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const make = (tag, content, className) => {
    const el = document.createElement(tag);
    if (content !== undefined) el.textContent = content;
    if (className) el.className = className;
    return el;
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const menu = one('#mobile-nav');
  const toggle = one('.menu-toggle');
  function setMenu(open, restore = false) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (restore) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!menu.hidden && !event.target.closest('.head')) setMenu(false);
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('focusin', (event) => {
    if (!menu.hidden && !event.target.closest('.head')) setMenu(false);
  });
  matchMedia('(min-width: 881px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  const scenes = all('.motion-scene,.magnet');
  for (const scene of scenes) {
    scene.addEventListener('pointermove', (event) => {
      if (reduced.matches || !pointer.matches || event.pointerType === 'touch') return;
      const box = scene.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (2 * (event.clientX - box.left)) / box.width - 1));
      const y = Math.max(-1, Math.min(1, (2 * (event.clientY - box.top)) / box.height - 1));
      if (scene.classList.contains('magnet')) {
        scene.style.setProperty('--mx', (x * 3).toFixed(2) + 'px');
        scene.style.setProperty('--my', (y * 2.4).toFixed(2) + 'px');
      } else {
        scene.style.setProperty('--px', (x * 4).toFixed(2) + 'px');
        scene.style.setProperty('--py', (y * 3).toFixed(2) + 'px');
        scene.style.setProperty('--light', Math.round(50 + x * 35) + '%');
      }
    });
    scene.addEventListener('pointerleave', () => {
      for (const key of ['--px', '--py', '--mx', '--my', '--light']) scene.style.removeProperty(key);
    });
  }
  const stripes = all('.photo-bar,.finish-check,.track-figure');
  let queued = false;
  function paintScroll() {
    queued = false;
    if (reduced.matches) return;
    for (const stripe of stripes) {
      const box = stripe.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      const progress = Math.max(0, Math.min(1, (innerHeight - box.top) / (innerHeight + box.height)));
      stripe.style.setProperty('--travel', (14 * progress).toFixed(1) + 'px');
      stripe.style.setProperty('--sweep', (0.33 + 0.67 * progress).toFixed(3));
    }
  }
  function onScroll() {
    if (!queued && !reduced.matches) {
      queued = true;
      requestAnimationFrame(paintScroll);
    }
  }
  if (stripes.length) {
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const prices = {
    junior: { name: 'Карт 5,5 л. с.', weekday: 1300, weekend: 1500, unit: 'за пилота' },
    full: { name: 'Карт 9 л. с.', weekday: 1500, weekend: 1700, unit: 'за пилота' },
    pair: { name: 'Двухместный карт', weekday: 1900, weekend: 2200, unit: 'за экипаж' },
  };
  const people = { child: 'Ребёнок', adult: 'Взрослый', student: 'Студент', pair: 'Взрослый и ребёнок' };
  const cash = (n) => n.toLocaleString('ru-RU') + ' ₽';
  const tel = 'tel:+74997859546';
  const phoneLabel = '+7 (499) 785-95-46';
  function visitDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value ? date : null;
  }
  const dayType = (date) => ([0, 6].includes(date.getUTCDay()) ? 'weekend' : 'weekday');
  function rideChoice(params) {
    const who = params.get('who');
    let day = params.get('day');
    if (!Object.hasOwn(people, who) || !['weekday', 'weekend'].includes(day)) return null;
    const pair = who === 'pair';
    const raw = params.get(pair ? 'age' : 'height');
    if (!raw || !/^\d{1,3}(\.\d+)?$/.test(raw)) return null;
    const measure = Number(raw);
    if (pair ? !Number.isInteger(measure) || measure > 17 : measure <= 0 || measure > 300) return null;
    const offer = params.get('offer') === 'on';
    const date = offer && visitDate(params.get('date'));
    const time = offer && params.get('time');
    if (offer && (!date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time || ''))) return null;
    if (date) day = dayType(date);
    return { who, day, measure, pair, offer, date, time };
  }
  function evaluate(ride) {
    const { pair, measure, day, who, date, time } = ride;
    if (pair && measure >= 7)
      return {
        title: 'Пассажиру уже 7 лет',
        note: 'Клуб указывает двухместный заезд для взрослого и ребёнка младше 7 лет. Для самостоятельного заезда выберите «Ребёнок» и укажите рост.',
      };
    if (!pair && measure < 110)
      return {
        title: 'Уточните вариант в прокате',
        note: 'Разовый заезд за рулём доступен при росте от 110 см. Для ребёнка младше 7 лет можно проверить двухместный карт со взрослым.',
      };
    if (!pair && measure === 140)
      return {
        title: 'При росте 140 см — звонок в прокат',
        note: 'В одном прайсе клуб допускает к карту 9 л. с. при росте выше 140 см, в другом — от 140 см. Прокат подтвердит подходящий карт и его цену.',
      };
    const kart = pair ? prices.pair : measure < 140 ? prices.junior : prices.full;
    let price = kart[day];
    let note = '';
    if (date) {
      const opening = date.getUTCDay() === 1 ? '12:00' : '11:00';
      const odd = date.getUTCDate() % 2 === 1;
      const category =
        (who === 'child' && kart === prices.junior && odd) ||
        (who === 'student' && kart === prices.full && !odd);
      if (time < opening || time >= '22:00') {
        return {
          title: 'Прокат в это время закрыт',
          note:
            'В выбранный день клуб открыт с ' +
            opening +
            ' до 22:00. Измените время, чтобы рассчитать заезд.',
        };
      }
      if (category && day === 'weekday' && time >= '11:00' && time < '14:00') {
        price = 1000;
        note = 'Цена по акции «Счастливый час».';
      } else {
        note = 'Для выбранной даты, времени и категории действует обычный тариф.';
      }
    }
    return { title: kart.name, kart, price, note };
  }
  function summary(ride) {
    const detail = ride.pair ? 'пассажир, полных лет: ' + ride.measure : ride.measure + ' см';
    const day = ride.day === 'weekday' ? 'будний день' : 'выходной';
    const when = ride.date
      ? ride.date.toLocaleDateString('ru-RU', { timeZone: 'UTC' }) + ', ' + ride.time
      : day;
    return [people[ride.who], detail, when].join(' · ');
  }
  function linked(text, url, style) {
    const el = make('a', text, style);
    el.href = url;
    const icon = one('.magnet .arrow');
    if (icon) el.append(icon.cloneNode(true));
    return el;
  }
  function renderResult(root, ride, params) {
    const result = evaluate(ride);
    const frag = document.createDocumentFragment();
    frag.append(make('p', summary(ride), 'help'), make('h3', result.title, 'result-title'));
    if (result.kart) {
      frag.append(
        make('p', cash(result.price), 'result-total'),
        make('p', '10 минут · ' + result.kart.unit, 'result-meta'),
      );
      const comparisons = make('div', undefined, 'comparison');
      for (const [day, label] of [
        ['weekday', 'Будни'],
        ['weekend', 'Выходные'],
      ]) {
        const col = make('div', undefined, ride.day === day ? 'active' : '');
        col.append(make('span', label + ' · база'), make('b', cash(result.kart[day])));
        comparisons.append(col);
      }
      frag.append(comparisons);
    }
    if (result.note) frag.append(make('p', result.note, 'help'));
    frag.append(make('p', 'Свободное время согласуйте с прокатом.', 'help'));
    const links = make('div', undefined, 'result-links');
    const dial = linked('', tel, 'btn primary');
    const dialLabel = make('span', undefined, 'dial-label');
    dialLabel.append(make('span', 'Позвонить в прокат'), make('strong', phoneLabel));
    dial.prepend(dialLabel);
    links.append(
      dial,
      linked('Контакты и маршрут', 'contacts.html?' + params + '#rental', 'text-link'),
    );
    frag.append(links);
    root.replaceChildren(frag);
  }
  const form = one('#ride-form');
  if (form) {
    const fields = form.elements;
    const result = one('#ride-result');
    const initial = result.innerHTML;
    const promo = one('#promo');
    const offer = one('#offer');
    let rendered = false;
    function syncInputs() {
      const pair = fields.who.value === 'pair';
      one('#child-help').hidden = fields.who.value !== 'child';
      one('#height-field').hidden = pair;
      fields.height.disabled = pair;
      fields.height.required = !pair;
      one('#pair-fields').hidden = !pair;
      fields.age.disabled = !pair;
      fields.age.required = pair;
      one('#promo-fields').hidden = !offer.checked;
      for (const f of [fields.date, fields.time]) {
        f.disabled = !offer.checked;
        f.required = offer.checked;
      }
      if (offer.checked) promo.open = true;
    }
    function updateResult(moveFocus = false) {
      const params = new URLSearchParams(new FormData(form));
      const ride = rideChoice(params);
      if (!ride) return;
      params.set('day', ride.day);
      renderResult(result, ride, params);
      rendered = true;
      history.replaceState(null, '', location.pathname + '?' + params + (location.hash || '#picker'));
      if (moveFocus) {
        result.focus({ preventScroll: true });
        if (!matchMedia('(min-width: 681px)').matches) result.scrollIntoView({ block: 'start' });
      }
    }
    form.addEventListener('input', (event) => {
      if (event.target === fields.date) {
        const date = visitDate(fields.date.value);
        if (date) fields.day.value = dayType(date);
      } else if (event.target.name === 'day' && fields.date.value) {
        const date = visitDate(fields.date.value);
        if (date && dayType(date) !== fields.day.value) fields.date.value = '';
      }
      syncInputs();
      if (rendered) {
        result.innerHTML = initial;
        rendered = false;
        history.replaceState(null, '', location.pathname + (location.hash || '#picker'));
      }
    });
    form.addEventListener(
      'invalid',
      (event) => {
        if (event.target.closest('#promo')) promo.open = true;
      },
      true,
    );
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      promo.open = true;
      if (form.reportValidity()) updateResult(true);
    });
    const saved = new URLSearchParams(location.search);
    if (rideChoice(saved)) {
      fields.who.value = saved.get('who');
      fields.day.value = saved.get('day');
      for (const key of ['height', 'age', 'date', 'time']) fields[key].value = saved.get(key) || '';
      offer.checked = saved.get('offer') === 'on';
      syncInputs();
      updateResult();
    } else syncInputs();
  }
  const selected = one('#selected-ride');
  if (selected) {
    const params = new URLSearchParams(location.search);
    const ride = rideChoice(params);
    if (ride) {
      const selection = evaluate(ride);
      selected.hidden = false;
      selected.append(
        make('h3', 'Ваш выбор'),
        make('p', summary(ride)),
        make(
          'p',
          selection.kart
            ? selection.title + ' · 10 минут · ' + cash(selection.price) + ' ' + selection.kart.unit
            : selection.title,
        ),
        linked('Изменить подбор', 'index.html?' + params + '#picker', 'text-link'),
      );
    }
  }

  const board = one('#game');
  if (board) {
    const button = one('#game-button');
    const read = one('#game-read');
    const lamps = all('.lamps i', board);
    const icon = one('.arrow', button);
    const pending = new Set();
    let startedAt = 0;
    function clear() {
      pending.forEach(clearTimeout);
      pending.clear();
    }
    function later(fn, ms) {
      const id = setTimeout(() => {
        pending.delete(id);
        fn();
      }, ms);
      pending.add(id);
    }
    function state(name, label, action) {
      board.dataset.state = name;
      read.textContent = label;
      button.replaceChildren(document.createTextNode(action + ' '), icon);
    }
    function reset() {
      clear();
      lamps.forEach((lamp) => lamp.classList.remove('hot'));
      state('idle', 'Готовы к старту?', 'Начать заезд');
    }
    function arm() {
      clear();
      lamps.forEach((lamp) => lamp.classList.remove('hot'));
      state('wait', 'Ждите сигнала…', 'Газ');
      lamps[0].classList.add('hot');
      for (let i = 1; i < lamps.length; i++) later(() => lamps[i].classList.add('hot'), i * 330);
      later(
        () => {
          state('go', 'Старт!', 'Газ');
          startedAt = performance.now();
        },
        1560 + Math.random() * 1650,
      );
    }
    button.addEventListener('keydown', (event) => {
      if (event.repeat && ['Enter', ' '].includes(event.key)) event.preventDefault();
    });
    button.addEventListener('click', () => {
      const phase = board.dataset.state;
      if (phase === 'wait') {
        clear();
        state('false', 'Фальстарт', 'Новый заезд');
      } else if (phase === 'go') {
        const elapsed = Math.max(1, Math.round(performance.now() - startedAt));
        state('done', elapsed.toLocaleString('ru-RU') + ' мс', 'Новый заезд');
      } else arm();
    });
    board.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') reset();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && ['wait', 'go'].includes(board.dataset.state)) reset();
    });
    addEventListener('pagehide', reset);
  }
})();
