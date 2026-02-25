export class ObjectiveAvoidanceSteering {
  constructor(avoidDistance) {
    this.avoidDistance = avoidDistance;
  }

  compute(powerups, ex, ey) {
    let ax = 0;
    let ay = 0;
    const avoidDist = this.avoidDistance;
    for (let i = 0; i < powerups.length; i++) {
      const p = powerups[i];
      const pw = p.getBoundingClientRect().width || 32;
      const ph = p.getBoundingClientRect().height || 32;
      const px = parseFloat(p.style.left) + pw / 2;
      const py = parseFloat(p.style.top) + ph / 2;
      const dx = ex + 16 - px;
      const dy = ey + 16 - py;
      const distSq = dx * dx + dy * dy;
      if (distSq <= 0.001 || distSq > avoidDist * avoidDist) continue;
      const dist = Math.sqrt(distSq);
      const force = (avoidDist - dist) / avoidDist;
      ax += (dx / dist) * force;
      ay += (dy / dist) * force;
    }
    return { x: ax, y: ay };
  }
}
