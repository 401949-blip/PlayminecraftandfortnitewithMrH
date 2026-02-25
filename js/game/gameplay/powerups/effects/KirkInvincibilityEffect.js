import { PowerupEffect } from "./PowerupEffect.js";

export class KirkInvincibilityEffect extends PowerupEffect {
  apply(ctx) {
    const { runCutscene } = ctx;
    runCutscene("kirk");
  }
}
