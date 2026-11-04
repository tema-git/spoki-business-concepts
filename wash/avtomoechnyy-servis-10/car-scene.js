import * as THREE from './vendor/three.module.js';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

function fallbackMarkup(tone) {
  return `<svg class="car-code-fallback" viewBox="0 0 1000 480" fill="none" aria-hidden="true"><defs><linearGradient id="car-metal-${tone}" x2=".3" y2="1"><stop stop-color="#e5edf1"/><stop offset=".38" stop-color="#728695"/><stop offset=".64" stop-color="#263b4b"/><stop offset="1" stop-color="#aebec8"/></linearGradient></defs><ellipse cx="520" cy="375" rx="390" ry="29" fill="#071b2b" opacity=".16"/><path d="M90 286 133 247 303 216 426 129Q455 109 508 111L653 117 769 202 885 236Q925 251 929 299L913 333 834 349 199 350 96 330Z" fill="url(#car-metal-${tone})" stroke="#dce7ee" stroke-width="3"/><path d="M329 213 445 134 507 130 648 138 731 203Z" fill="#102534" stroke="#a0b2bf" stroke-width="4"/><path d="m527 132-6 75M143 252l178-30M151 279l137-15M719 232l149 20" stroke="#eafaff" stroke-width="7" stroke-linecap="round"/><path d="m110 295 173-10-8 35-151 1Z" fill="#0a1722"/><path d="m315 239 336-14 84 20-2 66-390 6Z" stroke="#273a48" stroke-width="2"/><g fill="#131e28" stroke="#97a8b3" stroke-width="7"><ellipse cx="301" cy="330" rx="67" ry="73"/><ellipse cx="780" cy="319" rx="64" ry="70"/></g><g fill="#2a3c4a" stroke="#c9d4dc" stroke-width="13"><ellipse cx="301" cy="330" rx="40" ry="45"/><ellipse cx="780" cy="319" rx="39" ry="44"/></g></svg>`;
}

function geometryGrid(rows, cols, sample) {
  const points = [], indices = [];
  for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) points.push(...sample(i / rows, j / cols));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const a = i * (cols + 1) + j, b = a + cols + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geo.setIndex(indices); geo.computeVertexNormals();
  return geo;
}

