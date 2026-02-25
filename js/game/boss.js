function spawnEnemyNearBoss() {
  if (!bossActive || !bossEl) return;
  if (!canSpawnEnemy()) return;
  const e = document.createElement("div");
  e.className = "enemy";
  initEnemySpawnGrace(e);
  const ang = Math.random() * Math.PI * 2;
  const r = 140 + Math.random() * 120;
  let sx = bossX + Math.cos(ang) * r;
  let sy = bossY + Math.sin(ang) * r;
  sx = Math.max(10, Math.min(window.innerWidth - 42, sx));
  sy = Math.max(10, Math.min(window.innerHeight - 42, sy));
  const dx = sx - x;
  const dy = sy - y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < ENEMY_SAFE_RADIUS * 0.8) {
    sx = x + (dx / (d || 1)) * ENEMY_SAFE_RADIUS * 0.8;
    sy = y + (dy / (d || 1)) * ENEMY_SAFE_RADIUS * 0.8;
  }
  e.style.left = sx + "px";
  e.style.top = sy + "px";
  game.appendChild(e);
}

function spawnBossBullet() {
  if (!bossActive || !bossEl) return;
  const b = document.createElement("div");
  b.className = "boss-bullet";
  const bx = bossX + 60;
  const by = bossY + 60;
  const dx = x - bx;
  const dy = y - by;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bv = 4.3;
  b.dataset.vx = ((dx / dist) * bv).toString();
  b.dataset.vy = ((dy / dist) * bv).toString();
  b.style.left = (bx - 9) + "px";
  b.style.top = (by - 9) + "px";
  game.appendChild(b);
}

function updateBossUI() {
  if (!bossActive) return;
  const pct = Math.max(0, Math.round((bossHp / bossMaxHp) * 100));
  bossFill.style.width = pct + "%";
  bossHpText.textContent = pct + "%";
}

function beginBossPhase() {
  clearInterval(enemyTimer);
  clearInterval(powerTimer);
  clearInterval(kirkTimer);

  document.querySelectorAll(".enemy,.power,.kirk,.bonix").forEach(el => el.remove());
  document.querySelectorAll(".orb").forEach(el => el.remove());

  bossMaxHp = 34;
  bossHp = bossMaxHp;
  bossX = Math.random() * (window.innerWidth - 160) + 20;
  bossY = 20;
  bossDashFrames = 0;
  bossDashCooldown = 120;
  bossVx = 0;
  bossVy = 0;

  bossEl = document.createElement("img");
  bossEl.src = "../assets/images/hathaway.jpeg";
  bossEl.className = "boss";
  bossEl.style.left = bossX + "px";
  bossEl.style.top = bossY + "px";
  game.appendChild(bossEl);

  bossUI.style.display = "block";
  bossAmbience.style.display = "block";
  game.classList.add("boss-mode");
  updateBossUI();

  for (let i = 0; i < 6; i++) spawn("orb");

  bossMinionTimer = setInterval(() => {
    if (!bossActive || gameOver || paused || menuOpen) return;
    if (canSpawnEnemy()) spawnEnemyNearBoss();
    if (Math.random() < 0.55 && canSpawnEnemy()) spawnEnemyNearBoss();
  }, 3300);

  bossBulletTimer = setInterval(() => {
    if (!bossActive || gameOver || paused || menuOpen) return;
    spawnBossBullet();
    if (Math.random() < 0.35) {
      cutsceneTimeout(() => spawnBossBullet(), 180);
    }
  }, 1350);

  bossOrbTimer = setInterval(() => {
    if (!bossActive || gameOver || paused || menuOpen) return;
    if (document.querySelectorAll(".orb").length < 9) spawn("orb");
  }, 900);
}

function startBossIntro() {
  cutsceneActive = true;
  invincible = true;

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "13000";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 500ms ease";
  overlay.style.background = "radial-gradient(circle at center, rgba(140,0,0,0.5) 0%, rgba(0,0,0,0.95) 70%)";
  overlay.style.overflow = "hidden";
  game.appendChild(overlay);

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

  const flash = document.createElement("div");
  flash.style.position = "absolute";
  flash.style.inset = "0";
  flash.style.background = "#ffd8d8";
  flash.style.opacity = "0";
  flash.style.transition = "opacity 120ms linear";
  overlay.appendChild(flash);

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => {
    warning.style.opacity = "1";
    warning.style.transform = "translate(-50%, -50%) scale(1)";
  }, 240);
  cutsceneTimeout(() => {
    face.style.transform = "translate(-50%,-50%) scale(1)";
    face.style.filter = "brightness(1.05) contrast(1.26) saturate(1.35) blur(0)";
  }, 450);
  cutsceneTimeout(() => {
    flash.style.opacity = "0.95";
    cutsceneTimeout(() => { flash.style.opacity = "0"; }, 70);
  }, 1350);
  cutsceneTimeout(() => { overlay.style.opacity = "0"; }, 2500);
  cutsceneTimeout(() => {
    overlay.remove();
    cutsceneActive = false;
    invincible = false;
    beginBossPhase();
  }, 3050);
}

