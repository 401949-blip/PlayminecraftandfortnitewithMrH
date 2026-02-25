function boNixCutscene() {
  if (cutsceneActive || gameOver) return;
  sfx("pickup");
  setTheme(startBoNixTheme);
  cutsceneActive = true;
  invincible = true;

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "14500";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 650ms ease";
  overlay.style.overflow = "hidden";
  overlay.style.background = "#100905";
  game.appendChild(overlay);

  const desert = document.createElement("img");
  desert.src = "../assets/images/desert.jpeg";
  desert.onerror = () => { desert.src = "../assets/images/ocean.jpeg"; };
  desert.style.position = "absolute";
  desert.style.inset = "-6%";
  desert.style.width = "112%";
  desert.style.height = "112%";
  desert.style.objectFit = "cover";
  desert.style.filter = "contrast(1.18) saturate(1.38) brightness(0.86)";
  desert.style.transform = "scale(1.16)";
  desert.style.transition = "transform 3200ms ease-out";
  overlay.appendChild(desert);

  const grade = document.createElement("div");
  grade.style.position = "absolute";
  grade.style.inset = "0";
  grade.style.background = "linear-gradient(180deg, rgba(24,36,59,0.42) 0%, rgba(244,145,30,0.2) 47%, rgba(18,8,6,0.72) 100%)";
  grade.style.mixBlendMode = "screen";
  overlay.appendChild(grade);

  const sun = document.createElement("div");
  sun.style.position = "absolute";
  sun.style.width = "320px";
  sun.style.height = "320px";
  sun.style.borderRadius = "50%";
  sun.style.left = "71%";
  sun.style.top = "8%";
  sun.style.background = "radial-gradient(circle, rgba(255,240,196,1) 0%, rgba(255,174,63,0.95) 56%, rgba(255,122,23,0.15) 100%)";
  sun.style.boxShadow = "0 0 120px rgba(255,186,84,0.95)";
  sun.style.opacity = "0.85";
  overlay.appendChild(sun);

  const flare = document.createElement("div");
  flare.style.position = "absolute";
  flare.style.left = "0";
  flare.style.top = "0";
  flare.style.width = "100%";
  flare.style.height = "100%";
  flare.style.background = "radial-gradient(circle at 68% 20%, rgba(255,224,155,0.35), rgba(0,0,0,0) 36%)";
  flare.style.mixBlendMode = "screen";
  overlay.appendChild(flare);

  const barTop = document.createElement("div");
  barTop.style.position = "absolute";
  barTop.style.top = "0";
  barTop.style.left = "0";
  barTop.style.width = "100%";
  barTop.style.height = "0";
  barTop.style.background = "#000";
  barTop.style.transition = "height 450ms ease";
  barTop.style.zIndex = "2";
  overlay.appendChild(barTop);

  const barBottom = document.createElement("div");
  barBottom.style.position = "absolute";
  barBottom.style.bottom = "0";
  barBottom.style.left = "0";
  barBottom.style.width = "100%";
  barBottom.style.height = "0";
  barBottom.style.background = "#000";
  barBottom.style.transition = "height 450ms ease";
  barBottom.style.zIndex = "2";
  overlay.appendChild(barBottom);

  const horseWrap = document.createElement("div");
  horseWrap.style.position = "absolute";
  horseWrap.style.width = "480px";
  horseWrap.style.height = "300px";
  horseWrap.style.left = "-560px";
  horseWrap.style.bottom = "12%";
  horseWrap.style.transition = "left 1850ms cubic-bezier(.08,.86,.16,1), transform 1850ms cubic-bezier(.08,.86,.16,1)";
  horseWrap.style.zIndex = "3";
  overlay.appendChild(horseWrap);

  const horse = document.createElement("img");
  horse.src = "../assets/images/horse.jpeg";
  horse.onerror = () => { horse.src = "../assets/images/kirk.jpeg"; };
  horse.style.position = "absolute";
  horse.style.left = "0";
  horse.style.bottom = "0";
  horse.style.width = "420px";
  horse.style.height = "240px";
  horse.style.objectFit = "cover";
  horse.style.borderRadius = "14px";
  horse.style.filter = "contrast(1.14) saturate(1.2) drop-shadow(0 0 20px rgba(255,164,68,0.7))";
  horseWrap.appendChild(horse);

  const rider = document.createElement("img");
  rider.src = "../assets/images/nix.jpeg";
  rider.onerror = () => { rider.src = "../assets/images/kirk.jpeg"; };
  rider.style.position = "absolute";
  rider.style.width = "96px";
  rider.style.height = "96px";
  rider.style.objectFit = "cover";
  rider.style.borderRadius = "14px";
  rider.style.left = "170px";
  rider.style.top = "42px";
  rider.style.boxShadow = "0 0 30px rgba(255,188,86,0.95)";
  rider.style.filter = "saturate(1.28) contrast(1.12)";
  horseWrap.appendChild(rider);

  const speedLines = document.createElement("div");
  speedLines.style.position = "absolute";
  speedLines.style.inset = "0";
  speedLines.style.background = "repeating-linear-gradient(90deg, rgba(255,188,95,0.14) 0 2px, transparent 2px 22px)";
  speedLines.style.opacity = "0";
  speedLines.style.transition = "opacity 180ms linear";
  speedLines.style.mixBlendMode = "screen";
  overlay.appendChild(speedLines);

  const dust = [];
  for (let i = 0; i < FX_SETTINGS.boNixDust; i++) {
    const d = document.createElement("div");
    const size = 2 + Math.random() * 7;
    d.style.position = "absolute";
    d.style.width = size + "px";
    d.style.height = size + "px";
    d.style.borderRadius = "50%";
    d.style.background = i % 3 ? "rgba(255,190,120,0.75)" : "rgba(255,228,178,0.82)";
    d.style.boxShadow = "0 0 12px rgba(255,188,112,0.72)";
    overlay.appendChild(d);
    dust.push({
      el: d,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * (0.46 + Math.random() * 0.48),
      vx: 1.2 + Math.random() * 4.6,
      vy: -0.08 - Math.random() * 0.35
    });
  }

  const title = document.createElement("div");
  title.textContent = "SHIELD OF BO NIX";
  title.style.position = "absolute";
  title.style.left = "50%";
  title.style.top = "16%";
  title.style.transform = "translate(-50%,-50%)";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.fontSize = "clamp(22px,4.8vw,52px)";
  title.style.letterSpacing = "5px";
  title.style.color = "#fff2cf";
  title.style.textShadow = "0 0 34px rgba(255,191,98,1)";
  title.style.opacity = "0";
  title.style.transition = "opacity 500ms ease";
  title.style.zIndex = "3";
  overlay.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.textContent = "RIDES THROUGH THE DUNES";
  subtitle.style.position = "absolute";
  subtitle.style.left = "50%";
  subtitle.style.top = "24%";
  subtitle.style.transform = "translate(-50%,-50%)";
  subtitle.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  subtitle.style.fontSize = "clamp(12px,2.2vw,22px)";
  subtitle.style.letterSpacing = "3px";
  subtitle.style.color = "#ffe4b3";
  subtitle.style.textShadow = "0 0 16px rgba(255,182,84,0.9)";
  subtitle.style.opacity = "0";
  subtitle.style.transition = "opacity 500ms ease";
  subtitle.style.zIndex = "3";
  overlay.appendChild(subtitle);

  let running = true;
  function animateDust() {
    if (!running) return;
    dust.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > window.innerWidth + 24) {
        p.x = -30;
        p.y = window.innerHeight * (0.45 + Math.random() * 0.5);
      }
      p.el.style.transform = `translate(${p.x}px,${p.y}px)`;
    });
    requestAnimationFrame(animateDust);
  }
  requestAnimationFrame(animateDust);

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => {
    barTop.style.height = "9%";
    barBottom.style.height = "9%";
    title.style.opacity = "1";
    subtitle.style.opacity = "1";
    desert.style.transform = "scale(1)";
  }, 220);
  cutsceneTimeout(() => {
    speedLines.style.opacity = "0.78";
    horseWrap.style.left = "68%";
    horseWrap.style.transform = "translateX(-50px)";
  }, 480);
  cutsceneTimeout(() => {
    speedLines.style.opacity = "0.25";
    const whiteFlash = document.createElement("div");
    whiteFlash.style.position = "absolute";
    whiteFlash.style.inset = "0";
    whiteFlash.style.background = "#ffe8bf";
    whiteFlash.style.opacity = "0.92";
    whiteFlash.style.transition = "opacity 180ms linear";
    overlay.appendChild(whiteFlash);
    cutsceneTimeout(() => { whiteFlash.style.opacity = "0"; }, 40);
    cutsceneTimeout(() => whiteFlash.remove(), 260);
  }, 1760);
  cutsceneTimeout(() => {
    barTop.style.height = "0";
    barBottom.style.height = "0";
    overlay.style.opacity = "0";
  }, 3150);
  cutsceneTimeout(() => {
    running = false;
    stopTheme();
    overlay.remove();
    cutsceneActive = false;
    invincible = false;
  }, 3800);
}

