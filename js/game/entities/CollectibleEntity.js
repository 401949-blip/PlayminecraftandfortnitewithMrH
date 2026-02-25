import { Entity } from "./Entity.js";

export class CollectibleEntity extends Entity {
  constructor(kind = "orb") {
    super("collectible", ["collectible", kind]);
    this.kind = kind;
  }
}
