function spawnEnemyNearBoss() {
  if (!bossActive || !bossEl) return;
  if (!canSpawnEnemy()) return;
  const e = document.createElement("div");
  e.className = "enemy";
  if (currentBossType === "jack") e.classList.add("jack-minion");
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
  const bossSize = parseFloat(bossEl.dataset.size || "120");
  const bx = bossX + bossSize / 2;
  const by = bossY + bossSize / 2;
  const dx = x - bx;
  const dy = y - by;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const isJack = currentBossType === "jack";
  const bv = isJack ? 3.9 : 4.3;
  b.dataset.vx = ((dx / dist) * bv).toString();
  b.dataset.vy = ((dy / dist) * bv).toString();
  b.dataset.owner = currentBossType;
  if (isJack) b.classList.add("jack-freeze");
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

function beginBossPhase(type) {
  currentBossType = type;

  clearTimers();
  document.querySelectorAll(".enemy,.power,.kirk,.bonix,.drake").forEach(el => el.remove());
  document.querySelectorAll(".orb").forEach(el => el.remove());

  if (type === "jack") {
    bossMaxHp = 290;
    bossEl = document.createElement("img");
    bossEl.src = "../assets/images/jackboss.jpeg";
    bossEl.onerror = () => { bossEl.src = "../assets/images/hathaway.jpeg"; };
    bossEl.className = "boss jack-boss";
    bossEl.dataset.size = "168";
    bossNameEl.textContent = "EVIL JACK";
    bossUI.classList.add("jack-ui");
  } else {
    bossMaxHp = 34;
    bossEl = document.createElement("img");
    bossEl.src = "../assets/images/hathaway.jpeg";
    bossEl.className = "boss";
    bossEl.dataset.size = "120";
    bossNameEl.textContent = "EVIL HATHAWAY";
    bossUI.classList.remove("jack-ui");
  }

  bossHp = bossMaxHp;
  const bossSize = parseFloat(bossEl.dataset.size || "120");
  bossX = Math.random() * (window.innerWidth - (bossSize + 40)) + 20;
  bossY = 20;
  bossDashFrames = 0;
  bossDashCooldown = type === "jack" ? 100 : 120;
  bossVx = 0;
  bossVy = 0;

  bossEl.style.left = bossX + "px";
  bossEl.style.top = bossY + "px";
  game.appendChild(bossEl);

  bossUI.style.display = "block";
  bossAmbience.style.display = "block";
  game.classList.add("boss-mode");
  updateBossUI();

  for (let i = 0; i < (type === "jack" ? 3 : 4); i++) spawn("orb");

  bossMinionTimer = setInterval(() => {
    if (!bossActive || gameOver || paused || menuOpen) return;
    if (canSpawnEnemy()) spawnEnemyNearBoss();
    if (Math.random() < (type === "jack" ? 0.22 : 0.28) && canSpawnEnemy()) spawnEnemyNearBoss();
  }, type === "jack" ? 3200 : 3800);

  bossBulletTimer = setInterval(() => {
    if (!bossActive || gameOver || paused || menuOpen) return;
    spawnBossBullet();
    if (Math.random() < (type === "jack" ? 0.24 : 0.2)) {
      cutsceneTimeout(() => spawnBossBullet(), 210);
    }
  }, type === "jack" ? 1250 : 1500);

  bossOrbTimer = setInterval(() => {
    if (!bossActive || gameOver || paused || menuOpen) return;
    if (document.querySelectorAll(".orb").length < (type === "jack" ? 4 : 5)) spawn("orb");
  }, 900);
}

function showSpawnAnnouncement(text) {
  const warning = document.createElement("div");
  warning.style.position = "absolute";
  warning.style.inset = "0";
  warning.style.display = "flex";
  warning.style.alignItems = "center";
  warning.style.justifyContent = "center";
  warning.style.zIndex = "15500";
  warning.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  warning.style.fontSize = "clamp(26px, 9vw, 120px)";
  warning.style.letterSpacing = "5px";
  warning.style.textAlign = "center";
  warning.style.color = "#ff2d2d";
  warning.style.textShadow = "0 0 24px rgba(255,0,0,0.95), 0 0 64px rgba(130,0,0,0.9)";
  warning.style.background = "radial-gradient(circle at center, rgba(0,0,0,0.2), rgba(0,0,0,0.72))";
  warning.style.opacity = "0";
  warning.style.transform = "scale(0.88)";
  warning.style.transition = "opacity 300ms ease, transform 300ms ease";
  warning.textContent = text;
  game.appendChild(warning);

  cutsceneTimeout(() => {
    warning.style.opacity = "1";
    warning.style.transform = "scale(1)";
  }, 20);
  cutsceneTimeout(() => {
    warning.style.opacity = "0";
    warning.style.transform = "scale(1.05)";
  }, 2820);
  cutsceneTimeout(() => warning.remove(), 3300);

  const help = document.createElement("div");
  help.style.position = "absolute";
  help.style.inset = "0";
  help.style.display = "flex";
  help.style.alignItems = "center";
  help.style.justifyContent = "center";
  help.style.zIndex = "15501";
  help.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  help.style.fontSize = "clamp(22px, 6.8vw, 86px)";
  help.style.letterSpacing = "4px";
  help.style.textAlign = "center";
  help.style.color = "#63b6ff";
  help.style.textShadow = "0 0 26px rgba(67, 164, 255, 0.96), 0 0 68px rgba(12, 66, 135, 0.9)";
  help.style.opacity = "0";
  help.style.transform = "scale(0.9)";
  help.style.transition = "opacity 420ms ease, transform 420ms ease";
  help.textContent = "PRESS SPACE TO PARRY HIS FREEZE ATTACKS";
  game.appendChild(help);

  cutsceneTimeout(() => {
    help.style.opacity = "1";
    help.style.transform = "scale(1)";
  }, 3440);
  cutsceneTimeout(() => {
    help.style.opacity = "0";
    help.style.transform = "scale(1.03)";
  }, 6280);
  cutsceneTimeout(() => help.remove(), 6820);
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
  warning.style.top = "50%";
  warning.style.left = "50%";
  warning.style.width = "100%";
  warning.style.textAlign = "center";
  warning.style.whiteSpace = "nowrap";
  warning.style.transform = "translate(-50%, -50%) scale(0.92)";
  warning.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  warning.style.fontSize = "clamp(16px,5.2vw,64px)";
  warning.style.letterSpacing = "6px";
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
    beginBossPhase("hathaway");
  }, 3050);
}

