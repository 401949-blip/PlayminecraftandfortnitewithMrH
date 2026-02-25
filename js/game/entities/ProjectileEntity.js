import { Entity } from "./Entity.js";

export class ProjectileEntity extends Entity {
  constructor(projectileType = "boss-bullet") {
    super("projectile", ["projectile", projectileType]);
    this.velocity = { x: 0, y: 0 };
  }
}
