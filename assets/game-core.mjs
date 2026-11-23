export const CHARGE_MAX = 100;
export const CHARGE_PER_TAP = 22;
export const CHARGE_DECAY_PER_SECOND = 24;

// A fresh round samples a new position. Nothing is seeded by date or persisted.
export function newRound(hitAt = chooseHit()) {
  if (!Number.isInteger(hitAt) || hitAt < 1 || hitAt > 6) throw new RangeError('hitAt must be between 1 and 6');
  return { hitAt, attempts: 0 };
}

export function takeShot(round) {
  if (round.attempts >= round.hitAt) return round;
  return { ...round, attempts: round.attempts + 1 };
}

export function hasHit(round) { return round.attempts === round.hitAt; }

function clampCharge(charge) {
  return Math.max(0, Math.min(CHARGE_MAX, charge));
}

export function decayCharge(charge, elapsedMs) {
  return clampCharge(charge - CHARGE_DECAY_PER_SECOND * Math.max(0, elapsedMs) / 1000);
}

export function addCharge(charge) {
  return clampCharge(charge + CHARGE_PER_TAP);
}

export function chooseHit(cryptoSource = globalThis.crypto) {
  const bytes = new Uint8Array(1);
  // Rejection sampling gives all six positions the same probability.
  do { cryptoSource.getRandomValues(bytes); } while (bytes[0] >= 252);
  return bytes[0] % 6 + 1;
}
