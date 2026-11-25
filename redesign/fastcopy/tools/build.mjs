import './artwork.mjs';
import '../assets/rates.js';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {icon,arrow,esc,document,crumb,pathTo} from './components.mjs';
import {home} from './home.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8').replace(/^\uFEFF/,''));
const data=read('assets/directory.json'), media=read('assets/media/sources.json');
const entries=data.entries, bySlug=new Map(entries.map(e=>[e.slug,e])), mediaByName=new Map(media.photos.map(p=>[p.file,p]));
const groups={technology:'Способы печати',product:'Каталог изделий',service:'Услуги',guide:'Заказ и подготовка'};
const titles={index:'Калькулятор ризографии',catalog:'Каталог изделий',services:'Услуги',sitemap:'Все разделы',contacts:'Контакты',request:'Запросить расчёт'};
const getTitle=slug=>bySlug.get(slug)?.title||titles[slug]||slug;
const allTech=entries.filter(e=>e.group==='technology');
const pickPhoto=(slug,fallback='riso-palette.webp')=>{
  const aliases={'three-in-one':'calendars','copied-booklets':'stapling','offset-card-gloss':'business-cards','offset-card-coated':'business-cards','plotter':'cut-stickers','thanks-stickers':'stickers'};
  let photo=media.photos.find(p=>p.subjects.includes(slug))||media.photos.find(p=>p.subjects.includes(aliases[slug]));
  if(!photo && slug.startsWith('offset-brochure')) photo=mediaByName.get('stapled-brochures.webp');
  if(!photo && /flyer/.test(slug))photo=mediaByName.get('offset-leaflets.webp');
  if(!photo && /calendar/.test(slug))photo=mediaByName.get('pocket-calendars.webp');
  if(!photo && ['copying','file-print','order','delivery','offers'].includes(slug))photo=mediaByName.get('office.webp');
  return photo||mediaByName.get(fallback);
};
function photoTag(pre,p,loading='lazy'){
  return `<img src="${pre}assets/media/${esc(p.file)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="${loading}" decoding="async">`;
}
function figure(pre,p){
  return `<figure class="doc-photo" style="--image-width:${p.width}px">${photoTag(pre,p,'eager')}<figcaption>${esc(p.alt)}</figcaption></figure>`;
}
function action(pre,e){
  if(e.calculator||e.slug==='risography'){
    const query=new URLSearchParams({format:e.calculator?.format||'A5',item:e.slug==='notices'?'Объявления':'Листовки'});
    if(e.calculator?.paper)query.set('paper',e.calculator.paper);
    return {href:pre+'?'+esc(query.toString())+'#print-form',name:'Рассчитать тираж'};
  }
  return {href:pre+'request/?product='+encodeURIComponent(e.slug),name:'Запросить расчёт'};
}
const btn=(href,title,cls='primary')=>`<a class="btn ${cls}" href="${href}">${esc(title)} ${arrow()}</a>`;
function productCard(pre,e,photo){
  const a=action(pre,e);
  return `<article class="product-card" data-search="${esc(e.title+' '+(e.aliases||[]).map(a=>a.label).join(' '))}"><a class="product-image" href="${pathTo(pre,e.slug)}" tabindex="-1" aria-hidden="true">${photoTag(pre,photo||pickPhoto(e.slug))}</a>
   <a class="product-name" href="${pathTo(pre,e.slug)}">${esc(e.title)}</a><p>${esc(e.summary)}</p><a href="${a.href}" class="plain-link">${a.name} ${arrow()}</a></article>`;
}
function related(pre,slugs,heading='По теме'){
  const ids=[...new Set(slugs)].filter(x=>bySlug.has(x)||titles[x]);
  return `<section class="aside-card"><h2>${esc(heading)}</h2><nav class="related-list" aria-label="${esc(heading)}">${ids.map(id=>`<a href="${pathTo(pre,id)}">${esc(getTitle(id))} ${arrow()}</a>`).join('')}</nav></section>`;
}
function intro(pre,trail,kicker,title,summary=''){
  return `<div class="wrap inner-intro">${crumb(pre,trail)}<p class="kicker">${icon('register')} ${esc(kicker)}</p><h1>${esc(title)}</h1>${summary?`<p class="lead">${esc(summary)}</p>`:''}</div>`;
}
function output(slug,title,description,body,active,kind='inner'){
  const pre=slug==='index'?'./':'../',folder=slug==='index'?root:path.join(root,slug);
  fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'index.html'),document({pre,title,description,active,kind,body}));
}
const pre='../';
const showcase=['leaflets','brochures','round-stickers'].map(k=>productCard('./',bySlug.get(k))).join('');
output('index','Листовки на ризографе','Онлайн-расчёт тиража листовок на ризографе в московской типографии «Фасткопи». Бумага, краски, отделка и черновик письма менеджеру.',home(globalThis.FastcopyRates,showcase),'index','home');

