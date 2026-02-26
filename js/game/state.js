const ENEMY_SAFE_RADIUS = 240;
const WRAP_GRACE_MS = 220;
const ORB_SAFE_RADIUS = 120;
const POWERUP_SAFE_RADIUS = 120;
const ENEMY_LOCAL_DENSITY_RADIUS = 140;
const MAX_ENEMIES_BASE = 5;
const MAX_ENEMIES_RAMP = 8;
const ENEMY_SPAWN_SAFE_MS = 700;
const CUTSCENE_TIME_SCALE = 0.65;
const ORB_CORNER_SAFE_RADIUS = 140;
const ORB_EDGE_SAFE_MARGIN = 92;

const startScreen = document.getElementById("start");
const startO = document.getElementById("startO");
const game = document.getElementById("game");
const player = document.getElementById("player");
const icePathCanvas = document.getElementById("icePathCanvas");
const icePathCtx = icePathCanvas.getContext("2d");
const scoreEl = document.getElementById("score");
const spdEl = document.getElementById("spd");
const timeEl = document.getElementById("timeSurvived");
const shieldRing = document.getElementById("shieldRing");
const kirkShieldRing = document.getElementById("kirkShieldRing");
const playBtn = document.getElementById("playAgain");
const deathExitBtn = document.getElementById("deathExitMenu");
const deathScoreEl = document.getElementById("deathScore");
const deathTimeEl = document.getElementById("deathTime");
const deathScreenEl = document.getElementById("deathScreen");
const confettiLayer = document.getElementById("confettiLayer");
const menuHighScoreValueEl = document.getElementById("menuHighScoreValue");
const deathHighScoreValueEl = document.getElementById("deathHighScoreValue");
const newHighScoreTextEl = document.getElementById("newHighScoreText");
const bossUI = document.getElementById("bossUI");
const bossFill = document.getElementById("bossFill");
const bossHpText = document.getElementById("bossHpText");
const bossNameEl = document.getElementById("bossName");
const bossAmbience = document.getElementById("bossAmbience");
const hudTop = document.getElementById("hudTop");

let x = window.innerWidth / 2;
let y = window.innerHeight / 2;
let velX = 0;
let velY = 0;
let speed = 18;
let acceleration = 1.2;
let friction = 0.9;
let enemySpeed = 0.6;
let score = 0;
let invincible = false;
let gameOver = false;
let cutsceneActive = false;
let keys = {};
let gameStarted = false;
let paused = false;
let menuOpen = false;

let enemyTimer;
let powerTimer;
let kirkTimer;
let pacingTimer;
let bossMinionTimer;
let bossBulletTimer;
let bossOrbTimer;
let boNixTimer;
let drakeTimer;

let nextBossAt = 0;
let bossActive = false;
let currentBossType = "";
let evilJackSpawned = false;
let evilJackQueued = false;
let bossEl = null;
let bossX = 0;
let bossY = 0;
let bossVx = 0;
let bossVy = 0;
let bossDashFrames = 0;
let bossDashCooldown = 180;
let bossHp = 0;
let bossMaxHp = 0;
let hasShield = false;
let shieldImmuneUntil = 0;
let runStartedAt = 0;
let kirkInvincibleUntil = 0;
let drakePowerUntil = 0;
let nextIceTrailAt = 0;
let icePathPoints = [];
let wrapGraceUntil = 0;
let lastFrameAt = 0;
let loopRafId = 0;
let loopRunning = false;
let cutsceneFreezeAt = 0;
let kirkShieldFrozenInCutscene = false;
let pendingBackgroundReroll = false;
let currentStageBackground = "";
let highScore = 0;
let newHighScoreRun = false;
let hathawaySpawnRemainingMs = 120000;
let hathawaySpawnResumeAt = 0;
let playerFrozenUntil = 0;
let scoreMultiplierUntil = 0;
let devitoModeActive = false;
let devitoRunNoRecord = false;
let audioCtx = null;
let audioReady = false;
let activeThemeStop = null;
const FX_SETTINGS = {
  deathBurstParticles: 8,
  devitoPetals: 52,
  boNixDust: 12,
  kirkUndead: 40,
  wipeBatchSize: 12,
  wipeBurstStride: 2
};

const STAGE_BACKGROUNDS = [
  "../assets/images/Backgrounds/wallhaven-0w5ggp.jpg",
  "../assets/images/Backgrounds/wallhaven-3qqdg6.jpg",
  "../assets/images/Backgrounds/wallhaven-3qw9y6.jpg",
  "../assets/images/Backgrounds/wallhaven-6lm38l.jpg",
  "../assets/images/Backgrounds/wallhaven-76zg7o.jpg",
  "../assets/images/Backgrounds/wallhaven-7j9y3e.jpg",
  "../assets/images/Backgrounds/wallhaven-958xx1.jpg",
  "../assets/images/Backgrounds/wallhaven-9o2x61.jpg",
  "../assets/images/Backgrounds/wallhaven-9ozv1w.jpg",
  "../assets/images/Backgrounds/wallhaven-gw5ypd.jpg",
  "../assets/images/Backgrounds/wallhaven-lyzx6q.jpg",
  "../assets/images/Backgrounds/wallhaven-nz25zw.jpg",
  "../assets/images/Backgrounds/wallhaven-nzpxkv.jpg",
  "../assets/images/Backgrounds/wallhaven-ogyeol.jpg",
  "../assets/images/Backgrounds/wallhaven-polq8m.jpg",
  "../assets/images/Backgrounds/wallhaven-pow2wp.jpg",
  "../assets/images/Backgrounds/wallhaven-qr27rq.jpg",
  "../assets/images/Backgrounds/wallhaven-xezvl3.jpg",
  "../assets/images/Backgrounds/wallhaven-yq56d7.jpg",
  "../assets/images/Backgrounds/wallhaven-yq5o8k.jpg",
  "../assets/images/Backgrounds/wallhaven-yq8k2d.png"
];
