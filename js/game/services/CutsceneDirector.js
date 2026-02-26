import { CONSTANTS } from "../config/constants.js";

export class CutsceneDirector {
  constructor(store) {
    this.store = store;
    this.activeSequence = 0;
    this.pendingTimeouts = new Set();
  }

  beginCutscene() {
    this.cancelAll();
    this.activeSequence += 1;
    this.store.cutsceneActive = true;
    this.store.invincible = true;
    return this.activeSequence;
  }

  endCutscene() {
    this.store.cutsceneActive = false;
    this.store.invincible = false;
    this.cancelAll();
  }

  currentSequence() {
    return this.activeSequence;
  }

  cancelAll() {
    for (const id of Array.from(this.pendingTimeouts)) {
      clearTimeout(id);
    }
    this.pendingTimeouts.clear();
  }

  timeout(cb, delayMs, sequenceId = this.activeSequence) {
    const s = this.store;
    const baseDelay = Math.max(0, Number(delayMs) || 0);

    if (!s.cutsceneActive) {
      const immediateId = window.setTimeout(() => {
        this.pendingTimeouts.delete(immediateId);
        if (s.gameOver || sequenceId !== this.activeSequence) return;
        cb();
      }, baseDelay);
      this.pendingTimeouts.add(immediateId);
      return immediateId;
    }

    let remaining = baseDelay * CONSTANTS.CUTSCENE_TIME_SCALE;
    let lastTickAt = performance.now();
    let id = 0;

    const tick = () => {
      this.pendingTimeouts.delete(id);
      if (s.gameOver || sequenceId !== this.activeSequence || !s.cutsceneActive) {
        return;
      }
      const now = performance.now();
      if (!s.paused && !s.menuOpen) {
        remaining -= now - lastTickAt;
      }
      lastTickAt = now;
      if (remaining <= 0) {
        if (s.gameOver || sequenceId !== this.activeSequence) return;
        cb();
        return;
      }
      id = window.setTimeout(tick, 16);
      this.pendingTimeouts.add(id);
    };

    id = window.setTimeout(tick, 16);
    this.pendingTimeouts.add(id);
    return id;
  }
}
