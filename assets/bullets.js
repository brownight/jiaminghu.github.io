import { createBulletCounter } from './bullet-counter.mjs?v=bullet-1';

const button = document.querySelector('#bullet-button');
const count = document.querySelector('#bullet-count');
const status = document.querySelector('#bullet-status');

if (button && count && status) {
  if (['jiaminghu.com', 'www.jiaminghu.com'].includes(location.hostname)) {
    let total = null;
    let flash;
    const counter = createBulletCounter({
      onCount(value) {
        total = value;
        count.textContent = value.toLocaleString('en-US');
      },
      onState(state) {
        const busy = state === 'loading' || state === 'sending';
        button.disabled = busy;
        button.setAttribute('aria-busy', String(busy));
        button.classList.toggle('is-sending', state === 'sending');
        button.setAttribute('aria-label', `Leave a bullet${total === null ? '' : `; ${total} collected in total`}`);
        if (state === 'collected') {
          button.classList.add('is-collected');
          status.textContent = `Thanks for the bullet! ${total} collected in total.`;
          button.title = `${total} bullets collected. Leave another?`;
          clearTimeout(flash);
          flash = setTimeout(() => button.classList.remove('is-collected'), 1200);
        } else if (state === 'error') {
          if (total === null) count.textContent = '—';
          status.textContent = 'The bullet count could not be confirmed. Please try again later.';
          button.title = 'Could not confirm the count. Please try again later.';
        } else if (state === 'ready') {
          button.title = 'Like the game? Leave a bullet.';
        } else if (state === 'sending') {
          status.textContent = 'Sending your bullet…';
        }
      },
    });
    button.addEventListener('click', () => counter.collect());
    counter.read();
  } else {
    // Local previews never read or increment the production count.
    count.textContent = '—';
    button.title = 'Bullet collection is available on the live site.';
  }
}
