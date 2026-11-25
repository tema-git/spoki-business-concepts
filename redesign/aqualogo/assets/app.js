'use strict';
const root = document.body.dataset.root;
const searchParams = new URLSearchParams(location.search);
const envNames = {fresh: 'Пресная вода', marine: 'Морская вода'};
const phone = '+7 499 745-00-55';
const svgArrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const dateFmt = new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Moscow'});
const timeFmt = new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'});
const localDate = value => dateFmt.format(new Date(value)).replace(/\s?г\.$/,'');
const moment = value => localDate(value)+', '+timeFmt.format(new Date(value))+' МСК';
const href = (url,label,cls='',arrow=false) => '<a class="'+safe(cls)+'" href="'+safe(url)+'">'+safe(label)+(arrow?svgArrow:'')+'</a>';
const questionUrl = (kind,size='') => root+'contacts.html?'+new URLSearchParams({kind,size})+'#question';
function offerUrl(r) {
  if(r.priceOnly)return questionUrl(r.name,r.size);
  if(!r.slug)return root+'entry.html?id='+encodeURIComponent(r.id);
  const sizeAnchor=r.slug==='ocellaris'||r.slug==='hepatus'?'#'+encodeURIComponent(r.id):'';
  return root+'species/'+encodeURIComponent(r.slug)+'.html'+sizeAnchor;
}
const plural = (n,one,few,many) => n%10===1 && n%100!==11 ? one : (n%10>=2 && n%10<=4 && (n%100<12||n%100>14) ? few : many);

function stockLabel(stock,updated,now=Date.now()) {
  const time = Date.parse(updated);
  return Number(stock)>0 && time<=now && now<time+3*60*60*1000 ? 'Есть сейчас' : 'Уточнить наличие';
}
function refreshStock() {
  document.querySelectorAll('[data-stock][data-updated]').forEach(node => {
    const label=stockLabel(node.dataset.stock,node.dataset.updated);
    node.textContent=label;
    node.classList.toggle('current',label==='Есть сейчас');
  });
}
refreshStock();
setInterval(refreshStock,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshStock()});

const drawer=document.getElementById('drawer');
const menuButtons=[...document.querySelectorAll('[aria-controls="drawer"]')];
let opener;
function closeMenu(restore=false) {
  if(drawer.hidden) return;
  drawer.hidden=true;
  menuButtons.forEach(b=>b.setAttribute('aria-expanded','false'));
  if(restore && opener && opener.getClientRects().length) opener.focus();
}
menuButtons.forEach(b=>b.addEventListener('click',ev=>{
  if(!drawer.hidden){closeMenu();return}
  opener=b;drawer.hidden=false;
  menuButtons.forEach(control=>control.setAttribute('aria-expanded','true'));
  if(ev.detail===0) drawer.querySelector('a').focus();
}));
document.addEventListener('pointerdown',ev=>{if(!drawer.contains(ev.target) && !menuButtons.some(b=>b.contains(ev.target)))closeMenu()});
document.addEventListener('focusin',ev=>{if(!drawer.contains(ev.target) && !menuButtons.includes(ev.target))closeMenu()});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape' && !drawer.hidden){ev.preventDefault();closeMenu(true)}});
matchMedia('(max-width:820px)').addEventListener('change',()=>closeMenu());