function startJackIntro() {
  cutsceneActive = true;
  invincible = true;

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "15000";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 420ms ease";
  overlay.style.background = "#000";
  overlay.style.overflow = "hidden";
  game.appendChild(overlay);

  const tomato = document.createElement("img");
  tomato.src = "../assets/images/tomatotown.jpeg";
  tomato.onerror = () => { tomato.src = "../assets/images/Backgrounds/wallhaven-3qw9y6.jpg"; };
  tomato.style.position = "absolute";
  tomato.style.inset = "0";
  tomato.style.width = "100%";
  tomato.style.height = "100%";
  tomato.style.objectFit = "cover";
  tomato.style.opacity = "0";
  tomato.style.transform = "scale(1.08)";
  tomato.style.transition = "opacity 650ms ease, transform 2400ms ease";
  overlay.appendChild(tomato);

  const grade = document.createElement("div");
  grade.style.position = "absolute";
  grade.style.inset = "0";
  grade.style.background = "linear-gradient(180deg, rgba(5,8,22,0.68) 0%, rgba(24,0,0,0.22) 35%, rgba(0,0,0,0.8) 100%)";
  overlay.appendChild(grade);

  const glider = document.createElement("img");
  glider.src = "../assets/images/glider.jpeg";
  glider.onerror = () => { glider.src = "../assets/images/horse.jpeg"; };
  glider.style.position = "absolute";
  glider.style.width = "260px";
  glider.style.height = "170px";
  glider.style.objectFit = "cover";
  glider.style.left = "50%";
  glider.style.top = "-220px";
  glider.style.transform = "translateX(-50%)";
  glider.style.borderRadius = "18px";
  glider.style.filter = "drop-shadow(0 0 28px rgba(170,220,255,0.9))";
  glider.style.transition = "top 2700ms cubic-bezier(.2,.86,.2,1), transform 2700ms cubic-bezier(.2,.86,.2,1)";
  overlay.appendChild(glider);

  const jack = document.createElement("img");
  jack.src = "../assets/images/jackboss.jpeg";
  jack.onerror = () => { jack.src = "../assets/images/hathaway.jpeg"; };
  jack.style.position = "absolute";
  jack.style.width = "170px";
  jack.style.height = "170px";
  jack.style.objectFit = "cover";
  jack.style.left = "50%";
  jack.style.top = "-175px";
  jack.style.transform = "translateX(-50%)";
  jack.style.borderRadius = "18px";
  jack.style.filter = "drop-shadow(0 0 28px rgba(70,170,255,0.9))";
  jack.style.transition = "top 2700ms cubic-bezier(.2,.86,.2,1), transform 2700ms cubic-bezier(.2,.86,.2,1)";
  overlay.appendChild(jack);

  const shadow = document.createElement("div");
  shadow.style.position = "absolute";
  shadow.style.width = "210px";
  shadow.style.height = "26px";
  shadow.style.left = "50%";
  shadow.style.top = "73%";
  shadow.style.transform = "translateX(-50%) scale(0.2)";
  shadow.style.borderRadius = "50%";
  shadow.style.background = "rgba(0,0,0,0.52)";
  shadow.style.filter = "blur(10px)";
  shadow.style.opacity = "0";
  shadow.style.transition = "transform 2700ms cubic-bezier(.2,.86,.2,1), opacity 2700ms ease";
  overlay.appendChild(shadow);

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => {
    tomato.style.opacity = "1";
    tomato.style.transform = "scale(1)";
  }, 760);
  cutsceneTimeout(() => {
    glider.style.top = "50%";
    glider.style.transform = "translate(-50%, -65%)";
    jack.style.top = "55%";
    jack.style.transform = "translate(-50%, -56%)";
    shadow.style.opacity = "1";
    shadow.style.transform = "translateX(-50%) scale(1)";
  }, 1500);
  cutsceneTimeout(() => {
    glider.style.transform = "translate(-50%, -48%)";
    jack.style.transform = "translate(-50%, -38%)";
    glider.style.opacity = "0.18";
  }, 4550);
  cutsceneTimeout(() => {
    overlay.style.opacity = "0";
  }, 5750);
  cutsceneTimeout(() => {
    overlay.remove();
    beginBossPhase("jack");
    cutsceneActive = false;
    invincible = false;
    showSpawnAnnouncement("EVIL JACK HAS SPAWNED");
  }, 6380);
}

