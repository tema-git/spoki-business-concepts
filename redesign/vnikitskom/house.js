(() => {
  'use strict';
  const { $, esc, link, path, get, money } = window.Nik,
    q = new URLSearchParams(location.search);
  const official = 'https://vnikitskom.ru/',
    bidHouse = 'https://ru.bidspirit.com/ui/houses/vnikitskom,false?lang=ru';
  const bidCatalog = (k) =>
    'https://ru.bidspirit.com/ui/catalog/auction/vnikitskom/' + encodeURIComponent(k) + '?lang=ru';
  const readable = (s) =>
    new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(s + 'T12:00:00Z'))
      .replace(/\s*г\.$/, '');
  const news = {
    316: [
      'Редкие книги ноября',
      'Ноябрьский каталог открывает московская Минея 1600 года работы печатника Андроника Невежи. В числе разделов торгов — рукописи, автографы и иллюстрированные издания.',
    ],
    315: [
      'Октябрьская подборка искусства',
      'В каталог вошли «Весенний пейзаж» Тита Дворникова, пастели Павла Шмарова и работы Евгении Малеиной. В пресс-релизе дом приводит номера лотов и рассказывает об авторах.',
    ],
    312: [
      'От иконы до московского концептуализма',
      'В августовском каталоге 715 лотов живописи, графики, фотографии, книг и декоративно-прикладного искусства. Дом прослеживает происхождение отдельных работ и историю их собраний.',
    ],
    309: [
      'Июньские торги искусством',
      'Обзор июньской подборки живописи, графики, фотографии и декоративно-прикладного искусства. Иллюстрации и сведения об отдельных работах собраны в пресс-релизе дома.',
    ],
    308: [
      'Книжный аукцион 18 июня',
      'Дом представил редкие книги, рукописи и автографы. В пресс-релизе рассказано об отдельных экземплярах июньского каталога.',
    ],
    307: [
      'Майский книжный каталог',
      'Подборка антикварных и букинистических изданий к торгам 21 мая. Дом опубликовал обзор книг и фотографии экземпляров.',
    ],
    306: [
      'Апрельский аукцион искусства',
      'В апрельских торгах были представлены живопись, графика, фотографии и книги по искусству. Дом опубликовал иллюстрированный обзор подборки.',
    ],
    304: [
      'Итоги мартовских торгов',
      'Дом подвёл итоги торгов редкими книгами, рукописями, автографами и фотографиями. Подборку результатов можно сверить с каталогом аукциона.',
    ],
    303: [
      'В погоне за детством',
      'Книжный аукцион посвящён раскраскам и серийным детским изданиям 1930–1960-х годов. Экземпляры происходят из частного собрания.',
    ],
    302: [
      'Февральские торги искусством',
      'Дом представил февральскую подборку произведений искусства. Разделы каталога включают живопись, графику, фотографии и издания об искусстве.',
    ],
  };
  const future = {
    317: {
      n: '317',
      name: 'Редкие книги, рукописи, автографы и фотографии',
      date: '2026-12-17',
      time: '18:00',
    },
    318: {
      n: '318',
      name: 'Живопись, графика, декоративно-прикладное искусство',
      date: '2026-12-24',
      time: '19:00',
    },
  };
  const label = (t) => '<p class="kicker"><i></i>' + esc(t) + '</p>';
  const tail = (html) => '<div class="tail-links">' + html + '</div>';
  const auctionLink = (a) => path('auction.html', { a: a.n, key: a.bid });
  const missing = (el, url, title) => {
    el.innerHTML = '<h1>Запись не найдена</h1>' + tail(link(url, title));
  };
  function auction(d) {
    const el = $('#auction-info'),
      n = q.get('a'),
      key = q.get('key');
    const a = future[n] || d.archives.find((v) => v.n === n && (!key || String(v.bid) === key));
    if (!a) {
      missing(el, 'archive.html', 'Все аукционы');
      return;
    }
    document.title = 'Аукцион № ' + a.n + ' · В Никитском';
    const upcoming = !!future[n];
    const title =
      '<div class="page-head">' +
      label(upcoming ? 'Предстоящие торги' : 'Архив торгов') +
      '<h1>Аукцион № ' +
      esc(n) +
      '</h1><p>' +
      esc(a.name) +
      '</p></div>';
    let body =
      '<h2 class="small-heading">' +
      esc(readable(a.date)) +
      (a.time ? ' · ' + a.time + ' мск' : '') +
      '</h2>';
    const domPage = official + 'auction/?auction=' + encodeURIComponent(n);
    if (n === '317')
      body +=
        '<p>Дом опубликовал 474 лота. Заочные ставки через дом принимают до 17:00 мск 17 декабря.</p><div class="actions">' +
        link('catalog.html?a=317', 'Открыть каталог', 'btn') +
        link(domPage, 'Каталог на сайте дома') +
        '</div><div class="note-panel"><p>Отдельный каталог этих торгов на Bidspirit пока не опубликован. В профиле дома можно следить за появлением № 317.</p>' +
        link(bidHouse, 'Профиль дома на Bidspirit') +
        '</div>' +
        link('guide.html#online', 'Условия участия');
    else if (n === '318')
      body +=
        '<p>В расписании опубликован анонс. Перечня лотов на странице аукциона пока нет.</p><div class="actions">' +
        link('catalog.html?a=317', 'Последний доступный каталог № 317', 'btn') +
        link(domPage, 'Анонс дома') +
        '</div>';
    else
      body +=
        '<p>Торги завершены. В архиве площадки доступны описание и результаты отдельных лотов.</p><div class="actions">' +
        (n === '316' ? link('catalog.html?a=316', 'Найти лот № 316', 'btn') : '') +
        link(
          bidCatalog(a.bid),
          'Результаты № ' + n + ' на Bidspirit',
          n === '316' ? 'text-link' : 'btn',
        ) +
        link(domPage, 'Каталог дома') +
        '</div>';
    el.innerHTML =
      title +
      '<div class="record">' +
      body +
      tail(
        link(
          upcoming ? 'schedule.html' : 'archive.html',
          upcoming ? 'Всё расписание' : 'Вернуться в архив',
        ),
      ) +
      '</div>';
  }
  function archive(d) {
    const list = $('#archive-list');
    const row = (a) =>
      '<article class="event-row"><div class="event-date"><b>№ ' +
      esc(a.n) +
      '</b><span>' +
      esc(readable(a.date)) +
      '</span></div><h3>' +
      esc(a.name) +
      '</h3>' +
      link(auctionLink(a), 'Результаты') +
      '</article>';
    const groups = new Map();
    d.archives.forEach((a) => {
      const year = a.date.slice(0, 4);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(a);
    });
    list.innerHTML =
      [...groups.entries()]
        .map(([year, items], i) =>
          i === 0
            ? '<h2 class="small-heading">' +
              year +
              '</h2><div class="event-list">' +
              items.map(row).join('') +
              '</div>'
            : '<details class="archive-more"><summary>' +
              year +
              ' · ' +
              items.length +
              ' торгов</summary><div class="event-list">' +
              items.map(row).join('') +
              '</div></details>',
        )
        .join('') + tail(link(official + 'arhive/', 'Полный архив дома'));
  }
  function shop(d) {
    const el = $('#shop-list'),
      target = q.get('category') || '',
      selected = d.categories.includes(target) ? target : '';
    const rows = d.shop.filter((r) => !selected || r.categories.includes(selected));
    const tab = (name, text) =>
      '<a href="' +
      esc(path('shop.html', { category: name })) +
      '"' +
      (name === selected ? ' aria-current="page"' : '') +
      '>' +
      esc(text) +
      '</a>';
    const requested = Math.max(1, parseInt(q.get('page'), 10) || 1),
      size = 12,
      pages = Math.ceil(rows.length / size),
      page = Math.min(requested, pages || 1);
    const pageNav =
      pages > 1
        ? '<nav class="pages" aria-label="Страницы магазина">' +
          Array.from(
            { length: pages },
            (_, i) =>
              '<a href="' +
              esc(path('shop.html', { category: selected, page: i + 1 })) +
              '"' +
              (page === i + 1 ? ' aria-current="page"' : '') +
              '>' +
              (i + 1) +
              '</a>',
          ).join('') +
          '</nav>'
        : '';
    el.innerHTML =
      '<nav class="facet-links" aria-label="Разделы магазина">' +
      tab('', 'Все разделы') +
      d.categories.map((c) => tab(c, c)).join('') +
      '</nav><div class="product-grid">' +
      rows
        .slice((page - 1) * size, page * size)
        .map(
          (r) =>
            '<a class="shop-card" href="' +
            esc(path('product.html', { id: r.id, category: selected, page })) +
            '"><div class="card-image"><img src="' +
            esc(r.image) +
            '" alt="" loading="lazy"></div><h3>' +
            esc(r.title) +
            '</h3><span class="folio">' +
            (r.price != null ? esc(money(r.price)) : 'Цена по запросу') +
            '</span></a>',
        )
        .join('') +
      '</div>' +
      pageNav +
      tail(
        link(
          official + 'shop/' + (selected ? '?category=' + encodeURIComponent(selected) : ''),
          'Все позиции на сайте дома',
        ),
      );
  }
  function product(d) {
    const el = $('#product-info'),
      r = d.shop.find((x) => x.id === q.get('id'));
    if (!r) {
      missing(el, 'shop.html', 'К магазину');
      return;
    }
    document.title = r.title + ' · Магазин · В Никитском';
    const back = path('shop.html', { category: q.get('category'), page: q.get('page') });
    const contact = path('contacts.html', { topic: 'shop', subject: r.title }) + '#letter';
    el.innerHTML =
      link(back, 'Вернуться в магазин') +
      '<div class="lot-layout"><div class="gallery-stage"><img src="' +
      esc(r.image) +
      '" alt="' +
      esc(r.title) +
      '"></div><div class="book-summary">' +
      label('Издание магазина') +
      '<h1>' +
      esc(r.title) +
      '</h1><p class="result-label">' +
      (r.price != null ? 'Цена магазина ' + esc(money(r.price)) : 'Цена по запросу') +
      '</p>' +
      (r.details ? '<p>' + esc(r.details) + '</p>' : '') +
      '<p class="source-note">Наличие уточняет аукционный дом. Для обращения подготовьте письмо с названием издания.</p><div class="actions">' +
      link(contact, 'Уточнить наличие', 'btn') +
      link(r.url, 'Магазин дома') +
      '</div></div></div>';
  }
  function newsList(d) {
    $('#news-list').innerHTML =
      '<div class="news-grid">' +
      d.news
        .map(
          (r) =>
            '<a class="news-card" href="' +
            esc(path('article.html', { id: r.id })) +
            '"><div class="card-image"><img loading="lazy" alt="" src="' +
            esc(r.img) +
            '"></div><span class="folio">Аукцион № ' +
            esc(r.id) +
            '</span><h3>' +
            esc(news[r.id][0]) +
            '</h3></a>',
        )
        .join('') +
      '</div>' +
      tail(link(official + 'news/', 'Архив новостей дома'));
  }
  function article(d) {
    const el = $('#news-info'),
      r = d.news.find((x) => x.id === q.get('id'));
    if (!r) {
      missing(el, 'news.html', 'Все новости');
      return;
    }
    const [title, summary] = news[r.id],
      a = d.archives.find((x) => x.n === r.id);
    document.title = title + ' · В Никитском';
    el.innerHTML =
      '<div class="record">' +
      label('Хроника · Аукцион № ' + r.id) +
      '<div class="page-head"><h1>' +
      esc(title) +
      '</h1></div><p>' +
      esc(summary) +
      '</p><figure class="document-photo"><img src="' +
      esc(r.img) +
      '" alt="Иллюстрация дома к материалу об аукционе № ' +
      esc(r.id) +
      '"><figcaption>Из публикации Дома антикварной книги</figcaption></figure>' +
      tail(
        link(r.url, 'Полная публикация дома') +
          (a ? link(auctionLink(a), 'Результаты торгов') : '') +
          link('news.html', 'Все новости'),
      ) +
      '</div>';
  }
  const render = { archive, auction, shop, product, news: newsList, article };
  get('house.json')
    .then((d) => render[document.body.dataset.page](d))
    .catch(() => {
      const el = document.querySelector(
        '#archive-list,#auction-info,#shop-list,#product-info,#news-list,#news-info',
      );
      el.innerHTML = '<p>Не удалось загрузить раздел.</p>' + link(official, 'Перейти на сайт дома');
    });
})();
