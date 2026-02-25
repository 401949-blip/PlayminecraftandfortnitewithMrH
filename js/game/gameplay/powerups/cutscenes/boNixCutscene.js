import { createCutsceneOverlay, createTitle, fadeInOutOverlay } from "./common.js";

export function runBoNixCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.sfx("pickup");
  audio.setTheme(() => audio.startBoNixTheme());
  cutsceneDirector.beginCutscene();

  const overlay = createCutsceneOverlay(refs, 14500, "#100905");
  const bg = document.createElement("img");
  bg.src = "../assets/images/desert.jpeg";
  bg.onerror = () => { bg.src = "../assets/images/ocean.jpeg"; };
  bg.style.position = "absolute";
  bg.style.inset = "-6%";
  bg.style.width = "112%";
  bg.style.height = "112%";
  bg.style.objectFit = "cover";
  bg.style.filter = "contrast(1.18) saturate(1.38) brightness(0.86)";
  bg.style.transform = "scale(1.16)";
  bg.style.transition = "transform 3200ms ease-out";
  overlay.appendChild(bg);

  const title = createTitle("SHIELD OF BO NIX", "#fff2cf");
  overlay.appendChild(title);

  const subtitle = createTitle("RIDES THROUGH THE DUNES", "#ffe4b3");
  subtitle.style.top = "24%";
  subtitle.style.fontSize = "clamp(12px,2.2vw,22px)";
  subtitle.style.letterSpacing = "3px";
  overlay.appendChild(subtitle);

  cutsceneDirector.timeout(() => {
    title.style.opacity = "1";
    subtitle.style.opacity = "1";
    bg.style.transform = "scale(1)";
  }, 260);

  fadeInOutOverlay(cutsceneDirector, overlay, 20, 3150, 3800, () => {
    audio.stopTheme();
    cutsceneDirector.endCutscene();
  });
}
