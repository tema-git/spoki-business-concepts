"""Render complete static pages for GitHub Pages. Run with Python 3 from any directory."""

import json
import os
from html import escape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
ASSETS = ROOT / "assets"
HERE = ""
MEETING = "2026-11-26T20:00:00+03:00"
EXPIRY = "2027-03-01T00:00:00+03:00"
TICKET_DATE = "28 февраля 2027"
CHANNEL = "https://t.me/cha108"
ACTIVATE = "https://t.me/teamanshadow"
SCHEDULE = "https://teatix.com/now"
CYCLE = "https://teatix.com/wukong72"
ARROW = '<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>'
ICON_PATH = {
    "calendar": '<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3v5m9-5v5m-13 3h17"/>',
    "pin": '<path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
    "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.5V12l3.8 2.2"/>',
    "menu": '<path d="M3 7h18M3 12h18M3 17h18"/>',
}


def icon(name):
    return f'<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">{ICON_PATH[name]}</svg>'


def path(target):
    if target.startswith(("https://", "tel:", "mailto:", "#", "http://")):
        return target
    base, divid, hashpart = target.partition("#")
    base, question, query = base.partition("?")
    trail = base.endswith("/") or not base
    rel = os.path.relpath(base or ".", HERE or ".").replace("\\", "/")
    if rel == ".":
        rel = "./"
    elif trail:
        rel += "/"
    return rel + question + query + divid + hashpart


def a(label, target, css="text-link", arrow=True, attr=""):
    return f'<a href="{escape(path(target), quote=True)}" class="{css}" {attr}>{label}{ARROW if arrow else ""}</a>'


def photo(file, alt, css="", eager=False):
    return f'<img src="{path("assets/"+file)}" alt="{escape(alt,quote=True)}" class="{css}" loading="{("eager" if eager else "lazy")}" decoding="async">'


def tiny(text):
    return f'<p class="kicker">{text}</p>'


def links(*items):
    return '<div class="actions">' + "".join(items) + "</div>"


def button(label, target, attr=""):
    return a(label, target, "button", attr=attr)


def resume():
    return a("Вернуться к выбору билета", "tickets/", "text-link", attr="data-resume")


def contact_link():
    return (
        a("+7 903 010-80-30", "tel:+79030108030", "inline", False)
        + " или "
        + a("Telegram&nbsp;чайного&nbsp;шефа", ACTIVATE, "inline", False)
    )


def bread(parts):
    items = [a("Главная", "", "", False)]
    for name, url in parts:
        items.append(
            a(name, url, "", False)
            if url is not None
            else f'<span aria-current="page">{name}</span>'
        )
    return (
        '<nav class="crumbs" aria-label="Хлебные крошки">'
        + '<span aria-hidden="true">/</span>'.join(items)
        + "</nav>"
    )


def group(title, content, lead="", id="", cls=""):
    return (
        f'<section class="section {cls}"'
        + (f' id="{id}"' if id else "")
        + f'><div class="section-head"><h2>{title}</h2>{lead}</div>{content}</section>'
    )


def intro(crumbs, title, lead="", over=""):
    return f'{bread(crumbs)}<header class="intro">{tiny(over) if over else ""}<h1>{title}</h1>{f"<p>{lead}</p>" if lead else ""}</header>'


def note(body):
    return f'<div class="note">{body}</div>'


def defs(pairs):
    return (
        '<dl class="facts">'
        + "".join(f"<div><dt>{l}</dt><dd>{v}</dd></div>" for l, v in pairs)
        + "</dl>"
    )


def go(label, target, desc=""):
    return a(
        f'<span><strong>{label}</strong>{f"<small>{desc}</small>" if desc else ""}</span>',
        target,
        "row-link",
    )


def art():
    return (ASSETS / "cup.svg").read_text(encoding="utf-8")


def brand():
    return f'<a class="brand" href="{path("")}" aria-label="Чайная высота, главная"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">ЧАЙНАЯ<br>ВЫСОТА</span></a>'


NAV = [
    ("Афиша", "schedule/"),
    ("Билеты", "tickets/"),
    ("Чай", "tea/"),
    ("Мороженое", "ice-cream/"),
    ("О клубе", "club/"),
]


def header():
    menu = "".join(
        a(
            n,
            p,
            "navlink",
            False,
            ('aria-current="page" ' if HERE.startswith(p) else "")
            + ("data-resume" if p == "tickets/" else ""),
        )
        for n, p in NAV
    )
    return f"""<a class="skip" href="#main">К содержанию</a>
<header class="mast"><div class="mast-inner">{brand()}<nav class="main-nav" id="menu" aria-label="Основное меню">{menu}{a("Чайные Москвы","venues/","navlink mobile-extra",False)}{a("Подобрать чай","tea/pick/","navlink mobile-extra",False)}</nav><div class="mast-actions">{a('<span class="mag-face">Контакты'+ARROW+'</span>','contacts/#contacts','mag',False)}<button id="menu-button" class="menu-button" aria-controls="menu" aria-expanded="false" aria-label="Открыть меню">{icon('menu')}</button></div></div></header>"""


def footer():
    g1 = [
        ("Афиша", "schedule/"),
        ("Цикл дегустаций", "cycle/"),
        ("Условия билетов", "tickets/"),
        ("Архив встреч", "schedule/#archive"),
    ]
    g2 = [
        ("Чайная коллекция", "tea/"),
        ("Чайное мороженое", "ice-cream/"),
        ("Подобрать чай", "tea/pick/"),
        ("Журнал", "journal/"),
    ]
    g3 = [
        ("Чайные Москвы", "venues/"),
        ("Команда", "club/"),
        ("Новости", "club/news/"),
        ("Контакты", "contacts/"),
    ]
    lists = "".join(
        '<nav aria-label="'
        + title
        + '"><p>'
        + title
        + "</p>"
        + "".join(
            a(n, p, "", False, "data-resume" if p == "tickets/" else "")
            for n, p in group_
        )
        + "</nav>"
        for title, group_ in [("Дегустации", g1), ("Коллекция", g2), ("О клубе", g3)]
    )
    return (
        '<footer class="footer"><div class="footer-inner"><div>'
        + brand()
        + "<p>Дом чая и мороженого<br>в Москве</p></div>"
        + lists
        + '</div><div class="foot-line"><span>Сайт создан Spoki Studio</span></div></footer>'
    )


