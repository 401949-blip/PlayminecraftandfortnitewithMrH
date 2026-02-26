function collide(a, b) {
  const A = a.getBoundingClientRect();
  const B = b.getBoundingClientRect();
  const ax = A.left + A.width / 2;
  const ay = A.top + A.height / 2;
  const bx = B.left + B.width / 2;
  const by = B.top + B.height / 2;
  const orbScaleA = a.classList && a.classList.contains("orb") ? 1.65 : 1;
  const orbScaleB = b.classList && b.classList.contains("orb") ? 1.65 : 1;
  const ar = Math.min(A.width, A.height) * 0.42 * orbScaleA;
  const br = Math.min(B.width, B.height) * 0.42 * orbScaleB;
  const dx = ax - bx;
  const dy = ay - by;
  const rr = ar + br;
  return (dx * dx + dy * dy) <= rr * rr;
}

function animeDeathBurst(xPos, yPos, parent) {
  const host = parent || game;
  const enemyCount = document.querySelectorAll(".enemy").length;
  const heavyLoad = enemyCount > 24 || cutsceneActive;
  if (!heavyLoad) {
    const ring = document.createElement("div");
    ring.style.position = "absolute";
    ring.style.left = xPos + "px";
    ring.style.top = yPos + "px";
    ring.style.width = "20px";
    ring.style.height = "20px";
    ring.style.border = "2px solid rgba(255,145,191,0.95)";
    ring.style.borderRadius = "50%";
    ring.style.transform = "translate(-50%,-50%) scale(0.3)";
    ring.style.opacity = "1";
    ring.style.pointerEvents = "none";
    ring.style.zIndex = 10020;
    host.appendChild(ring);

    let ringScale = 0.3;
    let ringOpacity = 1;
    function animateRing() {
      ringScale += 0.18;
      ringOpacity -= 0.045;
      ring.style.transform = `translate(-50%,-50%) scale(${ringScale})`;
      ring.style.opacity = ringOpacity;
      if (ringOpacity > 0) requestAnimationFrame(animateRing);
      else ring.remove();
    }
    animateRing();
  }

  const particleCount = heavyLoad ? 2 : FX_SETTINGS.deathBurstParticles;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.left = xPos + "px";
    particle.style.top = yPos + "px";
    particle.style.width = (2 + Math.random() * 5) + "px";
    particle.style.height = (2 + Math.random() * 5) + "px";
    particle.style.borderRadius = "50%";
    particle.style.background = i % 4 === 0 ? "#fff" : "#ff7abf";
    particle.style.boxShadow = "0 0 12px rgba(255,122,191,0.95)";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = 10021;
    host.appendChild(particle);
    const ang = Math.random() * Math.PI * 2;
    const ps = 4 + Math.random() * 6;
    let life = 1;
    let px = 0;
    let py = 0;

    function animateParticle() {
      px += Math.cos(ang) * ps;
      py += Math.sin(ang) * ps;
      life -= 0.055;
      particle.style.transform = `translate(${px}px,${py}px)`;
      particle.style.opacity = life;
      if (life > 0) requestAnimationFrame(animateParticle);
      else particle.remove();
    }
    animateParticle();
  }
}

