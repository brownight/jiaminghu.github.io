import { createBulletCounter } from './bullet-counter.mjs?v=bullet-1';

const button = document.querySelector('#bullet-button');
const label = document.querySelector('#bullet-label');
const count = document.querySelector('#bullet-count');
const status = document.querySelector('#bullet-status');

if (button && label && count && status) {
  if (['jiaminghu.com', 'www.jiaminghu.com'].includes(location.hostname)) {
    let total = null;
    const likedKey = 'newtons-revolver-liked-v1';
    let liked = false;
    try { liked = localStorage.getItem(likedKey) === 'yes'; } catch { /* Storage may be unavailable. */ }
    const counter = createBulletCounter({
      onCount(value) {
        total = value;
        count.textContent = value.toLocaleString('en-US');
      },
      onState(state) {
        if (state === 'collected') {
          liked = true;
          try { localStorage.setItem(likedKey, 'yes'); } catch { /* Keep the session's confirmed like. */ }
        }
        const busy = state === 'loading' || state === 'sending';
        button.disabled = busy || liked;
        button.setAttribute('aria-busy', String(busy));
        button.setAttribute('aria-pressed', String(liked));
        button.classList.toggle('is-sending', state === 'sending');
        button.classList.toggle('is-collected', liked);
        label.textContent = liked ? 'Liked' : 'Like';
        button.setAttribute('aria-label', `${liked ? 'You liked this game' : 'Like this game'}${total === null ? '' : `; ${total} likes in total`}`);
        if (state === 'collected') {
          status.textContent = `Thanks for the like! ${total} likes in total.`;
          button.title = 'You liked this game. Thank you!';
        } else if (state === 'error') {
          if (total === null) count.textContent = '—';
          status.textContent = 'The like count could not be confirmed. Please try again later.';
          button.title = 'Could not confirm the count. Please try again later.';
        } else if (state === 'ready') {
          button.title = liked ? 'You liked this game. Thank you!' : 'Like this game';
        } else if (state === 'sending') {
          status.textContent = 'Sending your like…';
        }
      },
    });
    button.addEventListener('click', () => { if (!liked) counter.collect(); });
    counter.read();
  } else {
    // Local previews never read or increment the production count.
    count.textContent = '—';
    button.title = 'Likes are available on the live site.';
  }
}
