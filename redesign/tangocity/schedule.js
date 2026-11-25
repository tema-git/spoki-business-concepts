// The dated timetable takes precedence over recruitment announcements.
// Source dates and tariff exceptions are documented in DESIGN.md.
const tangoSchedule = {
  period: "23 ноября — 6 декабря 2026",
  levels: {
    zero: { name: "С нуля", description: "Для первого урока и первых двух месяцев занятий." },
    beginner: { name: "Начинающие", description: "Для тех, кто уже занимается аргентинским танго от двух до шести месяцев." },
    intermediate: { name: "Продолжающие", description: "В расписании этой группы указан опыт от двух лет." },
    advanced: { name: "Продвинутые", description: "Для танцующих от трёх лет." }
  },
  teachers: {
    alan: { name: "Алан Цаголов", number: "+79161143082", display: "+7 916 114-30-82" },
    inessa: { name: "Инесса Дехтярева", number: "+79262164927", display: "+7 926 216-49-27" }
  },
  groups: {
    zero3: { title: "С нуля · группа № 3", level: "zero", weekly: "Вторник и четверг", start: "19:00", end: "20:15", teacher: "alan", fee: 800, units: 1 },
    zero1: { title: "С нуля · группа № 1", level: "zero", weekly: "Воскресенье", start: "15:00", end: "16:00", teacher: "inessa", fee: 800, units: 1 },
    zero2: { title: "С нуля · группа № 2", level: "zero", weekly: "Понедельник", start: "19:00", end: "20:00", teacher: "inessa", fee: 1500, units: 2 },
    beginner: { title: "Начинающие", level: "beginner", weekly: "Воскресенье", start: "14:00", end: "15:00", teacher: "inessa", fee: 1500, units: 2 },
    intermediate: { title: "Продолжающие · группа № 2", level: "intermediate", weekly: "Понедельник", start: "20:00", end: "21:30", teacher: "inessa", fee: 800, units: 1 },
    advanced: { title: "Продвинутые", level: "advanced", weekly: "Вторник и четверг", start: "20:15", end: "21:30", teacher: "alan", fee: 800, units: 1 }
  },
  days: [
    ["2026-11-23", ["zero2", "intermediate"]],
    ["2026-11-24", ["zero3", "advanced"]],
    ["2026-11-26", ["zero3", "advanced"]],
    ["2026-11-29", ["beginner", "zero1"]],
    ["2026-11-30", ["zero2", "intermediate"]],
    ["2026-12-01", ["zero3", "advanced"]],
    ["2026-12-03", ["zero3", "advanced"]],
    ["2026-12-06", ["beginner", "zero1"]]
  ]
};

const dayFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });
const weekFormat = new Intl.DateTimeFormat("ru-RU", { weekday: "long", timeZone: "UTC" });
const priceFormat = new Intl.NumberFormat("ru-RU");

function publishedLessons() {
  return tangoSchedule.days.flatMap(([date, ids]) => ids.map(id => ({ group: tangoSchedule.groups[id], date })));
}
function timeRange(group) {
  return group.start + "–" + group.end;
}
function feeUnit(group) {
  return group.units === 2 ? "за 2 урока" : "за 1 урок";
}
function calendarParts(lesson) {
  if (!lesson.date) return { day: "Регулярная группа", date: lesson.group.weekly };
  const utcDate = new Date(lesson.date + "T12:00:00Z");
  const weekday = weekFormat.format(utcDate);
  return { day: weekday.charAt(0).toUpperCase() + weekday.slice(1), date: dayFormat.format(utcDate) };
}
function startsAt(lesson) {
  return Date.parse(lesson.date + "T" + lesson.group.start + ":00+03:00");
}
