import { runBoNixCutscene } from "../gameplay/powerups/cutscenes/boNixCutscene.js?v=20260226c";
import { runDrakeCutscene } from "../gameplay/powerups/cutscenes/drakeCutscene.js?v=20260226c";
import { runDevitoCutscene } from "../gameplay/powerups/cutscenes/devitoCutscene.js?v=20260226c";
import { runKirkCutscene } from "../gameplay/powerups/cutscenes/kirkCutscene.js?v=20260226c";
import { createPowerupEffects } from "../gameplay/powerups/effects/index.js";

export class PowerupSystem {
  constructor({ store, refs, effects, audio, cutsceneDirector, spawnSystem, clock }) {
    this.store = store;
    this.refs = refs;
    this.effects = effects;
    this.audio = audio;
    this.cutsceneDirector = cutsceneDirector;
    this.spawnSystem = spawnSystem;
    this.clock = clock;

    this.addScore = () => {};
    this.onBossOrbHit = null;
    this.onBossKilledByOrbs = null;
    this.effectsRegistry = createPowerupEffects();
  }

  setHooks({ addScore, onBossOrbHit, onBossKilledByOrbs }) {
    if (addScore) this.addScore = addScore;
    this.onBossOrbHit = onBossOrbHit;
    this.onBossKilledByOrbs = onBossKilledByOrbs;
  }

  drakePowerActive() {
    return this.clock.nowMs() < this.store.drakePowerUntil;
  }

  setShieldActive(active) {
    this.store.hasShield = active;
    this.refs.shieldRing.style.display = active ? "block" : "none";
  }

  consumeShieldHit(source, removeSource) {
    const s = this.store;
    if (s.cutsceneActive) return true;
    if (this.clock.nowMs() < s.shieldImmuneUntil) return true;
    if (!s.hasShield) return false;

    this.setShieldActive(false);
    this.audio.sfx("freeze");
    s.shieldImmuneUntil = this.clock.nowMs() + 700;
    if (removeSource && source) source.remove();

    const pulse = document.createElement("div");
    pulse.style.position = "absolute";
    pulse.style.left = (s.x + 30) + "px";
    pulse.style.top = (s.y + 30) + "px";
    pulse.style.width = "24px";
    pulse.style.height = "24px";
    pulse.style.border = "3px solid rgba(255,160,40,0.95)";
    pulse.style.borderRadius = "50%";
    pulse.style.transform = "translate(-50%,-50%) scale(0.35)";
    pulse.style.opacity = "1";
    pulse.style.pointerEvents = "none";
    pulse.style.zIndex = "13050";
    this.refs.game.appendChild(pulse);

    let scale = 0.35;
    let opacity = 1;
    const animate = () => {
      scale += 0.18;
      opacity -= 0.045;
      pulse.style.transform = `translate(-50%,-50%) scale(${scale})`;
      pulse.style.opacity = String(opacity);
      if (opacity > 0) requestAnimationFrame(animate);
      else pulse.remove();
    };
    animate();
    return true;
  }

  spawnIceTrail() {
    const now = this.clock.nowMs();
    const px = this.store.x + 30;
    const py = this.store.y + 30;
    const last = this.store.icePathPoints[this.store.icePathPoints.length - 1];
    if (last) {
      const dx = px - last.x;
      const dy = py - last.y;
      if (dx * dx + dy * dy < 36) return;
    }
    this.store.icePathPoints.push({ x: px, y: py, t: now });
  }

  markIcePathBreak() {
    const now = this.clock.nowMs();
    const last = this.store.icePathPoints[this.store.icePathPoints.length - 1];
    if (!last || last.break) return;
    this.store.icePathPoints.push({ break: true, t: now });
  }

