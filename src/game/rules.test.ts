import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialPlayer,
  flipGravity,
  updatePlayerPhysics,
  resolveHazard,
  updateCombo,
  calculateRunScore,
} from './rules.ts';
import { LaserGrid, Spike } from './types.ts';

test('createInitialPlayer initializes player with correct properties', () => {
  const floorY = 400;
  const ceilingY = 80;
  const normalPlayer = createInitialPlayer(floorY, ceilingY, 'normal');
  assert.equal(normalPlayer.gravityDir, 1);
  assert.equal(normalPlayer.grounded, true);
  assert.equal(normalPlayer.surface, 'floor');
  assert.equal(normalPlayer.shield, 3);
  assert.equal(normalPlayer.maxShield, 3);
  assert.equal(normalPlayer.y, floorY - normalPlayer.height);

  const hardcorePlayer = createInitialPlayer(floorY, ceilingY, 'hardcore');
  assert.equal(hardcorePlayer.shield, 1);
  assert.equal(hardcorePlayer.maxShield, 1);
});

test('flipGravity inverts gravity direction and applies impulse', () => {
  const floorY = 400;
  const ceilingY = 80;
  let player = createInitialPlayer(floorY, ceilingY, 'normal');

  // Flip from floor to ceiling
  player = flipGravity(player);
  assert.equal(player.gravityDir, -1);
  assert.equal(player.grounded, false);
  assert.equal(player.surface, 'air');
  assert.ok(player.vy < 0, 'Velocity should be directed towards ceiling');

  // Flip back from ceiling to floor
  player = flipGravity(player);
  assert.equal(player.gravityDir, 1);
  assert.equal(player.grounded, false);
  assert.ok(player.vy > 0, 'Velocity should be directed towards floor');
});

test('updatePlayerPhysics lands on floor under normal gravity', () => {
  const floorY = 400;
  const ceilingY = 80;
  let player = createInitialPlayer(floorY, ceilingY, 'normal');
  player.y = 200; // in mid-air
  player.grounded = false;
  player.vy = 200;

  // Advance time enough to hit the floor
  let landedEver = false;
  for (let i = 0; i < 20; i++) {
    const res = updatePlayerPhysics(player, 0.05, floorY, ceilingY);
    player = res.player;
    if (res.landed) landedEver = true;
  }

  assert.equal(landedEver, true);
  assert.equal(player.grounded, true);
  assert.equal(player.surface, 'floor');
  assert.equal(player.y, floorY - player.height);
  assert.equal(player.vy, 0);
});

test('updatePlayerPhysics lands on ceiling under inverted gravity', () => {
  const floorY = 400;
  const ceilingY = 80;
  let player = createInitialPlayer(floorY, ceilingY, 'normal');
  player = flipGravity(player);
  player.y = 250; // in mid-air

  let landedEver = false;
  for (let i = 0; i < 20; i++) {
    const res = updatePlayerPhysics(player, 0.05, floorY, ceilingY);
    player = res.player;
    if (res.landed) landedEver = true;
  }

  assert.equal(landedEver, true);
  assert.equal(player.grounded, true);
  assert.equal(player.surface, 'ceiling');
  assert.equal(player.y, ceilingY);
  assert.equal(player.vy, 0);
});

test('resolveHazard damages vulnerable player and flags fatal when shield depleted', () => {
  const player = createInitialPlayer(400, 80, 'normal');
  const spike: Spike = {
    id: 's1',
    type: 'spike',
    x: player.x,
    y: player.y,
    width: 30,
    height: 40,
    surface: 'floor',
  };

  const res1 = resolveHazard(player, spike);
  assert.equal(res1.hit, true);
  assert.equal(res1.destroyed, false);
  assert.equal(res1.isFatal, false); // has 3 shield, loses 1 -> 2 remaining

  // Test with 1 shield (hardcore or damaged)
  player.shield = 1;
  const res2 = resolveHazard(player, spike);
  assert.equal(res2.hit, true);
  assert.equal(res2.isFatal, true);
});

test('resolveHazard slices and destroys hazard when player has Scroll Invincibility', () => {
  const player = createInitialPlayer(400, 80, 'normal');
  player.invincibleTimer = 4.5; // active scroll power-up

  const spike: Spike = {
    id: 's1',
    type: 'spike',
    x: player.x,
    y: player.y,
    width: 30,
    height: 40,
    surface: 'floor',
  };

  const res = resolveHazard(player, spike);
  assert.equal(res.hit, true);
  assert.equal(res.destroyed, true);
  assert.equal(res.isFatal, false);
  assert.ok(res.bonusScore > 0);
  assert.ok(res.hitstop > 0);

  // Test laser slicing
  const laser: LaserGrid = {
    id: 'l1',
    type: 'laser',
    x: player.x,
    y: player.y,
    width: 20,
    height: 60,
    active: true,
    zone: 'bottom',
  };
  const laserRes = resolveHazard(player, laser);
  assert.equal(laserRes.destroyed, true);
  assert.equal(laserRes.bonusScore, 250);
});

test('combo and score calculations update accurately', () => {
  let combo = 1;
  let timer = 0;

  const step1 = updateCombo(combo, timer, 0, 'coin');
  assert.equal(step1.combo, 2);
  assert.equal(step1.comboMultiplier, 1);

  const step2 = updateCombo(step1.combo, step1.comboTimer, 0, 'slice');
  assert.equal(step2.combo, 3);
  assert.equal(step2.comboMultiplier, 2);

  const score = calculateRunScore(100, 10, 5, 250);
  // 100 * 1.5 = 150 + 250 + 500 + 250 = 1150
  assert.equal(score, 1150);
});
