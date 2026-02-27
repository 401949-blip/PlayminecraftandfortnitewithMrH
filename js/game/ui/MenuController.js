export class MenuController {
  constructor({ store, refs, onStartGame, onRestartGame, onExitToMainMenu, onTogglePause, onPauseChange, onSecretCode, clock, audio, highScoreService }) {
    this.store = store;
    this.refs = refs;
    this.onStartGame = onStartGame;
    this.onRestartGame = onRestartGame;
    this.onExitToMainMenu = onExitToMainMenu;
    this.onTogglePause = onTogglePause;
    this.onPauseChange = onPauseChange || null;
    this.onSecretCode = onSecretCode || null;
    this.clock = clock;
    this.audio = audio;
    this.highScoreService = highScoreService;
    this.secretBuffer = "";
    this.secretBufferAt = 0;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  pushSecretKey(key) {
    const upperKey = String(key || "").toUpperCase();
    if (!/^[A-Z]$/.test(upperKey)) return;

    const now = performance.now();
    if (now - this.secretBufferAt > 1400) {
      this.secretBuffer = "";
    }
    this.secretBufferAt = now;
    this.secretBuffer = (this.secretBuffer + upperKey).slice(-12);

    if (this.secretBuffer.endsWith("FLTN")) {
      this.secretBuffer = "";
      this.onSecretCode?.("FLTN");
    }
  }

  showOverlayWithAnimation(overlayEl) {
    overlayEl.classList.remove("hidden");
    overlayEl.classList.remove("exiting");
    overlayEl.classList.add("entering");
    setTimeout(() => {
      overlayEl.classList.remove("entering");
    }, 320);
  }

  hideOverlayWithAnimation(overlayEl, done) {
    overlayEl.classList.remove("entering");
    overlayEl.classList.add("exiting");
    setTimeout(() => {
      overlayEl.classList.remove("exiting");
      overlayEl.classList.add("hidden");
      if (done) done();
    }, 240);
  }

  showStartMenu() {
    const s = this.store;
    const r = this.refs;
    s.menuOpen = true;
    s.paused = false;
    r.game.style.display = "block";
    r.game.classList.add("menu-mode");
    r.game.classList.remove("paused-mode", "starting-game", "exiting-to-home");
    this.showOverlayWithAnimation(r.startMenu);
    r.pauseMenu.classList.add("hidden");
    r.startMenu.setAttribute("aria-hidden", "false");
    r.pauseMenu.setAttribute("aria-hidden", "true");
    this.highScoreService.updateUI();
  }

  hideStartMenuAndStart(onDone) {
    const s = this.store;
    const r = this.refs;
    if (s.gameStarted || s.transitioningMenu) return;
    s.transitioningMenu = true;

    this.hideOverlayWithAnimation(r.startMenu, () => {
      s.gameStarted = true;
      s.menuOpen = false;
      s.paused = false;
      if (r.startScreen) r.startScreen.style.display = "none";
      r.game.style.display = "block";
      r.game.classList.remove("menu-mode", "paused-mode");
      r.game.classList.add("starting-game");
      r.startMenu.setAttribute("aria-hidden", "true");
      r.pauseMenu.setAttribute("aria-hidden", "true");
      onDone();
      setTimeout(() => {
        r.game.classList.remove("starting-game");
        s.transitioningMenu = false;
      }, 360);
    });
  }

  setPaused(nextPaused) {
    const s = this.store;
    const r = this.refs;
    if (!s.gameStarted || s.gameOver || s.menuOpen || s.transitioningMenu) return;
    if (nextPaused) {
      this.clock.pause();
      if (this.onPauseChange) this.onPauseChange(true);
      this.showOverlayWithAnimation(r.pauseMenu);
      r.pauseMenu.setAttribute("aria-hidden", "false");
      r.game.classList.add("paused-mode");
    } else {
      this.clock.resume();
      this.hideOverlayWithAnimation(r.pauseMenu, () => {
        if (this.onPauseChange) this.onPauseChange(false);
        r.pauseMenu.setAttribute("aria-hidden", "true");
        r.game.classList.remove("paused-mode");
        r.game.focus();
      });
    }
  }

  exitToMainMenu(finalizeFn) {
    const s = this.store;
    const r = this.refs;
    if (s.transitioningMenu) return;
    s.transitioningMenu = true;
    s.paused = true;

    const done = () => {
      finalizeFn();
      s.gameStarted = false;
      s.menuOpen = true;
      s.paused = false;
      r.game.classList.remove("paused-mode", "starting-game", "exiting-to-home");
      r.pauseMenu.classList.add("hidden");
      r.pauseMenu.setAttribute("aria-hidden", "true");
      this.showStartMenu();
      s.transitioningMenu = false;
    };

    r.game.classList.add("exiting-to-home");
    if (!r.pauseMenu.classList.contains("hidden")) {
      this.hideOverlayWithAnimation(r.pauseMenu, done);
      return;
    }
    setTimeout(done, 200);
  }

  handleKeyDown(e) {
    const s = this.store;
    this.audio.ensureAudio();
    if (e.key === "Escape") {
      e.preventDefault();
      if (!s.menuOpen && s.gameStarted && !s.gameOver) this.onTogglePause();
      return;
    }
    if (s.paused || s.menuOpen) return;
    this.pushSecretKey(e.key);
    s.keys[e.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    this.store.keys[e.key] = false;
  }

  bind() {
    const r = this.refs;
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);

    r.playBtn.addEventListener("click", () => this.onRestartGame());
    r.deathExitBtn.addEventListener("click", () => this.onExitToMainMenu());
    document.addEventListener("pointerdown", () => this.audio.ensureAudio(), { once: true });
    r.startGameBtn.addEventListener("click", () => this.onStartGame());
    r.resumeGameBtn.addEventListener("click", () => this.setPaused(false));
    r.exitMenuBtn.addEventListener("click", () => this.onExitToMainMenu());

    if (r.startO) {
      r.startO.addEventListener("click", () => this.onStartGame());
    }
  }
}
