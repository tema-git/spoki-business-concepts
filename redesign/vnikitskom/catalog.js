(() => {
  'use strict';
  const { $, esc, arrow, link, path, get, money } = window.Nik;
  const query = new URLSearchParams(location.search);
  const lotMeta = {
    '317-1': {
      short: 'Коронация Людовика XV',
      edition: '1722. Место печати в каталоге предположительно указано как Париж.',
      physical: '62,5 × 47 см. Цельногравированное издание с девятью гравюрами на разворотах.',
      binding: 'Цельнокожаный переплёт эпохи с золотым тиснением по крышкам и корешку.',
      condition:
        'Потёртости переплёта, развод от воды по верхнему краю страниц, залом листа с гравюрой.',
      labels: [
        'Переплёт',
        'Гравированный титул',
        'Страница в гравированной рамке',
        'Разворот. Церемония коронации',
        'Придворный костюм',
        'Разворот с гравюрой',
      ],
    },
    '317-7': {
      short: 'Путешествие по разным провинциям Российской империи',
      author: 'Пётр Симон Паллас',
      edition:
        'Санкт-Петербург, Императорская Академия наук, 1773–1788. Первое издание на русском языке.',
      physical: 'Три части в пяти книгах. 25,3 × 19 см.',
      binding: 'Пять цельнокожаных переплётов эпохи.',
      condition: 'У первой части есть трещина на корешке.',
    },
    '317-5': {
      short: 'О воспитании девиц',
      author: 'Франсуа Фенелон',
      edition: 'Санкт-Петербург, 1763. Перевод Ивана Туманского.',
    },
    '316-62': {
      short: 'Стихотворения',
      author: 'Александр Сергеевич Пушкин',
      edition: 'Санкт-Петербург, издание А. С. Суворина, 1887.',
      physical: '288, XV, [1] с. · 15,3 × 10,7 см.',
      binding: 'Составной владельческий переплёт эпохи.',
      condition: 'Потёрты крышки и корешок. В верхней части книжного блока видны следы залития.',
      labels: ['Титульный лист', 'Владельческий переплёт'],
    },
  };
  const meta = (r) => lotMeta[r.a + '-' + r.n] || {};
  const short = (r) =>
    meta(r).short ||
    (r.title.length > 115 ? r.title.slice(0, 111).replace(/\s+\S*$/, '') + '…' : r.title);
  const clean = (s) =>
    String(s)
      .toLocaleLowerCase('ru')
      .replaceAll('ё', 'е')
      .replace(/[^а-яa-z0-9]+/gi, ' ')
      .trim();
  const countWord = (n) =>
    n % 10 === 1 && n % 100 !== 11
      ? 'лот'
      : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
        ? 'лота'
        : 'лотов';
  const catalogURL = (scope, q = '', p = 1) =>
    path('catalog.html', { a: scope, q, page: p > 1 ? p : '' });
  const bidURL = (r) =>
    r.bid
      ? 'https://ru.bidspirit.com/ui/lotPage/vnikitskom/source/catalog/auction/82767/lot/' +
        encodeURIComponent(r.bid) +
        '/view?lang=ru'
      : '';
  function empty(head, body, url, label) {
    return (
      '<div class="empty"><h2>' +
      esc(head) +
      '</h2><p>' +
      esc(body) +
      '</p>' +
      link(url, label) +
      '</div>'
    );
  }
  function matches(r, term) {
    if (!term) return true;
    const number = term.match(/^\s*(?:лот\s*)?[№#]?\s*(\d+[а-яa-z]?)\s*$/i);
    if (number) return r.n.toLowerCase() === number[1].toLowerCase();
    const words = clean(term).split(/\s+/).filter(Boolean);
    const hay = clean(
      'лот ' +
        r.n +
        ' ' +
        r.a +
        ' ' +
        r.title +
        ' ' +
        (meta(r).author || '') +
        ' ' +
        (meta(r).short || ''),
    );
    return words.every((w) => hay.includes(w));
  }
  function rowHTML(r, scope, term, p) {
    const url = path('lot.html', {
      a: r.a,
      lot: r.n,
      scope: scope == r.a ? '' : scope,
      q: term,
      page: p > 1 ? p : '',
    });
    const desc = r.sale
      ? 'Цена продажи ' + money(r.sale)
      : r.status || (r.estimate != null ? 'Эстимейт ' + money(r.estimate) : '');
    return (
      '<a class="lot-card" href="' +
      esc(url) +
      '"><div class="card-image"><img loading="lazy" src="' +
      esc(r.image) +
      '" alt=""></div><div class="card-meta"><span>Лот ' +
      esc(r.n) +
      '</span><span>№ ' +
      r.a +
      '</span></div><h3>' +
      esc(short(r)) +
      '</h3>' +
      (desc ? '<span class="money-line">' + esc(desc) + '</span>' : '') +
      '</a>'
    );
  }
  async function catalog() {
    const scope = ['317', '316', 'all'].includes(query.get('a')) ? query.get('a') : '317';
    const control = $('#catalog-controls'),
      output = $('#catalog-output');
    const tabs = [
      ['317', 'Аукцион № 317'],
      ['316', 'Архив № 316'],
      ['all', 'Оба каталога'],
    ];
    control.innerHTML =
      '<form role="search" class="catalog-search"><label class="search-box"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.4"/><path d="m15 15 6 6"/></svg><input type="search" aria-label="Поиск по автору, названию или номеру лота" placeholder="Автор, название или номер лота"><button type="submit">Найти</button></label></form><nav class="tabs" aria-label="Выбор каталога"></nav><p class="source-note" id="catalog-context"></p>';
    const field = $('input', control);
    field.value = query.get('q') || '';
    $('#catalog-context').textContent =
      scope === '317'
        ? '17 декабря 2026 · 18:00 мск · Каталог опубликован домом'
        : scope === '316'
          ? '19 ноября 2026 · Торги завершены'
          : 'Предстоящие торги № 317 и результаты № 316';
    const data = (
      await Promise.all((scope === 'all' ? [317, 316] : [scope]).map((s) => get(s + '.json')))
    ).flat();
    let page = Math.max(1, Number.parseInt(query.get('page'), 10) || 1);
    function paint() {
      const term = field.value.trim(),
        rows = data.filter((r) => matches(r, term));
      const size = 18,
        pages = Math.ceil(rows.length / size);
      page = Math.min(page, pages || 1);
      const dest = catalogURL(scope, term, page);
      history.replaceState(null, '', dest);
      $('.tabs', control).innerHTML = tabs
        .map(
          ([s, t]) =>
            '<a href="' +
            esc(catalogURL(s, term)) +
            '"' +
            (scope === s ? ' aria-current="page"' : '') +
            '>' +
            t +
            '</a>',
        )
        .join('');
      const count = rows.length + ' ' + countWord(rows.length);
      if (!rows.length) {
        output.innerHTML =
          '<p class="catalog-bar" role="status">Найдено 0 лотов</p>' +
          empty(
            'Совпадений нет',
            'Попробуйте фамилию автора, часть названия или точный номер лота.',
            catalogURL(scope),
            'Сбросить поиск',
          );
        output.setAttribute('aria-busy', 'false');
        return;
      }
      const numbers = Array.from(
        new Set([1, page - 1, page, page + 1, pages].filter((n) => n >= 1 && n <= pages)),
      ).sort((a, b) => a - b);
      const pag = numbers
        .map(
          (n, i) =>
            (i && n - numbers[i - 1] > 1 ? '<span>…</span>' : '') +
            '<a href="' +
            esc(catalogURL(scope, term, n)) +
            '" aria-label="Страница ' +
            n +
            '"' +
            (page === n ? ' aria-current="page"' : '') +
            '>' +
            n +
            '</a>',
        )
        .join('');
      const last = Math.min(page * size, rows.length);
      output.innerHTML =
        '<div class="catalog-bar"><strong role="status">' +
        count +
        '</strong><span>' +
        ((page - 1) * size + 1) +
        '–' +
        last +
        '</span></div><div class="catalog-grid">' +
        rows
          .slice((page - 1) * size, last)
          .map((r) => rowHTML(r, scope, term, page))
          .join('') +
        '</div>' +
        (pages > 1 ? '<nav class="pages" aria-label="Страницы каталога">' + pag + '</nav>' : '');
      output.setAttribute('aria-busy', 'false');
    }
    field.addEventListener('input', () => {
      page = 1;
      paint();
    });
    $('form', control).addEventListener('submit', (e) => {
      e.preventDefault();
      page = 1;
      paint();
    });
    paint();
  }
  function gallery(root, photos, labels, fallback, title) {
    const stage = $('.gallery-stage', root),
      mainImg = $('img', stage),
      strip = $('.gallery-strip', root);
    const dlg = $('#photo-dialog'),
      large = $('.viewer-photo img', dlg),
      holder = $('.viewer-photo', dlg),
      position = $('.gallery-pos', dlg),
      zoom = $('[data-zoom]', dlg);
    let index = 0,
      expanded = false;
    const label = (i) => labels[i] || title + ' · фото ' + (i + 1);
    strip.innerHTML = photos
      .map(
        (src, i) =>
          '<button type="button" data-photo="' +
          i +
          '" aria-label="Фото ' +
          (i + 1) +
          '. ' +
          esc(label(i)) +
          '"><img src="' +
          esc(src) +
          '" loading="lazy" alt=""></button>',
      )
      .join('');
    const buttons = [...strip.querySelectorAll('button')];
    function setZoom(v) {
      expanded = v;
      holder.classList.toggle('enlarged', v);
      zoom.setAttribute('aria-pressed', String(v));
      zoom.textContent = v ? 'Целиком' : 'Увеличить';
      holder.scrollTo(0, 0);
    }
    function choose(i) {
      index = (i + photos.length) % photos.length;
      mainImg.src = photos[index];
      mainImg.alt = label(index);
      large.src = photos[index];
      large.alt = label(index);
      position.textContent = index + 1 + ' / ' + photos.length;
      stage.setAttribute('aria-label', 'Рассмотреть фото ' + (index + 1) + '. ' + label(index));
      buttons.forEach((b, num) => b.setAttribute('aria-pressed', String(num === index)));
      setZoom(false);
    }
    root.addEventListener(
      'error',
      (e) => {
        if (e.target.tagName === 'IMG' && e.target.getAttribute('src') !== fallback)
          e.target.src = fallback;
      },
      true,
    );
    large.addEventListener('error', () => {
      if (large.getAttribute('src') !== fallback) large.src = fallback;
    });
    strip.addEventListener('click', (e) => {
      const b = e.target.closest('[data-photo]');
      if (b) choose(+b.dataset.photo);
    });
    stage.addEventListener('click', () => {
      dlg.showModal();
      $('.close-view', dlg).focus();
    });
    $('.close-view', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => {
      setZoom(false);
      stage.focus({ preventScroll: true });
    });
    for (const b of dlg.querySelectorAll('[data-step]')) {
      b.hidden = photos.length < 2;
      b.addEventListener('click', () => choose(index + Number(b.dataset.step)));
    }
    zoom.addEventListener('click', () => setZoom(!expanded));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        choose(index + (e.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    choose(0);
  }
  const galleryDialog =
    '<dialog class="viewer" id="photo-dialog" aria-label="Фотографии лота"><div class="gallery-nav"><div><button data-step="-1" aria-label="Предыдущее фото">Назад</button><span class="gallery-pos"></span><button data-step="1" aria-label="Следующее фото">Далее</button></div><div><button data-zoom aria-pressed="false">Увеличить</button><button class="close-view">Закрыть</button></div></div><div class="viewer-photo"><img alt=""></div></dialog>';
  function facts(entries) {
    return (
      '<dl class="facts">' +
      entries
        .filter(([, v]) => v != null && v !== '')
        .map(([l, v]) => '<div><dt>' + esc(l) + '</dt><dd>' + esc(v) + '</dd></div>')
        .join('') +
      '</dl>'
    );
  }
  async function lot() {
    const root = $('#lot-view'),
      auc = query.get('a'),
      num = query.get('lot');
    const scope = query.get('scope') === 'all' ? 'all' : auc;
    const back =
      query.get('from') === 'archive'
        ? 'archive.html'
        : catalogURL(scope || '317', query.get('q') || '', +query.get('page') || 1);
    const r = ['316', '317'].includes(auc) ? (await get(auc + '.json')).find((x) => x.n === num) : null;
    if (!r) {
      root.innerHTML = empty(
        'Лот не найден',
        'Проверьте номер аукциона и лота в каталоге.',
        catalogURL('all'),
        'Открыть каталог',
      );
      root.setAttribute('aria-busy', 'false');
      return;
    }
    const d = (await get(auc + '-detail-' + r.group + '.json'))[num],
      curated = meta(r),
      heading = curated.short || r.title;
    document.title = heading + ' · Лот ' + r.n + ' · В Никитском';
    const bid = bidURL(r),
      old = auc === '316',
      source = link(d.url, 'Карточка дома', old ? 'text-link' : 'btn');
    const prepare =
      path('contacts.html', {
        topic: 'buy',
        subject: 'Аукцион № ' + auc + ', лот ' + num + ' — ' + short(r),
      }) + '#letter';
    const amounts = [];
    if (r.start != null) amounts.push(['Стартовая цена · Bidspirit', money(r.start)]);
    if (r.estimate != null) amounts.push(['Эстимейт · дом', money(r.estimate)]);
    if (r.bidEstimate) {
      const est = String(r.bidEstimate).replace(/[рp₽]/g, '').replaceAll(',', ' ').trim();
      amounts.push(['Оценка · Bidspirit', est + ' ₽']);
    }
    if (r.sale != null) amounts.push(['Цена продажи · дом', money(r.sale)]);
    if (old && r.n === '62') amounts.push(['Комиссия аукционного дома · Bidspirit', '23%']);
    const status = old
      ? r.status || (r.sale != null ? 'Лот продан' : 'Цена продажи не опубликована домом')
      : '17 декабря 2026 · 18:00 мск';
    const actions = old
      ? (bid
          ? link(bid, 'Лот на Bidspirit', 'btn')
          : link(
              'https://ru.bidspirit.com/ui/catalog/auction/vnikitskom/82767?lang=ru',
              'Результаты № 316 на Bidspirit',
              'btn',
            )) + source
      : source + link(prepare, 'Уточнить участие');
    root.innerHTML =
      '<a class="back" href="' +
      esc(back) +
      '">' +
      (query.get('from') === 'archive' ? 'Вернуться в архив' : 'Вернуться к результатам') +
      '</a><div class="lot-layout"><div class="gallery"><button class="gallery-stage"><img alt=""><span class="zoom-label">Рассмотреть</span></button><div class="gallery-strip" aria-label="Фотографии экземпляра"></div></div><section class="lot-info"><p class="kicker"><i></i>Аукцион № ' +
      auc +
      ' · Лот ' +
      esc(num) +
      '</p><h1>' +
      esc(heading) +
      '</h1>' +
      (curated.author ? '<p class="biblio">' + esc(curated.author) + '</p>' : '') +
      (curated.edition ? '<p class="biblio">' + esc(curated.edition) + '</p>' : '') +
      '<p class="result-label">' +
      esc(status) +
      '</p>' +
      facts(amounts) +
      '<div class="actions">' +
      actions +
      '</div>' +
      (old
        ? ''
        : '<p class="source-note">Дом открыл каталог. Отдельная страница этих торгов на Bidspirit пока не опубликована.</p>' +
          link('auction.html?a=317', 'Как участвовать в № 317')) +
      '</section></div><section class="lot-notes"><h2>Об экземпляре</h2>' +
      (curated.short ? '<p class="biblio">' + esc(r.title) + '</p>' : '') +
      (curated.binding && curated.condition
        ? facts([
            ['Формат', curated.physical],
            ['Переплёт', curated.binding],
            ['Состояние', curated.condition],
          ])
        : '<p>' + esc(d.text || 'Дополнительные сведения можно уточнить у дома.') + '</p>') +
      '<div class="tail-links">' +
      link(d.url, 'Полное описание дома') +
      link(back, query.get('from') === 'archive' ? 'Вернуться в архив' : 'Вернуться к результатам') +
      '</div></section>' +
      galleryDialog;
    gallery(root, d.photos, curated.labels || [], r.image, heading);
    root.setAttribute('aria-busy', 'false');
  }
  (document.body.dataset.page === 'catalog' ? catalog() : lot()).catch(() => {
    const el = $('#catalog-output') || $('#lot-view');
    el.innerHTML = empty(
      'Не удалось загрузить запись',
      'Можно обновить страницу или обратиться к каталогу дома.',
      'https://vnikitskom.ru/predstoyashhie-auktsiony/',
      'Каталоги дома',
    );
    el.setAttribute('aria-busy', 'false');
  });
})();
