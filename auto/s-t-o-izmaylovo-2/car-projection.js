import * as T from './vendor/three.module.js';
import {makeCar} from './car-geometry.js?v=dc7ea3decb';

// Reuse the approved 3D geometry for the water scene and the canvas wash game.
// The game keeps its existing foam, water, progress and input behavior.
let projection;
export function renderCarProjection(){return projection??=createProjection();}

async function createProjection(){
 const width=1000,height=560,canvas=document.createElement('canvas');
 canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 let renderer,environment;
 try{
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
  renderer.setSize(width,height,false);renderer.setClearColor(0,0);
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  const scene=new T.Scene(),{car}=await makeCar();scene.add(car);
  const studio=new T.Scene();studio.background=new T.Color(0x39434d);
  for(const [x,y,z,w,h,p] of [[0,6,0,9,4,3.1],[-3,3,5,7,1.3,3.2],[1,2.7,-5,7,1.2,2.8],[5,2.5,1,3,4,2.1]]){
   const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color().setScalar(p),side:T.DoubleSide}));
   panel.position.set(x,y,z);panel.lookAt(0,.6,0);studio.add(panel);
  }
  const pmrem=new T.PMREMGenerator(renderer);environment=pmrem.fromScene(studio,.065,.1,30);pmrem.dispose();
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  scene.environment=environment.texture;scene.environmentIntensity=.95;
  scene.add(new T.HemisphereLight(0xe5efff,0x455047,.65));
  const key=new T.DirectionalLight(0xfff5e8,2.2);key.position.set(-3,6,5);scene.add(key);
  const rim=new T.DirectionalLight(0xb6d8eb,1.15);rim.position.set(3,3,-5);scene.add(rim);
  const span=5.50,camera=new T.OrthographicCamera(-span/2,span/2,span*height/width/2,-span*height/width/2,.1,40);
  camera.position.set(-.03,1.02,15);camera.lookAt(-.03,1.02,0);
  renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0);
 }catch(error){
  const image=new Image();image.src=new URL('./fallback.svg',import.meta.url).href;await image.decode();
  ctx.drawImage(image,0,35,width,height-35);
  console.warn('Using the coupe vector fallback for the wash scene.',error.message);
 }finally{environment?.dispose();renderer?.dispose();renderer?.forceContextLoss();}
 const pixels=ctx.getImageData(0,0,width,height).data;
 const silhouette=new Path2D();
 // Horizontal alpha runs preserve the wing openings and both wheel outlines.
 for(let y=0;y<height;y+=2){
  let start=-1;
  for(let x=0;x<=width;x++){
   const filled=x<width&&pixels[(y*width+x)*4+3]>80;
   if(filled&&start<0)start=x;
   if(!filled&&start>=0){silhouette.rect(start,y,x-start,2);start=-1;}
  }
 }
 const contains=(x,y)=>x>=0&&x<width&&y>=0&&y<height&&pixels[(Math.floor(y)*width+Math.floor(x))*4+3]>80;
 return {canvas,silhouette,contains};
}

for(const host of document.querySelectorAll('[data-car-projection]')){
 renderCarProjection().then(({canvas})=>{
  host.width=canvas.width;host.height=canvas.height;host.getContext('2d').drawImage(canvas,0,0);
  host.dataset.carModel='reference-01-911';host.dataset.renderState='ready';
 }).catch(error=>{host.dataset.renderState='fallback';console.warn('Coupe projection unavailable.',error.message);});
}
