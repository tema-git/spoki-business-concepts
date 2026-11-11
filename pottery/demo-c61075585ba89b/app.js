(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const arrow = '<svg class="ui-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
  const catalog = {
    self: [
      ['Любимая чашка', 'mug', 'Для неспешного утра', 'Свои пропорции, удобная ручка и цвет, к которому хочется возвращаться.', 'Чашка'],
      ['Небольшая ваза', 'vase', 'Для одного цветка', 'Спокойный силуэт или выразительный изгиб — найдите свой характер.', 'Ваза'],
      ['Свободная форма', 'sculpture', 'Для вашей фантазии', 'Начните с линии или ощущения. Идее не обязательно сразу иметь название.', 'Моя форма']
    ],
    home: [
      ['Утренний ритуал', 'mug', 'Для любимого уголка', 'Представьте вещь, с которой приятно начинать день.', 'Чашка'],
      ['Место для деталей', 'bowl', 'Для маленьких находок', 'Небольшая тарелочка для украшений, ключей или просто красивой композиции.', 'Тарелка'],
      ['Тихий акцент', 'sculpture', 'Для пространства', 'Фактура и форма могут изменить настроение всего уголка.', 'Моя идея']
    ],
    gift: [
      ['С личной историей', 'mug', 'Для близкого человека', 'Вспомните любимый цвет, привычку или особенный момент.', 'Подарок'],
      ['Две разные вещи', 'pair', 'С общим настроением', 'Похожая палитра и разные силуэты — как две части одной истории.', 'Парная керамика'],
      ['Что-то неожиданное', 'bowl', 'Без особого повода', 'Небольшая вещь, в которой легко узнать заботу.', 'Подарок']
    ]
  };
  const cards = $('#class-cards');
  function renderCards(key) {
    cards.replaceChildren(...catalog[key].map(([name, image, tag, description, idea]) => {
      const article = document.createElement('article'); article.className = 'class-card';
      const figure = document.createElement('div'); figure.className = 'class-image';
      const art = window.PotteryArt.create(image, name); figure.dataset.cursor = 'clay';
      const badge = document.createElement('span'); badge.className = 'class-tag'; badge.textContent = tag;
      const button = document.createElement('button'); button.className = 'class-arrow'; button.type = 'button';
      button.innerHTML = arrow; button.dataset.book = idea; button.setAttribute('aria-label', `Обсудить идею: ${name}`);
      const title = document.createElement('h3'); title.textContent = name;
      const copy = document.createElement('p'); copy.textContent = description;
      figure.append(art, badge, button); article.append(figure, title, copy); return article;
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
  $('.header-contact').addEventListener('click', () => closeMenu());
  menu.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if(!event.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', event => { if(event.key==='Escape' && menu.classList.contains('open')) closeMenu(true); });
  matchMedia('(min-width: 1061px)').addEventListener('change', () => closeMenu());
  const dialog = $('#booking-dialog'), form = $('#booking-form'), success = $('#demo-message');
  const personal = {name: $('#visitor-name'), phone: $('#visitor-phone')};
  for(const key of ['name','phone']) personal[key].addEventListener('input',()=>{
    personal[key].removeAttribute('aria-invalid');$(`#${key}-error`).textContent='';
  });
  const ideas = [...form.querySelectorAll('[name="idea"]')];
  let opener = null;
  function selectIdea(idea='Моя идея') {
    const selected = ideas.find(input => input.value === idea) || ideas[0];
    selected.checked = true;
  }
  function focusIdea() { ideas.find(input => input.checked).focus({preventScroll:true}); }
  function resetForm() {
    form.reset();selectIdea();
    for(const name of ['name','phone']) {personal[name].removeAttribute('aria-invalid');$(`#${name}-error`).textContent='';}
    form.hidden=false;success.hidden=true;
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-book]');if(!button)return;
    if(dialog.open)return;
    opener=button;closeMenu();resetForm();selectIdea(button.dataset.book);
    dialog.showModal();focusIdea();
  });
  function closeDialog(){dialog.close();}
  $('.dialog-close').addEventListener('click',closeDialog);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();
  });
  dialog.addEventListener('close',()=>{resetForm();opener?.focus({preventScroll:true});});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const name=personal.name.value.trim(),phone=personal.phone.value,digits=phone.replace(/\D/g,'');
    const validPhone=/^[ ]*\+?[0-9 ()-]*$/.test(phone)&&digits.length>=10&&digits.length<=15;
    const errors={name:name.length<2?'Укажите имя — хотя бы два символа.':'',phone:!validPhone?'Укажите телефон: 10–15 цифр. Допустимы пробелы, скобки, дефисы и один «+» в начале.':''};
    let first=null;
    for(const key of ['name','phone']){const input=personal[key];$(`#${key}-error`).textContent=errors[key];input.setAttribute('aria-invalid',String(!!errors[key]));if(errors[key]&&!first)first=input;}
    if(first){first.focus();return;}
    form.reset();selectIdea();form.hidden=true;success.hidden=false;success.focus({preventScroll:true});
  });
  form.querySelector('[type=submit]').disabled=false;
  $('#form-again').addEventListener('click',()=>{resetForm();focusIdea();});
})();
