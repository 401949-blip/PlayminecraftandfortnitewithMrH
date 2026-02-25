import { DevitoWipeEffect } from "./DevitoWipeEffect.js";
import { KirkInvincibilityEffect } from "./KirkInvincibilityEffect.js";
import { BoNixShieldEffect } from "./BoNixShieldEffect.js";
import { DrakeIceTrailEffect } from "./DrakeIceTrailEffect.js";

export function createPowerupEffects() {
  return {
    devito: new DevitoWipeEffect(),
    kirk: new KirkInvincibilityEffect(),
    bonix: new BoNixShieldEffect(),
    drake: new DrakeIceTrailEffect()
  };
}
