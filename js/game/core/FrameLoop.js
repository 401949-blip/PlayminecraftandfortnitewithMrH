export class FrameLoop {
  constructor(store, tickFn) {
    this.store = store;
    this.tickFn = tickFn;
    this.boundTick = this._tick.bind(this);
  }

  start() {
    const s = this.store;
    if (s.loopRunning) return;
    s.loopRunning = true;
    s.lastFrameAt = performance.now();
    s.loopRafId = requestAnimationFrame(this.boundTick);
  }

  stop() {
    const s = this.store;
    if (s.loopRafId) {
      cancelAnimationFrame(s.loopRafId);
    }
    s.loopRafId = 0;
    s.loopRunning = false;
  }

  _tick() {
    const s = this.store;
    if (!s.loopRunning) return;
    this.tickFn();
    if (s.loopRunning) {
      s.loopRafId = requestAnimationFrame(this.boundTick);
    } else {
      s.loopRafId = 0;
    }
  }
}
