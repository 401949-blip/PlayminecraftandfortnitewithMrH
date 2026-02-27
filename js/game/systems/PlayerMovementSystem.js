import { CONSTANTS } from "../config/constants.js";

export class PlayerMovementSystem {
  constructor({ store, refs, clock }) {
    this.store = store;
    this.refs = refs;
    this.clock = clock;
  }

  update(dt) {
    const s = this.store;

    if (s.keys["ArrowUp"] || s.keys.w) s.velY -= s.acceleration * dt;
    if (s.keys["ArrowDown"] || s.keys.s) s.velY += s.acceleration * dt;
    if (s.keys["ArrowLeft"] || s.keys.a) s.velX -= s.acceleration * dt;
    if (s.keys["ArrowRight"] || s.keys.d) s.velX += s.acceleration * dt;

    const mag = Math.sqrt(s.velX * s.velX + s.velY * s.velY);
    if (mag > s.speed) {
      s.velX = (s.velX / mag) * s.speed;
      s.velY = (s.velY / mag) * s.speed;
    }

    s.velX *= Math.pow(s.friction, dt);
    s.velY *= Math.pow(s.friction, dt);
    s.x += s.velX * dt;
    s.y += s.velY * dt;

    let wrapped = false;
    if (s.x > window.innerWidth) {
      s.x = 0;
      wrapped = true;
    }
    if (s.x < 0) {
      s.x = window.innerWidth;
      wrapped = true;
    }
    if (s.y > window.innerHeight) {
      s.y = 0;
      wrapped = true;
    }
    if (s.y < 0) {
      s.y = window.innerHeight;
      wrapped = true;
    }

    if (wrapped) s.wrapGraceUntil = this.clock.nowMs() + CONSTANTS.WRAP_GRACE_MS;

    this.refs.player.style.left = s.x + "px";
    this.refs.player.style.top = s.y + "px";
    return wrapped;
  }
}
