import { Entity } from "./Entity.js";

export class EnemyEntity extends Entity {
  constructor(behaviorId = "flying_basic") {
    super("enemy", ["enemy"]);
    this.behaviorId = behaviorId;
    this.spawnSafeUntil = 0;
  }
}
