(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const arrow = '<svg class="ui-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
  const catalog = {
    self: [
      ['Любимая чашка', 'painted-mug.webp', 'Для неспешного утра', 'Свои пропорции, удобная ручка и цвет, к которому хочется возвращаться.', 'Чашка'],
      ['Небольшая ваза', 'vase-study.svg', 'Для одного цветка', 'Спокойный силуэт или выразительный изгиб — найдите свой характер.', 'Ваза'],
      ['Свободная форма', 'thematic-clay.webp', 'Для вашей фантазии', 'Начните с линии или ощущения. Идее не обязательно сразу иметь название.', 'Моя форма']
    ],
    home: [
      ['Утренний ритуал', 'wheel-hands.webp', 'Для любимого уголка', 'Представьте вещь, с которой приятно начинать день.', 'Чашка'],
      ['Место для деталей', 'heart-bowl.webp', 'Для маленьких находок', 'Небольшая тарелочка для украшений, ключей или просто красивой композиции.', 'Тарелка'],
      ['Тихий акцент', 'thematic-clay.webp', 'Для пространства', 'Фактура и форма могут изменить настроение всего уголка.', 'Моя идея']
    ],
    gift: [
      ['С личной историей', 'painted-mug.webp', 'Для близкого человека', 'Вспомните любимый цвет, привычку или особенный момент.', 'Подарок'],
      ['Две разные вещи', 'date-mugs.webp', 'С общим настроением', 'Похожая палитра и разные силуэты — как две части одной истории.', 'Парная керамика'],
      ['Что-то неожиданное', 'heart-bowl.webp', 'Без особого повода', 'Небольшая вещь, в которой легко узнать заботу.', 'Подарок']
    ]
  };
  const cards = $('#class-cards');
  function renderCards(key) {
    cards.replaceChildren(...catalog[key].map(([name, image, tag, description, idea]) => {
      const article = document.createElement('article'); article.className = 'class-card';
      const figure = document.createElement('div'); figure.className = 'class-image';
      const img = new Image(); img.src = `assets/${image}`; img.alt = name; img.loading = 'lazy';
      const badge = document.createElement('span'); badge.className = 'class-tag'; badge.textContent = tag;
      const button = document.createElement('button'); button.className = 'class-arrow'; button.type = 'button';
      button.innerHTML = arrow; button.dataset.book = idea; button.setAttribute('aria-label', `Обсудить идею: ${name}`);
      const title = document.createElement('h3'); title.textContent = name;
      const copy = document.createElement('p'); copy.textContent = description;
      figure.append(img, badge, button); article.append(figure, title, copy); return article;
    }));
  }
  renderCards('self');
  const tabs = [...document.querySelectorAll('[data-audience]')];
  tabs.forEach((button,index) => {
    button.addEventListener('click', () => {
      for (const tab of tabs) { tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; }
      cards.setAttribute('aria-labelledby', button.id); renderCards(button.dataset.audience);
    });
    button.addEventListener('keydown', event => {
      let next;
      if(event.key === 'ArrowRight') next = (index+1)%tabs.length;
      if(event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
      if(event.key === 'Home') next = 0;
      if(event.key === 'End') next = tabs.length-1;
      if(next !== undefined) { event.preventDefault(); tabs[next].focus(); tabs[next].click(); }
    });
  });
  const menuButton = $('.menu-button'), menu = $('.main-menu');
  function closeMenu(focus=false) { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); if(focus) menuButton.focus(); }
  menuButton.addEventListener('click', () => { const open=menu.classList.toggle('open'); menuButton.setAttribute('aria-expanded',String(open)); });
  menu.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if(!event.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', event => { if(event.key==='Escape' && menu.classList.contains('open')) closeMenu(true); });
  matchMedia('(min-width: 1061px)').addEventListener('change', () => closeMenu());
  const story = [
    ['wheel-hands.webp','Работа с глиной на гончарном круге','Сначала прикосновение.','Податливая глина, движение рук и первые очертания.'],
    ['thematic-clay.webp','Формы и фактура керамики','Потом — ваша форма.','Пропорции, поверхность и детали постепенно складываются вместе.'],
    ['painted-mug.webp','Керамическая чашка','И свой характер.','Оттенок и неровности делают каждую вещь особенной.']
  ];
  const storyButtons = [...document.querySelectorAll('[data-hero-story]')];
  for(const button of storyButtons) button.addEventListener('click', () => {
    const index = Number(button.dataset.heroStory), [file,alt,title,description] = story[index];
    const image = $('#hero-story-image'); image.src = `assets/${file}`; image.alt = alt;
    $('#hero-story-title').textContent = title; $('#hero-story-description').textContent = description;
    $('#hero-story-count').textContent = `0${index+1} / 03`;
    for(const other of storyButtons) other.setAttribute('aria-pressed',String(other===button));
  });
  const dialog = $('#booking-dialog'), form = $('#booking-form'), success = $('#demo-message');
  const trigger = $('#idea-trigger'), list = $('#idea-options'), value = $('#idea-value');
  const options = ['Моя идея','Чашка','Ваза','Тарелка','Моя форма','Подарок','Парная керамика'];
  let opener = null, active = 0, selected = 0;
  list.replaceChildren(...options.map((text,index) => {
    const option=document.createElement('div'); option.id=`idea-option-${index}`; option.role='option';
    option.dataset.index=String(index); option.textContent=text; option.setAttribute('aria-selected',String(index===0));
    return option;
  }));
  function select(index) {
    selected=index; active=index; value.textContent=options[index]; form.elements.idea.value=options[index];
    for(let i=0;i<list.children.length;i++) list.children[i].setAttribute('aria-selected',String(i===index));
  }
  function highlight(index) {
    active=Math.max(0,Math.min(options.length-1,index));
    list.setAttribute('aria-activedescendant',`idea-option-${active}`);
    for(let i=0;i<list.children.length;i++) list.children[i].classList.toggle('is-active',i===active);
    list.children[active].scrollIntoView({block:'nearest'});
  }
  function closeSelect(focus=false) {
    list.hidden=true; trigger.setAttribute('aria-expanded','false');
    if(focus) trigger.focus({preventScroll:true});
  }
  function openSelect() {
    list.hidden=false; trigger.setAttribute('aria-expanded','true'); list.focus({preventScroll:true});
    highlight(selected);
  }
  trigger.addEventListener('click',()=>list.hidden?openSelect():closeSelect());
  trigger.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();openSelect();}
  });
  list.addEventListener('click',event=>{
    const option=event.target.closest('[data-index]');if(!option)return;
    select(Number(option.dataset.index));closeSelect(true);
  });
  list.addEventListener('keydown',event=>{
    if(['ArrowDown','ArrowUp','Home','End','Enter',' ','Escape'].includes(event.key))event.preventDefault();
    if(event.key==='ArrowDown')highlight(active+1);
    else if(event.key==='ArrowUp')highlight(active-1);
    else if(event.key==='Home')highlight(0);
    else if(event.key==='End')highlight(options.length-1);
    else if(event.key==='Enter'||event.key===' '){select(active);closeSelect(true);}
    else if(event.key==='Escape'){event.stopPropagation();closeSelect(true);}
    else if(event.key==='Tab'){event.preventDefault();closeSelect();(event.shiftKey?trigger:form.elements.name).focus();}
    else if(event.key.length===1){const match=options.findIndex(x=>x.toLowerCase().startsWith(event.key.toLowerCase()));if(match>=0)highlight(match);}
  });
  dialog.addEventListener('click',event=>{if(!event.target.closest('.custom-select'))closeSelect();});
  function resetForm() {
    form.reset();select(0);closeSelect();
    for(const name of ['name','phone']) {form.elements[name].removeAttribute('aria-invalid');$(`#${name}-error`).textContent='';}
    form.hidden=false;success.hidden=true;
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-book]');if(!button)return;
    opener=button;resetForm();select(Math.max(0,options.indexOf(button.dataset.book)));
    dialog.showModal();trigger.focus({preventScroll:true});
  });
  function closeDialog(){closeSelect();dialog.close();}
  $('.dialog-close').addEventListener('click',closeDialog);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();
  });
  dialog.addEventListener('close',()=>{resetForm();opener?.focus({preventScroll:true});});
  form.addEventListener('submit',event=>{
    event.preventDefault();closeSelect();
    const name=form.elements.name.value.trim(),digits=form.elements.phone.value.replace(/\D/g,'');
    const errors={name:name.length<2?'Укажите имя — хотя бы два символа.':'',phone:digits.length<10||digits.length>15?'Укажите телефон: от 10 до 15 цифр.':''};
    let first=null;
    for(const key of ['name','phone']){const input=form.elements[key];$(`#${key}-error`).textContent=errors[key];input.setAttribute('aria-invalid',String(!!errors[key]));if(errors[key]&&!first)first=input;}
    if(first){first.focus();return;}
    form.reset();select(0);form.hidden=true;success.hidden=false;success.focus({preventScroll:true});
  });
  $('#form-again').addEventListener('click',()=>{resetForm();trigger.focus();});
})();
