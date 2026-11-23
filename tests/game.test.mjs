import test from 'node:test';
import assert from 'node:assert/strict';
import { newRound, restoreRound, takeShot, hasHit, chooseHit, localDay } from '../assets/game-core.mjs';

test('each possible outcome resolves exactly on its assigned shot and then stops', () => {
  for (let hitAt = 1; hitAt <= 6; hitAt++) {
    let round = newRound('2026-11-22', hitAt);
    assert.equal(takeShot(round), round, 'a round cannot start without spinning');
    round = { ...round, spun: true };
    for (let i = 1; i <= hitAt; i++) {
      round = takeShot(round);
      assert.equal(round.attempts, i);
      assert.equal(hasHit(round), i === hitAt);
    }
    assert.equal(takeShot(round), round, 'no shots after a hit');
  }
});

test('same-day progress survives reload, but stale and malformed state is discarded', () => {
  const day = '2026-11-22';
  const progress = { day, hitAt: 5, attempts: 3, spun: true };
  assert.deepEqual(restoreRound(JSON.stringify(progress), day), progress);
  assert.equal(restoreRound(JSON.stringify(progress), '2026-11-23'), null);
  for (const raw of ['{', 'null', '{}', JSON.stringify({ ...progress, hitAt: 7 }), JSON.stringify({ ...progress, attempts: 6 }), JSON.stringify({ ...progress, spun: false }), JSON.stringify({ ...progress, attempts: 1.5 })]) assert.equal(restoreRound(raw, day), null);
});

test('rejection sampling excludes biased tail values', () => {
  const values = [255, 252, 251];
  assert.equal(chooseHit({ getRandomValues: array => { array[0] = values.shift(); return array; } }), 6);
  for (let n = 0; n < 6; n++) assert.equal(chooseHit({ getRandomValues: array => { array[0] = n; return array; } }), n + 1);
});

test('day keys use local calendar components', () => {
  assert.equal(localDay(new Date(2026, 0, 3, 12)), '2026-01-03');
});
