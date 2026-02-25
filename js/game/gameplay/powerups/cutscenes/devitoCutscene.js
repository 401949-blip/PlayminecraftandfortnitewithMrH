import { createCutsceneOverlay, createTitle, fadeInOutOverlay } from "./common.js";

export function runDevitoCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector, effects, addScore } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.sfx("pickup");
  audio.setTheme(() => audio.startDevitoTheme());
  cutsceneDirector.beginCutscene();

  const overlay = createCutsceneOverlay(refs, 14650, "radial-gradient(circle at center, rgba(62,18,31,0.72) 0%, rgba(0,0,0,0.94) 65%)");

  const title = createTitle("DANNY DEVITO // BLOSSOM RONIN", "#ffd3ec");
  title.style.top = "15%";
  title.style.fontSize = "20px";
  overlay.appendChild(title);

  const devito = document.createElement("img");
  devito.src = "../assets/images/devito.jpeg";
  devito.style.width = "340px";
  devito.style.position = "absolute";
  devito.style.left = "50%";
  devito.style.top = "52%";
  devito.style.transform = "translate(-50%,-50%) scale(0.45) rotate(0deg)";
  devito.style.filter = "blur(6px) grayscale(0.4) brightness(0.85) drop-shadow(0 0 0 rgba(255,211,236,0.9))";
  devito.style.imageRendering = "pixelated";
  devito.style.transition = "all 1100ms cubic-bezier(.2,.75,.2,1)";
  overlay.appendChild(devito);

  cutsceneDirector.timeout(() => {
    title.style.opacity = "1";
    devito.style.transform = "translate(-50%,-50%) scale(1.1) rotate(-8deg)";
    devito.style.filter = "blur(0px) grayscale(0) brightness(1.2) contrast(1.25) saturate(1.4) drop-shadow(0 0 35px rgba(255,219,240,0.95))";
  }, 850);

  cutsceneDirector.timeout(() => {
    const wiped = effects.smoothEnemyWipe(overlay) || 0;
    if (wiped > 0) addScore(wiped);
    audio.sfx("slash");
  }, 2450);

  fadeInOutOverlay(cutsceneDirector, overlay, 20, 3300, 3900, () => {
    audio.stopTheme();
    cutsceneDirector.endCutscene();
  });
}
