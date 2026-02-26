function loop() {
  if (gameOver) {
    loopRunning = false;
    loopRafId = 0;
    return;
  }
  function scheduleNextLoop() {
    loopRafId = requestAnimationFrame(loop);
  }
  const nowMs = Date.now();
  if (cutsceneActive) {
    if (!cutsceneFreezeAt) {
      cutsceneFreezeAt = nowMs;
      kirkShieldFrozenInCutscene = kirkInvincibleUntil > nowMs;
    }
    const frozenDelta = nowMs - cutsceneFreezeAt;
    if (frozenDelta > 0 && kirkShieldFrozenInCutscene) {
      kirkInvincibleUntil += frozenDelta;
    }
    cutsceneFreezeAt = nowMs;
  } else {
    cutsceneFreezeAt = 0;
    kirkShieldFrozenInCutscene = false;
  }
  if (menuOpen || paused) {
    scheduleNextLoop();
    return;
  }
  const frameNow = performance.now();
  const frameDt = lastFrameAt ? (frameNow - lastFrameAt) / (1000 / 60) : 1;
  const dt = Math.max(0.5, Math.min(1.8, frameDt));
  lastFrameAt = frameNow;

  timeEl.textContent = devitoModeActive ? "DEVITO" : formatTime(Date.now() - runStartedAt);
  updateShieldRingPosition();
  updateKirkShieldRing();

  if (cutsceneActive) {
    game.classList.add("cutscene-mode");
    scheduleNextLoop();
    return;
  }
  game.classList.remove("cutscene-mode");

  const frozenNow = Date.now() < playerFrozenUntil;
  if (frozenNow) {
    player.classList.add("frozen-player");
    velX *= 0.45;
    velY *= 0.45;
  } else {
    player.classList.remove("frozen-player");
    if (keys["ArrowUp"] || keys["w"]) velY -= acceleration * dt;
    if (keys["ArrowDown"] || keys["s"]) velY += acceleration * dt;
    if (keys["ArrowLeft"] || keys["a"]) velX -= acceleration * dt;
    if (keys["ArrowRight"] || keys["d"]) velX += acceleration * dt;
  }
  let mag = Math.sqrt(velX * velX + velY * velY);
  if (mag > speed) {
    velX = (velX / mag) * speed;
    velY = (velY / mag) * speed;
  }

  velX *= Math.pow(friction, dt);
  velY *= Math.pow(friction, dt);
  x += velX * dt;
  y += velY * dt;

  let wrapped = false;
  if (x > window.innerWidth) {
    x = 0;
    wrapped = true;
  }
  if (x < 0) {
    x = window.innerWidth;
    wrapped = true;
  }
  if (y > window.innerHeight) {
    y = 0;
    wrapped = true;
  }
  if (y < 0) {
    y = window.innerHeight;
    wrapped = true;
  }
  if (wrapped) wrapGraceUntil = Date.now() + WRAP_GRACE_MS;

  player.style.left = x + "px";
  player.style.top = y + "px";

  const now = Date.now();
  const enemyCount = document.querySelectorAll(".enemy").length;
  if (enemyCount > 14 || bossActive) game.classList.add("perf-lite");
  else game.classList.remove("perf-lite");
  updateDrakeTrails(now, wrapped);

  if (!evilJackSpawned && score >= 1000) evilJackQueued = true;

  if (!bossActive && evilJackQueued && !cutsceneActive) {
    startEvilJackFight();
  } else if (!bossActive && !cutsceneActive && hathawaySpawnDue()) {
    startBossFight();
  }

  updateBoss(dt);
  updateBossBullets(dt);
  updateEnemies(now, dt);
  updateOrbCollisions();
  updatePowerupCollisions();

  scheduleNextLoop();
}
