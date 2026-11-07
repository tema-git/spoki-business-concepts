import * as THREE from './vendor/three.module.js';
import { makeCar } from './car-geometry.js?v=dc7ea3decb';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

function fallbackMarkup(){return `<svg class="car-code-fallback" data-car-model="reference-01-911" viewBox="0 0 1000 500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="coupe-metal"><stop stop-color="#b9cbd4"/><stop offset="1" stop-color="#647f90"/></linearGradient></defs><ellipse cx="500" cy="410" rx="425" ry="30" fill="#122c3d" opacity=".12"/><g stroke="#243d4b" stroke-width="3"><path d="M85 344Q107 316 158 290L278 270 379 193Q441 155 509 162Q604 160 672 214L792 269 889 288Q929 307 932 349L920 401 843 407Q845 334 782 334Q718 334 716 407L312 407Q309 334 246 334Q183 334 180 407L88 401Z" fill="url(#coupe-metal)"/><path d="M332 266 397 202Q438 173 509 178Q583 177 645 220L716 264Z" fill="#152c3a"/><circle cx="246" cy="404" r="63" fill="#101b22"/><circle cx="782" cy="404" r="63" fill="#101b22"/><circle cx="246" cy="404" r="43" fill="#758995"/><circle cx="782" cy="404" r="43" fill="#758995"/><path d="m850 276 23-67h-56l-3-13h109l-3 17h-30l-19 65" fill="#152833"/><ellipse cx="167" cy="300" rx="24" ry="12" transform="rotate(-32 167 300)" fill="#344e5e"/><path d="m126 357 55-8-4 29-55 5" fill="#142834"/><path d="M369 275 364 391 668 391 681 274" fill="none"/></g></svg>`;}

async function mountCar(host) {
  const wash=host.dataset.carScene==='wash';
  host.style.cssText+=';position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  host.innerHTML=fallbackMarkup(wash?'wash':'service');
  const fallback=host.firstElementChild;fallback.style.cssText='width:100%;height:100%;display:block;';
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{host.dataset.renderState='fallback';return;}
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;pointer-events:none;';host.append(canvas);
  renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),1.75));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const scene=new THREE.Scene();const {car,wheels}=await makeCar();host.dataset.carModel='reference-01-911';scene.add(car);
  let environmentMap;
  function rebuildEnvironment(){
    const environment=new THREE.Scene();environment.background=new THREE.Color(0x39434d);
    const panels=[];
    for(const [x,y,z,w,h,intensity] of [[0,6,-1,10,2,3],[-3,3,5,7,2,3],[3,3,-4,4,6,2.3],[5,1,5,3,3,1.5]]){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color().setScalar(intensity),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,.7,0);environment.add(panel);panels.push(panel);
    }
    const generator=new THREE.PMREMGenerator(renderer);
    try{const next=generator.fromScene(environment,.16,.1,30);const previous=environmentMap;environmentMap=next;scene.environment=next.texture;previous?.dispose();}
    finally{generator.dispose();for(const p of panels){p.geometry.dispose();p.material.dispose();}}
  }
  rebuildEnvironment();scene.environmentIntensity=.95;
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

document.querySelectorAll('[data-car-scene]').forEach(host=>{host.dataset.renderState='loading';mountCar(host).catch(error=>{host.dataset.renderState='fallback';console.warn('3D scene unavailable; using vector car.',error.message);});});