PAGES = []


def photo_link(file, alt, caption, label, destination):
    return f'<aside class="photo-link"><div class="reactive">{photo(file,alt)}</div><div><p>{caption}</p>{a(label,destination)}</div></aside>'


def related_photo(route):
    if route.startswith("tickets/"):
        return photo_link(
            "venue-tverskaya.webp",
            "Вывеска над входом в чайную на Тверской",
            "На дегустацию приходите в «Чайную высоту / Винную глубину» на Тверской, 6, стр. 1.",
            "Вход и маршрут",
            "venues/tverskaya/#route",
        )
    figures = {
        "club/news/": (
            "meeting-67.webp",
            "Чайный лист из анонса встречи № 67",
            "Лист крупным планом из ноябрьского анонса о Тегуаньинь и Я Бао.",
            "О дегустации № 67",
            "schedule/67/",
        ),
        "club/science/": (
            "venue-pokrovka.webp",
            "Зал чайной на Покровке с витражами",
            "Зал чайной горы на Покровке, где клуб собирает гостей за чаем.",
            "О площадке",
            "venues/pokrovka/",
        ),
        "club/jobs/": (
            "chef-enin.webp",
            "Чайный шеф Виктор Енин",
            "Виктор Енин, основатель и чайный шеф «Чайной высоты».",
            "Познакомиться с командой",
            "club/",
        ),
        "journal/": (
            "ice-tasting.webp",
            "Чайное мороженое в металлических креманках",
            "Кунгфу Айскрим из архива чайной. История коллекции началась в 2006 году.",
            "О коллекции",
            "ice-cream/",
        ),
    }
    return photo_link(*figures[route]) if route in figures else ""


def page(
    route,
    title,
    body,
    desc="Дом чая и мороженого в Москве. Дегустации, коллекция чая и билеты Teatix.",
):
    global HERE
    HERE = route
    content = body() + related_photo(route)
    html = f"""<!doctype html>
<html lang="ru" class="no-js" data-meeting="{MEETING}" data-expiry="{EXPIRY}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f6ed">
<title>{escape(title)} · Чайная высота</title><meta name="description" content="{escape(desc,quote=True)}">
<link rel="icon" href="{path("assets/brand-mark.webp")}"><link rel="stylesheet" href="{path("assets/fonts/fonts.css")}"><link rel="stylesheet" href="{path("style.css")}"><script src="{path("app.js")}"></script></head>
<body>{header()}<main class="wrap" id="main" tabindex="-1">{content}</main>{footer()}</body></html>"""
    out = ROOT / route / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html + "\n", encoding="utf-8")
    PAGES.append(route)


TICKETS = [
    dict(
        slug="one",
        short="На одного",
        name="Билет на одного",
        price="2 600 ₽",
        guests="1 гость",
        count="1 встреча",
        product="72reflections1",
        text="Любая одна дегустация цикла на Тверской.",
    ),
    dict(
        slug="two",
        short="На двоих",
        name="Билет на двоих",
        price="4 600 ₽",
        guests="2 гостя",
        count="1 встреча вдвоём",
        product="72reflections2",
        text="Одна дегустация на Тверской для двух гостей. Цена указана за двоих.",
    ),
    dict(
        slug="express",
        short="Экспресс",
        name="Экспресс-билет",
        price="3 600 ₽",
        guests="1 гость",
        count="1 встреча",
        product="express",
        text="Действует только на дегустацию № 67. После покупки достаточно показать билет на входе.",
    ),
    dict(
        slug="front",
        short="Первый ряд",
        name="Первый ряд",
        price="3 600 ₽",
        guests="1 гость",
        count="1 встреча",
        product="1strow",
        text="Место в первом ряду, лёгкие закуски и два шарика чайного мороженого.",
    ),
    dict(
        slug="table",
        short="Столик",
        name="Столик для компании",
        price="7 700 ₽",
        guests="2–4 гостя",
        count="1 встреча вместе",
        product="72reflections3",
        text="Один столик на выбранной дегустации для компании от двух до четырёх человек.",
    ),
    dict(
        slug="nama",
        short="С конфетами",
        name="На двоих с NAMAchaiCHOCO",
        price="6 000 ₽",
        guests="2 гостя",
        count="1 встреча вдвоём",
        product="dega_%D1%852_namachocolate",
        text="Дегустация для двоих с чайными конфетами NAMAchaiCHOCO.",
    ),
    dict(
        slug="six",
        short="От шести",
        name="От шести посещений",
        price="от 12 000 ₽",
        guests="1 гость на каждый билет",
        count="от 6 посещений суммарно",
        product="visit6deg",
        text="Каждое посещение стоит 2 000 ₽. Билеты можно передавать друзьям. В карточке Teatix укажите количество от шести.",
    ),
]


def ticket_route(t):
    return "tickets/" if t["slug"] == "one" else "tickets/" + t["slug"] + "/"


VENUES = [
    dict(
        slug="tverskaya",
        name="На Тверской",
        full="Чайная высота / Винная глубина",
        address="Тверская ул., 6, стр. 1",
        hours="12:00–00:00",
        phone="+7 963 770-05-53",
        tel="+79637700553",
        oid="136449933507",
        coords="55.760318,37.611344",
        desc="Здесь проходят дегустации «72 чайных отражения Сунь Укуна». В отдельной церемониальной с карпами собираются компании до восьми гостей.",
        way="Ищите «Чайную высоту / Винную глубину» в доме 6, строении 1 на Тверской.",
    ),
    dict(
        slug="pokrovka",
        name="На Покровке",
        full="Чайная высота на Покровке",
        address="ул. Покровка, 27, стр. 1",
        hours="11:00–00:00",
        phone="+7 495 225-59-96",
        tel="+74952255996",
        oid="88779594741",
        coords="55.760009,37.647879",
        desc="Чайная в культурном центре «Покровские ворота». Сюда приходят за чаем и чайным мороженым.",
        way="Со стороны Покровки пройдите через арку без ворот и номера во двор. Вход в культурный центр «Покровские ворота». Чайная находится на втором этаже.",
    ),
]
EVENT_TITLE = "Три стиля Тегуаньинь и три Я Бао"
EVENT_TEXT = "От ранних почек Я Бао до поздних сборов Тегуаньинь. На одной встрече Виктор Енин сопоставит два края чайного календаря."


