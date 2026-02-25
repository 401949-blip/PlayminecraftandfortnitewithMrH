export class CollisionSystem {
  constructor(collideFn) {
    this.collide = collideFn;
  }

  intersects(a, b) {
    return this.collide(a, b);
  }
}
