import { CONSTANTS, PHASES } from "../config/constants.js";
import { STAGE_BACKGROUNDS } from "../config/backgrounds.js";
import { createDomRefs } from "../adapters/dom/domRefs.js";
import { EventBus } from "../core/EventBus.js";
import { Clock } from "../core/Clock.js";
import { Scheduler } from "../core/Scheduler.js";
import { FrameLoop } from "../core/FrameLoop.js";
import { GameStore } from "../state/GameStore.js";
import { GamePhaseMachine } from "../state/GamePhaseMachine.js";
import { StorageService } from "../services/StorageService.js";
import { HighScoreService } from "../services/HighScoreService.js";
import { BackgroundService } from "../services/BackgroundService.js";
import { AudioService } from "../services/AudioService.js";
import { CutsceneDirector } from "../services/CutsceneDirector.js";
import { EffectsService } from "../effects/EffectsService.js";
import { SpawnSystem } from "../systems/SpawnSystem.js";
import { PowerupSystem } from "../systems/PowerupSystem.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { BossSystem } from "../systems/BossSystem.js";
import { PlayerMovementSystem } from "../systems/PlayerMovementSystem.js";
import { UISystem } from "../systems/UISystem.js";
import { MenuController } from "../ui/MenuController.js";

export class GameApp {
  constructor() {
    this.refs = createDomRefs();
    this.store = new GameStore();
    this.bus = new EventBus();
    this.phaseMachine = new GamePhaseMachine(PHASES.BOOT, ({ from, to }) => {
      this.bus.emit("PHASE_CHANGED", { from, to });
    });

    this.clock = new Clock(this.store);
    this.scheduler = new Scheduler(this.store);

    this.storage = new StorageService();
    this.audio = new AudioService();
    this.backgroundService = new BackgroundService(this.store, this.refs, STAGE_BACKGROUNDS, Math);
    this.highScoreService = new HighScoreService(this.store, this.refs, this.storage, this.bus);
    this.cutsceneDirector = new CutsceneDirector(this.store);

    this.effects = new EffectsService({
      store: this.store,
      refs: this.refs,
      audio: this.audio,
      constants: CONSTANTS,
      highScoreService: this.highScoreService,
      backgroundService: this.backgroundService
    });

    this.spawnSystem = new SpawnSystem({
      store: this.store,
      refs: this.refs,
      effects: this.effects,
      scheduler: this.scheduler
    });

    this.uiSystem = new UISystem({
      store: this.store,
      refs: this.refs,
      effects: this.effects,
      highScoreService: this.highScoreService
    });

    this.powerupSystem = new PowerupSystem({
      store: this.store,
      refs: this.refs,
      effects: this.effects,
      audio: this.audio,
      cutsceneDirector: this.cutsceneDirector,
      spawnSystem: this.spawnSystem
    });

    this.enemySystem = new EnemySystem({
      store: this.store,
      refs: this.refs,
      effects: this.effects
    });

    this.bossSystem = new BossSystem({
      store: this.store,
      refs: this.refs,
      spawnSystem: this.spawnSystem,
      effects: this.effects,
      audio: this.audio,
      cutsceneDirector: this.cutsceneDirector,
      scheduler: this.scheduler
    });

    this.playerMovementSystem = new PlayerMovementSystem({
      store: this.store,
      refs: this.refs
    });

    this.frameLoop = new FrameLoop(this.store, () => this.tick());

    this.menuController = new MenuController({
      store: this.store,
      refs: this.refs,
      onStartGame: () => this.startGame(),
      onRestartGame: () => this.restartGame(),
      onExitToMainMenu: () => this.exitToMainMenu(),
      onTogglePause: () => this.togglePause(),
      onPauseChange: (isPaused) => {
        if (isPaused) this.phaseMachine.transition(PHASES.PAUSED);
        else this.phaseMachine.transition(PHASES.RUNNING);
      },
      audio: this.audio,
      highScoreService: this.highScoreService
    });

    this.powerupSystem.setHooks({
      addScore: (p) => this.addScore(p),
      onBossOrbHit: (dmg) => this.bossSystem.onBossOrbHit(dmg)
    });

    this.enemySystem.setHooks({
      consumeShieldHit: (source, removeSource) => this.powerupSystem.consumeShieldHit(source, removeSource),
      onDeath: () => this.effects.death(),
      addScore: (p) => this.addScore(p)
    });

    this.bossSystem.setHooks({
      restartMainTimers: (opts) => this.spawnSystem.startMainTimers(opts?.fromBoss ? 34000 : 28000),
      consumeShieldHit: (source, removeSource) => this.powerupSystem.consumeShieldHit(source, removeSource),
      onDeath: () => this.effects.death()
    });

    this.effects.setDeathFinalizeHandler(() => this.finalizeDeathState());
  }

  togglePause() {
    this.menuController.setPaused(!this.store.paused);
  }

