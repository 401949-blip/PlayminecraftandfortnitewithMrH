export class AudioService {
  constructor() {
    this.audioCtx = null;
    this.audioReady = false;
    this.activeThemeStop = null;
  }

  ensureAudio() {
    if (this.audioReady) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.audioCtx = new Ctx();
      this.audioReady = true;
    } catch (_) {
      // Ignore unsupported contexts.
    }
  }

  playTone(freq, duration, type, vol, attackMs, releaseMs) {
    if (!this.audioCtx) return;
    const t0 = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + (attackMs || 14) / 1000);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (duration - (releaseMs || 40)) / 1000);
    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration / 1000);
  }

  sfx(name) {
    this.ensureAudio();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();

    if (name === "orb") { this.playTone(820, 70, "triangle", 0.025, 6, 20); return; }
    if (name === "pickup") { this.playTone(520, 90, "square", 0.03, 8, 24); this.playTone(790, 120, "triangle", 0.02, 10, 28); return; }
    if (name === "boss") { this.playTone(130, 260, "sawtooth", 0.05, 16, 50); this.playTone(98, 300, "sine", 0.03, 20, 70); return; }
    if (name === "slash") { this.playTone(1200, 90, "square", 0.02, 4, 20); return; }
    if (name === "freeze") { this.playTone(420, 130, "triangle", 0.025, 10, 35); this.playTone(270, 150, "sine", 0.02, 10, 40); return; }
    if (name === "shatter") { this.playTone(1600, 60, "triangle", 0.02, 5, 20); this.playTone(980, 90, "square", 0.018, 5, 24); return; }
    if (name === "icecrack") { this.playTone(220, 90, "sawtooth", 0.022, 6, 20); this.playTone(1100, 55, "triangle", 0.014, 3, 18); return; }
    if (name === "death") { this.playTone(190, 220, "sawtooth", 0.05, 8, 50); this.playTone(118, 280, "sine", 0.03, 10, 70); return; }
    if (name === "ui") { this.playTone(640, 80, "triangle", 0.02, 6, 22); return; }
  }

  stopTheme() {
    if (!this.activeThemeStop) return;
    this.activeThemeStop();
    this.activeThemeStop = null;
  }

  setTheme(starter) {
    this.stopTheme();
    this.activeThemeStop = starter ? starter() : null;
  }

  createThemeInterval(stepMs, tick) {
    this.ensureAudio();
    if (!this.audioCtx) return () => {};
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    const id = setInterval(tick, stepMs);
    tick();
    return () => clearInterval(id);
  }

  startDevitoTheme() {
    let idx = 0;
    const notes = [659, 784, 880, 988, 880, 784, 698, 880];
    const stopMain = this.createThemeInterval(170, () => {
      const n = notes[idx % notes.length];
      idx += 1;
      this.playTone(n, 130, "triangle", 0.016, 7, 26);
      if (idx % 4 === 0) this.playTone(n / 2, 140, "sine", 0.01, 8, 34);
    });
    return () => stopMain();
  }

  startKirkTheme() {
    let phase = 0;
    const stopBase = this.createThemeInterval(420, () => {
      this.playTone(82 + Math.sin(phase * 0.6) * 6, 260, "sawtooth", 0.02, 8, 60);
      phase += 1;
    });
    const stopSting = this.createThemeInterval(980, () => {
      const f = Math.random() < 0.5 ? 311 : 277;
      this.playTone(f, 140, "triangle", 0.013, 7, 30);
      this.playTone(f / 2, 180, "sine", 0.01, 8, 38);
    });
    return () => {
      stopBase();
      stopSting();
    };
  }

  startBoNixTheme() {
    let tick = 0;
    const stopMain = this.createThemeInterval(210, () => {
      const root = 196;
      if (tick % 4 === 0) this.playTone(root, 150, "square", 0.014, 8, 24);
      else if (tick % 4 === 1) this.playTone(root * 1.5, 120, "triangle", 0.012, 8, 22);
      else if (tick % 4 === 2) this.playTone(root * 1.25, 120, "triangle", 0.011, 8, 22);
      else this.playTone(root * 1.5, 140, "square", 0.012, 8, 26);
      tick += 1;
    });
    return () => stopMain();
  }

  startDrakeTheme() {
    let step = 0;
    const stopPad = this.createThemeInterval(240, () => {
      const n = 220 + Math.sin(step * 0.35) * 35;
      this.playTone(n, 220, "triangle", 0.011, 12, 50);
      if (step % 3 === 0) this.playTone(n * 1.5, 120, "sine", 0.008, 8, 24);
      step += 1;
    });
    const stopCrack = this.createThemeInterval(760, () => {
      if (Math.random() < 0.7) this.sfx("icecrack");
    });
    return () => {
      stopPad();
      stopCrack();
    };
  }
}
