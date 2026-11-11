(() => {
  'use strict';
  const stage=document.querySelector('#wash-stage'),canvas=document.querySelector('#wash-canvas');
  if(!stage||!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const game=stage.closest('.wash-play'),tools=[...game.querySelectorAll('[data-wash-tool]')];
  const status=document.querySelector('#wash-status'),percent=document.querySelector('#wash-percent'),stepLabel=document.querySelector('#wash-step-label');
  const meter=game.querySelector('.wash-meter'),bar=meter.firstElementChild,invite=document.querySelector('#wash-invite');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const W=1000,H=560,DPR=Math.min(devicePixelRatio||1,2);
  const makeLayer=()=>{const c=document.createElement('canvas');c.width=W*DPR;c.height=H*DPR;const c2=c.getContext('2d');c2.scale(DPR,DPR);return {canvas:c,ctx:c2};};
  const car=makeLayer(),dirt=makeLayer(),foam=makeLayer();
  const hit=document.createElement('canvas').getContext('2d');
  const body=new Path2D('M93 348Q93 316 125 306L251 281L351 192Q377 170 423 169L602 171Q632 171 657 190L759 271L865 295Q907 306 918 343L909 398L855 408Q850 337 787 338Q722 340 715 413L305 414Q301 340 239 340Q176 341 173 409L104 399Z');
  const silhouette=new Path2D(body);
  silhouette.moveTo(300,403);silhouette.arc(239,403,61,0,Math.PI*2);
  silhouette.moveTo(848,403);silhouette.arc(787,403,61,0,Math.PI*2);
  const isCar=(x,y)=>hit.isPointInPath(silhouette,x,y);
  let seed=1701;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const cells=[];
  // Sampling uses the exact same silhouette as the paint layers, including wheel arches.
  for(let y=170;y<467;y+=17)for(let x=95;x<920;x+=17)if(isCar(x,y))cells.push({x,y});
  const covered=new Uint8Array(cells.length),cleaned=new Uint8Array(cells.length);
  let foamCount=0,cleanCount=0,phase='foam',tool='foam',visible=false,active=false,hover=false,frame=0,lastTime=0;
  let aim={x:480,y:286},previous=null,view={scale:1,x:0,y:0,width:1,height:1},particles=[],lastPercent=-1;
  let pointerId=null,keyboard=false,shine=0,measured=null,announced=0;
  const radius=77;

  function drawWheel(c,x){
    const tire=c.createRadialGradient(x-15,382,8,x,403,63);tire.addColorStop(0,'#263b50');tire.addColorStop(.66,'#101d2a');tire.addColorStop(.85,'#25323e');tire.addColorStop(1,'#07131f');
    c.fillStyle=tire;c.beginPath();c.arc(x,403,61,0,Math.PI*2);c.fill();
    c.strokeStyle='#425568';c.lineWidth=1.7;c.beginPath();c.arc(x,403,54,0,Math.PI*2);c.stroke();
    const rim=c.createLinearGradient(x-40,365,x+35,442);rim.addColorStop(0,'#f1f8ff');rim.addColorStop(.42,'#9db7ca');rim.addColorStop(1,'#506c85');c.fillStyle=rim;c.beginPath();c.arc(x,403,40,0,Math.PI*2);c.fill();
    c.fillStyle='#142c41';c.beginPath();c.arc(x,403,33,0,Math.PI*2);c.fill();
    c.save();c.translate(x,403);
    for(let i=0;i<10;i++){c.rotate(Math.PI/5);c.beginPath();c.moveTo(-4,11);c.lineTo(-6,34);c.lineTo(1,38);c.lineTo(6,13);c.closePath();c.fillStyle=i%2?'#b9cedd':'#e3f0fa';c.fill();}
    c.fillStyle='#9fbaca';c.beginPath();c.arc(0,0,11,0,Math.PI*2);c.fill();c.strokeStyle='#e5f4ff';c.lineWidth=2;c.stroke();c.restore();
  }
  function drawCar(){
    const c=car.ctx;c.clearRect(0,0,W,H);
    c.save();c.translate(510,453);c.scale(1,.11);const shadow=c.createRadialGradient(0,0,0,0,0,400);shadow.addColorStop(0,'#1039604a');shadow.addColorStop(1,'#10396000');c.fillStyle=shadow;c.beginPath();c.arc(0,0,400,0,Math.PI*2);c.fill();c.restore();
    drawWheel(c,239);drawWheel(c,787);
    const paint=c.createLinearGradient(0,166,0,420);paint.addColorStop(0,'#fff');paint.addColorStop(.25,'#d7edfb');paint.addColorStop(.47,'#7aa7cf');paint.addColorStop(.55,'#bedcef');paint.addColorStop(.75,'#6093bf');paint.addColorStop(1,'#294e71');
    c.fillStyle=paint;c.fill(body);c.strokeStyle='#7b9eb9';c.lineWidth=1.5;c.stroke(body);
    const glass=c.createLinearGradient(400,190,550,276);glass.addColorStop(0,'#395c7d');glass.addColorStop(.5,'#102c48');glass.addColorStop(1,'#527fa5');
    const windowPath=new Path2D('M291 277L367 207Q387 187 424 187L596 189Q621 189 641 205L713 270Z');c.fillStyle=glass;c.fill(windowPath);c.strokeStyle='#e2f0f9';c.lineWidth=4;c.stroke(windowPath);
    c.strokeStyle='#8faec7';c.lineWidth=9;c.beginPath();c.moveTo(490,189);c.lineTo(487,273);c.moveTo(620,196);c.lineTo(647,272);c.stroke();
    c.save();c.clip(windowPath);c.fillStyle='#ffffff13';c.beginPath();c.moveTo(324,258);c.lineTo(531,185);c.lineTo(585,185);c.lineTo(393,275);c.closePath();c.fill();c.restore();
    c.strokeStyle='#416d92';c.lineWidth=2;c.beginPath();c.moveTo(354,284);c.quadraticCurveTo(329,343,348,396);c.lineTo(483,398);c.lineTo(486,282);c.moveTo(491,398);c.lineTo(665,397);c.quadraticCurveTo(684,348,675,284);c.stroke();
    c.strokeStyle='#ddf0ffb0';c.lineWidth=2;c.beginPath();c.moveTo(120,335);c.quadraticCurveTo(500,286,877,323);c.stroke();
    c.strokeStyle='#234c71';c.lineWidth=4;c.beginPath();c.moveTo(414,294);c.lineTo(447,293);c.moveTo(587,292);c.lineTo(620,292);c.stroke();
    c.strokeStyle='#e7f6ff';c.lineWidth=1.2;c.beginPath();c.moveTo(414,291);c.lineTo(447,290);c.moveTo(587,289);c.lineTo(620,289);c.stroke();
    c.fillStyle='#102d46';c.beginPath();c.moveTo(126,366);c.lineTo(182,357);c.lineTo(167,383);c.lineTo(112,383);c.closePath();c.fill();
    c.fillStyle='#e6fbff';c.beginPath();c.moveTo(110,326);c.lineTo(204,313);c.lineTo(190,332);c.lineTo(104,345);c.closePath();c.fill();c.strokeStyle='#91e7ff';c.lineWidth=3;c.beginPath();c.moveTo(112,329);c.lineTo(196,317);c.stroke();
    c.fillStyle='#e04950';c.beginPath();c.moveTo(872,312);c.lineTo(904,324);c.lineTo(909,346);c.lineTo(872,335);c.closePath();c.fill();
    c.fillStyle='#37688f';c.beginPath();c.ellipse(332,277,27,12,-.15,0,Math.PI*2);c.fill();c.strokeStyle='#d7efff';c.lineWidth=2;c.stroke();
    c.strokeStyle='#d5eaf7';c.lineWidth=3;c.beginPath();c.moveTo(321,411);c.lineTo(699,411);c.stroke();
    c.fillStyle='#132d43';c.fillRect(118,389,45,5);c.fillRect(864,387,38,5);
  }
  function resetLayers(){
    dirt.ctx.clearRect(0,0,W,H);foam.ctx.clearRect(0,0,W,H);seed=1701;
    const c=dirt.ctx;c.save();c.clip(silhouette);
    const dust=c.createLinearGradient(0,180,0,450);dust.addColorStop(0,'#86796250');dust.addColorStop(.6,'#73624e80');dust.addColorStop(1,'#4f4b409c');c.fillStyle=dust;c.fillRect(60,140,900,340);
    for(let i=0;i<650;i++){const x=80+random()*860,y=170+random()*300,r=1+random()*5;c.beginPath();c.ellipse(x,y,r,r*.55,random(),0,Math.PI*2);c.fillStyle=i%3?'#4a443536':'#dcc19a42';c.fill();}
    for(let i=0;i<29;i++){const x=150+random()*700,y=220+random()*190;c.strokeStyle='#61564735';c.lineWidth=2+random()*5;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+18,y+20,x+8,y+45);c.stroke();}
    c.restore();
  }
  function emit(x,y,amount=3){
    if(reduce.matches)return;
    for(let i=0;i<amount&&particles.length<96;i++){
      const drip=random()<.35;
      particles.push({x:x+(random()-.5)*radius,y:y+(random()-.5)*35,vx:(random()-.5)*(drip?15:130),vy:drip?55+random()*50:-35-random()*110,life:drip?1.6:.7+random()*.7,size:tool==='foam'?3+random()*6:1.5+random()*2.5,foam:tool==='foam',drip});
    }
  }
  function stamp(x,y){
    if((phase!=='foam'&&phase!=='rinse')||!isCar(x,y))return;
    const c=tool==='foam'?foam.ctx:dirt.ctx;
    c.save();c.clip(silhouette);
    if(tool==='foam'){
      const cloud=c.createRadialGradient(x,y,0,x,y,radius);cloud.addColorStop(0,'#fffffff2');cloud.addColorStop(.74,'#f2fcfff0');cloud.addColorStop(1,'#e0f4ff00');c.fillStyle=cloud;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();
      for(let i=0;i<9;i++){const a=random()*Math.PI*2,r=random()*radius*.8;c.beginPath();c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,2+random()*7,0,Math.PI*2);c.fillStyle='#fff9';c.fill();c.strokeStyle='#9bc4df50';c.lineWidth=.8;c.stroke();}
    }else{
      [dirt.ctx,foam.ctx].forEach(layer=>{layer.save();layer.globalCompositeOperation='destination-out';const clear=layer.createRadialGradient(x,y,radius*.7,x,y,radius);clear.addColorStop(0,'#000');clear.addColorStop(1,'#0000');layer.fillStyle=clear;layer.beginPath();layer.arc(x,y,radius,0,Math.PI*2);layer.fill();layer.restore();});
    }
    c.restore();
    const state=tool==='foam'?covered:cleaned;
    for(let i=0;i<cells.length;i++)if(!state[i]&&Math.hypot(cells[i].x-x,cells[i].y-y)<radius*.76){state[i]=1;if(tool==='foam')foamCount++;else cleanCount++;}
    emit(x,y,2);updateProgress();
  }
  function stroke(from,to){
    const distance=Math.hypot(to.x-from.x,to.y-from.y),steps=Math.max(1,Math.ceil(distance/18));
    for(let i=1;i<=steps;i++)stamp(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps);
    request();
  }
  function updateProgress(){
    const count=phase==='rinse'||phase==='complete'?cleanCount:foamCount;
    let n=Math.min(100,Math.round(count/cells.length*100/.94));
    if(phase==='foam'&&n>=100){
      phase='foam-ready';covered.fill(1);foamCount=cells.length;tools[0].disabled=true;tools[1].disabled=false;
      foam.ctx.save();foam.ctx.clip(silhouette);foam.ctx.fillStyle='#f4fcff70';foam.ctx.fillRect(0,0,W,H);foam.ctx.restore();
      status.textContent='Пена на месте. Включите воду — начинается самое приятное.';invite.classList.add('is-hidden');
    }else if(phase==='rinse'&&n>=100){
      phase='complete';cleanCount=cells.length;cleaned.fill(1);dirt.ctx.clearRect(0,0,W,H);foam.ctx.clearRect(0,0,W,H);tools.forEach(button=>button.disabled=true);active=false;shine=reduce.matches?1:0;
      status.textContent='Чистый кайф! Всё лишнее смыто, можно снова в город.';stepLabel.textContent='автомобиль сияет';
    }
    game.dataset.phase=phase;
    if(n!==lastPercent){lastPercent=n;percent.textContent=`${n}%`;bar.style.width=`${n}%`;meter.setAttribute('aria-valuenow',String(n));}
    const milestone=Math.floor(n/25);
    if(n<100&&milestone>announced){announced=milestone;status.textContent=tool==='foam'?`${milestone*25}% автомобиля уже в мягкой пене.`:`${milestone*25}% автомобиля снова сияет.`;}
  }
  function drawNozzle(c,time){
    if(!hover&&!active&&!keyboard)return;
    const nozzle={x:aim.x+78,y:aim.y+83};
    c.strokeStyle='#316ec0';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(1020,600);c.bezierCurveTo(760,590,nozzle.x+160,nozzle.y+160,nozzle.x+25,nozzle.y+28);c.stroke();c.strokeStyle='#7fb4ee';c.lineWidth=2;c.stroke();
    if(active&&phase!=='complete'){
      const flow=c.createLinearGradient(aim.x,aim.y,nozzle.x,nozzle.y);flow.addColorStop(0,tool==='foam'?'#fff8':'#b8eaff88');flow.addColorStop(1,'#fff');c.fillStyle=flow;c.beginPath();c.moveTo(nozzle.x-7,nozzle.y-9);c.lineTo(aim.x-radius*.4,aim.y+radius*.3);c.quadraticCurveTo(aim.x,aim.y+5,aim.x+radius*.4,aim.y-radius*.3);c.closePath();c.fill();
      for(let i=0;i<6;i++){const wave=reduce.matches?0:Math.sin(time*.02+i)*4;c.strokeStyle=tool==='foam'?'#ffffffbd':'#d7f7ffcd';c.lineWidth=i%2?1.5:3;c.beginPath();c.moveTo(nozzle.x-4,nozzle.y-6);c.quadraticCurveTo(aim.x+40+wave,aim.y+30,aim.x+(i-2.5)*9,aim.y-(i-2.5)*6);c.stroke();}
    }
    c.save();c.translate(nozzle.x,nozzle.y);c.rotate(-.74);c.fillStyle='#153b68';c.fillRect(-10,-23,20,36);c.fillStyle='#2f7dce';c.fillRect(-8,2,16,32);c.fillStyle='#0a2448';c.fillRect(-14,-28,28,9);c.strokeStyle='#b7dbfc';c.lineWidth=2;c.strokeRect(-10,-23,20,36);c.restore();
    c.strokeStyle=tool==='foam'?'#165dff66':'#4e9dd699';c.lineWidth=1.5;c.beginPath();c.arc(aim.x,aim.y,active?radius*.6:19,0,Math.PI*2);c.stroke();
  }
  function paint(time){
    frame=0;if(document.hidden||!visible)return;
    const dt=lastTime?Math.min((time-lastTime)/1000,.035):.016;lastTime=time;
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,view.width,view.height);ctx.translate(view.x,view.y);ctx.scale(view.scale,view.scale);
    // Wet floor and reflection remain geometric; no imported pictures or textures.
    const floor=ctx.createLinearGradient(0,405,0,545);floor.addColorStop(0,'#b7d6ef00');floor.addColorStop(.35,'#aacce72e');floor.addColorStop(1,'#cde7f600');ctx.fillStyle=floor;ctx.fillRect(0,405,W,145);
    ctx.strokeStyle='#a4cbe63b';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(515,468+i*13,340+i*27,12+i*5,0,0,Math.PI*2);ctx.stroke();}
    ctx.drawImage(car.canvas,0,0,W,H);ctx.drawImage(dirt.canvas,0,0,W,H);ctx.drawImage(foam.canvas,0,0,W,H);
    if(phase==='complete'){
      shine=reduce.matches?1:Math.min(1,shine+dt*.9);ctx.save();ctx.clip(body);const x=100+shine*900;const gleam=ctx.createLinearGradient(x-65,0,x+65,0);gleam.addColorStop(0,'#fff0');gleam.addColorStop(.5,'#ffffffe0');gleam.addColorStop(1,'#fff0');ctx.fillStyle=gleam;ctx.transform(1,0,-.3,1,0,0);ctx.fillRect(x-65,150,130,290);ctx.restore();
    }
    if(!reduce.matches){
      particles=particles.filter(p=>p.life>0);
      for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.foam?55:250)*dt;p.life-=dt;ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.foam?'#f7fdff':'#77c9f4';ctx.strokeStyle=p.foam?'#aacfe4a0':'#dff9ff';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,p.size,p.size*(p.drip?2.6:p.foam?1.35:2.8),-.15,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.globalAlpha=1;
      if(active&&isCar(aim.x,aim.y))emit(aim.x,aim.y,1);
    }else particles=[];
    drawNozzle(ctx,time);
    if((active&&!reduce.matches)||particles.length||(phase==='complete'&&shine<1&&!reduce.matches))request();else lastTime=0;
  }
  function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(paint);}
  function resize(){const box=stage.getBoundingClientRect();measured=box;view.width=box.width;view.height=box.height;view.scale=Math.min(box.width/W,box.height/H);view.x=(box.width-W*view.scale)/2;view.y=(box.height-H*view.scale)/2;canvas.width=Math.round(box.width*DPR);canvas.height=Math.round(box.height*DPR);request();}
  function point(event){const box=measured||(measured=stage.getBoundingClientRect());return {x:(event.clientX-box.left-view.x)/view.scale,y:(event.clientY-box.top-view.y)/view.scale};}
  function stop(event){
    if(event&&(pointerId===null||event.pointerId!==pointerId))return;
    active=false;previous=null;pointerId=null;keyboard=false;request();
  }
  stage.addEventListener('pointerenter',event=>{measured=stage.getBoundingClientRect();hover=event.pointerType!=='touch';aim=point(event);request();});
  stage.addEventListener('pointerdown',event=>{
    if(pointerId!==null||event.button!==0)return;
    measured=stage.getBoundingClientRect();pointerId=event.pointerId;stage.setPointerCapture(pointerId);stage.focus({preventScroll:true});keyboard=false;active=phase==='foam'||phase==='rinse';hover=true;aim=point(event);previous=aim;invite.classList.add('is-hidden');if(active)stamp(aim.x,aim.y);request();
  });
  stage.addEventListener('pointermove',event=>{
    if(pointerId!==null&&pointerId!==event.pointerId)return;
    const next=point(event);if(active&&previous)stroke(previous,next);aim=next;previous=active?next:null;hover=true;request();
  },{passive:true});
  stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);stage.addEventListener('lostpointercapture',stop);
  stage.addEventListener('pointerleave',()=>{hover=false;if(pointerId===null)previous=null;request();});
  stage.addEventListener('focus',()=>{keyboard=true;hover=true;request();});
  stage.addEventListener('blur',()=>{hover=false;stop();});
  stage.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();keyboard=true;hover=true;const next={...aim};if(event.key==='ArrowLeft')next.x-=36;if(event.key==='ArrowRight')next.x+=36;if(event.key==='ArrowUp')next.y-=36;if(event.key==='ArrowDown')next.y+=36;next.x=Math.max(80,Math.min(925,next.x));next.y=Math.max(150,Math.min(465,next.y));if(active)stroke(aim,next);aim=next;request();
    }else if(event.key===' '||event.key==='Enter'){
      event.preventDefault();keyboard=true;hover=true;active=phase==='foam'||phase==='rinse';if(active)stamp(aim.x,aim.y);invite.classList.add('is-hidden');request();
    }
  });
  stage.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();active=false;request();}});
  [...tools,document.querySelector('#wash-reset')].forEach(button=>button.addEventListener('pointerdown',event=>{
    if(button.disabled||event.button!==0)return;
    event.preventDefault();button.focus({preventScroll:true});
  }));
  tools.forEach(button=>button.addEventListener('click',()=>{
    if(button.disabled)return;
    button.focus({preventScroll:true});
    tool=button.dataset.washTool;
    if(tool==='water'&&phase==='foam-ready'){phase='rinse';announced=0;game.dataset.phase=phase;stepLabel.textContent='смыто водой';meter.setAttribute('aria-label','Автомобиль очищен');status.textContent='Смывайте пену. Чистый кузов уже под ней.';lastPercent=-1;updateProgress();}
    tools.forEach(item=>{const on=item===button;item.classList.toggle('is-active',on);item.setAttribute('aria-pressed',String(on));});request();
  }));
  document.querySelector('#wash-reset').addEventListener('click',()=>{
    document.querySelector('#wash-reset').focus({preventScroll:true});
    phase='foam';tool='foam';foamCount=0;cleanCount=0;covered.fill(0);cleaned.fill(0);particles=[];lastPercent=-1;shine=0;announced=0;stop();aim={x:480,y:286};hover=false;
    resetLayers();tools[0].disabled=false;tools[1].disabled=true;tools.forEach(button=>{const on=button.dataset.washTool==='foam';button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));});
    stepLabel.textContent='покрыто пеной';meter.setAttribute('aria-label','Покрытие пеной');status.textContent='Начните с пены. Пусть дорога подождёт.';invite.classList.remove('is-hidden');updateProgress();request();
  });
  const pause=()=>{cancelAnimationFrame(frame);frame=0;lastTime=0;active=false;previous=null;pointerId=null;keyboard=false;particles=[];};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){resize();request();}else pause();},{rootMargin:'40px'});observer.observe(stage);
  new ResizeObserver(resize).observe(stage);
  window.addEventListener('scroll',()=>{measured=null;},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else{resize();request();}});
  window.addEventListener('pagehide',pause);window.addEventListener('pageshow',()=>{resize();request();});
  reduce.addEventListener('change',()=>{particles=[];if(reduce.matches)shine=1;request();});
  drawCar();resetLayers();updateProgress();stage.classList.add('is-ready');resize();
})();
