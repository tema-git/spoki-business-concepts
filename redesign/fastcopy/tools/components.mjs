export const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs = {
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  next:'<path d="m9 5 7 7-7 7"/>', down:'<path d="m5 9 7 7 7-7"/>',
  menu:'<path d="M3 7h18M3 16h18"/>', close:'<path d="m5 5 14 14M19 5 5 19"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1.5 7.5M4 4v6h6"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  register:'<circle cx="12" cy="12" r="6"/><path d="M12 1v7m0 8v7M1 12h7m8 0h7"/>',
  sliders:'<path d="M3 6h9m5 0h4M3 12h3m5 0h10M3 18h12m5 0h1"/><circle cx="14" cy="6" r="2.3"/><circle cx="8" cy="12" r="2.3"/><circle cx="17" cy="18" r="2.3"/>',
  sheet:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4"/>',
  mail:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  plus:'<path d="M4 12h16M12 4v16"/>', minus:'<path d="M4 12h16"/>',
  left:'<path d="M20 12H4m6-6-6 6 6 6"/>', up:'<path d="M12 20V4m-6 6 6-6 6 6"/>',
  right:'<path d="M4 12h16m-6-6 6 6-6 6"/>', lower:'<path d="M12 4v16m-6-6 6 6 6-6"/>',
  search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>'
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]}</svg>`;
export const arrow=()=>icon('arrow','go');
export const pathTo=(pre,slug)=>slug==='index'?pre:pre+slug+'/';
export const logo=(pre)=>`<img src="${pre}assets/media/fastcopy-logo.svg" width="136" height="34" alt="Типография Фасткопи">`;
export function header(pre,active) {
  const items=[['index','Калькулятор'],['catalog','Каталог'],['services','Услуги'],['order','Как заказать']];
  const link=([id,name])=>`<a href="${pathTo(pre,id)}"${id===active?' aria-current="page"':''}>${name}</a>`;
  return `<a class="skip" href="#main">К содержанию</a><header class="mast"><div class="wrap head-inner">
    <a class="wordmark" href="${pre}" aria-label="Фасткопи — главная">${logo(pre)}</a>
    <nav aria-label="Основное меню" class="desktop-nav">${items.map(link).join('')}</nav>
    <div class="head-actions"><a class="contact-target" href="${pre}contacts/"><span>Контакты ${arrow()}</span></a>
    <button class="menu-toggle icon-button" type="button" aria-expanded="false" aria-label="Открыть меню" aria-controls="mobile-nav">${icon('menu')}</button></div>
    </div><nav id="mobile-nav" class="mobile-nav" hidden aria-label="Мобильное меню"><div class="wrap">${[...items,['artwork','Требования к макету'],['sitemap','Все разделы']].map(link).join('')}</div></nav></header>`;
}
export function footer(pre) {
  return `<footer><div class="wrap foot-main"><div class="foot-brand"><a href="${pre}" class="wordmark">${logo(pre)}</a><p>Москва, Тайнинская ул., 12, корп. 2</p></div>
   <nav aria-label="В подвале"><a href="${pre}">Калькулятор</a><a href="${pre}catalog/">Каталог изделий</a><a href="${pre}services/">Услуги</a><a href="${pre}artwork/">Требования к макету</a><a href="${pre}order/">Как заказать</a><a href="${pre}contacts/">Контакты</a><a href="${pre}sitemap/">Все разделы</a><a href="${pre}#game">Совмести краски</a></nav></div>
   <div class="wrap foot-end"><span>Типография «Фасткопи»</span><span>Сайт создан Spoki Studio</span></div></footer>`;
}
export function crumb(pre,items=[]) {
  return `<nav class="crumb" aria-label="Путь по сайту"><a href="${pre}">Главная</a>${items.map(([txt,id])=>`<span aria-hidden="true">/</span>${id?`<a href="${pathTo(pre,id)}">${esc(txt)}</a>`:`<span aria-current="page">${esc(txt)}</span>`}`).join('')}</nav>`;
}
export function proof(pre){
  return `<figure class="proof"><div class="proof-stage" data-motion aria-label="Графический образец двухкрасочной печати">
    <div class="stage-grid"></div><i class="reg tl"></i><i class="reg tr"></i><i class="reg bl"></i><i class="reg br"></i>
    <div class="paper-stack"><div class="under-sheet"></div><div class="sample-sheet"><img src="${pre}assets/proof.svg" width="390" height="340" alt="Синий речной окунь на фоне солнца, составленный из штрихов и точек двух красок"></div></div>
    <img class="real-proof" hidden src="${pre}assets/media/riso-palette.webp" width="1440" height="1223" alt="Пробный оттиск восьми красок ризографа Фасткопи на белой бумаге">
   </div><figcaption><span class="swatches" aria-hidden="true"><i></i><i></i></span><span id="proof-caption" aria-live="polite">Графическая проба</span><button type="button" id="proof-switch" aria-pressed="false">Оттиск типографии ${icon('reset')}</button></figcaption></figure>`;
}
export function dialog(){
  return `<dialog id="draft" aria-labelledby="draft-title"><div class="dialog-head"><span class="kicker">${icon('mail')} Спецификация</span><button class="icon-button" type="button" data-close aria-label="Закрыть черновик">${icon('close')}</button></div>
   <h2 id="draft-title">Черновик письма</h2><p>Получатель — <strong>info@fastcopy.ru</strong>. Добавьте макет и контакты в своём почтовом приложении.</p>
   <label for="draft-text">Текст для менеджера</label><textarea id="draft-text" rows="9" readonly></textarea>
   <div class="draft-actions"><a id="mail-draft" class="btn primary">Открыть в почте ${arrow()}</a><button type="button" class="btn light" data-copy>${icon('copy')} Скопировать</button></div><p class="copy-status" role="status"></p></dialog>`;
}
export function document({pre,title,description,active,kind='inner',body}){
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f7f2">
<title>${esc(title)} — Фасткопи</title><meta name="description" content="${esc(description)}"><link rel="icon" type="image/svg+xml" href="${pre}assets/mark.svg"><link rel="stylesheet" href="${pre}assets/site.css">
${kind==='home'?`<script defer src="${pre}assets/rates.js"></script>`:''}<script defer src="${pre}assets/site.js"></script></head>
<body data-page="${kind}" data-base="${pre}">${header(pre,active)}<main id="main">${body}</main>${footer(pre)}${dialog()}</body></html>`;
}