function startBossFight() {
  if (bossActive || gameOver || cutsceneActive) return;
  sfx("boss");
  clearInterval(enemyTimer);
  clearInterval(powerTimer);
  clearInterval(kirkTimer);
  bossActive = true;
  startBossIntro();
}

function kirkFinisherCutscene() {
  if (!bossActive || !bossEl || cutsceneActive) return;
  sfx("slash");
  cutsceneActive = true;
  invincible = true;
  clearInterval(bossMinionTimer);
  clearInterval(bossBulletTimer);
  clearInterval(bossOrbTimer);

  const rect = bossEl.getBoundingClientRect();
  bossEl.style.opacity = "0";

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "14000";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 350ms ease";
  overlay.style.background = "radial-gradient(circle at center, rgba(24,30,52,0.45) 0%, rgba(0,0,0,0.92) 72%)";
  overlay.style.overflow = "hidden";
  game.appendChild(overlay);

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

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => { kirk.style.left = (rect.left - 190) + "px"; }, 250);
  cutsceneTimeout(() => {
    hammer.style.transform = "rotate(22deg)";
    sfx("slash");
    animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, overlay);
  }, 980);
  cutsceneTimeout(() => { overlay.style.opacity = "0"; }, 1650);
  cutsceneTimeout(() => {
    overlay.remove();
    cutsceneActive = false;
    invincible = false;
    endBossFight(true);
  }, 2050);
}

function endBossFight(victory) {
  clearInterval(bossMinionTimer);
  clearInterval(bossBulletTimer);
  clearInterval(bossOrbTimer);
  bossMinionTimer = undefined;
  bossBulletTimer = undefined;
  bossOrbTimer = undefined;

  if (bossEl) {
    const rect = bossEl.getBoundingClientRect();
    animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, game);
    bossEl.remove();
  }
  bossEl = null;
  bossActive = false;
  bossUI.style.display = "none";
  bossAmbience.style.display = "none";
  game.classList.remove("boss-mode");
  document.querySelectorAll(".boss-bullet").forEach(el => el.remove());

  if (victory) {
    addScore(200);
    speed += 7;
    spdEl.textContent = speed.toFixed(1);
  }

  if (!gameOver) {
    enemyTimer = setInterval(() => {
      if (!gameOver && !cutsceneActive && !paused && !menuOpen && canSpawnEnemy()) spawn("enemy");
    }, 2200);
    powerTimer = setInterval(() => {
      if (gameOver || cutsceneActive || paused || menuOpen) return;
      spawn("power");
    }, 21000);
    kirkTimer = setInterval(() => {
      if (gameOver || cutsceneActive || paused || menuOpen) return;
      spawn("kirk");
    }, 32000);
    boNixTimer = setInterval(() => {
      if (gameOver || cutsceneActive || paused || menuOpen || hasShield) return;
      if (document.querySelectorAll(".bonix").length === 0) spawn("bonix");
    }, 26000);
    drakeTimer = setInterval(() => {
      if (gameOver || cutsceneActive || paused || menuOpen || Date.now() < drakePowerUntil) return;
      if (document.querySelectorAll(".drake").length === 0) spawn("drake");
    }, 34000);
    scheduleNextBoss();
  }
}

function updateBoss(dt) {
  if (!bossActive || !bossEl) return;

  const cx = bossX + 60;
  const cy = bossY + 60;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const hpFactor = 1 - bossHp / bossMaxHp;
  const chase = 0.95 + hpFactor * 1.15;

  if (bossDashFrames > 0) {
    bossX += bossVx * dt;
    bossY += bossVy * dt;
    bossDashFrames -= dt;
  } else {
    bossX += (dx / dist) * chase * dt;
    bossY += (dy / dist) * chase * dt;
    bossDashCooldown -= dt;
    if (bossDashCooldown <= 0) {
      const dashSpeed = 5.2 + hpFactor * 1.2;
      bossVx = (dx / dist) * dashSpeed;
      bossVy = (dy / dist) * dashSpeed;
      bossDashFrames = 22;
      bossDashCooldown = 140 - Math.floor(hpFactor * 45);
      spawnBossBullet();
    }
  }

  bossX = Math.max(0, Math.min(window.innerWidth - 120, bossX));
  bossY = Math.max(0, Math.min(window.innerHeight - 120, bossY));
  bossEl.style.left = bossX + "px";
  bossEl.style.top = bossY + "px";

  if (!playerDamageImmune() && collide(player, bossEl) && !consumeShieldHit(null, false)) death();
}
