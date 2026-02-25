import { createCutsceneOverlay, createTitle, fadeInOutOverlay } from "./common.js";

export function runKirkCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector, spawnSystem, addScore } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.setTheme(() => audio.startKirkTheme());
  cutsceneDirector.beginCutscene();
  store.kirkInvincibleUntil = Date.now() + 10000;
  addScore(50);
  store.speed += 20;
  refs.spdEl.textContent = store.speed.toFixed(1);

  const overlay = createCutsceneOverlay(refs, 14700, "linear-gradient(180deg, rgba(6,11,31,0.9) 0%, rgba(8,16,44,0.92) 55%, rgba(15,23,28,0.92) 100%)");

  const title = createTitle("KIRK, MOONLIT NECROMANCER", "#b9ffd4");
  title.style.top = "12%";
  title.style.fontSize = "22px";
  overlay.appendChild(title);

  const kirkImg = document.createElement("img");
  kirkImg.src = "../assets/images/kirk.jpeg";
  kirkImg.style.position = "absolute";
  kirkImg.style.left = "50%";
  kirkImg.style.top = "56%";
  kirkImg.style.width = "310px";
  kirkImg.style.transform = "translate(-50%,-50%) scale(0.72) rotate(0deg)";
  kirkImg.style.filter = "brightness(0.82) contrast(1.15) hue-rotate(96deg)";
  kirkImg.style.transition = "all 950ms cubic-bezier(.2,.8,.2,1)";
  overlay.appendChild(kirkImg);

  const undeadCount = 40;
  for (let i = 0; i < undeadCount; i++) {
    const e = document.createElement("div");
    e.className = "enemy";
    spawnSystem.initEnemySpawnGrace(e);
    let ex = 0;
    let ey = 0;
    const side = i % 4;
    if (side === 0) { ex = Math.random() * (window.innerWidth - 60); ey = -40; }
    if (side === 1) { ex = window.innerWidth + 20; ey = Math.random() * (window.innerHeight - 60); }
    if (side === 2) { ex = Math.random() * (window.innerWidth - 60); ey = window.innerHeight + 20; }
    if (side === 3) { ex = -40; ey = Math.random() * (window.innerHeight - 60); }
    e.style.left = ex + "px";
    e.style.top = ey + "px";
    e.style.opacity = "0";
    e.style.transform = "translateY(54px) scale(0.24)";
    e.style.transition = "transform 700ms cubic-bezier(.16,.84,.22,1), opacity 420ms ease";
    refs.game.appendChild(e);

    cutsceneDirector.timeout(() => {
      e.style.opacity = "1";
      e.style.transform = "translateY(0px) scale(1)";
    }, 350 + Math.random() * 950);
  }

  cutsceneDirector.timeout(() => {
    title.style.opacity = "1";
    kirkImg.style.transform = "translate(-50%,-50%) scale(1.06) rotate(-1.5deg)";
    kirkImg.style.filter = "brightness(1.06) contrast(1.2) hue-rotate(104deg) drop-shadow(0 0 28px rgba(165,255,195,0.96))";
  }, 420);

  fadeInOutOverlay(cutsceneDirector, overlay, 20, 4300, 4900, () => {
    audio.stopTheme();
    cutsceneDirector.endCutscene();
  });
}
