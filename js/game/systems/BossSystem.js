import { BOSS_REGISTRY } from "../gameplay/bosses/BossRegistry.js";
import { BurstShotPattern } from "../gameplay/bosses/attacks/BurstShotPattern.js";

export class BossSystem {
  constructor({ store, refs, spawnSystem, effects, audio, cutsceneDirector, scheduler, clock }) {
    this.store = store;
    this.refs = refs;
    this.spawnSystem = spawnSystem;
    this.effects = effects;
    this.audio = audio;
    this.cutsceneDirector = cutsceneDirector;
    this.scheduler = scheduler;
    this.clock = clock;
    this.mainTimerRestart = null;
    this.consumeShieldHit = null;
    this.onDeath = null;

    this.bossTimers = [];
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

  getBossList() {
    return Object.values(BOSS_REGISTRY);
  }

  getBossDef(bossId = this.store.currentBossId) {
    if (!bossId) return null;
    return BOSS_REGISTRY[bossId] || null;
  }

  scheduleNextBoss() {
    const now = this.clock.nowMs();
    const s = this.store;

    this.getBossList().forEach(def => {
      if (s.bossSpawnedById[def.id]) {
        s.nextBossAtById[def.id] = Number.POSITIVE_INFINITY;
        return;
      }
      s.nextBossAtById[def.id] = now + def.autoSpawnMs;
    });
  }

  getReadyBossId(now) {
    const s = this.store;
    if (s.bossActive || s.cutsceneActive || s.gameOver) return null;

    let readyBossId = null;
    let earliestAt = Number.POSITIVE_INFINITY;
    this.getBossList().forEach(def => {
      if (s.bossSpawnedById[def.id]) return;
      const nextAt = s.nextBossAtById[def.id];
      if (typeof nextAt !== "number") return;
      if (now >= nextAt && nextAt < earliestAt) {
        readyBossId = def.id;
        earliestAt = nextAt;
      }
    });
    return readyBossId;
  }

  summonBoss(bossId) {
    return this.startBossFight(bossId);
  }

  pausePendingBossTimers() {
    const s = this.store;
    if (!s.bossActive || s.bossTimerPausedAt) return;
    s.bossTimerPausedAt = this.clock.nowMs();
  }

  resumePendingBossTimers(excludedBossId = this.store.currentBossId) {
    const s = this.store;
    if (!s.bossTimerPausedAt) return;

    const pausedAt = s.bossTimerPausedAt;
    s.bossTimerPausedAt = 0;

    const pausedFor = Math.max(0, this.clock.nowMs() - pausedAt);
    if (pausedFor <= 0) return;

    this.getBossList().forEach(def => {
      if (def.id === excludedBossId) return;
      if (s.bossSpawnedById[def.id]) return;

      const nextAt = s.nextBossAtById[def.id];
      if (typeof nextAt === "number" && Number.isFinite(nextAt)) {
        s.nextBossAtById[def.id] = nextAt + pausedFor;
      }
    });
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
    const def = this.getBossDef();
    if (!def?.canAttack || !s.bossActive || !s.bossEl) return;

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
    const def = this.getBossDef();
    if (!s.bossActive || !def) return;

    if (this.refs.bossName) this.refs.bossName.textContent = def.name;
    const pct = Math.max(0, Math.round((s.bossHp / s.bossMaxHp) * 100));
    this.refs.bossFill.style.width = pct + "%";
    this.refs.bossHpText.textContent = pct + "%";
  }

  beginBossPhase() {
    const s = this.store;
    const def = this.getBossDef();
    if (!def) return;

    this.spawnSystem.clearTimers();
    document.querySelectorAll(".enemy,.power,.kirk,.bonix").forEach(el => el.remove());
    document.querySelectorAll(".orb").forEach(el => el.remove());

    s.bossMaxHp = def.hp;
    s.bossHp = s.bossMaxHp;
    s.bossX = Math.random() * (window.innerWidth - 160) + 20;
    s.bossY = 20;
    s.bossDashFrames = 0;
    s.bossDashCooldown = 120;
    s.bossVx = 0;
    s.bossVy = 0;

    s.bossEl = document.createElement("img");
    s.bossEl.src = def.imageSrc;
    s.bossEl.className = "boss";
    s.bossEl.style.left = s.bossX + "px";
    s.bossEl.style.top = s.bossY + "px";
    this.refs.game.appendChild(s.bossEl);

    this.refs.bossUI.style.display = "block";
    this.refs.bossAmbience.style.display = "block";
    this.refs.game.classList.add("boss-mode");
    this.updateBossUI();

    if (def.spawnIntroOrbs) {
      for (let i = 0; i < 6; i++) this.spawnSystem.spawn("orb");
    }

    if (def.canSpawnMinions && def.minionIntervalMs > 0) {
      this.bossTimers.push(this.scheduler.every(def.minionIntervalMs, () => {
        if (!s.bossActive || s.gameOver || s.paused || s.menuOpen) return;
        if (this.spawnSystem.canSpawnEnemy()) this.spawnEnemyNearBoss();
        if (Math.random() < 0.55 && this.spawnSystem.canSpawnEnemy()) this.spawnEnemyNearBoss();
      }));
    }

    if (def.canAttack && def.bulletIntervalMs > 0) {
      this.bossTimers.push(this.scheduler.every(def.bulletIntervalMs, () => {
        if (!s.bossActive || s.gameOver || s.paused || s.menuOpen) return;
        this.burstAttack.execute();
      }));
    }

    if (def.orbIntervalMs > 0) {
      this.bossTimers.push(this.scheduler.every(def.orbIntervalMs, () => {
        if (!s.bossActive || s.gameOver || s.paused || s.menuOpen) return;
        if (document.querySelectorAll(".orb").length < def.orbCap) this.spawnSystem.spawn("orb");
      }));
    }
  }

  runHathawayIntro(def) {
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
    warning.textContent = `${def.name} HAS ARRIVED`;
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
    face.src = def.imageSrc;
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

  runFultonIntro(def) {
    this.cutsceneDirector.beginCutscene();

    const overlay = document.createElement("div");
    overlay.className = "cutscene-overlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.zIndex = "13000";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 420ms ease";
    overlay.style.overflow = "hidden";
    overlay.style.background = "linear-gradient(180deg, rgba(8,5,5,0.42), rgba(24,5,5,0.85)), url('../assets/images/history.jpg') center/cover no-repeat";
    this.refs.game.appendChild(overlay);

    const vignette = document.createElement("div");
    vignette.style.position = "absolute";
    vignette.style.inset = "0";
    vignette.style.background = "radial-gradient(circle at center, rgba(255,64,64,0.08) 0%, rgba(0,0,0,0.72) 68%, rgba(0,0,0,0.9) 100%)";
    overlay.appendChild(vignette);

    const glow = document.createElement("img");
    glow.src = "../assets/images/fultontrans.png";
    glow.style.position = "absolute";
    glow.style.left = "50%";
    glow.style.top = "54%";
    glow.style.width = "min(56vw, 520px)";
    glow.style.height = "auto";
    glow.style.transform = "translate(-50%, 130%) scale(0.98)";
    glow.style.opacity = "0";
    glow.style.filter = "sepia(1) saturate(9) hue-rotate(-38deg) brightness(1.1) blur(20px)";
    glow.style.transition = "transform 1000ms cubic-bezier(.17,.84,.24,1), opacity 800ms ease";
    glow.style.pointerEvents = "none";
    overlay.appendChild(glow);

    const face = document.createElement("img");
    face.src = "../assets/images/fultontrans.png";
    face.style.position = "absolute";
    face.style.left = "50%";
    face.style.top = "54%";
    face.style.width = "min(56vw, 520px)";
    face.style.height = "auto";
    face.style.transform = "translate(-50%, 130%) scale(0.98)";
    face.style.opacity = "0";
    face.style.filter = "brightness(0.92) saturate(0.92) hue-rotate(0deg)";
    face.style.transition = "transform 1000ms cubic-bezier(.17,.84,.24,1), opacity 180ms ease, filter 800ms ease";
    face.style.pointerEvents = "none";
    overlay.appendChild(face);

    const title = document.createElement("div");
    title.textContent = "Descended Fulton has arrived";
    title.style.position = "absolute";
    title.style.left = "50%";
    title.style.top = "16%";
    title.style.transform = "translate(-50%, 24px) scale(0.94)";
    title.style.opacity = "0";
    title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
    title.style.fontSize = "clamp(22px, 4vw, 44px)";
    title.style.letterSpacing = "4px";
    title.style.color = "#ffd3d3";
    title.style.textTransform = "uppercase";
    title.style.textAlign = "center";
    title.style.textShadow = "0 0 26px rgba(255, 60, 60, 0.95), 0 0 42px rgba(132, 0, 0, 0.9)";
    title.style.transition = "transform 700ms cubic-bezier(.18,.88,.24,1), opacity 700ms ease";
    overlay.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.textContent = "Spero te scire historiam.";
    subtitle.style.position = "absolute";
    subtitle.style.left = "50%";
    subtitle.style.top = "24%";
    subtitle.style.transform = "translate(-50%, 18px)";
    subtitle.style.opacity = "0";
    subtitle.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
    subtitle.style.fontSize = "clamp(12px, 2vw, 18px)";
    subtitle.style.letterSpacing = "2px";
    subtitle.style.color = "rgba(255, 214, 214, 0.92)";
    subtitle.style.textAlign = "center";
    subtitle.style.textShadow = "0 0 18px rgba(255, 50, 50, 0.82)";
    subtitle.style.transition = "transform 680ms cubic-bezier(.18,.88,.24,1), opacity 680ms ease";
    overlay.appendChild(subtitle);

    this.cutsceneDirector.timeout(() => {
      overlay.style.opacity = "1";
      face.style.opacity = "1";
    }, 20);
    this.cutsceneDirector.timeout(() => {
      glow.style.transform = "translate(-50%, -50%) scale(1.02)";
      face.style.transform = "translate(-50%, -50%) scale(1)";
    }, 80);
    this.cutsceneDirector.timeout(() => {
      face.style.filter = "brightness(0.95) sepia(1) saturate(8.5) hue-rotate(-42deg) contrast(1.08)";
      glow.style.opacity = "0.92";
    }, 1080);
    this.cutsceneDirector.timeout(() => {
      title.style.opacity = "1";
      title.style.transform = "translate(-50%, 0) scale(1)";
      subtitle.style.opacity = "1";
      subtitle.style.transform = "translate(-50%, 0)";
    }, 1900);
    this.cutsceneDirector.timeout(() => {
      overlay.style.opacity = "0";
    }, 3700);
    this.cutsceneDirector.timeout(() => {
      overlay.remove();
      this.cutsceneDirector.endCutscene();
      this.beginBossPhase();
    }, 4200);
  }

  startBossIntro() {
    const def = this.getBossDef();
    if (!def) return;

    if (def.introVariant === "fulton") {
      this.runFultonIntro(def);
      return;
    }
    this.runHathawayIntro(def);
  }

  startBossFight(bossId) {
    const s = this.store;
    const def = this.getBossDef(bossId);
    if (!def) return false;
    if (s.bossActive || s.gameOver || s.cutsceneActive || s.bossSpawnedById[bossId]) return false;

    this.audio.sfx("boss");
    this.spawnSystem.clearTimers();
    s.currentBossId = bossId;
    s.bossSpawnedById[bossId] = true;
    s.nextBossAtById[bossId] = Number.POSITIVE_INFINITY;
    s.bossActive = true;
    this.pausePendingBossTimers();
    this.startBossIntro();
    return true;
  }

  onBossOrbHit(damage = 1) {
    const s = this.store;
    const def = this.getBossDef();
    if (!s.bossActive || !def?.canTakeOrbDamage) return;
    s.bossHp -= damage;
    this.updateBossUI();
    if (s.bossHp <= 0) {
      this.kirkFinisherCutscene();
    }
  }

  kirkFinisherCutscene() {
    const s = this.store;
    const def = this.getBossDef();
    if (!def?.canTakeOrbDamage || !s.bossActive || !s.bossEl || s.cutsceneActive) return;

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

    const label = document.createElement("div");
    label.textContent = "CHARLIE KIRK // HAMMER OF JUDGMENT";
    label.style.position = "absolute";
    label.style.top = "14%";
    label.style.left = "50%";
    label.style.transform = "translate(-50%, -50%)";
    label.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
    label.style.fontSize = "clamp(18px,2.8vw,30px)";
    label.style.letterSpacing = "3px";
    label.style.color = "#c9ffe0";
    label.style.textShadow = "0 0 22px rgba(96,255,178,0.85)";
    overlay.appendChild(label);

    const kirk = document.createElement("img");
    kirk.src = "../assets/images/kirk.jpeg";
    kirk.style.position = "absolute";
    kirk.style.left = "-320px";
    kirk.style.top = Math.max(40, rect.top - 40) + "px";
    kirk.style.width = "300px";
    kirk.style.height = "300px";
    kirk.style.objectFit = "cover";
    kirk.style.borderRadius = "14px";
    kirk.style.filter = "drop-shadow(0 0 28px rgba(150,255,200,0.95))";
    kirk.style.transition = "left 700ms cubic-bezier(.16,.84,.22,1)";
    overlay.appendChild(kirk);

    const hammer = document.createElement("img");
    hammer.src = "../assets/images/hammer.jpeg";
    hammer.onerror = () => {
      hammer.style.background = "linear-gradient(180deg, #5e4a35, #2f2418)";
    };
    hammer.style.position = "absolute";
    hammer.style.left = (rect.left + rect.width / 2 - 120) + "px";
    hammer.style.top = (rect.top - 320) + "px";
    hammer.style.width = "300px";
    hammer.style.height = "520px";
    hammer.style.objectFit = "contain";
    hammer.style.transformOrigin = "120px 420px";
    hammer.style.transform = "rotate(-95deg)";
    hammer.style.borderRadius = "8px";
    hammer.style.boxShadow = "0 0 34px rgba(0,0,0,0.82)";
    hammer.style.transition = "transform 260ms cubic-bezier(.2,.8,.2,1)";
    overlay.appendChild(hammer);

    this.cutsceneDirector.timeout(() => { overlay.style.opacity = "1"; }, 20);
    this.cutsceneDirector.timeout(() => { kirk.style.left = (rect.left - 190) + "px"; }, 250);
    this.cutsceneDirector.timeout(() => {
      hammer.style.transform = "rotate(22deg)";
      this.audio.sfx("slash");
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
    const endedBossId = s.currentBossId;

    this.clearBossTimers();

    if (s.bossEl) {
      const rect = s.bossEl.getBoundingClientRect();
      this.effects.animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, this.refs.game);
      s.bossEl.remove();
    }
    s.bossEl = null;
    s.bossActive = false;
    s.currentBossId = null;

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
      this.resumePendingBossTimers(endedBossId);
      this.mainTimerRestart?.({ fromBoss: true });
    }
  }

  updateBoss(dt) {
    const s = this.store;
    const def = this.getBossDef();
    if (!def || !s.bossActive || !s.bossEl) return;

    if (def.canMove) {
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
    }

    if (def.contactKillsPlayer && !s.playerDamageImmune() && this.effects.collide(this.refs.player, s.bossEl) && !this.consumeShieldHit?.(null, false)) {
      this.onDeath?.();
    }
  }
}