const motionOff=matchMedia('(prefers-reduced-motion:reduce)');
const fine=matchMedia('(hover:hover) and (pointer:fine)');
const scenes=[...document.querySelectorAll('.motion,.card,.panel,.news-item,.store-photo,.game-board')];
const target=document.querySelector('.head-contact');
function boundsToVars(el,ev,magnet=false) {
  if(!fine.matches||motionOff.matches) return;
  const b=el.getBoundingClientRect();
  const x=Math.max(-1,Math.min(1,(ev.clientX-b.left)/b.width*2-1));
  const y=Math.max(-1,Math.min(1,(ev.clientY-b.top)/b.height*2-1));
  if(magnet){el.style.setProperty('--mx',(x*3).toFixed(1)+'px');el.style.setProperty('--my',(y*2.5).toFixed(1)+'px')}
  else {el.style.setProperty('--x',x.toFixed(2));el.style.setProperty('--y',y.toFixed(2));el.style.setProperty('--spot',(50+x*38).toFixed(1)+'%')}
}
function pointerScene(el,magnet=false) {
  let pending=0;
  el.addEventListener('pointermove',ev=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>boundsToVars(el,ev,magnet))},{passive:true});
  el.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);for(const key of ['--mx','--my','--x','--y','--spot'])el.style.removeProperty(key)});
}
scenes.forEach(el=>pointerScene(el));pointerScene(target,true);
const inView=new Set();let scrolling=0;
function scrollPaint(){
  scrolling=0;
  if(motionOff.matches) return;
  for(const el of inView){
    const b=el.getBoundingClientRect();
    const t=Math.max(0,Math.min(1,(innerHeight-b.top)/(innerHeight+b.height)));
    el.style.setProperty('--travel',((t-.5)*13).toFixed(1)+'px');
  }
}
if('IntersectionObserver' in window) {
  const observe=new IntersectionObserver(entries=>{for(const v of entries){if(v.isIntersecting)inView.add(v.target);else inView.delete(v.target)} scrollPaint()});
  scenes.forEach(el=>observe.observe(el));
  addEventListener('scroll',()=>{if(!scrolling)scrolling=requestAnimationFrame(scrollPaint)},{passive:true});
}

let retailTask;
function retail() {
  if(!retailTask) retailTask=fetch(root+'data/retail.json').then(r=>{if(!r.ok) throw Error(r.status);return r.json()}).catch(err=>{retailTask=null;throw err});
  return retailTask;
}
function tokens(value){
  return value.toLowerCase().replace(/ё/g,'е').replace(/[^а-яa-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
}
function stem(s) {
  return /^[а-я]{5,}$/.test(s) ? s.replace(/(ого|его|ами|ями|ыми|ими|ий|ый|ой|ая|яя|ое|ее|ые|ие|ых|их|ого|ую|юю|ом|ем|а|я|у|ю|ы|и)$/,'') : s;
}
function matches(r,query) {
  const wanted=tokens(query).map(stem);
  if(!wanted.length) return !query.trim();
  const hay=tokens(r.name+' '+r.latin+' '+r.code);
  return wanted.every(part=>hay.some(word=>word.includes(part)));
}
function searchURL(q,env='all') {
  const params=new URLSearchParams();
  if(q) params.set('q',q);
  if(env!=='all')params.set('env',env);
  return root+'search.html'+(params.size?'?'+params:'');
}
function normalizeEnv(value){return value==='fresh'||value==='marine'?value:'all'}
const listing=document.getElementById('retail-results');
document.querySelectorAll('.finder').forEach(form=>{
  const field=form.elements.q;
  const list=form.querySelector('.suggestions');
  if(listing)return;
  let token=0;
  const close=()=>{token++;list.hidden=true;list.replaceChildren()};
  async function suggest() {
    const value=field.value.trim(),seq=++token;
    if(value.length<2){close();return}
    try{
      const data=await retail();
      if(seq!==token||field.value.trim()!==value||document.activeElement!==field)return;
      const found=data.rows.filter(r=>matches(r,value));
      const seen=new Set();
      const first=found.filter(r=>{const id=r.slug||r.code;if(seen.has(id))return false;seen.add(id);return true}).slice(0,4);
      list.innerHTML=first.map(r=>'<a href="'+safe(offerUrl(r))+'"><span>'+safe(r.name)+'</span><small>'+safe(r.latin)+'</small></a>').join('')+href(searchURL(value),first.length?'Все результаты':'Проверить в каталоге и спросить продавца');
      list.hidden=false;
    }catch{close()}
  }
  field.addEventListener('input',suggest);
  field.addEventListener('focus',()=>{retail().catch(()=>{});if(field.value)suggest()});
  form.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'&&!list.hidden){ev.preventDefault();close();field.focus();return}
    if(!['ArrowDown','ArrowUp'].includes(ev.key)||list.hidden)return;
    const options=[...list.querySelectorAll('a')];
    if(!options.length)return;
    ev.preventDefault();
    const pos=options.indexOf(document.activeElement);
    if(ev.key==='ArrowUp'&&pos<=0){field.focus();return}
    options[ev.key==='ArrowDown'?Math.min(pos+1,options.length-1):pos-1].focus();
  });
  form.addEventListener('focusout',()=>setTimeout(()=>{if(!form.contains(document.activeElement))close()},0));
  document.addEventListener('pointerdown',ev=>{if(!form.contains(ev.target))close()});
});

