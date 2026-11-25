"use strict";

(() => {
  const svg = document.querySelector(".first-trail");
  const line = svg.querySelector(".walk-line");
  const fields = svg.querySelector(".walk-fields");
  const history = svg.querySelector(".walk-history");
  const feet = svg.querySelector(".walk-feet");
  const length = line.getTotalLength();
  const intervals = 14;
  const printScale = .48;
  const clamp = value => Math.max(0, Math.min(1, value));

  function createUse(parent, href) {
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", href);
    parent.append(use);
    return use;
  }

  function createStep(parent) {
    const print = createUse(parent, "./assets/ui.svg?v=3#heel");
    print.setAttribute("width", "13");
    print.setAttribute("height", "26");
    return { print, field: createUse(fields, "#walk-step-field") };
  }

  function place(step, index, side, lift = 0) {
    const distance = clamp(index / intervals) * length;
    const center = line.getPointAtLength(distance);
    const before = line.getPointAtLength(Math.max(0, distance - 1));
    const after = line.getPointAtLength(Math.min(length, distance + 1));
    const angle = Math.atan2(after.y - before.y, after.x - before.x);
    const offset = side * (4.2 + lift);
    const x = center.x - Math.sin(angle) * offset;
    const y = center.y + Math.cos(angle) * offset;
    const rotation = angle * 180 / Math.PI + 90;
    const transform = `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${side * printScale} ${printScale}) translate(-6.5 -13)`;
    step.print.setAttribute("transform", transform);
    step.field.setAttribute("transform", transform);
  }

  // The last two contacts are shown by the live pair through the end of the route.
  const stamps = Array.from({ length: intervals - 1 }, (_, index) => {
    const step = createStep(history);
    place(step, index, index % 2 ? 1 : -1);
    return step;
  });
  const pair = [createStep(feet), createStep(feet)];
  let frame = 0;
  let lastProgress = -1;

  function draw() {
    frame = 0;
    const top = svg.getBoundingClientRect().top;
    const progress = reduceMotion.matches ? 1 : clamp((innerHeight * .94 - top) / (innerHeight * .68));
    if (progress === lastProgress) return;
    lastProgress = progress;

    const distance = progress * intervals;
    const planted = Math.floor(distance);
    const fraction = distance - planted;
    const supportingFoot = planted % 2;
    const movingFoot = 1 - supportingFoot;
    line.style.strokeDashoffset = String(1 - progress);

    // The moving foot uncovers its impression over the first fifth of the next interval.
    stamps.forEach((step, index) => {
      const strength = clamp((distance - index - 1) * 5);
      step.print.style.opacity = String(.56 * strength);
      step.field.style.opacity = String(strength);
    });
    place(pair[supportingFoot], planted, supportingFoot ? 1 : -1);
    const movingIndex = Math.max(0, planted - 1) + (planted ? 2 : 1) * fraction;
    place(pair[movingFoot], movingIndex, movingFoot ? 1 : -1, Math.sin(fraction * Math.PI) * 2);
    svg.dataset.step = String(planted);
  }

  function queue() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  window.addEventListener("load", queue);
  reduceMotion.addEventListener("change", queue);
  queue();
})();
