import { createBulletCounter } from './bullet-counter.mjs?v=bullet-1';

export const PLAY_ENDPOINT = 'https://counterapi.com/api/jiaminghu.com/play/newtons-revolver-v1';

// Queue first-shot events behind the initial read, so slow reads cannot lose plays.
export function createPlayCounter(options = {}) {
  const counter = createBulletCounter({ ...options, endpoint: PLAY_ENDPOINT });
  let pending = counter.read();
  let lastRecordedRound = 0;
  return {
    recordRound(roundNumber) {
      if (!Number.isSafeInteger(roundNumber) || roundNumber <= lastRecordedRound) return Promise.resolve(false);
      lastRecordedRound = roundNumber;
      // Each round gets one attempt; uncertain network writes are never retried.
      pending = pending.then(() => counter.collect());
      return pending;
    },
  };
}

export function initGamePlays() {
  const button = document.querySelector('#game-plays');
  const count = document.querySelector('#game-play-count');
  if (!button || !count) return () => {};
  button.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') button.classList.toggle('is-revealed');
  });
  document.addEventListener('pointerdown', event => {
    if (!button.contains(event.target)) button.classList.remove('is-revealed');
  });
  button.addEventListener('blur', () => button.classList.remove('is-revealed'));
  if (!['jiaminghu.com', 'www.jiaminghu.com'].includes(location.hostname)) {
    count.textContent = '—';
    return () => {};
  }
  let confirmedTotal = null;
  const tracker = createPlayCounter({
    onCount(value) {
      confirmedTotal = value;
      count.textContent = value.toLocaleString('en-US');
      button.setAttribute('aria-label', `${value} total game plays`);
      button.title = 'Rounds played — counted on the first shot of each round';
    },
    onState(state) {
      if (state === 'error') {
        if (confirmedTotal === null) count.textContent = '—';
        button.title = 'The latest play count could not be confirmed.';
      }
    },
  });
  return roundNumber => { void tracker.recordRound(roundNumber); };
}
