import { createCutsceneOverlay, createTitle, fadeInOutOverlay } from "./common.js";

export function runDrakeCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.sfx("pickup");
  audio.setTheme(() => audio.startDrakeTheme());
  cutsceneDirector.beginCutscene();

  const overlay = createCutsceneOverlay(refs, 14600, "#071327");
  const frost = document.createElement("img");
  frost.src = "../assets/images/frost.jpeg";
  frost.onerror = () => { frost.src = "../assets/images/ocean.jpeg"; };
  frost.style.position = "absolute";
  frost.style.inset = "0";
  frost.style.width = "100%";
  frost.style.height = "100%";
  frost.style.objectFit = "cover";
  frost.style.filter = "brightness(0.8) saturate(1.15) contrast(1.08)";
  overlay.appendChild(frost);

  const title = createTitle("DRAKE, KING OF FROST", "#d6f1ff");
  overlay.appendChild(title);

  const drake = document.createElement("img");
  drake.src = "../assets/images/drake.jpeg";
  drake.style.position = "absolute";
  drake.style.left = "50%";
  drake.style.top = "67%";
  drake.style.width = "320px";
  drake.style.height = "320px";
  drake.style.objectFit = "cover";
  drake.style.borderRadius = "14px";
  drake.style.transform = "translate(-50%,220px) scale(0.62)";
  drake.style.filter = "drop-shadow(0 0 24px rgba(130,201,255,0.95))";
  drake.style.transition = "transform 950ms cubic-bezier(.2,.82,.2,1)";
  overlay.appendChild(drake);

  cutsceneDirector.timeout(() => {
    title.style.opacity = "1";
    drake.style.transform = "translate(-50%,-50%) scale(1)";
  }, 280);

  fadeInOutOverlay(cutsceneDirector, overlay, 20, 2650, 3050, () => {
    audio.stopTheme();
    cutsceneDirector.endCutscene();
  });
}
