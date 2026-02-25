import { SCHEDULER_CHANNELS } from "../config/constants.js";

export class Scheduler {
  constructor(store) {
    this.store = store;
    this.tasks = new Set();
  }

  _canTick(channel) {
    const s = this.store;
    if (channel === SCHEDULER_CHANNELS.REALTIME) return true;
    return !s.gameOver && !s.paused && !s.menuOpen;
  }

  every(ms, cb, channel = SCHEDULER_CHANNELS.GAMEPLAY) {
    const id = setInterval(() => {
      if (!this._canTick(channel)) return;
      cb();
    }, ms);
    const handle = { kind: "interval", id };
    this.tasks.add(handle);
    return handle;
  }

  after(ms, cb, channel = SCHEDULER_CHANNELS.REALTIME) {
    const start = performance.now();
    const handle = { kind: "timeout", id: 0, cancelled: false };
    const tick = () => {
      if (handle.cancelled) return;
      if (!this._canTick(channel)) {
        handle.id = window.setTimeout(tick, 16);
        return;
      }
      const elapsed = performance.now() - start;
      if (elapsed >= ms) {
        this.tasks.delete(handle);
        cb();
        return;
      }
      handle.id = window.setTimeout(tick, 16);
    };
    handle.id = window.setTimeout(tick, 16);
    this.tasks.add(handle);
    return handle;
  }

  cancel(handle) {
    if (!handle) return;
    if (handle.kind === "interval") clearInterval(handle.id);
    if (handle.kind === "timeout") {
      handle.cancelled = true;
      clearTimeout(handle.id);
    }
    this.tasks.delete(handle);
  }

  cancelAll() {
    for (const handle of Array.from(this.tasks)) {
      this.cancel(handle);
    }
  }
}
