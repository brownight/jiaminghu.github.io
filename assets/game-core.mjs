export function localDay(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function newRound(day, hitAt) {
  if (!Number.isInteger(hitAt) || hitAt < 1 || hitAt > 6) throw new RangeError('hitAt must be between 1 and 6');
  return { day, hitAt, attempts: 0, spun: false };
}

export function restoreRound(raw, day) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.day !== day || !Number.isInteger(value.hitAt) || value.hitAt < 1 || value.hitAt > 6 || !Number.isInteger(value.attempts) || value.attempts < 0 || value.attempts > value.hitAt || typeof value.spun !== 'boolean' || (!value.spun && value.attempts !== 0)) return null;
    return { day, hitAt: value.hitAt, attempts: value.attempts, spun: value.spun };
  } catch { return null; }
}

export function takeShot(round) {
  if (!round.spun || round.attempts >= round.hitAt) return round;
  return { ...round, attempts: round.attempts + 1 };
}

export function hasHit(round) { return round.attempts === round.hitAt; }

export function chooseHit(cryptoSource = globalThis.crypto) {
  const bytes = new Uint8Array(1);
  // Rejection sampling gives all six positions the same probability.
  do { cryptoSource.getRandomValues(bytes); } while (bytes[0] >= 252);
  return bytes[0] % 6 + 1;
}
