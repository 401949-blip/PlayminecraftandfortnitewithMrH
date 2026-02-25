export const ENEMY_REGISTRY = {
  flying_basic: {
    id: "flying_basic",
    speedScale: 1,
    sprite: {
      src: "../assets/images/enemy.png",
      frameWidth: 81,
      frameHeight: 71,
      frames: 4,
      frameMs: 150
    },
    fairness: {
      spawnSafeMs: 700,
      separationRadius: 52
    }
  }
};
