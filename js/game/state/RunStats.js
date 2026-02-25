export class RunStats {
  constructor() {
    this.score = 0;
    this.startedAt = Date.now();
    this.endedAt = 0;
  }

  reset() {
    this.score = 0;
    this.startedAt = Date.now();
    this.endedAt = 0;
  }

  addScore(points) {
    this.score += Math.max(0, points | 0);
    return this.score;
  }

  finish() {
    this.endedAt = Date.now();
  }

  elapsedMs(now = Date.now()) {
    const end = this.endedAt || now;
    return Math.max(0, end - this.startedAt);
  }
}
