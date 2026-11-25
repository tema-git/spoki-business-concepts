"""Regenerate the static field guide with Python 3.10+ after updating data/*.json."""
from __future__ import annotations

import json
from datetime import datetime
from html import escape
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent
read = lambda name: json.loads((ROOT / "data" / name).read_text(encoding="utf-8-sig"))
retail = read("retail.json")
media = read("media.json")
navigation = read("navigation.json")
fish = {item["id"]: item for item in media["species"]}
rows = retail["rows"]
sources = retail["sources"]
offers = {key: [r for r in rows if r.get("slug") == key] for key in fish}
news = {a["id"]: a for a in retail["arrivals"]}
ENV = {"fresh":"Пресная вода","marine":"Морская вода"}
ROUTE = "https://yandex.ru/maps/?rtext=~55.693224%2C37.549417&rtt=pedestrian"
YMAP = "https://yandex.ru/map-widget/v1/?ol=biz&oid=86770098976&z=17"
PHONE = "+7 499 745-00-55"
TEL = "tel:+74997450055"
CONTACT = "https://www.aqualogo.ru/contacts"
ARROW = '<svg class="arrow" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>'
LOUPE = '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="10" r="6.4"/><path d="m15 15 5.5 5.5"/></svg>'
HAMB = '<svg class="menu-icon" aria-hidden="true" viewBox="0 0 22 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 4h18M2 9h18M2 14h18"/></svg>'
MARK = '<span class="bubbles" aria-hidden="true"><i></i></span>'
MONTH = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]
pages = {}
e = lambda v: escape(str(v),quote=True)
def when(timestamp, clock=True):
    dt = datetime.fromisoformat(timestamp)
    day = f"{dt.day} {MONTH[dt.month-1]} {dt.year}"
    return day + (f", {dt:%H:%M} МСК" if clock else "")
def money(value):
    return f"{value:,.0f}".replace(",","\u202f")+" ₽"
def anchor(url,label,cls="",arrow=False):
    return f'<a href="{e(url)}" class="{e(cls)}">{e(label)}{ARROW if arrow else ""}</a>'
def button(url,label,style="primary"):
    return anchor(url,label,"btn "+style,True)
def textlink(url,label):
    return anchor(url,label,"text-link",True)
def ask(r):
    return "contacts.html?"+urlencode({"kind":r["name"],"size":r["size"]})+"#question"
def chips(p,which):
    links=[("catalog.html","Все виды","all"),("fresh.html","Пресноводные","fresh"),("marine.html","Морские","marine")]
    return '<nav aria-label="Среда обитания" class="pills">'+"".join(anchor(p+url,name,"pill"+(" active" if which==key else "")) for url,name,key in links)+'</nav>'
def title(name,subtitle="",latin=False):
    return f'<div class="page-lead"><h1 class="page-title">{e(name)}</h1>'+ (f'<p class="{"latin" if latin else "subtle"}">{e(subtitle)}</p>' if subtitle else "")+'</div>'
def crumb(p,items):
    return '<nav class="breadcrumb" aria-label="Хлебные крошки">'+anchor(p+"index.html","Атлас")+''.join('<span aria-hidden="true">/</span>'+ (anchor(p+url,name) if url else f'<span aria-current="page">{e(name)}</span>') for name,url in items)+'</nav>'
def source_note(f):
    a=anchor(f["photoSource"],f["credit"])
    if f.get("licenseUrl"):
        a+=" · "+anchor(f["licenseUrl"],f["license"])+" · полный кадр, WebP"
    return '<figcaption class="photo-note">Фото — '+a+'</figcaption>'
