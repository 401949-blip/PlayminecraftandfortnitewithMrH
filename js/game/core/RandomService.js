export class RandomService {
  constructor(seed = null) {
    this.seed = Number.isFinite(seed) ? (seed >>> 0) : null;
  }

  _nextSeeded() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  float() {
    if (this.seed === null) return Math.random();
    return this._nextSeeded();
  }

  int(min, maxInclusive) {
    const lo = Math.ceil(min);
    const hi = Math.floor(maxInclusive);
    return lo + Math.floor(this.float() * (hi - lo + 1));
  }

  pick(list) {
    if (!list || list.length === 0) return undefined;
    return list[this.int(0, list.length - 1)];
  }
}
