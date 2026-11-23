# Jiaming Hu · personal website

A lightweight, three-page personal website for **jiaminghu.com**. Plain HTML, CSS, and JavaScript; no framework or build dependency.

## Pages

- `index.html` — academic homepage: portrait and social links, about, research interests, and news.
- `publications.html` — twelve papers and benchmark projects grouped under game-theoretic approaches to AI, AI evaluation, and following curiosity.
- `life.html` — fitness, basketball, hiking, photography, and a small daily game under “Just for fun”.

The old `revolver.html` URL redirects to `life.html#fun`.

The portrait, Google Scholar/LinkedIn links, and selected publication list are in place. The X URL and photography have not yet been supplied. The scrollable homepage News section includes the Unity internship, three paper acceptances (including Agents’ Last Exam), and the Terminal-Bench-Science v0.1 release with Jiaming's Senior Reviewer and Outreach Lead roles.

## Editing

Edit page text directly in the corresponding HTML files. Shared styles are in `assets/style.css`. Social icons and the copyright year are in `assets/site.js`.

The profile photo is `assets/jiaming-hu.jpg`; its presentation is controlled by the `.portrait` style. Replace each pending social `<span>` with an `<a>` containing the real profile URL. Add publication records in `publications.html` and dated news in the homepage News section. Replace the photography placeholder with the owner's images and captions.

Publication titles link to their arXiv records or official release pages, with additional project and user-supplied Google Scholar links where available. Venue labels reflect confirmed acceptances; other papers use their arXiv year. Terminal-Bench-Science is labeled as a benchmark release. Humanity's Last Exam links to the arXiv author list, rather than assigning a venue from a different author version.

Keep news in newest-first order. Acceptance dates use the official author-notification schedules: [NeurIPS 2026](https://neurips.cc/Conferences/2026/Dates) (September 24) and [ML × OR](https://mlxor-2026.github.io/) (September 29). The [Terminal-Bench-Science announcement](https://www.terminal-bench-science.ai/announcement) is dated August 27, 2026. The Unity internship month was supplied by Jiaming.

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
