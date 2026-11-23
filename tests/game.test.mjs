import test from 'node:test';
import assert from 'node:assert/strict';
import { newRound, takeShot, hasHit, chooseHit, addCharge, decayCharge, CHARGE_MAX } from '../assets/game-core.mjs';

test('all six outcomes resolve on the selected shot and stop after a hit', () => {
  for (let hitAt = 1; hitAt <= 6; hitAt++) {
    let round = newRound(hitAt);
    assert.equal(hasHit(round), false);
    for (let i = 1; i <= hitAt; i++) {
      round = takeShot(round);
      assert.equal(round.attempts, i);
      assert.equal(hasHit(round), i === hitAt);
    }
    assert.equal(takeShot(round), round, 'extra clicks cannot create another shot after a hit');
  }
});

test('every new round makes a fresh crypto draw; genuine draws may repeat', context => {
  const values = [0, 5, 2, 2];
  const random = context.mock.method(globalThis.crypto, 'getRandomValues', array => {
    array[0] = values.shift();
    return array;
  });
  assert.deepEqual(Array.from({ length: 4 }, () => newRound().hitAt), [1, 6, 3, 3]);
  assert.equal(random.mock.callCount(), 4);
});

test('rejection sampling maps every accepted byte evenly to the six positions', () => {
  const counts = Array(6).fill(0);
  for (let value = 0; value < 252; value++) {
    const position = chooseHit({ getRandomValues: array => { array[0] = value; return array; } });
    counts[position - 1]++;
  }
  assert.deepEqual(counts, [42, 42, 42, 42, 42, 42]);
});

test('all biased tail bytes are discarded before selecting a position', () => {
  const values = [252, 253, 254, 255, 251];
  assert.equal(chooseHit({ getRandomValues: array => { array[0] = values.shift(); return array; } }), 6);
  assert.equal(values.length, 0);
});

test('a single tap is insufficient; repeated timely taps can fill the meter', () => {
  let charge = addCharge(0);
  assert.ok(charge > 0 && charge < CHARGE_MAX);
  for (let tap = 1; tap < 6; tap++) charge = addCharge(decayCharge(charge, 100));
  assert.equal(charge, CHARGE_MAX);
  assert.equal(addCharge(charge), CHARGE_MAX, 'charge cannot overflow the meter');
});

test('slow tapping loses progress and long idle periods drain the meter', () => {
  let charge = 0;
  for (let tap = 0; tap < 20; tap++) charge = addCharge(decayCharge(charge, 1000));
  assert.ok(charge < CHARGE_MAX, 'one tap per second never fills the meter');
  assert.equal(decayCharge(90, 1000), 66);
  assert.equal(decayCharge(90, 10000), 0);
  assert.equal(decayCharge(0, 10000), 0);
  assert.equal(decayCharge(30, -100), 30, 'a negative clock delta never creates charge');
});

test('decay depends on elapsed time, not animation frame count', () => {
  const once = decayCharge(80, 1000);
  let many = 80;
  for (let i = 0; i < 10; i++) many = decayCharge(many, 100);
  assert.ok(Math.abs(once - many) < 1e-10);
});

test('charging and idling alone do not advance the round', () => {
  const round = newRound(4);
  let charge = 0;
  for (let tap = 0; tap < 3; tap++) charge = addCharge(charge);
  charge = decayCharge(charge, 6000);
  assert.equal(charge, 0);
  assert.deepEqual(round, { hitAt: 4, attempts: 0 });
});

test('invalid target positions cannot create a round', () => {
  for (const position of [0, 7, -1, 1.5, NaN, null, '3']) {
    assert.throws(() => newRound(position), RangeError);
  }
});
