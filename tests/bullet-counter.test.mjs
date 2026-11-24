import test from 'node:test';
import assert from 'node:assert/strict';
import { BULLET_ENDPOINT, createBulletCounter } from '../assets/bullet-counter.mjs';

test('page reads are read-only; a click requests one increment and displays the server total', async () => {
  const calls = [], totals = [];
  const counter = createBulletCounter({ fetchImpl: async (url, options) => {
    calls.push([url, options]);
    return { ok: true, json: async () => ({ value: calls.length === 1 ? 17 : 18 }) };
  }, onCount: value => totals.push(value) });
  await counter.read();
  await counter.collect();
  assert.deepEqual(calls.map(([url]) => url), [`${BULLET_ENDPOINT}?readOnly=true`, BULLET_ENDPOINT]);
  assert.deepEqual(totals, [17, 18]);
  for (const [,options] of calls) {
    assert.equal(options.cache, 'no-store');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
  }
});

test('rapid duplicate clicks cannot send concurrent increments', async () => {
  let resolve, requests = 0;
  const counter = createBulletCounter({ fetchImpl: () => {
    requests++;
    return new Promise(done => { resolve = done; });
  } });
  const first = counter.collect();
  assert.equal(await counter.collect(), false);
  assert.equal(requests, 1);
  resolve({ ok: true, json: async () => ({ value: 1 }) });
  assert.equal(await first, true);
});

test('failed increments preserve the confirmed total and are never retried automatically', async () => {
  let requests = 0;
  const totals = [], states = [];
  const counter = createBulletCounter({ fetchImpl: async () => {
    if (++requests === 1) return { ok: true, json: async () => ({ value: 9 }) };
    throw new Error('timeout');
  }, onCount: value => totals.push(value), onState: (...state) => states.push(state) });
  await counter.read();
  assert.equal(await counter.collect(), false);
  assert.equal(requests, 2);
  assert.deepEqual(totals, [9]);
  assert.deepEqual(states.at(-1), ['error', 9]);
});

test('HTTP failures and malformed values never become a fabricated zero', async () => {
  for (const response of [{ ok: false }, ...[-1, null, '8', 1.5, undefined].map(value => ({ok:true,json:async()=>({value})}))]) {
    let rendered = false, state;
    const counter = createBulletCounter({fetchImpl:async()=>response,onCount:()=>{rendered=true;},onState:value=>{state=value;}});
    assert.equal(await counter.read(), false);
    assert.equal(rendered, false);
    assert.equal(state, 'error');
  }
});
