function resizeIceCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  icePathCanvas.width = Math.floor(w * dpr);
  icePathCanvas.height = Math.floor(h * dpr);
  icePathCanvas.style.width = w + "px";
  icePathCanvas.style.height = h + "px";
  icePathCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clearTimers() {
  clearInterval(enemyTimer);
  clearInterval(powerTimer);
  clearInterval(kirkTimer);
  clearInterval(pacingTimer);
  clearInterval(bossMinionTimer);
  clearInterval(bossBulletTimer);
  clearInterval(bossOrbTimer);
  clearInterval(boNixTimer);
  clearInterval(drakeTimer);
}

function enemyBudgetNow() {
  const elapsedSec = Math.max(0, (Date.now() - runStartedAt) / 1000);
  const ramp = Math.min(MAX_ENEMIES_RAMP, Math.floor(elapsedSec / 25));
  return MAX_ENEMIES_BASE + ramp;
}

function canSpawnEnemy() {
  const activeEnemies = document.querySelectorAll(".enemy").length;
  return activeEnemies < enemyBudgetNow();
}

function playerDamageImmune() {
  const now = Date.now();
  return invincible || now < wrapGraceUntil || now < kirkInvincibleUntil;
}

function initEnemySpawnGrace(enemyEl) {
  enemyEl.dataset.spawnSafeUntil = String(Date.now() + ENEMY_SPAWN_SAFE_MS);
  enemyEl.classList.add("spawn-safe");
}

function applyRandomStageBackground() {
  const list = STAGE_BACKGROUNDS;
  if (!list || list.length === 0) return;
  let choice = list[Math.floor(Math.random() * list.length)];
  if (list.length > 1 && choice === currentStageBackground) {
    const fallback = list.find(bg => bg !== currentStageBackground);
    if (fallback) choice = fallback;
  }
  currentStageBackground = choice;
  game.style.setProperty("--stage-bg", `url('${choice}')`);
}

function getCookieValue(name) {
  const token = `${name}=`;
  const all = document.cookie ? document.cookie.split(";") : [];
  for (let i = 0; i < all.length; i++) {
    const part = all[i].trim();
    if (part.startsWith(token)) return decodeURIComponent(part.slice(token.length));
  }
  return "";
}

function loadHighScoreFromCookie() {
  const cookieParsed = parseInt(getCookieValue("website_game_highscore"), 10);
  let best = Number.isFinite(cookieParsed) && cookieParsed > 0 ? cookieParsed : 0;
  try {
    const lsParsed = parseInt(localStorage.getItem("website_game_highscore") || "0", 10);
    if (Number.isFinite(lsParsed) && lsParsed > best) best = lsParsed;
  } catch (_) {}
  highScore = best;
}

function saveHighScoreToCookie() {
  const oneYearSeconds = 60 * 60 * 24 * 365;
  document.cookie = `website_game_highscore=${encodeURIComponent(String(highScore))}; max-age=${oneYearSeconds}; path=/; samesite=lax`;
  try {
    localStorage.setItem("website_game_highscore", String(highScore));
  } catch (_) {}
}

function updateHighScoreUI() {
  if (menuHighScoreValueEl) menuHighScoreValueEl.textContent = String(highScore);
  if (deathHighScoreValueEl) deathHighScoreValueEl.textContent = String(highScore);
}

function setDevitoMode(active) {
  devitoModeActive = !!active;
  if (devitoModeActive) {
    devitoRunNoRecord = true;
    game.classList.add("devito-mode");
    scoreEl.textContent = "DEVITO";
    timeEl.textContent = "DEVITO";
    player.src = "../assets/images/devito.jpeg";
    if (bossEl) bossEl.src = "../assets/images/devito.jpeg";
  } else {
    game.classList.remove("devito-mode");
    scoreEl.textContent = String(score);
    timeEl.textContent = formatTime(Date.now() - runStartedAt);
    player.src = "../assets/images/hathaway.jpeg";
  }
}

function startTimers() {
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
  }, 28000);

  // Slow long-term ramp so the game takes a while to get intense.
  pacingTimer = setInterval(() => {
    if (gameOver || cutsceneActive || paused || menuOpen) return;
    speed = Math.min(speed + 0.35, 70);
    enemySpeed = Math.min(enemySpeed + 0.05, 4.5);
    spdEl.textContent = speed.toFixed(1);
  }, 5000);
}

function clearDynamicObjects() {
  document.querySelectorAll(".orb,.enemy,.power,.kirk,.bonix,.drake,.cutscene-overlay,.boss,.boss-bullet,.slash-sweep").forEach(el => el.remove());
}

function scheduleNextBoss() {
  hathawaySpawnRemainingMs = 120000;
  hathawaySpawnResumeAt = Date.now();
  nextBossAt = hathawaySpawnResumeAt + hathawaySpawnRemainingMs;
}

function pauseHathawaySpawnTimer() {
  if (!hathawaySpawnResumeAt) return;
  const elapsed = Date.now() - hathawaySpawnResumeAt;
  hathawaySpawnRemainingMs = Math.max(0, hathawaySpawnRemainingMs - elapsed);
  hathawaySpawnResumeAt = 0;
  nextBossAt = Date.now() + hathawaySpawnRemainingMs;
}

