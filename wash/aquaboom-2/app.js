(() => {
  'use strict';
  const company = window.AQUABOOM;
  if (!company) return;
  const $ = (query, root = document) => root.querySelector(query);
  const $$ = (query, root = document) => [...root.querySelectorAll(query)];

  $$('[data-company]').forEach(node => {
    const value = company[node.dataset.company];
    if (value) node.textContent = value;
  });
  $$('[data-link]').forEach(link => {
    const key = link.dataset.link;
    link.href = key === 'phone' ? `tel:${company.phoneHref}` : key === 'secondPhone' ? `tel:${company.secondPhoneHref}` : key === 'email' ? `mailto:${company.email}` : company[key];
  });
  // The controls stay still; only the illustrative layers react to the pointer.
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let motionEnabled = !reduceQuery.matches;
  let frame = 0;
  let pointerFrame = 0;
  let pendingPointer = null;
  let lastPaint = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const scenes = $$('[data-motion]').map(node => ({node, top:0, height:0, left:0, width:0, visible:false}));
  const waterScenes = window.AquaWaterScenes ? [
    window.AquaWaterScenes.create($('.hero-art'), 'hero'),
    window.AquaWaterScenes.create($('.ritual-scene'), 'ritual')
  ].filter(Boolean) : [];
  const measure = () => {
    scenes.forEach(scene => {
      const box = scene.node.getBoundingClientRect();
      scene.top = box.top + window.scrollY;
      scene.height = box.height;
      scene.left = box.left;
      scene.width = box.width;
    });
    waterScenes.forEach(scene => {
      const box = scene.host.getBoundingClientRect();
      scene.top = box.top + window.scrollY;
      scene.height = box.height;
    });
    scheduleScroll();
  };
  const paintScroll = time => {
    frame = 0;
    if (document.hidden) return;
    const height = window.innerHeight;
    const y = window.scrollY;
    const elapsed = lastPaint ? Math.min(time-lastPaint, 40) : 16;
    const ease = 1-Math.exp(-elapsed/85);
    let settling = false;
    lastPaint = time;
    scenes.forEach(scene => {
      if (!motionEnabled) {
        scene.node.style.setProperty('--entry', '1');
        scene.node.style.setProperty('--travel', '0');
        return;
      }
      // Begin while the section is entering from the bottom; reverses naturally.
      const progress = Math.max(0, Math.min(1, (y + height - scene.top) / (height * .82)));
      scene.node.style.setProperty('--entry', progress.toFixed(4));
      scene.node.style.setProperty('--travel', (1 - progress).toFixed(4));
    });
    waterScenes.forEach(scene => {
      if (!motionEnabled) {
        scene.current = .36;
        scene.render(.36);
        return;
      }
      const inView = y+height > scene.top-80 && y < scene.top+scene.height+80;
      // The hero unfolds while it leaves; the second scene starts at its first entrance.
      const target = scene.variant === 'hero'
        ? clamp(y / Math.max(1, scenes[0].height*.78))
        : clamp((y+height-scene.top) / (height+scene.height*.82));
      if (!inView) {scene.current=target;return;}
      const difference = target-scene.current;
      scene.current = Math.abs(difference)<.0008 ? target : scene.current+difference*ease;
      scene.render(scene.current);
      if (Math.abs(target-scene.current)>.0008) settling=true;
    });
    if (settling) scheduleScroll();
    else lastPaint=0;
  };
  function scheduleScroll() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(paintScroll);
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const scene = scenes.find(item => item.node === entry.target);
    if (scene) scene.visible = entry.isIntersecting;
  }), {rootMargin:'60px'});
  scenes.forEach(scene => {
    observer.observe(scene.node);
    scene.node.addEventListener('pointermove', event => {
      if (!motionEnabled || !fineQuery.matches || !scene.visible || event.pointerType === 'touch') return;
      pendingPointer = {scene, x:event.clientX, y:event.clientY};
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!pendingPointer || !motionEnabled) return;
        const {scene:s, x, y} = pendingPointer;
        const localX = Math.max(0, Math.min(1, (x - s.left) / s.width));
        const localY = Math.max(0, Math.min(1, (y - (s.top - window.scrollY)) / s.height));
        s.node.style.setProperty('--mx', ((localX - .5)*2).toFixed(4));
        s.node.style.setProperty('--my', ((localY - .5)*2).toFixed(4));
        s.node.style.setProperty('--px', `${localX*100}%`);
        s.node.style.setProperty('--py', `${localY*100}%`);
      });
    }, {passive:true});
    scene.node.addEventListener('pointerleave', () => {
      scene.node.style.setProperty('--mx','0');
      scene.node.style.setProperty('--my','0');
      scene.node.style.setProperty('--px','50%');
      scene.node.style.setProperty('--py','50%');
      pendingPointer = null;
    }, {passive:true});
  });
  function syncMotion() {
    // OS reduced motion has priority, including after a runtime preference change.
    motionEnabled = !reduceQuery.matches;
    document.documentElement.classList.toggle('motion-paused', !motionEnabled);
    if (!motionEnabled) scenes.forEach(({node}) => {
      node.style.setProperty('--mx','0');node.style.setProperty('--my','0');
      node.style.setProperty('--px','50%');node.style.setProperty('--py','50%');
    });
    scheduleScroll();
  }
  reduceQuery.addEventListener('change', syncMotion);
  window.addEventListener('scroll', scheduleScroll, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('load', measure, {once:true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);
      frame=0;pointerFrame=0;pendingPointer=null;lastPaint=0;
    } else measure();
  });
  document.fonts?.ready.then(measure);
  syncMotion();measure();

  // Four service panels share one semantic tabpanel and a central company config.
  const tabs = $$('[data-service]');
  const panel = $('#care-panel');
  let selected = 'body';
  const selectService = (id, focus = false) => {
    const service = company.services.find(item => item.id === id);
    if (!service) return;
    selected = id;
    tabs.forEach(tab => {
      const active = tab.dataset.service === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    $('#service-eyebrow').textContent = service.eyebrow;
    $('#service-title').textContent = service.title;
    $('#service-description').textContent = service.description;
    const list = $('#service-details');
    list.replaceChildren(...service.details.map(text => {const li=document.createElement('li');li.textContent=text;return li;}));
    $('#service-icon').setAttribute('href', `#${service.icon}`);
    $('#service-book').firstChild.textContent = 'Обсудить услугу';
    $('#service').value = id;
    $('#service').dispatchEvent(new Event('change', {bubbles:true}));
    measure();
  };
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => selectService(tab.dataset.service));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();selectService(tabs[next].dataset.service, true);
    });
  });
  $('#service-book').addEventListener('click', () => {
    if ($('#booking-entry').hidden) {
      form.reset();clearError(nameField);clearError(phoneField);
      $('#booking-success').hidden=true;$('#booking-entry').hidden=false;
    }
    $('#service').value=selected;
    $('#service').dispatchEvent(new Event('change', {bubbles:true}));
    measure();
  });
  $$('.faq-list details').forEach(item => item.addEventListener('toggle', measure));

  // Browser-only validation, with no network request or persistent storage.
  const form = $('#booking-form');
  const nameField = $('#name');
  const phoneField = $('#phone');
  const clearError = field => {
    field.removeAttribute('aria-invalid');
    $(`#${field.id}-error`).textContent='';
  };
  const setError = (field, text) => {
    field.setAttribute('aria-invalid','true');
    $(`#${field.id}-error`).textContent=text;
  };
  [nameField,phoneField].forEach(field => field.addEventListener('input', () => clearError(field)));
  form.addEventListener('submit', event => {
    event.preventDefault();clearError(nameField);clearError(phoneField);
    let firstError=null;
    if ((nameField.value.trim().match(/\p{L}/gu) || []).length<2) {
      setError(nameField,'Введите имя: не меньше двух букв.');firstError=nameField;
    }
    const digits=phoneField.value.replace(/\D/g,'');
    const phoneValid = /^\+?[\d\s().-]+$/.test(phoneField.value.trim()) && (/^(?:7|8)\d{10}$/.test(digits) || /^9\d{9}$/.test(digits));
    if (!phoneValid) {
      setError(phoneField,'Введите российский номер целиком: +7 и ещё 10 цифр.');
      if (!firstError) firstError=phoneField;
    }
    if (firstError) {firstError.focus();measure();return;}
    form.reset();
    $('#booking-entry').hidden=true;
    $('#booking-success').hidden=false;
    $('#booking-success').focus({preventScroll:true});
    measure();
  });
  // Keep the submit control disabled in the no-JS baseline: no accidental GET with personal fields.
  $('#booking-submit').disabled = false;
  $('#form-retry').addEventListener('click', () => {
    form.reset();$('#service').value=selected;
    clearError(nameField);clearError(phoneField);
    $('#booking-success').hidden=true;$('#booking-entry').hidden=false;
    nameField.focus({preventScroll:true});measure();
  });
})();
