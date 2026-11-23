import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAMBER_ANGLE, FULL_TURN, FIRE_DURATION, TURN_DURATION, SPIN_DURATION, shotMotion, spinMotion } from '../assets/revolver-motion.mjs';
import { drawRevolverScene } from '../assets/revolver-scene.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('every shot fires first, then turns through intermediate angles exactly one chamber', () => {
  let angle = 0;
  for (let shot = 1; shot <= 6; shot++) {
    assert.deepEqual(shotMotion(angle, 0), { angle, phase: 'fire', done: false });
    close(shotMotion(angle, FIRE_DURATION - 1).angle, angle);
    const halfway = shotMotion(angle, FIRE_DURATION + TURN_DURATION / 2);
    assert.equal(halfway.phase, 'turn');
    assert.equal(halfway.done, false);
    close(halfway.angle, angle - CHAMBER_ANGLE / 2);
    const end = shotMotion(angle, FIRE_DURATION + TURN_DURATION);
    assert.equal(end.done, true);
    assert.equal(end.phase, '');
    close(end.angle, angle - CHAMBER_ANGLE);
    close(shotMotion(angle, 10000).angle, end.angle);
    angle = end.angle;
  }
  close(angle, -FULL_TURN);
});

test('new-round spin makes several turns and settles at chamber zero', () => {
  const from = -CHAMBER_ANGLE * 2;
  assert.deepEqual(spinMotion(from, 0), { angle: from, phase: 'spin', done: false });
  const middle = spinMotion(from, SPIN_DURATION / 2);
  const end = spinMotion(from, SPIN_DURATION);
  assert.equal(middle.phase, 'spin');
  assert.ok(middle.angle < from && middle.angle > end.angle);
  assert.ok(from - end.angle >= 3 * FULL_TURN);
  close(Math.sin(end.angle), 0);
  close(Math.cos(end.angle), 1);
  assert.equal(end.done, true);
  close(spinMotion(from, 10000).angle, end.angle);
});

test('reduced motion settles immediately without skipping a chamber or preserving a lock', () => {
  const from = -CHAMBER_ANGLE;
  assert.deepEqual(shotMotion(from, 0, true), { angle: from - CHAMBER_ANGLE, phase: '', done: true });
  const spin = spinMotion(from, 0, true);
  assert.equal(spin.phase, '');
  assert.equal(spin.done, true);
  close(Math.cos(spin.angle), 1);
});

function painted(round, cylinderAngle, animation = '') {
  const marks = [];
  const ctx = { fillStyle: '', fillRect(...box) { marks.push([this.fillStyle, ...box]); } };
  drawRevolverScene(ctx, { round, cylinderAngle, animation });
  return marks;
}

test('intermediate rotation changes only the cylinder HUD, including with identical empty holes', () => {
  const round = { hitAt: 5, attempts: 0 };
  const start = painted(round, 0);
  const middle = painted(round, -CHAMBER_ANGLE / 2);
  const outsideHud = marks => marks.filter(([,x,y]) => x < 330 || y > 51);
  const insideHud = marks => marks.filter(([,x,y]) => x >= 330 && y <= 51);
  assert.deepEqual(outsideHud(start), outsideHud(middle));
  assert.notDeepEqual(insideHud(start), insideHud(middle));
});

test('unfired cylinders do not visually reveal the randomly selected successful chamber', () => {
  for (const angle of [0, -CHAMBER_ANGLE / 2, -CHAMBER_ANGLE]) {
    const reference = painted({ hitAt: 1, attempts: 0 }, angle);
    for (let hitAt = 2; hitAt <= 6; hitAt++) assert.deepEqual(painted({ hitAt, attempts: 0 }, angle), reference);
  }
});