function startBossFight() {
  if (bossActive || gameOver || cutsceneActive || currentBossType === "jack") return;
  sfx("boss");
  clearTimers();
  bossActive = true;
  currentBossType = "hathaway";
  scheduleNextBoss();
  startBossIntro();
}

function startEvilJackFight() {
  if (bossActive || gameOver || cutsceneActive || evilJackSpawned) return;
  if (currentBossType === "hathaway") return;
  evilJackQueued = false;
  evilJackSpawned = true;
  sfx("boss");
  pauseHathawaySpawnTimer();
  clearTimers();
  bossActive = true;
  currentBossType = "jack";
  startJackIntro();
}

function spawnParrySlash(xPos, yPos) {
  const slash = document.createElement("div");
  slash.className = "slash-sweep";
  slash.style.left = xPos + "px";
  slash.style.top = yPos + "px";
  game.appendChild(slash);
  requestAnimationFrame(() => slash.classList.add("live"));
  setTimeout(() => slash.remove(), 380);
}

function parryNearestJackOrb() {
  if (!bossActive || currentBossType !== "jack" || cutsceneActive) return;
  const bullets = Array.from(document.querySelectorAll(".boss-bullet.jack-freeze:not(.parried)"));
  if (bullets.length === 0) return;
  const px = x + 30;
  const py = y + 30;
  let best = null;
  let bestDistSq = Infinity;

  bullets.forEach(b => {
    const bx = parseFloat(b.style.left) + 8;
    const by = parseFloat(b.style.top) + 8;
    const dx = bx - px;
    const dy = by - py;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = b;
    }
  });

  if (!best || bestDistSq > 170 * 170) return;
  if (!bossEl) return;

  const bx = parseFloat(best.style.left) + 8;
  const by = parseFloat(best.style.top) + 8;
  const bossSize = parseFloat(bossEl.dataset.size || "168");
  const tx = bossX + bossSize / 2;
  const ty = bossY + bossSize / 2;
  const dx = tx - bx;
  const dy = ty - by;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const speedBack = 8.2;
  best.dataset.vx = ((dx / dist) * speedBack).toString();
  best.dataset.vy = ((dy / dist) * speedBack).toString();
  best.classList.add("parried");
  sfx("slash");
  spawnParrySlash(px, py);
}

