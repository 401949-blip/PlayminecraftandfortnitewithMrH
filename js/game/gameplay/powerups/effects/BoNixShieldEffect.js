import { PowerupEffect } from "./PowerupEffect.js";

export class BoNixShieldEffect extends PowerupEffect {
  apply(ctx) {
    const { store, setShieldActive, runCutscene } = ctx;
    if (store.hasShield) return;
    setShieldActive(true);
    runCutscene("bonix");
  }
}