  drawIcePath(now) {
    const ctx = this.refs.icePathCtx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const pts = this.store.icePathPoints;
    if (pts.length < 2) return;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      if (!a || !b || a.break || b.break) continue;
      const age = now - b.t;
      const alpha = Math.max(0, 1 - age / 5000);
      if (alpha <= 0) continue;

      ctx.strokeStyle = `rgba(100, 196, 255, ${0.22 * alpha})`;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(157, 224, 255, ${0.42 * alpha})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(226, 246, 255, ${0.76 * alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  refreshIceTrails(now) {
    const keepFrom = now - 5000;
    const pts = this.store.icePathPoints;
    if (pts.length > 0) {
      let cut = 0;
      while (cut < pts.length && pts[cut].t < keepFrom) cut++;
      if (cut > 0) this.store.icePathPoints = pts.slice(cut);
    }
    this.drawIcePath(now);
  }

  updateDrakeTrails(now, wrapped) {
    if (wrapped && this.drakePowerActive()) this.markIcePathBreak();
    this.refreshIceTrails(now);
    if (this.drakePowerActive() && now >= this.store.nextIceTrailAt && (Math.abs(this.store.velX) + Math.abs(this.store.velY) > 0.8)) {
      this.spawnIceTrail();
      this.store.nextIceTrailAt = now + 90;
      this.refreshIceTrails(now);
    }
  }

  updateOrbCollisions() {
    document.querySelectorAll(".orb").forEach(o => {
      if (this.effects.collide(this.refs.player, o)) {
        const rect = o.getBoundingClientRect();
        this.effects.applePickupBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, this.refs.game);
        o.remove();
        this.audio.sfx("orb");

        const orbPoints = 3 + Math.floor(Math.random() * 5);
        this.addScore(orbPoints);
        this.store.speed += 0.6;
        this.store.enemySpeed += 0.03;
        this.refs.spdEl.textContent = this.store.speed.toFixed(1);

        if (this.store.bossActive && this.onBossOrbHit) {
          this.onBossOrbHit(1);
        }

        this.spawnSystem.spawn("orb");
      }
    });
  }

  runCutscene(type) {
    const ctx = {
      store: this.store,
      refs: this.refs,
      audio: this.audio,
      clock: this.clock,
      cutsceneDirector: this.cutsceneDirector,
      effects: this.effects,
      spawnSystem: this.spawnSystem,
      addScore: this.addScore
    };
    if (type === "bonix") runBoNixCutscene(ctx);
    if (type === "drake") runDrakeCutscene(ctx);
    if (type === "devito") runDevitoCutscene(ctx);
    if (type === "kirk") runKirkCutscene(ctx);
  }

  activatePowerup(effectId) {
    const effect = this.effectsRegistry[effectId];
    if (!effect) return;
    effect.apply({
      store: this.store,
      clock: this.clock,
      setShieldActive: (active) => this.setShieldActive(active),
      runCutscene: (type) => this.runCutscene(type)
    });
  }

  updatePowerupCollisions() {
    const s = this.store;

    document.querySelectorAll(".power").forEach(p => {
      if (this.effects.collide(this.refs.player, p)) {
        p.remove();
        this.audio.sfx("pickup");
        this.activatePowerup("devito");
      }
    });

    document.querySelectorAll(".kirk").forEach(k => {
      if (this.effects.collide(this.refs.player, k)) {
        k.remove();
        this.audio.sfx("pickup");
        this.activatePowerup("kirk");
      }
    });

    document.querySelectorAll(".bonix").forEach(bn => {
      if (this.effects.collide(this.refs.player, bn)) {
        bn.remove();
        if (!s.hasShield) {
          this.audio.sfx("pickup");
          this.activatePowerup("bonix");
        }
      }
    });

    document.querySelectorAll(".drake").forEach(dk => {
      if (this.effects.collide(this.refs.player, dk)) {
        dk.remove();
        this.audio.sfx("pickup");
        this.activatePowerup("drake");
      }
    });
  }

  updateShieldRingPosition() {
    if (!this.store.hasShield) return;
    this.refs.shieldRing.style.left = (this.store.x - 17) + "px";
    this.refs.shieldRing.style.top = (this.store.y - 17) + "px";
  }

  updateKirkShieldRing() {
    const now = this.clock.nowMs();
    const remaining = this.store.kirkInvincibleUntil - now;
    const active = remaining > 0;
    this.refs.kirkShieldRing.style.display = active ? "block" : "none";
    if (!active) return;
    if (remaining <= 3000) {
      this.refs.kirkShieldRing.style.background = "conic-gradient(from 0deg, rgba(255,95,95,0.0), rgba(255,40,40,0.95), rgba(255,185,185,0.62), rgba(255,40,40,0.95), rgba(255,95,95,0.0))";
      this.refs.kirkShieldRing.style.filter = "drop-shadow(0 0 15px rgba(255,65,65,0.95)) drop-shadow(0 0 30px rgba(210,25,25,0.7))";
    } else {
      this.refs.kirkShieldRing.style.background = "conic-gradient(from 0deg, rgba(80,185,255,0.0), rgba(45,140,255,0.95), rgba(175,232,255,0.62), rgba(45,140,255,0.95), rgba(80,185,255,0.0))";
      this.refs.kirkShieldRing.style.filter = "drop-shadow(0 0 15px rgba(60,160,255,0.95)) drop-shadow(0 0 30px rgba(50,125,255,0.7))";
    }
    this.refs.kirkShieldRing.style.left = (this.store.x - 24) + "px";
    this.refs.kirkShieldRing.style.top = (this.store.y - 24) + "px";
  }
}