function consumeShieldHit(source, removeSource) {
  if (cutsceneActive) return true;
  if (Date.now() < shieldImmuneUntil) return true;
  if (!hasShield) return false;
  setShieldActive(false);
  sfx("freeze");
  shieldImmuneUntil = Date.now() + 700;
  if (removeSource && source) source.remove();

  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.left = (x + 30) + "px";
  pulse.style.top = (y + 30) + "px";
  pulse.style.width = "24px";
  pulse.style.height = "24px";
  pulse.style.border = "3px solid rgba(255,160,40,0.95)";
  pulse.style.borderRadius = "50%";
  pulse.style.transform = "translate(-50%,-50%) scale(0.35)";
  pulse.style.opacity = "1";
  pulse.style.pointerEvents = "none";
  pulse.style.zIndex = "13050";
  game.appendChild(pulse);
  let s = 0.35;
  let o = 1;
  function animate() {
    s += 0.18;
    o -= 0.045;
    pulse.style.transform = `translate(-50%,-50%) scale(${s})`;
    pulse.style.opacity = o;
    if (o > 0) requestAnimationFrame(animate);
    else pulse.remove();
  }
  animate();
  return true;
}

function drakePowerActive() {
  return Date.now() < drakePowerUntil;
}

function spawnIceTrail() {
  const now = Date.now();
  const px = x + 30;
  const py = y + 30;
  const last = icePathPoints[icePathPoints.length - 1];
  if (last) {
    const dx = px - last.x;
    const dy = py - last.y;
    if (dx * dx + dy * dy < 36) return;
  }
  icePathPoints.push({ x: px, y: py, t: now });
}

