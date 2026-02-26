import { createCutsceneOverlay } from "./common.js";

export function runBoNixCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.sfx("pickup");
  audio.setTheme(() => audio.startBoNixTheme());
  const seq = cutsceneDirector.beginCutscene();

  const overlay = createCutsceneOverlay(refs, 14500, "#100905");

  const desert = document.createElement("img");
  desert.src = "../assets/images/desert.jpeg";
  desert.onerror = () => { desert.src = "../assets/images/ocean.jpeg"; };
  desert.style.position = "absolute";
  desert.style.inset = "-6%";
  desert.style.width = "112%";
  desert.style.height = "112%";
  desert.style.objectFit = "cover";
  desert.style.filter = "contrast(1.18) saturate(1.38) brightness(0.86)";
  desert.style.transform = "scale(1.16)";
  desert.style.transition = "transform 3200ms ease-out";
  overlay.appendChild(desert);

  const grade = document.createElement("div");
  grade.style.position = "absolute";
  grade.style.inset = "0";
  grade.style.background = "linear-gradient(180deg, rgba(24,36,59,0.42) 0%, rgba(244,145,30,0.2) 47%, rgba(18,8,6,0.72) 100%)";
  grade.style.mixBlendMode = "screen";
  overlay.appendChild(grade);

  const sun = document.createElement("div");
  sun.style.position = "absolute";
  sun.style.width = "320px";
  sun.style.height = "320px";
  sun.style.borderRadius = "50%";
  sun.style.left = "71%";
  sun.style.top = "8%";
  sun.style.background = "radial-gradient(circle, rgba(255,240,196,1) 0%, rgba(255,174,63,0.95) 56%, rgba(255,122,23,0.15) 100%)";
  sun.style.boxShadow = "0 0 120px rgba(255,186,84,0.95)";
  sun.style.opacity = "0.85";
  overlay.appendChild(sun);

  const flare = document.createElement("div");
  flare.style.position = "absolute";
  flare.style.left = "0";
  flare.style.top = "0";
  flare.style.width = "100%";
  flare.style.height = "100%";
  flare.style.background = "radial-gradient(circle at 68% 20%, rgba(255,224,155,0.35), rgba(0,0,0,0) 36%)";
  flare.style.mixBlendMode = "screen";
  overlay.appendChild(flare);

  const barTop = document.createElement("div");
  barTop.style.position = "absolute";
  barTop.style.top = "0";
  barTop.style.left = "0";
  barTop.style.width = "100%";
  barTop.style.height = "0";
  barTop.style.background = "#000";
  barTop.style.transition = "height 450ms ease";
  barTop.style.zIndex = "2";
  overlay.appendChild(barTop);

  const barBottom = document.createElement("div");
  barBottom.style.position = "absolute";
  barBottom.style.bottom = "0";
  barBottom.style.left = "0";
  barBottom.style.width = "100%";
  barBottom.style.height = "0";
  barBottom.style.background = "#000";
  barBottom.style.transition = "height 450ms ease";
  barBottom.style.zIndex = "2";
  overlay.appendChild(barBottom);

  const horseWrap = document.createElement("div");
  horseWrap.style.position = "absolute";
  horseWrap.style.width = "480px";
  horseWrap.style.height = "300px";
  horseWrap.style.left = "-560px";
  horseWrap.style.bottom = "12%";
  horseWrap.style.transition = "left 1850ms cubic-bezier(.08,.86,.16,1), transform 1850ms cubic-bezier(.08,.86,.16,1)";
  horseWrap.style.zIndex = "3";
  overlay.appendChild(horseWrap);

  const horse = document.createElement("img");
  horse.src = "../assets/images/horse.jpeg";
  horse.onerror = () => { horse.src = "../assets/images/kirk.jpeg"; };
  horse.style.position = "absolute";
  horse.style.left = "0";
  horse.style.bottom = "0";
  horse.style.width = "420px";
  horse.style.height = "240px";
  horse.style.objectFit = "cover";
  horse.style.borderRadius = "14px";
  horse.style.filter = "contrast(1.14) saturate(1.2) drop-shadow(0 0 20px rgba(255,164,68,0.7))";
  horseWrap.appendChild(horse);

  const rider = document.createElement("img");
  rider.src = "../assets/images/nix.jpeg";
  rider.onerror = () => { rider.src = "../assets/images/kirk.jpeg"; };
  rider.style.position = "absolute";
  rider.style.width = "96px";
  rider.style.height = "96px";
  rider.style.objectFit = "cover";
  rider.style.borderRadius = "14px";
  rider.style.left = "170px";
  rider.style.top = "42px";
  rider.style.boxShadow = "0 0 30px rgba(255,188,86,0.95)";
  rider.style.filter = "saturate(1.28) contrast(1.12)";
  horseWrap.appendChild(rider);

  const speedLines = document.createElement("div");
  speedLines.style.position = "absolute";
  speedLines.style.inset = "0";
  speedLines.style.background = "repeating-linear-gradient(90deg, rgba(255,188,95,0.14) 0 2px, transparent 2px 22px)";
  speedLines.style.opacity = "0";
  speedLines.style.transition = "opacity 180ms linear";
  speedLines.style.mixBlendMode = "screen";
  overlay.appendChild(speedLines);

  const dust = [];
  for (let i = 0; i < 12; i++) {
    const d = document.createElement("div");
    const size = 2 + Math.random() * 7;
    d.style.position = "absolute";
    d.style.width = size + "px";
    d.style.height = size + "px";
    d.style.borderRadius = "50%";
    d.style.background = i % 3 ? "rgba(255,190,120,0.75)" : "rgba(255,228,178,0.82)";
    d.style.boxShadow = "0 0 12px rgba(255,188,112,0.72)";
    overlay.appendChild(d);
    dust.push({
      el: d,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * (0.46 + Math.random() * 0.48),
      vx: 1.2 + Math.random() * 4.6,
      vy: -0.08 - Math.random() * 0.35
    });
  }

  const title = document.createElement("div");
  title.textContent = "SHIELD OF BO NIX";
  title.style.position = "absolute";
  title.style.left = "50%";
  title.style.top = "16%";
  title.style.transform = "translate(-50%,-50%)";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.fontSize = "clamp(22px,4.8vw,52px)";
  title.style.letterSpacing = "5px";
  title.style.color = "#fff2cf";
  title.style.textShadow = "0 0 34px rgba(255,191,98,1)";
  title.style.opacity = "0";
  title.style.transition = "opacity 500ms ease";
  title.style.zIndex = "3";
  overlay.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.textContent = "RIDES THROUGH THE DUNES";
  subtitle.style.position = "absolute";
  subtitle.style.left = "50%";
  subtitle.style.top = "24%";
  subtitle.style.transform = "translate(-50%,-50%)";
  subtitle.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  subtitle.style.fontSize = "clamp(12px,2.2vw,22px)";
  subtitle.style.letterSpacing = "3px";
  subtitle.style.color = "#ffe4b3";
  subtitle.style.textShadow = "0 0 16px rgba(255,182,84,0.9)";
  subtitle.style.opacity = "0";
  subtitle.style.transition = "opacity 500ms ease";
  subtitle.style.zIndex = "3";
  overlay.appendChild(subtitle);

  let running = true;
  const animateDust = () => {
    if (!running || seq !== cutsceneDirector.currentSequence()) return;
    dust.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > window.innerWidth + 24) {
        p.x = -30;
        p.y = window.innerHeight * (0.45 + Math.random() * 0.5);
      }
      p.el.style.transform = `translate(${p.x}px,${p.y}px)`;
    });
    requestAnimationFrame(animateDust);
  };
  requestAnimationFrame(animateDust);

  cutsceneDirector.timeout(() => { overlay.style.opacity = "1"; }, 20, seq);
  cutsceneDirector.timeout(() => {
    barTop.style.height = "9%";
    barBottom.style.height = "9%";
    title.style.opacity = "1";
    subtitle.style.opacity = "1";
    desert.style.transform = "scale(1)";
  }, 220, seq);
  cutsceneDirector.timeout(() => {
    speedLines.style.opacity = "0.78";
    horseWrap.style.left = "68%";
    horseWrap.style.transform = "translateX(-50px)";
  }, 480, seq);
  cutsceneDirector.timeout(() => {
    speedLines.style.opacity = "0.25";
    const whiteFlash = document.createElement("div");
    whiteFlash.style.position = "absolute";
    whiteFlash.style.inset = "0";
    whiteFlash.style.background = "#ffe8bf";
    whiteFlash.style.opacity = "0.92";
    whiteFlash.style.transition = "opacity 180ms linear";
    overlay.appendChild(whiteFlash);
    cutsceneDirector.timeout(() => { whiteFlash.style.opacity = "0"; }, 40, seq);
    cutsceneDirector.timeout(() => whiteFlash.remove(), 260, seq);
  }, 1760, seq);
  cutsceneDirector.timeout(() => {
    barTop.style.height = "0";
    barBottom.style.height = "0";
    overlay.style.opacity = "0";
  }, 3150, seq);
  cutsceneDirector.timeout(() => {
    running = false;
    audio.stopTheme();
    overlay.remove();
    cutsceneDirector.endCutscene();
  }, 3800, seq);
}