  init() {
    this.spawnSystem.resizeIceCanvas();
    this.menuController.bind();

    this.backgroundService.applyInitialBackground();
    this.highScoreService.load();

    this.phaseMachine.transition(PHASES.MENU);
    this.menuController.showStartMenu();

    window.addEventListener("resize", () => {
      this.spawnSystem.resizeIceCanvas();
      this.powerupSystem.drawIcePath(Date.now());
    });
  }

  addScore(points) {
    this.uiSystem.addScore(points);
  }

  finalizeDeathState() {
    this.cutsceneDirector.cancelAll();
    if (this.store.bossActive) {
      this.bossSystem.endBossFight(false);
    }
    this.spawnSystem.clearTimers();
    this.scheduler.cancelAll();
    this.spawnSystem.clearDynamicObjects();
    this.frameLoop.stop();
    this.store.loopRunning = false;
    this.phaseMachine.transition(PHASES.GAME_OVER);
  }

  scheduleNextBoss() {
    this.bossSystem.scheduleNextBoss();
  }

  resetStateForRun() {
    this.frameLoop.stop();
    this.spawnSystem.clearTimers();
    this.scheduler.cancelAll();
    this.cutsceneDirector.cancelAll();
    this.cutsceneDirector.endCutscene();
    this.spawnSystem.clearDynamicObjects();

    this.store.resetRun();
    this.audio.stopTheme();

    this.scheduleNextBoss();
    this.powerupSystem.drawIcePath(Date.now());
    this.uiSystem.resetRunUI();
  }

  beginRunLoop() {
    this.spawnSystem.spawn("orb");
    this.spawnSystem.startMainTimers();
    this.refs.game.focus();
    this.frameLoop.start();
  }

  startGame() {
    if (this.store.gameStarted || this.store.transitioningMenu) return;
    this.menuController.hideStartMenuAndStart(() => {
      this.resetStateForRun();
      this.beginRunLoop();
      this.phaseMachine.transition(PHASES.RUNNING);
    });
  }

  restartGame() {
    this.audio.sfx("ui");
    if (this.store.gameOver && this.store.pendingBackgroundReroll) {
      this.backgroundService.consumePendingReroll();
    }

    this.resetStateForRun();
    this.store.gameStarted = true;
    this.store.menuOpen = false;
    this.store.paused = false;
    this.refs.game.classList.remove("menu-mode", "paused-mode");

    this.beginRunLoop();
    this.phaseMachine.transition(PHASES.RUNNING);
  }

  exitToMainMenu() {
    this.menuController.exitToMainMenu(() => {
      if (this.store.gameOver && this.store.pendingBackgroundReroll) {
        this.backgroundService.consumePendingReroll();
      }
      this.resetStateForRun();
      this.phaseMachine.transition(PHASES.MENU);
    });
  }

  tick() {
    const s = this.store;

    if (s.gameOver) {
      this.frameLoop.stop();
      return;
    }

    const nowMs = Date.now();
    if (s.cutsceneActive) {
      if (!s.cutsceneFreezeAt) {
        s.cutsceneFreezeAt = nowMs;
        s.kirkShieldFrozenInCutscene = s.kirkInvincibleUntil > nowMs;
      }
      const frozenDelta = nowMs - s.cutsceneFreezeAt;
      if (frozenDelta > 0 && s.kirkShieldFrozenInCutscene) {
        s.kirkInvincibleUntil += frozenDelta;
      }
      s.cutsceneFreezeAt = nowMs;
    } else {
      s.cutsceneFreezeAt = 0;
      s.kirkShieldFrozenInCutscene = false;
    }

    if (s.menuOpen || s.paused) {
      return;
    }

    const frameNow = performance.now();
    const frameDt = s.lastFrameAt ? (frameNow - s.lastFrameAt) / (1000 / 60) : 1;
    const dt = Math.max(0.5, Math.min(1.8, frameDt));
    s.lastFrameAt = frameNow;

    this.uiSystem.updateRunTime();
    this.powerupSystem.updateShieldRingPosition();
    this.powerupSystem.updateKirkShieldRing();

    if (s.cutsceneActive) {
      this.phaseMachine.transition(PHASES.CUTSCENE);
      return;
    }
    if (this.phaseMachine.is(PHASES.CUTSCENE) && s.bossActive) {
      this.phaseMachine.transition(PHASES.BOSS);
    } else if (this.phaseMachine.is(PHASES.CUTSCENE) && !s.bossActive) {
      this.phaseMachine.transition(PHASES.RUNNING);
    }

    const wrapped = this.playerMovementSystem.update(dt);

    const now = Date.now();
    this.powerupSystem.updateDrakeTrails(now, wrapped);

    if (this.bossSystem.shouldStartBoss(now)) {
      this.phaseMachine.transition(PHASES.BOSS);
      this.bossSystem.startBossFight();
    }

    this.bossSystem.updateBoss(dt);
    this.enemySystem.updateBossBullets(dt);
    this.enemySystem.updateEnemies(now, dt);
    this.powerupSystem.updateOrbCollisions();
    this.powerupSystem.updatePowerupCollisions();

    if (!s.bossActive && this.phaseMachine.is(PHASES.BOSS)) {
      this.phaseMachine.transition(PHASES.RUNNING);
    }
  }
}
