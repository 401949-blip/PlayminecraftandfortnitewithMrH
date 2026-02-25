import { BOSS_REGISTRY } from "../gameplay/bosses/BossRegistry.js";
import { BurstShotPattern } from "../gameplay/bosses/attacks/BurstShotPattern.js";

export class BossSystem {
  constructor({ store, refs, spawnSystem, effects, audio, cutsceneDirector, scheduler }) {
    this.store = store;
    this.refs = refs;
    this.spawnSystem = spawnSystem;
    this.effects = effects;
    this.audio = audio;
    this.cutsceneDirector = cutsceneDirector;
    this.scheduler = scheduler;
    this.mainTimerRestart = null;
    this.consumeShieldHit = null;
    this.onDeath = null;

    this.bossTimers = [];
    this.currentBossDef = BOSS_REGISTRY.evil_hathaway;
    this.burstAttack = new BurstShotPattern(
      () => this.spawnBossBullet(),
      (cb, ms) => this.cutsceneDirector.timeout(cb, ms)
    );
  }

  setHooks({ restartMainTimers, consumeShieldHit, onDeath }) {
    this.mainTimerRestart = restartMainTimers;
    this.consumeShieldHit = consumeShieldHit || null;
    this.onDeath = onDeath || null;
  }

  scheduleNextBoss() {
    this.store.nextBossAt = Date.now() + this.currentBossDef.unlockMs;
  }

  shouldStartBoss(now) {
    const s = this.store;
    return !s.bossActive && now >= s.nextBossAt;
  }

  clearBossTimers() {
    this.bossTimers.forEach(handle => this.scheduler.cancel(handle));
    this.bossTimers = [];
  }

  spawnEnemyNearBoss() {
    const s = this.store;
    if (!s.bossActive || !s.bossEl) return;
    if (!this.spawnSystem.canSpawnEnemy()) return;

    const e = document.createElement("div");
    e.className = "enemy";
    this.spawnSystem.initEnemySpawnGrace(e);

    const ang = Math.random() * Math.PI * 2;
    const r = 140 + Math.random() * 120;
    let sx = s.bossX + Math.cos(ang) * r;
    let sy = s.bossY + Math.sin(ang) * r;
    sx = Math.max(10, Math.min(window.innerWidth - 42, sx));
    sy = Math.max(10, Math.min(window.innerHeight - 42, sy));

    const dx = sx - s.x;
    const dy = sy - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 240 * 0.8) {
      sx = s.x + (dx / (dist || 1)) * 240 * 0.8;
      sy = s.y + (dy / (dist || 1)) * 240 * 0.8;
    }

