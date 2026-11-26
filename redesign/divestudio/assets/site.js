'use strict';

const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function wireMenu() {
  const dialog = one('#menu');
  const open = one('[data-menu-open]');
  open.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    open.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    one('[data-menu-close]', dialog).focus();
  });
  one('[data-menu-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('a') || (event.target === dialog && !inside(event, dialog))) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('menu-open');
    open.setAttribute('aria-expanded', 'false');
    open.focus({ preventScroll: true });
  });
}

function inside(point, element) {
  const box = element.getBoundingClientRect();
  return (
    point.clientX >= box.left &&
    point.clientX <= box.right &&
    point.clientY >= box.top &&
    point.clientY <= box.bottom
  );
}

function wireWater() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const scenes = all('[data-water]');
  const active = new Set();
  let frame = 0;
  function render() {
    frame = 0;
    if (reduced.matches) return;
    for (const scene of active) {
      const rect = scene.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      scene.style.setProperty('--s', (progress - 0.5).toFixed(3));
    }
  }
  function update() {
    if (!frame && !reduced.matches) frame = requestAnimationFrame(render);
  }
  const view = new IntersectionObserver((entries) => {
    entries.forEach((entry) =>
      entry.isIntersecting ? active.add(entry.target) : active.delete(entry.target),
    );
    update();
  });
  scenes.forEach((scene) => view.observe(scene));
  const magnet = one('.magnet');
  const motionTargets = [magnet, ...scenes];
  motionTargets.forEach((target) => {
    let rect;
    let request = 0;
    let point;
    target.addEventListener('pointerenter', () => {
      rect = target.getBoundingClientRect();
    });
    target.addEventListener('pointermove', (event) => {
      if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
      point = { x: event.clientX, y: event.clientY };
      if (request) return;
      request = requestAnimationFrame(() => {
        request = 0;
        if (!point || !rect) return;
        const norm = (value, start, size) => Math.max(-1, Math.min(1, ((value - start) / size) * 2 - 1));
        target.style.setProperty('--mx', norm(point.x, rect.left, rect.width).toFixed(3));
        target.style.setProperty('--my', norm(point.y, rect.top, rect.height).toFixed(3));
      });
    });
    target.addEventListener('pointerleave', () => {
      point = null;
      target.style.removeProperty('--mx');
      target.style.removeProperty('--my');
    });
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  reduced.addEventListener('change', update);
}

const rubles = (amount) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
const currentDate = () =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const dayOf = (value) => {
  if (!value) return null;
  const day = new Date(value + 'T12:00:00Z').getUTCDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
};
const longDate = (value) =>
  new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value + 'T12:00:00Z'));
const cleanGuests = (field) =>
  field.validity.valid && Number.isInteger(field.valueAsNumber) && field.valueAsNumber > 0;
const outText = { memo: '', request: '' };

const poolKit = 'Купальный костюм или плавки, сменная обувь и полотенце каждому гостю.';
const studioRoute =
  'Москва, ул. Автозаводская, 21, ФОК «Торпедо». От метро «Автозаводская» около 7 минут, от МЦК ЗИЛ около 5 минут. Центральный вход, прямо до автоматов, налево до серой двери, по лестнице на 2 этаж.';
const programs = {
  dsd: {
    kit: 'Полный комплект для погружения, материалы eLearning и сертификат участника входят в стоимость.',
    take: poolKit + ' Медицинскую анкету можно заранее попросить у инструктора.',
  },
  referral: {
    kit: 'Снаряжение на пять занятий в бассейне и материалы eLearning включены. После успешного завершения получите форму Referral.',
    take: poolKit + ' Уточните у инструктора подготовку к плавательному тесту.',
  },
  bubblemaker: {
    price: 6500,
    kit: 'Инструктор подберёт детский комплект и поможет его надеть. В программе один спуск и диплом. Условия аренды и дополнительного сертификата уточните у студии.',
    take: poolKit + ' Согласуйте возраст ребёнка, документы и размер снаряжения.',
  },
  seal: {
    price: 30000,
    kit: 'Включены учебник, брифинги, снаряжение, пять аквамиссий и сертификат Seal Team.',
    take: poolKit + ' Согласуйте документы и размер детского комплекта.',
  },
  'master-seal': {
    price: 55000,
    kit: 'Включены учебник, брифинги, снаряжение, десять аквамиссий и сертификат Master Seal Team.',
    take: poolKit + ' Сообщите инструктору о прохождении Seal Team.',
  },
  'open-water': {},
  mermaid: {},
  gift: {},
  other: {},
};

