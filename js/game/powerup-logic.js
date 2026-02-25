function updateDrakeTrails(now, wrapped) {
  if (wrapped && drakePowerActive()) markIcePathBreak();
  refreshIceTrails(now);
  if (drakePowerActive() && now >= nextIceTrailAt && (Math.abs(velX) + Math.abs(velY) > 0.8)) {
    spawnIceTrail();
    nextIceTrailAt = now + 90;
    refreshIceTrails(now);
  }
}

function updateOrbCollisions() {
  document.querySelectorAll(".orb").forEach(o => {
    if (collide(player, o)) {
      const r = o.getBoundingClientRect();
      applePickupBurst(r.left + r.width / 2, r.top + r.height / 2, game);
      o.remove();
      sfx("orb");
      const orbPoints = 3 + Math.floor(Math.random() * 5);
      addScore(orbPoints);
      speed += 0.6;
      enemySpeed += 0.03;
      spdEl.textContent = speed.toFixed(1);
      if (bossActive) {
        bossHp -= 1;
        updateBossUI();
        if (bossHp <= 0) kirkFinisherCutscene();
      }
      spawn("orb");
    }
  });
}

function updatePowerupCollisions() {
  document.querySelectorAll(".power").forEach(p => {
    if (collide(player, p)) {
      p.remove();
      sfx("pickup");
      devitoCutscene();
    }
  });

  document.querySelectorAll(".kirk").forEach(k => {
    if (collide(player, k)) {
      k.remove();
      sfx("pickup");
      kirk();
    }
  });

  document.querySelectorAll(".bonix").forEach(bn => {
    if (collide(player, bn)) {
      bn.remove();
      if (!hasShield) {
        sfx("pickup");
        setShieldActive(true);
        boNixCutscene();
      }
    }
  });

  document.querySelectorAll(".drake").forEach(dk => {
    if (collide(player, dk)) {
      dk.remove();
      sfx("pickup");
      drakePowerUntil = Date.now() + 20000;
      nextIceTrailAt = Date.now();
      drakeCutscene();
    }
  });
}
