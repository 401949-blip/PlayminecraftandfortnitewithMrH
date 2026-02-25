import { Entity } from "./Entity.js";

export class PlayerEntity extends Entity {
  constructor() {
    super("player", ["player"]);
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
  }
}