for(const e of entries){
  const groupSlug=['technology','product'].includes(e.group)?'catalog':e.group==='service'?'services':'sitemap';
  const trail=[[groups[e.group],groupSlug],[e.title]];
  const a=action(pre,e);
  let actions=btn(a.href,a.name);
  if(e.group==='guide')actions=['order','delivery','offers','pricing'].includes(e.slug)?btn('../request/','Подготовить запрос'):btn('../#print-form','К калькулятору');
  const more= e.slug==='order' ? btn('../contacts/','Адрес и контакты','light') : '';
  const original=e.source?`<p><a class="plain-link" href="${esc(e.source)}">Подробнее у типографии ${arrow()}</a></p>`:'';
  const body=intro(pre,trail,groups[e.group],e.title,e.summary)+`<div class="wrap article-layout"><div class="article-body">
   ${e.details.map(x=>`<section><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></section>`).join('')}
   <div class="page-actions">${actions}${more}</div>${original}</div>
   <aside>${figure(pre,pickPhoto(e.slug))}${related(pre,[...(e.related||[]),groupSlug])}</aside></div>`;
  output(e.slug,e.title,e.summary,body,e.group==='service'?'services':e.slug==='order'?'order':e.group==='product'||e.group==='technology'?'catalog':'');
}
const techLinks=`<nav class="tech-links" aria-label="Технологии печати">${allTech.map(e=>`<a href="../${e.slug}/">${esc(e.title)} ${arrow()}</a>`).join('')}</nav>`;
function searchBox(label){return `<label class="filter-box">${icon('search')}<input id="filter" type="search" aria-label="${esc(label)}" placeholder="${esc(label)}"></label>`;}
for(const [slug,group,title,sub] of [['catalog','product','Каталог изделий','Выберите изделие, чтобы посмотреть образцы, рассчитать тираж или подготовить запрос менеджеру.'],['services','service','Услуги','Копирование, переплёт и финишная отделка. В каждом разделе можно уточнить параметры своей работы.']]){
  const collection=entries.filter(e=>e.group===group);
  const pictorial=new Set(slug==='catalog'?['leaflets','brochures','business-cards','cut-stickers','catalogues','magnets']:['lamination','spring-binding','binding']);
  const cardEntries=collection.filter(e=>pictorial.has(e.slug));
  const listEntries=collection.filter(e=>!pictorial.has(e.slug));
  let body=intro(pre,[[title]],'Полиграфия',title,sub)+`<div class="wrap listing">${slug==='catalog'?techLinks:''}${searchBox(slug==='catalog'?'Найти изделие':'Найти услугу')}
   <div class="listing-grid">${cardEntries.map(e=>productCard(pre,e)).join('')}</div><div class="listing-list">${listEntries.map(e=>{
     const a=action(pre,e);
     return `<article class="list-item" data-search="${esc(e.title+' '+(e.aliases||[]).map(x=>x.label).join(' '))}"><div><h3><a href="../${e.slug}/">${esc(e.title)}</a></h3><p>${esc(e.summary)}</p></div><a href="${a.href}" class="plain-link">${a.name} ${arrow()}</a></article>`;
   }).join('')}</div><p id="filter-empty" hidden>Совпадений нет. Попробуйте другое название.</p></div>`;
  output(slug,title,sub,body,slug);
}
const contact=data.contacts;
const contactBody=intro(pre,[['Контакты']],'Типография в Москве','Контакты','Заявки и макеты принимает менеджер по электронной почте. Готовый тираж можно забрать на Тайнинской улице.')+`<div class="wrap contact-layout"><div>
 <dl class="contact-list"><div><dt>Адрес</dt><dd>${esc(contact.address)}</dd></div><div><dt>Почта</dt><dd><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></dd></div><div><dt>Телефоны</dt><dd>${contact.phones.map(x=>`<a href="tel:${x.replace(/[^\d+]/g,'')}">${esc(x)}</a>`).join('')}</dd></div><div><dt>Часы работы</dt><dd>${contact.hours.map(esc).join('<br>')}</dd></div></dl>
 <div class="page-actions">${btn('../request/','Подготовить запрос')}${btn('../delivery/','Доставка и оплата','light')}</div>
 ${related(pre,['order','catalog','index'])}</div><aside><iframe class="map-frame" title="Фасткопи на Яндекс Картах, Тайнинская улица, 12, корпус 2" src="${esc(contact.mapEmbed)}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
 <a class="map-link" href="${esc(contact.routeUrl)}">${icon('pin')} Построить маршрут ${arrow()}</a><a class="plain-link" href="${esc(contact.mapUrl)}">Карточка на Яндекс Картах ${arrow()}</a>${figure(pre,pickPhoto('contacts'))}</aside></div>`;