function markIcePathBreak() {
  const now = Date.now();
  const last = icePathPoints[icePathPoints.length - 1];
  if (!last || last.break) return;
  icePathPoints.push({ break: true, t: now });
}

function drawIcePath(now) {
  icePathCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (icePathPoints.length < 2) return;
  icePathCtx.lineJoin = "round";
  icePathCtx.lineCap = "round";
  for (let i = 1; i < icePathPoints.length; i++) {
    const a = icePathPoints[i - 1];
    const b = icePathPoints[i];
    if (!a || !b || a.break || b.break) continue;
    const age = now - b.t;
    const alpha = Math.max(0, 1 - age / 5000);
    if (alpha <= 0) continue;
    icePathCtx.strokeStyle = `rgba(100, 196, 255, ${0.22 * alpha})`;
    icePathCtx.lineWidth = 18;
    icePathCtx.beginPath();
    icePathCtx.moveTo(a.x, a.y);
    icePathCtx.lineTo(b.x, b.y);
    icePathCtx.stroke();
    icePathCtx.strokeStyle = `rgba(157, 224, 255, ${0.42 * alpha})`;
    icePathCtx.lineWidth = 10;
    icePathCtx.beginPath();
    icePathCtx.moveTo(a.x, a.y);
    icePathCtx.lineTo(b.x, b.y);
    icePathCtx.stroke();
    icePathCtx.strokeStyle = `rgba(226, 246, 255, ${0.76 * alpha})`;
    icePathCtx.lineWidth = 4;
    icePathCtx.beginPath();
    icePathCtx.moveTo(a.x, a.y);
    icePathCtx.lineTo(b.x, b.y);
    icePathCtx.stroke();
  }
}

function refreshIceTrails(now) {
  const keepFrom = now - 5000;
  if (icePathPoints.length > 0) {
    let cut = 0;
    while (cut < icePathPoints.length && icePathPoints[cut].t < keepFrom) cut++;
    if (cut > 0) icePathPoints = icePathPoints.slice(cut);
  }
  drawIcePath(now);
}

