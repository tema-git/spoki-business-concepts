'use strict';
(() => {
 const $ = (s, root=document) => root.querySelector(s);
 const $$ = (s, root=document) => [...root.querySelectorAll(s)];
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const fine = window.matchMedia('(pointer: fine)');
 let motionContext = null;
 let playedIntro = false;
 const pointerResets = [];
 const motionEnabled = () => !reduced.matches;
 const animate = callback => { if(motionEnabled() && window.gsap && motionContext) motionContext.add(callback); };
 const menu = $('.menu-toggle'), nav = $('#mobile-nav');
 function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.hidden=true;}
 menu.addEventListener('click',()=>{const opening=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(opening));menu.setAttribute('aria-label',opening?'Закрыть меню':'Открыть меню');nav.hidden=!opening;});
 $$('.site-header a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('focusin',e=>{if(!nav.hidden&&!e.target.closest('.site-header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){closeMenu();menu.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
 window.addEventListener('resize',()=>{if(innerWidth>850)closeMenu();},{passive:true});
 // A stable target plane: only decorative children respond to the pointer.
 $$('.reactive').forEach(section=>{
  let rect=null, raf=0, x=0, y=0;
  const apply=()=>{section.style.setProperty('--mx',x.toFixed(3));section.style.setProperty('--my',y.toFixed(3));raf=0;};
  section.addEventListener('pointerenter',()=>{rect=section.getBoundingClientRect();});
  section.addEventListener('pointermove',e=>{if(!motionEnabled()||!fine.matches)return;if(!rect)rect=section.getBoundingClientRect();x=Math.max(-1,Math.min(1,(e.clientX-rect.left)/rect.width*2-1));y=Math.max(-1,Math.min(1,(e.clientY-rect.top)/rect.height*2-1));if(!raf)raf=requestAnimationFrame(apply);},{passive:true});
  section.addEventListener('pointerleave',()=>{x=y=0;if(!raf)raf=requestAnimationFrame(apply);});
  section.addEventListener('focusin',()=>{if(motionEnabled()){section.style.setProperty('--mx','.22');section.style.setProperty('--my','-.15');}});
  section.addEventListener('focusout',e=>{if(!section.contains(e.relatedTarget)){section.style.setProperty('--mx','0');section.style.setProperty('--my','0');}});
  window.addEventListener('scroll',()=>{rect=null;},{passive:true});
  window.addEventListener('resize',()=>{rect=null;},{passive:true});
  pointerResets.push(()=>{if(raf)cancelAnimationFrame(raf);raf=0;x=y=0;rect=null;section.style.setProperty('--mx','0');section.style.setProperty('--my','0');});
 });

 // A stationary link target with a gently moving visual face.
 const contactAnchor=$('.header-contact');
 let magnetFrame=0,magnetRect=null,magnetX=0,magnetY=0;
 function drawMagnet(){magnetFrame=0;contactAnchor.style.setProperty('--magnet-x',`${magnetX.toFixed(2)}px`);contactAnchor.style.setProperty('--magnet-y',`${magnetY.toFixed(2)}px`);}
 function resetMagnet(){if(magnetFrame)cancelAnimationFrame(magnetFrame);magnetFrame=0;magnetRect=null;magnetX=magnetY=0;drawMagnet();}
 function moveMagnet(event){
  if(!motionEnabled()||!fine.matches)return;
  if(!magnetRect)magnetRect=contactAnchor.getBoundingClientRect();
  magnetX=Math.max(-5,Math.min(5,((event.clientX-magnetRect.left)/magnetRect.width-.5)*10));
  magnetY=Math.max(-4,Math.min(4,((event.clientY-magnetRect.top)/magnetRect.height-.5)*8));
  if(!magnetFrame)magnetFrame=requestAnimationFrame(drawMagnet);
 }
 contactAnchor.addEventListener('pointerenter',event=>{magnetRect=contactAnchor.getBoundingClientRect();moveMagnet(event);});
 contactAnchor.addEventListener('pointermove',moveMagnet,{passive:true});
 contactAnchor.addEventListener('pointerleave',resetMagnet);
 contactAnchor.addEventListener('focus',()=>{if(motionEnabled()&&fine.matches&&contactAnchor.matches(':focus-visible')){magnetX=2;magnetY=-1;drawMagnet();}});
 contactAnchor.addEventListener('blur',()=>{if(!contactAnchor.matches(':hover'))resetMagnet();});
 window.addEventListener('resize',resetMagnet,{passive:true});
 pointerResets.push(resetMagnet);

 const palette=['#fff5e8','#8f1539','#d9e57e','#f2df86'];
 const sugar=$('.hero-sugar');
 for(let i=0;i<17;i++){const bit=document.createElement('i');bit.className='sugar-bit';bit.style.cssText=`--sx:${6+(i*37)%87}%;--sy:${7+(i*23)%87}%;--sr:${i*53}deg;--sc:${palette[i%4]};--sd:${12+i%5*8}px`;sugar.append(bit);}
 const giftLid=document.createElement('div');giftLid.className='gift-lid';$('.gift-box').append(giftLid);
 const moods={bright:{caption:'Мармеладное настроение',title:'Чуть кисло.<br>Очень весело.',copy:'Фруктовые формы, сочные цвета и тот самый первый кусочек.',icons:['ring','bear','citrus']},soft:{caption:'Воздушное настроение',title:'Нежность<br>в каждом кусочке.',copy:'Пастельные облачка и мягкая сладость для спокойного момента.',icons:['cloud','berry','cloud']},chocolate:{caption:'Шоколадное настроение',title:'Когда нужен<br>шоколад.',copy:'Глубокие оттенки какао и маленький ритуал удовольствия.',icons:['choc','choc','berry']}};
 $$('.flavor-tab').forEach(tab=>tab.addEventListener('click',()=>{
  if(tab.getAttribute('aria-pressed')==='true')return;
  $$('.flavor-tab').forEach(b=>{b.classList.toggle('active',b===tab);b.setAttribute('aria-pressed',String(b===tab));});
  const key=tab.dataset.flavor,m=moods[key];$('.flavor-stage').dataset.mood=key;$('.flavor-caption').textContent=m.caption;$('#flavor-title').innerHTML=m.title;$('#flavor-copy').textContent=m.copy;
  $$('.flavor-art use').forEach((el,i)=>el.setAttribute('href','#c-'+m.icons[i]));
  animate(()=>gsap.fromTo('.flavor-art>svg use',{scale:.75,rotation:-18},{scale:1,rotation:0,duration:.65,ease:'back.out(1.8)',stagger:.07,overwrite:'auto'}));
 }));
 const candyNames={ring:'ягодное кольцо',bear:'мармеладный мишка',choc:'шоколадный кубик',cloud:'нежный маршмеллоу',berry:'клубничная радость',citrus:'цитрусовая долька'};
 const box=[];const slots=$('.box-slots');let confettiTimer=0;
 const boxDecoration=document.createElement('div');boxDecoration.className='box-decoration';boxDecoration.setAttribute('aria-hidden','true');$('.builder-box').prepend(boxDecoration);
 function clearConfetti(){clearTimeout(confettiTimer);confettiTimer=0;$$('.sprinkle').forEach(el=>{if(window.gsap)gsap.killTweensOf(el);el.remove();});}
 function celebrate(){
  clearConfetti();if(!motionEnabled()||!window.gsap)return;
  for(let i=0;i<24;i++){const bit=document.createElement('i');bit.className='sprinkle';bit.style.cssText=`--left:${10+i*3.3}%;--color:${palette[i%4]}`;$('.builder-box').append(bit);animate(()=>gsap.fromTo(bit,{y:0,x:0,opacity:1,rotation:0},{y:-100-i%5*24,x:(i-12)*9,rotation:i*31,opacity:0,duration:1.2+i%4*.12,ease:'power2.out'}));}
  confettiTimer=setTimeout(clearConfetti,2200);
 }
 function renderBox(animateIndex=-1){
  slots.replaceChildren();
  for(let i=0;i<6;i++){
   if(box[i]){const b=document.createElement('button');b.type='button';b.className='box-slot filled';b.setAttribute('aria-label',`Убрать: ${candyNames[box[i]]}, место ${i+1}`);b.dataset.slot=String(i);b.innerHTML=`<svg aria-hidden="true"><use href="#c-${box[i]}"/></svg>`;b.addEventListener('click',()=>{box.splice(i,1);renderBox();const next=$('.box-slot.filled')||$('.candy-picker button');next.focus({preventScroll:true});});slots.append(b);}
   else{const empty=document.createElement('div');empty.className='box-slot';empty.setAttribute('role','img');empty.setAttribute('aria-label',`Место ${i+1} свободно`);empty.innerHTML=`<span class="slot-number" aria-hidden="true">${i+1}</span>`;slots.append(empty);}
  }
  $('#box-count').textContent=`${box.length} из 6`;
  $('.builder-box').classList.toggle('is-complete',box.length===6);
  if(!box.length){$('#box-title').textContent='Начнём с любимого.';$('#box-message').textContent='Выберите первую сладость на полке.';}
  else if(box.length<6){$('#box-title').textContent='Уже получается красиво.';$('#box-message').textContent=`Осталось ${6-box.length} ${6-box.length===1?'место':6-box.length<5?'места':'мест'}. Повторить любимый вкус? Отличная идея.`;}
  else{const unique=new Set(box).size;$('#box-title').textContent=unique>=5?'Коллекция ярких впечатлений.':unique<=2?'Верность любимому вкусу.':'Твой идеальный сладкий микс.';$('#box-message').textContent='Коробка собрана! Можно убрать любую сладость или придумать новый набор.';}
  if(animateIndex>=0)animate(()=>gsap.fromTo(slots.children[animateIndex].querySelector('svg'),{scale:.2,rotation:-60},{scale:1,rotation:0,duration:.5,ease:'back.out(2)',overwrite:'auto'}));
 }
 $$('.candy-picker button').forEach(button=>button.addEventListener('click',()=>{if(box.length===6){$('#box-message').textContent='Все 6 мест заняты. Уберите сладость из коробки или нажмите «Собрать заново».';return;}box.push(button.dataset.candy);renderBox(box.length-1);if(box.length===6)celebrate();}));
 $('.reset-box').addEventListener('click',()=>{box.length=0;clearConfetti();renderBox();$('.candy-picker button').focus({preventScroll:true});});
 renderBox();

 // Select-only combobox: active option and committed form value are independent.
 const topicSelect=$('#topic-select'),topicTrigger=$('#customer-topic'),topicList=$('#topic-options');
 const topicInput=$('#customer-topic-value'),topicDisplay=$('#topic-selected'),topicOptions=$$('.select-option',topicList);
 let selectedTopic=0,activeTopic=0,typeBuffer='',lastTypeAt=0;
 function topicIsOpen(){return topicTrigger.getAttribute('aria-expanded')==='true';}
 function markTopicActive(index,scroll=true){
  activeTopic=Math.max(0,Math.min(topicOptions.length-1,index));
  topicOptions.forEach((option,i)=>option.classList.toggle('is-active',i===activeTopic));
  topicTrigger.setAttribute('aria-activedescendant',topicOptions[activeTopic].id);
  if(scroll){
   const option=topicOptions[activeTopic];
   if(option.offsetTop<topicList.scrollTop)topicList.scrollTop=option.offsetTop-6;
   else if(option.offsetTop+option.offsetHeight>topicList.scrollTop+topicList.clientHeight)topicList.scrollTop=option.offsetTop+option.offsetHeight-topicList.clientHeight+6;
  }
 }
 function placeTopicList(){
  const rect=topicTrigger.getBoundingClientRect();
  const headerBottom=$('.site-header').getBoundingClientRect().bottom;
  const sectionRect=topicSelect.closest('.contact-section').getBoundingClientRect();
  const lowerLimit=Math.min(innerHeight,sectionRect.bottom);
  const upperLimit=Math.max(headerBottom,sectionRect.top);
  const below=Math.max(0,lowerLimit-rect.bottom-16);
  const above=Math.max(0,rect.top-upperLimit-16);
  const needed=Math.min(220,topicList.scrollHeight);
  const upwards=below<needed&&above>below;
  topicSelect.classList.toggle('opens-up',upwards);
  topicList.style.maxHeight=`${Math.max(1,Math.min(220,upwards?above:below))}px`;
 }
 function openTopic(index=selectedTopic){
  topicList.hidden=false;topicSelect.classList.add('is-open');topicTrigger.setAttribute('aria-expanded','true');
  placeTopicList();markTopicActive(index,true);
 }
 function closeTopic(){
  topicList.hidden=true;topicSelect.classList.remove('is-open','opens-up');topicTrigger.setAttribute('aria-expanded','false');topicTrigger.removeAttribute('aria-activedescendant');
  topicOptions.forEach(option=>option.classList.remove('is-active'));activeTopic=selectedTopic;typeBuffer='';lastTypeAt=0;
 }
 function commitTopic(index,focus=false){
  selectedTopic=index;topicInput.value=topicOptions[index].dataset.value;topicDisplay.textContent=topicInput.value;
  topicOptions.forEach((option,i)=>option.setAttribute('aria-selected',String(i===index)));
  topicInput.dispatchEvent(new Event('change',{bubbles:true}));closeTopic();
  if(focus)topicTrigger.focus({preventScroll:true});
 }
 function resetTopic(){selectedTopic=0;topicInput.value=topicOptions[0].dataset.value;topicDisplay.textContent=topicInput.value;topicOptions.forEach((option,i)=>option.setAttribute('aria-selected',String(i===0)));closeTopic();}
 function findTopicCharacter(character){
  const now=Date.now();typeBuffer=now-lastTypeAt>700?character:typeBuffer+character;lastTypeAt=now;
  const text=typeBuffer.toLocaleLowerCase('ru');const repeated=[...text].every(char=>char===text[0]);const needle=repeated?text[0]:text;
  const findMatch=prefix=>{for(let step=1;step<=topicOptions.length;step++){const index=(activeTopic+step)%topicOptions.length;if(topicOptions[index].dataset.value.toLocaleLowerCase('ru').startsWith(prefix))return index;}return -1;};
  let match=findMatch(needle);
  if(match<0&&text.length>1){typeBuffer=character;match=findMatch(character.toLocaleLowerCase('ru'));}
  if(!topicIsOpen())openTopic(match>=0?match:selectedTopic);else if(match>=0)markTopicActive(match);
 }
 topicTrigger.addEventListener('click',()=>{if(topicIsOpen())closeTopic();else openTopic();});
 topicTrigger.addEventListener('keydown',event=>{
  if(event.isComposing)return;
  const open=topicIsOpen();
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();if(!open)openTopic();else markTopicActive(activeTopic+(event.key==='ArrowDown'?1:-1));return;
  }
  if(event.key==='Home'||event.key==='End'){event.preventDefault();const index=event.key==='Home'?0:topicOptions.length-1;if(!open)openTopic(index);else markTopicActive(index);return;}
  if(event.key==='Enter'||event.key===' '){event.preventDefault();if(open)commitTopic(activeTopic);else openTopic();return;}
  if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();closeTopic();return;}
  if(event.key==='Tab'&&open){commitTopic(activeTopic);return;}
  if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();findTopicCharacter(event.key);}
 });
 topicOptions.forEach((option,index)=>{
  option.addEventListener('mousedown',event=>event.preventDefault());
  option.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'&&topicIsOpen())markTopicActive(index,false);});
  option.addEventListener('click',()=>commitTopic(index,true));
 });
 document.addEventListener('pointerdown',event=>{if(topicIsOpen()&&!topicSelect.contains(event.target))closeTopic();});
 document.addEventListener('focusin',event=>{if(topicIsOpen()&&!topicSelect.contains(event.target))closeTopic();});
 window.addEventListener('resize',()=>{if(topicIsOpen())placeTopicList();},{passive:true});
 window.addEventListener('scroll',()=>{if(topicIsOpen())placeTopicList();},{passive:true});
 topicInput.closest('form').addEventListener('reset',resetTopic);

 const form=$('#contact-form'),success=$('#form-success'),name=$('#customer-name'),phone=$('#customer-phone');
 function error(input,message){input.setAttribute('aria-invalid',String(Boolean(message)));$('#'+input.getAttribute('aria-describedby')).textContent=message;}
 form.addEventListener('submit',e=>{e.preventDefault();const digits=phone.value.replace(/\D/g,'');const nameOK=(name.value.match(/\p{L}/gu)||[]).length>=2;const phoneOK=/^\+?[\d\s()\-]+$/.test(phone.value.trim())&&/^[78]\d{10}$/.test(digits);error(name,nameOK?'':'Введите имя: не менее двух букв.');error(phone,phoneOK?'':'Введите 11 цифр российского номера, начиная с +7 или 8.');if(!nameOK){name.focus();return;}if(!phoneOK){phone.focus();return;}form.reset();form.hidden=true;success.hidden=false;success.focus({preventScroll:true});});
 $('.form-submit',form).disabled=false; // Enable only after the non-network submit handler exists.
 [name,phone].forEach(input=>input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true')error(input,'');}));
 $('#form-reset').addEventListener('click',()=>{success.hidden=true;form.hidden=false;form.reset();error(name,'');error(phone,'');name.focus({preventScroll:true});});
 // Scroll-driven object choreography. Native scrolling, no pinning or text hiding.
 function startMotion(){
  if(!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  motionContext=gsap.context(()=>{
   if(!playedIntro)gsap.from('.hero-prop',{y:90,scale:.65,rotation:(i)=>i%2?20:-20,duration:1.3,ease:'back.out(1.1)',stagger:.08});
   playedIntro=true;
   gsap.to('.hero-art',{y:-70,rotation:-5,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
   gsap.fromTo('.ribbon-track',{x:0},{x:()=>-$('.ribbon-group').offsetWidth,ease:'none',scrollTrigger:{trigger:'.ribbon-wrap',start:'top bottom',end:'bottom top',scrub:1,invalidateOnRefresh:true}});
   gsap.fromTo('.flavor-art>svg',{x:(i)=>[0,110,-110][i],y:(i)=>[45,-20,55][i],rotation:(i)=>[20,-25,25][i]},{x:0,y:0,rotation:0,ease:'none',scrollTrigger:{trigger:'.flavor-layout',start:'top bottom',end:'top 30%',scrub:1}});
   const gift=gsap.timeline({scrollTrigger:{trigger:'.gift-section',start:'top bottom',end:'center 45%',scrub:1}});
   gift.fromTo('.candy-a',{x:-110,y:-70,rotation:-55},{x:0,y:0,rotation:-8,ease:'none'},0).fromTo('.candy-b',{x:120,y:-110,rotation:60},{x:0,y:0,rotation:10,ease:'none'},0).fromTo('.candy-c',{y:-130,rotation:-35},{y:0,rotation:8,ease:'none'},0).fromTo('.gift-box',{y:90,rotation:12},{y:0,rotation:-8,ease:'none'},0).fromTo('.gift-lid',{y:0,rotation:0},{y:-220,rotation:-22,ease:'none'},0).fromTo('.gift-word',{scale:.7,rotation:-18},{scale:1,rotation:-10,ease:'none'},0);
   $$('.occasion-cards article').forEach((card,i)=>{gsap.fromTo($('.occasion-art',card),{y:65,rotation:(i-1)*28,scale:.75},{y:0,rotation:0,scale:1,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'center 65%',scrub:.8}});});
   gsap.fromTo('.box-decoration',{rotation:16,x:65},{rotation:-12,x:-25,ease:'none',scrollTrigger:{trigger:'.play-section',start:'top bottom',end:'center center',scrub:1}});
   gsap.fromTo('.faq-candy',{rotation:-40,y:60},{rotation:30,y:-15,ease:'none',scrollTrigger:{trigger:'.faq-section',start:'top bottom',end:'bottom top',scrub:1}});
   gsap.fromTo('.contact-candy',{scale:.6,rotation:-50},{scale:1.1,rotation:25,ease:'none',scrollTrigger:{trigger:'.contact-section',start:'top bottom',end:'center 50%',scrub:1}});
  });
  ScrollTrigger.refresh();
 }
 function applyMotionPreference(){
  const enabled=motionEnabled();
  document.documentElement.classList.toggle('system-reduced-motion',!enabled);
  clearConfetti();
  pointerResets.forEach(reset=>reset());
  if(motionContext){motionContext.revert();motionContext=null;}
  if(enabled)startMotion();
 }
 reduced.addEventListener('change',applyMotionPreference);
 fine.addEventListener('change',()=>pointerResets.forEach(reset=>reset()));
 applyMotionPreference();
 const refreshLayout=()=>{if(motionEnabled()&&window.ScrollTrigger)ScrollTrigger.refresh();};
 document.fonts.ready.then(refreshLayout);
 window.addEventListener('load',refreshLayout,{once:true});
 $$('.faq-list details').forEach(detail=>detail.addEventListener('toggle',refreshLayout));
 window.addEventListener('pageshow',e=>{if(e.persisted)applyMotionPreference();});
 window.addEventListener('pagehide',()=>{clearConfetti();pointerResets.forEach(reset=>reset());if(motionContext){motionContext.revert();motionContext=null;}});
})();
