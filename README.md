# Jiaming Hu · personal website

A lightweight, three-page personal website for **jiaminghu.com**. Plain HTML, CSS, and JavaScript; no framework or build dependency.

## Pages

- `index.html` — academic homepage: portrait and social links, about, research interests, and news.
- `publications.html` — research publications.
- `life.html` — fitness, basketball, hiking, photography, and a small daily game under “Just for fun”.

The old `revolver.html` URL redirects to `life.html#fun`.

This is an initial draft. The portrait and Google Scholar/LinkedIn links are in place. The X URL, full publication list, and photography have not yet been supplied. The homepage News section includes the Unity internship, two NeurIPS 2026 acceptances, and the Terminal-Bench-Science v0.1 release. Their placeholders are deliberately identifiable; no publication records or photographs are fabricated.

## Editing

Edit page text directly in the corresponding HTML files. Shared styles are in `assets/style.css`. Social icons and the copyright year are in `assets/site.js`.

The profile photo is `assets/jiaming-hu.jpg`; its presentation is controlled by the `.portrait` style. Replace each pending social `<span>` with an `<a>` containing the real profile URL. Add publication records in `publications.html` and dated news in the homepage News section. Replace the photography placeholder with the owner's images and captions.

## Game

The metaphor is about pursuing a goal and remaining open to opportunities. A hit represents success; there is no depiction of harm or gun aimed at a person.

A local-calendar daily round draws one uniformly random successful position from 1–6 using Web Crypto. Spinning starts the round; each subsequent click advances one attempt. The game stops at the first hit. State persists in localStorage on this browser, and a new day creates a new round. Replaying keeps the same daily outcome. Without storage, it works for the current page session. It has no server, analytics, tracking, or cross-device synchronization.

Run the game logic checks with:

```sh
node --test tests/game.test.mjs
```

## Local preview

Run `python3 -m http.server 8000` from this directory, then open `http://localhost:8000/`.

## GitHub Pages

GitHub Pages serves this site from `main` and `/ (root)`. The custom domain is not yet bound. Add the domain only after it is verified and DNS setup is ready.

Because the account is `brownight`, this repository is a project site until a custom domain is configured; its name alone does not register `jiaminghu.github.io`. All internal asset and page URLs are relative so the site can work at either a project path or the custom domain.