def finder(p="",examples=False):
    return f'''<form class="finder" role="search" action="{p}search.html" method="get">
    <div class="lookup"><div class="field-row">{LOUPE}<input type="search" name="q" aria-label="Русское или латинское название рыбы" placeholder="Название или латынь" autocomplete="off" maxlength="120"><button class="btn primary" type="submit">Найти{ARROW}</button></div>
    <div class="suggestions" aria-label="Подсказки поиска" hidden></div></div></form>'''+(f'<div class="examples"><span>Например</span>{anchor(p+"search.html?q=Скалярия","скалярия")}{anchor(p+"search.html?q=Acantopsis","Acantopsis")}</div>' if examples else '')
def header(p,active):
    main=[("catalog.html","Каталог","catalog"),("arrivals.html","Поступления","arrivals"),("price.html","Прайс","price"),("services.html","Услуги","services")]
    extra=[("fresh.html","Пресноводные"),("marine.html","Морские"),("game.html","Узнай обитателя"),("about.html","О супермаркете"),("directory.html","Все разделы"),("contacts.html","Как добраться")]
    links=''.join(anchor(p+url,label,"active" if key==active else "") for url,label,key in main)
    menu=''.join(anchor(p+url,label,"",True) for url,label in [(u,l) for u,l,_ in main]+extra)
    return f'''<a class="skip" href="#main">К содержанию</a><header class="header"><div class="shell bar">
    <a class="brand" href="{p}index.html" aria-label="Аква Лого — Университет, главная"><img src="{p}assets/media/brand-compact.png" width="54" height="41" alt=""><span class="brand-type"><b>Аква Лого</b><small>Университет</small></span></a>
    <nav aria-label="Главное меню" class="topnav">{links}<button type="button" class="more" aria-controls="drawer" aria-expanded="false">Ещё {HAMB}</button></nav>
    <a href="{p}contacts.html" class="head-contact"><span>Контакты{ARROW}</span></a><button class="head-menu" type="button" aria-label="Меню" aria-controls="drawer" aria-expanded="false">{HAMB}</button>
    <nav id="drawer" class="drawer" aria-label="Разделы сайта" hidden>{menu}</nav></div></header>'''
def footer(p):
    links=[("catalog.html","Каталог обитателей"),("arrivals.html","Поступления"),("price.html","Розничный прайс"),("services.html","Услуги"),("game.html","Узнай обитателя"),("directory.html","Все разделы")]
    return f'''<footer class="footer"><div class="shell"><div class="foot-grid"><div><a class="foot-brand" href="{p}index.html">Аква Лого</a><p>Аквариумный супермаркет «Университет»</p></div><nav aria-label="Навигация в подвале">{''.join(anchor(p+u,l) for u,l in links)}</nav><div>{anchor(TEL,PHONE)}<p>{anchor(p+"contacts.html","Как добраться")}</p></div></div>
    <div class="foot-credit"><span>Демо-редизайн супермаркета</span><span>Сайт создан Spoki Studio</span></div></div></footer>'''
def page(path,name,content,active="",description="Полевой атлас аквариумных рыб супермаркета «Аква Лого — Университет» в Москве."):
    p="../"*path.count("/")
    html=f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f5ec"><title>{e(name)} · Аква Лого — Университет</title><meta name="description" content="{e(description)}"><link rel="icon" href="{p}assets/media/brand-compact.png"><link rel="stylesheet" href="{p}assets/style.css"><script defer src="{p}assets/app.js"></script></head>
