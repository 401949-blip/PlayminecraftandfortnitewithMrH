let nextEntityId = 1;

export class Entity {
  constructor(type, tags = []) {
    this.id = nextEntityId++;
    this.type = type;
    this.tags = new Set(tags);
    this.alive = true;
  }

  destroy() {
    this.alive = false;
  }
}
