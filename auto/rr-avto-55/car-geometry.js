import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/loaders/DRACOLoader.js';

// Adapted from Karol Miklas / Lionsharp Studios, CC BY-SA 4.0.
// See models/LICENSE.html for the source, licence and adaptation record.
async function buildAccurateCar(){
 const draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/draco/gltf/',import.meta.url).href);draco.setWorkerLimit(1);
 const loader=new GLTFLoader();loader.setDRACOLoader(draco);
 let gltf;try{gltf=await loader.loadAsync(new URL('./models/reference-911.glb',import.meta.url).href);}finally{draco.dispose();}
 const source=gltf.scene;
 source.getObjectByName('Plane')?.removeFromParent();
 const rotated=new T.Group();rotated.rotation.y=-Math.PI/2;rotated.add(source);rotated.updateMatrixWorld(true);
 // Bake the author transforms into a clean, Y-up, front-negative-X hierarchy.
 const base=new T.Group();
 const paint=new T.MeshPhysicalMaterial({name:'reference-paint',color:0x8298a4,metalness:.55,roughness:.25,clearcoat:1,clearcoatRoughness:.14,side:T.DoubleSide});
 const stats=[];
 source.traverse(o=>{
  if(!o.isMesh)return;
  const material=o.material.clone(),name=material.name;
  if(name==='coat')return;
  if(name==='license'){material.map=null;material.color.set(0x182028);}
  if(name==='paint'){
   const part=new T.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),paint);part.name=o.name;base.add(part);return;
  }
  if(name==='rubber'){material.roughness=.86;material.metalness=0;}
  if(name==='window'){material.color.set(0x172635);material.roughness=.13;material.metalness=.15;}
  if(name==='lights'){material.transmission=0;material.transparent=true;material.opacity=.16;material.depthWrite=false;}
  const part=new T.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),material);part.name=o.name;base.add(part);stats.push({name:o.name,material:name});
 });
 // Align axle centres rather than stretching the silhouette by its bounding box.
 let fmin=Infinity,fmax=-Infinity,rmin=Infinity,rmax=-Infinity,minY=Infinity,maxY=-Infinity;
 base.traverse(o=>{if(!o.isMesh||o.material.name!=='rubber')return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(x<-.4){fmin=Math.min(fmin,x);fmax=Math.max(fmax,x);}else if(x>.4){rmin=Math.min(rmin,x);rmax=Math.max(rmax,x);}}});
 const front=(fmin+fmax)/2,rear=(rmin+rmax)/2,scale=2.56/(rear-front),offsetX=-1.36-front*scale;
 if(!Number.isFinite(scale)||scale<=0)throw new Error('Invalid wheel calibration');
 const transform=new T.Matrix4().makeScale(scale,scale,scale);transform.setPosition(offsetX,-minY*scale,0);
 for(const part of base.children){part.geometry.applyMatrix4(transform);part.geometry.computeBoundingSphere();part.castShadow=true;part.receiveShadow=!['glass','lights','window'].includes(part.material.name);if(part.material.transparent)part.castShadow=false;}
 const car=new T.Group();car.add(base);
 const weave=document.createElement('canvas');weave.width=weave.height=64;
 const context=weave.getContext('2d');
 for(let row=0;row<8;row++)for(let column=0;column<8;column++){
  const vertical=(row+column)%4<2;
  const gradient=context.createLinearGradient(column*8,row*8,column*8+(vertical?8:0),row*8+(vertical?0:8));
  gradient.addColorStop(0,'#10171c');gradient.addColorStop(.45,vertical?'#293138':'#222a30');gradient.addColorStop(1,'#12191e');
  context.fillStyle=gradient;context.fillRect(column*8,row*8,8,8);
 }
 const weaveTexture=new T.CanvasTexture(weave);weaveTexture.wrapS=weaveTexture.wrapT=T.RepeatWrapping;weaveTexture.repeat.set(12,7);weaveTexture.colorSpace=T.SRGBColorSpace;weaveTexture.anisotropy=4;
 const carbon=new T.MeshPhysicalMaterial({color:0xffffff,map:weaveTexture,metalness:.2,roughness:.43,clearcoat:.4,clearcoatRoughness:.26,side:T.DoubleSide});
 const add=(g,m=carbon)=>{const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;car.add(o);return o;};
 const grid=(nx,ny,fn)=>{const p=[],uv=[],idx=[];for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){p.push(...fn(i/nx,j/ny));uv.push(i/nx,j/ny);}for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const a=i*(ny+1)+j,b=a+ny+1;idx.push(a,a+1,b,b,a+1,b+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;};
 base.updateMatrixWorld(true);const ray=new T.Raycaster();
 const topAt=(x,z,target=base)=>{ray.set(new T.Vector3(x,3,z),new T.Vector3(0,-1,0));return ray.intersectObject(target,true)[0]?.point.y;};
 // The selected first concept's two carbon bonnet strips follow the actual mesh.
 // A smooth bonnet only needs a modest sampling grid, restricted to its paint mesh.
 const bonnet=base.getObjectByName('boot.008_0')??base;
 for(const side of [-1,1])add(grid(16,6,(u,v)=>{const x=-2.00+u*1.13,z=side*(.060+v*(.27+.22*u-.060)),y=topAt(x,z,bonnet);return[x,(y??.60)+.0025,z];}));
 // A compact fixed rear wing, keeping the selected concept's treatment.
 const wingY=1.25;
 for(const side of [-1,1]){
  const z=side*.56,y=topAt(1.68,z)??.88;
  add(grid(12,4,(u,v)=>[1.68+u*.20+(v-.5)*.060,y+(wingY-y-.025)*u,z]));
 }
 add(grid(20,64,(u,v)=>[1.64+u*.35,wingY+.020*Math.sin(Math.PI*u)+.012*(2*v-1)**2,(v-.5)*1.96]));
 for(const side of [-1,1]){
  const shape=new T.Shape();shape.moveTo(1.62,wingY-.040);shape.lineTo(2.02,wingY+.050);shape.lineTo(2.00,wingY-.035);shape.lineTo(1.65,wingY-.075);shape.closePath();
  const end=add(new T.ExtrudeGeometry(shape,{depth:.010,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.003,bevelThickness:.003}));end.position.z=side*.98;
 }
 car.name='reference-01-accurate-911';car.userData={variant:'01',sourceModel:'Karol Miklas / Lionsharp Studios Porsche 911 Carrera 4S',licence:'CC-BY-SA-4.0',frontAxle:-1.36,rearAxle:1.2,wheelCentreY:(maxY-minY)*scale/2,sourceCalibration:{front,rear,scale,offsetX},parts:stats};
 console.info('Reference 01 calibrated model',JSON.stringify({front,rear,scale,offsetX,parts:base.children.length,bounds:new T.Box3().setFromObject(car).getSize(new T.Vector3()).toArray()}));
 return{car};
}

let approvedModel;
export async function makeCar(){
 const {car}=await (approvedModel??=buildAccurateCar());
 return {car:car.clone(true),wheels:[]};
}
