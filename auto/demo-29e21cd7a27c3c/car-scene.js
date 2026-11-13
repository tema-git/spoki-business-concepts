import * as THREE from './vendor/three.module.js';
import { makeCar } from './car-geometry.js?v=c5efbc2231';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

function fallbackMarkup(tone) {
  return `<svg class="car-code-fallback" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="sedan-metal" x1="504" y1="151" x2="516" y2="421" gradientUnits="userSpaceOnUse"><stop stop-color="#f5f9fb"/><stop offset=".29" stop-color="#d9e2e8"/><stop offset=".5" stop-color="#acbcc7"/><stop offset=".61" stop-color="#e5edf1"/><stop offset=".79" stop-color="#8094a3"/><stop offset="1" stop-color="#405867"/></linearGradient>
    <linearGradient id="sedan-side" x1="616" y1="274" x2="628" y2="409" gradientUnits="userSpaceOnUse"><stop stop-color="#eef4f7"/><stop offset=".25" stop-color="#9eb1bf"/><stop offset=".53" stop-color="#728b9d"/><stop offset=".8" stop-color="#b8c8d2"/><stop offset="1" stop-color="#566d7c"/></linearGradient>
    <linearGradient id="sedan-hood" x1="247" y1="243" x2="235" y2="331" gradientUnits="userSpaceOnUse"><stop stop-color="#fbfdff"/><stop offset=".53" stop-color="#d5e1e9"/><stop offset="1" stop-color="#8399a8"/></linearGradient>
    <linearGradient id="sedan-glass" x1="527" y1="169" x2="566" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#6c8291"/><stop offset=".24" stop-color="#324b5d"/><stop offset=".65" stop-color="#142b3c"/><stop offset="1" stop-color="#425d70"/></linearGradient>
    <linearGradient id="sedan-rim" x1="-34" y1="-44" x2="36" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#fbfdff"/><stop offset=".38" stop-color="#c3d0d9"/><stop offset=".64" stop-color="#708594"/><stop offset="1" stop-color="#dce7ed"/></linearGradient>
    <radialGradient id="sedan-tire"><stop offset=".53" stop-color="#18242c"/><stop offset=".76" stop-color="#101920"/><stop offset=".92" stop-color="#27353e"/><stop offset="1" stop-color="#0b1319"/></radialGradient>
    <radialGradient id="sedan-shadow"><stop stop-color="#0b1c2c" stop-opacity=".3"/><stop offset="1" stop-color="#0b1c2c" stop-opacity="0"/></radialGradient>
    <g id="sedan-wheel">
      <ellipse rx="54" ry="61" fill="url(#sedan-tire)"/>
      <ellipse rx="48" ry="55" stroke="#43515c" stroke-width="1.2"/>
      <ellipse rx="40" ry="47" fill="#0d1d29" stroke="url(#sedan-rim)" stroke-width="4"/>
      <ellipse rx="31" ry="37" fill="#566875"/>
      <ellipse rx="27" ry="33" fill="#6a7b86" stroke="#8e9ea9" stroke-width="1"/>
      <path d="M20-25 30-21 32 9 23 13Z" fill="#ad5842"/>
      <g fill="url(#sedan-rim)" stroke="#7c919f" stroke-width=".5">
        <path d="M-5-8-13-43-5-46 4-9Z M3-8 0-46 8-45 11-8Z"/>
        <path d="M8-7 29-31 34-24 13 2Z M11 0 36-23 39-14 14 8Z"/>
        <path d="M12 7 32 27 27 35 5 12Z M7 12 26 35 18 42-1 13Z"/>
        <path d="M-1 13-7 46-15 43-9 10Z M-9 10-17 41-25 35-15 5Z"/>
        <path d="M-13 2-39-8-37-18-10-8Z M-10-7-35-23-29-31-4-12Z"/>
      </g>
      <ellipse rx="12" ry="14" fill="#aabdc9" stroke="#d9e5ec" stroke-width="1.2"/>
      <ellipse rx="6" ry="7" fill="#344b5b"/>
      <g fill="#2d4353"><circle cx="0" cy="-10" r="1.4"/><circle cx="8" cy="-3" r="1.4"/><circle cx="5" cy="8" r="1.4"/><circle cx="-5" cy="8" r="1.4"/><circle cx="-8" cy="-3" r="1.4"/></g>
    </g>
  </defs>
  <ellipse cx="511" cy="421" rx="438" ry="49" fill="url(#sedan-shadow)"/>
  <ellipse cx="158" cy="349" rx="35" ry="53" fill="#10202a"/>
  <ellipse cx="861" cy="323" rx="32" ry="49" fill="#10202a"/>
  <use href="#sedan-wheel" transform="translate(783 354) scale(.89 .91)"/>
  <use href="#sedan-wheel" transform="translate(305 375)"/>
  <!-- One continuous long-wheelbase body; the two near-side arch openings are part of its outline. -->
  <path d="M98 321Q112 293 147 276Q210 247 338 236L417 176Q445 156 485 155L646 161Q687 164 716 186L810 248Q847 258 889 271Q924 281 929 308L925 350Q920 369 836 387C838 343 824 295 783 294C743 294 720 334 727 392L365 414C365 363 349 312 305 312C261 312 241 357 249 413L135 407Q101 399 98 374Z" fill="url(#sedan-metal)" stroke="#8195a3" stroke-width="1.3"/>
  <path d="M363 303Q551 280 813 271L909 291Q923 306 925 328L922 349Q908 367 839 383C839 335 822 294 783 294C743 294 722 334 729 390L365 411C365 366 356 337 343 324Z" fill="url(#sedan-side)"/>
  <!-- A gently rising bonnet, with separate rounded front wings. -->
  <path d="M142 278Q217 252 337 239L431 256Q378 278 355 316Q266 341 111 328Q115 300 142 278Z" fill="url(#sedan-hood)"/>
  <path d="M166 282Q229 264 331 253L380 264M182 319Q273 322 332 300" stroke="#6f8799" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M149 282Q215 253 338 238L417 178" stroke="#ffffff" stroke-opacity=".7" stroke-width="2.2"/>
  <path d="M350 315Q499 291 723 286Q817 283 894 293" stroke="#f4fbff" stroke-opacity=".8" stroke-width="2"/>
  <path d="M369 400Q570 387 721 379" stroke="#304b60" stroke-width="4"/>
  <path d="M371 397Q575 384 720 376" stroke="#d5e2e9" stroke-width="1.5"/>
  <!-- Windshield and two separate side doors form a four-door fastback cabin. -->
  <path d="M350 237 427 180Q449 164 481 164L522 172 464 254Z" fill="url(#sedan-glass)" stroke="#4c6475" stroke-width="2"/>
  <path d="M477 254 536 177 643 181Q670 184 693 201L766 258Z" fill="url(#sedan-glass)" stroke="#4b6273" stroke-width="2"/>
  <path d="M529 173 474 256M596 179 589 256M696 205 713 257" stroke="#172b3a" stroke-width="8"/>
  <path d="M474 256 533 175 643 179Q671 182 697 201L773 259M476 259 773 262" stroke="#e1eaf0" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M489 155Q576 150 647 161Q684 165 714 185L804 246 776 257 700 199Q674 181 645 178L528 172Z" fill="#d8e3ea"/>
  <path d="M488 157Q570 152 646 163Q681 167 712 187" stroke="#f8fcff" stroke-width="2"/>
  <path d="M700 199 776 255 796 249 720 191Z" fill="#91a6b6"/>
  <path d="M435 180 476 170 402 238 365 240Z" fill="#d8ecf9" opacity=".11"/>
  <path d="M549 184 575 184 516 251 489 251Z" fill="#e5f4ff" opacity=".08"/>
  <!-- Two complete door seams and handles on the visible side. -->
  <path d="M470 264 442 298 425 390Q499 393 580 382L590 265M593 265 579 383Q658 381 716 369L743 306 748 269" stroke="#465f72" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M443 299 428 386Q490 389 578 379M595 267 581 380" stroke="#e9f2f7" stroke-opacity=".35" stroke-width="1"/>
  <path d="M535 280 562 278M679 274 704 273" stroke="#405b70" stroke-width="5" stroke-linecap="round"/>
  <path d="M535 278 562 276M679 272 704 271" stroke="#eef7fc" stroke-width="2" stroke-linecap="round"/>
  <path d="M461 261 445 270" stroke="#1e3547" stroke-width="6" stroke-linecap="round"/>
  <path d="M433 256Q450 249 465 258L469 265Q451 272 432 266Z" fill="#c0d2de" stroke="#617b8e" stroke-width="1.4"/>
  <path d="M435 265Q451 269 468 263" stroke="#173448" stroke-width="3"/>
  <!-- Thin four-point headlamp signatures stay flush with the front wings. -->
  <path d="M130 293Q141 281 165 277L200 274Q198 291 178 300L143 305Q130 305 130 293Z" fill="#1c3547" stroke="#d8e8f1" stroke-width="2"/>
  <path d="M301 292Q306 272 333 265Q352 261 368 267Q361 287 344 299L318 307Q304 307 301 292Z" fill="#193144" stroke="#dcebf3" stroke-width="2"/>
  <g stroke="#edfaff" stroke-width="3.3" stroke-linecap="round"><path d="m145 291 9-3m19-5 9-2m-38 16 9-3m17-4 9-2M317 283l7-5m18-6 7-1m-34 24 7-4m16-6 7-4"/></g>
  <!-- Sculpted low bumper, three wide intakes and restrained rear optics. -->
  <path d="M109 345Q155 352 202 351L208 380Q158 384 115 372Z" fill="#152b3b" stroke="#536d80" stroke-width="1"/>
  <path d="M219 351 246 346 237 384 220 384Z" fill="#142b3b"/>
  <path d="M113 352Q157 360 198 357M115 361Q158 369 201 367" stroke="#7390a4" stroke-width="1.4"/>
  <path d="M105 391Q160 407 244 402" stroke="#213e53" stroke-width="6" stroke-linecap="round"/>
  <path d="M113 388Q161 401 242 397" stroke="#d0e0ea" stroke-width="1.4"/>
  <path d="M888 285Q910 290 923 301L923 310 889 301Z" fill="#7a1e2c"/>
  <path d="M889 288Q909 293 922 302" stroke="#ed5960" stroke-width="3"/>
  <path d="M847 365 913 352" stroke="#243e51" stroke-width="5" stroke-linecap="round"/>
  <path d="M253 409C246 360 264 315 305 314C347 314 364 363 362 412M730 387C725 342 744 297 783 296C821 296 837 340 834 382" stroke="#e0ebf1" stroke-width="2"/>
  <path d="M250 407C243 357 263 312 305 311C348 311 367 360 365 411M727 389C722 339 744 294 783 293C822 293 840 339 837 382" stroke="#4e687c" stroke-width="1.2"/>
</svg>`.replaceAll('sedan-', `sedan-${tone}-`);
}

