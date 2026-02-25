export function createCutsceneOverlay(refs, zIndex, background) {
  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = String(zIndex);
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 450ms ease";
  overlay.style.overflow = "hidden";
  overlay.style.background = background;
  refs.game.appendChild(overlay);
  return overlay;
}

export function createTitle(text, color = "#ffffff") {
  const title = document.createElement("div");
  title.textContent = text;
  title.style.position = "absolute";
  title.style.left = "50%";
  title.style.top = "16%";
  title.style.transform = "translate(-50%,-50%)";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.fontSize = "clamp(18px,3.6vw,42px)";
  title.style.letterSpacing = "4px";
  title.style.color = color;
  title.style.textShadow = "0 0 24px rgba(255,255,255,0.7)";
  title.style.opacity = "0";
  title.style.transition = "opacity 320ms ease";
  return title;
}

export function fadeInOutOverlay(cutsceneDirector, overlay, inMs, outAtMs, removeAtMs, onDone) {
  cutsceneDirector.timeout(() => { overlay.style.opacity = "1"; }, inMs);
  cutsceneDirector.timeout(() => { overlay.style.opacity = "0"; }, outAtMs);
  cutsceneDirector.timeout(() => {
    overlay.remove();
    if (onDone) onDone();
  }, removeAtMs);
}
