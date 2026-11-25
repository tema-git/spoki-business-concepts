"use strict";

(() => {
  const game = document.querySelector(".step-game");
  const action = document.getElementById("step-action");
  const round = document.getElementById("step-round");
  const status = document.getElementById("step-status");
  const board = game.querySelector(".step-board");
  const progress = game.querySelector(".step-progress");
  const pads = [...game.querySelectorAll(".step-pad")];
  const firstLength = 3;
  const lastLength = 5;
  const pattern = [];
  let phase = "idle";
  let position = 0;
  let cueTimer;
  let feedbackTimer;

  function clearLights() {
    clearTimeout(feedbackTimer);
    for (const pad of pads) {
      pad.removeAttribute("data-lit");
      pad.removeAttribute("data-missed");
    }
  }

  function setPhase(next, buttonLabel) {
    phase = next;
    game.dataset.phase = next;
    const canStart = ["idle", "input", "paused", "won"].includes(next);
    action.textContent = buttonLabel;
    action.setAttribute("aria-disabled", String(!canStart));
    for (const pad of pads) {
      pad.setAttribute("aria-disabled", String(next !== "input"));
      pad.tabIndex = next === "input" ? 0 : -1;
    }
  }

  function addStep() {
    const choices = pads.map((_, index) => index).filter(index => index !== pattern.at(-1));
    pattern.push(choices[Math.floor(Math.random() * choices.length)]);
  }

  function resetDots(length) {
    progress.replaceChildren(...Array.from({ length }, () => document.createElement("span")));
  }

  function invitePlayer() {
    setPhase("input", "Показать ещё раз");
    status.textContent = "Ваш ход. Повторите шаги по порядку.";
    const spokenPattern = document.createElement("span");
    spokenPattern.className = "sr-only";
    spokenPattern.textContent = " Рисунок: " + pattern.map(index => index + 1).join(", ") + ".";
    status.append(spokenPattern);
  }

  function showPattern() {
    clearTimeout(cueTimer);
    clearLights();
    position = 0;
    resetDots(pattern.length);
    round.textContent = "Раунд " + (pattern.length - firstLength + 1) + " из 3";
    setPhase("show", "Идёт показ");
    status.textContent = "Смотрите на следы.";
    let nextCue = 0;

    function lightCue() {
      const pad = pads[pattern[nextCue]];
      pad.setAttribute("data-lit", "");
      nextCue++;
      cueTimer = setTimeout(() => {
        pad.removeAttribute("data-lit");
        cueTimer = setTimeout(nextCue === pattern.length ? invitePlayer : lightCue, 240);
      }, 650);
    }
    cueTimer = setTimeout(lightCue, 450);
  }

  function choose(index) {
    if (phase !== "input") return;
    clearLights();
    if (index !== pattern[position]) {
      pads[index].setAttribute("data-missed", "");
      setPhase("retry", "Повтор рисунка");
      status.textContent = "Здесь был другой след. Посмотрите тот же рисунок ещё раз.";
      cueTimer = setTimeout(showPattern, 1150);
      return;
    }

    pads[index].setAttribute("data-lit", "");
    feedbackTimer = setTimeout(clearLights, 260);
    progress.children[position].classList.add("matched");
    position++;
    if (position < pattern.length) {
      status.textContent = "Верно. Следующий шаг — " + (position + 1) + " из " + pattern.length + ".";
    } else if (pattern.length === lastLength) {
      setPhase("won", "Сыграть ещё раз");
      status.textContent = "Вы запомнили все три рисунка. Пять шагов подряд!";
      if (board.contains(document.activeElement) && document.activeElement.matches(":focus-visible")) {
        action.focus({ preventScroll: true });
      }
    } else {
      addStep();
      setPhase("between", "Следующий раунд");
      status.textContent = "Точно! Теперь добавим один шаг.";
      cueTimer = setTimeout(showPattern, 900);
    }
  }

  action.addEventListener("click", () => {
    if (action.getAttribute("aria-disabled") === "true") return;
    if (phase === "idle" || phase === "won") {
      pattern.length = 0;
      while (pattern.length < firstLength) addStep();
    }
    const bounds = board.getBoundingClientRect();
    const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
    if (bounds.top < headerBottom || bounds.bottom > window.innerHeight) {
      board.scrollIntoView({ block: "center", behavior: "instant" });
    }
    showPattern();
  });
  pads.forEach((pad, index) => pad.addEventListener("click", () => choose(index)));
  game.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.repeat && [" ", "Enter", "1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      return;
    }
    if (phase === "input" && /^[1-4]$/.test(event.key)) {
      event.preventDefault();
      choose(Number(event.key) - 1);
    }
  });

  function pause() {
    if (phase === "idle" || phase === "won" || phase === "paused") return;
    clearTimeout(cueTimer);
    clearLights();
    setPhase("paused", "Продолжить игру");
    status.textContent = "Игра на паузе. Продолжите с этого рисунка.";
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  window.addEventListener("pagehide", pause);
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) pause();
  }).observe(board);

  resetDots(firstLength);
  setPhase("idle", "Начать игру");
  game.hidden = false;
})();
