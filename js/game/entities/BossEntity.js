import { Entity } from "./Entity.js";

export class BossEntity extends Entity {
  constructor(bossId = "evil_hathaway") {
    super("boss", ["boss"]);
    this.bossId = bossId;
    this.hp = 0;
    this.maxHp = 0;
  }
}
