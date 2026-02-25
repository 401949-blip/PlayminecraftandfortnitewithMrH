export function createDomRefs() {
  const refs = {
    startScreen: document.getElementById("start"),
    startO: document.getElementById("startO"),
    game: document.getElementById("game"),
    player: document.getElementById("player"),
    icePathCanvas: document.getElementById("icePathCanvas"),
    scoreEl: document.getElementById("score"),
    spdEl: document.getElementById("spd"),
    timeEl: document.getElementById("timeSurvived"),
    shieldRing: document.getElementById("shieldRing"),
    kirkShieldRing: document.getElementById("kirkShieldRing"),
    playBtn: document.getElementById("playAgain"),
    deathExitBtn: document.getElementById("deathExitMenu"),
    deathScoreEl: document.getElementById("deathScore"),
    deathTimeEl: document.getElementById("deathTime"),
    deathScreenEl: document.getElementById("deathScreen"),
    confettiLayer: document.getElementById("confettiLayer"),
    menuHighScoreValueEl: document.getElementById("menuHighScoreValue"),
    deathHighScoreValueEl: document.getElementById("deathHighScoreValue"),
    newHighScoreTextEl: document.getElementById("newHighScoreText"),
    bossUI: document.getElementById("bossUI"),
    bossFill: document.getElementById("bossFill"),
    bossHpText: document.getElementById("bossHpText"),
    bossAmbience: document.getElementById("bossAmbience"),
    hudTop: document.getElementById("hudTop"),
    startMenu: document.getElementById("startMenu"),
    startGameBtn: document.getElementById("startGameBtn"),
    pauseMenu: document.getElementById("pauseMenu"),
    resumeGameBtn: document.getElementById("resumeGameBtn"),
    exitMenuBtn: document.getElementById("exitMenuBtn")
  };

  refs.icePathCtx = refs.icePathCanvas ? refs.icePathCanvas.getContext("2d") : null;
  return refs;
}