def event_facts():
    return (
        '<div class="event-meta"><span>'
        + icon("calendar")
        + "26 ноября, чт</span><span>"
        + icon("clock")
        + "20:00, МСК</span>"
        + a(icon("pin") + "Тверская, 6, стр. 1", "venues/tverskaya/", "location", False)
        + "</div>"
    )


def card(url, title, img, alt, label="", desc=""):
    return a(
        f'<div class="card-img reactive">{photo(img,alt)}</div>{tiny(label) if label else ""}<div class="card-copy"><div class="card-name"><h3>{title}</h3>{ARROW}</div>{f"<p>{desc}</p>" if desc else ""}</div>',
        url,
        "card",
        False,
    )


def status(label):
    return '<p class="eyebrow"><span class="status-dot"></span>' + label + "</p>"


def static_archive():
    return '<span class="arch-tag">Архив</span>'


ARCHIVE = [
    dict(
        num=66,
        date="22 октября 2026",
        short="22 октября",
        title="Чай Чёрного моря",
        full="Чай Чёрного моря. Белый и не только. От сбора до чашки",
        desc="Аля Тер-Ованесян представила шесть чаёв из Сочи. В подборку вошли два сорта, приготовленных специально для клуба.",
        season="Третий сезон",
        url="https://t.me/cha108/4300",
        img="tea-white-leaf.webp",
    ),
    dict(
        num=61,
        date="30 апреля 2026",
        short="30 апреля",
        title="Больше жёлтых богу жёлтых",
        full="Больше жёлтых богу жёлтых",
        desc="Сравнивали классические жёлтые чаи, новые опыты с томлением в Сочи и чай с ароматом орхидеи.",
        season="Второй сезон",
        url="https://t.me/cha108/4134",
        img="tea-green-infusion.webp",
    ),
    dict(
        num=60,
        date="9 апреля 2026",
        short="9 апреля",
        title="Встречайте: чайная весна 2026",
        full="Встречайте: чайная весна 2026",
        desc="Мартовский сбор зелёных, белых и жёлтых чаёв пробовали рядом с Тайпин Хоукуй предыдущей весны.",
        season="Второй сезон",
        url="https://t.me/cha108/4089",
        img="tea-green-leaf.webp",
    ),
]


def choose(label="Выбрать билет"):
    return button(label, "tickets/?event=67", 'data-choose="67"')


def hero_title(first, second, third):
    return f'<h1 class="hero-title"><span>{first}</span> <span>{second}</span> <em>{third}</em></h1>'


def hero():
    live = f"""<div data-if="live">{status("Ближайшая дегустация · № 67")}{hero_title("Три стиля", "Тегуаньинь", "и три Я Бао")}{event_facts()}<p class="hero-desc">{EVENT_TEXT}</p>{links(choose(),a('О встрече','schedule/67/'))}</div>"""
    wait = f"""<div data-if="waiting">{hero_title("72 чайных", "отражения", "Сунь Укуна")}<p class="hero-desc">На Тверской чайный шеф сравнивает несколько сортов за одну встречу. Новую дату чайная объявит в своём канале.</p>{links(button('Выбрать билет','tickets/'),a('Узнать дату',CHANNEL))}</div>"""
    return f"""<section class="hero"><div class="hero-copy">{live}{wait}</div><figure class="hero-figure"><div class="poster">{art()}</div><span class="sr-only" role="status" data-pour-status></span></figure></section>"""


def picker():
    data = escape(
        json.dumps(
            [
                dict(
                    name=t["name"],
                    taste=t["taste"],
                    desc=t["flavor"],
                    img=path("assets/" + t["infusion"]),
                    alt=t["infusionalt"],
                    url=path("tea/" + t["slug"] + "/"),
                )
                for t in TEAS
            ],
            ensure_ascii=False,
        ),
        quote=True,
    )
    buttons = []
    for i, tea in enumerate(TEAS):
        prefix, _, note = tea["taste"].partition(", ")
        label = f'<span><span class="taste-prefix">{prefix}, </span><span class="taste-note">{note}</span></span>'
        buttons.append(f'<button type="button" class="taste" aria-pressed="false" data-taste="{i}">{label}{ARROW}</button>')
    options = "".join(buttons)
    fallback = " · ".join(
        a(t["name"], "tea/" + t["slug"] + "/", "inline", False) for t in TEAS
    )
    return f"""<section class="picker" id="picker" data-picker="{data}"><div class="picker-copy">{tiny('Из чайной коллекции')}<h2 tabindex="-1">Подобрать чай</h2><p>Какой вкус хочется сегодня? Выберите оттенок, и мы покажем чай из коллекции.</p><div class="taste-options">{options}</div><noscript><p>{fallback}</p></noscript></div><figure class="pick-photo reactive">{photo("tea-green-infusion.webp","Настой Тайпин Хоукуй из коллекции клуба")}</figure><div class="pick-result" hidden><div aria-live="polite"><h3></h3><p class="result-desc"></p></div><div class="actions"><a class="text-link result-link">О чае{ARROW}</a><button class="plain" type="button" data-again>Выбрать другой вкус</button></div>{resume()}</div></section>"""


