import { newRound, takeShot, hasHit, decayCharge, addCharge } from './game-core.mjs?v=charge-1';
import { drawRevolverScene } from './revolver-scene.mjs?v=chamber-3';
import { shotMotion, spinMotion } from './revolver-motion.mjs?v=chamber-3';

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
let motion = null;
let cylinderAngle = 0;
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
  const busy = motion !== null;
  play.disabled = busy || hit;
  restart.disabled = busy;
  play.textContent = busy ? (animation === 'spin' ? 'SPINNING…' : animation === 'turn' ? 'TURNING…' : 'FIRING…') : hit ? 'HIT!' : 'TAP TO CHARGE';
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
  const firing = animation === 'fire' && !reducedMotion.matches;
  const frame = `${Math.round(cylinderAngle * 180 / Math.PI)}:${firing}:${round.attempts}:${hasHit(round)}`;
  if (frame === lastFrame) return;
  lastFrame = frame;
  drawRevolverScene(ctx, { round, animation, cylinderAngle, reducedMotion: reducedMotion.matches });
}

function advanceMotion(now) {
  if (!motion) return;
  const sample = motion.kind === 'shot' ? shotMotion : spinMotion;
  const state = sample(motion.fromAngle, now - motion.startedAt, reducedMotion.matches);
  const phaseChanged = animation !== state.phase;
  cylinderAngle = state.angle;
  animation = state.phase;
  if (state.done) {
    motion = null;
    renderState();
    if (restoreControlFocus && [document.body, play, restart].includes(document.activeElement)) {
      (hasHit(round) ? restart : play).focus({ preventScroll: true });
    }
    restoreControlFocus = false;
  } else if (phaseChanged) {
    renderState();
  }
}

function startMotion(kind, now) {
  motion = { kind, fromAngle: cylinderAngle, startedAt: now };
  advanceMotion(now);
}

play.addEventListener('keydown', event => {
  // Holding a key is not repeated effort: require discrete taps/presses.
  if (event.repeat && (event.key === ' ' || event.key === 'Enter')) event.preventDefault();
});
play.addEventListener('click', () => {
  const now = performance.now();
  if (motion || hasHit(round)) return;
  updateCharge(now);
  charge = addCharge(charge);
  if (charge >= 100) {
    restoreControlFocus = document.activeElement === play;
    round = takeShot(round);
    charge = 0;
    startMotion('shot', now);
    renderState();
  }
  updateCharge(now);
  drawScene(now);
});
restart.addEventListener('click', () => {
  const now = performance.now();
  if (motion) return;
  restoreControlFocus = document.activeElement === restart;
  round = newRound();
  charge = 0;
  lastTime = now;
  startMotion('spin', now);
  lastFrame = -1;
  renderState();
  updateCharge(now);
  drawScene(now);
});
function tick(now) {
  updateCharge(now);
  advanceMotion(now);
  drawScene(now);
  requestAnimationFrame(tick);
}
// Never restore yesterday's outcome: every page load and new round is a fresh draw.
startMotion('spin', lastTime);
renderState();
updateCharge(lastTime);
drawScene(lastTime);
requestAnimationFrame(tick);
