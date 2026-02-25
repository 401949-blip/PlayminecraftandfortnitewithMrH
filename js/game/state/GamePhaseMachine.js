import { PHASES } from "../config/constants.js";

const ALLOWED = {
  [PHASES.BOOT]: new Set([PHASES.MENU]),
  [PHASES.MENU]: new Set([PHASES.RUNNING, PHASES.TRANSITION]),
  [PHASES.RUNNING]: new Set([PHASES.MENU, PHASES.PAUSED, PHASES.CUTSCENE, PHASES.BOSS, PHASES.GAME_OVER]),
  [PHASES.PAUSED]: new Set([PHASES.MENU, PHASES.RUNNING, PHASES.GAME_OVER]),
  [PHASES.CUTSCENE]: new Set([PHASES.MENU, PHASES.RUNNING, PHASES.BOSS, PHASES.GAME_OVER]),
  [PHASES.BOSS]: new Set([PHASES.MENU, PHASES.RUNNING, PHASES.CUTSCENE, PHASES.GAME_OVER]),
  [PHASES.GAME_OVER]: new Set([PHASES.MENU, PHASES.RUNNING]),
  [PHASES.TRANSITION]: new Set([PHASES.MENU, PHASES.RUNNING])
};

export class GamePhaseMachine {
  constructor(initial = PHASES.BOOT, onChange = null) {
    this.phase = initial;
    this.onChange = onChange;
  }

  current() {
    return this.phase;
  }

  is(phase) {
    return this.phase === phase;
  }

  can(next) {
    const allowed = ALLOWED[this.phase];
    return !!allowed && allowed.has(next);
  }

  transition(next, meta = null) {
    if (next === this.phase) return true;
    if (!this.can(next)) {
      return false;
    }
    const prev = this.phase;
    this.phase = next;
    if (this.onChange) {
      this.onChange({ from: prev, to: next, meta });
    }
    return true;
  }
}