function availabilitySpan(row) {
  return '<span class="small-stock" data-stock="'+safe(row.stock)+'" data-updated="'+safe(row.updated)+'">'+stockLabel(row.stock,row.updated)+'</span>';
}
function resultRow(r) {
  const name=r.priceOnly?safe(r.name):href(offerUrl(r),r.name);
  return '<article class="price-row"><div class="row-name"><strong>'+name+'</strong><em lang="la">'+safe(r.latin)+'</em><span class="name-original">'+envNames[r.env]+' · '+href(r.source,'Строка прайса')+'</span></div><div><span class="size-label">Размер </span>'+safe(r.size)+'</div><div class="amount">'+money(r.price)+' / шт.</div><div class="row-action">'+availabilitySpan(r)+href(questionUrl(r.name,r.size),'Спросить о размере '+r.size,'text-link',true)+'</div></article>';
}
if(listing) {
  const field=document.querySelector('.finder input[name=q]');
  const form=field.form, body=document.getElementById('result-body'), count=document.getElementById('result-count');
  let filter=normalizeEnv(searchParams.get('env')),limit=24,source;
  const buttons=[...listing.querySelectorAll('[data-env]')];
  field.value=(searchParams.get('q')||'').slice(0,120);
  function syncUrl() {
    const u=new URL(location.href);
    if(field.value.trim())u.searchParams.set('q',field.value.trim());else u.searchParams.delete('q');
    if(filter==='all')u.searchParams.delete('env');else u.searchParams.set('env',filter);
    history.replaceState(null,'',u);
  }
  function update(){
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.env===filter)));
    if(!source)return;
    const q=field.value.trim();
    const items=source.rows.filter(r=>(filter==='all'||r.env===filter)&&matches(r,q));
    const stamp=source.sources[filter==='marine'?'marine':'fresh'].updated;
    count.textContent=items.length+' '+plural(items.length,'позиция','позиции','позиций')+' · прайс на '+moment(stamp);
    if(!items.length){
      const reset=filter!=='all'?'Снять фильтр среды':'Сбросить поиск';
      body.innerHTML='<div class="empty"><h2>Ничего не найдено</h2><p>Попробуйте другое название или уточните вид у продавца «Университета».</p><div class="actions"><button type="button" class="btn quiet" data-reset>'+reset+'</button>'+href(questionUrl(q),'Спросить продавца','btn accent',true)+'</div></div>';
      return;
    }
    const more=items.length>limit?'<button type="button" class="btn quiet load-more" data-more>Показать ещё '+Math.min(24,items.length-limit)+'</button>':'';
    body.innerHTML='<div class="table-list"><div class="table-head" aria-hidden="true"><span>Вид</span><span>Размер</span><span>Цена</span><span>Университет</span></div>'+items.slice(0,limit).map(resultRow).join('')+'</div>'+more;
    refreshStock();
  }
  function rerun(){limit=24;syncUrl();update()}
  form.addEventListener('submit',ev=>{ev.preventDefault();rerun()});
  field.addEventListener('input',rerun);
  buttons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.env;rerun()}));
  body.addEventListener('click',ev=>{
    if(ev.target.closest('[data-reset]')){
      if(filter!=='all')filter='all';else field.value='';
      rerun();field.focus();
    }else if(ev.target.closest('[data-more]')){
      const first=limit;limit+=24;update();body.querySelectorAll('.row-name a')[first*2]?.focus({preventScroll:true});
    }
  });
  count.textContent='Загружаем розничный прайс…';
  retail().then(data=>{source=data;update()}).catch(()=>{count.textContent='Не удалось загрузить прайс.';body.innerHTML=href('https://www.aqualogo.ru/super_price','Открыть прайсы магазина','btn quiet',true)});
}

