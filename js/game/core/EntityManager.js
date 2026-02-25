export class EntityManager {
  constructor() {
    this.entities = new Map();
  }

  add(entity) {
    this.entities.set(entity.id, entity);
    return entity;
  }

  remove(entityId) {
    this.entities.delete(entityId);
  }

  get(entityId) {
    return this.entities.get(entityId) || null;
  }

  all() {
    return Array.from(this.entities.values());
  }

  clear() {
    this.entities.clear();
  }
}