def home():
    cards = (
        card(
            "tea/",
            "Чай",
            "tea-green-leaf.webp",
            "Длинные плоские листья Тайпин Хоукуй",
            "Коллекция",
        )
        + card(
            "ice-cream/",
            "Чайное мороженое",
            "ice-tasting.webp",
            "Чайное мороженое из коллекции Кунгфу Айскрим",
            "Кунгфу Айскрим",
        )
        + card(
            "venues/",
            "Чайные Москвы",
            "venue-tverskaya.webp",
            "Вход в чайную на Тверской",
            "Тверская и Покровка",
        )
    )
    return (
        hero()
        + group(
            "В чайной",
            '<div class="cards three">' + cards + "</div>",
            a("О клубе", "club/"),
        )
        + picker()
        + group("Дегустации", event_list(), a("Вся афиша", "schedule/"))
    )


def event_list():
    live = a(
        '<span class="list-date">26 ноя <small>20:00</small></span><span><small>Встреча № 67 · Тверская</small><strong>'
        + EVENT_TITLE
        + "</strong></span>",
        "schedule/67/",
        "event-row",
    )
    past = "".join(
        a(
            '<span class="list-date">'
            + e["short"]
            + "<small>2026</small></span><span><small>Архив · № "
            + str(e["num"])
            + "</small><strong>"
            + e["title"]
            + "</strong></span>",
            "schedule/" + str(e["num"]) + "/",
            "event-row",
        )
        for e in ARCHIVE[:2]
    )
    return f'<div class="event-list"><div data-if="live">{live}</div><div data-if="waiting">{go("Следующая дата","cycle/","Как проходят встречи и где следить за анонсами")}</div>{past}</div>'


def schedule():
    top = intro(
        [("Афиша", None)],
        "Афиша дегустаций",
        "Выберите встречу в чайной на Тверской. Время указано по Москве.",
    )
    live = f'<div data-if="live" class="feature"><div>{status("Ближайшая встреча · № 67")}<h2>{EVENT_TITLE}</h2>{event_facts()}<p>{EVENT_TEXT}</p>{links(choose(),a("Программа встречи","schedule/67/"))}</div><div class="feature-img reactive">{photo("hero-glass.webp","Чай в стеклянной чаше клуба")}</div></div>'
    wait = f'<div data-if="waiting" class="callout">{tiny("Следующая встреча")}<h2>Ждём новую дату</h2><p>Чайная публикует расписание в Teatix и своём Telegram. До объявления можно изучить цикл и выбрать билет с активацией.</p>{links(button("Билеты цикла","tickets/"),a("Анонсы чайной",CHANNEL))}</div>'
    archived = "".join(
        go(
            e["title"],
            "schedule/" + str(e["num"]) + "/",
            e["date"] + " · № " + str(e["num"]) + " · " + e["season"],
        )
        for e in ARCHIVE
    )
    return (
        top
        + live
        + wait
        + group(
            "Архив встреч",
            '<div class="row-list"><div data-if="waiting">'
            + go(EVENT_TITLE, "schedule/67/", "26 ноября 2026 · № 67 · Третий сезон")
            + "</div>"
            + archived
            + "</div>",
            id="archive",
        )
        + group(
            "Цикл на Тверской",
            go(
                "72 чайных отражения Сунь Укуна",
                "cycle/",
                "Темы встреч, ведущий и правила участия",
            ),
        )
    )


def event(num):
    if num == 67:
        return (
            bread([("Афиша", "schedule/"), ("Встреча № 67", None)])
            + f"""<section class="feature event-detail"><div><div data-if="live">{status('Ближайшая встреча · № 67')}</div><div data-if="waiting">{static_archive()} · № 67</div><h1>{EVENT_TITLE}</h1>{event_facts()}<p>{EVENT_TEXT}</p><div data-if="live">{links(choose(),a('Анонс чайной','https://t.me/cha108/4370'))}</div><div data-if="waiting"><p>Дата этой встречи — 26 ноября 2026 года. Продажа на эту встречу завершена.</p>{links(button('К новой афише','schedule/'),a('Билеты цикла','tickets/?from=archive'))}</div></div><div class="feature-img reactive">{photo("meeting-67.webp","Фотография из анонса встречи о Тегуаньинь и Я Бао")}</div></section>"""
            + group(
                "В программе",
                '<div class="prose"><p>У трёх октябрьских Тегуаньинь разные оттенки: у Байшуй Ю Сян — цветы и прохлада, у Лунцзюаньского — минералы и нектар, у Цзяньдоу — кресс-салат и крапива. Рядом с ними попробуем три ранних Я Бао. Ведёт чайный шеф Виктор Енин.</p><p>Организатор указывает шесть–семь чаёв, чайное мороженое, имбирные шоты без алкоголя и закуски.</p>'
                + a("Читать программу у организатора", "https://t.me/cha108/4370")
                + "</div>",
            )
            + group(
                "Где встречаемся",
                go(
                    "Чайная высота / Винная глубина",
                    "venues/tverskaya/",
                    "Москва, Тверская ул., 6, стр. 1",
                ),
            )
        )
    e = next(v for v in ARCHIVE if v["num"] == num)
    return (
        bread(
            [
                ("Афиша", "schedule/"),
                ("Архив", "schedule/#archive"),
                ("№ " + str(num), None),
            ]
        )
        + f"""<section class="feature event-detail"><div>{static_archive()}<p class="kicker">{e["season"]} · № {num}</p><h1>{e["full"]}</h1><p>{e["date"]} · 20:00 МСК<br>Чайная на Тверской, 6, стр. 1</p><p>{e["desc"]}</p>{links(button('К актуальной афише','schedule/'),a('Посмотреть билеты цикла','tickets/?from=archive'))}</div><figure class="archive-photo">{photo(e["img"],"Чай из коллекции клуба")}<figcaption>Из чайной коллекции клуба</figcaption></figure></section>"""
        + group(
            "Материалы встречи",
            go("Анонс организатора", e["url"]) + go("О дегустационном цикле", "cycle/"),
        )
    )


