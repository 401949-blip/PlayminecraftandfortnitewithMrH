import { PowerupEffect } from "./PowerupEffect.js";

export class DevitoWipeEffect extends PowerupEffect {
  apply(ctx) {
    const { runCutscene } = ctx;
    runCutscene("devito");
  }
}
