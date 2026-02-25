import { CONSTANTS } from "../config/constants.js";
import { ChaseSteering } from "../gameplay/enemies/steering/ChaseSteering.js";
import { SeparationSteering } from "../gameplay/enemies/steering/SeparationSteering.js";
import { ObjectiveAvoidanceSteering } from "../gameplay/enemies/steering/ObjectiveAvoidanceSteering.js";

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    const sx = px - x1;
    const sy = py - y1;
    return Math.sqrt(sx * sx + sy * sy);
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  const ox = px - cx;
  const oy = py - cy;
  return Math.sqrt(ox * ox + oy * oy);
}

export class EnemySystem {
  constructor({ store, refs, effects }) {
    this.store = store;
    this.refs = refs;
    this.effects = effects;
    this.consumeShieldHit = null;
    this.onDeath = null;
    this.addScore = null;
    this.chase = new ChaseSteering();
    this.separation = new SeparationSteering(52);
    this.avoidance = new ObjectiveAvoidanceSteering(CONSTANTS.POWERUP_SAFE_RADIUS);
  }

  setHooks({ consumeShieldHit, onDeath, addScore }) {
    this.consumeShieldHit = consumeShieldHit;
    this.onDeath = onDeath;
    this.addScore = addScore || null;
  }

  enemyTouchesIcePath(enemyEl) {
    const points = this.store.icePathPoints;
    if (points.length < 2) return false;
    const ex = parseFloat(enemyEl.style.left) + 16;
    const ey = parseFloat(enemyEl.style.top) + 16;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (!a || !b || a.break || b.break) continue;
      if (pointToSegmentDistance(ex, ey, a.x, a.y, b.x, b.y) <= 18) return true;
    }
    return false;
  }

  freezeEnemy(enemyEl) {
    const now = Date.now();
    if (!enemyEl.dataset.prevBg) enemyEl.dataset.prevBg = enemyEl.style.background || "";
    if (!enemyEl.dataset.prevShadow) enemyEl.dataset.prevShadow = enemyEl.style.boxShadow || "";
    if (!enemyEl.dataset.prevBorder) enemyEl.dataset.prevBorder = enemyEl.style.border || "";
    enemyEl.dataset.frozenUntil = String(now + 10000);
    enemyEl.style.background = "linear-gradient(165deg, #d41f1f, #8f0d0d)";
    enemyEl.style.boxShadow = "0 0 12px rgba(255,54,54,0.95), 0 0 22px rgba(116,206,255,0.9)";
    enemyEl.style.border = "1px solid rgba(150,226,255,0.95)";
  }

  unfreezeEnemy(enemyEl) {
    if (!enemyEl.dataset.frozenUntil) return;
    enemyEl.style.background = enemyEl.dataset.prevBg || "";
    enemyEl.style.boxShadow = enemyEl.dataset.prevShadow || "";
    enemyEl.style.border = enemyEl.dataset.prevBorder || "";
    delete enemyEl.dataset.frozenUntil;
    delete enemyEl.dataset.prevBg;
    delete enemyEl.dataset.prevShadow;
    delete enemyEl.dataset.prevBorder;
  }

  enemyCanDamage(el, now) {
    const safeUntil = parseInt(el.dataset.spawnSafeUntil || "0", 10);
    if (!safeUntil) return true;
    if (now < safeUntil) return false;
    delete el.dataset.spawnSafeUntil;
    el.classList.remove("spawn-safe");
    return true;
  }

  updateBossBullets(dt) {
    const s = this.store;
    document.querySelectorAll(".boss-bullet").forEach(b => {
      const vx = parseFloat(b.dataset.vx || "0");
      const vy = parseFloat(b.dataset.vy || "0");
      const bx = parseFloat(b.style.left) + vx * dt;
      const by = parseFloat(b.style.top) + vy * dt;
      b.style.left = bx + "px";
      b.style.top = by + "px";

      if (bx < -30 || by < -30 || bx > window.innerWidth + 30 || by > window.innerHeight + 30) {
        b.remove();
        return;
      }
      if (!s.playerDamageImmune() && this.effects.collide(this.refs.player, b) && !this.consumeShieldHit?.(b, true)) {
        this.onDeath?.();
      }
    });
  }

  updateEnemies(now, dt) {
    const s = this.store;
    const enemies = Array.from(document.querySelectorAll(".enemy"));
    const powerups = Array.from(document.querySelectorAll(".power,.kirk,.bonix,.drake"));

    enemies.forEach(e => {
      const frozenUntil = parseInt(e.dataset.frozenUntil || "0", 10);
      if (frozenUntil > now) {
        if (this.enemyTouchesIcePath(e)) {
          const rect = e.getBoundingClientRect();
          this.effects.animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, this.refs.game);
          e.remove();
          this.effects.audio.sfx("shatter");
          if (this.addScore) this.addScore(5);
          else {
            s.score += 5;
            this.refs.scoreEl.textContent = String(s.score);
          }
          return;
        }
        if (this.enemyCanDamage(e, now) && !s.playerDamageImmune() && this.effects.collide(this.refs.player, e) && !this.consumeShieldHit?.(e, true)) {
          this.onDeath?.();
        }
        return;
      }

      if (e.dataset.frozenUntil) this.unfreezeEnemy(e);
      if (this.enemyTouchesIcePath(e)) {
        this.freezeEnemy(e);
        this.effects.audio.sfx("freeze");
        return;
      }

      let ex = parseFloat(e.style.left);
      let ey = parseFloat(e.style.top);
      const pursuit = this.chase.compute(s, ex, ey);
      const sep = this.separation.compute(e, enemies, ex, ey);
      const sepMag = Math.sqrt(sep.x * sep.x + sep.y * sep.y) || 1;
      const sepScale = 0.62 * s.enemySpeed;
      const avoid = this.avoidance.compute(powerups, ex, ey);
      const avoidMag = Math.sqrt(avoid.x * avoid.x + avoid.y * avoid.y) || 1;
      const avoidScale = 0.9 * s.enemySpeed;
      const moveX = (pursuit.x * s.enemySpeed) + (sep.x / sepMag) * sepScale + (avoid.x / avoidMag) * avoidScale;
      const moveY = (pursuit.y * s.enemySpeed) + (sep.y / sepMag) * sepScale + (avoid.y / avoidMag) * avoidScale;

      ex += moveX * dt;
      ey += moveY * dt;
      e.style.left = ex + "px";
      e.style.top = ey + "px";

      if (this.enemyCanDamage(e, now) && !s.playerDamageImmune() && this.effects.collide(this.refs.player, e) && !this.consumeShieldHit?.(e, true)) {
        this.onDeath?.();
      }
    });
  }
}