function mountCar(host) {
  const wash=host.dataset.carScene==='wash';
  host.style.cssText+=';position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  host.innerHTML=fallbackMarkup(wash?'wash':'service');
  const fallback=host.firstElementChild;fallback.style.cssText='width:100%;height:100%;display:block;';
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{host.dataset.renderState='fallback';return;}
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;pointer-events:none;';host.append(canvas);
  renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),1.75));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=wash?1.08:1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const scene=new THREE.Scene();const {car,wheels}=makeCar(wash);scene.add(car);
  let environmentMap;
  function rebuildEnvironment(){
    const environment=new THREE.Scene();environment.background=new THREE.Color(wash?0x768b9c:0x59626c);
    const panels=[];
    for(const [x,y,z,w,h,intensity] of [[0,6,-1,10,2,3],[-3,3,5,7,2,3],[3,3,-4,4,6,2.3],[5,1,5,3,3,1.5]]){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color().setScalar(intensity),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,.7,0);environment.add(panel);panels.push(panel);
    }
    const generator=new THREE.PMREMGenerator(renderer);
    try{const next=generator.fromScene(environment,.16,.1,30);const previous=environmentMap;environmentMap=next;scene.environment=next.texture;previous?.dispose();}
    finally{generator.dispose();for(const p of panels){p.geometry.dispose();p.material.dispose();}}
  }
  rebuildEnvironment();scene.environmentIntensity=.85;
  scene.add(new THREE.HemisphereLight(0xdfefff,0x263749,1.0));
  const key=new THREE.DirectionalLight(0xfff2df,2.6);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.03;key.shadow.bias=-.0003;scene.add(key);
  const rim=new THREE.DirectionalLight(wash?0x8dcfff:0x8fbdd3,1.9);rim.position.set(3,3,-5);scene.add(rim);
  const warm=new THREE.PointLight(wash?0xccefff:0xffe7cd,20,12,2);warm.position.set(-1,2.5,3);scene.add(warm);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(18,14),new THREE.ShadowMaterial({opacity:wash?.19:.34}));ground.rotation.x=-Math.PI/2;ground.position.y=.01;ground.receiveShadow=true;scene.add(ground);
  const camera=new THREE.PerspectiveCamera(32,1,.1,60);const hero=host.closest('.hero')||host.parentElement;
  let w=1,h=1,hostLeft=0,viewportWidth=1,sectionTop=0,sectionHeight=800,sectionLeft=0,sectionWidth=1,visible=true,enabled=true,contextLost=false,disposed=false;
  let target=0,current=0,px=0,py=0,currentX=0,currentY=0,renderFrame=0,last=0;
  const targetPoint=new THREE.Vector3(0,.77,0);
  const fitCorners=[];car.updateMatrixWorld(true);car.traverse(part=>{if(!part.isMesh||part.isInstancedMesh)return;part.geometry.computeBoundingBox();const b=part.geometry.boundingBox;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])fitCorners.push(new THREE.Vector3(x,y,z).applyMatrix4(part.matrixWorld));});const projected=new THREE.Vector3();
  function policy(){enabled=!reduced.matches;if(!enabled){target=0;current=0;px=py=currentX=currentY=0;}else target=clamp((scrollY-sectionTop)/Math.max(350,sectionHeight*.6));request();}
  function resize(){const box=host.getBoundingClientRect();w=Math.max(box.width,1);h=Math.max(box.height,1);hostLeft=box.left;viewportWidth=innerWidth;if(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const b=hero.getBoundingClientRect();sectionTop=b.top+scrollY;sectionHeight=b.height;sectionLeft=b.left;sectionWidth=Math.max(b.width,1);onScroll();}
  function onScroll(){if(enabled)target=clamp((scrollY-sectionTop)/Math.max(350,sectionHeight*.6));request();}
  function move(event){if(!enabled||!fine.matches||event.pointerType==='touch')return;px=clamp((event.clientX-sectionLeft)/sectionWidth)*2-1;py=clamp((event.clientY-(sectionTop-scrollY))/sectionHeight)*2-1;request();}
  function leave(){px=py=0;request();}
  function request(){if(!disposed&&!renderFrame&&visible&&!document.hidden&&!contextLost)renderFrame=requestAnimationFrame(frame);}
  function stop(){cancelAnimationFrame(renderFrame);renderFrame=0;last=0;}
  function frame(time){
    renderFrame=0;
    if(!visible||document.hidden||contextLost){stop();return;}
    const delta=last?Math.min(50,time-last):16;last=time;const lerp=1-Math.exp(-delta/90);
    current+=(target-current)*lerp;currentX+=(px-currentX)*lerp;currentY+=(py-currentY)*lerp;
    const distance=8.3;
    const angle=-.68+current*.65+currentX*.045;
    camera.position.set(Math.sin(angle)*distance,1.95+current*.72+currentY*.10,Math.cos(angle)*distance);
    camera.lookAt(targetPoint);car.rotation.y=current*.07;car.position.y=Math.sin(current*Math.PI)*.035;
    camera.clearViewOffset();camera.zoom=1;camera.updateProjectionMatrix();camera.updateMatrixWorld();car.updateMatrix();
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const corner of fitCorners){projected.copy(corner).applyMatrix4(car.matrix).project(camera);minX=Math.min(minX,projected.x);maxX=Math.max(maxX,projected.x);minY=Math.min(minY,projected.y);maxY=Math.max(maxY,projected.y);}
    const visibleLeft=Math.max(0,-hostLeft),visibleRight=Math.min(w,viewportWidth-hostLeft),visibleWidth=Math.max(1,visibleRight-visibleLeft);
    const screenCenter=(visibleLeft+visibleRight)/2-w/2;
    camera.zoom=Math.min(1.94*visibleWidth/w/(maxX-minX),1.86/(maxY-minY));
    camera.setViewOffset(w,h,(minX+maxX)*camera.zoom*w/4-screenCenter,-(minY+maxY)*camera.zoom*h/4,w,h);camera.updateProjectionMatrix();
    key.position.x=-4+current*7;warm.position.x=-3+current*6;warm.intensity=(wash?15:22)+Math.sin(current*Math.PI)*15;
    for(let i=0;i<wheels.length;i++)wheels[i].rotation.z=-current*.35;
    renderer.render(scene,camera);
    if(host.dataset.renderState!=='ready'){host.dataset.renderState='ready';canvas.style.opacity='1';fallback.hidden=true;fallback.style.display='none';if(location.hostname==='127.0.0.1')console.info(`Procedural car: ${renderer.info.render.calls} draw calls, ${renderer.info.render.triangles} triangles, DPR ${renderer.getPixelRatio()}`);}
    if(Math.abs(target-current)+Math.abs(px-currentX)+Math.abs(py-currentY)>=.0006)request();else last=0;
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resizeObserver.observe(hero);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){onScroll();request();}else stop();},{rootMargin:'100px'});intersection.observe(host);
  const mutations=new MutationObserver(policy);mutations.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-motion-off']});
  const visibility=()=>{if(document.hidden)stop();else{resize();policy();}};
  const lost=event=>{event.preventDefault();contextLost=true;stop();canvas.style.opacity='0';fallback.hidden=false;fallback.style.display='block';host.dataset.renderState='fallback';};
  const restored=()=>{try{rebuildEnvironment();contextLost=false;resize();policy();}catch{contextLost=true;canvas.style.opacity='0';fallback.hidden=false;fallback.style.display='block';host.dataset.renderState='fallback';}};
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize,{passive:true});
  hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',leave,{passive:true});
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',policy);
  const pageshow=()=>{resize();policy();};window.addEventListener('pageshow',pageshow);
  window.addEventListener('pagehide',event=>{stop();if(event.persisted)return;disposed=true;resizeObserver.disconnect();intersection.disconnect();mutations.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);window.removeEventListener('pageshow',pageshow);hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',policy);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();environmentMap.dispose();renderer.dispose();},{once:false});
  resize();policy();
}

document.querySelectorAll('[data-car-scene]').forEach(host=>{try{mountCar(host);}catch(error){host.dataset.renderState='fallback';console.warn('3D scene unavailable; using vector car.',error.message);}});