def cycle():
    return (
        intro(
            [("Афиша", "schedule/"), ("О цикле", None)],
            "72 чайных отражения <em>Сунь Укуна</em>",
            "Серия сравнительных дегустаций в чайной на Тверской. Каждая встреча раскрывает одну тему через несколько завариваний.",
            "Дегустационный цикл",
        )
        + f"""<div class="feature"><div><h2>Как проходит встреча</h2><p>Чайный шеф Виктор Енин выбирает сорта, заваривает их рядом и разбирает с гостями вкус, сбор и обработку. Программу и состав угощений чайная объявляет для каждой даты.</p><p>Цикл начался 26 сентября 2024 года. Осенью 2026-го клуб открыл третий сезон.</p>{links(button('Афиша встреч','schedule/'),a('Билеты и активация','tickets/'))}</div><div class="feature-img reactive">{photo("hero-glass.webp","Стеклянная чаша с чаем")}</div></div>"""
        + group(
            "Участие",
            note(
                "<strong>Сначала выберите тип билета.</strong><p>Обычные билеты дают одно посещение в пределах срока. Конкретную встречу нужно согласовать после покупки. Для активации напишите или позвоните: "
                + contact_link()
                + ".</p>"
            )
            + links(
                a("Программа и билеты на Teatix", CYCLE),
                a("Архив сезонов", "schedule/#archive"),
            ),
        )
    )


def ticket_view(t):
    is_express = t["slug"] == "express"
    tabs = "".join(
        a(
            x["short"] + ('<span data-if="waiting"> · архив</span>' if x["slug"] == "express" else ""),
            ticket_route(x),
            "ticket-tab" + (" selected" if t == x else ""),
            False,
            ('aria-current="page" ' if t == x else "")
            + 'data-variant="'
            + x["slug"]
            + '"',
        )
        for x in TICKETS
    )
    official = "https://teatix.com/product/" + t["product"]
    selected = f'<p class="context" data-if="live" data-selected-meeting hidden>Вы выбрали встречу № 67 · 26 ноября, 20:00 · Тверская, 6, стр. 1</p>'
    limit = (
        "26 ноября 2026 · 20:00 МСК" if is_express else "До " + TICKET_DATE + " года"
    )
    details = defs(
        [
            ("Гости", t["guests"]),
            ("Посещения", t["count"]),
            ("Срок действия", limit),
            (
                "Площадка",
                a("Тверская, 6, стр. 1", "venues/tverskaya/", "inline", False),
            ),
        ]
    )
    booking = (
        "Место на встрече № 67 закрепляется при покупке. Покажите билет на входе."
        if is_express
        else "Покупка оставляет дату открытой. Место на конкретной встрече закрепит чайная после записи."
    )
    activation = (
        "Дополнительная активация не требуется."
        if is_express
        else "До посещения согласуйте дату и программу. Канал активации — "
        + contact_link()
        + "."
    )
    if is_express:
        available, ended = 'data-if="live"', 'data-if="waiting"'
        notice = "Встреча 26 ноября прошла. Этот экспресс-билет завершил действие."
        alternative, destination = "Выбрать билет с открытой датой", "tickets/"
    else:
        available, ended = "data-before-expiry", "data-after-expiry"
        notice = "Указанный билет действовал до 28 февраля 2027 года. Уточните действующие условия у чайной."
        alternative, destination = "Уточнить у чайной", ACTIVATE
    checkout = (
        f'<div {ended}>{note(notice)}</div>'
        + '<div class="ticket-purchase">'
        + button("Купить на Teatix", official, f"data-seller {available}")
        + a("Как купить", "tickets/how/", "text-link purchase-help", attr=available)
        + a(alternative, destination, "text-link purchase-alternative", attr=ended)
        + f'<strong class="ticket-price">{t["price"]}</strong></div>'
    )
    return (
        intro(
            [("Условия билетов", None)],
            "Выбрать билет",
            "72 чайных отражения Сунь Укуна · чайная на Тверской",
        )
        + selected
        + f"""<div class="tickets-layout" data-ticket-page="{t["slug"]}"><nav class="ticket-tabs" aria-label="Тип билета">{tabs}</nav>
<article class="ticket"><div class="ticket-body"><h2 class="ticket-title">{t["name"]}</h2><p>{t["text"]}</p>{details}<div class="ticket-rule"><strong>{booking}</strong><p>{activation}</p></div>{checkout}</div>
<div class="ticket-stub"><span class="stub-type">Билет на дегустацию</span><span>ЧАЙНАЯ ВЫСОТА</span><i aria-hidden="true"></i></div></article></div>"""
        + group(
            "После покупки",
            (
                go(
                    "Маршрут в чайную",
                    "venues/tverskaya/#route",
                    "Для входа покажите экспресс-билет",
                )
                if is_express
                else go(
                    "Активация и связь с чайной",
                    "contacts/#activation",
                    "Подготовить текст для записи на встречу",
                )
            )
            + go("Как получить билет", "tickets/how/", "Оформление и доставка билета")
            + go("Афиша и новые даты", "schedule/"),
        )
    )


def how():
    return (
        intro(
            [("Билеты", "tickets/"), ("Покупка и активация", None)],
            "Как получить билет",
        )
        + '<div class="prose"><h2>Выбор и оплата</h2><p>Перейдите по ссылке своего типа билета, проверьте название и цену, добавьте товар в корзину и продолжите оформление на Teatix. После проверки оплаты продавец пришлёт билет на электронную почту. Сохраните его на телефоне или распечатайте. Если письма нет, проверьте папку со спамом. Вопросы о доставке можно отправить на <a class="inline" href="mailto:pr@cha108.ru">pr@cha108.ru</a>.</p><h2>Запись на встречу</h2><p>Обычные билеты и абонементы нужно активировать заранее. Укажите купленный билет и желаемую программу. Организатор подтвердит место. Для экспресс-билета на указанную дату достаточно показать билет на входе.</p><p>Контакт для активации — '
        + contact_link()
        + ".</p>"
        + links(
            button("Выбрать билет", "tickets/"),
            a("Инструкция Teatix", "https://teatix.com/howtobuytickets"),
        )
        + "</div>"
    )


