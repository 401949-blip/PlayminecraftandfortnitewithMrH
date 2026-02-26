export function runDevitoCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector, effects, addScore } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.sfx("pickup");
  audio.setTheme(() => audio.startDevitoTheme());
  const seq = cutsceneDirector.beginCutscene();

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "radial-gradient(circle at center, rgba(62,18,31,0.72) 0%, rgba(0,0,0,0.94) 65%)";
  overlay.style.zIndex = "14650";
  overlay.style.overflow = "hidden";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 500ms ease";
  refs.game.appendChild(overlay);

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
  title.style.zIndex = "10004";
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
  devito.style.zIndex = "10003";
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
  aura.style.zIndex = "10002";
  overlay.appendChild(aura);

  const whiteFlash = document.createElement("div");
  whiteFlash.style.position = "absolute";
  whiteFlash.style.inset = "0";
  whiteFlash.style.background = "#ffe9f5";
  whiteFlash.style.opacity = "0";
  whiteFlash.style.transition = "opacity 160ms ease";
  whiteFlash.style.zIndex = "10050";
  overlay.appendChild(whiteFlash);

  const petals = [];
  for (let i = 0; i < 52; i++) {
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
  const createSlash = (angle, delay) => {
    cutsceneDirector.timeout(() => {
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
      slash.style.zIndex = "10040";
      overlay.appendChild(slash);
      requestAnimationFrame(() => {
        slash.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(26,0.36)`;
        slash.style.opacity = "0";
      });
      cutsceneDirector.timeout(() => slash.remove(), 260, seq);
      audio.sfx("slash");
      shake = 10;
      whiteFlash.style.opacity = "0.85";
      cutsceneDirector.timeout(() => {
        whiteFlash.style.opacity = "0";
      }, 70, seq);
    }, delay, seq);
  };

  cutsceneDirector.timeout(() => {
    overlay.style.opacity = "1";
  }, 20, seq);
  cutsceneDirector.timeout(() => {
    title.style.opacity = "1";
    title.style.transform = "translate(-50%,0)";
  }, 350, seq);
  cutsceneDirector.timeout(() => {
    devito.style.transform = "translate(-50%,-50%) scale(1.1) rotate(-8deg)";
    devito.style.filter = "blur(0px) grayscale(0) brightness(1.2) contrast(1.25) saturate(1.4) drop-shadow(0 0 35px rgba(255,219,240,0.95))";
    aura.style.transform = "translate(-50%,-50%) scale(1.45)";
    aura.style.opacity = "0.75";
  }, 900, seq);

  createSlash(-24, 1750);
  createSlash(8, 1900);
  createSlash(34, 2050);
  createSlash(-14, 2200);
  createSlash(18, 2360);

  cutsceneDirector.timeout(() => {
    const wiped = effects.smoothEnemyWipe(overlay) || 0;
    if (wiped > 0) addScore(wiped);
  }, 2450, seq);

  let last = performance.now();
  const animatePetals = (now) => {
    if (seq !== cutsceneDirector.currentSequence() || !store.cutsceneActive) return;
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
  };
  requestAnimationFrame(animatePetals);

  cutsceneDirector.timeout(() => {
    title.style.opacity = "0";
    devito.style.opacity = "0";
    aura.style.opacity = "0";
    overlay.style.opacity = "0";
  }, 3300, seq);

  cutsceneDirector.timeout(() => {
    audio.stopTheme();
    cutsceneDirector.endCutscene();
    overlay.remove();
  }, 3900, seq);
}
