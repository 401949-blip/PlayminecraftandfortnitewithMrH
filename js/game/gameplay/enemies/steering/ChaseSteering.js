export class ChaseSteering {
  compute(state, ex, ey) {
    const dx = state.x - ex;
    const dy = state.y - ey;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: dx / dist,
      y: dy / dist
    };
  }
}
