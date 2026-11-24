// The read endpoint must never be replaced with the increment endpoint on load.
export const BULLET_ENDPOINT = 'https://counterapi.com/api/jiaminghu.com/bullet/newtons-revolver-v1';

export function createBulletCounter({ fetchImpl = fetch, endpoint = BULLET_ENDPOINT, onCount = () => {}, onState = () => {} } = {}) {
  let busy = false;
  let lastCount = null;

  async function request(increment) {
    if (busy) return false;
    busy = true;
    onState(increment ? 'sending' : 'loading');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetchImpl(increment ? endpoint : `${endpoint}?readOnly=true`, {
        cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal,
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const body = await response.json();
      if (typeof body.value !== 'number' || !Number.isSafeInteger(body.value) || body.value < 0) {
        throw new Error('Invalid counter response');
      }
      lastCount = body.value;
      onCount(lastCount);
      onState(increment ? 'collected' : 'ready');
      return true;
    } catch {
      // A failed write may have reached the server. Never retry automatically.
      onState('error', lastCount);
      return false;
    } finally {
      clearTimeout(timeout);
      busy = false;
    }
  }

  return { read: () => request(false), collect: () => request(true) };
}
