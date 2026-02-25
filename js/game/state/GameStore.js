import { CONSTANTS } from "../config/constants.js";

export class GameStore {
  constructor() {
    this.resetAll();
  }

  resetAll() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.velX = 0;
    this.velY = 0;
    this.speed = CONSTANTS.PLAYER_START_SPEED;
    this.acceleration = CONSTANTS.PLAYER_ACCELERATION;
    this.friction = CONSTANTS.PLAYER_FRICTION;
    this.enemySpeed = CONSTANTS.ENEMY_START_SPEED;
    this.score = 0;

    this.invincible = false;
    this.gameOver = false;
    this.cutsceneActive = false;
    this.gameStarted = false;
    this.paused = false;
    this.menuOpen = false;
    this.transitioningMenu = false;

    this.keys = {};

    this.enemyTimer = null;
    this.powerTimer = null;
    this.kirkTimer = null;
    this.pacingTimer = null;
    this.bossMinionTimer = null;
    this.bossBulletTimer = null;
    this.bossOrbTimer = null;
    this.boNixTimer = null;
    this.drakeTimer = null;

    this.nextBossAt = 0;
    this.bossActive = false;
    this.bossEl = null;
    this.bossX = 0;
    this.bossY = 0;
    this.bossVx = 0;
    this.bossVy = 0;
    this.bossDashFrames = 0;
    this.bossDashCooldown = 180;
    this.bossHp = 0;
    this.bossMaxHp = 0;

    this.hasShield = false;
    this.shieldImmuneUntil = 0;
    this.kirkInvincibleUntil = 0;
    this.drakePowerUntil = 0;
    this.nextIceTrailAt = 0;
    this.icePathPoints = [];

    this.wrapGraceUntil = 0;

    this.runStartedAt = Date.now();
    this.pausedAccumulatedMs = 0;
    this.pauseStartedAt = 0;

    this.lastFrameAt = 0;
    this.loopRafId = 0;
    this.loopRunning = false;

    this.cutsceneFreezeAt = 0;
    this.kirkShieldFrozenInCutscene = false;

    this.pendingBackgroundReroll = false;
    this.currentStageBackground = "";

    this.highScore = 0;
    this.newHighScoreRun = false;

    this.inputEnabled = true;
    this.dynamicParticleHandles = new Set();
  }

  resetRun() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.velX = 0;
    this.velY = 0;
    this.speed = CONSTANTS.PLAYER_START_SPEED;
    this.acceleration = CONSTANTS.PLAYER_ACCELERATION;
    this.friction = CONSTANTS.PLAYER_FRICTION;
    this.enemySpeed = CONSTANTS.ENEMY_START_SPEED;
    this.score = 0;
    this.invincible = false;
    this.gameOver = false;
    this.cutsceneActive = false;
    this.keys = {};

    this.nextBossAt = 0;
    this.bossActive = false;
    this.bossEl = null;
    this.bossX = 0;
    this.bossY = 0;
    this.bossVx = 0;
    this.bossVy = 0;
    this.bossDashFrames = 0;
    this.bossDashCooldown = 180;
    this.bossHp = 0;
    this.bossMaxHp = 0;

    this.hasShield = false;
    this.shieldImmuneUntil = 0;
    this.kirkInvincibleUntil = 0;
    this.drakePowerUntil = 0;
    this.nextIceTrailAt = 0;
    this.icePathPoints = [];
    this.wrapGraceUntil = 0;

    this.runStartedAt = Date.now();
    this.pausedAccumulatedMs = 0;
    this.pauseStartedAt = 0;

    this.lastFrameAt = performance.now();
    this.cutsceneFreezeAt = 0;
    this.kirkShieldFrozenInCutscene = false;

    this.newHighScoreRun = false;
    this.dynamicParticleHandles.clear();
  }

  getRunElapsedMs(now = Date.now()) {
    const livePauseMs = this.paused && this.pauseStartedAt ? (now - this.pauseStartedAt) : 0;
    return Math.max(0, now - this.runStartedAt - this.pausedAccumulatedMs - livePauseMs);
  }

  playerDamageImmune() {
    const now = Date.now();
    return this.invincible || now < this.wrapGraceUntil || now < this.kirkInvincibleUntil;
  }
}