function iceBreakBurst(xPos, yPos, parent) {
  const host = parent || game;
  const ring = document.createElement("div");
  ring.style.position = "absolute";
  ring.style.left = xPos + "px";
  ring.style.top = yPos + "px";
  ring.style.width = "18px";
  ring.style.height = "18px";
  ring.style.border = "2px solid rgba(134, 214, 255, 0.96)";
  ring.style.borderRadius = "50%";
  ring.style.transform = "translate(-50%,-50%) scale(0.32)";
  ring.style.opacity = "0.95";
  ring.style.pointerEvents = "none";
  ring.style.zIndex = 10035;
  host.appendChild(ring);
  let scale = 0.32;
  let alpha = 0.95;
  function stepRing() {
    scale += 0.22;
    alpha -= 0.06;
    ring.style.transform = `translate(-50%,-50%) scale(${scale})`;
    ring.style.opacity = alpha;
    if (alpha > 0) requestAnimationFrame(stepRing);
    else ring.remove();
  }
  stepRing();

  const shardCount = cutsceneActive ? 6 : 10;
  for (let i = 0; i < shardCount; i++) {
    const shard = document.createElement("div");
    const w = 3 + Math.random() * 5;
    const h = 7 + Math.random() * 9;
    shard.style.position = "absolute";
    shard.style.left = xPos + "px";
    shard.style.top = yPos + "px";
    shard.style.width = w + "px";
    shard.style.height = h + "px";
    shard.style.borderRadius = "2px";
    shard.style.background = i % 3 ? "#a7e7ff" : "#e6f8ff";
    shard.style.boxShadow = "0 0 12px rgba(120,206,255,0.96)";
    shard.style.pointerEvents = "none";
    shard.style.zIndex = 10036;
    host.appendChild(shard);

    const ang = (Math.PI * 2 * i) / shardCount + (Math.random() - 0.5) * 0.35;
    const vel = 3.4 + Math.random() * 4.2;
    const spin = (Math.random() - 0.5) * 22;
    let px = 0;
    let py = 0;
    let rot = 0;
    let life = 1;
    function stepShard() {
      px += Math.cos(ang) * vel;
      py += Math.sin(ang) * vel;
      rot += spin;
      life -= 0.055;
      shard.style.transform = `translate(${px}px,${py}px) rotate(${rot}deg)`;
      shard.style.opacity = life;
      if (life > 0) requestAnimationFrame(stepShard);
      else shard.remove();
    }
    stepShard();
  }
}

function applePickupBurst(xPos, yPos, parent) {
  const host = parent || game;
  const flash = document.createElement("div");
  flash.style.position = "absolute";
  flash.style.left = xPos + "px";
  flash.style.top = yPos + "px";
  flash.style.width = "24px";
  flash.style.height = "24px";
  flash.style.borderRadius = "50%";
  flash.style.transform = "translate(-50%,-50%) scale(0.5)";
  flash.style.border = "2px solid rgba(255, 223, 143, 0.95)";
  flash.style.boxShadow = "0 0 18px rgba(182, 117, 56, 0.9)";
  flash.style.opacity = "0.92";
  flash.style.pointerEvents = "none";
  flash.style.zIndex = "10030";
  host.appendChild(flash);

  let scale = 0.5;
  let alpha = 0.92;
  function animateFlash() {
    scale += 0.15;
    alpha -= 0.075;
    flash.style.transform = `translate(-50%,-50%) scale(${scale})`;
    flash.style.opacity = alpha;
    if (alpha > 0) requestAnimationFrame(animateFlash);
    else flash.remove();
  }
  animateFlash();

  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.left = xPos + "px";
    p.style.top = yPos + "px";
    p.style.width = (4 + Math.random() * 3) + "px";
    p.style.height = (4 + Math.random() * 3) + "px";
    p.style.borderRadius = "50%";
    p.style.background = i % 2 === 0 ? "#f5cf84" : "#c48742";
    p.style.boxShadow = "0 0 10px rgba(201, 141, 72, 0.92)";
    p.style.pointerEvents = "none";
    p.style.zIndex = "10031";
    host.appendChild(p);

    const ang = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.35;
    const vel = 2.1 + Math.random() * 2.4;
    let life = 1;
    let px = 0;
    let py = 0;
    function animateP() {
      px += Math.cos(ang) * vel;
      py += Math.sin(ang) * vel;
      life -= 0.06;
      p.style.transform = `translate(${px}px,${py}px)`;
      p.style.opacity = life;
      if (life > 0) requestAnimationFrame(animateP);
      else p.remove();
    }
    animateP();
  }
}