const entry=document.getElementById('entry');
if(entry){
  Promise.all([retail(),fetch(root+'data/image-sources.json').then(r=>r.ok?r.json():{}).catch(()=>({}))]).then(([data,pictures])=>{
    const row=data.rows.find(r=>r.id===searchParams.get('id'));
    if(!row){entry.innerHTML='<h1 class="page-title">Позиция не найдена</h1>'+href(root+'price.html','Вернуться в прайс','text-link',true);return}
    document.title=row.name+' · Аква Лого — Университет';
    const dest=questionUrl(row.name,row.size);
    const picture=pictures[row.pid]||pictures[row.code];
    const media=picture?'<figure><div class="specimen"><img id="entry-photo" src="'+safe(picture.image)+'" alt="'+safe(row.name)+'"></div><figcaption class="photo-note">Фото — '+href(picture.source,picture.credit||'Аква Лого / Aqua-Shop')+(picture.licenseUrl?' · '+href(picture.licenseUrl,picture.license):'')+'</figcaption></figure>':'';
    const related=(row.arrivals||[]).map(id=>data.arrivals.find(a=>a.id===id)).filter(Boolean);
    const dated=related.length?related.map(a=>href(a.source,'Сообщение форума · '+localDate(a.published))).join(' · '):'В разобранных сообщениях форума этот вид и размер не упомянуты.';
    entry.innerHTML='<div class="page-lead"><h1 class="page-title">'+safe(row.name)+'</h1><p class="latin" lang="la">'+safe(row.latin)+'</p></div><div class="'+(picture?'content-grid':'article')+'">'+media+'<section class="panel"><div class="eyebrow">'+envNames[row.env]+' · Университет</div><div class="measure">Размер '+safe(row.size)+' <strong>'+money(row.price)+' / шт.</strong></div>'+availabilitySpan(row)+'<p class="source-line">Остаток магазина · '+(row.stock==null?'число не указано':safe(row.stock)+' шт.')+' на '+moment(row.updated)+'. '+href(row.source,'Розничный прайс')+'</p><p class="source-line">'+dated+'</p><div class="actions">'+href(dest,'Уточнить наличие','btn accent',true)+href('tel:+74997450055',phone)+'</div></section></div><div class="band actions">'+href(root+'price.html','Вернуться в прайс','text-link',true)+href(root+row.env+'.html','К разделу атласа','text-link',true)+'</div>';
    const photo=document.getElementById('entry-photo');
    photo?.addEventListener('error',()=>{photo.parentElement.outerHTML='<div class="empty">'+href(picture.source,'Посмотреть фото вида в каталоге магазина','text-link',true)+'</div>'},{once:true});
    refreshStock();
  }).catch(()=>{entry.innerHTML='<h1 class="page-title">Карточка рыбы</h1>'+href('https://www.aqualogo.ru/super_price','Открыть официальный прайс','text-link',true)});
}

