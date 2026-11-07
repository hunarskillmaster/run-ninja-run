import { Difficulty, Hazard, LaserGrid, Player, Shuriken, Spike, Pitfall } from './types.ts';

// Snappy vertical physics constants
export const GRAVITY_ACCEL = 3400;
export const TERMINAL_VELOCITY = 1400;
export const FLIP_IMPULSE = 150;
export const INVINCIBLE_DURATION = 6.0;
export const HIT_INVULNERABLE_DURATION = 1.2;
export const COMBO_WINDOW = 3.2;

export function createInitialPlayer(floorY: number, ceilingY: number, difficulty: Difficulty = 'normal'): Player {
  const height = 44;
  const width = 28;
  const initialY = floorY - height;
  const maxShield = difficulty === 'hardcore' ? 1 : 3;

  return {
    x: 160,
    y: initialY,
    vx: 0,
    vy: 0,
    width,
    height,
    gravityDir: 1, // 1 = floor, -1 = ceiling
    grounded: true,
    surface: 'floor',
    rotation: 0,
    flipAnimTime: 0,
    runAnimTime: 0,
    scarfSegments: Array.from({ length: 7 }, (_, i) => ({ x: 160 - i * 6, y: initialY + 12 })),
    invincibleTimer: 0,
    hitInvulnerableTimer: 0,
    shield: maxShield,
    maxShield,
    alive: true,
  };
}

// Inverts gravity direction and adds vertical impulse
export function flipGravity(player: Player): Player {
  if (!player.alive) return player;

  const nextDir = player.gravityDir === 1 ? -1 : 1;
  const impulseVy = nextDir === -1 ? -Math.max(FLIP_IMPULSE, -player.vy * 0.4) : Math.max(FLIP_IMPULSE, player.vy * 0.4);

  return {
    ...player,
    gravityDir: nextDir,
    grounded: false,
    surface: 'air',
    vy: impulseVy,
    flipAnimTime: 0.28,
  };
}

// Updates vertical physics, cloth scarf simulation, and surface landings
export function updatePlayerPhysics(
  player: Player,
  dt: number,
  floorY: number,
  ceilingY: number,
  pits: Pitfall[] = []
): { player: Player; landed: boolean; fellInPit: boolean } {
  if (!player.alive) {
    return { player, landed: false, fellInPit: false };
  }

  let vy = player.vy + player.gravityDir * GRAVITY_ACCEL * dt;
  if (player.gravityDir === 1) {
    vy = Math.min(vy, TERMINAL_VELOCITY);
  } else {
    vy = Math.max(vy, -TERMINAL_VELOCITY);
  }

  let y = player.y + vy * dt;
  let grounded = false;
  let surface: 'floor' | 'ceiling' | 'air' = 'air';
  let landed = false;
  let fellInPit = false;

  // Check if player is over a pit on their current target surface
  const playerCenterX = player.x + player.width / 2;
  const isOverFloorPit = pits.some(
    p => p.surface === 'floor' && playerCenterX >= p.x && playerCenterX <= p.x + p.width
  );
  const isOverCeilingPit = pits.some(
    p => p.surface === 'ceiling' && playerCenterX >= p.x && playerCenterX <= p.x + p.width
  );

  // Normal gravity: floor collision
  if (player.gravityDir === 1) {
    const targetFloor = floorY - player.height;
    if (y >= targetFloor) {
      if (isOverFloorPit) {
        if (y > floorY + 120) {
          fellInPit = true;
        }
      } else {
        y = targetFloor;
        if (vy > 0 && !player.grounded) {
          landed = true;
        }
        vy = 0;
        grounded = true;
        surface = 'floor';
      }
    }
  } else {
    // Inverted gravity: ceiling collision
    const targetCeiling = ceilingY;
    if (y <= targetCeiling) {
      if (isOverCeilingPit) {
        if (y < ceilingY - 120) {
          fellInPit = true;
        }
      } else {
        y = targetCeiling;
        if (vy < 0 && !player.grounded) {
          landed = true;
        }
        vy = 0;
        grounded = true;
        surface = 'ceiling';
      }
    }
  }

  // Animation and timers
  const flipAnimTime = Math.max(0, player.flipAnimTime - dt);
  const invincibleTimer = Math.max(0, player.invincibleTimer - dt);
  const hitInvulnerableTimer = Math.max(0, player.hitInvulnerableTimer - dt);
  const runAnimTime = grounded ? player.runAnimTime + dt * 14 : player.runAnimTime;

  // Rotation interpolation: 0 for floor, Math.PI for ceiling
  const targetRotation = player.gravityDir === 1 ? 0 : Math.PI;
  let rotation = player.rotation;
  if (flipAnimTime > 0) {
    const t = 1 - flipAnimTime / 0.28;
    rotation = player.gravityDir === -1 ? t * Math.PI : Math.PI - t * Math.PI;
  } else {
    rotation = targetRotation;
  }

  // Scarf cloth trailing simulation
  const neckX = player.x + 8;
  const neckY = player.gravityDir === 1 ? y + 14 : y + player.height - 14;
  const scarfSegments = [...player.scarfSegments];
  scarfSegments[0] = { x: neckX, y: neckY };
  for (let i = 1; i < scarfSegments.length; i++) {
    const prev = scarfSegments[i - 1];
    const curr = scarfSegments[i];
    const targetX = prev.x - 7;
    const targetY = prev.y + (player.gravityDir === 1 ? 2.5 : -2.5) + Math.sin(runAnimTime + i) * 1.5;
    scarfSegments[i] = {
      x: curr.x + (targetX - curr.x) * 0.45,
      y: curr.y + (targetY - curr.y) * 0.45,
    };
  }

  const updatedPlayer: Player = {
    ...player,
    y,
    vy,
    grounded,
    surface,
    rotation,
    flipAnimTime,
    invincibleTimer,
    hitInvulnerableTimer,
    runAnimTime,
    scarfSegments,
  };

  return { player: updatedPlayer, landed, fellInPit };
}