MEDIA = {
    m["file"]: m
    for m in json.loads((SRC / "media.json").read_text(encoding="utf-8-sig"))
}
TEAS = []
for key, slug, taste, label, leafalt, info in [
    (
        "green",
        "taiping-houkui",
        "Свежий, травяной",
        "Зелёный чай",
        "Длинные плоские чайные листья",
        "Ручной сбор из провинции Аньхуй. Крупные плоские листья раскрываются при заваривании.",
    ),
    (
        "white",
        "baihao-yinzhen",
        "Мягкий, миндальный",
        "Белый чай",
        "Серебристые почки белого чая",
        "В первом мартовском сборе чайная отмечает пряность и нежную миндальную сладость.",
    ),
    (
        "jinxuan",
        "jin-xuan",
        "Нежный, сливочный",
        "Тайваньский улун",
        "Скрученный лист тайваньского улуна",
        "У Алишань Цзинь Сюань от природы мягкий сливочный аромат. Настой светлый, листья постепенно расправляются.",
    ),
]:
    leaf = "tea-" + key + "-leaf.webp"
    brew = "tea-" + key + "-infusion.webp"
    TEAS.append(
        dict(
            slug=slug,
            name=MEDIA[leaf]["name"],
            taste=taste,
            label=label,
            leaf=leaf,
            infusion=brew,
            leafalt=leafalt,
            infusionalt=MEDIA[brew]["description"],
            flavor=info,
            page=MEDIA[leaf]["page"],
        )
    )
DESSERTS = [
    dict(slug="blin-naiznanku", file="ice-pancake.webp"),
    dict(slug="izumrudnaya-sladost", file="ice-emerald.webp"),
    dict(slug="deep-forest", file="ice-forest.webp"),
]


def tea():
    cards = "".join(
        card(
            "tea/" + t["slug"] + "/",
            t["name"],
            t["leaf"],
            t["leafalt"],
            t["label"],
            t["taste"],
        )
        for t in TEAS
    )
    return (
        intro(
            [("Чай", None)],
            "Чайная коллекция",
            "Три чая в двух состояниях. Откройте сорт, чтобы рассмотреть сухой лист и тот же чай в настое.",
        )
        + '<div class="cards three gallery-cards">'
        + cards
        + "</div>"
        + picker()
        + links(resume(), a("Вся коллекция в журнале", "journal/"))
    )


def tea_detail(t):
    pics = "".join(
        f"<figure>{photo(file,alt)}<figcaption>{cap}</figcaption></figure>"
        for file, alt, cap in [
            (t["leaf"], t["leafalt"], "Чайный лист"),
            (t["infusion"], t["infusionalt"], "При заваривании"),
        ]
    )
    return (
        intro([("Чай", "tea/"), (t["name"], None)], t["name"], t["flavor"], t["label"])
        + '<div class="photo-pair">'
        + pics
        + "</div>"
        + links(
            button("Подобрать другой чай", "tea/pick/"),
            a("Запись чайной", t["page"]),
            resume(),
        )
    )


def pick_page():
    return (
        bread([("Чай", "tea/"), ("Подобрать чай", None)])
        + '<h1 class="sr-only">Подбор по вкусу</h1>'
        + picker()
    )


def ice():
    cards = "".join(
        card(
            "ice-cream/" + d["slug"] + "/",
            MEDIA[d["file"]]["name"],
            d["file"],
            MEDIA[d["file"]]["name"],
            MEDIA[d["file"]]["category"],
        )
        for d in DESSERTS
    )
    return (
        intro(
            [("Мороженое", None)],
            "Чайное мороженое",
            "Кунгфу Айскрим готовят в «Чайной высоте» с апреля 2006 года. Чайный шеф Виктор Енин подбирает чай к ягодам, орехам и пряностям так, чтобы его вкус сохранялся в десерте.",
        )
        + '<div class="cards three ice-cards">'
        + cards
        + "</div>"
        + group(
            "Где попробовать",
            go(
                "Две московские чайные",
                "venues/",
                "Ассортимент дня уточняйте у выбранной площадки.",
            )
            + go("Коллекция в магазине Teatix", "https://teatix.com/shop")
            + resume(),
        )
    )


def dessert(d):
    m = MEDIA[d["file"]]
    return (
        intro(
            [("Мороженое", "ice-cream/"), (m["name"], None)],
            m["name"],
            m["description"],
            m["category"],
        )
        + f'<figure class="full-photo">{photo(d["file"],m["name"])}<figcaption>{("Ассорти из коллекции чайной" if "birch" in d["file"] else "Из коллекции Кунгфу Айскрим")}</figcaption></figure>'
        + links(
            button("Где попробовать", "venues/"),
            a("Рецепт в журнале клуба", m["page"]),
            resume(),
        )
    )


def frame_url(v):
    return (
        "https://yandex.ru/map-widget/v1/?mode=search&oid=" + v["oid"] + "&ol=biz&z=17"
    )


def route_url(v):
    return "https://yandex.ru/maps/?rtext=~" + quote(v["coords"], safe="") + "&rtt=pd"


def map_iframe(v, switch=False):
    return (
        f'<iframe class="map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Яндекс Карта · {v["full"]}" src="{escape(frame_url(v),quote=True)}"'
        + (" data-map-switch" if switch else "")
        + "></iframe>"
    )


def venue_brief(v):
    img = photo("venue-" + v["slug"] + ".webp", v["full"])
    return f'<article><div class="venue-img reactive">{img}</div><h3>{a(v["name"],"venues/"+v["slug"]+"/","",False)}</h3><p>{v["address"]}<br>Ежедневно {v["hours"]}</p>{a(v["phone"],"tel:"+v["tel"],"text-link")} <span class="phone-label">Бронь</span></article>'


