import * as THREE from './vendor/three.module.js';

// Original procedural sports saloon. Dimensions reference the Panamera technical
// sheet; no imported model, texture, badge or manufacturer affiliation is used.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
function grid(rows,cols,sample){
  const p=[],ids=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++)p.push(...sample(i/rows,j/cols));
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;ids.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ids);g.computeVertexNormals();return g;
}
// Cubic interpolation in longitudinal metres, avoiding uneven Catmull knot speed.
function profile(stations,x){
  let i=0;while(i<stations.length-2&&x>stations[i+1][0])i++;
  const a=stations[i],b=stations[i+1],p=stations[Math.max(0,i-1)],q=stations[Math.min(stations.length-1,i+2)],t=clamp((x-a[0])/(b[0]-a[0]));
  return a.slice(1).map((v,k)=>{const j=k+1,m0=(b[j]-p[j])/(b[0]-p[0])*(b[0]-a[0]),m1=(q[j]-a[j])/(q[0]-a[0])*(b[0]-a[0]);return(2*t*t*t-3*t*t+1)*v+(t*t*t-2*t*t+t)*m0+(-2*t*t*t+3*t*t)*b[j]+(t*t*t-t*t)*m1;});
}
export function makeCar(wash=false){
  const car=new THREE.Group();car.name='procedural-four-door-saloon-v2';
  const paint=new THREE.MeshPhysicalMaterial({color:wash?0xaebbc4:0x52646c,metalness:.82,roughness:.20,clearcoat:1,clearcoatRoughness:.13,side:THREE.DoubleSide});
  const alloy=new THREE.MeshStandardMaterial({color:0xb3bcc1,metalness:1,roughness:.23,side:THREE.DoubleSide});
  const rotor=new THREE.MeshStandardMaterial({color:0x4b5157,metalness:.88,roughness:.4});
  const graphite=new THREE.MeshStandardMaterial({color:0x151c22,metalness:.75,roughness:.3,side:THREE.DoubleSide});
  const black=new THREE.MeshStandardMaterial({color:0x05090c,metalness:.1,roughness:.4,side:THREE.DoubleSide});
  const rubber=new THREE.MeshStandardMaterial({color:0x101215,metalness:0,roughness:.95});
  const glass=new THREE.MeshPhysicalMaterial({color:0x0c1b24,metalness:.45,roughness:.12,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide});
  const lens=new THREE.MeshStandardMaterial({color:0x050b11,metalness:.08,roughness:.3,envMapIntensity:.12,side:THREE.DoubleSide});
  const led=new THREE.MeshStandardMaterial({color:0xecfaff,emissive:0xb5e5ff,emissiveIntensity:2.0,side:THREE.DoubleSide});
  const tail=new THREE.MeshStandardMaterial({color:0xa61020,emissive:0xcf1631,emissiveIntensity:.7});
  const brake=new THREE.MeshStandardMaterial({color:wash?0x264b93:0xa34d32,metalness:.35,roughness:.4});
  const mesh=(g,m,parent=car)=>{const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
  const box=(w,h,d,x,y,z,m,parent=car)=>{const o=mesh(new THREE.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o;};
  const line=(p,r,m,parent=car,closed=false)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v=>new THREE.Vector3(...v)),closed,'centripetal'),Math.max(16,p.length*3),r,5,closed),m,parent);
  const stations=[
    [-2.526,.655,.795,.67],[-2.38,.735,.855,.77],[-2.10,.825,.925,.87],[-1.50,.865,.9685,.93],
    [-1.03,.922,.956,.94],[-.35,.925,.94,.935],[.45,.945,.944,.95],[1.45,.990,.9685,1.005],
    [2.05,.950,.94,.96],[2.38,.865,.88,.87],[2.526,.79,.795,.80]
  ];
  const dims=x=>profile(stations,clamp(x,-2.526,2.526));
  const fender=x=>.018*Math.exp(-(((x+1.50)/.65)**2))+.012*Math.exp(-(((x-1.45)/.72)**2));
  function crown(x,z){const [h,w,s]=dims(x),a=clamp(Math.abs(z)/w);return mix(h,s,a*a)+fender(x)*Math.exp(-(((a-.77)/.25)**2))-.065*a**10;}
  function roundedX(x,z){const a=Math.abs(z)/dims(x)[1];return x+.13*a**4*Math.exp(-(((x+2.526)/.23)**2))-.10*a**4*Math.exp(-(((x-2.526)/.23)**2));}
  function arch(x){let y=.18;for(const a of [-1.50,1.45]){const d=x-a;if(Math.abs(d)<.398)y=Math.max(y,.365+Math.sqrt(.398**2-d*d));}return y;}
  function sidePoint(x,v,side,lift=0){const [,w]=dims(x),top=crown(x,w),bottom=arch(x),y=mix(top,bottom,v),sculpt=.018*Math.sin(v*Math.PI)-.07*v*v-.022*Math.sin(v*Math.PI)**4;return[roundedX(x,w)+.13*v*v*Math.exp(-(((x+2.526)/.23)**2))-.05*v*v*Math.exp(-(((x-2.526)/.25)**2)),y,side*(w+sculpt+lift)];}
  const bodySurfaces=[];
  bodySurfaces.push(mesh(grid(200,48,(u,v)=>{const x=-2.526+u*5.052,z=(v*2-1)*dims(x)[1];return[roundedX(x,z),crown(x,z),z];}),paint));
  for(const side of [-1,1]){
    const panel=mesh(grid(200,20,(u,v)=>sidePoint(-2.526+u*5.052,v,side)),paint);panel.userData.flip=side>0;bodySurfaces.push(panel);
    for(const axle of [-1.50,1.45]){
      const lip=[],liner=[];
      for(let i=0;i<=48;i++){const a=i/48*Math.PI,x=axle-.398*Math.cos(a),y=.365+.398*Math.sin(a);lip.push([x,y,side*(dims(x)[1]-.047)]);liner.push([x,y-.008,side*(dims(x)[1]-.065)]);}
      line(lip,.007,paint);line(liner,.011,black);
    }
    line([[-1.08,.215,side*.891],[-.72,.185,side*.874],[.70,.19,side*.881],[1.04,.245,side*.908]],.018,graphite);
    // Two real door apertures on each flank, plus slim recessed handles.
    const seam=(points)=>{const path=new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,Math.min(y,crown(x,dims(x)[1])-.006),0)),false,'centripetal');const samples=Array.from({length:97},(_,i)=>{const p=path.getPoint(i/96),top=crown(p.x,dims(p.x)[1]),v=clamp((top-p.y)/(top-arch(p.x)));return sidePoint(p.x,v,side,.004);});return line(samples,.0025,black);};
    seam([[-1.00,.925],[-.94,.72],[-.91,.38],[-.81,.245],[.20,.235],[.26,.48],[.27,.95]]);
    seam([[.27,.95],[.26,.48],[.20,.235],[.90,.245],[1.04,.40],[1.18,.60],[1.36,.79],[1.47,.96]]);
    for(const x of [.05,1.11]){const y=x<.5?.856:.90,top=crown(x,dims(x)[1]),v=clamp((top-y)/(top-arch(x))),z=sidePoint(x,v,side,.005)[2];box(.155,.025,.009,x,y,z,graphite);box(.135,.013,.012,x,y+.003,z+side*.005,paint);}
    const shoulder=[];for(let i=0;i<=50;i++){const x=-2.1+i/50*4.25,z=side*dims(x)[1]*.982;shoulder.push([roundedX(x,z),crown(x,z)+.003,z]);}line(shoulder,.0018,paint);
    // Functional-looking side gill behind the front wheel.
    mesh(grid(12,4,(u,v)=>{const x=-1.04+u*.24;return[x,.58+v*.12+u*.055,side*(dims(x)[1]-.002)];}),graphite);
    for(let j=0;j<2;j++)line([[-1.025,.61+j*.044,side*.955],[-.82,.65+j*.044,side*.945]],.005,alloy);
  }
  // Share boundary normals between upper and side skin. Separate patches must
  // not leave a hard highlight seam around the otherwise continuous shoulder.
  bodySurfaces[0].userData.flip=true;
  const boundary=new Map();
  for(const part of bodySurfaces){const g=part.geometry;if(part.userData.flip){const a=g.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}g.computeVertexNormals();}const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*100000)).join(',');if(!boundary.has(key))boundary.set(key,[]);boundary.get(key).push([n,i]);}}
  for(const refs of boundary.values()){if(refs.length<2)continue;const sum=new THREE.Vector3();for(const [n,i] of refs)sum.add(new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i)));sum.normalize();for(const [n,i] of refs)n.setXYZ(i,sum.x,sum.y,sum.z);}
  // Rounded bumper faces join the hood and flank surfaces rather than ending in a box.
  function bumper(front,z,v){const x=front?-2.526:2.526,w=dims(x)[1],a=z/w,top=crown(x,z),low=.18+.015*a*a;return[roundedX(x,z)+(front?(.13*v*v-.025*Math.sin(v*Math.PI)):.032*Math.sin(v*Math.PI)),mix(top,low,v),z*(1-.055*Math.sin(v*Math.PI))];}
  for(const front of [true,false])mesh(grid(56,18,(u,v)=>bumper(front,(u*2-1)*.795,v)),paint);
  // Three deep intake openings, with dark vanes and a narrow horizontal bridge.
  function frontPoint(z,y,lift=.006){const v=clamp((crown(-2.526,z)-y)/(crown(-2.526,z)-.18));const p=bumper(true,z,v);p[0]-=lift;return[p[0],y,p[2]];}
  for(const [zc,width,height,cy] of [[0,.94,.225,.335],[-.635,.30,.18,.385],[.635,.30,.18,.385]]){
    mesh(grid(20,8,(u,v)=>{const z=zc+(u-.5)*width,round=.86+.14*Math.sin(u*Math.PI);return frontPoint(z,cy+(v-.5)*height*round,.009);}),black);
    for(let row=0;row<3;row++)line(Array.from({length:15},(_,i)=>frontPoint(zc+(i/14-.5)*width*.87,cy-.056+row*.05,.018)),.005,graphite);
  }
  line(Array.from({length:30},(_,i)=>frontPoint(-.77+i/29*1.54,.192,.012)),.012,graphite);
  // Small blank plate, no fictitious registration or marque.
  box(.014,.077,.33,-2.522,.485,0,graphite);
  line(Array.from({length:18},(_,i)=>frontPoint(-.42+i/17*.84,.566,.012)),.009,black);
  for(const side of [-1,1]){
    // Tapered swept-back lamp lenses are fitted to the wing surface.
    const contour=[[-2.32,side*.56],[-2.30,side*.75],[-2.16,side*.845],[-1.91,side*.80],[-1.93,side*.625],[-2.12,side*.55]];
    const lensCurve=new THREE.CatmullRomCurve3(contour.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
    const center=[-2.12,side*.695];
    const lampPoint=(u,t,extra=0)=>{const p=lensCurve.getPoint(t),x=mix(center[0],p.x,u),z=mix(center[1],p.z,u);return[x,crown(x,z)+.009+.009*(1-u*u)+extra,z];};
    mesh(grid(8,64,(u,v)=>lampPoint(u,side>0?1-v:v)),lens);
    line(Array.from({length:64},(_,i)=>lampPoint(1,i/64,.002)),.004,graphite,car,true);
    for(const dx of [-.090,.080])for(const dz of [-.063,.063]){
      const cx=center[0]+dx,cz=center[1]+dz;
      mesh(grid(3,3,(u,v)=>{const x=cx+(u-.5)*.071,z=cz+(v-.5)*.053;return[x,crown(x,z)+.025,z];}),black);
      for(const [a,b,c,d] of [[-.026,-.019,.023,-.019],[-.026,.019,.023,.019]]){
        mesh(grid(4,1,(u,v)=>{const x=cx+mix(a,c,u),z=cz+mix(b,d,u)+(v-.5)*.012;return[x,crown(x,z)+.040,z];}),led);
      }
    }
    const hood=[];for(let i=0;i<=32;i++){const x=-2.36+i/32*1.29,z=side*(.38+.19*i/32);hood.push([x,crown(x,z)+.004,z]);}line(hood,.0022,black);
    line([[-1.07,crown(-1.07,-.57)+.004,-.57],[-1.045,.925,0],[-1.07,crown(-1.07,.57)+.004,.57]],.0022,black);
  }
  // Long four-door greenhouse: continuous roof, bowed windshield and fastback glass.
  const roofStations=[[-1.12,.973,.83],[-.94,1.045,.794],[-.61,1.295,.709],[-.30,1.405,.666],[.20,1.423,.665],[.78,1.413,.69],[1.20,1.323,.736],[1.59,1.147,.811],[2.08,1.012,.856]];
  const cabin=x=>profile(roofStations,clamp(x,-1.12,2.08));
  const belt=x=>crown(x,.857+.012*clamp((x+1.12)/3.2))+.002;
  function roofPoint(x,t,lift=0){const [h,w]=cabin(x);return[x,h-.055*Math.abs(t)**3+lift,w*t];}
  function cabinSide(x,v,side,lift=0){const [h,w]=cabin(x),bw=.857+.012*clamp((x+1.12)/3.2);return[x,mix(h-.055,belt(x),v),side*(mix(w,bw,v)+.009*Math.sin(v*Math.PI)+lift)];}
  mesh(grid(100,32,(u,v)=>roofPoint(-1.12+u*3.2,v*2-1)),paint);
  for(const side of [-1,1])mesh(grid(100,14,(u,v)=>cabinSide(-1.12+u*3.2,v,side)),paint);
  // Glazing uses the same body surface: no floating, faceted black wedges.
  mesh(grid(28,36,(u,v)=>{const t=(v*2-1)*.955,x=mix(-1.045,-.41,u)+.045*(1-t*t)*Math.sin(u*Math.PI);return roofPoint(x,t,.006);}),glass);
  mesh(grid(28,32,(u,v)=>roofPoint(mix(1.03,1.98,u),(v*2-1)*.91,.006)),glass);
  for(const side of [-1,1]){
    const start=-1.03,end=1.79;
    function windowPoint(x,v,lift=.006){const edge=Math.min(clamp((x-start)/.22),clamp((end-x)/.30));const t=.11+(.88-.11)*v;const inset=.5+(t-.5)*Math.pow(edge,.45);return cabinSide(x,inset,side,lift);}
    mesh(grid(96,18,(u,v)=>windowPoint(mix(start,end,u),v)),glass);
    for(const v of [0,1])line(Array.from({length:71},(_,i)=>windowPoint(mix(start,end,i/70),v,.010)),.006,graphite);
    // Slim B-pillar separates front and rear doors; rear quarter-light gets its own seal.
    for(const [x,width] of [[.25,.085],[1.32,.026]])mesh(grid(6,14,(u,v)=>windowPoint(x+(u-.5)*width,v,.012)),black);
    const base=[];for(let i=0;i<=60;i++){const x=mix(start,end,i/60);base.push(windowPoint(x,1,.013));}line(base,.0035,alloy);
    line([[-.94,.98,side*.84],[-.94,1.012,side*.99],[-.83,1.019,side*1.04]],.014,graphite);
    const mirror=mesh(new THREE.SphereGeometry(1,32,16),paint);mirror.scale.set(.145,.052,.092);mirror.position.set(-.84,1.045,side*1.025);
    const backing=mesh(new THREE.SphereGeometry(1,24,12),glass);backing.scale.set(.009,.038,.075);backing.position.set(-.702,1.044,side*1.025);
  }
  // Windshield seals, wipers and a shallow panoramic roof inset.
  for(const x of [-1.045,-.41,1.03,1.98])line(Array.from({length:30},(_,i)=>roofPoint(x,(i/29*2-1)*(x>1?.92:.96),.010)),.005,graphite);
  for(const side of [-1,1])line([[-1.028,.950,side*.66],[-.985,.978,side*.34],[-1.015,.959,side*.04]],.0045,black);
  mesh(grid(30,24,(u,v)=>roofPoint(mix(-.26,.90,u),(v*2-1)*.83,.003)),glass);
  // Integrated rear light strip wraps into the shoulder. No engine vents on a saloon.
  function rearPoint(z,y,lift=.008){const v=clamp((crown(2.526,z)-y)/(crown(2.526,z)-.18)),p=bumper(false,z,v);return[p[0]+lift,y,p[2]];}
  const rearLine=Array.from({length:72},(_,i)=>rearPoint(-.78+i/71*1.56,.716+.025*Math.sin(i/71*Math.PI),.012));
  line(rearLine,.024,black);line(rearLine.map(p=>[p[0]+.016,p[1]+.002,p[2]]),.010,tail);
  for(const side of [-1,1])line([rearPoint(side*.75,.725,.024),[2.43,.732,side*.84],[2.30,.742,side*.905]],.014,tail);
  line([[2.22,.902,-.87],[2.34,.906,-.42],[2.35,.906,.42],[2.22,.902,.87]],.006,paint);
  mesh(grid(40,12,(u,v)=>rearPoint((u*2-1)*.74,.192+v*.14,.011)),graphite);
  mesh(grid(14,6,(u,v)=>rearPoint((u-.5)*.35,.47+v*.09,.015)),black);
  for(const side of [-1,1])for(const dz of [-.067,.067]){
    const z=side*.60+dz,p=rearPoint(z,.255,.015),tip=mesh(new THREE.CylinderGeometry(.039,.039,.065,24,1,true),alloy);tip.rotation.z=Math.PI/2;tip.position.set(p[0]+.014,.255,p[2]);
    const hole=mesh(new THREE.CircleGeometry(.032,24),black);hole.rotation.y=Math.PI/2;hole.position.set(p[0]+.048,.255,p[2]);
  }
  // Tyres have a broad tread and rounded sidewalls, not inflated torus rings.
  const wheels=[];
  for(const [axle,track,width] of [[-1.50,1.680,.265],[1.45,1.651,.295]])for(const side of [-1,1]){
    const w=new THREE.Group();w.position.set(axle,.365,side*track/2);if(side<0)w.rotation.y=Math.PI;car.add(w);wheels.push(w);
    const tireProfile=[[.263,-width*.49],[.296,-width*.51],[.339,-width*.46],[.361,-width*.34],[.365,-width*.20],[.365,width*.20],[.361,width*.34],[.339,width*.46],[.296,width*.51],[.263,width*.49]].map(p=>new THREE.Vector2(...p));
    const tire=mesh(new THREE.LatheGeometry(tireProfile,80),rubber,w);tire.rotation.x=Math.PI/2;
    const outer=width*.51;
    for(const r of [.288,.337]){const bead=mesh(new THREE.TorusGeometry(r,.0016,4,80),graphite,w);bead.position.z=outer*(r<.3?1:.91);}
    const barrel=mesh(new THREE.CylinderGeometry(.268,.268,width*.89,64,1,true),graphite,w);barrel.rotation.x=Math.PI/2;
    const rim=mesh(new THREE.TorusGeometry(.265,.008,8,80),alloy,w);rim.position.z=outer+.001;
    const disc=mesh(new THREE.CylinderGeometry(.209,.209,.012,64),rotor,w);disc.rotation.x=Math.PI/2;disc.position.z=outer-.052;
    for(let i=0;i<32;i++){const a=i/32*Math.PI*2;for(const rr of [.164,.191]){const hole=mesh(new THREE.CircleGeometry(.0044,6),black,w);hole.position.set(Math.cos(a)*rr,Math.sin(a)*rr,outer-.044);hole.castShadow=false;}}
    const ring=mesh(new THREE.TorusGeometry(.190,.001,4,64),graphite,w);ring.position.z=outer-.044;
    for(let i=0;i<10;i++){
      const a=i/10*Math.PI*2,twist=i%2?.06:-.06;
      const spoke=mesh(grid(16,3,(u,v)=>{const r=.055+u*.205,b=a+twist*u+(v-.5)*mix(.22,.07,u);return[Math.sin(b)*r,Math.cos(b)*r,outer+.006-.022*Math.sin(u*Math.PI)];}),alloy,w);
      spoke.castShadow=false;
    }
    const hub=mesh(new THREE.CylinderGeometry(.056,.056,.022,32),alloy,w);hub.rotation.x=Math.PI/2;hub.position.z=outer+.001;
    const cap=mesh(new THREE.CircleGeometry(.034,24),graphite,w);cap.position.z=outer+.013;
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2,b=mesh(new THREE.SphereGeometry(.006,8,6),alloy,w);b.position.set(Math.cos(a)*.043,Math.sin(a)*.043,outer+.015);}
    // Brake calipers remain fixed while the wheel group rotates.
    box(.055,.126,.044,axle+.155,.385,side*(track/2+outer-.07),brake);
  }
  // Batch all static surfaces by material, retaining independent wheel transforms.
  function batch(parent){const groups=new Map();for(const o of [...parent.children]){if(!o.isMesh)continue;o.updateMatrix();let g=o.geometry.clone().applyMatrix4(o.matrix);if(g.index){const n=g.toNonIndexed();g.dispose();g=n;}if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(g);parent.remove(o);o.geometry.dispose();}
    for(const [m,parts] of groups){const count=parts.reduce((n,g)=>n+g.attributes.position.array.length,0),p=new Float32Array(count),n=new Float32Array(count);let at=0;for(const g of parts){p.set(g.attributes.position.array,at);n.set(g.attributes.normal.array,at);at+=g.attributes.position.array.length;g.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.computeBoundingSphere();mesh(g,m,parent);}}
  batch(car);for(const w of wheels)batch(w);
  car.userData.dimensions={length:5.052,width:1.937,height:1.423,wheelbase:2.95};
  return{car,wheels,paint};
}
