# Jiaming Hu · personal website

A lightweight, three-page personal website for **jiaminghu.com**. Plain HTML, CSS, and JavaScript; no framework or build dependency.

## Pages

- `index.html` — academic homepage: portrait and social links, about, research interests, news, publications.
- `revolver.html` — Revolver Theory / 左轮理论, with an English/Chinese essay and a small interactive daily game.
- `life.html` — fitness, basketball, hiking, and photography.

This is an initial draft. The portrait, Google Scholar/LinkedIn/X URLs, publication list, news, and photography have not yet been supplied. Their placeholders are deliberately identifiable; no publication records or photographs are fabricated. The essay is a draft adapted from Jiaming's supplied explanation, not an uploaded private chat.

## Editing

Edit page text directly in the corresponding HTML files. Shared styles are in `assets/style.css`. Social icons and the reading-language switch are in `assets/site.js`.

Replace the portrait placeholder with an image and descriptive alt text. Replace each pending social `<span>` with an `<a>` containing the real profile URL. Add publication records and dated news in their homepage sections. Replace the photography placeholder with the owner's images and captions.

## Game

The metaphor is about pursuing a goal and remaining open to opportunities. A hit represents success; there is no depiction of harm or gun aimed at a person.

A local-calendar daily round draws one uniformly random successful position from 1–6 using Web Crypto. Spinning starts the round; each subsequent click advances one attempt. The game stops at the first hit. State persists in localStorage on this browser, and a new day creates a new round. Replaying keeps the same daily outcome. Without storage, it works for the current page session. It has no server, analytics, tracking, or cross-device synchronization.

Run the game logic checks with:

```sh
node --test tests/game.test.mjs
```

## Local preview

Run `python3 -m http.server 8000` from this directory, then open `http://localhost:8000/`. The supplied ZIP also contains `Revolver_Theory_Preview.html`, a standalone preview of the philosophy page that can be opened directly.

## GitHub Pages

The site is ready for branch-based hosting from `main` and `/ (root)` once GitHub Pages is enabled in repository settings. This draft does not enable Pages, configure Cloudflare DNS, or bind a custom domain. Add the domain only after it is verified and DNS setup is ready.

Because the account is `brownight`, this repository is a project site until a custom domain is configured; its name alone does not register `jiaminghu.github.io`. All internal asset and page URLs are relative so the site can work at either a project path or the custom domain.
