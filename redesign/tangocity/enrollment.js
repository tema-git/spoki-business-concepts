"use strict";

const enrollmentCards = [...document.querySelectorAll("[data-enrollment]")];
let enrollmentLessons = publishedLessons();

function updateEnrollment() {
  const now = Date.now();
  const nextStarts = new Map();
  for (const card of enrollmentCards) {
    const group = tangoSchedule.groups[card.dataset.enrollment];
    const next = enrollmentLessons.find(lesson => lesson.group.title === group.title && startsAt(lesson) > now);
    nextStarts.set(card, next ? startsAt(next) : Infinity);
    const when = card.querySelector(".enroll-when");
    const price = card.querySelector(".enroll-price");
    let place = card.querySelector(".venue-change");
    if (next?.group.place) {
      if (!place) {
        place=document.createElement("p");
        place.className="venue-change";
        card.querySelector(".enroll-next").append(place);
      }
      place.textContent="Место занятия · "+next.group.place;
    } else place?.remove();
    if (next) {
      const time = document.createElement("time");
      time.dateTime = next.date + "T" + next.group.start + ":00+03:00";
      time.textContent = calendarParts(next).date + " · " + timeRange(next.group);
      when.replaceChildren(time);
      price.textContent = next.group.fee === null ? "Цену уточнит преподаватель" :
        priceFormat.format(next.group.fee) + " ₽ " + feeUnit(next.group);
    } else {
      when.textContent = "Обычно " + timeRange(group) + ". Ближайшую дату уточняет школа.";
      price.textContent = "Сроки набора и оплату подскажет преподаватель";
    }
  }
  const grid = enrollmentCards[0].parentElement;
  const chronological = enrollmentCards.slice().sort((a,b) => nextStarts.get(a) - nextStarts.get(b));
  if (!grid.contains(document.activeElement) && chronological.some((card,i) => card !== grid.children[i])) {
    grid.append(...chronological);
  }
}

updateEnrollment();
fetchSchoolCalendar().then(live => {
  if (live) {
    enrollmentLessons = live.lessons;
    updateEnrollment();
  }
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateEnrollment(); });
