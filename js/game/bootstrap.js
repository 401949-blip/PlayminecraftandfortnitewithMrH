const startMenu = document.getElementById("startMenu");
const startGameBtn = document.getElementById("startGameBtn");
const pauseMenu = document.getElementById("pauseMenu");
const resumeGameBtn = document.getElementById("resumeGameBtn");
const exitMenuBtn = document.getElementById("exitMenuBtn");
let transitioningMenu = false;

function showOverlayWithAnimation(overlayEl) {
  overlayEl.classList.remove("hidden");
  overlayEl.classList.remove("exiting");
  overlayEl.classList.add("entering");
  setTimeout(() => {
    overlayEl.classList.remove("entering");
  }, 320);
}

function hideOverlayWithAnimation(overlayEl, done) {
  overlayEl.classList.remove("entering");
  overlayEl.classList.add("exiting");
  setTimeout(() => {
    overlayEl.classList.remove("exiting");
    overlayEl.classList.add("hidden");
    if (done) done();
  }, 240);
}

function showStartMenu() {
  menuOpen = true;
  paused = false;
  game.style.display = "block";
  game.classList.add("menu-mode");
  game.classList.remove("paused-mode");
  game.classList.remove("starting-game");
  game.classList.remove("exiting-to-home");
  showOverlayWithAnimation(startMenu);
  pauseMenu.classList.add("hidden");
  startMenu.setAttribute("aria-hidden", "false");
  pauseMenu.setAttribute("aria-hidden", "true");
  updateHighScoreUI();
}

function exitToMainMenu() {
  if (transitioningMenu) return;
  transitioningMenu = true;
  paused = true;

  const finalizeToGameMenu = () => {
    if (gameOver && pendingBackgroundReroll) {
      applyRandomStageBackground();
      pendingBackgroundReroll = false;
    }
    resetState();
    gameStarted = false;
    menuOpen = true;
    paused = false;
    game.classList.remove("paused-mode");
    game.classList.remove("starting-game");
    game.classList.remove("exiting-to-home");
    pauseMenu.classList.add("hidden");
    pauseMenu.setAttribute("aria-hidden", "true");
    showStartMenu();
    transitioningMenu = false;
  };

  game.classList.add("exiting-to-home");
  if (!pauseMenu.classList.contains("hidden")) {
    hideOverlayWithAnimation(pauseMenu, finalizeToGameMenu);
    return;
  }
  setTimeout(finalizeToGameMenu, 200);
}

function setPaused(nextPaused) {
  if (!gameStarted || gameOver || menuOpen || transitioningMenu) return;
  paused = nextPaused;
  if (paused) {
    showOverlayWithAnimation(pauseMenu);
    pauseMenu.setAttribute("aria-hidden", "false");
    game.classList.add("paused-mode");
  } else {
    hideOverlayWithAnimation(pauseMenu, () => {
      pauseMenu.setAttribute("aria-hidden", "true");
      game.classList.remove("paused-mode");
      game.focus();
    });
  }
}

function startGame() {
  if (gameStarted || transitioningMenu) return;
  transitioningMenu = true;
  hideOverlayWithAnimation(startMenu, () => {
    gameStarted = true;
    menuOpen = false;
    paused = false;
    if (startScreen) startScreen.style.display = "none";
    game.style.display = "block";
    game.classList.remove("menu-mode");
    game.classList.remove("paused-mode");
    game.classList.add("starting-game");
    startMenu.setAttribute("aria-hidden", "true");
    pauseMenu.setAttribute("aria-hidden", "true");
    resetState();
    spawn("orb");
    startTimers();
    game.focus();
    startLoop();
    setTimeout(() => {
      game.classList.remove("starting-game");
      transitioningMenu = false;
    }, 360);
  });
}

document.addEventListener("keydown", e => {
  ensureAudio();
  if (e.key === "Escape") {
    e.preventDefault();
    if (!menuOpen && gameStarted && !gameOver) setPaused(!paused);
    return;
  }
  if (paused || menuOpen) return;
  keys[e.key] = true;
  if (e.code === "Space") {
    e.preventDefault();
    parryNearestJackOrb();
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

playBtn.addEventListener("click", restartGame);
deathExitBtn.addEventListener("click", exitToMainMenu);
document.addEventListener("pointerdown", ensureAudio, { once: true });
startGameBtn.addEventListener("click", startGame);
resumeGameBtn.addEventListener("click", () => setPaused(false));
exitMenuBtn.addEventListener("click", exitToMainMenu);

applyRandomStageBackground();
loadHighScoreFromCookie();
updateHighScoreUI();

if (startO) {
  startO.addEventListener("click", () => {
    startGame();
  });
} else {
  showStartMenu();
}

window.addEventListener("resize", () => {
  resizeIceCanvas();
  drawIcePath(Date.now());
});

resizeIceCanvas();
