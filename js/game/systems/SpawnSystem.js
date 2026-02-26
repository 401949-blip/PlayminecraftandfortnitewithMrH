import { CONSTANTS } from "../config/constants.js";
import { POWERUP_REGISTRY } from "../gameplay/powerups/PowerupRegistry.js";
import { AssetCatalog } from "../services/AssetCatalog.js";

export class SpawnSystem {
  constructor({ store, refs, effects, scheduler }) {
    this.store = store;
    this.refs = refs;
    this.effects = effects;
    this.scheduler = scheduler;
    this.timerHandles = [];
  }

  resizeIceCanvas() {
    const { icePathCanvas, icePathCtx } = this.refs;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    icePathCanvas.width = Math.floor(w * dpr);
    icePathCanvas.height = Math.floor(h * dpr);
    icePathCanvas.style.width = w + "px";
    icePathCanvas.style.height = h + "px";
    icePathCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clearTimers() {
    this.timerHandles.forEach(handle => this.scheduler.cancel(handle));
    this.timerHandles = [];
  }

  enemyBudgetNow() {
    const elapsedSec = Math.max(0, (Date.now() - this.store.runStartedAt) / 1000);
    const ramp = Math.min(CONSTANTS.MAX_ENEMIES_RAMP, Math.floor(elapsedSec / 25));
    return CONSTANTS.MAX_ENEMIES_BASE + ramp;
  }

  canSpawnEnemy() {
    const activeEnemies = document.querySelectorAll(".enemy").length;
    return activeEnemies < this.enemyBudgetNow();
  }

  initEnemySpawnGrace(enemyEl) {
    enemyEl.dataset.spawnSafeUntil = String(Date.now() + CONSTANTS.ENEMY_SPAWN_SAFE_MS);
    enemyEl.classList.add("spawn-safe");
  }

  startMainTimers(drakeIntervalMs = POWERUP_REGISTRY.drake.cooldownMs) {
    const s = this.store;
    const r = this.refs;
    this.clearTimers();

    this.timerHandles.push(this.scheduler.every(2200, () => {
      if (!s.gameOver && !s.cutsceneActive && !s.paused && !s.menuOpen && this.canSpawnEnemy()) this.spawn("enemy");
    }));

    this.timerHandles.push(this.scheduler.every(POWERUP_REGISTRY.power.cooldownMs, () => {
      if (s.gameOver || s.cutsceneActive || s.paused || s.menuOpen) return;
      this.spawn("power");
    }));

    this.timerHandles.push(this.scheduler.every(POWERUP_REGISTRY.kirk.cooldownMs, () => {
      if (s.gameOver || s.cutsceneActive || s.paused || s.menuOpen) return;
      this.spawn("kirk");
    }));

    this.timerHandles.push(this.scheduler.every(POWERUP_REGISTRY.bonix.cooldownMs, () => {
      if (s.gameOver || s.cutsceneActive || s.paused || s.menuOpen || s.hasShield) return;
      if (document.querySelectorAll(".bonix").length === 0) this.spawn("bonix");
    }));

    this.timerHandles.push(this.scheduler.every(drakeIntervalMs, () => {
      if (s.gameOver || s.cutsceneActive || s.paused || s.menuOpen || Date.now() < s.drakePowerUntil) return;
      if (document.querySelectorAll(".drake").length === 0) this.spawn("drake");
    }));

    this.timerHandles.push(this.scheduler.every(5000, () => {
      if (s.gameOver || s.cutsceneActive || s.paused || s.menuOpen) return;
      s.speed = Math.min(s.speed + 0.35, 70);
      s.enemySpeed = Math.min(s.enemySpeed + 0.05, 4.5);
      r.spdEl.textContent = s.speed.toFixed(1);
    }));
  }

  clearDynamicObjects() {
    document.querySelectorAll(".orb,.enemy,.power,.kirk,.bonix,.drake,.cutscene-overlay,.boss,.boss-bullet").forEach(el => el.remove());
  }

  spawn(cls) {
    const s = this.store;
    const game = this.refs.game;

    if (s.gameOver || s.menuOpen) return null;
    if (cls === "enemy" && !this.canSpawnEnemy()) return null;
    if (["power", "kirk", "bonix", "drake"].includes(cls)) {
      const activePowerups = document.querySelectorAll(".power,.kirk,.bonix,.drake").length;
      if (activePowerups >= 2) return null;
    }

    const d = document.createElement("div");
    d.className = cls;

    let sx = 0;
    let sy = 0;
    let found = false;
    const maxAttempts = 80;
    const enemies = Array.from(document.querySelectorAll(".enemy"));
    const orbs = Array.from(document.querySelectorAll(".orb"));
    const powerups = Array.from(document.querySelectorAll(".power,.kirk,.bonix,.drake"));

    const tooDenseAt = (px, py) => {
      let local = 0;
      for (let i = 0; i < enemies.length; i++) {
        const ex = parseFloat(enemies[i].style.left) + 16;
        const ey = parseFloat(enemies[i].style.top) + 16;
        const dx = px - ex;
        const dy = py - ey;
        if ((dx * dx + dy * dy) <= CONSTANTS.ENEMY_LOCAL_DENSITY_RADIUS * CONSTANTS.ENEMY_LOCAL_DENSITY_RADIUS) {
          local += 1;
          if (local >= 3) return true;
        }
      }
      return false;
    };

    for (let i = 0; i < maxAttempts; i++) {
      sx = Math.random() * (window.innerWidth - 50);
      sy = Math.random() * (window.innerHeight - 50);

      if (cls === "enemy") {
        const px = sx + 16;
        const py = sy + 16;
        const dx = px - s.x;
        const dy = py - s.y;
        if ((dx * dx + dy * dy) < CONSTANTS.ENEMY_SAFE_RADIUS * CONSTANTS.ENEMY_SAFE_RADIUS) continue;

        let nearOrb = false;
        for (let j = 0; j < orbs.length; j++) {
          const ox = parseFloat(orbs[j].style.left) + 11;
          const oy = parseFloat(orbs[j].style.top) + 11;
          const odx = px - ox;
          const ody = py - oy;
          if ((odx * odx + ody * ody) < CONSTANTS.ORB_SAFE_RADIUS * CONSTANTS.ORB_SAFE_RADIUS) {
            nearOrb = true;
            break;
          }
        }
        if (nearOrb) continue;

        let nearPowerup = false;
        for (let j = 0; j < powerups.length; j++) {
          const px2 = parseFloat(powerups[j].style.left) + powerups[j].getBoundingClientRect().width / 2;
          const py2 = parseFloat(powerups[j].style.top) + powerups[j].getBoundingClientRect().height / 2;
          const pdx = px - px2;
          const pdy = py - py2;
          if ((pdx * pdx + pdy * pdy) < CONSTANTS.POWERUP_SAFE_RADIUS * CONSTANTS.POWERUP_SAFE_RADIUS) {
            nearPowerup = true;
            break;
          }
        }
        if (nearPowerup) continue;

        if (tooDenseAt(px, py)) continue;
        found = true;
        break;
      }

      if (cls === "orb") {
        const px = sx + 11;
        const py = sy + 11;
        const nearEdge =
          px < CONSTANTS.ORB_EDGE_SAFE_MARGIN ||
          py < CONSTANTS.ORB_EDGE_SAFE_MARGIN ||
          px > window.innerWidth - CONSTANTS.ORB_EDGE_SAFE_MARGIN ||
          py > window.innerHeight - CONSTANTS.ORB_EDGE_SAFE_MARGIN;
        if (nearEdge) continue;

        const cornerTooFar =
          (px < CONSTANTS.ORB_CORNER_SAFE_RADIUS && py < CONSTANTS.ORB_CORNER_SAFE_RADIUS) ||
          (px > window.innerWidth - CONSTANTS.ORB_CORNER_SAFE_RADIUS && py < CONSTANTS.ORB_CORNER_SAFE_RADIUS) ||
          (px < CONSTANTS.ORB_CORNER_SAFE_RADIUS && py > window.innerHeight - CONSTANTS.ORB_CORNER_SAFE_RADIUS) ||
          (px > window.innerWidth - CONSTANTS.ORB_CORNER_SAFE_RADIUS && py > window.innerHeight - CONSTANTS.ORB_CORNER_SAFE_RADIUS);
        if (cornerTooFar) continue;

        let tooRisky = false;
        for (let j = 0; j < enemies.length; j++) {
          const ex = parseFloat(enemies[j].style.left) + 16;
          const ey = parseFloat(enemies[j].style.top) + 16;
          const dx = px - ex;
          const dy = py - ey;
          if ((dx * dx + dy * dy) < CONSTANTS.ORB_SAFE_RADIUS * CONSTANTS.ORB_SAFE_RADIUS) {
            tooRisky = true;
            break;
          }
        }
        if (tooRisky) continue;

        found = true;
        break;
      }

      found = true;
      break;
    }

    if (!found) return null;

    if (cls === "enemy") {
      const finalX = sx + 16;
      const finalY = sy + 16;
      const dx = finalX - s.x;
      const dy = finalY - s.y;
      if ((dx * dx + dy * dy) < CONSTANTS.ENEMY_SAFE_RADIUS * CONSTANTS.ENEMY_SAFE_RADIUS) return null;
    }

    d.style.left = sx + "px";
    d.style.top = sy + "px";

    if (cls === "enemy") {
      this.initEnemySpawnGrace(d);
      const flyPhase = (Math.random() * 0.6).toFixed(3);
      const hoverPhase = (Math.random() * 0.95).toFixed(3);
      const glowPhase = (Math.random() * 1.1).toFixed(3);
      d.style.setProperty("--enemy-fly-delay", `-${flyPhase}s`);
      d.style.setProperty("--enemy-hover-delay", `-${hoverPhase}s`);
      d.style.setProperty("--enemy-glow-delay", `-${glowPhase}s`);
      d.classList.add("spawn-in");
      setTimeout(() => d.classList.remove("spawn-in"), 300);
    } else if (cls === "orb") {
      d.classList.add("spawn-in");
      setTimeout(() => d.classList.remove("spawn-in"), 300);
    } else if (cls === "power" || cls === "kirk" || cls === "bonix" || cls === "drake") {
      const powerupSrc = AssetCatalog.powerups[cls === "power" ? "devito" : cls];
      if (powerupSrc) {
        d.style.backgroundImage = `linear-gradient(rgba(9, 10, 15, 0.08), rgba(9, 10, 15, 0.08)), url('${powerupSrc}')`;
      }
    }

    game.appendChild(d);
    return d;
  }
}