function drakeCutscene() {
  if (cutsceneActive || gameOver) return;
  sfx("pickup");
  setTheme(startDrakeTheme);
  cutsceneActive = true;
  invincible = true;

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "14600";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 350ms ease";
  overlay.style.overflow = "hidden";
  overlay.style.background = "#071327";
  game.appendChild(overlay);

  const frost = document.createElement("img");
  frost.src = "../assets/images/frost.jpeg";
  frost.onerror = () => { frost.src = "../assets/images/ocean.jpeg"; };
  frost.style.position = "absolute";
  frost.style.inset = "0";
  frost.style.width = "100%";
  frost.style.height = "100%";
  frost.style.objectFit = "cover";
  frost.style.filter = "brightness(0.8) saturate(1.15) contrast(1.08)";
  overlay.appendChild(frost);

  const snow = [];
  for (let i = 0; i < 26; i++) {
    const flake = document.createElement("div");
    const size = 2 + Math.random() * 4;
    flake.style.position = "absolute";
    flake.style.width = size + "px";
    flake.style.height = size + "px";
    flake.style.borderRadius = "50%";
    flake.style.background = "rgba(225,245,255,0.9)";
    flake.style.boxShadow = "0 0 8px rgba(191,233,255,0.75)";
    overlay.appendChild(flake);
    snow.push({
      el: flake,
      x: Math.random() * window.innerWidth,
      y: -Math.random() * window.innerHeight,
      vy: 1 + Math.random() * 2.4,
      drift: (Math.random() - 0.5) * 0.8
    });
  }

  let snowOn = true;
  function animateSnow() {
    if (!snowOn) return;
    snow.forEach(f => {
      f.x += f.drift;
      f.y += f.vy;
      if (f.y > window.innerHeight + 8) {
        f.y = -10;
        f.x = Math.random() * window.innerWidth;
      }
      if (f.x < -8) f.x = window.innerWidth + 4;
      if (f.x > window.innerWidth + 8) f.x = -4;
      f.el.style.transform = `translate(${f.x}px,${f.y}px)`;
    });
    requestAnimationFrame(animateSnow);
  }
  requestAnimationFrame(animateSnow);

  for (let i = 0; i < 6; i++) {
    const pillar = document.createElement("div");
    pillar.style.position = "absolute";
    pillar.style.bottom = "0";
    pillar.style.left = (6 + i * 17) + "%";
    pillar.style.width = (32 + Math.random() * 18) + "px";
    pillar.style.height = (220 + Math.random() * 200) + "px";
    pillar.style.background = "linear-gradient(180deg, rgba(205,244,255,0.88), rgba(84,157,245,0.7), rgba(35,78,170,0.38))";
    pillar.style.borderRadius = "10px 10px 0 0";
    pillar.style.boxShadow = "0 0 18px rgba(125,200,255,0.75)";
    pillar.style.opacity = "0.66";
    overlay.appendChild(pillar);
  }

  for (let i = 0; i < 4; i++) {
    const crack = document.createElement("div");
    crack.style.position = "absolute";
    crack.style.left = (22 + i * 14) + "%";
    crack.style.bottom = "11%";
    crack.style.width = "0px";
    crack.style.height = "4px";
    crack.style.background = "linear-gradient(90deg, rgba(201,238,255,0.95), rgba(132,194,255,0.1))";
    crack.style.boxShadow = "0 0 12px rgba(158,220,255,0.85)";
    crack.style.transform = `rotate(${(-18 + i * 12)}deg)`;
    crack.style.transition = "width 520ms ease";
    overlay.appendChild(crack);
    cutsceneTimeout(() => {
      crack.style.width = (220 + Math.random() * 120) + "px";
      sfx("icecrack");
    }, 260 + i * 120);
  }

  const drake = document.createElement("img");
  drake.src = "../assets/images/drake.jpeg";
  drake.style.position = "absolute";
  drake.style.left = "50%";
  drake.style.top = "67%";
  drake.style.width = "320px";
  drake.style.height = "320px";
  drake.style.objectFit = "cover";
  drake.style.borderRadius = "14px";
  drake.style.transform = "translate(-50%,220px) scale(0.62)";
  drake.style.filter = "drop-shadow(0 0 24px rgba(130,201,255,0.95))";
  drake.style.transition = "transform 950ms cubic-bezier(.2,.82,.2,1)";
  overlay.appendChild(drake);

  const title = document.createElement("div");
  title.textContent = "DRAKE, KING OF FROST";
  title.style.position = "absolute";
  title.style.left = "50%";
  title.style.top = "14%";
  title.style.transform = "translate(-50%,-50%)";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.fontSize = "clamp(18px,3.4vw,42px)";
  title.style.letterSpacing = "4px";
  title.style.color = "#d6f1ff";
  title.style.textShadow = "0 0 20px rgba(124,208,255,0.95)";
  title.style.opacity = "0";
  title.style.transition = "opacity 350ms ease";
  overlay.appendChild(title);

  cutsceneTimeout(() => { overlay.style.opacity = "1"; }, 20);
  cutsceneTimeout(() => {
    title.style.opacity = "1";
    drake.style.transform = "translate(-50%,-50%) scale(1)";
  }, 280);
  cutsceneTimeout(() => { overlay.style.opacity = "0"; }, 2650);
  cutsceneTimeout(() => {
    snowOn = false;
    stopTheme();
    overlay.remove();
    cutsceneActive = false;
    invincible = false;
  }, 3050);
}