<body data-root="{p or './'}">{header(p,active)}<main id="main" class="shell" tabindex="-1">{content}</main>{footer(p)}</body></html>'''
    pages[path]=html
def card(f,p=""):
    variants=offers[f["id"]]
    r=min(variants,key=lambda v:v["price"])
    link=p+"species/"+f["id"]+".html"
    cost=("от " if len(variants)>1 else "")+money(r["price"])+" / шт."
    sizes=" / ".join(dict.fromkeys(v["size"] for v in variants))
    return f'''<article class="card"><a class="card-photo" href="{link}" aria-label="{e(f["name"])}"><img src="{p}assets/media/{e(f["photo"])}" width="{f["width"]}" height="{f["height"]}" alt="{e(f["alt"])}" loading="lazy"></a>
    <div class="card-id">{MARK}{ENV[r["env"]]}</div><h3>{anchor(link,f["name"])}</h3><p class="latin" lang="la">{e(f["latin"])}</p>
    <div class="card-data"><span>Размер {e(sizes)}</span><b>{cost}</b></div><p class="stamp">Прайс · {when(r["updated"])}</p></article>'''
def grid(keys,p=""):
    return '<div class="cards">'+''.join(card(fish[k],p) for k in keys)+'</div>'
def section_head(name,link=""):
    return f'<div class="section-head"><h2 class="section-title">{e(name)}</h2>{link}</div>'
def game_feature(p=""):
    return f'''<section class="section"><div class="feature dark motion"><div><h2 class="section-title">Узнай обитателя</h2><p>Три силуэта аквариумных рыб. Узнайте вид по форме тела и плавников, затем сравните с фотографией.</p>{button(p+"game.html","Играть","accent")}</div><div class="game-art-mini" aria-hidden="true"><img src="{p}assets/shape-scalare.svg" alt=""></div></div></section>'''
def habitats():
    return '''<div class="habitats">'''+''.join(f'''<a class="habitat {cls} motion" href="{url}"><div><h3>{label}</h3><p>{sub}</p><span class="round">{ARROW}</span></div><div class="scene" aria-hidden="true"><img alt="" src="assets/shape-{shape}.svg"></div></a>''' for cls,url,label,sub,shape in [("fresh","fresh.html","Пресноводные","Речные и озёрные рыбы","scalare"),("sea","marine.html","Морские","Обитатели морей и рифов","pterois")])+'</div>'
def visit(p="",with_map=False):
    left=f'''<div class="panel"><div class="eyebrow">м. Университет · Москва</div><address>ул. Молодёжная, 4</address><p>Супермаркет открыт ежедневно, 10:00–21:00.</p><p>Вход в цоколь со стороны улицы Фотиевой, у подъезда № 5.</p><div class="actions">{button(TEL,PHONE,"accent")}{button(ROUTE,"Построить маршрут","quiet")}</div><div class="source-line">{anchor(CONTACT,"Контакты «Аква Лого»")}</div></div>'''
    if with_map:
        return f'<div class="visit">{left}<iframe class="ymap" title="Яндекс Карта — супермаркет Аква Лого, Молодёжная, 4" src="{YMAP.replace("&","&amp;")}" loading="lazy" allowfullscreen></iframe></div>'
    return left
def linked_news(a,p=""):
    ids=[f for f in fish if any(a["id"] in r.get("arrivals",[]) for r in offers[f])]
    tags=' · '.join(anchor(p+"species/"+key+".html",fish[key]["name"]) for key in ids)
    return f'''<article class="news-item" id="{e(a["id"])}"><time datetime="{e(a["published"])}">{when(a["date"],False)}</time><div><h3>{e(a["title"])}</h3><p class="subtle">Сообщение супермаркета «{e(a["shop"])}» · {ENV[a["env"]].lower()}</p>'''+(f'<p>В атласе — {tags}.</p>' if tags else '')+textlink(a["source"],"Публикация на форуме")+'</div></article>'

home=f'''<section class="hero"><div class="hero-copy"><div class="kicker">Аквариумный супермаркет · Москва</div><h1>Атлас<br><em>обитателей</em></h1><p>Найдите рыбу и проверьте её наличие в супермаркете у метро «Университет».</p>{finder(examples=True)}</div>
<a class="plate motion" href="species/pterois.html" aria-label="Крылатка-зебра, открыть карточку вида"><span class="ticks" aria-hidden="true"></span><span class="plate-art"><img src="assets/lionfish.svg" alt="Иллюстрация крылатки-зебры с раскрытым веером плавников" width="524" height="376"></span><span class="plate-cap"><strong>Крылатка-зебра</strong><i lang="la">Pterois volitans</i><span class="round">{ARROW}</span></span></a></section>
<section class="section">{section_head("Разделы атласа",textlink("catalog.html","Весь каталог"))}{habitats()}</section>
<section class="section">{section_head("Карточки видов",textlink("price.html","Все цены"))}{grid(["acantopsis","botia","ocellaris"])}</section>
{game_feature()}
<section class="section">{section_head("Поступления",textlink("arrivals.html","Лента поступлений"))}<div class="list-news">{''.join(linked_news(a) for a in sorted(news.values(),key=lambda v:v["date"],reverse=True)[:2])}</div></section>'''
page("index.html","Атлас обитателей",home)
order=["acantopsis","scalare","neon","botia","ocellaris","pterois","zebrasoma","hepatus"]
for env,path,label,descr in [("all","catalog.html","Каталог обитателей","Фотографии, размеры и розничные цены рыб супермаркета «Университет»."),("fresh","fresh.html","Пресноводные обитатели","Рыбы рек и озёр. Откройте карточку, чтобы посмотреть размеры, цену и сведения магазина."),("marine","marine.html","Морские обитатели","Рыбы морей и коралловых рифов. У каждого вида — фотография, розничная цена и сведения магазина.")]:
    keys=[k for k in order if env=="all" or fish[k]["water"]==env]
    page(path,label,crumb("",[(label,None)])+title(label,descr)+'<div class="search-area">'+finder()+'</div>'+chips("",env)+grid(keys)+f'<section class="band">'+textlink("price.html"+("?env="+env if env!="all" else ""),"Открыть полный розничный прайс")+'</section>',"catalog")
def offer_box(r,p):
    amount=r["stock"]
    count=f'{amount} шт.' if amount is not None else 'число не указано'
    arr=[news[k] for k in r.get("arrivals",[]) if k in news]
    forum=(f'<p class="source-line">Форум · '+anchor(arr[0]["source"],when(arr[0]["date"],False))+f' · в сообщении указан размер {e(r["size"])}.</p>' if arr else f'<p class="source-line">В разобранных сообщениях форума этот вид и размер не упомянуты. {anchor(p+"arrivals.html","Лента поступлений")}</p>')
    return f'''<section class="offer" id="{e(r["id"])}"><div class="measure"><span>Размер <b>{e(r["size"])}</b></span><strong>{money(r["price"])} / шт.</strong></div><p class="stock-text" data-stock="{amount if amount is not None else ''}" data-updated="{e(r["updated"])}">Уточнить наличие</p><p class="source-line">Остаток «Университета» · {count} на {when(r["updated"])}. {anchor(r["source"],"Розничный прайс")}</p>{forum}<div class="actions">{button(p+ask(r),"Уточнить наличие","accent")}{anchor(TEL,PHONE,"phone")}</div></section>'''
for key,f in fish.items():
    p="../"; env=f["water"]; variants=offers[key]
    desc=f'<figure><div class="specimen"><img src="{p}assets/media/{e(f["photo"])}" width="{f["width"]}" height="{f["height"]}" alt="{e(f["alt"])}"></div>{source_note(f)}</figure>'
    retailbox='<div class="panel"><div class="eyebrow">'+ENV[env]+' · Супермаркет «Университет»</div>'+''.join(offer_box(r,p) for r in variants)+'</div>'
    body=crumb(p,[("Каталог","catalog.html"),(ENV[env],env+".html"),(f["name"],None)])+title(f["name"],f["latin"],True)+f'<div class="content-grid">{desc}{retailbox}</div>'
    body+=f'''<section class="band two-column"><div class="article"><h2>Как узнать вид</h2><p>{e(f["trait"])}</p><div class="actions">{textlink(p+env+".html","Вернуться к выбору")}</div></div><div><h2 class="minor-title">Перед поездкой</h2>{visit(p)}</div></section>'''
    page("species/"+key+".html",f["name"],body,"catalog",f["name"]+". "+f["trait"])
def news_entries(a):
    entries=a["entries"]
    return '<details class="entries"><summary>Виды и размеры из сообщения</summary><ul>'+''.join(f'<li>{e(v["name"])}'+(f' · {e(v["size"])}' if v.get("size") else '')+'</li>' for v in entries)+'</ul></details>'
target=crumb("",[("Поступления",None)])+title("Поступления","Магазин публикует списки на двух форумах. Дата сообщения показывает, когда появился список. Остаток перед поездкой смотрите в карточке вида.")
target+='<div class="pills">'+anchor("#fresh","Пресная вода","pill")+anchor("#marine","Морская вода","pill")+'</div>'
for env in ENV:
    target+=f'<section class="band" id="{env}"><h2 class="minor-title">{ENV[env]}</h2>'
    for a in sorted((n for n in news.values() if n["env"]==env),key=lambda n:n["date"],reverse=True):
        target+=linked_news(a).replace("</div></article>",news_entries(a)+"</div></article>")
    target+='</section>'
target+=textlink("https://www.aqualogo.ru/postavki_zhivogo_tovara","Все сообщения о поставках")
page("arrivals.html","Поступления",target,"arrivals")
def results_page(kind):
    is_price=kind=="price"; label="Розничный прайс" if is_price else "Поиск обитателей"
    subtitle=(f'{len(rows)} размерных позиций пресноводных и морских рыб. Цены за один экземпляр. Обновление прайсов — {when(sources["fresh"]["updated"])}.' if is_price else "Поиск по русскому или латинскому названию в карточках атласа и розничном прайсе.")
    b=crumb("",[(label,None)])+title(label,subtitle)
    b+=f'<div class="search-area">{finder()}</div><div id="retail-results" data-mode="{kind}"><div class="pills" role="group" aria-label="Среда обитания">'+''.join(f'<button class="pill" type="button" data-env="{k}" aria-pressed="{str(k=="all").lower()}">{e(v)}</button>' for k,v in [("all","Все"),("fresh","Пресноводные"),("marine","Морские")])+'</div><p class="stamp" id="result-count" aria-live="polite"></p><div id="result-body"></div></div>'
    b+='<noscript><p>Полный розничный прайс у магазина — '+anchor(sources["fresh"]["url"],"пресноводные рыбы")+' и '+anchor(sources["marine"]["url"],"морские рыбы")+'.</p></noscript>'
    if is_price:
        b+='<section class="band" id="all-prices"><h2 class="minor-title">Другие прайсы супермаркета</h2><div class="directory">'+''.join(anchor(u["url"],u["title"],"line-link",True) for u in navigation.get("priceCategories",[]) if u.get("url"))+'</div></section>'
    return b
page("price.html","Розничный прайс",results_page("price"),"price")
page("search.html","Поиск обитателей",results_page("search"),"catalog")
page("entry.html","Позиция розничного прайса",crumb("",[("Розничный прайс","price.html"),("Карточка",None)])+'<div id="entry"><p class="stamp">Загружаем карточку вида…</p></div><section class="band"><h2 class="minor-title">Перед поездкой</h2>'+visit()+'</section>',"catalog")
def question():
    return f'''<section class="band" id="question"><h2 class="minor-title">Уточнить наличие</h2><form id="question-form" class="question"><p>Подготовьте вопрос о виде и размере. Сайт покажет текст для звонка или письма. Отправка письма — в вашей почте.</p><div class="input-set"><label>Вид<input name="kind" autocomplete="off" required maxlength="150" placeholder="Например, акантопсис"></label><label>Размер<input name="size" autocomplete="off" maxlength="50" placeholder="Если известен"></label></div><button type="submit" class="btn primary">Подготовить вопрос{ARROW}</button><div class="question-output" id="prepared" hidden><p class="feedback">Текст для продавца</p><p id="question-text"></p><div class="actions">{button(TEL,"Позвонить "+PHONE,"accent")}<a class="btn quiet" id="mail-link" href="mailto:supermarket@aqualogo.ru">Открыть почту{ARROW}</a></div></div></form></section>'''
contact=crumb("",[("Контакты",None)])+title("Как добраться","Супермаркет «Аква Лого — Университет», Москва.")+'<section id="visit">'+visit(with_map=True)+'</section>'
contact+=question()+f'''<section class="band two-column"><div class="article"><h2>Салон на Молодёжной</h2><p>Салон проектирует и изготавливает аквариумы. Он работает в том же здании с понедельника по субботу 11:00–20:00, в воскресенье 11:00–19:00.</p><div class="actions">{textlink("https://salon.aqualogo.ru/","Перейти в салон")}{anchor("tel:+74997450011","+7 499 745-00-11")}</div></div><div class="article"><h2>Интернет-магазин</h2><p>Aqua-Shop принимает заказы онлайн. По заказу с доставкой обращайтесь в интернет-магазин на улице Сальвадора Альенде, 7.</p><div class="actions">{textlink("https://www.aqua-shop.ru/","Перейти в Aqua-Shop")}{anchor("tel:+74997450044","+7 499 745-00-44")}</div></div></section>'''
entrance=next(x for x in media["store"] if x["id"]=="store-entrance")
contact+=f'<section class="band"><h2 class="minor-title">Вход со стороны улицы Фотиевой</h2><figure class="store-photo"><img src="assets/media/{entrance["photo"]}" alt="{e(entrance["label"])}" loading="lazy">{source_note(entrance)}</figure></section>'
page("contacts.html","Как добраться и уточнить наличие",contact)
pages["contacts.html"]=pages["contacts.html"].replace('<section class="band two-column">','<section class="band two-column" id="network">',1)
game_data=[]
for key,choices in [("scalare",["acantopsis","scalare","pterois"]),("acantopsis",["acantopsis","pterois","scalare"]),("pterois",["scalare","acantopsis","pterois"])]:
    f=fish[key]
    game_data.append({**{k:f.get(k) for k in ["id","name","latin","photo","alt","trait","photoSource","credit","license","licenseUrl"]},"choices":[{"id":k,"name":fish[k]["name"]} for k in choices]})
game=crumb("",[("Узнай обитателя",None)])+title("Узнай обитателя","Выберите название по силуэту. После ответа сравните рисунок с фотографией живой рыбы.")
game+='<div id="game" class="band" aria-live="polite"></div><script type="application/json" id="game-data">'+json.dumps(game_data,ensure_ascii=False).replace("<","\\u003c")+'</script><noscript>Для игры включите JavaScript. '+anchor("catalog.html","Посмотреть фотографии видов")+'</noscript>'
page("game.html","Узнай обитателя",game)

# Directory and article destinations are kept alongside the source inventory.
def make_directory():
    directory=crumb("",[("Все разделы",None)])+title("Все разделы","Навигация по супермаркету и официальным сервисам «Аква Лого».")
    groups=navigation["groups"]
    directory+='<div class="directory">'
    for g in groups:
        directory+=f'<section class="dir-group"><h2>{e(g["title"])}</h2>'+''.join(anchor(i["dest"],i["title"],"",True) for i in g["items"])+'</section>'
    for field,heading in [("network","Разделы компании"),("networkServices","Услуги салона"),("social","Каналы компании")]:
        directory+=f'<section class="dir-group"><h2>{heading}</h2>'+''.join(anchor(i["url"],i["title"],"",True) for i in navigation.get(field,[]))+'</section>'
    directory+='</div>'
    page("directory.html","Все разделы",directory)
    for g in groups:
        for i in g["items"]:
            path=i["dest"]
            if not path.startswith("info/") or path in pages: continue
            p="../"
            b=crumb(p,[("Все разделы","directory.html"),(i["title"],None)])+title(i["title"],i.get("summary",""))
            b+='<section class="article band">'
            detail=i.get("detail","")
            if isinstance(detail,str):detail=[detail]
            b+=''.join(f'<p>{e(v)}</p>' for v in detail if v)
            b+='<div class="actions">'+button(i["source"],"Официальная страница","primary")+'</div></section>'
            if i["id"]=="gallery":
                b+='<section class="band"><h2 class="minor-title">Фотографии магазина</h2><div class="gallery-grid">'
                for photo in media["store"]:
                    b+=f'<figure class="store-photo"><img src="{p}assets/media/{e(photo["photo"])}" alt="{e(photo["label"])}" loading="lazy"><p>{e(photo["label"])}</p>{source_note(photo)}</figure>'
                b+='</div><div class="actions">'+textlink(p+"catalog.html","Фотографии видов в атласе")+'</div></section>'
            if i.get("links"):
                b+='<section class="band"><h2 class="minor-title">По теме</h2><div class="directory">'+''.join(anchor(v["url"],v["title"],"line-link",True) for v in i["links"])+'</div></section>'
            b+='<div class="actions">'+textlink(p+"directory.html","К разделам супермаркета")+textlink(p+"catalog.html","Выбрать обитателя")+'</div>'
            page(path,i["title"],b)
    return groups
groups=make_directory()
about=crumb("",[("О супермаркете",None)])+title("Супермаркет «Университет»","Аквариумные рыбы, растения, оборудование и консультации в магазине на Молодёжной.")
inside=next(x for x in media["store"] if x["id"]=="store-interior")
about+=f'<div class="content-grid"><figure class="store-photo"><img src="assets/media/{inside["photo"]}" alt="{e(inside["label"])}">{source_note(inside)}</figure><div class="article"><h2>Что можно сделать в магазине</h2><p>Посмотреть обитателей в аквариумах, подобрать размер рыбы по розничному прайсу и обратиться к продавцу. Списки поступлений магазин ведёт на пресноводном и морском форумах.</p><div class="actions">{button("catalog.html","Выбрать рыбу")}{textlink("contacts.html","Посетить магазин")}</div></div></div>'
about+='<section class="band"><h2 class="minor-title">Об «Аква Лого»</h2><div class="directory">'+''.join(anchor(x["url"],x["title"],"line-link",True) for x in navigation["network"])+'</div></section>'
about+=textlink("https://www.aqualogo.ru/market_portfolio","Супермаркет на сайте компании")
page("about.html","О супермаркете",about)
service=crumb("",[("Услуги",None)])+title("Услуги","Выберите, с чем обращаетесь. Супермаркет, салон и Aqua-Shop отвечают за разные задачи.")
service+=f'<div class="two-column"><section class="panel"><h2>Консультация по рыбам</h2><p>Вид, размер и остаток в магазине на Молодёжной подскажет продавец супермаркета.</p><div class="actions">{button("contacts.html#question","Подготовить вопрос","accent")}</div></section><section class="panel"><h2>Проект и обслуживание</h2><p>Проектирование, изготовление и обслуживание аквариумов ведёт салон «Аква Лого».</p><div class="actions">{textlink("https://salon.aqualogo.ru/","Официальный салон")}</div></section></div>'
service+='<section class="band"><h2 class="minor-title">Услуги и информация для покупателей</h2><div class="directory">'+''.join(anchor(i["dest"],i["title"],"line-link",True) for g in groups for i in g["items"] if i["dest"].startswith("info/") and any(word in (i["title"].lower()) for word in ["сервис","достав","подароч","дисконт","экскурс","покупател","прокат"]))+'</div></section>'+textlink("directory.html","Все разделы")
page("services.html","Услуги и сервис",service,"services")
for path,html in pages.items():
    dest=ROOT/path
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(html,encoding="utf-8")
print(f"Built {len(pages)} static pages, {len(fish)} illustrated species, {len(rows)} retail offers.")
