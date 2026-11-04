/* A small, dependency-free pottery lathe. The profile is real geometry, not a video. */
(() => {
  const canvas = document.querySelector('#clay-canvas');
  if (!canvas) return;
  const station = canvas.closest('.clay-station');
  const feedback = document.querySelector('#clay-feedback');
  const sliders = [...document.querySelectorAll('[data-clay-level]')];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const rows = 42;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const sides = coarsePointer ? 48 : 64;
  const frameInterval = coarsePointer ? 40 : 30;
  const height = 260;
  const pitch = .19;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const shapes = {
    vase: [[0,64],[.08,70],[.25,91],[.45,99],[.62,90],[.78,59],[.91,45],[1,52]],
    round: [[0,62],[.12,88],[.32,111],[.48,115],[.65,103],[.8,68],[.9,42],[1,44]],
    wave: [[0,68],[.12,66],[.28,87],[.43,72],[.58,103],[.72,70],[.85,56],[1,78]],
  };
  const glazes = {
    raw: { rgb:[183,127,87], name:'Тёплая глина', shine:.14 },
    cream: { rgb:[220,210,181], name:'Молочная глазурь', shine:.26 },
    sage: { rgb:[121,141,99], name:'Шалфейная глазурь', shine:.3 },
  };
  let selectedShape = 'vase', selectedColor = 'raw';
  let profile = [], angle = .5, geometryDirty = false, repaint = 0, guideTimer = 0;
  let playing = !motionQuery.matches, visible = false, raf = 0, previousTime = 0;
  let width = 400, viewHeight = 440, scale = 1, originX = 200, originY = 345;
  let pointer = null, selectedLevel = .55, guideUntil = 0, changed = false;

  const vaseRenderer = ctx ? createVaseRenderer() : null;

  function radiusAt(t) {
    const position = clamp(t,0,1) * rows;
    const lower = Math.floor(position), upper = Math.min(rows,lower + 1);
    return profile[lower] + (profile[upper] - profile[lower]) * (position - lower);
  }
  function preset(name) {
    selectedShape = name;
    const points = shapes[name];
    profile = Array.from({length:rows+1}, (_, row) => {
      const t = row/rows;
      let segment = 0;
      while(segment < points.length-2 && points[segment+1][0] < t) segment++;
      const [a,ra] = points[segment], [b,rb] = points[segment+1];
      const blend = (1-Math.cos(Math.PI * (t-a)/(b-a))) / 2;
      return ra + (rb-ra)*blend;
    });
    document.querySelectorAll('[data-clay-shape]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.clayShape===name)));
    syncSliders(); rebuild(); draw();
  }
  function syncSliders() {
    sliders.forEach(input => { input.value = String(Math.round(radiusAt(Number(input.dataset.clayLevel)))); });
  }
  function setShape(t, delta, spread = .115) {
    profile = profile.map((radius,row) => {
      const influence = Math.exp(-Math.pow((row/rows - t)/spread,2)/2);
      return clamp(radius + delta*influence, 27, 126);
    });
    // Keep the base stable, then gently smooth sharp pointer changes.
    profile[0] = clamp(profile[0],38,107);
    const copy = [...profile];
    for (let row=1;row<rows;row++) profile[row] = copy[row]*.8 + (copy[row-1]+copy[row+1])*.1;
    changed = true; station.classList.add('sculpted');
    document.querySelectorAll('[data-clay-shape]').forEach(button => button.setAttribute('aria-pressed','false'));
    syncSliders(); geometryDirty = true; requestDraw();
  }
  function requestDraw() {
    if(playing && visible && !document.hidden && ctx)return;
    if(!repaint)repaint=requestAnimationFrame(()=>{repaint=0;draw();});
  }
  function showGuide(duration) {
    guideUntil=performance.now()+duration;
    clearTimeout(guideTimer);
    guideTimer=setTimeout(()=>{guideUntil=0;requestDraw();},duration);
  }
  // Catmull-Rom interpolation keeps the silhouette and its derivative continuous.
  function smoothRadius(t) {
    const q=clamp(t,0,1)*rows, i=Math.floor(q), f=q-i;
    const p0=profile[Math.max(0,i-1)],p1=profile[Math.min(rows,i)];
    const p2=profile[Math.min(rows,i+1)],p3=profile[Math.min(rows,i+2)];
    return clamp(.5*((2*p1)+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f),26,127);
  }
  function rebuild() {
    geometryDirty=false;
    if(vaseRenderer)vaseRenderer.update();
  }
  function project(x,y,z) { return [originX+x*scale,originY+(-y*cp+z*sp)*scale,y*sp+z*cp]; }
  function color(light, shine=0) {
    const {rgb}=glazes[selectedColor];
    return `rgb(${rgb.map(channel => Math.round(clamp(channel*light+shine,0,255))).join(',')})`;
  }
  // WebGL interpolates vertex normals per pixel. No flat quad fills or CPU painter sorting.
  function createVaseRenderer() {
    const surface=document.createElement('canvas');
    const gl=surface.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power',preserveDrawingBuffer:false});
    if(!gl)return null;
    const vertexSource=`
      attribute vec3 aPosition; attribute vec3 aNormal; attribute float aMaterial;
      uniform vec2 uSize; uniform vec2 uOrigin; uniform float uScale; uniform float uAngle;
      varying vec3 vNormal; varying vec3 vModel; varying float vMaterial;
      void main(){
        float c=cos(uAngle),s=sin(uAngle);
        vec3 p=vec3(aPosition.x*c+aPosition.z*s,aPosition.y,-aPosition.x*s+aPosition.z*c);
        vNormal=vec3(aNormal.x*c+aNormal.z*s,aNormal.y,-aNormal.x*s+aNormal.z*c);
        vModel=aPosition;vMaterial=aMaterial;
        vec2 pixel=uOrigin+vec2(p.x,-p.y*0.982004+p.z*0.188859)*uScale;
        float depth=p.y*0.188859+p.z*0.982004;
        gl_Position=vec4(pixel.x/uSize.x*2.0-1.0,1.0-pixel.y/uSize.y*2.0,-depth/600.0,1.0);
      }`;
    const fragmentSource=`
      precision mediump float;
      uniform vec3 uColor; uniform float uShine;
      varying vec3 vNormal; varying vec3 vModel; varying float vMaterial;
      float grain(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*437.5854);}
      void main(){
        vec3 n=normalize(vNormal);
        float rings=sin(vModel.y*2.3+sin(vModel.x*.035)*.5);
        n=normalize(n+vec3(0.0,rings*.016,0.0));
        vec3 light=normalize(vec3(-.65,.85,.85)),view=normalize(vec3(0.0,.188859,.982004));
        float key=max(dot(n,light),0.0),fill=max(dot(n,normalize(vec3(.7,.3,-.4))),0.0);
        float spec=pow(max(dot(n,normalize(light+view)),0.0),36.0)*uShine;
        float edge=pow(1.0-max(dot(n,view),0.0),3.0)*.055;
        float texture=(grain(vModel*3.7)-.5)*.026+rings*.006;
        float occlusion=mix(.88,1.0,smoothstep(0.0,48.0,vModel.y));
        vec3 lit=uColor*(.48+key*.58+fill*.12+texture)*occlusion+vec3(spec*.65+edge);
        if(vMaterial>.5 && vMaterial<1.5)lit*=.55;
        if(vMaterial>1.5)lit*=1.06;
        gl_FragColor=vec4(lit,1.0);
      }`;
    function shader(type,source){
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;
    }
    const vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
    if(!vs||!fs)return null;
    const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
    const vertexBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer();let count=0,lost=false;
    const attributes=['aPosition','aNormal','aMaterial'].map(name=>gl.getAttribLocation(program,name));
    const uniform=Object.fromEntries(['uSize','uOrigin','uScale','uAngle','uColor','uShine'].map(name=>[name,gl.getUniformLocation(program,name)]));
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
    surface.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;requestDraw();});
    // The visible canvas keeps a complete smooth 2D fallback if the context disappears.
    function update(){
      if(lost)return;
      const vertices=[],indices=[],segments=96;
      function point(x,y,z,nx,ny,nz,material){vertices.push(x,y,z,nx,ny,nz,material);return vertices.length/7-1;}
      function quad(a,b,c,d){indices.push(a,b,c,a,c,d);}
      for(let row=0;row<=segments;row++){
        const t=row/segments,r=smoothRadius(t),delta=.002;
        const slope=(smoothRadius(Math.min(1,t+delta))-smoothRadius(Math.max(0,t-delta)))/(height*(Math.min(1,t+delta)-Math.max(0,t-delta)));
        for(let side=0;side<=sides;side++){
          const theta=side/sides*Math.PI*2,c=Math.cos(theta),s=Math.sin(theta);
          const irregular=1+.004*Math.sin(theta*3+t*2)+.002*Math.cos(theta*7-t*5);
          point(c*r*irregular,t*height,s*r*irregular,c,-slope,s,0);
        }
      }
      for(let row=0;row<segments;row++)for(let side=0;side<sides;side++){
        const a=row*(sides+1)+side;quad(a,a+1,a+sides+2,a+sides+1);
      }
      const rim=smoothRadius(1),inner=Math.max(16,rim-5.5),rimStart=vertices.length/7;
      for(let row=0;row<2;row++)for(let side=0;side<=sides;side++){
        const theta=side/sides*Math.PI*2,r=row?inner:rim;
        point(Math.cos(theta)*r,height,Math.sin(theta)*r,0,1,0,2);
      }
      for(let side=0;side<sides;side++){const a=rimStart+side;quad(a,a+1,a+sides+2,a+sides+1);}
      const innerStart=vertices.length/7,depth=38,innerRows=8;
      for(let row=0;row<=innerRows;row++)for(let side=0;side<=sides;side++){
        const t=row/innerRows,theta=side/sides*Math.PI*2,r=inner*(1-.13*t);
        point(Math.cos(theta)*r,height-depth*t,Math.sin(theta)*r,-Math.cos(theta),-.15,-Math.sin(theta),1);
      }
      for(let row=0;row<innerRows;row++)for(let side=0;side<sides;side++){
        const a=innerStart+row*(sides+1)+side;quad(a,a+1,a+sides+2,a+sides+1);
      }
      const floor=point(0,height-depth,0,0,1,0,1),last=innerStart+innerRows*(sides+1);
      for(let side=0;side<sides;side++)indices.push(floor,last+side,last+side+1);
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
      count=indices.length;
    }
    function render(){
      if(lost||gl.isContextLost())return false;
      if(surface.width!==canvas.width||surface.height!==canvas.height){surface.width=canvas.width;surface.height=canvas.height;}
      gl.viewport(0,0,surface.width,surface.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
      attributes.forEach((attribute,index)=>{gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,index===2?1:3,gl.FLOAT,false,28,index===0?0:index===1?12:24);});
      gl.uniform2f(uniform.uSize,width,viewHeight);gl.uniform2f(uniform.uOrigin,originX,originY);gl.uniform1f(uniform.uScale,scale);gl.uniform1f(uniform.uAngle,angle);
      gl.uniform3f(uniform.uColor,...glazes[selectedColor].rgb.map(channel=>channel/255));gl.uniform1f(uniform.uShine,glazes[selectedColor].shine);
      gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);ctx.drawImage(surface,0,0,width,viewHeight);return true;
    }
    return {update,render};
  }
  function drawSmoothFallback(){
    // A continuous silhouette clipped to a soft gradient avoids a faceted fallback.
    const outline=new Path2D(),samples=120;
    for(let row=0;row<=samples;row++){
      const t=row/samples,r=smoothRadius(t),p=project(-r,t*height,0);
      if(!row)outline.moveTo(p[0],p[1]);else outline.lineTo(p[0],p[1]);
    }
    for(let row=samples;row>=0;row--){const t=row/samples,p=project(smoothRadius(t),t*height,0);outline.lineTo(p[0],p[1]);}
    outline.closePath();ctx.save();ctx.clip(outline);
    const shading=ctx.createLinearGradient(originX-130*scale,0,originX+130*scale,0);
    [[0,.56],[.24,.98],[.43,1.12],[.63,.99],[.83,.72],[1,.48]].forEach(([stop,value])=>shading.addColorStop(stop,color(value)));
    ctx.fillStyle=shading;ctx.fillRect(0,0,width,viewHeight);
    for(let row=1;row<90;row++){
      const t=row/90,r=smoothRadius(t),p=project(0,t*height,0);
      ctx.strokeStyle=row%2?'#ffffff09':'#432a180a';ctx.lineWidth=.65;
      ctx.beginPath();ctx.ellipse(originX,p[1],r*scale,r*sp*scale,0,0,Math.PI);ctx.stroke();
    }
    // Flecks travel around the smooth body as the wheel rotates.
    ctx.fillStyle='#402a1b24';
    for(let n=0;n<70;n++){
      const t=.05+((n*.6180339)%1)*.9,theta=n*2.39996-angle;
      if(Math.sin(theta)<.25)continue;
      const r=smoothRadius(t),p=project(Math.cos(theta)*r,t*height,Math.sin(theta)*r);
      ctx.beginPath();ctx.ellipse(p[0],p[1],.55*scale,.5*scale,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    const rim=smoothRadius(1),top=project(0,height,0);
    ctx.beginPath();ctx.ellipse(originX,top[1],rim*scale,rim*sp*scale,0,0,Math.PI*2);ctx.fillStyle=color(.46);ctx.fill();
    ctx.strokeStyle=color(1.09);ctx.lineWidth=5.5*scale;ctx.stroke();
  }
  function draw() {
    if(!ctx){
      const silhouette=document.querySelector('.clay-render-fallback svg path');
      if(silhouette && profile.length){
        const left=profile.map((r,row)=>`${110-r*.79},${280-row/rows*260}`).reverse();
        const right=profile.map((r,row)=>`${110+r*.79},${280-row/rows*260}`);
        silhouette.setAttribute('d',`M${left.join('L')}L${right.join('L')}Z`);
        silhouette.setAttribute('fill',`rgb(${glazes[selectedColor].rgb.join(',')})`);
      }
      return;
    }
    if(geometryDirty)rebuild();
    ctx.clearRect(0,0,width,viewHeight);
    const floorY=originY+15*scale;
    const shadow=ctx.createRadialGradient(originX,floorY,15*scale,originX,floorY,150*scale);
    shadow.addColorStop(0,'#5d452e32');shadow.addColorStop(.6,'#6b51351a');shadow.addColorStop(1,'#6b513500');
    ctx.save();ctx.translate(0,floorY);ctx.scale(1,.24);ctx.translate(0,-floorY);ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(originX,floorY,150*scale,0,Math.PI*2);ctx.fill();ctx.restore();
    // Wheel and rotating throwing marks anchor the clay to a physical surface.
    ctx.fillStyle='#b9baa8';ctx.beginPath();ctx.ellipse(originX,originY+10*scale,133*scale,28*scale,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#d7d7c5';ctx.beginPath();ctx.ellipse(originX,originY+4*scale,133*scale,27*scale,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#b5b79e';ctx.lineWidth=.8;
    [101,115,126].forEach(radius=>{ctx.beginPath();ctx.ellipse(originX,originY+3*scale,radius*scale,radius*.19*scale,0,0,Math.PI*2);ctx.stroke();});
    for(let n=0;n<8;n++){
      const theta=angle+n*Math.PI/4;const a=project(Math.cos(theta)*115,-4,Math.sin(theta)*115);const b=project(Math.cos(theta)*125,-4,Math.sin(theta)*125);
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    }
    if(!vaseRenderer || !vaseRenderer.render())drawSmoothFallback();
    if(pointer || performance.now()<guideUntil){
      const radius=radiusAt(selectedLevel), y=selectedLevel*height;
      const left=project(-radius,y,0),right=project(radius,y,0);
      ctx.save();ctx.strokeStyle='#fef9e4b3';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(originX,(left[1]+right[1])/2,radius*scale,radius*sp*scale,0,0,Math.PI);ctx.stroke();ctx.setLineDash([]);
      [left,right].forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],5,0,Math.PI*2);ctx.fillStyle='#fff9e8';ctx.fill();ctx.strokeStyle='#a97045';ctx.stroke();});
      ctx.restore();
    }
  }
  function frame(time) {
    raf=0;
    if(!visible || document.hidden || !playing || !ctx)return;
    if(!previousTime)previousTime=time;
    const delta=Math.min((time-previousTime)/1000,.06);
    if(time-previousTime>=frameInterval){angle+=delta*.48;previousTime=time;draw();}
    raf=requestAnimationFrame(frame);
  }
  function animate() {
    cancelAnimationFrame(raf);raf=0;previousTime=0;
    if(visible && !document.hidden && playing && ctx)raf=requestAnimationFrame(frame);
    else draw();
  }

  function resize() {
    const box=canvas.getBoundingClientRect();width=box.width;viewHeight=box.height;
    if(!width || !viewHeight)return;
    const dpr=Math.min(window.devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(viewHeight*dpr);
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
    scale=Math.min(width/420,viewHeight/440)*1.12;
    originX=width*.5;originY=viewHeight*.84;
    draw();
  }
  function point(event) {
    const box=canvas.getBoundingClientRect();return {x:event.clientX-box.left,y:event.clientY-box.top};
  }
  canvas.addEventListener('pointerdown',event=>{
    if(pointer || event.isPrimary===false || event.button!==0 || !ctx)return;
    const p=point(event), level=clamp((originY-p.y)/(height*scale*cp),0,1);
    if(p.y<originY-height*scale*cp-20 || p.y>originY+20 || Math.abs(p.x-originX)>radiusAt(level)*scale+35)return;
    event.preventDefault();canvas.dataset.focusMode="pointer";canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);
    selectedLevel=level;pointer={id:event.pointerId,x:p.x,side:p.x<originX?-1:1};
    station.classList.add('sculpted');draw();
  });
  canvas.addEventListener('pointermove',event=>{
    if(!pointer || event.pointerId!==pointer.id)return;
    event.preventDefault();const p=point(event);
    const delta=(p.x-pointer.x)*pointer.side/scale;
    selectedLevel=clamp((originY-p.y)/(height*scale*cp),0,1);
    pointer.x=p.x;setShape(selectedLevel,clamp(delta,-14,14));
  });
  function finishPointer(event) {
    if(!pointer || event.pointerId!==pointer.id)return;
    if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
    pointer=null;showGuide(800);
    if(changed)feedback.textContent='Вот теперь это ваша форма. Можно обсудить эту идею с мастерской.';
    draw();
  }
  canvas.addEventListener('pointerup',finishPointer);canvas.addEventListener('pointercancel',finishPointer);
  canvas.addEventListener('lostpointercapture',()=>{pointer=null;draw();});
  canvas.addEventListener('keydown',event=>{
    canvas.dataset.focusMode='keyboard';
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();showGuide(1800);
    if(event.key==='ArrowUp')selectedLevel=clamp(selectedLevel+.06,.03,.98);
    else if(event.key==='ArrowDown')selectedLevel=clamp(selectedLevel-.06,.03,.98);
    else setShape(selectedLevel,event.key==='ArrowRight'?5:-5);
    draw();
  });
  document.querySelectorAll('[data-clay-shape]').forEach(button=>button.addEventListener('click',()=>{
    changed=false;station.classList.remove('sculpted');preset(button.dataset.clayShape);feedback.textContent='Начните с этой формы. Дальше всё в ваших руках.';
  }));
  document.querySelectorAll('[data-clay-color]').forEach(button=>button.addEventListener('click',()=>{
    selectedColor=button.dataset.clayColor;
    document.querySelectorAll('[data-clay-color]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    document.querySelector('.clay-color-name').textContent=glazes[selectedColor].name;
    draw();feedback.textContent=glazes[selectedColor].name+'. Посмотрите, как меняется характер вашей вазы.';
  }));
  sliders.forEach(input=>input.addEventListener('input',()=>{
    selectedLevel=Number(input.dataset.clayLevel);showGuide(1500);
    setShape(selectedLevel,Number(input.value)-radiusAt(selectedLevel),.14);
  }));
  document.querySelector('#clay-reset').addEventListener('click',()=>{
    changed=false;station.classList.remove('sculpted','is-complete');preset(selectedShape);feedback.textContent='Свежий кусочек глины. Попробуем ещё раз?';
  });
  document.querySelector('#clay-finish').addEventListener('click',()=>{feedback.textContent='Ваша форма готова. '+glazes[selectedColor].name+' и силуэт с вашим характером.';station.classList.add('is-complete');});
  motionQuery.addEventListener('change',()=>{playing=!motionQuery.matches;animate();});
  document.addEventListener('visibilitychange',animate);
  document.addEventListener('keydown',event=>{if(event.key==='Tab')canvas.dataset.focusMode='keyboard';});
  canvas.addEventListener('blur',()=>{delete canvas.dataset.focusMode;});
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;animate();},{threshold:0,rootMargin:'40px'}).observe(canvas);
  preset('vase');resize();
  if(!ctx){canvas.hidden=true;document.querySelector('.clay-render-fallback').hidden=false;}
})();