function resumeHathawaySpawnTimer() {
  if (hathawaySpawnResumeAt || gameOver) return;
  hathawaySpawnResumeAt = Date.now();
  nextBossAt = hathawaySpawnResumeAt + hathawaySpawnRemainingMs;
}

function hathawaySpawnDue() {
  if (!hathawaySpawnResumeAt) return false;
  return Date.now() - hathawaySpawnResumeAt >= hathawaySpawnRemainingMs;
}

function resetState() {
  if (loopRafId) {
    cancelAnimationFrame(loopRafId);
    loopRafId = 0;
  }
  loopRunning = false;
  clearTimers();
  clearDynamicObjects();

  x = window.innerWidth / 2;
  y = window.innerHeight / 2;
  velX = 0;
  velY = 0;
  speed = 18;
  acceleration = 1.2;
  friction = 0.9;
  enemySpeed = 0.6;
  score = 0;
  invincible = false;
  gameOver = false;
  cutsceneActive = false;
  keys = {};
  scheduleNextBoss();
  bossActive = false;
  currentBossType = "";
  evilJackSpawned = false;
  evilJackQueued = false;
  bossEl = null;
  bossX = 0;
  bossY = 0;
  bossVx = 0;
  bossVy = 0;
  bossDashFrames = 0;
  bossDashCooldown = 180;
  bossHp = 0;
  bossMaxHp = 0;
  hasShield = false;
  shieldImmuneUntil = 0;
  kirkInvincibleUntil = 0;
  drakePowerUntil = 0;
  nextIceTrailAt = 0;
  icePathPoints = [];
  wrapGraceUntil = 0;
  lastFrameAt = performance.now();
  cutsceneFreezeAt = 0;
  kirkShieldFrozenInCutscene = false;
  playerFrozenUntil = 0;
  scoreMultiplierUntil = 0;
  devitoRunNoRecord = false;
  stopTheme();
  drawIcePath(Date.now());
  runStartedAt = Date.now();

  scoreEl.textContent = String(score);
  spdEl.textContent = speed.toFixed(1);
  timeEl.textContent = "00:00";
  player.style.opacity = "1";
  player.style.left = x + "px";
  player.style.top = y + "px";
  shieldRing.style.display = "none";
  kirkShieldRing.style.display = "none";
  timeEl.textContent = formatTime(Date.now() - runStartedAt);
  playBtn.classList.remove("show");
  deathExitBtn.classList.remove("show");
  deathScoreEl.classList.remove("show");
  deathTimeEl.classList.remove("show");
  deathScreenEl.classList.remove("show");
  deathScreenEl.setAttribute("aria-hidden", "true");
  deathScoreEl.textContent = "";
  deathTimeEl.textContent = "";
  deathScoreEl.classList.remove("new-record");
  newHighScoreTextEl.classList.remove("show");
  clearHighScoreCelebration();
  newHighScoreRun = false;
  updateHighScoreUI();
  game.classList.remove("death-mode");
  bossUI.style.display = "none";
  bossFill.style.width = "100%";
  bossHpText.textContent = "100%";
  bossAmbience.style.display = "none";
  game.classList.remove("boss-mode");
  game.classList.remove("cutscene-mode");
  game.classList.remove("perf-lite");
  bossUI.classList.remove("jack-ui");
  bossNameEl.textContent = "EVIL HATHAWAY";
  player.classList.remove("gold-ascended");
  player.classList.remove("frozen-player");
  setDevitoMode(false);
}

function restartGame() {
  sfx("ui");
  if (gameOver && pendingBackgroundReroll) {
    applyRandomStageBackground();
    pendingBackgroundReroll = false;
  }
  resetState();
  spawn("orb");
  startTimers();
  game.focus();
  startLoop();
}

function startLoop() {
  if (loopRunning) return;
  loopRunning = true;
  loopRafId = requestAnimationFrame(loop);
}

function setShieldActive(active) {
  hasShield = active;
  shieldRing.style.display = active ? "block" : "none";
}

function updateShieldRingPosition() {
  if (!hasShield) return;
  shieldRing.style.left = (x - 17) + "px";
  shieldRing.style.top = (y - 17) + "px";
}

function updateKirkShieldRing() {
  const now = Date.now();
  const remaining = kirkInvincibleUntil - now;
  const active = remaining > 0;
  kirkShieldRing.style.display = active ? "block" : "none";
  if (!active) return;
  if (remaining <= 3000) {
    kirkShieldRing.style.background = "conic-gradient(from 0deg, rgba(255,95,95,0.0), rgba(255,40,40,0.95), rgba(255,185,185,0.62), rgba(255,40,40,0.95), rgba(255,95,95,0.0))";
    kirkShieldRing.style.filter = "drop-shadow(0 0 15px rgba(255,65,65,0.95)) drop-shadow(0 0 30px rgba(210,25,25,0.7))";
  } else {
    kirkShieldRing.style.background = "conic-gradient(from 0deg, rgba(80,185,255,0.0), rgba(45,140,255,0.95), rgba(175,232,255,0.62), rgba(45,140,255,0.95), rgba(80,185,255,0.0))";
    kirkShieldRing.style.filter = "drop-shadow(0 0 15px rgba(60,160,255,0.95)) drop-shadow(0 0 30px rgba(50,125,255,0.7))";
  }
  kirkShieldRing.style.left = (x - 24) + "px";
  kirkShieldRing.style.top = (y - 24) + "px";
}