function wireForm(form, mode) {
  const isMemo = mode === 'memo';
  const program = form.elements.program;
  const guests = form.elements.guests;
  const date = form.elements.date;
  const together = form.elements.together;
  const topic = form.elements.topic;
  const result = one('#' + mode + '-result');
  const params = new URLSearchParams(location.search);
  if (all('option', program).some((option) => option.value === params.get('program')))
    program.value = params.get('program');
  const raw = Number(params.get('guests'));
  if (Number.isInteger(raw) && raw >= 1 && raw <= 99) guests.value = raw;
  if (!isMemo) {
    date.min = currentDate();
    if (params.get('day') === 'weekday') form.elements.day.value = 'weekday';
    if (/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') && params.get('date') >= date.min) {
      date.value = params.get('date');
      if (date.value) form.elements.day.value = dayOf(date.value);
    }
    together.checked = params.get('together') === '1';
    topic.value = (params.get('topic') || '').slice(0, 140);
  }

  function price() {
    const count = guests.valueAsNumber;
    if (!cleanGuests(guests))
      return { total: null, value: 'Укажите число гостей', note: 'Введите целое число от 1 до 99.' };
    if (program.value === 'dsd') {
      const discount = count >= 2 && form.elements.day.value === 'weekday' && together.checked;
      const total = count * (discount ? 5400 : 6000);
      const condition = discount
        ? 'Скидка 10% за одновременную оплату и прохождение.'
        : 'В будни для компании от двух гостей действует скидка 10% при одновременной оплате и прохождении.';
      return { total, value: rubles(total), note: 'Снаряжение включено. ' + condition, discount };
    }
    const config = programs[program.value];
    if (config && config.price)
      return {
        total: count * config.price,
        value: rubles(count * config.price),
        note:
          program.value === 'bubblemaker'
            ? 'Диплом входит в программу. Условия аренды и дополнительного сертификата уточните у студии.'
            : 'Снаряжение, учебник и сертификат включены.',
      };
    const notes = {
      referral:
        'За человека в бассейне: 33 000 ₽ в мини-группе, 42 000 ₽ индивидуально или 38 000 ₽ в паре по индивидуальному графику. Снаряжение включено.',
      'open-water':
        'Цена зависит от места и формата экзамена. В Подмосковье аренда включена, на море оплачивается отдельно.',
      mermaid: 'Бассейн у метро «Авиамоторная». Инструктор уточнит программу, адрес занятия и цену.',
      gift: 'Стоимость зависит от программы, которую вы выберете в подарок.',
      other: 'Инструктор уточнит расписание и условия выбранной программы.',
    };
    return { total: null, value: 'По программе', note: notes[program.value] };
  }

  function state() {
    const p = new URLSearchParams({ program: program.value, guests: guests.value });
    if (!isMemo) {
      p.set('day', form.elements.day.value);
      if (date.value) p.set('date', date.value);
      if (
        program.value === 'dsd' &&
        form.elements.day.value === 'weekday' &&
        guests.valueAsNumber >= 2 &&
        together.checked
      )
        p.set('together', '1');
      if (program.value === 'other' && topic.value.trim()) p.set('topic', topic.value.trim());
    }
    return p;
  }

  function refresh(syncUrl = true) {
    for (const button of all('[data-step]', form)) {
      button.disabled = button.dataset.step === '-1' ? guests.valueAsNumber <= 1 : guests.valueAsNumber >= 99;
    }
    if (!isMemo) {
      const eligible =
        program.value === 'dsd' && guests.valueAsNumber >= 2 && form.elements.day.value === 'weekday';
      one('#joint-row').hidden = !eligible;
      one('#topic-row').hidden = program.value !== 'other';
      const quote = price();
      one('#quote-label').textContent =
        quote.total === null
          ? 'Стоимость'
          : guests.valueAsNumber === 1
            ? 'За одного гостя'
            : 'За всех гостей';
      one('#quote-value').textContent = quote.value;
      one('#quote-text').textContent = quote.note;
    }
    if (syncUrl && cleanGuests(guests)) {
      const url = new URL(location.href);
      url.search = state().toString();
      history.replaceState(null, '', url);
    }
  }

  form.addEventListener('input', (event) => {
    if (!isMemo && event.target === date && date.value) form.elements.day.value = dayOf(date.value);
    if (!isMemo && event.target.name === 'day' && date.value && dayOf(date.value) !== form.elements.day.value)
      date.value = '';
    refresh();
  });
  for (const button of all('[data-step]', form))
    button.addEventListener('click', () => {
      const value = cleanGuests(guests) ? guests.valueAsNumber : 1;
      guests.value = Math.max(1, Math.min(99, value + Number(button.dataset.step)));
      refresh();
    });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const selected = program.selectedOptions[0].textContent;
    if (isMemo) {
      const data = programs[program.value];
      const sections = [
        ['Что взять', data.take],
        ['Что выдадут', data.kit],
        ['Как добраться', studioRoute],
        [
          'У кого согласовать время',
          'Наталья Семенкова, +7 926 494-46-73, Telegram @nat_semenkova. Почта студии: info@divestudio.ru. Дождитесь подтверждения даты.',
        ],
      ];
      const dl = one('#memo-list');
      dl.replaceChildren();
      for (const [title, value] of sections) {
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = title;
        dd.textContent = value;
        dl.append(dt, dd);
      }
      const heading = selected + ' · гостей: ' + guests.value;
      one('#memo-meta').textContent = heading;
      one('#memo-request').href = 'contacts.html?' + state() + '#request';
      outText.memo = heading + '\n\n' + sections.map(([title, value]) => title + '\n' + value).join('\n\n');
    } else {
      const quote = price();
      const timing = date.value
        ? longDate(date.value)
        : form.elements.day.value === 'weekday'
          ? 'в будний день'
          : 'в выходной день';
      const name = program.value === 'other' && topic.value.trim() ? topic.value.trim() : selected;
      const lines = [
        program.value === 'gift' || program.value === 'other'
          ? 'Здравствуйте! У меня вопрос для студии.'
          : 'Здравствуйте! Хочу согласовать время занятия.',
        'Программа: ' + name + '.',
        'Число гостей: ' + guests.value + '.',
        'Удобно: ' + timing.replace(/\.$/u, '') + '.',
      ];
      if (quote.total !== null) lines.push('Стоимость по прайсу: ' + quote.value + '.');
      if (quote.discount) lines.push('Оплачиваем и проходим программу одновременно, учитываем скидку 10%.');
      lines.push('Подскажите, пожалуйста, возможное время и подтвердите условия.');
      outText.request = lines.join('\n');
      one('#draft-text').textContent = outText.request;
      const message = encodeURIComponent(outText.request);
      one('.to-telegram').href = 'https://t.me/nat_semenkova?text=' + message;
      one('.to-whatsapp').href = 'https://wa.me/79264944673?text=' + message;
      one('.to-email').href =
        'mailto:info@divestudio.ru?subject=' +
        encodeURIComponent('Вопрос о программе: ' + name) +
        '&body=' +
        message;
    }
    refresh();
    form.hidden = true;
    result.hidden = false;
    one('.copy-status', result).textContent = '';
    one('h3', result).focus();
  });
  one('#' + mode + '-edit').addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    program.focus();
  });
  refresh(false);
}

async function copyOutput(button) {
  const value = outText[button.dataset.copy];
  if (!value) return;
  const output = button.closest('.output');
  const status = one('.copy-status', output);
  let copied = false;
  try {
    await navigator.clipboard.writeText(value);
    copied = true;
  } catch {
    const box = document.createElement('textarea');
    box.value = value;
    box.className = 'copy-box';
    output.append(box);
    box.select();
    try {
      copied = document.execCommand('copy');
    } catch {}
    box.remove();
    button.focus({ preventScroll: true });
  }
  status.textContent = copied ? 'Скопировано.' : 'Выделите и скопируйте текст выше.';
}

wireMenu();
wireWater();
if (one('#request-form')) wireForm(one('#request-form'), 'request');
if (one('#memo-form')) wireForm(one('#memo-form'), 'memo');
all('[data-copy]').forEach((button) => button.addEventListener('click', () => copyOutput(button)));
