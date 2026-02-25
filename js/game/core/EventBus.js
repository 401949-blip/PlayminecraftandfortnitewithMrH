export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    const set = this.listeners.get(eventName);
    set.add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(eventName);
  }

  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set || set.size === 0) return;
    for (const fn of Array.from(set)) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[EventBus] listener failed for ${eventName}`, err);
      }
    }
  }
}