const questionForm=document.getElementById('question-form');
if(questionForm) {
  const kind=questionForm.elements.kind,size=questionForm.elements.size,output=document.getElementById('prepared');
  kind.value=(searchParams.get('kind')||'').slice(0,150);
  size.value=(searchParams.get('size')||'').slice(0,50);
  questionForm.addEventListener('input',()=>{kind.setCustomValidity('');output.hidden=true});
  questionForm.addEventListener('submit',ev=>{
    ev.preventDefault();
    if(!kind.value.trim()){kind.setCustomValidity('Введите название вида.');kind.reportValidity();return}
    const details=kind.value.trim()+(size.value.trim()?', размер '+size.value.trim():'');
    const msg='Здравствуйте! Подскажите, пожалуйста, есть ли сейчас в супермаркете «Университет» '+details+'? Какая цена за экземпляр?';
    document.getElementById('question-text').textContent=msg;
    document.getElementById('mail-link').href='mailto:supermarket@aqualogo.ru?subject='+encodeURIComponent('Наличие в «Университете» — '+details)+'&body='+encodeURIComponent(msg);
    output.hidden=false;output.setAttribute('tabindex','-1');output.focus({preventScroll:true});
  });
}

const game=document.getElementById('game');
if(game){
  const deck=JSON.parse(document.getElementById('game-data').textContent);
  let rounds=[...deck],index=0,points=0,stage='choose';
  function pickView(focus=false) {
    stage='choose';const s=rounds[index];
    game.innerHTML='<div class="game-board"><div class="game-field"><img src="'+root+'assets/shape-'+s.id+'.svg" alt="Силуэт загаданных очертаний рыбы"></div><section><p class="round-info">Вид '+(index+1)+' из '+rounds.length+'</p><h2 tabindex="-1">Кто на силуэте?</h2><div class="answers">'+s.choices.map(c=>'<button type="button" class="answer" data-choice="'+c.id+'">'+safe(c.name)+svgArrow+'</button>').join('')+'</div></section></div>';
    pointerScene(game.querySelector('.game-field'));if(focus)game.querySelector('h2').focus({preventScroll:true});
  }
  function reveal(choice) {
    const s=rounds[index],correct=choice===s.id;
    stage='reveal';if(correct)points++;
    let credit=href(s.photoSource,s.credit);
    if(s.licenseUrl)credit+=' · '+href(s.licenseUrl,s.license)+' · полный кадр, WebP';
    game.innerHTML='<div class="game-board"><figure><div class="result-photo"><img src="'+root+'assets/media/'+safe(s.photo)+'" alt="'+safe(s.alt)+'"></div><figcaption class="photo-note">Фото — '+credit+'</figcaption></figure><section><p class="feedback">'+(correct?'Верно!':'Правильный ответ')+'</p><h2 tabindex="-1">'+safe(s.name)+'</h2><p class="latin" lang="la">'+safe(s.latin)+'</p><p>'+safe(s.trait)+'</p><div class="actions"><button type="button" class="btn accent" data-next>'+(index+1===rounds.length?'К результату':'Следующий силуэт')+svgArrow+'</button>'+href(root+'species/'+s.id+'.html','Карточка вида','text-link',true)+'</div></section></div>';
    game.querySelector('h2').focus({preventScroll:true});
  }
  function complete(){
    stage='done';game.innerHTML='<div class="panel"><p class="eyebrow">Результат</p><h2 class="game-title" tabindex="-1">Угадано '+points+' из '+rounds.length+'</h2><p>Все три вида есть в фотокаталоге.</p><div class="actions"><button type="button" class="btn accent" data-replay>Играть ещё раз'+svgArrow+'</button>'+href(root+'catalog.html','В каталог','text-link',true)+'</div></div>';
    game.querySelector('h2').focus({preventScroll:true});
  }
  game.addEventListener('click',ev=>{
    const b=ev.target.closest('button');if(!b)return;
    if(stage==='choose'&&b.dataset.choice)reveal(b.dataset.choice);
    else if(stage==='reveal'&&b.hasAttribute('data-next')){index++;if(index===rounds.length)complete();else pickView(true)}
    else if(stage==='done'&&b.hasAttribute('data-replay')){rounds=[...rounds.slice(1),rounds[0]];index=0;points=0;pickView(true)}
  });
  pickView();
}
