export class HighScoreService {
  constructor(store, refs, storage, bus) {
    this.store = store;
    this.refs = refs;
    this.storage = storage;
    this.bus = bus;
  }

  load() {
    this.store.highScore = this.storage.loadHighScore();
    this.updateUI();
  }

  updateUI() {
    const { menuHighScoreValueEl, deathHighScoreValueEl } = this.refs;
    if (menuHighScoreValueEl) menuHighScoreValueEl.textContent = String(this.store.highScore);
    if (deathHighScoreValueEl) deathHighScoreValueEl.textContent = String(this.store.highScore);
  }

  evaluateRun(score) {
    const beat = score > this.store.highScore;
    if (!beat) {
      this.updateUI();
      return false;
    }
    this.store.highScore = score;
    this.store.newHighScoreRun = true;
    this.storage.saveHighScore(this.store.highScore);
    this.updateUI();
    this.bus.emit("NEW_HIGHSCORE", { score: this.store.highScore });
    return true;
  }
}