function makeCar(wash) {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({color:wash?0xd5e2e8:0x607783,metalness:.72,roughness:.25,clearcoat:1,clearcoatRoughness:.18,side:THREE.DoubleSide});
  const chrome = new THREE.MeshStandardMaterial({color:0xb8c6d0,metalness:.96,roughness:.21});
  const black = new THREE.MeshStandardMaterial({color:0x081119,metalness:.3,roughness:.32});
  const rubber = new THREE.MeshStandardMaterial({color:0x111519,roughness:.86});
  const glass = new THREE.MeshPhysicalMaterial({color:0x0b1a24,metalness:.3,roughness:.13,clearcoat:1,side:THREE.DoubleSide});
  const lamp = new THREE.MeshStandardMaterial({color:0xf1fbff,emissive:0xd1efff,emissiveIntensity:1.6});
  const red = new THREE.MeshStandardMaterial({color:0xab1f28,emissive:0xec2039,emissiveIntensity:1.0});
  const accent = new THREE.MeshStandardMaterial({color:wash?0x2659cb:0xb86e43,metalness:.45,roughness:.34});
  const mesh=(geo,mat,parent=car)=>{const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  function box(w,h,d,x,y,z,mat,parent=car){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
  function line(points,radius,mat,parent=car,closed=false){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed,'catmullrom',.35);return mesh(new THREE.TubeGeometry(curve,Math.max(20,points.length*5),radius,6,closed),mat,parent);}
  const profile=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.29,.73,.72),new THREE.Vector3(-2.12,.83,.87),new THREE.Vector3(-1.45,.91,.96),
    new THREE.Vector3(-.75,.94,.945),new THREE.Vector3(-.05,.91,.91),new THREE.Vector3(.72,.93,.97),
    new THREE.Vector3(1.36,.99,1.025),new THREE.Vector3(1.95,.92,.99),new THREE.Vector3(2.24,.80,.83)
  ],false,'catmullrom',.4);
  const sections=Array.from({length:301},(_,i)=>profile.getPoint(i/300));
  function section(x){let n=0;while(n<299&&sections[n+1].x<x)n++;const a=sections[n],b=sections[n+1],t=clamp((x-a.x)/(b.x-a.x));return {height:a.y+(b.y-a.y)*t,width:a.z+(b.z-a.z)*t};}
  function crown(x,v){const s=section(x),a=Math.abs(v);const fender=.19*Math.exp(-Math.pow((x+1.42)/.63,2))+.15*Math.exp(-Math.pow((x-1.35)/.61,2));return s.height-.055*Math.pow(a,6)+fender*Math.exp(-Math.pow((a-.79)/.30,2));}
  function surface(x,z){const s=section(x);return crown(x,z/s.width);}
  function archBottom(x){let y=.31;for(const axle of [-1.38,1.36]){const d=x-axle;if(Math.abs(d)<.485)y=Math.max(y,.45+Math.sqrt(.485*.485-d*d));}return y;}
  mesh(geometryGrid(150,48,(u,v)=>{const p=profile.getPoint(u),z=v*2-1;return[p.x,crown(p.x,z),p.z*z];}),paint);
  for(const side of [-1,1]){
    mesh(geometryGrid(150,12,(u,v)=>{const s=profile.getPoint(u),top=crown(s.x,1),low=Math.min(top-.008,archBottom(s.x));return[s.x,top*(1-v)+low*v,side*(s.z+.021*Math.sin(v*Math.PI)-.055*v*v)];}),paint);
    for(const axle of [-1.38,1.36]){
      const p=[];for(let i=0;i<=38;i++){const a=i/38*Math.PI,x=axle-.485*Math.cos(a);p.push([x,.45+.485*Math.sin(a),side*(section(x).width-.007)]);}line(p,.012,paint);
    }
    line([[-.91,.36,side*.905],[-.5,.31,side*.88],[.65,.31,side*.95],[.91,.37,side*.99]],.022,black);
    line([[-.70,.94,side*.945],[-.67,.67,side*.955],[-.58,.40,side*.925],[.68,.40,side*.96],[.94,.61,side*1.005],[.93,.96,side*.995]],.0045,black);
    box(.17,.022,.016,.63,.875,side*.99,chrome);
    line([[-.48,1.04,side*.79],[-.51,1.05,side*.98],[-.43,1.055,side*1.08]],.018,black);
    const mirror=mesh(new THREE.SphereGeometry(1,24,12),paint);mirror.scale.set(.145,.060,.10);mirror.position.set(-.44,1.065,side*1.08);
    const mirrorGlass=mesh(new THREE.SphereGeometry(1,20,10),glass);mirrorGlass.scale.set(.012,.045,.08);mirrorGlass.position.set(-.30,1.065,side*1.08);
  }
  // Low oval nose and broad, uninterrupted rear shoulders define the silhouette.
  for(const front of [true,false]){
    mesh(geometryGrid(36,12,(u,v)=>{const z=(u*2-1),x=front?-2.29:2.24,s=section(x);const y=crown(x,z)*(1-v)+(.30+.035*z*z)*v;const bulge=Math.sin(v*Math.PI)*.055;return[x+(front?-bulge:bulge)+Math.abs(z)**4*(front?.09:-.07),y,z*s.width*(1-.065*v)];}),paint);
  }
  // Front air intakes sit in the bumper, not in a tall grille.
  for(const [center,width] of [[0,.62],[-.62,.31],[.62,.31]]){
    mesh(geometryGrid(12,6,(u,v)=>{const z=center+(u-.5)*width;return[-2.356+Math.abs(z)**4*.09,.39+v*.14+.016*Math.cos(u*Math.PI*2),z];}),black);
    for(let row=0;row<3;row++)line([[-2.361+Math.abs(center-width*.44)**4*.09,.42+row*.038,center-width*.44],[-2.361+Math.abs(center)**4*.09,.42+row*.038,center],[-2.361+Math.abs(center+width*.44)**4*.09,.42+row*.038,center+width*.44]],.005,chrome);
  }
  line([[-2.26,.31,-.75],[-2.35,.295,-.35],[-2.36,.295,.35],[-2.26,.31,.75]],.020,black);
  for(const side of [-1,1]){
    line([[-2.29,.66,side*.48],[-2.27,.66,side*.70]],.010,lamp);
    // Oval four-point headlamps follow the raised front wings.
    const cx=-1.89,cz=side*.72;
    const lensPoint=(r,a,lift=0)=>{const x=cx+Math.cos(a)*.226*r,z=cz+Math.sin(a)*.134*r;return[x,surface(x,z)+.035+.018*(1-r*r)+lift,z];};
    mesh(geometryGrid(12,48,(u,v)=>lensPoint(u,-v*Math.PI*2)),black);
    const ring=[];for(let i=0;i<48;i++)ring.push(lensPoint(.91,i/48*Math.PI*2,.005));line(ring,.0045,lamp,car,true);
    for(const dx of [-.065,.065])for(const dz of [-.045,.045]){const x=cx+dx,z=cz+dz,led=mesh(new THREE.SphereGeometry(.019,12,8),lamp);led.scale.set(1,.25,.65);led.position.set(x,surface(x,z)+.058,z);}
    const hood=[];for(let i=0;i<18;i++){const x=-2.05+i/17*1.31,z=side*(.33+.21*i/17);hood.push([x,surface(x,z)+.006,z]);}line(hood,.0035,black);
  }
  // A single fastback arc, with a separate windshield, painted roof and rear glass.
  const cabin=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.76,.955,.77),new THREE.Vector3(-.54,1.13,.745),new THREE.Vector3(-.20,1.405,.665),
    new THREE.Vector3(.22,1.485,.65),new THREE.Vector3(.61,1.435,.68),new THREE.Vector3(1.02,1.25,.755),new THREE.Vector3(1.64,1.00,.81)
  ],false,'catmullrom',.35);
  function cabinSurface(u,v){const p=cabin.getPoint(u),z=v*2-1;return[p.x,p.y-.055*Math.pow(Math.abs(z),3),p.z*z];}
  mesh(geometryGrid(64,24,cabinSurface),glass);
  // The painted top is sampled from the same surface, avoiding overlapping roof panels.
  mesh(geometryGrid(26,22,(u,v)=>{const p=cabinSurface(.31+u*.30,v);p[1]+=.006;return p;}),paint);
  for(const side of [-1,1]){
    mesh(geometryGrid(64,8,(u,v)=>{const p=cabin.getPoint(u);return[p.x,(p.y-.055)*(1-v)+(.965+.016*u)*v,side*(p.z*(1-v)+(.79+.025*u)*v)];}),glass);
    const seal=[];for(let i=0;i<=64;i++){const p=cabin.getPoint(i/64);seal.push([p.x,p.y-.054,side*p.z]);}line(seal,.018,paint);
    line([[-.76,.965,side*.79],[.20,.97,side*.80],[1.64,.982,side*.815]],.010,black);
    line([[.49,.98,side*.805],[.45,1.41,side*.68]],.024,black);
    // Wide C-pillar transitions into the rear haunch.
    mesh(geometryGrid(16,8,(u,v)=>{const p=cabin.getPoint(.62+u*.38);return[p.x,(p.y-.053)*(1-v)+(.97+.012*u)*v,side*(p.z*(1-v)+.818*v+.006)];}),paint);
  }
  for(const u of [.31,.61]){const arc=[];for(let i=0;i<=24;i++){const p=cabinSurface(u,i/24);p[1]+=.009;arc.push(p);}line(arc,.016,paint);}
  // Rear window ribs, continuous light ribbon, exhaust tips and a subtle rear lip.
  for(let i=0;i<11;i++){const z=-.42+i*.084;const x=1.72;line([[x,surface(x,z)+.009,z],[x+.20,surface(x+.20,z)+.009,z]],.009,black);}
  line([[2.22,.765,-.78],[2.29,.77,-.40],[2.30,.77,.40],[2.22,.765,.78]],.020,black);
  line([[2.23,.775,-.77],[2.30,.78,-.40],[2.31,.78,.40],[2.23,.775,.77]],.009,red);
  line([[2.08,.89,-.83],[2.17,.91,0],[2.08,.89,.83]],.016,paint);
  box(.055,.11,1.31,2.24,.38,0,black);
  for(const side of [-1,1]){const tip=mesh(new THREE.CylinderGeometry(.063,.063,.13,24),chrome);tip.rotation.z=Math.PI/2;tip.position.set(2.27,.33,side*.59);const inside=mesh(new THREE.CircleGeometry(.048,24),black);inside.rotation.y=Math.PI/2;inside.position.set(2.338,.33,side*.59);}
  // Five sculpted twin spokes, deep barrels and fixed brake calipers.
  const wheels=[],tm=new THREE.Object3D();
  for(const x of [-1.38,1.36])for(const side of [-1,1]){
    const w=new THREE.Group();w.position.set(x,.45,side*(x<0?.936:1.002));if(side<0)w.rotation.y=Math.PI;car.add(w);wheels.push(w);
    mesh(new THREE.TorusGeometry(.342,.098,16,64),rubber,w);
    const barrel=mesh(new THREE.CylinderGeometry(.320,.320,.17,48),black,w);barrel.rotation.x=Math.PI/2;
    const ring=mesh(new THREE.TorusGeometry(.316,.016,10,64),chrome,w);ring.position.z=.100;
    const disk=mesh(new THREE.CylinderGeometry(.255,.255,.016,48),chrome,w);disk.rotation.x=Math.PI/2;disk.position.z=.065;
    const holes=new THREE.InstancedMesh(new THREE.CircleGeometry(.008,6),black,32);for(let i=0;i<32;i++){const a=i/32*Math.PI*2;tm.position.set(Math.cos(a)*.22,Math.sin(a)*.22,.075);tm.rotation.set(0,0,0);tm.scale.set(1,1,1);tm.updateMatrix();holes.setMatrixAt(i,tm.matrix);}w.add(holes);
    const spokes=new THREE.InstancedMesh(new THREE.BoxGeometry(.026,.235,.034),chrome,10);for(let i=0;i<10;i++){const a=Math.floor(i/2)/5*Math.PI*2+(i%2? .095:-.095);tm.position.set(Math.sin(a)*.186,Math.cos(a)*.186,.114);tm.rotation.set(0,0,-a);tm.updateMatrix();spokes.setMatrixAt(i,tm.matrix);}w.add(spokes);
    const hub=mesh(new THREE.CylinderGeometry(.071,.071,.042,24),chrome,w);hub.rotation.x=Math.PI/2;hub.position.z=.112;
    const cap=mesh(new THREE.CylinderGeometry(.040,.040,.008,20),black,w);cap.rotation.x=Math.PI/2;cap.position.z=.138;
    const bolts=new THREE.InstancedMesh(new THREE.SphereGeometry(.009,8,6),chrome,5);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;tm.position.set(Math.cos(a)*.054,Math.sin(a)*.054,.141);tm.rotation.set(0,0,0);tm.updateMatrix();bolts.setMatrixAt(i,tm.matrix);}w.add(bolts);
    // Caliper is parented to the body so it never rotates with the rim.
    box(.075,.18,.045,x+.20,.48,side*(x<0?1.014:1.08),accent);
  }
  const batches=new Map();
  for(const part of [...car.children]){
    if(!part.isMesh||part.isInstancedMesh)continue;
    part.updateMatrix();const transformed=part.geometry.clone().applyMatrix4(part.matrix);
    const g=transformed.index?transformed.toNonIndexed():transformed;
    if(g!==transformed)transformed.dispose();
    if(!batches.has(part.material))batches.set(part.material,[]);
    batches.get(part.material).push(g);car.remove(part);part.geometry.dispose();
  }
  for(const [material,parts] of batches){
    const length=parts.reduce((n,g)=>n+g.attributes.position.count,0),positions=new Float32Array(length*3),normals=new Float32Array(length*3);
    let offset=0;for(const g of parts){positions.set(g.attributes.position.array,offset);normals.set(g.attributes.normal.array,offset);offset+=g.attributes.position.array.length;g.dispose();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('normal',new THREE.BufferAttribute(normals,3));g.computeBoundingSphere();mesh(g,material);
  }
  return {car,wheels,paint};
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
    for(const [x,y,z,w,h,intensity] of [[0,6,0,12,5,3],[-5,3,4,5,7,3.5],[3,3,-4,4,6,2.3],[5,1,5,3,5,1.5]]){
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
  const warm=new THREE.PointLight(wash?0xccefff:0xffb379,20,12,2);warm.position.set(-1,2.5,3);scene.add(warm);
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
