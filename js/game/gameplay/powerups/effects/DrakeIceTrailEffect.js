import { PowerupEffect } from "./PowerupEffect.js";

export class DrakeIceTrailEffect extends PowerupEffect {
  apply(ctx) {
    const { store, runCutscene } = ctx;
    store.drakePowerUntil = Date.now() + 20000;
    store.nextIceTrailAt = Date.now();
    runCutscene("drake");
  }
}
