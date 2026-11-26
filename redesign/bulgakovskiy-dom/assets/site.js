(() => {
  "use strict";
  const $ = (s, host = document) => host.querySelector(s);
  const $$ = (s, host = document) => [...host.querySelectorAll(s)];
  const root = new URL(document.body.dataset.root, location.href);
  const relative = path => new URL(path, root);
  const view = document.body.dataset.view;
  const label = {sale:"В продаже",soldout:"Билетов нет",ended:"Событие завершено",started:"Сеанс начался",free:"Вход свободный",scheduled:"Условия у организатора"};
  const shortDate = d => new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",timeZone:"Europe/Moscow"}).format(new Date(d+"T12:00:00+03:00"));
  const store = {
    read(key) { try { return JSON.parse(sessionStorage.getItem("buldom-"+key)); } catch { return null; } },
    write(key,value) { try { sessionStorage.setItem("buldom-"+key,JSON.stringify(value)); } catch { /* Link parameters still work. */ } }
  };
  const detailPath = (id,day,time) => {
    const url = relative("programmy/"+encodeURIComponent(id)+".html");
    if (day && time) { url.searchParams.set("date",day); url.searchParams.set("time",time); }
    return url;
  };
  function currentStatus(row) {
    if (row.status === "ended") return "ended";
    const start = Date.parse(row.date+"T"+row.time+":00+03:00");
    if (Date.now() >= start + row.minutes*60000) return "ended";
    if (Date.now() >= start) return "started";
    return row.status;
  }
  const data = $("#program-data") ? JSON.parse($("#program-data").textContent) : null;
  const knownTypes = ["all","play","tour"];
  const knownBoards = ["index.html","afisha.html"];
  function boardHref(state, anchor="vybor") {
    const url = relative(knownBoards.includes(state?.file) ? state.file : "afisha.html");
    if (/^\d{4}-\d{2}-\d{2}$/.test(state?.date)) url.searchParams.set("date",state.date);
    if (knownTypes.includes(state?.type) && state.type!=="all") url.searchParams.set("type",state.type);
    if (state?.archive) url.searchParams.set("archive","1");
    url.hash=anchor;
    return url;
  }
  const boardFromParams = () => {
    const q=new URLSearchParams(location.search);
    if (!knownBoards.includes(q.get("from"))) return store.read("board");
    return {file:q.get("from"),date:q.get("day")||"",type:q.get("kind")||"all",archive:q.get("past")==="1"};
  };
  function addContext(url, state) {
    if (!state) return url;
    url.searchParams.set("from",state.file);
    if (state.date) url.searchParams.set("day",state.date);
    if (state.type!=="all") url.searchParams.set("kind",state.type);
    if (state.archive) url.searchParams.set("past","1");
    return url;
  }
  function setResumeLinks() {
    let saved = store.read("session");
    if(view==="game"){
      const params=new URLSearchParams(location.search);
      const id=params.get("program"),date=params.get("date"),time=params.get("time");
      if(/^[a-z]+(?:-[a-z]+)*$/.test(id||"") && /^\d{4}-\d{2}-\d{2}$/.test(date||"") && /^\d{2}:\d{2}$/.test(time||""))
        saved={id,date,time,board:boardFromParams()};
    }
    for (const a of $$("[data-resume]")) {
      if (saved && /^[a-z-]+$/.test(saved.id)) {
        a.href=addContext(detailPath(saved.id,saved.date,saved.time),saved.board);
        a.firstChild.textContent="К своему сеансу ";
      } else {
        a.href=boardHref(boardFromParams()); a.firstChild.textContent="К выбору сеанса ";
      }
    }
    if(saved?.id && view!=="game"){
      for(const a of $$('a[href*="igra.html"]')){
        const url=relative("igra.html");
        url.search=new URLSearchParams({program:saved.id,date:saved.date,time:saved.time});
        a.href=addContext(url,saved.board);
      }
    }
    for (const a of $$("[data-board-back]")) a.href=boardHref(boardFromParams());
  }
  const dlg=$("#site-menu"), opener=$("[data-menu]");
  if (dlg && opener) {
    opener.addEventListener("click",e=>{e.preventDefault(); dlg.showModal(); opener.setAttribute("aria-expanded","true"); $(".close",dlg).focus();});
    $(".close",dlg).addEventListener("click",()=>dlg.close());
    dlg.addEventListener("click",e=>{ if(e.target!==dlg) return; const r=dlg.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dlg.close(); });
    dlg.addEventListener("close",()=>{opener.setAttribute("aria-expanded","false");opener.focus({preventScroll:true});});
  }
  if (data && (view==="home" || view==="board")) {
    const {sessions,programs} = data;
    const ids=new Map(programs.map(p=>[p.id,p]));
    const feature=$("#feature"), list=$("#day-list"), empty=$("#no-events");
    const allRows=$$("[data-row]",list), groups=$$(".day-group",list);
    const toggle=$(".date-toggle"), pop=$("#date-pop"), dateText=$(".date-label",toggle);
    let state, visibleLimit, featured;
    function readQuery() {
      const q=new URLSearchParams(location.search);
      const date=sessions.some(r=>r.date===q.get("date")) ? q.get("date") : "";
      return {file:view==="home"?"index.html":"afisha.html",date,type:knownTypes.includes(q.get("type"))?q.get("type"):"all",archive:q.get("archive")==="1"};
    }
    function select(patch) {
      const next={...state,...patch};
      const url=boardHref(next,"");
      if (url.search!==location.search) history.pushState(null,"",url);
      state=next;
      visibleLimit=view==="home"?6:Infinity;
      refresh();
      if(featured)remember(featured);
    }
    function closeDates(focus=false) {
      pop.hidden=true; toggle.setAttribute("aria-expanded","false");
      if (focus) toggle.focus();
    }
    toggle.addEventListener("click",e=>{
      e.preventDefault();
      if (!pop.hidden) {closeDates(true);return;}
      toggle.setAttribute("aria-expanded","true");pop.hidden=false;
      ($('[aria-current="date"]',pop)||$("a",pop)).focus({preventScroll:true});
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pop.hidden){e.preventDefault();closeDates(true);}});
    document.addEventListener("pointerdown",e=>{if(!pop.hidden&&!e.target.closest(".date-control")) closeDates();});
    document.addEventListener("focusin",e=>{if(!pop.hidden&&!e.target.closest(".date-control")) closeDates();});
    $$("[data-date]",pop).forEach(a=>a.addEventListener("click",e=>{e.preventDefault();select({date:a.dataset.date,archive:false});closeDates(true);}));
    $$("[data-filter]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();select({type:a.dataset.filter});}));
    $("[data-archive]").addEventListener("click",e=>{e.preventDefault();select({archive:!state.archive,date:""});});
    $("#more-sessions")?.addEventListener("click",()=>{visibleLimit+=6;refresh();});
    function showFeature(row) {
      const p=ids.get(row.programId), status=currentStatus(row);
      const field=n=>$('[data-field="'+n+'"]',feature);
      field("type").textContent=p.type==="play"?"Спектакль":p.type==="tour"?"Экскурсия":"Литературный салон";
      field("date").textContent=shortDate(row.date); field("date").dateTime=row.date;
      field("time").textContent=row.time; field("time").dateTime=row.date+"T"+row.time+":00+03:00";
      for (const k of ["title","venue","age","duration"]) field(k).textContent=p[k];
      field("title").textContent=p.title.replaceAll("302-БИС","302‑БИС");
      field("price").textContent=row.free?"Вход свободный":status==="sale"?row.price:label[status];
      field("price").hidden=status!=="sale"&&!row.free;
      const art=field("art"), img=field("image");
      if (img.getAttribute("src")!==p.media) img.setAttribute("src",p.media);
      img.alt=p.alt;
      img.width=p.width; img.height=p.height;
      art.classList.toggle("photo",p.role!=="poster");
      const details=field("details"); details.href=addContext(detailPath(p.id,row.date,row.time),state);
      details.firstChild.textContent=p.type==="play"?"О спектакле ":p.type==="tour"?"О программе ":"О встрече ";
      const buy=field("buy");
      buy.hidden=status!=="sale" || !row.url;
      if(!buy.hidden) buy.href=row.url; else buy.removeAttribute("href");
      field("result").hidden=status==="sale"; field("result").textContent=status==="soldout"?"Распродано":label[status];
      feature.hidden=false;
    }
    function remember(row) {
      store.write("session",{id:row.programId,date:row.date,time:row.time,board:state});
      store.write("board",state);setResumeLinks();
    }
    function refresh() {
      dateText.textContent=state.date?shortDate(state.date):"Выбрать дату";
      dateText.classList.toggle("default",!state.date);
      toggle.setAttribute("aria-label",state.date?"Дата — "+shortDate(state.date):"Выбрать дату");
      store.write("board",state);
      for (const a of $$("[data-filter]")) {
        a.setAttribute("aria-current",String(a.dataset.filter===state.type));
        a.href=boardHref({...state,type:a.dataset.filter},"");
      }
      for (const a of $$("[data-date]",pop)) {
        if (a.dataset.date===state.date) a.setAttribute("aria-current","date"); else a.removeAttribute("aria-current");
        a.href=boardHref({...state,date:a.dataset.date,archive:false},"");
      }
      const matching=sessions.filter(row=>{
        if (state.type!=="all" && ids.get(row.programId).type!==state.type) return false;
        if (state.date) return row.date===state.date;
        return (currentStatus(row)==="ended")===state.archive;
      });
      const future=matching.filter(r=>currentStatus(r)==="sale");
      featured=future[0]||matching[0];
      const seasonEnded=!state.date&&!state.archive&&sessions.every(r=>currentStatus(r)==="ended");
      if(!featured&&seasonEnded){
        featured=sessions.filter(r=>state.type==="all"||ids.get(r.programId).type===state.type).at(-1);
      }
      if (featured) showFeature(featured); else feature.hidden=true;
      empty.hidden=matching.length>0;
      $("h2",empty).textContent=seasonEnded?"Новые даты у организатора":"Сеансов в подборке нет";
      $("p",empty).textContent=seasonEnded?"Сеансы этого выпуска завершились. Дальнейшее расписание публикует музей-театр.":"Выберите другую дату или посмотрите расписание организатора.";
      $("#list-heading").textContent=state.archive?"Архив афиши":state.date?"Сеансы на "+shortDate(state.date):"Ближайшие сеансы";
      $("[data-archive]").firstChild.textContent=state.archive?"К ближайшим событиям ":"Архив афиши ";
      const visible=new Set(matching.slice(0,visibleLimit));
      allRows.forEach((el,i)=>{
        const row=sessions[i],status=currentStatus(row);
        el.hidden=!visible.has(row); if (el.hidden) return;
        const url=addContext(detailPath(row.programId,row.date,row.time),state);
        $(".session-title",el).href=url;
        const link=$(".row-go",el);
        link.href=status==="sale" ? row.url : url;
        link.firstChild.textContent=status==="sale"?"К билету ":"Подробнее ";
        $(".row-terms",el).textContent=status==="sale"?row.price:[row.free?"Вход свободный":"",label[status]].filter(Boolean).join(" · ");
      });
      groups.forEach(g=>g.hidden=!$("[data-row]:not([hidden])",g));
      if ($("#more-sessions")) $("#more-sessions").hidden=matching.length<=visibleLimit;
      $("#filter-feedback").textContent="Найдено сеансов: "+matching.length;
      $$("[data-full-list]").forEach(a=>a.href=boardHref({...state,file:"afisha.html"},"raspisanie"));
    }
    feature.addEventListener("click",e=>{if(featured&&e.target.closest("a")) remember(featured);});
    list.addEventListener("click",e=>{const row=e.target.closest("[data-row]");if(row&&e.target.closest("a"))remember(sessions[Number(row.dataset.row)]);});
    const start=()=>{state=readQuery();visibleLimit=view==="home"?6:Infinity;refresh();};
    window.addEventListener("popstate",start);
    window.addEventListener("pageshow",start);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
    start();
  }
  if (view==="program" && data) {
    const {sessions,program}=data;
    const q=new URLSearchParams(location.search);
    let current;
    function activate(row, push) {
      current=row;
      const ctx=boardFromParams();
      store.write("session",{id:program.id,date:row.date,time:row.time,board:ctx});setResumeLinks();
      if(push) history.pushState(null,"",addContext(detailPath(program.id,row.date,row.time),ctx));
      $$(".detail-slot").forEach((el,i)=>{
        const active=sessions[i]===row;el.classList.toggle("selected",active);
        $(".choose-slot",el).setAttribute("aria-pressed",String(active));
      });
      const box=$("#chosen"), status=currentStatus(row);
      box.hidden=false;
      $("#chosen-date").textContent=shortDate(row.date)+" · "+row.time;
      $("#chosen-price").textContent=status==="sale"?row.price:[row.free?"Вход свободный":"",label[status]].filter(Boolean).join(" · ");
      const buy=$("#chosen-buy"); buy.hidden=status!=="sale"||!row.url;
      if (!buy.hidden) buy.href=row.url;else buy.removeAttribute("href");
      $("#chosen-source").href=row.statusSource||row.source;
    }
    function fromUrl() {
      const q=new URLSearchParams(location.search);
      const row=sessions.find(r=>r.date===q.get("date")&&r.time===q.get("time"))||sessions.find(r=>currentStatus(r)==="sale")||sessions[0];
      if(row) activate(row,false);
    }
    $$(".detail-slot").forEach((el,i)=>{
      const row=sessions[i];
      $(".choose-slot",el).addEventListener("click",()=>activate(row,true));
      const action=$(".slot-action",el), status=currentStatus(row);
      if (status!=="sale" && action) {action.textContent=label[status];action.removeAttribute("href");}
      if(action) action.addEventListener("click",()=>activate(row,current!==row&&status==="sale"));
    });
    window.addEventListener("popstate",fromUrl);fromUrl();
    const open=$("#open-ticket");
    if(open && Date.now()>Date.parse(open.dataset.through+"T23:59:59+03:00")) {open.removeAttribute("href");open.textContent="Срок билета истёк";}
  }
  const search=$("#dir-search");
  if(search) {
    const normalize=s=>s.toLocaleLowerCase("ru").replaceAll("ё","е").trim();
    function searchDirectory() {
      const term=normalize(search.value); let count=0;
      $$(".directory-section").forEach(group=>{
        let matches=0;
        $$("[data-entry]",group).forEach(a=>{
          const yes=normalize(a.textContent+" "+group.dataset.group).includes(term);
          a.hidden=!yes; if(yes) matches++;
        });
        group.hidden=matches===0;count+=matches;
      });
      $("#dir-status").textContent=term?(count?"Найдено ссылок: "+count:"Совпадений нет. Попробуйте другое слово."):"";
    }
    search.addEventListener("input",searchDirectory);
    search.addEventListener("keydown",e=>{if(e.key==="Escape"){search.value="";searchDirectory();}});
  }
  const game=$("#cat-game");
  if(game) {
    const hints=["на верхнем этаже слева","на верхнем этаже в центре","на верхнем этаже справа","на нижнем этаже слева","на нижнем этаже в центре","на нижнем этаже справа"];
    const windows=$$(".window",game), again=$("#play-again"), live=$("#game-live");
    let target=-1,won=false;
    function reset() {
      const previous=target;
      target=previous<0?Math.floor(Math.random()*6):(previous+1+Math.floor(Math.random()*5))%6;
      won=false; live.textContent="Ищите "+hints[target]+".";
      $("#game-title").textContent="В каком окне кот?";
      windows.forEach((b,i)=>{b.classList.remove("checked","found");b.classList.toggle("target",i===target);b.removeAttribute("aria-disabled");});
      again.hidden=true;if(previous>=0)windows[0].focus({preventScroll:true});
    }
    windows.forEach((b,i)=>b.addEventListener("click",()=>{
      if(won)return;
      if(i===target){won=true;b.classList.add("found");$("#game-title").textContent="Бегемот нашёлся!";live.textContent="Кот сидит "+hints[target]+" и смотрит во двор.";again.hidden=false;windows.forEach(w=>w.setAttribute("aria-disabled","true"));again.focus({preventScroll:true});}
      else{b.classList.add("checked");live.textContent="За этой шторой пусто. Поищите "+hints[target]+".";}
    }));
    again.addEventListener("click",reset);reset();
  }
  const form=$("#draft");
  if(form) {
    const result=$("#draft-result");
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const subject=$("#subject"), question=$("#question");
      for(const el of [subject,question]){
        if(!el.value.trim()){el.setCustomValidity("Заполните поле");el.reportValidity();return;}
      }
      const link=$("#draft-mail");
      link.href="mailto:info@dombulgakova.ru?subject="+encodeURIComponent(subject.value.trim())+"&body="+encodeURIComponent(question.value.trim());
      form.hidden=true;result.hidden=false;link.focus();
    });
    form.addEventListener("input",e=>e.target.setCustomValidity?.(""));
    $("#draft-again").addEventListener("click",()=>{form.hidden=false;result.hidden=true;$("#subject").focus();});
  }
  const motion=matchMedia("(prefers-reduced-motion: reduce)"), fine=matchMedia("(hover: hover) and (pointer: fine)");
  $$(".magnet,.feature,.invite-scene").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      if(motion.matches||!fine.matches)return;
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      if(el.classList.contains("magnet")){
        el.style.setProperty("--mx",(x*7)+"px");el.style.setProperty("--my",(y*6)+"px");
      }else{
        el.style.setProperty("--art-x",(x*6)+"px");el.style.setProperty("--art-y",(y*5)+"px");el.style.setProperty("--illum",String(.62+(x+.5)*.38));
      }
    });
    el.addEventListener("pointerleave",()=>{for(const p of ["--mx","--my","--art-x","--art-y","--illum"])el.style.removeProperty(p);});
  });
  const scenes=$$("[data-scene]"); let frame=0;
  function light(){
    frame=0;
    for(const scene of scenes){
      if(motion.matches){scene.style.removeProperty("--illum");continue;}
      const r=scene.getBoundingClientRect(), progress=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
      scene.style.setProperty("--illum",(.5+.5*progress).toFixed(2));
    }
  }
  if(scenes.length){
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(light);};
    light();window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);
    window.addEventListener("load",schedule);document.fonts.ready.then(schedule);
    const sizeObserver=new ResizeObserver(schedule);scenes.forEach(scene=>sizeObserver.observe(scene));
    motion.addEventListener("change",light);
  }
  setResumeLinks();
})();
