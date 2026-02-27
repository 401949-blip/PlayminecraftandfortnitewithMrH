export function runKirkCutscene(ctx) {
  const { store, refs, audio, cutsceneDirector, spawnSystem, addScore, clock } = ctx;
  if (store.cutsceneActive || store.gameOver) return;

  audio.setTheme(() => audio.startKirkTheme());
  const seq = cutsceneDirector.beginCutscene();

  store.kirkInvincibleUntil = clock.nowMs() + 10000;
  addScore(50);
  store.speed += 20;
  refs.spdEl.textContent = store.speed.toFixed(1);

  const overlay = document.createElement("div");
  overlay.className = "cutscene-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "14700";
  overlay.style.overflow = "hidden";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 550ms ease";
  overlay.style.background = "linear-gradient(180deg, rgba(6,11,31,0.9) 0%, rgba(8,16,44,0.92) 55%, rgba(15,23,28,0.92) 100%)";
  refs.game.appendChild(overlay);

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
  moon.style.zIndex = "10002";
  overlay.appendChild(moon);

  const moonHaze = document.createElement("div");
  moonHaze.style.position = "absolute";
  moonHaze.style.inset = "0";
  moonHaze.style.background = "radial-gradient(circle at 73% 24%, rgba(185,217,255,0.22), rgba(0,0,0,0) 45%)";
  moonHaze.style.mixBlendMode = "screen";
  moonHaze.style.zIndex = "10001";
  overlay.appendChild(moonHaze);

  const clouds = [];
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
    cloud.style.zIndex = "10003";
    overlay.appendChild(cloud);
    clouds.push({ el: cloud, drift: 0.15 + Math.random() * 0.35 });
  }

  const fog = document.createElement("div");
  fog.style.position = "absolute";
  fog.style.left = "0";
  fog.style.bottom = "0";
  fog.style.width = "100%";
  fog.style.height = "42%";
  fog.style.background = "linear-gradient(180deg, rgba(110,170,120,0) 0%, rgba(78,160,102,0.2) 35%, rgba(65,141,86,0.4) 65%, rgba(45,94,63,0.7) 100%)";
  fog.style.filter = "blur(3px)";
  fog.style.zIndex = "10006";
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
  kirkImg.style.zIndex = "10009";
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
  title.style.zIndex = "10010";
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
  sigil.style.zIndex = "10008";
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
  sigilInner.style.zIndex = "10008";
  overlay.appendChild(sigilInner);

  const undead = [];
  for (let i = 0; i < 40; i++) {
    const e = document.createElement("div");
    e.className = "enemy";
    spawnSystem.initEnemySpawnGrace(e);
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
    e.style.zIndex = "9980";
    refs.game.appendChild(e);
    undead.push(e);

    cutsceneDirector.timeout(() => {
      if (seq !== cutsceneDirector.currentSequence() || !store.cutsceneActive) return;
      e.style.opacity = "1";
      e.style.transform = "translateY(0px) scale(1)";
      e.style.boxShadow = "0 0 16px rgba(108,255,160,0.8)";

      for (let j = 0; j < 4; j++) {
        const spark = document.createElement("div");
        spark.style.position = "absolute";
        spark.style.left = (ex + 16) + "px";
        spark.style.top = (ey + 16) + "px";
        spark.style.width = (2 + Math.random() * 4) + "px";
        spark.style.height = (2 + Math.random() * 4) + "px";
        spark.style.borderRadius = "50%";
        spark.style.background = "#bfffd7";
        spark.style.boxShadow = "0 0 10px rgba(187,255,214,0.95)";
        spark.style.zIndex = "10011";
        overlay.appendChild(spark);

        const ang = Math.random() * Math.PI * 2;
        const vel = 1.8 + Math.random() * 3.2;
        let life = 1;
        let px = 0;
        let py = 0;

        const fly = () => {
          if (seq !== cutsceneDirector.currentSequence() || !store.cutsceneActive) {
            spark.remove();
            return;
          }
          px += Math.cos(ang) * vel;
          py += Math.sin(ang) * vel - 1.2;
          life -= 0.06;
          spark.style.transform = `translate(${px}px,${py}px)`;
          spark.style.opacity = String(Math.max(0, life));
          if (life > 0) requestAnimationFrame(fly);
          else spark.remove();
        };
        fly();
      }
    }, 350 + Math.random() * 950, seq);
  }

  let glowPulse = 0;
  const animateNecro = () => {
    if (seq !== cutsceneDirector.currentSequence() || !store.cutsceneActive) return;

    glowPulse += 0.03;
    sigil.style.transform = `translate(-50%,-50%) scale(${0.95 + Math.sin(glowPulse) * 0.06}) rotate(${glowPulse * 20}deg)`;
    sigil.style.opacity = (0.16 + Math.sin(glowPulse * 2) * 0.09).toFixed(3);
    sigilInner.style.transform = `translate(-50%,-50%) rotate(${-glowPulse * 36}deg) scale(${1 + Math.cos(glowPulse * 1.4) * 0.05})`;
    kirkImg.style.transform = `translate(-50%,-50%) scale(${1.03 + Math.sin(glowPulse * 1.6) * 0.025}) rotate(${Math.sin(glowPulse * 1.1) * 2}deg)`;
    clouds.forEach((cloud) => {
      const xPos = parseFloat(cloud.el.style.left) + cloud.drift;
      cloud.el.style.left = (xPos > window.innerWidth + 40 ? -300 : xPos) + "px";
    });

    requestAnimationFrame(animateNecro);
  };
  requestAnimationFrame(animateNecro);

  cutsceneDirector.timeout(() => {
    overlay.style.opacity = "1";
  }, 20, seq);

  cutsceneDirector.timeout(() => {
    title.style.opacity = "1";
    title.style.transform = "translate(-50%,0)";
    kirkImg.style.transform = "translate(-50%,-50%) scale(1.06) rotate(-1.5deg)";
    kirkImg.style.filter = "brightness(1.06) contrast(1.2) hue-rotate(104deg) drop-shadow(0 0 28px rgba(165,255,195,0.96))";
    sigil.style.opacity = "0.3";
  }, 420, seq);

  cutsceneDirector.timeout(() => {
    overlay.style.opacity = "0";
  }, 4300, seq);

  cutsceneDirector.timeout(() => {
    if (seq !== cutsceneDirector.currentSequence()) return;
    audio.stopTheme();
    overlay.remove();
    undead.forEach((e) => {
      if (!e.isConnected) return;
      e.style.zIndex = "";
      e.style.background = "";
      e.style.borderRadius = "6px";
      e.style.transition = "";
      e.style.transform = "";
      e.style.opacity = "1";
    });
    cutsceneDirector.endCutscene();
  }, 4900, seq);
}