output('contacts','Контакты',contact.address+' · '+contact.email,contactBody,'contacts');

const optEntries=entries.filter(e=>e.group!=='guide');
const requestBody=intro(pre,[['Каталог','catalog'],['Запросить расчёт']],'Письмо менеджеру','Запросить расчёт','Заполните то, что уже известно о заказе. Сайт подготовит черновик для info@fastcopy.ru. Вы сможете проверить его и приложить макет в своей почте.')+`<div class="wrap article-layout"><form class="request-form"><div class="field"><label for="request-type">Изделие или услуга</label><select id="request-type" name="product"><option value="">Индивидуальный заказ</option>${optEntries.map(e=>`<option value="${e.slug}">${esc(e.title)}</option>`).join('')}</select></div>
 <div class="field-pair"><div class="field"><label for="rq-qty">Тираж, шт.</label><input id="rq-qty" name="quantity" inputmode="numeric" pattern="[0-9 ]*[1-9][0-9 ]*" title="Введите целое положительное число" placeholder="Например, 1000"></div><div class="field"><label for="rq-format">Формат</label><input id="rq-format" name="format" placeholder="Например, А4 или размеры в мм"></div></div>
 ${[['paper','Бумага или материал','Плотность, цвет, фактура'],['sides','Печать и стороны','Краски на лице и обороте'],['finish','Обработка','Резка, сгиб, переплёт или другое']].map(([name,title,ph])=>`<div class="field"><label for="rq-${name}">${title}</label><input id="rq-${name}" name="${name}" placeholder="${ph}"></div>`).join('')}
 <div class="field"><label for="rq-details">Пожелания</label><textarea id="rq-details" name="details" rows="3" placeholder="Например, срок изготовления"></textarea></div><button type="submit" class="btn primary">Подготовить письмо ${arrow()}</button>
 </form><aside>${figure(pre,mediaByName.get('riso-blue.webp'))}${related(pre,['artwork','order','contacts','catalog'])}</aside></div>`;
output('request','Запросить расчёт','Подготовьте запрос стоимости конкретного изделия менеджеру типографии.',requestBody,'','request');

const grouped=new Map();
for(const item of data.menu){
  if(!grouped.has(item.section))grouped.set(item.section,new Map());
  grouped.get(item.section).set(item.label+'|'+item.target,item);
}
const mapHead=intro(pre,[['Все разделы']],'Навигация','Все разделы','Технологии печати, изделия, отделка и инструкции типографии.');
const sitemap=`<div class="wrap listing sitemap"><section><h2>По задаче</h2><ul>${['index','catalog','services','artwork','order','delivery','contacts','request'].map(id=>`<li><a href="${pathTo(pre,id)}">${getTitle(id)}</a></li>`).join('')}</ul></section>${[...grouped].map(([name,items])=>`<section><h2>${esc(name)}</h2><ul>${[...items.values()].map(i=>`<li><a href="${pathTo(pre,i.target)}">${esc(i.label)}</a></li>`).join('')}</ul></section>`).join('')}<section><h2>Материалы типографии</h2><ul>${entries.filter(e=>!data.menu.some(m=>m.target===e.slug)).map(e=>`<li><a href="../${e.slug}/">${esc(e.title)}</a></li>`).join('')}</ul></section></div>`;
output('sitemap','Все разделы','Путеводитель по сайту московской типографии «Фасткопи».',mapHead+sitemap+`<div class="wrap sitemap-photo">${figure(pre,mediaByName.get('riso-booklets.webp'))}</div>`,'');
console.log('Built '+(entries.length+6)+' static pages.');