function addScore(points) {
  const gain = Math.max(0, points | 0);
  if (gain <= 0) return;
  const boosted = Date.now() < scoreMultiplierUntil ? gain * 2 : gain;
  score += boosted;
  scoreEl.textContent = devitoModeActive ? "DEVITO" : String(score);
  const top = hudTop || scoreEl.parentElement;
  if (top) {
    top.classList.remove("score-pop");
    void top.offsetWidth;
    top.classList.add("score-pop");
  }
}

function cutsceneTimeout(cb, delayMs) {
  const baseDelay = Math.max(0, Number(delayMs) || 0);
  if (!cutsceneActive) return window.setTimeout(cb, baseDelay);

  let remaining = baseDelay * CUTSCENE_TIME_SCALE;
  let lastTickAt = performance.now();

  function tick() {
    const now = performance.now();
    if (!paused && !menuOpen) {
      remaining -= now - lastTickAt;
    }
    lastTickAt = now;
    if (remaining <= 0) {
      cb();
      return;
    }
    window.setTimeout(tick, 16);
  }

  return window.setTimeout(tick, 16);
}

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function spawn(cls) {
  if (gameOver || menuOpen) return null;
  if (cls === "enemy" && !canSpawnEnemy()) return null;
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

  function tooDenseAt(px, py) {
    let local = 0;
    for (let i = 0; i < enemies.length; i++) {
      const ex = parseFloat(enemies[i].style.left) + 16;
      const ey = parseFloat(enemies[i].style.top) + 16;
      const dx = px - ex;
      const dy = py - ey;
      if ((dx * dx + dy * dy) <= ENEMY_LOCAL_DENSITY_RADIUS * ENEMY_LOCAL_DENSITY_RADIUS) {
        local++;
        if (local >= 3) return true;
      }
    }
    return false;
  }

  for (let i = 0; i < maxAttempts; i++) {
    sx = Math.random() * (window.innerWidth - 50);
    sy = Math.random() * (window.innerHeight - 50);

    if (cls === "enemy") {
      const px = sx + 16;
      const py = sy + 16;
      const dx = px - x;
      const dy = py - y;
      if ((dx * dx + dy * dy) < ENEMY_SAFE_RADIUS * ENEMY_SAFE_RADIUS) continue;

      let nearOrb = false;
      for (let j = 0; j < orbs.length; j++) {
        const ox = parseFloat(orbs[j].style.left) + 11;
        const oy = parseFloat(orbs[j].style.top) + 11;
        const odx = px - ox;
        const ody = py - oy;
        if ((odx * odx + ody * ody) < ORB_SAFE_RADIUS * ORB_SAFE_RADIUS) {
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
        if ((pdx * pdx + pdy * pdy) < POWERUP_SAFE_RADIUS * POWERUP_SAFE_RADIUS) {
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
        px < ORB_EDGE_SAFE_MARGIN ||
        py < ORB_EDGE_SAFE_MARGIN ||
        px > window.innerWidth - ORB_EDGE_SAFE_MARGIN ||
        py > window.innerHeight - ORB_EDGE_SAFE_MARGIN;
      if (nearEdge) continue;
      const cornerTooFar =
        (px < ORB_CORNER_SAFE_RADIUS && py < ORB_CORNER_SAFE_RADIUS) ||
        (px > window.innerWidth - ORB_CORNER_SAFE_RADIUS && py < ORB_CORNER_SAFE_RADIUS) ||
        (px < ORB_CORNER_SAFE_RADIUS && py > window.innerHeight - ORB_CORNER_SAFE_RADIUS) ||
        (px > window.innerWidth - ORB_CORNER_SAFE_RADIUS && py > window.innerHeight - ORB_CORNER_SAFE_RADIUS);
      if (cornerTooFar) continue;
      let tooRisky = false;
      for (let j = 0; j < enemies.length; j++) {
        const ex = parseFloat(enemies[j].style.left) + 16;
        const ey = parseFloat(enemies[j].style.top) + 16;
        const dx = px - ex;
        const dy = py - ey;
        if ((dx * dx + dy * dy) < ORB_SAFE_RADIUS * ORB_SAFE_RADIUS) {
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
    const dx = finalX - x;
    const dy = finalY - y;
    if ((dx * dx + dy * dy) < ENEMY_SAFE_RADIUS * ENEMY_SAFE_RADIUS) return null;
  }

  d.style.left = sx + "px";
  d.style.top = sy + "px";
  if (cls === "enemy") {
    initEnemySpawnGrace(d);
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
  }
  game.appendChild(d);
  return d;
}