function devitoCutscene() {
  if (cutsceneActive || gameOver) return;
  sfx("pickup");
  setTheme(startDevitoTheme);
  cutsceneActive = true;
  invincible = true;

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "radial-gradient(circle at center, rgba(62,18,31,0.72) 0%, rgba(0,0,0,0.94) 65%)";
  overlay.style.backdropFilter = "none";
  overlay.style.zIndex = 10000;
  overlay.style.overflow = "hidden";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 500ms ease";
  game.appendChild(overlay);

  const bloom = document.createElement("div");
  bloom.style.position = "absolute";
  bloom.style.inset = "0";
  bloom.style.background = "radial-gradient(circle at 50% 45%, rgba(255,212,235,0.32), rgba(0,0,0,0) 55%)";
  bloom.style.mixBlendMode = "screen";
  bloom.style.pointerEvents = "none";
  overlay.appendChild(bloom);

  const title = document.createElement("div");
  title.textContent = "DANNY DEVITO // BLOSSOM RONIN";
  title.style.position = "absolute";
  title.style.top = "15%";
  title.style.left = "50%";
  title.style.transform = "translate(-50%,-40px)";
  title.style.color = "#ffd3ec";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.letterSpacing = "5px";
  title.style.fontSize = "20px";
  title.style.textShadow = "0 0 24px rgba(255,161,215,0.9)";
  title.style.opacity = "0";
  title.style.transition = "all 700ms ease";
  title.style.zIndex = 10004;
  overlay.appendChild(title);

  const devito = document.createElement("img");
  devito.src = "../assets/images/devito.jpeg";
  devito.style.width = "340px";
  devito.style.position = "absolute";
  devito.style.left = "50%";
  devito.style.top = "52%";
  devito.style.transform = "translate(-50%,-50%) scale(0.45) rotate(0deg)";
  devito.style.filter = "blur(6px) grayscale(0.4) brightness(0.85) drop-shadow(0 0 0 rgba(255,211,236,0.9))";
  devito.style.imageRendering = "pixelated";
  devito.style.transition = "all 1100ms cubic-bezier(.2,.75,.2,1)";
  devito.style.zIndex = 10003;
  overlay.appendChild(devito);

  const aura = document.createElement("div");
  aura.style.position = "absolute";
  aura.style.left = "50%";
  aura.style.top = "52%";
  aura.style.width = "380px";
  aura.style.height = "380px";
  aura.style.borderRadius = "50%";
  aura.style.transform = "translate(-50%,-50%) scale(0.45)";
  aura.style.background = "radial-gradient(circle, rgba(255,189,227,0.4) 0%, rgba(255,189,227,0) 70%)";
  aura.style.filter = "blur(12px)";
  aura.style.opacity = "0.25";
  aura.style.transition = "all 900ms ease";
  aura.style.zIndex = 10002;
  overlay.appendChild(aura);

  const whiteFlash = document.createElement("div");
  whiteFlash.style.position = "absolute";
  whiteFlash.style.inset = "0";
  whiteFlash.style.background = "#ffe9f5";
  whiteFlash.style.opacity = "0";
  whiteFlash.style.transition = "opacity 160ms ease";
  whiteFlash.style.zIndex = 10050;
  overlay.appendChild(whiteFlash);

  const petals = [];
  for (let i = 0; i < FX_SETTINGS.devitoPetals; i++) {
    const p = document.createElement("div");
    const size = 5 + Math.random() * 14;
    p.style.position = "absolute";
    p.style.width = size + "px";
    p.style.height = (size * 0.6) + "px";
    p.style.borderRadius = "80% 20% 70% 30%";
    p.style.background = i % 3 === 0 ? "#ffc7e4" : "#ff91c6";
    p.style.boxShadow = "0 0 12px rgba(255,165,215,0.6)";
    p.style.opacity = (0.25 + Math.random() * 0.75).toFixed(2);
    overlay.appendChild(p);
    petals.push({
      el: p,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      vx: (Math.random() - 0.5) * 1.8,
      vy: 1.2 + Math.random() * 3.4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 6
    });
  }

  let shake = 0;
  function createSlash(angle, delay) {
    cutsceneTimeout(() => {
      const slash = document.createElement("div");
      slash.style.position = "absolute";
      slash.style.left = "50%";
      slash.style.top = "52%";
      slash.style.width = "12px";
      slash.style.height = "12px";
      slash.style.background = "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,152,214,0.7), rgba(255,255,255,0.95))";
      slash.style.boxShadow = "0 0 45px rgba(255,170,228,1)";
      slash.style.transformOrigin = "center";
      slash.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(0.2,0.35)`;
      slash.style.borderRadius = "999px";
      slash.style.transition = "transform 220ms cubic-bezier(.2,.7,.2,1), opacity 240ms ease";
      slash.style.zIndex = 10040;
      overlay.appendChild(slash);
      requestAnimationFrame(() => {
        slash.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(26,0.36)`;
        slash.style.opacity = "0";
      });
    cutsceneTimeout(() => slash.remove(), 260);
    sfx("slash");
    shake = 10;
    whiteFlash.style.opacity = "0.85";
      cutsceneTimeout(() => {
        whiteFlash.style.opacity = "0";
      }, 70);
    }, delay);
  }

  cutsceneTimeout(() => {
    overlay.style.opacity = "1";
  }, 20);
  cutsceneTimeout(() => {
    title.style.opacity = "1";
    title.style.transform = "translate(-50%,0)";
  }, 350);
  cutsceneTimeout(() => {
    devito.style.transform = "translate(-50%,-50%) scale(1.1) rotate(-8deg)";
    devito.style.filter = "blur(0px) grayscale(0) brightness(1.2) contrast(1.25) saturate(1.4) drop-shadow(0 0 35px rgba(255,219,240,0.95))";
    aura.style.transform = "translate(-50%,-50%) scale(1.45)";
    aura.style.opacity = "0.75";
  }, 900);

  createSlash(-24, 1750);
  createSlash(8, 1900);
  createSlash(34, 2050);
  createSlash(-14, 2200);
  createSlash(18, 2360);

  cutsceneTimeout(() => { smoothEnemyWipe(overlay); }, 2450);

  let last = performance.now();
  function animatePetals(now) {
    if (!cutsceneActive) return;
    const dt = Math.min(32, now - last) / 16;
    last = now;
    petals.forEach(p => {
      p.x += p.vx * dt + Math.sin((now + p.rot * 8) / 380) * 0.9;
      p.y += p.vy * dt;
      p.rot += p.rotV * dt;
      if (p.y > window.innerHeight + 30) {
        p.y = -20 - Math.random() * window.innerHeight * 0.4;
        p.x = Math.random() * window.innerWidth;
      }
      if (p.x < -30) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 30) p.x = -20;
      p.el.style.transform = `translate(${p.x}px,${p.y}px) rotate(${p.rot}deg)`;
    });
    overlay.style.transform = shake > 0 ? `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)` : "translate(0,0)";
    shake *= 0.88;
    requestAnimationFrame(animatePetals);
  }
  requestAnimationFrame(animatePetals);

  cutsceneTimeout(() => {
    title.style.opacity = "0";
    devito.style.opacity = "0";
    aura.style.opacity = "0";
    overlay.style.opacity = "0";
  }, 3300);

  cutsceneTimeout(() => {
    stopTheme();
    cutsceneActive = false;
    invincible = false;
    overlay.remove();
  }, 3900);
}

