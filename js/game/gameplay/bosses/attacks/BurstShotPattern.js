import { BossAttackPattern } from "./BossAttackPattern.js";

export class BurstShotPattern extends BossAttackPattern {
  constructor(spawnBullet, cutsceneTimeout) {
    super();
    this.spawnBullet = spawnBullet;
    this.cutsceneTimeout = cutsceneTimeout;
  }

  execute() {
    this.spawnBullet();
    if (Math.random() < 0.35) {
      this.cutsceneTimeout(() => this.spawnBullet(), 180);
    }
  }
}
