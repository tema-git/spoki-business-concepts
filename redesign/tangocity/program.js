"use strict";

// Dates of the announcement and of the event have different meanings.
// The two lists use separate fields; undated headlines stay in News only.
(() => {
  const upcoming = document.getElementById("event-upcoming");
  const archive = document.getElementById("event-archive");
  const feed = document.getElementById("news-feed");
  if (!upcoming && !feed) return;
  const months = "января февраля марта апреля мая июня июля августа сентября октября ноября декабря".split(" ");
  const dayFormat = new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",timeZone:"UTC"});
  const pubFormat = new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});
  const msDay = 86400000;
  const verified = new Map([
    [37610,{day:"2026-11-24",title:"Практика с Инессой Дехтяревой",note:"19:00–21:30 · клуб «Жар-птица». Время для самостоятельной работы и вопросов преподавателю."}],
    [37607,{day:"2026-11-22",title:"Воскресная милонга",note:"18:00–21:00 · клуб «Жар-птица». Танцевальный вечер с музыкой Инессы."}],
    [37586,{day:"2026-06-03",title:"Открытый урок в парке",note:"18:00–19:00 · парк «Усадьба Трубецких». Открытое занятие с Аланом и Дарьей Цаголовыми."}]
  ]);
  function readPost(raw) {
    if (!Number.isInteger(raw.id) || raw.link !== "https://tangocity.ru/archives/" + raw.id ||
        !/^\d{4}-\d{2}-\d{2}T/.test(raw.date) || typeof raw.title?.rendered !== "string") return null;
    const fragment = document.createElement("template");
    fragment.innerHTML = raw.title.rendered;
    const title = fragment.content.textContent.trim();
    const day = raw.date.slice(0,10);
    if (!title || !Number.isFinite(Date.parse(day + "T12:00:00Z"))) return null;
    return {id:raw.id, title, day, link:raw.link};
  }
  function eventFor(post) {
    const known = verified.get(post.id);
    if (known) return {...known, link:post.link};
    if (!/^(практика\s+танго|милонга\s|открытый\s+урок|бесплатный\s+открытый\s+урок|концерт\s)/iu.test(post.title) ||
      /отмен|перенос|перенес[её]н|изменени|\d\s*[-–—]\s*\d/iu.test(post.title)) return null;
    const dates = [...post.title.toLowerCase().matchAll(/(?:^|\s)(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+(20\d{2}))?/gu)];
    if (dates.length !== 1) return null;
    const [,d,m,y] = dates[0];
    const published = new Date(post.day + "T00:00:00Z");
    const year = published.getUTCFullYear();
    const month = months.indexOf(m);
    const candidates = (y ? [Number(y)] : [year-1, year, year+1]).map(n => new Date(Date.UTC(n,month,Number(d))))
      .filter(date => date.getUTCMonth() === month && Math.abs(date-published) <= msDay*100)
      .sort((a,b) => Math.abs(a-published)-Math.abs(b-published));
    if (!candidates.length) return null;
    return {day:candidates[0].toISOString().slice(0,10), title:post.title, note:"Время, адрес и условия указаны в объявлении школы.",link:post.link};
  }
  function node(tag,cl,text) {
    const el=document.createElement(tag);
    if (cl) el.className=cl;
    if (text) el.textContent=text;
    return el;
  }
  function anchor(title,href,cls) {
    const a=node("a",cls,title);
    a.href=href;
    return a;
  }
  function ticket(event) {
    const item=node("li","event-ticket");
    const value=new Date(event.day+"T12:00:00Z");
    const date=node("time","event-date",dayFormat.format(value));
    date.dateTime=event.day;
    date.append(node("span","",String(value.getUTCFullYear())));
    const copy=node("div","line-content");
    const title=node("h3");
    title.append(anchor(event.title,event.link));
    copy.append(title,node("p","",event.note));
    item.append(date,copy,anchor("Объявление",event.link,"text-link"));
    return item;
  }
  function showProgram(posts) {
    const events = new Map([...verified].map(([id,event]) => [id,{...event,link:"https://tangocity.ru/archives/"+id}]));
    for (const post of posts) {
      const event=eventFor(post);
      if (event) events.set(post.id,event);
    }
    const today = new Date(Date.now()+3*3600000).toISOString().slice(0,10);
    const sorted=[...events.values()].sort((a,b)=>a.day.localeCompare(b.day));
    const future=sorted.filter(event=>event.day>=today);
    if (future.length) {
      const list=node("ul","event-list");
      list.replaceChildren(...future.map(ticket));
      upcoming.replaceChildren(list);
    }
    archive.replaceChildren(...sorted.filter(event=>event.day<today).reverse().slice(0,8).map(ticket));
  }
  function renderNews(posts) {
    const items=posts.slice(0,10).map(post=>{
      const li=node("li");
      const date=node("time","",pubFormat.format(new Date(post.day+"T12:00:00Z")));
      date.dateTime=post.day;
      const heading=node("h3");
      heading.append(anchor(post.title,post.link,"news-title"));
      li.append(date,heading);
      return li;
    });
    if (items.length) feed.replaceChildren(...items);
  }
  async function refresh() {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),6000);
    try {
      const response=await fetch("https://tangocity.ru/wp-json/wp/v2/posts?per_page=18&_fields=id,date,link,title",{
        signal:controller.signal,credentials:"omit",referrerPolicy:"no-referrer"
      });
      if (!response.ok) return;
      const raw=await response.json();
      if (!Array.isArray(raw)) return;
      const posts=raw.map(readPost).filter(Boolean);
      if (feed) renderNews(posts);
      if (upcoming) showProgram(posts);
    } catch {
      // The published issue is already visible in the static HTML.
    } finally { clearTimeout(timer); }
  }
  refresh();
})();
