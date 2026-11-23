export const FULL_TURN = Math.PI * 2;
export const CHAMBER_ANGLE = FULL_TURN / 6;
export const FIRE_DURATION = 180;
export const TURN_DURATION = 460;
export const SPIN_DURATION = 1100;

const clamp = value => Math.max(0, Math.min(1, value));
const smoothStep = value => value * value * (3 - 2 * value);

// Visual motion only: these functions never draw randomness or inspect hitAt.
export function shotMotion(fromAngle, elapsedMs, reducedMotion = false) {
  const endAngle = fromAngle - CHAMBER_ANGLE;
  if (reducedMotion) return { angle: endAngle, phase: '', done: true };
  if (elapsedMs < FIRE_DURATION) return { angle: fromAngle, phase: 'fire', done: false };
  const progress = clamp((elapsedMs - FIRE_DURATION) / TURN_DURATION);
  return {
    angle: fromAngle - CHAMBER_ANGLE * smoothStep(progress),
    phase: progress < 1 ? 'turn' : '',
    done: progress === 1,
  };
}

export function spinMotion(fromAngle, elapsedMs, reducedMotion = false) {
  // At least three full turns, ending with chamber zero at the top.
  const endAngle = (Math.floor(fromAngle / FULL_TURN) - 3) * FULL_TURN;
  if (reducedMotion) return { angle: endAngle, phase: '', done: true };
  const progress = clamp(elapsedMs / SPIN_DURATION);
  const eased = 1 - Math.pow(1 - progress, 3);
  return {
    angle: fromAngle + (endAngle - fromAngle) * eased,
    phase: progress < 1 ? 'spin' : '',
    done: progress === 1,
  };
}
