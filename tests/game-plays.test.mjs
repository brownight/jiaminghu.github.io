import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayCounter, PLAY_ENDPOINT } from '../assets/game-plays.mjs';

const response = value => ({ ok: true, json: async () => ({ value }) });

test('loading reads only; each fired round increments once with a separate play counter', async () => {
  const calls = [], totals = [];
  let value = 20;
  const tracker = createPlayCounter({ fetchImpl: async url => {
    calls.push(url);
    if (!url.includes('readOnly=true')) value++;
    return response(value);
  }, onCount: total => totals.push(total) });
  assert.deepEqual(calls, [`${PLAY_ENDPOINT}?readOnly=true`]);
  assert.equal(await tracker.recordRound(1), true);
  assert.equal(await tracker.recordRound(1), false);
  assert.equal(await tracker.recordRound(2), true);
  assert.equal(await tracker.recordRound(1), false);
  assert.deepEqual(calls, [`${PLAY_ENDPOINT}?readOnly=true`, PLAY_ENDPOINT, PLAY_ENDPOINT]);
  assert.deepEqual(totals, [20, 21, 22]);
});

test('first shots during a slow read are queued once per round and never dropped', async () => {
  let finishRead, writes = 0;
  const tracker = createPlayCounter({ fetchImpl: url => {
    if (url.includes('readOnly=true')) return new Promise(resolve => { finishRead = resolve; });
    writes++;
    return Promise.resolve(response(writes));
  } });
  const first = tracker.recordRound(1);
  assert.equal(await tracker.recordRound(1), false);
  const second = tracker.recordRound(2);
  assert.equal(writes, 0);
  finishRead(response(0));
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.equal(writes, 2);
});

test('uncertain writes are not retried within a round and do not fabricate a count', async () => {
  const totals = [];
  let writes = 0;
  const tracker = createPlayCounter({ fetchImpl: async url => {
    if (url.includes('readOnly=true')) return response(10);
    writes++;
    if (writes === 1) throw new Error('connection interrupted');
    return response(12);
  }, onCount: total => totals.push(total) });
  assert.equal(await tracker.recordRound(1), false);
  assert.equal(await tracker.recordRound(1), false);
  assert.deepEqual(totals, [10]);
  assert.equal(await tracker.recordRound(2), true);
  assert.deepEqual(totals, [10, 12]);
  assert.equal(writes, 2);
});
