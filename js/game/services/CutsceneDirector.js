import { CONSTANTS } from "../config/constants.js";

export class CutsceneDirector {
  constructor(store) {
    this.store = store;
  }

  beginCutscene() {
    this.store.cutsceneActive = true;
    this.store.invincible = true;
  }

  endCutscene() {
    this.store.cutsceneActive = false;
    this.store.invincible = false;
  }

  timeout(cb, delayMs) {
    const s = this.store;
    const baseDelay = Math.max(0, Number(delayMs) || 0);
    if (!s.cutsceneActive) {
      return window.setTimeout(() => {
        if (s.gameOver) return;
        cb();
      }, baseDelay);
    }

    let remaining = baseDelay * CONSTANTS.CUTSCENE_TIME_SCALE;
    let lastTickAt = performance.now();

    function tick() {
      const now = performance.now();
      if (!s.paused && !s.menuOpen) {
        remaining -= now - lastTickAt;
      }
      lastTickAt = now;
      if (remaining <= 0) {
        if (s.gameOver) return;
        cb();
        return;
      }
      window.setTimeout(tick, 16);
    }

    return window.setTimeout(tick, 16);
  }
}