function smoothEnemyWipe(overlayHost) {
  const enemies = Array.from(document.querySelectorAll(".enemy"));
  const total = enemies.length;
  if (total === 0) return;

  let idx = 0;
  function wipeChunk() {
    const end = Math.min(total, idx + FX_SETTINGS.wipeBatchSize);
    for (let i = idx; i < end; i++) {
      const e = enemies[i];
      if (!e || !e.isConnected) continue;
      if (i % FX_SETTINGS.wipeBurstStride === 0) {
        const rect = e.getBoundingClientRect();
        animeDeathBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, overlayHost);
      }
      e.remove();
    }
    idx = end;
    if (idx < total) requestAnimationFrame(wipeChunk);
  }

  requestAnimationFrame(wipeChunk);
  addScore(total);
}

function clearHighScoreCelebration() {
  if (!confettiLayer) return;
  confettiLayer.innerHTML = "";
}

function launchHighScoreConfetti() {
  if (!confettiLayer) return;
  clearHighScoreCelebration();
  const colors = ["#8ed8ff", "#ffd8a8", "#bfffb5", "#ffd1dc", "#fff4a8", "#d3e1ff"];
  const count = 95;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = (Math.random() * 100).toFixed(2) + "%";
    piece.style.top = (-12 - Math.random() * 18).toFixed(2) + "%";
    piece.style.width = (4 + Math.random() * 7).toFixed(2) + "px";
    piece.style.height = (7 + Math.random() * 11).toFixed(2) + "px";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.6 + Math.random() * 1.4).toFixed(2) + "s";
    piece.style.animationDelay = (Math.random() * 0.35).toFixed(2) + "s";
    piece.style.setProperty("--drift", ((Math.random() - 0.5) * 180).toFixed(2) + "px");
    piece.style.setProperty("--spin", (220 + Math.random() * 360).toFixed(1) + "deg");
    confettiLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function death() {
  gameOver = true;
  pendingBackgroundReroll = true;
  cutsceneActive = false;
  invincible = false;
  game.classList.remove("cutscene-mode");
  const survivedMs = Math.max(0, Date.now() - runStartedAt);
  game.classList.add("death-mode");
  stopTheme();
  sfx("death");
  if (bossActive) endBossFight(false);
  clearTimers();
  clearDynamicObjects();
  runStartedAt = Date.now();
  timeEl.textContent = "00:00";
  player.style.opacity = "0";

  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = "5px";
    p.style.height = "5px";
    p.style.background = "white";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.opacity = "1";
    game.appendChild(p);

    const ang = Math.random() * 2 * Math.PI;
    const v = 2 + Math.random() * 6;
    let px = 0;
    let py = 0;

    function anim() {
      px += Math.cos(ang) * v;
      py += Math.sin(ang) * v;
      p.style.transform = `translate(${px}px,${py}px)`;
      p.style.opacity = String(parseFloat(p.style.opacity) - 0.03);
      if (parseFloat(p.style.opacity) > 0) requestAnimationFrame(anim);
      else p.remove();
    }
    anim();
  }

  setTimeout(() => {
    const beatHighScore = score > highScore;
    if (beatHighScore) {
      highScore = score;
      saveHighScoreToCookie();
      newHighScoreRun = true;
      launchHighScoreConfetti();
      deathScoreEl.classList.add("new-record");
      newHighScoreTextEl.classList.add("show");
    } else {
      deathScoreEl.classList.remove("new-record");
      newHighScoreTextEl.classList.remove("show");
      clearHighScoreCelebration();
    }
    updateHighScoreUI();
    deathScoreEl.textContent = "Score: " + String(score);
    deathTimeEl.textContent = "Time Survived: " + formatTime(survivedMs);
    deathScreenEl.classList.add("show");
    deathScreenEl.setAttribute("aria-hidden", "false");
    deathScoreEl.classList.add("show");
    deathTimeEl.classList.add("show");
    playBtn.classList.add("show");
    deathExitBtn.classList.add("show");
  }, 500);
}
