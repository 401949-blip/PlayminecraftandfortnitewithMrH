export class Clock {
  constructor(store) {
    this.store = store;
    this.frozenTags = new Set();
  }

  nowMs() {
    return Date.now();
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
    const s = this.store;
    if (!s.pauseStartedAt) s.pauseStartedAt = Date.now();
    s.paused = true;
  }

  resume() {
    const s = this.store;
    if (s.pauseStartedAt) {
      s.pausedAccumulatedMs += Math.max(0, Date.now() - s.pauseStartedAt);
      s.pauseStartedAt = 0;
    }
    s.paused = false;
  }

  runElapsedMs() {
    return this.store.getRunElapsedMs(Date.now());
  }
}