    e.style.left = sx + "px";
    e.style.top = sy + "px";
    this.refs.game.appendChild(e);
  }

  spawnBossBullet() {
    const s = this.store;
    if (!s.bossActive || !s.bossEl) return;

    const b = document.createElement("div");
    b.className = "boss-bullet";
    const bx = s.bossX + 60;
    const by = s.bossY + 60;
    const dx = s.x - bx;
    const dy = s.y - by;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const bv = 4.3;
    b.dataset.vx = ((dx / dist) * bv).toString();
    b.dataset.vy = ((dy / dist) * bv).toString();
    b.style.left = (bx - 9) + "px";
    b.style.top = (by - 9) + "px";
    this.refs.game.appendChild(b);
  }

  updateBossUI() {
    const s = this.store;
    if (!s.bossActive) return;
    const pct = Math.max(0, Math.round((s.bossHp / s.bossMaxHp) * 100));
    this.refs.bossFill.style.width = pct + "%";
    this.refs.bossHpText.textContent = pct + "%";
  }

  beginBossPhase() {
    const s = this.store;

    this.spawnSystem.clearTimers();
    document.querySelectorAll(".enemy,.power,.kirk,.bonix").forEach(el => el.remove());
    document.querySelectorAll(".orb").forEach(el => el.remove());

    s.bossMaxHp = this.currentBossDef.hp;
    s.bossHp = s.bossMaxHp;
    s.bossX = Math.random() * (window.innerWidth - 160) + 20;
    s.bossY = 20;
    s.bossDashFrames = 0;
    s.bossDashCooldown = 120;
    s.bossVx = 0;
    s.bossVy = 0;

    s.bossEl = document.createElement("img");
    s.bossEl.src = "../assets/images/hathaway.jpeg";
    s.bossEl.className = "boss";
    s.bossEl.style.left = s.bossX + "px";
    s.bossEl.style.top = s.bossY + "px";
    this.refs.game.appendChild(s.bossEl);

    this.refs.bossUI.style.display = "block";
    this.refs.bossAmbience.style.display = "block";
    this.refs.game.classList.add("boss-mode");
    this.updateBossUI();

    for (let i = 0; i < 6; i++) this.spawnSystem.spawn("orb");

    this.bossTimers.push(this.scheduler.every(this.currentBossDef.minionIntervalMs, () => {
      if (!s.bossActive || s.gameOver || s.paused || s.menuOpen) return;
      if (this.spawnSystem.canSpawnEnemy()) this.spawnEnemyNearBoss();
      if (Math.random() < 0.55 && this.spawnSystem.canSpawnEnemy()) this.spawnEnemyNearBoss();
    }));

    this.bossTimers.push(this.scheduler.every(this.currentBossDef.bulletIntervalMs, () => {
      if (!s.bossActive || s.gameOver || s.paused || s.menuOpen) return;
      this.burstAttack.execute();
    }));

    this.bossTimers.push(this.scheduler.every(this.currentBossDef.orbIntervalMs, () => {
      if (!s.bossActive || s.gameOver || s.paused || s.menuOpen) return;
      if (document.querySelectorAll(".orb").length < this.currentBossDef.orbCap) this.spawnSystem.spawn("orb");
    }));
  }

  startBossIntro() {
    const s = this.store;
    this.cutsceneDirector.beginCutscene();

    const overlay = document.createElement("div");
    overlay.className = "cutscene-overlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.zIndex = "13000";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 500ms ease";
    overlay.style.background = "radial-gradient(circle at center, rgba(140,0,0,0.5) 0%, rgba(0,0,0,0.95) 70%)";
    overlay.style.overflow = "hidden";
    this.refs.game.appendChild(overlay);

    const warning = document.createElement("div");
    warning.textContent = "EVIL HATHAWAY HAS ARRIVED";
    warning.style.position = "absolute";
    warning.style.top = "18%";
    warning.style.left = "50%";
    warning.style.transform = "translate(-50%, -50%) scale(0.8)";
    warning.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
    warning.style.fontSize = "clamp(20px,4vw,42px)";
    warning.style.letterSpacing = "4px";
    warning.style.color = "#ffd5d5";
    warning.style.textShadow = "0 0 24px rgba(255, 75, 75, 0.9)";
    warning.style.opacity = "0";
    warning.style.transition = "all 700ms ease";
    overlay.appendChild(warning);

    const face = document.createElement("img");
    face.src = "../assets/images/hathaway.jpeg";
    face.style.position = "absolute";
    face.style.left = "50%";
    face.style.top = "56%";
    face.style.width = "300px";
    face.style.height = "300px";
    face.style.objectFit = "cover";
    face.style.borderRadius = "14px";
    face.style.transform = "translate(-50%,-50%) scale(0.45)";
    face.style.filter = "brightness(0.65) contrast(1.2) saturate(1.2) blur(4px)";
    face.style.boxShadow = "0 0 40px rgba(255, 40, 40, 0.75)";
    face.style.transition = "all 1.2s cubic-bezier(.2,.75,.2,1)";
    overlay.appendChild(face);

    this.cutsceneDirector.timeout(() => { overlay.style.opacity = "1"; }, 20);
    this.cutsceneDirector.timeout(() => {
      warning.style.opacity = "1";
      warning.style.transform = "translate(-50%, -50%) scale(1)";
    }, 240);
    this.cutsceneDirector.timeout(() => {
      face.style.transform = "translate(-50%,-50%) scale(1)";
      face.style.filter = "brightness(1.05) contrast(1.26) saturate(1.35) blur(0)";
    }, 450);
    this.cutsceneDirector.timeout(() => { overlay.style.opacity = "0"; }, 2500);
    this.cutsceneDirector.timeout(() => {
      overlay.remove();
      this.cutsceneDirector.endCutscene();
      this.beginBossPhase();
    }, 3050);
  }

  startBossFight() {
    const s = this.store;
    if (s.bossActive || s.gameOver || s.cutsceneActive) return;
    this.audio.sfx("boss");
    this.spawnSystem.clearTimers();
    s.bossActive = true;
    this.startBossIntro();
  }

  onBossOrbHit(damage = 1) {
    const s = this.store;
    if (!s.bossActive) return;
    s.bossHp -= damage;
    this.updateBossUI();
    if (s.bossHp <= 0) {
      this.kirkFinisherCutscene();
    }
  }

  kirkFinisherCutscene() {
    const s = this.store;
    if (!s.bossActive || !s.bossEl || s.cutsceneActive) return;
    this.audio.sfx("slash");
    this.cutsceneDirector.beginCutscene();
    this.clearBossTimers();

    const rect = s.bossEl.getBoundingClientRect();
    s.bossEl.style.opacity = "0";

    const overlay = document.createElement("div");
    overlay.className = "cutscene-overlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.zIndex = "14000";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 350ms ease";
    overlay.style.background = "radial-gradient(circle at center, rgba(24,30,52,0.45) 0%, rgba(0,0,0,0.92) 72%)";
    overlay.style.overflow = "hidden";
    this.refs.game.appendChild(overlay);

    this.cutsceneDirector.timeout(() => { overlay.style.opacity = "1"; }, 20);
    this.cutsceneDirector.timeout(() => {
      this.effects.animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, overlay);
    }, 980);
    this.cutsceneDirector.timeout(() => { overlay.style.opacity = "0"; }, 1650);
    this.cutsceneDirector.timeout(() => {
      overlay.remove();
      this.cutsceneDirector.endCutscene();
      this.endBossFight(true);
    }, 2050);
  }

  endBossFight(victory) {
    const s = this.store;

    this.clearBossTimers();

    if (s.bossEl) {
      const rect = s.bossEl.getBoundingClientRect();
      this.effects.animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, this.refs.game);
      s.bossEl.remove();
    }
    s.bossEl = null;
    s.bossActive = false;

    this.refs.bossUI.style.display = "none";
    this.refs.bossAmbience.style.display = "none";
    this.refs.game.classList.remove("boss-mode");
    document.querySelectorAll(".boss-bullet").forEach(el => el.remove());

    if (victory) {
      s.score += 200;
      this.refs.scoreEl.textContent = String(s.score);
      s.speed += 7;
      this.refs.spdEl.textContent = s.speed.toFixed(1);
    }

    if (!s.gameOver) {
      this.mainTimerRestart?.({ fromBoss: true });
      this.scheduleNextBoss();
    }
  }

  updateBoss(dt) {
    const s = this.store;
    if (!s.bossActive || !s.bossEl) return;

    const cx = s.bossX + 60;
    const cy = s.bossY + 60;
    const dx = s.x - cx;
    const dy = s.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const hpFactor = 1 - s.bossHp / s.bossMaxHp;
    const chase = 0.95 + hpFactor * 1.15;

    if (s.bossDashFrames > 0) {
      s.bossX += s.bossVx * dt;
      s.bossY += s.bossVy * dt;
      s.bossDashFrames -= dt;
    } else {
      s.bossX += (dx / dist) * chase * dt;
      s.bossY += (dy / dist) * chase * dt;
      s.bossDashCooldown -= dt;
      if (s.bossDashCooldown <= 0) {
        const dashSpeed = 5.2 + hpFactor * 1.2;
        s.bossVx = (dx / dist) * dashSpeed;
        s.bossVy = (dy / dist) * dashSpeed;
        s.bossDashFrames = 22;
        s.bossDashCooldown = 140 - Math.floor(hpFactor * 45);
        this.spawnBossBullet();
      }
    }

    s.bossX = Math.max(0, Math.min(window.innerWidth - 120, s.bossX));
    s.bossY = Math.max(0, Math.min(window.innerHeight - 120, s.bossY));
    s.bossEl.style.left = s.bossX + "px";
    s.bossEl.style.top = s.bossY + "px";

    if (!s.playerDamageImmune() && this.effects.collide(this.refs.player, s.bossEl) && !this.consumeShieldHit?.(null, false)) {
      this.onDeath?.();
    }
  }
}
