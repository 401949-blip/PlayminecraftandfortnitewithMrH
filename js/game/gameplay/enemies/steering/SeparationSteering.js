export class SeparationSteering {
  constructor(desiredDistance = 52) {
    this.desiredDistance = desiredDistance;
  }

  compute(el, enemies, ex, ey) {
    let sepX = 0;
    let sepY = 0;
    const desired = this.desiredDistance;
    for (let i = 0; i < enemies.length; i++) {
      const other = enemies[i];
      if (other === el) continue;
      const ox = parseFloat(other.style.left);
      const oy = parseFloat(other.style.top);
      const dx = ex - ox;
      const dy = ey - oy;
      const distSq = dx * dx + dy * dy;
      if (distSq <= 0.001 || distSq > desired * desired) continue;
      const dist = Math.sqrt(distSq);
      const force = (desired - dist) / desired;
      sepX += (dx / dist) * force;
      sepY += (dy / dist) * force;
    }
    return { x: sepX, y: sepY };
  }
}