function jackFreezePlayer() {
  const until = Date.now() + 1900;
  playerFrozenUntil = Math.max(playerFrozenUntil, until);
  sfx("freeze");
}

function kirkFinisherCutscene() {
  if (currentBossType === "jack") {
    jackFinisherCutscene();
    return;
  }
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
  label.textContent = "CHARLIE KIRK // LASER OF JUSTICE";
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

  const laser = document.createElement("div");
  const laserStartX = rect.left - 36;
  const laserStartY = rect.top + rect.height / 2;
  const laserLen = window.innerWidth - laserStartX + 80;
  laser.style.position = "absolute";
  laser.style.left = laserStartX + "px";
  laser.style.top = laserStartY + "px";
  laser.style.width = laserLen + "px";
  laser.style.height = "22px";
  laser.style.transformOrigin = "0 50%";
  laser.style.transform = "translateY(-50%) scaleX(0.02)";
  laser.style.borderRadius = "999px";
  laser.style.background = "linear-gradient(90deg, rgba(255,255,255,0.95), #ff5a5a 12%, #ff0000 42%, #9f0000 100%)";
  laser.style.boxShadow = "0 0 26px rgba(255,0,0,0.95), 0 0 56px rgba(190,0,0,0.95)";
  laser.style.transition = "transform 300ms cubic-bezier(.15,.8,.2,1), opacity 220ms ease";
  laser.style.opacity = "0";
  overlay.appendChild(laser);

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => { kirk.style.left = (rect.left - 190) + "px"; }, 250);
  cutsceneTimeout(() => {
    laser.style.opacity = "1";
    laser.style.transform = "translateY(-50%) scaleX(1)";
    sfx("slash");
    animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, overlay);
    iceBreakBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, overlay);
  }, 980);
  cutsceneTimeout(() => {
    laser.style.opacity = "0";
  }, 1320);
  cutsceneTimeout(() => { overlay.style.opacity = "0"; }, 1650);
  cutsceneTimeout(() => {
    overlay.remove();
    cutsceneActive = false;
    invincible = false;
    endBossFight(true);
  }, 2050);
}

