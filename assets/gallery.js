(() => {
  const links = [...document.querySelectorAll('.photo-gallery a')];
  const dialog = document.querySelector('.photo-viewer');
  if (!dialog || typeof dialog.showModal !== 'function' || !links.length) return;

  const image = document.querySelector('#photo-full');
  const counter = document.querySelector('#photo-counter');
  const original = document.querySelector('#photo-original');
  const previous = document.querySelector('#photo-prev');
  const next = document.querySelector('#photo-next');
  let index = 0;
  let opener = null;

  function showPhoto(newIndex) {
    index = (newIndex + links.length) % links.length;
    const thumbnail = links[index].querySelector('img');
    image.src = links[index].href;
    image.alt = thumbnail.alt;
    original.href = links[index].href;
    counter.textContent = `${index + 1} / ${links.length}`;
  }

  links.forEach((link, position) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      showPhoto(position);
      dialog.showModal();
      document.body.classList.add('photo-viewer-open');
    });
  });

  document.querySelector('#photo-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => showPhoto(index - 1));
  next.addEventListener('click', () => showPhoto(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('photo-viewer-open');
    opener?.focus({ preventScroll: true });
  });
})();