def venues():
    cards = "".join(venue_brief(v) for v in VENUES)
    return (
        intro(
            [("Чайные Москвы", None)],
            "Чайные Москвы",
            "Дегустации цикла проходят на Тверской. На Покровке клуб принимает гостей в культурном центре «Покровские ворота».",
        )
        + '<div class="venue-contacts">'
        + cards
        + "</div>"
        + group(
            "Как добраться",
            "".join(
                go(v["full"], "venues/" + v["slug"] + "/#route", v["address"])
                for v in VENUES
            ),
        )
        + group(
            "Пуэропорт",
            '<div class="prose"><p>Киоск в саду «Эрмитаж» работал в 2024 году. В октябре 2026-го Пуэропорт вернулся как выездной проект в Ростове-на-Дону. О новых выездах команда сообщает в канале чайной.</p>'
            + a("Новости Пуэропорта", "https://t.me/cha108/4301")
            + "</div>",
        )
        + resume()
    )


def venue(v):
    filename = "venue-" + v["slug"] + ".webp"
    if not (ASSETS / filename).exists():
        filename = "flowerpot.webp"
    subst = filename == "flowerpot.webp"
    contact = defs(
        [
            ("Адрес", v["address"]),
            ("Часы работы", "Ежедневно " + v["hours"]),
            ("Бронь", a(v["phone"], "tel:" + v["tel"], "inline", False)),
            (
                "Официальная карточка",
                a(
                    "В Яндекс Картах",
                    "https://yandex.ru/maps/org/chaynaya_vysota/" + v["oid"] + "/",
                    "inline",
                    False,
                ),
            ),
        ]
    )
    ceremony = (
        group(
            "Церемониальная",
            '<div class="prose"><p>На Тверской есть отдельная комната с карпами. Для группы до восьми человек можно выбрать сценарий с несколькими чаями и мороженым. Запись на церемонию — через Виктора Енина.</p>'
            + links(
                a("+7 926 165-00-08", "tel:+79261650008"),
                a("Чайный шеф", ACTIVATE),
                a(
                    "Выбрать церемонию",
                    "https://teatix.com/product-category/certificate/ceremonies",
                ),
            )
            + "</div>",
        )
        if v == VENUES[0]
        else ""
    )
    return (
        intro([("Чайные Москвы", "venues/"), (v["name"], None)], v["full"], v["desc"])
        + f'<div class="feature"><div>{contact}{links(button("Позвонить для брони","tel:"+v["tel"]),a("Построить маршрут",route_url(v)))}</div><figure class="full-photo">{photo(filename,"Цветочный чай из коллекции клуба" if subst else v["full"])}<figcaption>{("Цветочная церемония клуба" if subst else v["full"])}</figcaption></figure></div>'
        + group(
            "Как добраться",
            "<p>"
            + v["way"]
            + "</p>"
            + map_iframe(v)
            + a("Открыть пеший маршрут", route_url(v)),
            id="route",
        )
        + ceremony
        + resume()
    )


def contact_form():
    # Express ticket holders can present their ticket directly at the door.
    opts = "".join(
        f'<option value="{t["slug"]}">{t["name"]}</option>'
        for t in TICKETS
        if t["slug"] != "express"
    )
    return f"""<div class="form-wrap"><p>До визита согласуйте встречу с организатором. Для активации билета звоните или пишите: {contact_link()}.</p><p>Форма подготовит текст для Telegram. Вы сами отправите его чайному шефу. Подтверждение места придёт от чайной.</p><form id="request-form"><label>Мой билет<select name="ticket">{opts}</select></label><label>Желаемая встреча<input name="program" maxlength="140" required placeholder="Тема, дата или «Уточнить следующую дату»"></label><button type="submit" class="form-submit">Подготовить сообщение{ARROW}</button></form><div class="form-result" id="draft" hidden><p role="status"></p><label>Сообщение для чайной<textarea></textarea></label><div class="actions">{a('Открыть Telegram',ACTIVATE,'button',attr='data-open-draft data-base="'+ACTIVATE+'"')}<button type="button" class="plain" data-copy>Скопировать</button><button type="button" class="plain" data-new-draft>Изменить выбор</button></div></div></div>"""


def contacts():
    routes = "".join(
        f'<button type="button" data-map-id="{v["oid"]}" data-frame="{escape(frame_url(v),quote=True)}" data-route="{escape(route_url(v),quote=True)}" data-label="{label}" aria-pressed="{str(i==0).lower()}">{v["name"]}</button>'
        for i, (v, label) in enumerate(zip(VENUES, ["на Тверскую", "на Покровку"]))
    )
    return (
        '<div id="contacts">'
        + intro(
            [("Контакты", None)],
            "Контакты чайной",
            "Для брони столика звоните в конкретную чайную. Запись на дегустацию ведёт организатор цикла.",
        )
        + '</div><div class="venue-contacts">'
        + "".join(venue_brief(v) for v in VENUES)
        + "</div>"
        + group(
            "На карте",
            '<div class="contact-controls">'
            + routes
            + "</div>"
            + map_iframe(VENUES[0], True)
            + a(
                "<span>Маршрут на Тверскую</span>",
                route_url(VENUES[0]),
                "text-link",
                attr="data-map-route",
            ),
        )
        + group("Активировать билет", contact_form(), id="activation")
        + group(
            "Общие вопросы",
            links(
                a("ЧайФон +7 926 165-00-08", "tel:+79261650008"),
                a("Контакты Teatix", "https://teatix.com/contact"),
                resume(),
            ),
        )
    )


