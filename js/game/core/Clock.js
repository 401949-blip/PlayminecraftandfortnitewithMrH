export class Clock {
  constructor(store) {
    this.store = store;
    this.frozenTags = new Set();
  }

  wallNowMs() {
    return Date.now();
  }

  nowMs() {
    return this.store.gameTimeMs;
  }

  isFrozen() {
    return this.frozenTags.size > 0;
  }

  freeze(tag) {
    if (!tag) return;
    this.frozenTags.add(tag);
  }

  unfreeze(tag) {
    if (!tag) return;
    this.frozenTags.delete(tag);
  }

  pause() {
    this.store.paused = true;
  }

  resume() {
    const s = this.store;
    const now = performance.now();
    s.paused = false;
    s.lastClockAt = now;
    s.lastFrameAt = now;
  }

  reset(now = performance.now()) {
    const s = this.store;
    s.gameTimeMs = 0;
    s.lastClockAt = now;
    s.lastFrameAt = now;
  }

  advance(now = performance.now()) {
    const s = this.store;
    if (!s.lastClockAt) {
      s.lastClockAt = now;
      return s.gameTimeMs;
    }

    const delta = Math.max(0, now - s.lastClockAt);
    s.lastClockAt = now;
    if (!s.paused && !s.menuOpen && !this.isFrozen()) {
      s.gameTimeMs += delta;
    }
    return s.gameTimeMs;
  }

  runElapsedMs() {
    return this.store.getRunElapsedMs();
  }
}
