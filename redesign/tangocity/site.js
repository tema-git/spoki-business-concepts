"use strict";

const siteMenu = document.querySelector(".site-menu");
if (siteMenu) {
  siteMenu.addEventListener("keydown", event => {
    if (event.key === "Escape" && siteMenu.open) {
      siteMenu.open = false;
      siteMenu.querySelector("summary").focus();
    }
  });
  siteMenu.addEventListener("click", event => { if (event.target.closest("a")) siteMenu.open = false; });
  document.addEventListener("click", event => { if (!siteMenu.contains(event.target)) siteMenu.open = false; });
  document.addEventListener("focusin", event => { if (!siteMenu.contains(event.target)) siteMenu.open = false; });
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
let pointerFrame = 0;
let currentTarget;
let mouseX = 0;
let mouseY = 0;
function moveDecoration(target, x, y) {
  const smallY = (y * 4).toFixed(2) + "px";
  target.style.setProperty("--px", (x * 9).toFixed(2) + "px");
  target.style.setProperty("--py", smallY);
  target.style.setProperty("--tilt", (x * .65).toFixed(2) + "deg");
  target.style.setProperty("--mx", (x * 3).toFixed(2) + "px");
  target.style.setProperty("--my", (y * 2).toFixed(2) + "px");
}
document.addEventListener("pointermove", event => {
  if (reduceMotion.matches || !finePointer.matches || event.pointerType === "touch") return;
  const target = event.target.closest(".header-contact, .scene");
  if (target !== currentTarget) {
    if (currentTarget) moveDecoration(currentTarget, 0, 0);
    currentTarget = target;
  }
  if (!target) return;
  mouseX = event.clientX;
  mouseY = event.clientY;
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    if (!currentTarget) return;
    const bounds = currentTarget.getBoundingClientRect();
    moveDecoration(currentTarget, (mouseX - bounds.left) / bounds.width * 2 - 1, (mouseY - bounds.top) / bounds.height * 2 - 1);
  });
}, { passive: true });
document.addEventListener("pointerout", event => {
  if (!event.relatedTarget && currentTarget) {
    moveDecoration(currentTarget, 0, 0);
    currentTarget = null;
  }
});



// The cursor has two soles. Footprints are left at travelled distances in the
// visual fields. Text, links, form controls and the map retain native cursors.
(() => {
  const selector=".hero, .rhythm, .first-lesson, .folio-hero";
  const native="a, button, summary, label, input, textarea, iframe, video, p, h1, h2, h3, figcaption, output, .faq";
  const base=document.documentElement.dataset.base || "./";
  const href=base+"assets/ui.svg?v=3#heel";
  const cursor=document.createElement("div");
  cursor.className="shoe-cursor";cursor.hidden=true;cursor.setAttribute("aria-hidden","true");
  cursor.innerHTML='<svg viewBox="0 0 42 46"><g class="shoe-left"><use href="'+href+'" x="-6" y="-12" width="13" height="26"/></g><g class="shoe-right"><use href="'+href+'" x="-6" y="-12" width="13" height="26"/></g></svg>';
  const tracks=document.createElement("div");
  tracks.className="cursor-tracks";tracks.setAttribute("aria-hidden","true");
  document.body.append(tracks,cursor);
  let field=null,lastX=0,lastY=0,lastTime=0,heading=0,left=false;
  function clear() {
    field?.classList.remove("has-shoe-cursor");field=null;cursor.hidden=true;tracks.replaceChildren();
  }
  function stamp(x,y,angle,light){
    const el=document.createElement("span");
    const a=angle*Math.PI/180, side=left?-5:5;
    el.className="shoe-stamp"+(light?" on-wine":"");
    el.style.left=(x+Math.cos(a)*side)+"px";el.style.top=(y+Math.sin(a)*side)+"px";
    el.style.setProperty("--angle",angle+"deg");el.style.setProperty("--flip",left?"-1":"1");
    el.innerHTML='<svg viewBox="0 0 13 26"><use href="'+href+'" width="13" height="26"/></svg>';
    if(tracks.children.length>=10)tracks.firstElementChild.remove();
    tracks.append(el);el.addEventListener("animationend",()=>el.remove(),{once:true});
    left=!left;cursor.classList.toggle("left-leads",left);
  }
  document.addEventListener("pointermove",e=>{
    if(e.pointerType!=="mouse" || !finePointer.matches || reduceMotion.matches) {if(field)clear();return;}
    const next=e.target.closest(selector);
    if(!next || e.target.closest(native)) {if(field)clear();return;}
    const light=next.classList.contains("dark");
    const now=performance.now(), x=e.clientX,y=e.clientY;
    if(next!==field){
      clear();field=next;field.classList.add("has-shoe-cursor");cursor.hidden=false;
      lastX=x;lastY=y;lastTime=now;heading=-15;
      stamp(x-6,y+8,heading,light);
    }else{
      const dx=x-lastX,dy=y-lastY;
      if(Math.hypot(dx,dy)>=17 && now-lastTime>=45) {
        heading=Math.atan2(dy,dx)*180/Math.PI+90;
        stamp(lastX,lastY,heading,light);lastX=x;lastY=y;lastTime=now;
      }
    }
    cursor.classList.toggle("on-wine",light);
    cursor.style.transform="translate("+x+"px,"+y+"px) translate(-50%,-50%) rotate("+heading+"deg)";
  },{passive:true});
  document.addEventListener("pointerout",e=>{if(!e.relatedTarget)clear();});
  window.addEventListener("blur",clear);
  window.addEventListener("scroll",clear,{passive:true});
  reduceMotion.addEventListener("change",clear);finePointer.addEventListener("change",clear);
})();
