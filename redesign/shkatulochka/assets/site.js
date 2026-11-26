(() => {
  'use strict';
  const one = (selector, root = document) => root.querySelector(selector);
  const many = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const menu = one('#menu'), opener = one('.menu-toggle'), viewer = one('#viewer');
  const show = (dialog, trigger) => {
    dialog._returnTo = trigger;
    dialog.showModal();
    document.documentElement.classList.add('dialog-open');
    one('[data-close]', dialog).focus({preventScroll:true});
  };
  opener.addEventListener('click', () => { opener.setAttribute('aria-expanded','true'); show(menu, opener); });
  for (const dialog of [menu,viewer]) {
    one('[data-close]',dialog).addEventListener('click',() => dialog.close());
    dialog.addEventListener('click', evt => {
      if (evt.target !== dialog) return;
      const r=dialog.getBoundingClientRect();
      if (evt.clientX<r.left || evt.clientX>r.right || evt.clientY<r.top || evt.clientY>r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialog===menu) opener.setAttribute('aria-expanded','false');
      document.documentElement.classList.remove('dialog-open');
      if (dialog._returnTo?.isConnected) dialog._returnTo.focus({preventScroll:true});
    });
  }
  menu.addEventListener('click', evt => { if(evt.target.closest('a')) menu.close(); });
  for (const button of many('[data-photo]')) {
    button.addEventListener('click', () => {
      const image = one('#full-photo'), alt=one('img',button).alt;
      image.src=button.dataset.photo; image.alt=alt;
      one('#viewer-label').textContent=alt; show(viewer,button);
    });
  }
  // Only decorations move. The header link and all image targets retain their geometry.
  const contact = one('.contact-hit');
  contact.addEventListener('pointermove', ev => {
    if (!fine.matches || motion.matches || ev.pointerType==='touch') return;
    const r=contact.getBoundingClientRect();
    contact.style.setProperty('--mx', ((ev.clientX-r.left)/r.width-.5)*8+'px');
    contact.style.setProperty('--my', ((ev.clientY-r.top)/r.height-.5)*6+'px');
  });
  contact.addEventListener('pointerleave', () => {contact.style.removeProperty('--mx');contact.style.removeProperty('--my');});
  for (const block of many('.hero,.sample-art,.photo,.feature-links,.shop-grid,.detail-intro')) {
    block.addEventListener('pointermove', ev => {
      if (!fine.matches || motion.matches || ev.pointerType==='touch') return;
      const r=block.getBoundingClientRect();
      block.style.setProperty('--px', ((ev.clientX-r.left)/r.width-.5).toFixed(3));
      block.style.setProperty('--py', ((ev.clientY-r.top)/r.height-.5).toFixed(3));
    });
    block.addEventListener('pointerleave',()=>{block.style.removeProperty('--px');block.style.removeProperty('--py');});
  }
  const hero=one('.hero');
  if(hero){
    let queued=false;
    const scrollArt=()=>{queued=false;hero.style.setProperty('--travel',motion.matches?'0px':Math.round(Math.min(1,window.scrollY/Math.max(1,hero.offsetHeight))*22)+'px');};
    window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(scrollArt);}},{passive:true});
    scrollArt();
  }
  function phase(el, now = Date.now()){
    return now >= Date.parse(el.dataset.end) ? 'past' : now >= Date.parse(el.dataset.start) ? 'live' : 'future';
  }
  function updatePhase(el,now) {
    const p=phase(el,now), badge=one('[data-state]',el);
    if(badge){badge.textContent=p==='past'?'Завершено':p==='live'?'Уже идёт':'';badge.hidden=p==='future';}
    el.dataset.phase=p;
    return p;
  }
  const listing=one('[data-list]');
  const urlState=()=>new URL(location.href);
  if(listing){
    const day=one('[name=date]',listing), technique=one('[name=tech]',listing), cards=many('.lesson',listing);
    const container=one('.lessons',listing), reset=one('.reset-filters',listing), status=one('.filter-status',listing);
    const home=listing.dataset.list==='home', all=one('[data-all]',listing);
    const nextMeeting=(el,now)=>{
      const hours=el.dataset.start.slice(11,16),end=el.dataset.end.slice(11,16);
      for(const d of el.dataset.days.split(',')){
        if(Date.parse(d+'T'+end+':00+03:00')>now)return Math.max(now,Date.parse(d+'T'+hours+':00+03:00'));
      }
      return Infinity;
    };
    function apply(updateHistory){
      if(updateHistory){
        const address=urlState();
        for(const field of [day,technique]){if(field.value)address.searchParams.set(field.name,field.value);else address.searchParams.delete(field.name);}
        history.replaceState(null,'',address);
      }
      const params=new URLSearchParams();
      if(day.value)params.set('date',day.value);
      if(technique.value)params.set('tech',technique.value);
      const filter=params.toString(), now=Date.now();
      const matches=cards.filter(el=>(!day.value || el.dataset.days.split(',').includes(day.value)) && (!technique.value || el.dataset.tech.split(' ').includes(technique.value)));
      for(const el of cards)updatePhase(el,now);
      matches.sort((a,b)=>{
        const aa=nextMeeting(a,now),bb=nextMeeting(b,now);
        return aa===bb?(aa===Infinity?Date.parse(b.dataset.end)-Date.parse(a.dataset.end):Date.parse(a.dataset.start)-Date.parse(b.dataset.start)):aa-bb;
      });
      const future=matches.filter(c=>phase(c,now)!=='past');
      const eligible=(home && !filter && future.length)?future:matches;
      const visible=home&&!filter?eligible.slice(0,3):eligible;
      if(home)one('h2',listing).textContent=filter?'Занятия по выбору':future.length?'Ближайшие занятия':'Архив занятий';
      for(const el of cards){el.hidden=!visible.includes(el);}
      for(const el of visible){
        container.appendChild(el);
        for(const a of many('[data-course]',el)){const h=new URL(a.href);h.search=filter;a.href=h;}
      }
      reset.hidden=!filter;one('[data-empty]',listing).hidden=!!visible.length;
      status.textContent=filter?'Найдено занятий: '+matches.length:'';
      if(all)all.href='schedule.html'+(filter?'?'+filter:'')+'#schedule';
    }
    const fromURL=()=>{
      const q=urlState().searchParams;
      for(const el of [day,technique]){const v=q.get(el.name)||'';el.value=[...el.options].some(o=>o.value===v)?v:'';}
      apply(false);
    };
    for(const el of [day,technique])el.addEventListener('change',()=>apply(true));
    for(const btn of [reset,one('[data-clear]',listing)])btn.addEventListener('click',()=>{day.value='';technique.value='';apply(true);day.focus();});
    window.addEventListener('popstate',fromURL); window.addEventListener('pageshow',fromURL);
    setInterval(()=>{if(!document.hidden)apply(false);},60000);
    fromURL();
  }
  const detail=one('[data-detail]'), booking=one('[data-booking]');
  if(detail&&booking){
    const back=one('[data-return]'),filter=new URLSearchParams();
    for(const key of ['date','tech']){const value=urlState().searchParams.get(key);if(value)filter.set(key,value);}
    const returnUrl='schedule.html'+(filter.size?'?'+filter:'')+'#schedule';back.href=returnUrl;
    const crumb=one('.crumb a[href="schedule.html"]');if(crumb)crumb.href=returnUrl;
    const setStatus=()=>{
      const p=updatePhase(detail,Date.now());
      one('[data-book-title]').textContent=p==='future'?'Запись на занятие':'Узнать о следующей группе';
      one('[data-book-cta]').firstChild.textContent=p==='future'?'Связаться для записи':'Узнать о следующей группе';
      one('[data-book-status]').textContent=p==='future'?'':p==='live'?'Эта программа уже началась. Можно уточнить следующую дату.':'Эта программа завершилась. Можно спросить мастера о новой группе.';
    };
    setStatus();setInterval(setStatus,60000);
    const form=one('form',booking),result=one('.draft-result',booking),area=one('textarea',booking);
    const draftMessage=()=>{
      const meta=booking.dataset, future=phase(booking)==='future';
      return 'Здравствуйте! '+(future?'Хочу уточнить запись на занятие':'Подскажите, когда будет следующая группа на занятие')+' «'+meta.title+'» ('+meta.master+'). '+(future?'Даты: ':'В расписании были указаны ')+meta.when+', '+meta.hours+' по Москве. Стоимость в анонсе: '+meta.price+'. Участников: '+form.elements.people.value+'.';
    };
    form.addEventListener('input',()=>{result.hidden=true;one('[data-copied]').textContent='';});
    form.addEventListener('submit', ev=>{
      ev.preventDefault(); if(!form.reportValidity())return;
      const msg=draftMessage(),chan=booking.dataset.channel;
      area.value=msg;
      one('[data-handoff]',result).href=chan.startsWith('mailto:')?chan+'?subject='+encodeURIComponent('Занятие «'+booking.dataset.title+'»')+'&body='+encodeURIComponent(msg):chan.startsWith('https://wa.me/')?chan+'?text='+encodeURIComponent(msg):chan;
      result.hidden=false;area.focus();
    });
    one('[data-copy]',result).addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(area.value);one('[data-copied]').textContent='Текст скопирован.';}
      catch{area.focus();area.select();one('[data-copied]').textContent='Текст выделен для копирования.';}
    });
  }
  const sample=one('#sample');
  if(sample){
    const palette=many('[data-color]',sample), list=one('.layers',sample), live=one('.sample-result',sample), canvas=one('#sample-canvas');
    const zoom=one('.sample-zoom',sample),restart=one('[data-restart]',sample),choices=[];
    let enlarged=false;
    const paint=()=>window.woolArt.drawSample(canvas,choices.map(x=>x.hex),enlarged);
    function swap(i,j){[choices[i],choices[j]]=[choices[j],choices[i]];render();const row=list.children[choices.length-1-j];(one('button:not(:disabled)',row)||restart).focus();}
    function render(){
      const wasPicking=document.activeElement?.matches('[data-color]');
      list.replaceChildren();
      choices.forEach((item,i)=>{
        const row=document.createElement('li'),name=document.createElement('span'),dot=document.createElement('i');
        dot.style.background=item.hex;name.append(dot,document.createTextNode(item.name));row.append(name);
        for(const [symbol,delta,title] of [['↑',1,'Поднять'],['↓',-1,'Опустить']]){
          const b=document.createElement('button');b.type='button';b.disabled=i+delta<0||i+delta>=choices.length;
          b.setAttribute('aria-label',title+' слой '+item.name);b.className='layer-move';b.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="'+(delta>0?'m6 14 6-6 6 6':'m6 10 6 6 6-6')+'"/></svg>';
          b.addEventListener('click',()=>swap(i,i+delta));row.append(b);
        }
        list.prepend(row);
      });
      const done=choices.length===3,names=choices.map(x=>x.name).join(' · ');
      for(const b of palette){b.disabled=done;b.title=done?'Три слоя собраны':b.dataset.name;}
      live.textContent=done?'Цветовое сочетание: '+names:'Выбрано '+choices.length+' из 3';
      one('[data-matching]',sample).hidden=!done;
      one('#sample-caption').textContent=names||'Натуральная основа';
      zoom.setAttribute('aria-pressed',String(enlarged));one('span',zoom).textContent=enlarged?'Целиком':'Увеличить';
      canvas.setAttribute('aria-label','Образец войлока. '+(names||'Натуральная основа')+(enlarged?'. Увеличенный фрагмент.':''));
      paint();
      if(done && wasPicking)one('.layer-move:not(:disabled)',list)?.focus();
    }
    palette.forEach(b=>b.addEventListener('click',()=>{if(choices.length<3){choices.push({hex:b.dataset.color,name:b.dataset.name});render();}}));
    zoom.addEventListener('click',()=>{enlarged=!enlarged;render();});
    restart.addEventListener('click',()=>{choices.length=0;enlarged=false;render();palette[0].focus();});
    new ResizeObserver(paint).observe(canvas);render();
  }
  const room=one('[data-room-select]');
  if(room)room.addEventListener('change',()=>{
    const option=room.selectedOptions[0],frame=one('#room-frame');
    frame.src=option.value;frame.title='Занятость — '+option.textContent;one('[data-calendar-out]').href=option.value;
  });
})();
