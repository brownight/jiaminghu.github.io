import { localDay, newRound, restoreRound, takeShot, hasHit, chooseHit } from './game-core.mjs';

const key = 'jiaminghu-revolver-v1';
const play = document.querySelector('#play-button');
const replay = document.querySelector('#replay-button');
const cylinder = document.querySelector('#cylinder');
const title = document.querySelector('#result-title');
const detail = document.querySelector('#result-detail');
const burst = document.querySelector('#hit-burst');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let round;
let busy = false;
let rotation = 0;

function save() { try { localStorage.setItem(key, JSON.stringify(round)); } catch { /* The game also works without persistent storage. */ } }
function syncDay() {
  const today = localDay();
  if (round?.day === today) return;
  let saved;
  try { saved = localStorage.getItem(key); } catch { saved = null; }
  round = restoreRound(saved, today) || newRound(today, chooseHit());
  rotation = round.spun ? 1440 - Math.max(0, round.attempts - 1) * 60 : 0;
  save();
}

function render() {
  const hit = hasHit(round);
  const date = new Date();
  document.querySelector('#day-label').textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  cylinder.style.transform = `rotate(${rotation}deg)`;
  document.querySelectorAll('[data-chamber]').forEach((el, i) => {
    el.classList.toggle('miss', i < round.attempts && i + 1 !== round.hitAt);
    el.classList.toggle('hit', hit && i + 1 === round.hitAt);
  });
  document.querySelectorAll('[data-attempt]').forEach((el, i) => {
    el.classList.toggle('miss', i < round.attempts && i + 1 !== round.hitAt);
    el.classList.toggle('hit', hit && i + 1 === round.hitAt);
    el.setAttribute('aria-label', `Attempt ${i + 1}: ${i >= round.attempts ? 'not taken' : i + 1 === round.hitAt ? 'hit' : 'empty'}`);
  });
  burst.hidden = !hit;
  play.disabled = busy || hit;
  replay.hidden = !hit;
  replay.disabled = busy;
  if (hit) {
    title.textContent = `Shot ${round.attempts} — a hit.`;
    detail.textContent = 'Give your best. Leave room for chance.';
    play.textContent = "Today's round complete";
  } else if (!round.spun) {
    title.textContent = 'Leave room for the unexpected.';
    detail.textContent = 'Your first attempt starts with a spin.';
    play.textContent = 'Spin the cylinder';
  } else if (round.attempts === 0) {
    title.textContent = 'A new possibility.';
    detail.textContent = 'Ready for your first attempt?';
    play.textContent = 'Take shot 1';
  } else {
    title.textContent = `Shot ${round.attempts} — an empty chamber.`;
    detail.textContent = 'Keep your aim. Try the next possibility.';
    play.textContent = `Take shot ${round.attempts + 1}`;
  }
}

const pause = ms => new Promise(resolve => setTimeout(resolve, reduceMotion.matches ? 0 : ms));
play.addEventListener('click', async () => {
  if (busy) return;
  syncDay();
  if (hasHit(round)) { render(); return; }
  busy = true;
  play.disabled = true;
  if (!round.spun) {
    cylinder.classList.add('spinning');
    rotation += 1440;
    cylinder.style.transform = `rotate(${rotation}deg)`;
    title.textContent = 'Making room for chance…';
    play.textContent = 'Spinning…';
    await pause(1100);
    cylinder.classList.remove('spinning');
    round = { ...round, spun: true };
  } else {
    if (round.attempts > 0) rotation -= 60;
    cylinder.style.transform = `rotate(${rotation}deg)`;
    play.textContent = 'Taking a shot…';
    await pause(650);
    round = takeShot(round);
  }
  busy = false;
  save();
  render();
});

replay.addEventListener('click', () => {
  if (busy) return;
  syncDay();
  round = newRound(round.day, round.hitAt);
  rotation = 0;
  save();
  render();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !busy) { syncDay(); render(); }
});
syncDay();
render();
