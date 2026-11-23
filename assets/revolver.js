import { newRound, takeShot, hasHit, decayCharge, addCharge } from './game-core.mjs?v=charge-1';

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

// Draw at low resolution with solid square pixels; no image assets or smoothing.
function pixelCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  for (let yy = -radius; yy <= radius; yy++) {
    for (let xx = -radius; xx <= radius; xx++) {
      if (xx * xx + yy * yy <= radius * radius) ctx.fillRect(x + xx, y + yy, 1, 1);
    }
  }
}
function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function drawScene(now) {
  const phase = animation === 'spin' && !reducedMotion.matches ? Math.floor(now / 85) % 6 : 0;
  const firing = animation === 'fire' && !reducedMotion.matches;
  const frame = phase + (firing ? 10 : 0) + round.attempts * 20 + (hasHit(round) ? 200 : 0);
  if (frame === lastFrame) return;
  lastFrame = frame;
  rect(0, 0, 224, 128, '#17261f');
  rect(13, 113, 198, 1, '#354b3c');
  // Small pixel revolver, pointed toward an abstract target.
  rect(101, 40, 70, 18, '#a9bb96');
  rect(101, 40, 70, 4, '#e5ead6');
  rect(101, 54, 70, 4, '#687e5d');
  rect(168, 38, 7, 22, '#627557');
  rect(168, 39, 5, 4, '#e5ead6');
  rect(156, 34, 5, 6, '#b9c9a6');
  rect(43, 44, 25, 35, '#869b72');
  rect(35, 35, 14, 9, '#a9bb96');
  rect(35, 30, 6, 9, '#dce3cb');
  rect(40, 76, 27, 10, '#a67c4f');
  rect(36, 86, 28, 12, '#a67c4f');
  rect(32, 98, 28, 12, '#a67c4f');
  rect(35, 108, 22, 5, '#694e35');
  rect(44, 82, 6, 20, '#bf9a65');
  rect(72, 78, 29, 4, '#a9bb96');
  rect(97, 72, 4, 12, '#a9bb96');
  rect(75, 82, 22, 8, '#a9bb96');
  rect(79, 78, 14, 8, '#17261f');
  rect(80, 72, 4, 9, '#dce3cb');
  pixelCircle(79, 55, 30, '#0c1710');
  pixelCircle(79, 55, 27, '#b6c6a0');
  pixelCircle(79, 55, 24, '#8d9e77');
  const positions = [[0,-16],[14,-8],[14,8],[0,16],[-14,8],[-14,-8]];
  positions.forEach(([dx, dy], i) => {
    const chamber = (i - phase + 6) % 6;
    const fired = chamber < round.attempts;
    const successful = hasHit(round) && chamber + 1 === round.attempts;
    pixelCircle(79 + dx, 55 + dy, 7, '#657850');
    pixelCircle(79 + dx, 55 + dy, 5, successful ? '#e2bd6c' : fired ? '#607455' : '#263a29');
  });
  pixelCircle(79, 55, 4, '#e5ead6');
  rect(78, 54, 3, 3, '#61744f');
  const target = hasHit(round) ? '#e2bd6c' : '#6e8966';
  rect(202, 38, 2, 25, target); rect(190, 50, 26, 2, target);
  rect(195, 42, 17, 2, target); rect(195, 59, 17, 2, target);
  rect(194, 44, 2, 15, target); rect(211, 44, 2, 15, target);
  if (firing) {
    rect(178, 46, 10, 8, '#e2bd6c'); rect(181, 42, 3, 16, '#e2bd6c');
    rect(190, 49, 8, 2, '#e5ead6');
  }
  if (hasHit(round)) {
    rect(200, 47, 6, 8, '#e2bd6c');
    rect(188, 34, 3, 3, '#e2bd6c'); rect(215, 66, 3, 3, '#e2bd6c');
  }
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