function kirk() {
  if (cutsceneActive || gameOver) return;
  setTheme(startKirkTheme);
  cutsceneActive = true;
  invincible = true;
  kirkInvincibleUntil = Date.now() + 10000;
  addScore(50);
  speed += 20;
  spdEl.textContent = speed.toFixed(1);

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = 10000;
  overlay.style.overflow = "hidden";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 550ms ease";
  overlay.style.background = "linear-gradient(180deg, rgba(6,11,31,0.9) 0%, rgba(8,16,44,0.92) 55%, rgba(15,23,28,0.92) 100%)";
  game.appendChild(overlay);

  const moon = document.createElement("div");
  moon.style.position = "absolute";
  moon.style.top = "14%";
  moon.style.left = "73%";
  moon.style.width = "230px";
  moon.style.height = "230px";
  moon.style.borderRadius = "50%";
  moon.style.background = "radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(209,228,255,0.92) 45%, rgba(153,186,244,0.72) 70%, rgba(126,158,214,0.4) 100%)";
  moon.style.boxShadow = "0 0 85px rgba(192,224,255,0.9), 0 0 170px rgba(123,169,242,0.65)";
  moon.style.filter = "saturate(1.1)";
  moon.style.zIndex = 10002;
  overlay.appendChild(moon);

  const moonHaze = document.createElement("div");
  moonHaze.style.position = "absolute";
  moonHaze.style.inset = "0";
  moonHaze.style.background = "radial-gradient(circle at 73% 24%, rgba(185,217,255,0.22), rgba(0,0,0,0) 45%)";
  moonHaze.style.mixBlendMode = "screen";
  moonHaze.style.zIndex = 10001;
  overlay.appendChild(moonHaze);

  for (let i = 0; i < 5; i++) {
    const cloud = document.createElement("div");
    cloud.style.position = "absolute";
    cloud.style.width = (240 + Math.random() * 180) + "px";
    cloud.style.height = (56 + Math.random() * 40) + "px";
    cloud.style.top = (70 + Math.random() * 220) + "px";
    cloud.style.left = (-260 + Math.random() * window.innerWidth) + "px";
    cloud.style.borderRadius = "999px";
    cloud.style.background = "linear-gradient(90deg, rgba(88,113,159,0.28), rgba(138,166,214,0.32), rgba(88,113,159,0.24))";
    cloud.style.filter = "blur(9px)";
    cloud.style.opacity = (0.3 + Math.random() * 0.4).toFixed(2);
    cloud.style.zIndex = 10003;
    overlay.appendChild(cloud);
    const drift = 0.15 + Math.random() * 0.35;

    function moveCloud() {
      const xPos = parseFloat(cloud.style.left) + drift;
      cloud.style.left = (xPos > window.innerWidth + 40 ? -300 : xPos) + "px";
      if (cutsceneActive) requestAnimationFrame(moveCloud);
    }
    requestAnimationFrame(moveCloud);
  }

  const fog = document.createElement("div");
  fog.style.position = "absolute";
  fog.style.left = "0";
  fog.style.bottom = "0";
  fog.style.width = "100%";
  fog.style.height = "42%";
  fog.style.background = "linear-gradient(180deg, rgba(110,170,120,0) 0%, rgba(78,160,102,0.2) 35%, rgba(65,141,86,0.4) 65%, rgba(45,94,63,0.7) 100%)";
  fog.style.filter = "blur(3px)";
  fog.style.zIndex = 10006;
  overlay.appendChild(fog);

  const kirkImg = document.createElement("img");
  kirkImg.src = "../assets/images/kirk.jpeg";
  kirkImg.style.position = "absolute";
  kirkImg.style.left = "50%";
  kirkImg.style.top = "56%";
  kirkImg.style.width = "310px";
  kirkImg.style.transform = "translate(-50%,-50%) scale(0.72) rotate(0deg)";
  kirkImg.style.filter = "brightness(0.82) contrast(1.15) hue-rotate(96deg) drop-shadow(0 0 0 rgba(170,255,191,0.8))";
  kirkImg.style.transition = "all 950ms cubic-bezier(.2,.8,.2,1)";
  kirkImg.style.zIndex = 10009;
  overlay.appendChild(kirkImg);

  const title = document.createElement("div");
  title.textContent = "KIRK, MOONLIT NECROMANCER";
  title.style.position = "absolute";
  title.style.top = "12%";
  title.style.left = "50%";
  title.style.transform = "translate(-50%,-20px)";
  title.style.fontFamily = "\"GameFont\", \"Segoe UI\", Tahoma, sans-serif";
  title.style.fontSize = "22px";
  title.style.letterSpacing = "4px";
  title.style.color = "#b9ffd4";
  title.style.textShadow = "0 0 24px rgba(132,255,180,0.95)";
  title.style.opacity = "0";
  title.style.transition = "all 700ms ease";
  title.style.zIndex = 10010;
  overlay.appendChild(title);

  const sigil = document.createElement("div");
  sigil.style.position = "absolute";
  sigil.style.left = "50%";
  sigil.style.top = "66%";
  sigil.style.width = "360px";
  sigil.style.height = "360px";
  sigil.style.borderRadius = "50%";
  sigil.style.border = "2px solid rgba(133,255,184,0.5)";
  sigil.style.boxShadow = "0 0 45px rgba(113,250,166,0.5), inset 0 0 30px rgba(113,250,166,0.35)";
  sigil.style.transform = "translate(-50%,-50%) scale(0.65)";
  sigil.style.opacity = "0.15";
  sigil.style.zIndex = 10008;
  overlay.appendChild(sigil);

  const sigilInner = document.createElement("div");
  sigilInner.style.position = "absolute";
  sigilInner.style.left = "50%";
  sigilInner.style.top = "66%";
  sigilInner.style.width = "230px";
  sigilInner.style.height = "230px";
  sigilInner.style.borderRadius = "50%";
  sigilInner.style.border = "2px dashed rgba(184,255,218,0.52)";
  sigilInner.style.transform = "translate(-50%,-50%)";
  sigilInner.style.opacity = "0.35";
  sigilInner.style.zIndex = 10008;
  overlay.appendChild(sigilInner);

  const undead = [];
  for (let i = 0; i < FX_SETTINGS.kirkUndead; i++) {
    const e = document.createElement("div");
    e.className = "enemy";
    initEnemySpawnGrace(e);
    let ex = 0;
    let ey = 0;
    const side = i % 4;
    if (side === 0) { ex = Math.random() * (window.innerWidth - 60); ey = -40; }
    if (side === 1) { ex = window.innerWidth + 20; ey = Math.random() * (window.innerHeight - 60); }
    if (side === 2) { ex = Math.random() * (window.innerWidth - 60); ey = window.innerHeight + 20; }
    if (side === 3) { ex = -40; ey = Math.random() * (window.innerHeight - 60); }
    e.style.left = ex + "px";
    e.style.top = ey + "px";
    e.style.opacity = "0";
    e.style.transform = "translateY(54px) scale(0.24)";
    e.style.transition = "transform 700ms cubic-bezier(.16,.84,.22,1), opacity 420ms ease, box-shadow 350ms ease";
    e.style.background = "linear-gradient(160deg, #5eff95, #1e6843)";
    e.style.boxShadow = "0 0 24px rgba(126,255,171,0.95)";
    e.style.borderRadius = "7px";
    e.style.zIndex = 9980;
    game.appendChild(e);
    undead.push({ el: e, x: ex, y: ey });

    cutsceneTimeout(() => {
      e.style.opacity = "1";
      e.style.transform = "translateY(0px) scale(1)";
      e.style.boxShadow = "0 0 16px rgba(108,255,160,0.8)";
      for (let j = 0; j < 4; j++) {
        const spark = document.createElement("div");
        spark.style.position = "absolute";
        spark.style.left = ex + 16 + "px";
        spark.style.top = ey + 16 + "px";
        spark.style.width = (2 + Math.random() * 4) + "px";
        spark.style.height = (2 + Math.random() * 4) + "px";
        spark.style.borderRadius = "50%";
        spark.style.background = "#bfffd7";
        spark.style.boxShadow = "0 0 10px rgba(187,255,214,0.95)";
        spark.style.zIndex = 10011;
        overlay.appendChild(spark);
        const ang = Math.random() * Math.PI * 2;
        const vel = 1.8 + Math.random() * 3.2;
        let life = 1;
        let px = 0;
        let py = 0;

        function fly() {
          px += Math.cos(ang) * vel;
          py += Math.sin(ang) * vel - 1.2;
          life -= 0.06;
          spark.style.transform = `translate(${px}px,${py}px)`;
          spark.style.opacity = life;
          if (life > 0) requestAnimationFrame(fly);
          else spark.remove();
        }
        fly();
      }
    }, 350 + Math.random() * 950);
  }

  let glowPulse = 0;
  function animateNecro() {
    if (!cutsceneActive) return;
    glowPulse += 0.03;
    sigil.style.transform = `translate(-50%,-50%) scale(${0.95 + Math.sin(glowPulse) * 0.06}) rotate(${glowPulse * 20}deg)`;
    sigil.style.opacity = (0.16 + Math.sin(glowPulse * 2) * 0.09).toFixed(3);
    sigilInner.style.transform = `translate(-50%,-50%) rotate(${-glowPulse * 36}deg) scale(${1 + Math.cos(glowPulse * 1.4) * 0.05})`;
    kirkImg.style.transform = `translate(-50%,-50%) scale(${1.03 + Math.sin(glowPulse * 1.6) * 0.025}) rotate(${Math.sin(glowPulse * 1.1) * 2}deg)`;
    requestAnimationFrame(animateNecro);
  }
  requestAnimationFrame(animateNecro);

  cutsceneTimeout(() => {
    overlay.style.opacity = "1";
  }, 20);
  cutsceneTimeout(() => {
    title.style.opacity = "1";
    title.style.transform = "translate(-50%,0)";
    kirkImg.style.transform = "translate(-50%,-50%) scale(1.06) rotate(-1.5deg)";
    kirkImg.style.filter = "brightness(1.06) contrast(1.2) hue-rotate(104deg) drop-shadow(0 0 28px rgba(165,255,195,0.96))";
    sigil.style.opacity = "0.3";
  }, 420);

  cutsceneTimeout(() => {
    overlay.style.opacity = "0";
  }, 4300);

  cutsceneTimeout(() => {
    stopTheme();
    overlay.remove();
    undead.forEach(obj => {
      obj.el.style.zIndex = "";
      obj.el.style.background = "";
      obj.el.style.borderRadius = "6px";
      obj.el.style.transition = "";
      obj.el.style.transform = "";
      obj.el.style.opacity = "1";
    });
    cutsceneActive = false;
    invincible = false;
  }, 4900);
}
