// Refresh the shared, fully static navigation after adding a page or menu item.
// Run with Node from any directory. GitHub Pages serves the resulting HTML directly.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sections = [
  ["Обучение", [
    ["Школа", "shkola/"], ["Набор в группы", "nabor-novichkov/"], ["Расписание", "#schedule"],
    ["Уроки", "shkola/uroki/"], ["Преподаватели", "shkola/prepodavateli/"],
    ["Цены", "shkola/stoimost/"], ["Сертификаты", "shkola/podarochnye-sertifikaty/"]
  ]],
  ["События", [
    ["Афиша", "afisha/"], ["Практики и милонги", "shkola/events/"],
    ["Концерты и спектакли", "afisha/koncerty-tango/"], ["Новости", "novosti/"]
  ]],
  ["Культура танго", [
    ["О танго", "tango/"], ["История", "tango/argentinskoe-tango/"], ["Фильмы", "tango/filmy/"],
    ["Книги", "tango/knigi/"], ["Видео", "blog/"]
  ]]
];
const primary = [["Расписание", "#schedule"], ["Школа", "shkola/"], ["Набор", "nabor-novichkov/"], ["Афиша", "afisha/"], ["О танго", "tango/"]];

function chrome(pagePath) {
  const depth = pagePath.split("/").filter(Boolean).length;
  const base = depth ? "../".repeat(depth) : "./";
  const href = path => path === "#schedule" && depth ? base + "shkola/raspisanie/#schedule" : !depth && path.startsWith("#") ? path : base + path;
  const link = ([label,path]) => '<a href="' + href(path) + '"' + (path === pagePath ? ' aria-current="page"' : '') + '>' + label + '</a>';
  const ico = (id, cls = "icon") => '<svg class="' + cls + '" aria-hidden="true"><use href="' + base + 'assets/ui.svg#i-' + id + '"/></svg>';
  const brand = '<a class="brand" href="' + base + '" aria-label="TangoCity, главная"><img src="' +
    base + 'assets/tangocity-logo.svg" width="189" height="40" alt=""></a>';
  const groups = sections.map(([name,links]) => '<div class="nav-group"><p>' + name + '</p>' + links.map(link).join("") + '</div>').join("\n");
  const contactPath = !depth ? "#contacts" : pagePath === "kontakty/" ? "#zapis" : href("kontakty/");
  const header = '<header class="site-header"><div class="wrap header-inner">' + brand +
    '<nav class="main-nav" aria-label="Основная навигация">' + primary.map(link).join("") + '</nav><div class="header-actions">' +
    '<details class="site-menu"><summary aria-label="Меню разделов">' + ico("menu") + '<span>Меню</span></summary>' +
    '<nav class="site-menu-panel" aria-label="Все разделы"><div class="wrap menu-grid">' + groups +
    '<div class="nav-group"><p>Связь</p>' + link(["Контакты и адрес","kontakty/"]) + link(["Первый урок","#first-lesson"]) +
    link(["След в след","#rhythm"]) + link(["Все страницы","karta-sayta/"]) + '</div></div></nav></details>' +
    '<a href="' + contactPath + '" class="header-contact"><span>Контакты ' + ico("arrow","arrow") +
    '</span></a></div></div><nav class="mobile-primary" aria-label="Быстрые переходы">' + primary.slice(0,4).map(link).join("") + '</nav></header>';
  const footer = '<footer class="site-footer"><div class="wrap footer-map"><div class="footer-identity">' + brand +
    '<p>Школа аргентинского танго<br>в Москве</p>' + link(["Контакты и адрес","kontakty/"]) + '</div>' + groups +
    '</div><div class="wrap footer-inner"><a class="footer-signature" href="' + base + '">Tango<i>City</i></a>' +
    link(["Все страницы","karta-sayta/"]) + '<span>Сайт создан Spoki Studio</span></div></footer>';
  return { header, footer };
}
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir,entry.name);
    if (entry.isDirectory() && !["assets","tools"].includes(entry.name)) await visit(path);
    if (!entry.isFile() || entry.name !== "index.html") continue;
    const rel = relative(root,dirname(path)).split(sep).filter(Boolean).join("/");
    const {header,footer} = chrome(rel ? rel + "/" : "");
    const old = await readFile(path,"utf8");
    if (!old.includes('<header class="site-header"') || !old.includes('<footer class="site-footer"')) throw new Error("Missing layout slot in " + path);
    const html = old.replace(/<header class="site-header">[\s\S]*?<\/header>/,header)
      .replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,footer)
      .replace(/assets\/ui\.svg(?:\?v=[\d.]+)?#/g,"assets/ui.svg?v=3#")
      .replace(/assets\/gestures\.svg(?:\?v=[\d.]+)?#/g,"assets/gestures.svg?v=6#")
      .replace(/assets\/mark\.svg(?:\?v=[\d.]+)?"/g,'assets/mark.svg?v=3"')
      .replace(/(site\.js|app\.js|school-calendar\.js|enrollment\.js)(?:\?v=[\d.]+)?"/g,'$1?v=3"')
      .replace(/rhythm\.js(?:\?v=[\d.]+)?"/g,'rhythm.js?v=5"')
      .replace(/dance\.js(?:\?v=[\d.]+)?"/g,'dance.js?v=6"')
      .replace(/(<link rel="stylesheet" href="([^"]*?)sections\.css(?:\?v=[\d.]+)?">)(?:\s*(<link rel="stylesheet" href="[^"]*dance\.css(?:\?v=[\d.]+)?">))?/g,
        (_,sections,prefix,dance) => sections + (dance || '<link rel="stylesheet" href="'+prefix+'dance.css">'))
      .replace(/\b(style|sections)\.css(?:\?v=[\d.]+)?"/g,'$1.css?v=5"')
      .replace(/\bdance\.css(?:\?v=[\d.]+)?"/g,'dance.css?v=6"');
    if (old !== html) await writeFile(path,html);
  }
}
// Both schedule entry points use the same booking dialog and card container.
async function timetablePage() {
  const home = await readFile(join(root,"index.html"),"utf8");
  const schedule = home.match(/<section class="schedule wrap scene"[\s\S]*?<\/section>/)?.[0];
  const booking = home.match(/<dialog id="booking"[\s\S]*?<\/dialog>/)?.[0];
  if (!schedule || !booking) throw new Error("Missing schedule or booking markup in the homepage");
  const page = '<!doctype html>\n<html lang="ru" data-base="../../"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="robots" content="noindex,follow"><meta name="description" content="Групповые занятия TangoCity. Выберите уровень, дату и преподавателя.">' +
    '<title>Расписание занятий — TangoCity</title><link rel="icon" href="../../assets/mark.svg"><link rel="stylesheet" href="../../assets/fonts/fonts.css">' +
    '<link rel="stylesheet" href="../../style.css"><link rel="stylesheet" href="../../sections.css">' +
    ["site.js","schedule.js?v=2","school-calendar.js","app.js?v=2"].map(src => '<script defer src="../../'+src+'"></script>').join("") +
    '</head><body id="top"><a class="skip" href="#schedule">К расписанию</a><header class="site-header"></header>' +
    '<main class="standalone-schedule"><div class="wrap"><nav class="crumb" aria-label="Путь по сайту"><a href="../../">Главная</a><span aria-hidden="true">/</span><a href="../">Школа</a><span aria-hidden="true">/</span><span>Расписание</span></nav></div>\n' +
    schedule.replaceAll("./assets/","../../assets/").replace('<h2 id="schedule-title">Расписание</h2>','<h1 id="schedule-title">Расписание</h1>') +
    '<div class="wrap folio-source"><a class="text-link" href="../../nabor-novichkov/">Как выбрать группу</a><a class="text-link" href="../stoimost/">Цены и абонементы</a></div></main>' +
    '<footer class="site-footer"></footer>\n' + booking.replaceAll("./assets/","../../assets/").replaceAll("./kontakty/","../../kontakty/") + '\n</body></html>\n';
  const dir=join(root,"shkola","raspisanie");
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,"index.html"), page);
}
await timetablePage();
await visit(root);
