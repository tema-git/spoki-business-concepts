(() => {
  'use strict';
  const root = document.querySelector('.plate-editor');
  const motifs = root.querySelector('#plate-motifs');
  const status = root.querySelector('#plate-status');
  const progress = root.querySelector('#plate-progress');
  const result = root.querySelector('#plate-result');
  const undo = root.querySelector('#plate-undo');
  const reset = root.querySelector('#plate-reset');
  const finish = root.querySelector('#plate-finish');
  const addButtons = [...root.querySelectorAll('[data-motif]')];
  const pigments = [...root.querySelectorAll('[name=pigment]')];
  const colors = {clay:'#995638', olive:'#626c4b', ochre:'#a47624'};
  const positions = [[155,120,-30],[245,122,35],[285,202,85],[241,276,140],[151,277,205],[112,201,270],[191,190,15],[210,225,95]];
  const shapes = {
    leaf: '<path d="M0 27C-37 2-23-26 0-32C23-26 37 2 0 27Z" fill="currentColor"/><path d="M0 22V-24M0 5l-12-13M0-4l12-12" fill="none" stroke="#fff5e2" stroke-width="2.5" stroke-linecap="round"/>',
    line: '<path d="M-24 17Q-8-27 10-9T28-20M-19 25Q-3-19 15-1" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
    dots: '<g fill="currentColor"><circle cx="-19" cy="-11" r="5"/><circle cx="3" cy="-21" r="4"/><circle cx="20" cy="-6" r="6"/><circle cx="-6" cy="1" r="6"/><circle cx="-20" cy="16" r="3"/><circle cx="10" cy="21" r="5"/><circle cx="25" cy="12" r="3"/></g>'
  };
  let marks = [], completed = false;
  function render(message) {
    motifs.replaceChildren(...marks.map((mark,index) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg','g');
      const [x,y,angle] = positions[index];
      node.setAttribute('transform', 'translate('+x+' '+y+') rotate('+angle+')');
      node.setAttribute('color', colors[mark.pigment]);
      node.innerHTML = shapes[mark.kind];
      return node;
    }));
    const count = marks.length;
    progress.value = count;
    root.querySelector('#plate-art-title').textContent = count ? 'Керамическая тарелка: '+count+' мотивов' : 'Керамическая тарелка без узора';
    result.hidden = !completed;
    finish.disabled = count < 3 || completed;
    undo.disabled = count === 0;
    reset.disabled = count === 0 && pigments[0].checked;
    reset.textContent = completed ? 'Ещё раз' : 'Сбросить';
    for (const button of addButtons) button.disabled = count >= 8;
    status.textContent = message || (count+' из 8 мотивов. '+(count < 3 ? 'Добавьте ещё '+(3-count)+', чтобы завершить узор.' : count === 8 ? 'Тарелка заполнена — завершите узор или отмените мотив.' : 'Можно добавить ещё или выбрать «Готово».'));
  }
  for (const button of addButtons) button.addEventListener('click', () => {
    if(marks.length >= 8) return;
    marks.push({kind:button.dataset.motif, pigment:pigments.find(input=>input.checked).value});
    completed = false;
    render();
  });
  for (const radio of pigments) radio.addEventListener('change', () => {
    // Pigment affects the next mark, not the already completed artwork.
    render(completed ? 'Готово: '+marks.length+' мотивов. Новый пигмент выбран для следующего мотива.' : undefined);
  });
  undo.addEventListener('click', () => {
    if(!marks.length)return;
    marks.pop(); completed = false; render();
  });
  reset.addEventListener('click', () => {
    marks = []; completed = false; pigments[0].checked = true;
    render('0 из 8 мотивов. Начните новый узор — добавьте хотя бы три.');
    addButtons[0].focus({preventScroll:true});
  });
  finish.addEventListener('click', () => {
    if(marks.length < 3 || completed)return;
    completed = true; render('Готово: ваш узор из '+marks.length+' мотивов можно обсудить с мастерской.');
    result.querySelector('button').focus();
  });
  render();
})();