// AABB collision detection with padding for forgiving platforming
export function checkAABB(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  padding: number = 4
): boolean {
  return (
    a.x + padding < b.x + b.width - padding &&
    a.x + a.width - padding > b.x + padding &&
    a.y + padding < b.y + b.height - padding &&
    a.y + a.height - padding > b.y + padding
  );
}

// Circle vs AABB collision detection
export function checkCircleAABB(
  circle: { x: number; y: number; radius: number },
  box: { x: number; y: number; width: number; height: number },
  padding: number = 2
): boolean {
  const closestX = Math.max(box.x + padding, Math.min(circle.x, box.x + box.width - padding));
  const closestY = Math.max(box.y + padding, Math.min(circle.y, box.y + box.height - padding));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distSq = dx * dx + dy * dy;
  const r = circle.radius - padding;
  return distSq < r * r;
}

export function checkSpikeCollision(player: Player, spike: Spike): boolean {
  if (spike.destroyed) return false;
  return checkAABB(player, spike, 6);
}

export function checkLaserCollision(player: Player, laser: LaserGrid): boolean {
  if (laser.destroyed || !laser.active) return false;
  return checkAABB(player, laser, 4);
}

export function checkShurikenCollision(player: Player, shuriken: Shuriken): boolean {
  if (shuriken.destroyed) return false;
  return checkCircleAABB(
    { x: shuriken.x, y: shuriken.y, radius: shuriken.radius },
    player,
    3
  );
}

export interface HazardResult {
  hit: boolean;
  destroyed: boolean;
  isFatal: boolean;
  bonusScore: number;
  message?: string;
  hitstop: number;
}

// Resolves player interaction with hazards, handling invincibility slicing vs damage
export function resolveHazard(player: Player, hazard: Hazard): HazardResult {
  let isColliding = false;

  if (hazard.type === 'spike') {
    isColliding = checkSpikeCollision(player, hazard);
  } else if (hazard.type === 'laser') {
    isColliding = checkLaserCollision(player, hazard);
  } else if (hazard.type === 'shuriken') {
    isColliding = checkShurikenCollision(player, hazard);
  }

  if (!isColliding) {
    return { hit: false, destroyed: false, isFatal: false, bonusScore: 0, hitstop: 0 };
  }

  // Invincibility phase: player cleanly slices hazards for bonus score
  if (player.invincibleTimer > 0) {
    let bonus = 150;
    let label = 'SHADOW SLICE! +150';
    if (hazard.type === 'laser') {
      bonus = 250;
      label = 'LASER CUT! +250';
    } else if (hazard.type === 'shuriken') {
      bonus = 200;
      label = 'PARRIED! +200';
    }

    return {
      hit: true,
      destroyed: true,
      isFatal: false,
      bonusScore: bonus,
      message: label,
      hitstop: 0.05,
    };
  }

  // Grace period after taking damage
  if (player.hitInvulnerableTimer > 0) {
    return { hit: false, destroyed: false, isFatal: false, bonusScore: 0, hitstop: 0 };
  }

  // Normal vulnerable hit: loses 1 shield pip or death
  const nextShield = player.shield - 1;
  const isFatal = nextShield <= 0;

  return {
    hit: true,
    destroyed: false,
    isFatal,
    bonusScore: 0,
    message: isFatal ? 'FATAL IMPACT' : 'ARMOR CRACKED!',
    hitstop: isFatal ? 0.08 : 0.06,
  };
}

// Increments combo counter or decays after time window
export function updateCombo(
  currentCombo: number,
  comboTimer: number,
  dt: number,
  action: 'coin' | 'slice' | 'near_miss' | 'none'
): { combo: number; comboTimer: number; comboMultiplier: number } {
  let newCombo = currentCombo;
  let newTimer = comboTimer - dt;

  if (action !== 'none') {
    newCombo = Math.min(newCombo + 1, 10);
    newTimer = COMBO_WINDOW;
  } else if (newTimer <= 0) {
    newCombo = 1;
    newTimer = 0;
  }

  const comboMultiplier = Math.min(5, 1 + Math.floor((newCombo - 1) / 2));
  return { combo: newCombo, comboTimer: Math.max(0, newTimer), comboMultiplier };
}

// Final score calculation
export function calculateRunScore(
  distance: number,
  coins: number,
  slashes: number,
  bonusPoints: number
): number {
  return Math.floor(distance * 1.5) + coins * 25 + slashes * 100 + bonusPoints;
}
