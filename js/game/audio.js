function ensureAudio() {
  if (audioReady) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    audioReady = true;
  } catch (_) {}
}

function playTone(freq, duration, type, vol, attackMs, releaseMs) {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + (attackMs || 14) / 1000);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (duration - (releaseMs || 40)) / 1000);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration / 1000);
}

function sfx(name) {
  ensureAudio();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (name === "orb") { playTone(820, 70, "triangle", 0.025, 6, 20); return; }
  if (name === "pickup") { playTone(520, 90, "square", 0.03, 8, 24); playTone(790, 120, "triangle", 0.02, 10, 28); return; }
  if (name === "boss") { playTone(130, 260, "sawtooth", 0.05, 16, 50); playTone(98, 300, "sine", 0.03, 20, 70); return; }
  if (name === "slash") { playTone(1200, 90, "square", 0.02, 4, 20); return; }
  if (name === "freeze") { playTone(420, 130, "triangle", 0.025, 10, 35); playTone(270, 150, "sine", 0.02, 10, 40); return; }
  if (name === "shatter") { playTone(1600, 60, "triangle", 0.02, 5, 20); playTone(980, 90, "square", 0.018, 5, 24); return; }
  if (name === "icecrack") { playTone(220, 90, "sawtooth", 0.022, 6, 20); playTone(1100, 55, "triangle", 0.014, 3, 18); return; }
  if (name === "death") { playTone(190, 220, "sawtooth", 0.05, 8, 50); playTone(118, 280, "sine", 0.03, 10, 70); return; }
  if (name === "ui") { playTone(640, 80, "triangle", 0.02, 6, 22); return; }
}

function stopTheme() {
  if (!activeThemeStop) return;
  activeThemeStop();
  activeThemeStop = null;
}

function setTheme(starter) {
  stopTheme();
  activeThemeStop = starter ? starter() : null;
}

function createThemeInterval(stepMs, tick) {
  ensureAudio();
  if (!audioCtx) return () => {};
  if (audioCtx.state === "suspended") audioCtx.resume();
  const id = setInterval(tick, stepMs);
  tick();
  return () => clearInterval(id);
}

function startDevitoTheme() {
  let idx = 0;
  const notes = [659, 784, 880, 988, 880, 784, 698, 880];
  const stopMain = createThemeInterval(170, () => {
    const n = notes[idx % notes.length];
    idx++;
    playTone(n, 130, "triangle", 0.016, 7, 26);
    if (idx % 4 === 0) playTone(n / 2, 140, "sine", 0.01, 8, 34);
  });
  return () => stopMain();
}

function startKirkTheme() {
  let phase = 0;
  const stopBase = createThemeInterval(420, () => {
    playTone(82 + Math.sin(phase * 0.6) * 6, 260, "sawtooth", 0.02, 8, 60);
    phase++;
  });
  const stopSting = createThemeInterval(980, () => {
    const f = Math.random() < 0.5 ? 311 : 277;
    playTone(f, 140, "triangle", 0.013, 7, 30);
    playTone(f / 2, 180, "sine", 0.01, 8, 38);
  });
  return () => {
    stopBase();
    stopSting();
  };
}

function startBoNixTheme() {
  let tick = 0;
  const stopMain = createThemeInterval(210, () => {
    const root = 196;
    if (tick % 4 === 0) playTone(root, 150, "square", 0.014, 8, 24);
    else if (tick % 4 === 1) playTone(root * 1.5, 120, "triangle", 0.012, 8, 22);
    else if (tick % 4 === 2) playTone(root * 1.25, 120, "triangle", 0.011, 8, 22);
    else playTone(root * 1.5, 140, "square", 0.012, 8, 26);
    tick++;
  });
  return () => stopMain();
}

function startDrakeTheme() {
  let step = 0;
  const stopPad = createThemeInterval(240, () => {
    const n = 220 + Math.sin(step * 0.35) * 35;
    playTone(n, 220, "triangle", 0.011, 12, 50);
    if (step % 3 === 0) playTone(n * 1.5, 120, "sine", 0.008, 8, 24);
    step++;
  });
  const stopCrack = createThemeInterval(760, () => {
    if (Math.random() < 0.7) sfx("icecrack");
  });
  return () => {
    stopPad();
    stopCrack();
  };
}

