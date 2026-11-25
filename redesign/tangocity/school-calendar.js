"use strict";

// WordPress advertises this public endpoint as the alternate representation
// of /shkola/raspisanie. Only recognized group, date, time and fee fields enter the UI.
const calendarEndpoint = "https://tangocity.ru/wp-json/wp/v2/pages/5802?_fields=link,content.rendered";
const calendarMonths = "января февраля марта апреля мая июня июля августа сентября октября ноября декабря".split(" ");
const calendarWeek = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

function schoolDate(row, today) {
  const value = row.querySelector(".col-date").textContent.trim().toLowerCase();
  const match = /^(\d{1,2})\s+([а-яё]+)/u.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = calendarMonths.indexOf(match[2]);
  const weekday = row.querySelector(".col-day")?.textContent.trim().toLowerCase();
  if (month < 0) return null;
  const year = today.getUTCFullYear();
  for (const candidateYear of [year, year - 1, year + 1]) {
    const candidate = new Date(Date.UTC(candidateYear, month, day));
    if (candidate.getUTCMonth() === month && calendarWeek[candidate.getUTCDay()] === weekday &&
      Math.abs(candidate - today) <= 32 * 86400000) return candidate;
  }
  return null;
}

function knownGroup(text) {
  const name = text.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  if (name.includes("с нуля")) {
    const number = /[#№]\s*([123])\b/.exec(name);
    return number ? "zero" + number[1] : null;
  }
  if (/^начинающие вс(?:\s|$)/u.test(name)) return "beginner";
  if (/^продолжающие\s*[#№]\s*2\b/u.test(name)) return "intermediate";
  if (/^продвинутые(?:\s|$)/u.test(name)) return "advanced";
  return null;
}

function readFee(block) {
  const amount = /^(\d[\d\s]*?)\s*(?:₽|руб\.?)?\s*\/\s*([12])\s*урок/iu.exec(block?.textContent.trim() || "");
  if (!amount) return null;
  const fee = Number(amount[1].replace(/\s/g,""));
  return fee > 0 && fee < 100000 ? { fee, units: Number(amount[2]) } : null;
}

function parseSchoolCalendar(rendered, now) {
  // Template contents stay inert. No markup, links or media from the feed are mounted.
  const template = document.createElement("template");
  template.innerHTML = rendered;
  const table = template.content.querySelector(".schedule-wrapper table.shedule");
  if (!table) return null;
  const moscow = new Date(now + 3 * 3600000);
  const today = new Date(Date.UTC(moscow.getUTCFullYear(), moscow.getUTCMonth(), moscow.getUTCDate()));
  const dates = [];
  const entries = [];
  const feesByGroup = new Map();
  for (const row of table.querySelectorAll("tbody tr")) {
    if (!row.querySelector(".col-date")) continue;
    const date = schoolDate(row, today);
    if (!date || (dates.length && date < dates[dates.length - 1])) return null;
    if (!dates.length || date > dates[dates.length - 1]) dates.push(date);
    const venueCell=row.querySelector(".col-addr");
    const rooms=venueCell?.querySelectorAll(".sess-block");
    const names = row.querySelectorAll(".col-group .sess-block");
    const times = row.querySelectorAll(".col-time .sess-block");
    const prices = row.querySelectorAll(".col-price .sess-block");
    names.forEach((name, index) => {
      const id = knownGroup(name.textContent);
      const venue=rooms?.length ? rooms.length===names.length && rooms[index] : venueCell;
      const room=venue?.textContent?.replace(/\s+/g," ").trim();
      if (!room || /^все залы$/iu.test(room) || room.length>200) return;
      const place=/^зал\s*[№#]?\s*1[\s·,–—-]+(?:м\.\s*)?смоленская$/iu.test(room) ? "" : room;
      const time = /^(\d{2}:\d{2})\s*[-–—]\s*(\d{2}:\d{2})$/.exec(times[index]?.textContent.trim() || "");
      if (!id || !time || time[1] >= time[2] || ![time[1],time[2]].every(t => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t))) return;
      const rate = readFee(prices[index]);
      const key = [id,time[1],time[2],place].join("/");
      entries.push({ date: date.toISOString().slice(0,10), id, start: time[1], end: time[2], place, rate, key });
      if (rate) {
        if (!feesByGroup.has(key)) feesByGroup.set(key, new Map());
        feesByGroup.get(key).set(rate.fee + "/" + rate.units, rate);
      }
    });
  }
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || last < today || last - first > 31 * 86400000) return null;
  const periodPart = d => d.getUTCDate() + " " + calendarMonths[d.getUTCMonth()];
  const period = periodPart(first) + (first.getUTCFullYear() !== last.getUTCFullYear() ? " " + first.getUTCFullYear() : "") +
    " — " + periodPart(last) + " " + last.getUTCFullYear();
  entries.sort((a,b)=>a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const lessons = entries.map(entry => {
    const otherRates = feesByGroup.get(entry.key);
    // A Tuesday line can lack the second tariff. Use a matching explicit rate
    // from the same publication only when every such occurrence agrees.
    const rate = entry.rate || (otherRates?.size === 1 ? otherRates.values().next().value : null);
    return {
      date: entry.date,
      group: { ...tangoSchedule.groups[entry.id], start: entry.start, end: entry.end, place:entry.place, fee: rate?.fee ?? null, units: rate?.units ?? null }
    };
  });
  return { period, lessons };
}

async function fetchSchoolCalendar() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(calendarEndpoint, { credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal });
    if (!response.ok) return null;
    const page = await response.json();
    const html = page.content?.rendered;
    if (page.link !== "https://tangocity.ru/shkola/raspisanie" || typeof html !== "string" || html.length > 300000) return null;
    return parseSchoolCalendar(html, Date.now());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
