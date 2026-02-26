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

function enemyTouchesIcePath(enemyEl) {
  if (icePathPoints.length < 2) return false;
  const ex = parseFloat(enemyEl.style.left) + 16;
  const ey = parseFloat(enemyEl.style.top) + 16;
  for (let i = 1; i < icePathPoints.length; i++) {
    const a = icePathPoints[i - 1];
    const b = icePathPoints[i];
    if (!a || !b || a.break || b.break) continue;
    if (pointToSegmentDistance(ex, ey, a.x, a.y, b.x, b.y) <= 18) return true;
  }
  return false;
}

function freezeEnemy(enemyEl) {
  const now = Date.now();
  if (!enemyEl.dataset.prevBg) enemyEl.dataset.prevBg = enemyEl.style.background || "";
  if (!enemyEl.dataset.prevShadow) enemyEl.dataset.prevShadow = enemyEl.style.boxShadow || "";
  if (!enemyEl.dataset.prevBorder) enemyEl.dataset.prevBorder = enemyEl.style.border || "";
  enemyEl.dataset.frozenUntil = String(now + 10000);
  enemyEl.style.background = "linear-gradient(165deg, #d41f1f, #8f0d0d)";
  enemyEl.style.boxShadow = "0 0 12px rgba(255,54,54,0.95), 0 0 22px rgba(116,206,255,0.9)";
  enemyEl.style.border = "1px solid rgba(150,226,255,0.95)";
}

function unfreezeEnemy(enemyEl) {
  if (!enemyEl.dataset.frozenUntil) return;
  enemyEl.style.background = enemyEl.dataset.prevBg || "";
  enemyEl.style.boxShadow = enemyEl.dataset.prevShadow || "";
  enemyEl.style.border = enemyEl.dataset.prevBorder || "";
  delete enemyEl.dataset.frozenUntil;
  delete enemyEl.dataset.prevBg;
  delete enemyEl.dataset.prevShadow;
  delete enemyEl.dataset.prevBorder;
}

function updateBossBullets(dt) {
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
    const isJackFreeze = b.classList.contains("jack-freeze");
    const isParried = b.classList.contains("parried");

    if (isParried && bossActive && bossEl && collide(bossEl, b)) {
      b.remove();
      bossHp = Math.max(0, bossHp - 6);
      updateBossUI();
      animeDeathBurst(bx + 9, by + 9, game);
      if (bossHp <= 0) kirkFinisherCutscene();
      return;
    }

    if (isJackFreeze && !isParried) {
      if (collide(player, b)) {
        b.remove();
        jackFreezePlayer();
      }
      return;
    }

    if (!playerDamageImmune() && collide(player, b) && !consumeShieldHit(b, true)) death();
  });
}

function updateEnemies(now, dt) {
  const enemies = Array.from(document.querySelectorAll(".enemy"));
  const powerups = Array.from(document.querySelectorAll(".power,.kirk,.bonix,.drake"));

  function enemyCanDamage(el) {
    const safeUntil = parseInt(el.dataset.spawnSafeUntil || "0", 10);
    if (!safeUntil) return true;
    if (now < safeUntil) return false;
    delete el.dataset.spawnSafeUntil;
    el.classList.remove("spawn-safe");
    return true;
  }

  function separationVector(el, ex, ey) {
    let sepX = 0;
    let sepY = 0;
    const desired = 52;
    for (let i = 0; i < enemies.length; i++) {
      const other = enemies[i];
      if (other === el) continue;
      const ox = parseFloat(other.style.left);
      const oy = parseFloat(other.style.top);
      const dx = ex - ox;
      const dy = ey - oy;
      const distSq = dx * dx + dy * dy;
      if (distSq <= 0.001 || distSq > desired * desired) continue;
      const dist = Math.sqrt(distSq);
      const force = (desired - dist) / desired;
      sepX += (dx / dist) * force;
      sepY += (dy / dist) * force;
    }
    return { x: sepX, y: sepY };
  }

  function powerupAvoidVector(ex, ey) {
    let ax = 0;
    let ay = 0;
    const avoidDist = POWERUP_SAFE_RADIUS;
    for (let i = 0; i < powerups.length; i++) {
      const p = powerups[i];
      const pw = p.getBoundingClientRect().width || 32;
      const ph = p.getBoundingClientRect().height || 32;
      const px = parseFloat(p.style.left) + pw / 2;
      const py = parseFloat(p.style.top) + ph / 2;
      const dx = ex + 16 - px;
      const dy = ey + 16 - py;
      const distSq = dx * dx + dy * dy;
      if (distSq <= 0.001 || distSq > avoidDist * avoidDist) continue;
      const dist = Math.sqrt(distSq);
      const force = (avoidDist - dist) / avoidDist;
      ax += (dx / dist) * force;
      ay += (dy / dist) * force;
    }
    return { x: ax, y: ay };
  }

  enemies.forEach(e => {
    const frozenUntil = parseInt(e.dataset.frozenUntil || "0", 10);
    if (frozenUntil > now) {
      if (enemyTouchesIcePath(e)) {
        const r = e.getBoundingClientRect();
        animeDeathBurst(r.left + r.width / 2, r.top + r.height / 2, game);
        e.remove();
        sfx("shatter");
        addScore(5);
        return;
      }
      if (enemyCanDamage(e) && !playerDamageImmune() && collide(player, e) && !consumeShieldHit(e, true)) death();
      return;
    }

    if (e.dataset.frozenUntil) unfreezeEnemy(e);
    if (enemyTouchesIcePath(e)) {
      freezeEnemy(e);
      sfx("freeze");
      return;
    }

    let ex = parseFloat(e.style.left);
    let ey = parseFloat(e.style.top);
    const dx = x - ex;
    const dy = y - ey;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const pursuitX = (dx / dist) * enemySpeed;
    const pursuitY = (dy / dist) * enemySpeed;
    const sep = separationVector(e, ex, ey);
    const sepMag = Math.sqrt(sep.x * sep.x + sep.y * sep.y) || 1;
    const sepScale = 0.62 * enemySpeed;
    const avoid = powerupAvoidVector(ex, ey);
    const avoidMag = Math.sqrt(avoid.x * avoid.x + avoid.y * avoid.y) || 1;
    const avoidScale = 0.9 * enemySpeed;
    const moveX = pursuitX + (sep.x / sepMag) * sepScale + (avoid.x / avoidMag) * avoidScale;
    const moveY = pursuitY + (sep.y / sepMag) * sepScale + (avoid.y / avoidMag) * avoidScale;
    ex += moveX * dt;
    ey += moveY * dt;
    e.style.left = ex + "px";
    e.style.top = ey + "px";
    if (enemyCanDamage(e) && !playerDamageImmune() && collide(player, e) && !consumeShieldHit(e, true)) death();
  });
}
