import { formatTime } from "../core/time.js";

export class UISystem {
  constructor({ store, refs, effects, highScoreService }) {
    this.store = store;
    this.refs = refs;
    this.effects = effects;
    this.highScoreService = highScoreService;
  }

  resetRunUI() {
    const s = this.store;
    const r = this.refs;

    r.scoreEl.textContent = String(s.score);
    r.spdEl.textContent = s.speed.toFixed(1);
    r.timeEl.textContent = "00:00";

    r.player.style.opacity = "1";
    r.player.style.left = s.x + "px";
    r.player.style.top = s.y + "px";

    r.shieldRing.style.display = "none";
    r.kirkShieldRing.style.display = "none";

    r.playBtn.classList.remove("show");
    r.deathExitBtn.classList.remove("show");
    r.deathScoreEl.classList.remove("show", "new-record");
    r.deathTimeEl.classList.remove("show");
    r.deathScreenEl.classList.remove("show");
    r.deathScreenEl.setAttribute("aria-hidden", "true");
    r.deathScoreEl.textContent = "";
    r.deathTimeEl.textContent = "";

    r.newHighScoreTextEl.classList.remove("show");
    this.effects.clearHighScoreCelebration();

    this.highScoreService.updateUI();

    r.game.classList.remove("death-mode");
    r.bossUI.style.display = "none";
    r.bossFill.style.width = "100%";
    r.bossHpText.textContent = "100%";
    r.bossAmbience.style.display = "none";
    r.game.classList.remove("boss-mode");
  }

  updateRunTime() {
    this.refs.timeEl.textContent = formatTime(this.store.getRunElapsedMs());
  }

  addScore(points) {
    const gain = Math.max(0, points | 0);
    if (gain <= 0) return;
    this.store.score += gain;
    this.refs.scoreEl.textContent = String(this.store.score);
    const top = this.refs.hudTop || this.refs.scoreEl.parentElement;
    if (top) {
      top.classList.remove("score-pop");
      void top.offsetWidth;
      top.classList.add("score-pop");
    }
  }
}
