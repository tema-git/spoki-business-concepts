(() => {
  'use strict';
  const root = document.documentElement;
  const cutoff = Date.parse(root.dataset.meeting);
  const expiry = Date.parse(root.dataset.expiry);
  const refreshPhase = () => {
    const now = Date.now();
    for (const [name, active] of Object.entries({
      'has-date': now < cutoff, 'no-date': now >= cutoff,
      unexpired: now < expiry, expired: now >= expiry
    })) root.classList.toggle(name, active);
    root.classList.remove('no-js');
  };
  refreshPhase();
  // Recheck long-lived tabs, including tabs restored from the back/forward cache.
  function checkCalendar() {
    refreshPhase();
    const next = [cutoff, expiry].find(time => time > Date.now());
    if (next) window.setTimeout(checkCalendar, Math.min(next - Date.now() + 25, 2147480000));
  }
  checkCalendar();
  window.addEventListener('pageshow', refreshPhase);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshPhase(); });

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = window.matchMedia('(hover:hover) and (pointer:fine)');
  const getValue = (key) => { try { return sessionStorage.getItem('chaynaya.' + key); } catch { return null; } };
  const setValue = (key, value) => { try { sessionStorage.setItem('chaynaya.' + key, value); } catch {} };
  const variants = new Set(['one', 'two', 'express', 'front', 'table', 'nama', 'six']);
  const isLive = () => Date.now() < cutoff;

  function setupMenu() {
    const button = document.querySelector('#menu-button');
    const menu = document.querySelector('#menu');
    const close = (restoreFocus = false) => {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Открыть меню');
      if (restoreFocus) button.focus();
    };
    button.addEventListener('click', () => {
      if (menu.classList.contains('open')) return close();
      menu.classList.add('open');
      button.setAttribute('aria-expanded','true');
      button.setAttribute('aria-label','Закрыть меню');
      menu.querySelector('a').focus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) close(true);
    });
    document.addEventListener('pointerdown', e => {
      if (!e.target.closest('.mast')) close();
    });
    menu.addEventListener('click', () => close());
    document.querySelector('.mast').addEventListener('focusout', e => {
      if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) close();
    });
    window.matchMedia('(min-width:821px)').addEventListener('change', () => close());
  }

  function setupSelection() {
    const url = new URL(location.href);
    const params = url.searchParams;
    const ticket = document.querySelector('[data-ticket-page]')?.dataset.ticketPage;
    const rootLink = document.querySelector('.mast .brand').href;
    if (params.get('from') === 'archive' || !isLive()) setValue('meeting', '');
    if (params.get('event') === '67' && isLive()) setValue('meeting', '67');
    if (ticket && variants.has(ticket)) setValue('ticket',ticket);
    const meeting = isLive() && getValue('meeting') === '67';
    const resumeType = getValue('ticket') || 'one';
    const type = variants.has(resumeType) && (resumeType !== 'express' || isLive()) ? resumeType : 'one';
    const target = new URL(type === 'one' ? 'tickets/' : 'tickets/' + type + '/', rootLink);
    if (meeting) target.searchParams.set('event','67');
    document.querySelectorAll('[data-resume]').forEach(link => { link.href = target.href; });
    document.querySelectorAll('[data-choose]').forEach(link => {
      const picked = new URL(target);
      picked.searchParams.set('event','67');
      link.href = picked.href;
    });
    document.querySelectorAll('[data-variant]').forEach(link => {
      const option = new URL(link.href);
      if (meeting) option.searchParams.set('event','67');
      if (params.get('from') === 'archive') option.searchParams.set('from','archive');
      link.href = option.href;
    });
    const selected = document.querySelector('[data-selected-meeting]');
    if (selected) selected.hidden = !meeting;
  }

  function setupMotion() {
    const areas = document.querySelectorAll('.reactive,.mag');
    const clear = node => {
      for (const k of ['--mx','--my','--shiftX','--shiftY']) node.style.removeProperty(k);
    };
    areas.forEach(node => {
      node.addEventListener('pointermove', e => {
        if (motion.matches || !mouse.matches || e.pointerType === 'touch') return;
        const box = node.getBoundingClientRect();
        const rx = (e.clientX - box.left) / box.width - .5;
        const ry = (e.clientY - box.top) / box.height - .5;
        const magnetic = node.classList.contains('mag');
        node.style.setProperty(magnetic ? '--mx' : '--shiftX',magnetic ? rx * 8 + 'px' : rx * 1.4 + '%');
        node.style.setProperty(magnetic ? '--my' : '--shiftY',magnetic ? ry * 7 + 'px' : ry + '%');
      }, {passive:true});
      node.addEventListener('pointerleave', () => clear(node));
    });
    motion.addEventListener('change', () => areas.forEach(clear));
  }

  function fitHeroTitles() {
    const titles = document.querySelectorAll('.hero-title');
    if (!titles.length || !window.ResizeObserver) return;
    const pen = document.createElement('canvas').getContext('2d');
    if (!pen || !('letterSpacing' in pen)) return;
    function fit(title) {
      const width = title.getBoundingClientRect().width;
      if (!width) return;
      for (const line of title.children) {
        const style = getComputedStyle(line);
        pen.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        pen.textRendering = style.textRendering;
        pen.letterSpacing = '0px';
        const text = line.textContent;
        const ink = pen.measureText(text);
        const tracking = (width - ink.actualBoundingBoxLeft - ink.actualBoundingBoxRight) / (text.length - 1);
        line.style.letterSpacing = tracking + 'px';
        line.style.textIndent = ink.actualBoundingBoxLeft + 'px';
      }
    }
    const resize = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
    titles.forEach(title => resize.observe(title));
    document.fonts.ready.then(() => titles.forEach(fit));
  }

  function setupTeaPour() {
    const poster = document.querySelector('.poster');
    if (!poster) return;
    const svg = poster.querySelector('.cup-art');
    const part = name => svg.querySelector('[data-' + name + ']');
    const liquid = part('liquid'), body = part('tea-body'), top = part('tea-top');
    const stream = part('stream'), highlight = part('stream-light'), ripple = part('ripple'), pot = part('pot');
    const status = document.querySelector('[data-pour-status]');
    poster.tabIndex = 0;
    poster.setAttribute('role', 'button');
    poster.setAttribute('aria-label', 'Наполнить гайвань чаем');
    const center = 312, rim = 248, halfWidth = 155;
    let level = 0, source = '', tip = {x:318, y:145};
    let frame = 0, lastTime = 0, previousScroll = window.scrollY;
    let pointer = null, scrollPointer = null, touchStart = null;

    function paint(time = 0) {
      // The moving ellipse follows the same quadratic profile as the glass wall.
      const t = Math.sqrt(level), u = 1 - t;
      const radius = u*u*34 + 2*u*t*116 + t*t*halfWidth;
      const y = u*u*360 + 2*u*t*339 + t*t*rim;
      liquid.setAttribute('opacity', level > 0 ? '1' : '0');
      top.setAttribute('cx', center);
      top.setAttribute('cy', y);
      top.setAttribute('rx', radius);
      top.setAttribute('ry', .19 * radius);
      body.setAttribute('d', 'M'+(center-radius)+' '+y+'a'+radius+' '+(.19*radius)+' 0 0 0 '+(2*radius)+' 0v130H'+(center-radius)+'Z');

      const pouring = Boolean(source) && level < 1 && !motion.matches;
      const landedX = Math.max(center - radius*.87, Math.min(center + radius*.87, tip.x));
      const landingY = y - .02 * radius;
      const drop = landingY - tip.y;
      const d = `M${tip.x} ${tip.y} q-4 6 -4 ${drop*.25} Q${tip.x-4} ${tip.y+drop*.76} ${landedX} ${landingY}`;
      stream.setAttribute('d', d);
      highlight.setAttribute('d', d);
      stream.setAttribute('opacity', pouring ? '.92' : '0');
      highlight.setAttribute('opacity', pouring ? '.85' : '0');
      const wave = (time % 650) / 650;
      ripple.setAttribute('cx', landedX);
      ripple.setAttribute('cy', landingY);
      ripple.setAttribute('rx', 2 + 12*wave);
      ripple.setAttribute('ry', .8 + 2.3*wave);
      ripple.setAttribute('opacity', pouring ? String(.9*(1-wave)) : '0');
      const face = tip.x > 625 ? -1 : 1;
      const tilt = pouring ? -17 : tip.y > 448 ? -42 : -3;
      pot.setAttribute('transform',`translate(${tip.x} ${tip.y}) scale(${face} 1) rotate(${tilt})`);
      pot.setAttribute('visibility', source === 'direct' || poster.hasAttribute('data-pointer') ? 'visible' : 'hidden');
    }

    function stop() {
      source = '';
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      paint();
    }
    function finish() {
      level = 1;
      stop();
      status.textContent = 'Гайвань полна.';
    }
    function tick(time) {
      level = Math.min(1, level + Math.min(80, time-lastTime)/2600);
      if (level === 1) return finish();
      paint(time);
      lastTime = time;
      frame = requestAnimationFrame(tick);
    }
    function pour(from) {
      if (level === 1) return paint();
      source = from;
      if (motion.matches) return finish();
      if (!frame) {
        lastTime = performance.now();
        status.textContent = 'Чай наливается.';
        frame = requestAnimationFrame(tick);
      }
      paint(performance.now());
    }
    function serve(x = center) {
      if (level === 1) return;
      previousScroll = window.scrollY;
      tip = {x, y:145};
      pour('direct');
    }
    function scenePoint(e) {
      return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    }
    function openingAt(x) {
      return rim + 30*Math.sqrt(Math.max(0,1-((x-center)/halfWidth)**2));
    }
    function move(e) {
      if (e.pointerType === 'touch') return;
      pointer = {x:e.clientX, y:e.clientY};
      if (scrollPointer && Math.hypot(pointer.x-scrollPointer.x,pointer.y-scrollPointer.y) < 2) return;
      scrollPointer = null;
      const point = scenePoint(e);
      poster.setAttribute('data-pointer','');
      const above = Math.abs(point.x-center) < halfWidth-5 && point.y <= openingAt(point.x)+5;
      tip = {x:point.x, y:above ? Math.min(point.y, rim-24) : point.y};
      if (above) pour('pointer');
      else stop();
    }
    poster.addEventListener('pointerenter', move);
    poster.addEventListener('pointermove', move);
    poster.addEventListener('pointerleave', () => {
      poster.removeAttribute('data-pointer');
      if (source !== 'direct') stop();
    });
    poster.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') touchStart = {x:e.clientX, y:e.clientY};
    });
    poster.addEventListener('pointercancel', () => { touchStart = null; });
    poster.addEventListener('pointerup', e => {
      if (!touchStart || e.pointerType !== 'touch') return;
      const tap = Math.hypot(e.clientX-touchStart.x,e.clientY-touchStart.y) < 12;
      touchStart = null;
      const point = scenePoint(e);
      if (tap && Math.abs(point.x-center) < halfWidth && point.y < 375) serve(point.x);
    });
    poster.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (!e.repeat) serve();
    });
    poster.addEventListener('click', e => {
      if (e.detail === 0) serve();
    });
    window.addEventListener('scroll', () => {
      const distance = Math.abs(window.scrollY - previousScroll);
      previousScroll = window.scrollY;
      if (!distance) return;
      scrollPointer = pointer;
      poster.removeAttribute('data-pointer');
      if (!level && !source) return paint();
      const drainDistance = Math.max(190, Math.min(340, poster.clientHeight * .7));
      level = motion.matches ? 0 : Math.max(0, level - distance / drainDistance);
      stop();
      status.textContent = level ? 'В гайвани остался чай.' : 'Гайвань пуста.';
    }, {passive:true});
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && source) stop(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    motion.addEventListener('change', () => { if (motion.matches && source) finish(); });
    paint();
  }

  function setupPicker() {
    document.querySelectorAll('[data-picker]').forEach(picker => {
      const teas = JSON.parse(picker.dataset.picker);
      const buttons = [...picker.querySelectorAll('[data-taste]')];
      const result = picker.querySelector('.pick-result');
      const picture = picker.querySelector('.pick-photo img');
      const original = {src:picture.getAttribute('src'),alt:picture.alt};
      const select = index => {
        const tea = teas[index];
        buttons.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
        result.hidden = false;
        result.querySelector('h3').textContent = tea.name;
        result.querySelector('.result-desc').textContent = tea.desc;
        result.querySelector('.result-link').href = tea.url;
        picture.src = tea.img;
        picture.alt = tea.alt;
        if (window.matchMedia('(max-width:620px)').matches) {
          result.querySelector('h3').setAttribute('tabindex','-1');
          result.querySelector('h3').focus({preventScroll:true});
          result.scrollIntoView({block:'nearest'});
        }
      };
      const reset = () => {
        result.hidden = true;
        buttons.forEach(b => b.setAttribute('aria-pressed','false'));
        picture.src = original.src;
        picture.alt = original.alt;
        buttons[0].focus();
      };
      buttons.forEach((b,i) => b.addEventListener('click', () => select(i)));
      picker.querySelector('[data-again]').addEventListener('click',reset);
      picker.addEventListener('keydown', e => { if (e.key === 'Escape' && !result.hidden) reset(); });
    });
  }

  function setupMaps() {
    const map = document.querySelector('[data-map-switch]');
    if (!map) return;
    const choices = [...document.querySelectorAll('[data-map-id]')];
    choices.forEach(button => button.addEventListener('click', () => {
      choices.forEach(b => b.setAttribute('aria-pressed',String(b === button)));
      map.src = button.dataset.frame;
      map.title = 'Яндекс Карта · '+button.textContent;
      document.querySelector('[data-map-route]').href = button.dataset.route;
      document.querySelector('[data-map-route] span').textContent = 'Маршрут '+button.dataset.label;
    }));
  }

  function setupForm() {
    const form = document.querySelector('#request-form');
    if (!form) return;
    const result = document.querySelector('#draft');
    const output = result.querySelector('textarea');
    const contact = result.querySelector('[data-open-draft]');
    const type = getValue('ticket');
    if (variants.has(type) && type !== 'express') form.elements.ticket.value=type;
    if (isLive() && getValue('meeting')==='67') form.elements.program.value='№ 67, 26 ноября, 20:00';
    const updateLink = () => {
      const url = new URL(contact.dataset.base);
      url.searchParams.set('text',output.value);
      contact.href = url.href;
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const program = form.elements.program;
      program.setCustomValidity(program.value.trim() ? '' : 'Укажите встречу или попросите сообщить следующую дату.');
      if (!form.reportValidity()) return;
      const label = form.elements.ticket.selectedOptions[0].textContent;
      output.value = 'Здравствуйте! Хочу согласовать посещение в чайной на Тверской. Билет: '+label+'. Встреча: '+program.value.trim()+'.';
      result.hidden = false;
      result.querySelector('[role="status"]').textContent='Текст готов. Его можно отредактировать.';
      updateLink();
      output.focus();
    });
    form.elements.program.addEventListener('input', () => form.elements.program.setCustomValidity(''));
    form.addEventListener('input', () => { result.hidden=true; });
    output.addEventListener('input',updateLink);
    result.querySelector('[data-copy]').addEventListener('click', async () => {
      let copied=false;
      try { await navigator.clipboard.writeText(output.value); copied=true; }
      catch { output.focus(); output.select(); try { copied=document.execCommand('copy'); } catch {} }
      result.querySelector('[role="status"]').textContent=copied?'Текст скопирован.':'Текст выделен для копирования.';
    });
    result.querySelector('[data-new-draft]').addEventListener('click', () => {
      result.hidden=true; form.elements.program.focus();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMenu(); setupSelection(); setupMotion(); fitHeroTitles(); setupTeaPour(); setupPicker(); setupMaps(); setupForm();
  });
})();
