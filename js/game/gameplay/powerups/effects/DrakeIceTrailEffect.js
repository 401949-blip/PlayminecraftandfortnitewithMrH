import { PowerupEffect } from "./PowerupEffect.js";

export class DrakeIceTrailEffect extends PowerupEffect {
  apply(ctx) {
    const { store, clock, runCutscene } = ctx;
    store.drakePowerUntil = clock.nowMs() + 20000;
    store.nextIceTrailAt = clock.nowMs();
    runCutscene("drake");
  }
}
