import { SCHEDULER_CHANNELS } from "../config/constants.js";

export class Scheduler {
  constructor(store, clock) {
    this.store = store;
    this.clock = clock;
    this.tasks = new Set();
  }

  _canTick(channel) {
    const s = this.store;
    if (channel === SCHEDULER_CHANNELS.REALTIME) return true;
    return !s.gameOver && !s.paused && !s.menuOpen;
  }

  every(ms, cb, channel = SCHEDULER_CHANNELS.GAMEPLAY) {
    const handle = { kind: "interval", id: 0, cancelled: false, nextAt: this._now(channel) + ms };
    const tick = () => {
      this.tasks.delete(handle);
      if (handle.cancelled) return;
      const now = this._now(channel);
      if (this._canTick(channel) && now >= handle.nextAt) {
        handle.nextAt = now + ms;
        cb();
      }
      handle.id = window.setTimeout(tick, 16);
      this.tasks.add(handle);
    };
    handle.id = window.setTimeout(tick, 16);
    this.tasks.add(handle);
    return handle;
  }

  after(ms, cb, channel = SCHEDULER_CHANNELS.REALTIME) {
    const handle = { kind: "timeout", id: 0, cancelled: false, targetAt: this._now(channel) + ms };
    const tick = () => {
      this.tasks.delete(handle);
      if (handle.cancelled) return;
      if (this._canTick(channel) && this._now(channel) >= handle.targetAt) {
        this.tasks.delete(handle);
        cb();
        return;
      }
      handle.id = window.setTimeout(tick, 16);
      this.tasks.add(handle);
    };
    handle.id = window.setTimeout(tick, 16);
    this.tasks.add(handle);
    return handle;
  }

  _now(channel) {
    if (channel === SCHEDULER_CHANNELS.REALTIME) return this.clock.wallNowMs();
    return this.clock.nowMs();
  }

  cancel(handle) {
    if (!handle) return;
    if (handle.kind === "interval" || handle.kind === "timeout") {
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