def club():
    port = (
        "chef-enin.webp"
        if (ASSETS / "chef-enin.webp").exists()
        else "venue-tverskaya.webp"
    )
    pic = photo(
        port,
        (
            "Виктор Енин, основатель и чайный шеф"
            if port.startswith("chef")
            else "Вход в чайную на Тверской"
        ),
    )
    text = "<p>Основатель и чайный шеф Виктор Енин ведёт дегустации, работает с коллекцией чая и разрабатывает рецепты Кунгфу Айскрим. Первую партию чайного мороженого в клубе приготовили весной 2006 года.</p><p>В работе с российским чаем участвует Аля Тер-Ованесян. На встрече о чае Чёрного моря она представила образцы из Сочи и рассказала о сборе и обработке.</p>"
    return (
        intro(
            [("О клубе", None)],
            "Дом чая и мороженого",
            "В «Чайной высоте» пробуют один сорт в разных завариваниях, сравнивают урожаи и превращают чайные вкусы в мороженое.",
        )
        + f'<div class="feature"><div><h2>Команда чайной</h2>{text}{a("Разговор с Виктором Ениным","https://teatix.com/9669")}</div><figure class="full-photo">{pic}<figcaption>{("Виктор Енин · чайный шеф" if port.startswith("chef") else "Чайная на Тверской")}</figcaption></figure></div>'
        + group(
            "Из жизни клуба",
            go("Новости и подписка", "club/news/")
            + go("Наука. Вкусно", "club/science/", "Архив бесед с учёными")
            + go("Работа в чайной", "club/jobs/")
            + go("Журнал и рубрики", "journal/"),
        )
        + resume()
    )


MAPPING = json.loads((SRC / "menu-mapping.json").read_text(encoding="utf-8-sig"))
TOPICS = json.loads((SRC / "journal-topics.json").read_text(encoding="utf-8-sig"))


def old_route(target):
    return next(item["original"] for item in MAPPING if item["target"] == target)


def subclub(key):
    if key == "news":
        title = "Новости и подписка"
        body = (
            "<p>О предстоящих дегустациях и новых сортах команда пишет в Telegram и ВКонтакте. Архив записей доступен в блоге, обновления блога — в RSS.</p>"
            + links(
                button("Канал чайной", CHANNEL),
                a("ВКонтакте", "https://vk.com/cha108"),
                a("Подписаться по RSS", "https://cha108.ru/feed/"),
            )
        )
    elif key == "science":
        title = "Наука. Вкусно"
        body = (
            "<p>Клуб научных встреч придумали в конце 2011 года кристаллограф Артём Оганов, научный обозреватель Алексей Паевский и Виктор Енин. За столом с чаем и мороженым гость читал лекцию и отвечал на вопросы.</p><p>Среди архивных тем — рождение и смерть чёрных дыр с Эмилем Ахмедовым и возвращение к Луне с астрономом Владимиром Сурдиным.</p>"
            + links(
                a("Архив лекций в журнале", old_route("club/science/") + "#list_nv"),
                a("Все рубрики", "journal/"),
            )
        )
    else:
        title = "Работа в чайной"
        body = (
            "<p>Сохранившееся объявление о сезонном наборе опубликовано 28 января 2020 года. Текущие вакансии и условия можно уточнить у команды.</p>"
            + links(
                button("Уточнить у чайной", "contacts/"),
                a("Архивное объявление", old_route("club/jobs/")),
            )
        )
    return (
        intro([("О клубе", "club/"), (title, None)], title)
        + '<div class="prose">'
        + body
        + "</div>"
        + resume()
    )


def journal():
    cards = ""
    for t in TOPICS:
        name = t["title"] if t["title"] != "Uncategorized" else "Без рубрики"
        article = t["article"]
        link = (
            a(escape(article["title"]), article["href"], "inline", False)
            if article
            else ""
        )
        cards += f'<article class="journal-entry" id="{t["id"]}"><h3>{escape(name)}</h3>{link}{a("Открыть рубрику",t["url"],"text-link")}</article>'
    store = [
        i
        for i in MAPPING
        if "teatix.com" in i["original"] and i["group"] not in ("Pages", "Categories")
    ]
    labels = [
        "Магазин Teatix",
        "Порционные купажи",
        "Карточки заваривания «Столица чаепития»",
        "Чайные церемонии",
        "Билеты на 72 чайных отражения",
        "Имбирный эль Лавров",
        "Смеси для чайных лимонадов",
        "Чайные фьючерсы",
        "Билет «Чайная коллекция»",
    ]
    stores = "".join(go(n, i["original"]) for n, i in zip(labels, store))
    return (
        intro(
            [("Журнал", None)],
            "Журнал чайной",
            "Материалы клуба о чае, людях и событиях. В каждой рубрике можно открыть исходные записи.",
        )
        + group(
            "Рубрики",
            '<div class="journal-grid">' + cards + "</div>",
            a("Витрины Teatix", "#teatix"),
        )
        + group("Витрины Teatix", stores, id="teatix")
        + links(a("Старые записи блога", "https://cha108.ru/page/2/"), resume())
    )


def build():
    page("", "Афиша и чайная коллекция", home)
    page("schedule/", "Афиша дегустаций", schedule)
    for num in [67] + [e["num"] for e in ARCHIVE]:
        page(
            "schedule/" + str(num) + "/",
            "Дегустация № " + str(num),
            lambda n=num: event(n),
        )
    page("cycle/", "72 чайных отражения Сунь Укуна", cycle)
    for t in TICKETS:
        page(ticket_route(t), t["name"], lambda x=t: ticket_view(x))
    page("tickets/how/", "Как купить и активировать билет", how)
    page("tea/", "Чайная коллекция", tea)
    for t in TEAS:
        page("tea/" + t["slug"] + "/", t["name"], lambda x=t: tea_detail(x))
    page("tea/pick/", "Подобрать чай", pick_page)
    page("ice-cream/", "Чайное мороженое", ice)
    for d in DESSERTS:
        page(
            "ice-cream/" + d["slug"] + "/",
            MEDIA[d["file"]]["name"],
            lambda x=d: dessert(x),
        )
    page("venues/", "Чайные Москвы", venues)
    for v in VENUES:
        page("venues/" + v["slug"] + "/", v["full"], lambda x=v: venue(x))
    page("contacts/", "Контакты и активация билета", contacts)
    page("club/", "О клубе и команде", club)
    for sub, title in [
        ("news", "Новости"),
        ("science", "Наука. Вкусно"),
        ("jobs", "Вакансии"),
    ]:
        page("club/" + sub + "/", title, lambda x=sub: subclub(x))
    page("journal/", "Журнал и рубрики", journal)
    print(f"{len(PAGES)} pages generated")


if __name__ == "__main__":
    build()