function jackFinisherCutscene() {
  if (!bossActive || !bossEl || cutsceneActive) return;
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
  overlay.style.zIndex = "16000";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 360ms ease";
  overlay.style.background = "radial-gradient(circle at center, rgba(8,12,24,0.38) 0%, rgba(0,0,0,0.94) 74%)";
  overlay.style.overflow = "hidden";
  game.appendChild(overlay);

  const title = document.createElement("div");
  title.textContent = "SQUAD FUSION FINISHER";
  title.style.position = "absolute";
  title.style.top = "12%";
  title.style.left = "50%";
  title.style.transform = "translate(-50%, -50%)";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.fontSize = "clamp(20px,4vw,44px)";
  title.style.letterSpacing = "4px";
  title.style.color = "#ffffff";
  title.style.textShadow = "0 0 24px rgba(255,255,255,0.8)";
  overlay.appendChild(title);

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const squad = [
    { src: "../assets/images/kirk.jpeg", color: "#ff8a1f", sx: -260, sy: 80, tx: centerX - 260, ty: centerY - 170 },
    { src: "../assets/images/devito.jpeg", color: "#8d39ff", sx: window.innerWidth + 50, sy: 78, tx: centerX + 90, ty: centerY - 170 },
    { src: "../assets/images/drake.jpeg", color: "#1337c8", sx: -260, sy: window.innerHeight - 250, tx: centerX - 260, ty: centerY + 40 },
    { src: "../assets/images/nix.jpeg", color: "#ffd726", sx: window.innerWidth + 50, sy: window.innerHeight - 250, tx: centerX + 90, ty: centerY + 40 }
  ];

  const nodes = squad.map(c => {
    const img = document.createElement("img");
    img.src = c.src;
    img.style.position = "absolute";
    img.style.left = c.sx + "px";
    img.style.top = c.sy + "px";
    img.style.width = "170px";
    img.style.height = "170px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "16px";
    img.style.boxShadow = `0 0 30px ${c.color}`;
    img.style.filter = `drop-shadow(0 0 28px ${c.color})`;
    img.style.transition = "left 820ms cubic-bezier(.16,.84,.22,1), top 820ms cubic-bezier(.16,.84,.22,1), transform 820ms cubic-bezier(.16,.84,.22,1)";
    overlay.appendChild(img);
    return { cfg: c, el: img };
  });

  function spawnLaser(fromX, fromY, color) {
    const dx = centerX - fromX;
    const dy = centerY - fromY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);
    const beam = document.createElement("div");
    beam.style.position = "absolute";
    beam.style.left = fromX + "px";
    beam.style.top = fromY + "px";
    beam.style.width = len + "px";
    beam.style.height = "8px";
    beam.style.transformOrigin = "0 50%";
    beam.style.transform = `rotate(${ang}deg) scaleX(0)`;
    beam.style.background = `linear-gradient(90deg, ${color}, #fff)`;
    beam.style.boxShadow = `0 0 18px ${color}, 0 0 32px ${color}`;
    beam.style.borderRadius = "999px";
    beam.style.transition = "transform 260ms ease";
    overlay.appendChild(beam);
    requestAnimationFrame(() => {
      beam.style.transform = `rotate(${ang}deg) scaleX(1)`;
    });
    return beam;
  }

  function explodeAndKillJackMinions() {
    const blast = document.createElement("div");
    blast.style.position = "absolute";
    blast.style.left = centerX + "px";
    blast.style.top = centerY + "px";
    blast.style.width = "44px";
    blast.style.height = "44px";
    blast.style.borderRadius = "50%";
    blast.style.transform = "translate(-50%,-50%) scale(0.2)";
    blast.style.background = "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,204,92,0.96) 26%, rgba(255,86,38,0.92) 56%, rgba(255,22,0,0.65) 100%)";
    blast.style.boxShadow = "0 0 26px rgba(255,116,35,0.95), 0 0 70px rgba(255,52,0,0.88)";
    blast.style.zIndex = "16500";
    blast.style.opacity = "1";
    blast.style.transition = "transform 520ms cubic-bezier(.12,.8,.2,1), opacity 520ms ease";
    overlay.appendChild(blast);
    requestAnimationFrame(() => {
      blast.style.transform = "translate(-50%,-50%) scale(13)";
      blast.style.opacity = "0";
    });
    cutsceneTimeout(() => blast.remove(), 620);

    const minions = Array.from(document.querySelectorAll(".enemy.jack-minion"));
    minions.forEach((enemy, idx) => {
      cutsceneTimeout(() => {
        if (!enemy.isConnected) return;
        const er = enemy.getBoundingClientRect();
        animeDeathBurst(er.left + er.width / 2, er.top + er.height / 2, overlay);
        enemy.remove();
      }, idx * 14);
    });
  }

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => {
    nodes.forEach(node => {
      node.el.style.left = node.cfg.tx + "px";
      node.el.style.top = node.cfg.ty + "px";
      node.el.style.transform = "scale(1.02)";
    });
  }, 320);
  cutsceneTimeout(() => {
    const beams = nodes.map(node => {
      const nx = parseFloat(node.el.style.left) + 86;
      const ny = parseFloat(node.el.style.top) + 86;
      return spawnLaser(nx, ny, node.cfg.color);
    });
    sfx("slash");
    cutsceneTimeout(() => {
      animeDeathBurst(centerX, centerY, overlay);
      beams.forEach(b => {
        b.style.opacity = "0";
        b.style.transition = "opacity 220ms ease";
      });
    }, 230);
  }, 1290);
  cutsceneTimeout(() => {
    const flash = document.createElement("div");
    flash.style.position = "absolute";
    flash.style.inset = "0";
    flash.style.background = "rgba(255,255,255,0.92)";
    flash.style.opacity = "1";
    flash.style.transition = "opacity 250ms ease";
    overlay.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = "0"; });
    cutsceneTimeout(() => flash.remove(), 300);
  }, 1680);
  cutsceneTimeout(() => { explodeAndKillJackMinions(); }, 1770);
  cutsceneTimeout(() => { overlay.style.opacity = "0"; }, 2330);
  cutsceneTimeout(() => {
    overlay.remove();
    cutsceneActive = false;
    invincible = false;
    endBossFight(true);
  }, 2800);
}

