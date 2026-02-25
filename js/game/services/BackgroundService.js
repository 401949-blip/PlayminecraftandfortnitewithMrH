export class BackgroundService {
  constructor(store, refs, backgrounds, random = Math) {
    this.store = store;
    this.refs = refs;
    this.backgrounds = backgrounds || [];
    this.random = random;
  }

  applyInitialBackground() {
    if (!this.store.currentStageBackground) {
      this.applyRandomStageBackground(true);
    } else {
      this.refs.game.style.setProperty("--stage-bg", `url('${this.store.currentStageBackground}')`);
    }
  }

  applyRandomStageBackground(force = false) {
    const list = this.backgrounds;
    if (!Array.isArray(list) || list.length === 0) return;
    let choice = list[Math.floor(this.random.random() * list.length)];
    if (!force && list.length > 1 && choice === this.store.currentStageBackground) {
      const fallback = list.find(bg => bg !== this.store.currentStageBackground);
      if (fallback) choice = fallback;
    }
    this.store.currentStageBackground = choice;
    this.refs.game.style.setProperty("--stage-bg", `url('${choice}')`);
  }

  markRerollPending() {
    this.store.pendingBackgroundReroll = true;
  }

  consumePendingReroll() {
    if (!this.store.pendingBackgroundReroll) return;
    this.applyRandomStageBackground();
    this.store.pendingBackgroundReroll = false;
  }
}
