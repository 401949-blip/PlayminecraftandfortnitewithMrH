export const BOSS_REGISTRY = {
  evil_hathaway: {
    id: "evil_hathaway",
    name: "EVIL HATHAWAY",
    imageSrc: "../assets/images/hathaway.jpeg",
    hp: 34,
    autoSpawnMs: 120000,
    introVariant: "hathaway",
    canTakeOrbDamage: true,
    canMove: true,
    canAttack: true,
    canSpawnMinions: true,
    spawnIntroOrbs: true,
    contactKillsPlayer: true,
    orbCap: 9,
    minionIntervalMs: 3300,
    bulletIntervalMs: 1350,
    orbIntervalMs: 900
  },
  descended_fulton: {
    id: "descended_fulton",
    name: "DESCENDED FULTON",
    imageSrc: "../assets/images/fulton.jpeg",
    hp: 999,
    autoSpawnMs: 240000,
    introVariant: "fulton",
    summonCode: "FLTN",
    canTakeOrbDamage: false,
    canMove: false,
    canAttack: false,
    canSpawnMinions: false,
    spawnIntroOrbs: true,
    contactKillsPlayer: true,
    orbCap: 9,
    minionIntervalMs: 0,
    bulletIntervalMs: 0,
    orbIntervalMs: 1600
  }
};
