import { newRound, takeShot, hasHit, decayCharge, addCharge } from './game-core.mjs?v=charge-1';
import { drawRevolverScene } from './revolver-scene.mjs?v=newton-2';

const play = document.querySelector('#play-button');
const restart = document.querySelector('#new-round-button');
const title = document.querySelector('#result-title');
const detail = document.querySelector('#result-detail');
const meter = document.querySelector('#charge-meter');
const percent = document.querySelector('#charge-value');
const shotLabel = document.querySelector('#shot-label');
const canvas = document.querySelector('#revolver-scene');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let round = newRound();
let charge = 0;
let lastTime = performance.now();
let busyUntil = 0;
let animation = '';
let restoreControlFocus = false;
let lastPaintedCharge = -1;
let lastFrame = -1;

function updateCharge(now) {
  charge = decayCharge(charge, now - lastTime);
  lastTime = now;
  const value = Math.floor(charge);
  if (value === lastPaintedCharge) return;
  lastPaintedCharge = value;
  meter.value = value;
  meter.textContent = `${value}%`;
  percent.textContent = `${value}%`;
}

function renderState() {
  const hit = hasHit(round);
  const busy = busyUntil > performance.now();
  play.disabled = busy || hit;
  restart.disabled = busy;
  play.textContent = busy ? (animation === 'spin' ? 'SPINNING…' : 'FIRING…') : hit ? 'HIT!' : 'TAP TO CHARGE';
  shotLabel.textContent = `${String(hit ? round.attempts : round.attempts + 1).padStart(2, '0')} / 06`;
  document.querySelectorAll('[data-attempt]').forEach((el, i) => {
    const taken = i < round.attempts;
    const success = hit && i + 1 === round.attempts;
    el.classList.toggle('miss', taken && !success);
    el.classList.toggle('hit', success);
    el.setAttribute('aria-label', `Shot ${i + 1}: ${success ? 'hit' : taken ? 'empty' : 'not taken'}`);
  });
  if (hit) {
    title.textContent = `Shot ${round.attempts} — a hit!`;
    detail.textContent = 'Your effort found its moment. Try a new round?';
  } else if (round.attempts) {
    title.textContent = `Shot ${round.attempts} — empty.`;
    detail.textContent = 'A different chamber. Build momentum again.';
  } else {
    title.textContent = 'Make room for chance.';
    detail.textContent = 'One hidden hit. Six possible shots.';
  }
}

function drawScene(now) {
  const phase = animation === 'spin' && !reducedMotion.matches ? Math.floor(now / 85) % 6 : 0;
  const firing = animation === 'fire' && !reducedMotion.matches;
  const frame = phase + (firing ? 10 : 0) + round.attempts * 20 + (hasHit(round) ? 200 : 0);
  if (frame === lastFrame) return;
  lastFrame = frame;
  drawRevolverScene(ctx, { round, animation, now, reducedMotion: reducedMotion.matches });
}

play.addEventListener('keydown', event => {
  // Holding a key is not repeated effort: require discrete taps/presses.
  if (event.repeat && (event.key === ' ' || event.key === 'Enter')) event.preventDefault();
});
play.addEventListener('click', () => {
  const now = performance.now();
  if (now < busyUntil || hasHit(round)) return;
  updateCharge(now);
  charge = addCharge(charge);
  if (charge >= 100) {
    restoreControlFocus = document.activeElement === play;
    round = takeShot(round);
    charge = 0;
    animation = 'fire';
    busyUntil = now + 450;
    renderState();
  }
  updateCharge(now);
  drawScene(now);
});
restart.addEventListener('click', () => {
  const now = performance.now();
  if (now < busyUntil) return;
  restoreControlFocus = document.activeElement === restart;
  round = newRound();
  charge = 0;
  lastTime = now;
  animation = 'spin';
  busyUntil = now + 650;
  lastFrame = -1;
  renderState();
  updateCharge(now);
  drawScene(now);
});
function tick(now) {
  updateCharge(now);
  if (animation && now >= busyUntil) {
    animation = '';
    renderState();
    if (restoreControlFocus && [document.body, play, restart].includes(document.activeElement)) {
      (hasHit(round) ? restart : play).focus({ preventScroll: true });
    }
    restoreControlFocus = false;
  }
  drawScene(now);
  requestAnimationFrame(tick);
}
// Never restore yesterday's outcome: every page load and new round is a fresh draw.
renderState();
updateCharge(lastTime);
drawScene(lastTime);
requestAnimationFrame(tick);