function activateJackVictoryBuff() {
  player.classList.add("gold-ascended");
  scoreMultiplierUntil = Date.now() + 120000;
  const banner = document.createElement("div");
  banner.style.position = "absolute";
  banner.style.inset = "0";
  banner.style.display = "flex";
  banner.style.alignItems = "center";
  banner.style.justifyContent = "center";
  banner.style.zIndex = "15620";
  banner.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  banner.style.fontSize = "clamp(26px, 8vw, 104px)";
  banner.style.letterSpacing = "5px";
  banner.style.textAlign = "center";
  banner.style.color = "#ffd95b";
  banner.style.textShadow = "0 0 20px rgba(255, 214, 101, 0.96), 0 0 58px rgba(214, 140, 0, 0.92)";
  banner.style.opacity = "0";
  banner.style.transform = "scale(0.88)";
  banner.style.transition = "opacity 320ms ease, transform 320ms ease";
  banner.textContent = "DOUBLE SCORE FOR TWO MINUTES!";
  game.appendChild(banner);
  requestAnimationFrame(() => {
    banner.style.opacity = "1";
    banner.style.transform = "scale(1)";
  });
  cutsceneTimeout(() => {
    banner.style.opacity = "0";
    banner.style.transform = "scale(1.03)";
  }, 2550);
  cutsceneTimeout(() => banner.remove(), 3020);
  window.setTimeout(() => {
    if (Date.now() >= scoreMultiplierUntil) {
      player.classList.remove("gold-ascended");
    }
  }, 120100);
}

function endBossFight(victory) {
  const endedBossType = currentBossType;
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
  currentBossType = "";
  bossUI.style.display = "none";
  bossUI.classList.remove("jack-ui");
  bossNameEl.textContent = "EVIL HATHAWAY";
  bossAmbience.style.display = "none";
  game.classList.remove("boss-mode");
  document.querySelectorAll(".boss-bullet").forEach(el => el.remove());

  if (victory) {
    addScore(200);
    speed += 7;
    spdEl.textContent = speed.toFixed(1);
  }

  if (victory && endedBossType === "jack") {
    activateJackVictoryBuff();
  }

  if (!gameOver) {
    startTimers();
    if (endedBossType === "jack") {
      resumeHathawaySpawnTimer();
    } else {
      if (victory) {
        document.querySelectorAll(".orb").forEach(el => el.remove());
        spawn("orb");
      }
      scheduleNextBoss();
    }
  }
}

function updateBoss(dt) {
  if (!bossActive || !bossEl) return;

  const bossSize = parseFloat(bossEl.dataset.size || "120");
  const cx = bossX + bossSize / 2;
  const cy = bossY + bossSize / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const hpFactor = 1 - bossHp / bossMaxHp;
  const isJack = currentBossType === "jack";
  const chase = isJack ? (0.72 + hpFactor * 0.95) : (0.95 + hpFactor * 1.15);

  if (bossDashFrames > 0) {
    bossX += bossVx * dt;
    bossY += bossVy * dt;
    bossDashFrames -= dt;
  } else {
    bossX += (dx / dist) * chase * dt;
    bossY += (dy / dist) * chase * dt;
    bossDashCooldown -= dt;
    if (bossDashCooldown <= 0) {
      const dashSpeed = isJack ? (4.4 + hpFactor * 1.05) : (5.2 + hpFactor * 1.2);
      bossVx = (dx / dist) * dashSpeed;
      bossVy = (dy / dist) * dashSpeed;
      bossDashFrames = isJack ? 28 : 22;
      bossDashCooldown = isJack ? (122 - Math.floor(hpFactor * 40)) : (140 - Math.floor(hpFactor * 45));
      spawnBossBullet();
    }
  }

  bossX = Math.max(0, Math.min(window.innerWidth - bossSize, bossX));
  bossY = Math.max(0, Math.min(window.innerHeight - bossSize, bossY));
  bossEl.style.left = bossX + "px";
  bossEl.style.top = bossY + "px";

  if (!playerDamageImmune() && collide(player, bossEl) && !consumeShieldHit(null, false)) death();
}
