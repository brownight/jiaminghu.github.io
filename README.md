# Jiaming Hu · personal website

A lightweight, three-page personal website for **jiaminghu.com**. Plain HTML, CSS, and JavaScript; no framework or build dependency.

## Pages

- `index.html` — academic homepage: portrait and social links, about, research interests, and news.
- `publications.html` — twelve papers and benchmark projects grouped under game-theoretic approaches to AI, AI evaluation, and following curiosity.
- `life.html` — fitness, basketball, hiking, photography, games, and a small game under “Just for fun”.

The old `revolver.html` URL redirects to `life.html#fun`.

The portrait, Google Scholar/LinkedIn/X links, and selected publication list are in place. Personal Life includes six photographs with a full-size viewer. The scrollable homepage News section includes the StatArena v0.1 release with Jiaming's project lead role, the Unity internship, three paper acceptances (including Agents’ Last Exam), and the Terminal-Bench-Science v0.1 release with Jiaming's Senior Reviewer and Outreach Lead roles.

## Editing

Edit page text directly in the corresponding HTML files. Shared styles are in `assets/style.css`. Social icons and the copyright year are in `assets/site.js`.

The profile photo is `assets/jiaming-hu.jpg`; its presentation is controlled by the `.portrait` style. Social profile URLs are in `index.html`. Add publication records in `publications.html` and dated news in the homepage News section. Original photographs are in `assets/photos/`; their display order and descriptive alt text are in `life.html`. Images preserve the supplied files and aspect ratios. `assets/gallery.js` adds a native-dialog viewer with previous/next controls, keyboard navigation, and Escape to close. Without JavaScript, each photo links directly to its original file.

Publication titles link to their arXiv records or official release pages, with additional project and user-supplied Google Scholar links where available. Venue labels reflect confirmed acceptances; other papers use their arXiv year. Terminal-Bench-Science is labeled as a benchmark release. Humanity's Last Exam links to the arXiv author list, rather than assigning a venue from a different author version.

Keep news in newest-first order. Acceptance dates use the official author-notification schedules: [NeurIPS 2026](https://neurips.cc/Conferences/2026/Dates) (September 24) and [ML × OR](https://mlxor-2026.github.io/) (September 29). The [Terminal-Bench-Science announcement](https://www.terminal-bench-science.ai/announcement) is dated August 27, 2026. The Unity internship month was supplied by Jiaming.

## Game

The metaphor is about pursuing a goal and remaining open to opportunities. A hit represents success; there is no depiction of harm or gun aimed at a person.

Each page load or **New round** draws a fresh, uniformly random successful position from 1–6 using Web Crypto with rejection sampling. There is no date seed or stored outcome. Each discrete click adds momentum; momentum decays with elapsed time. Only a full meter fires one shot, then the meter resets. Shots move through the six chambers and stop on the randomly placed hit. Holding a keyboard key does not auto-charge. The low-resolution canvas shows a little Newton cowboy aiming at an apple, with a small six-chamber cylinder in the corner. The theory and controls share the same scene; the text overlays the sky on desktop and flows above the art on mobile. Artwork is drawn in `assets/revolver-scene.mjs`.

Run the game logic checks with:

```sh
node --test tests/game.test.mjs tests/revolver-motion.test.mjs
```

Each shot fires, then whips the small cylinder through a full revolution plus one chamber before the controls unlock, including the successful shot. It settles at the next chamber without a backward reset. New rounds spin the cylinder several times. These animations never change the random outcome; reduced-motion preferences skip the animation while preserving the same chamber progression.

The small Plays counter beside the game's footer is transparent until hovered or keyboard-focused (tap to reveal on touchscreens). It counts the first actual shot in each round once, including rounds whose first shot is a hit. Page loads, charging taps, later shots in the same round, and pressing New Round without firing do not increment it. The same public Counter API used for likes stores this separate total; writes wait for a pending read and are never automatically retried. Local previews make no counter requests. Failed reads show `—` or the last confirmed total. As with likes, live connectivity remains unverified because the service blocked the development environment.

## Page views

The three page footers share a small `views` badge from [Hits](https://hits.sh/). `assets/site.js` makes one SVG request per page load on `jiaminghu.com` or `www.jiaminghu.com`, with no referrer sent and no third-party JavaScript. All pages use the same server-stored counter. Local previews do not count.

The total begins when this counter is enabled; it cannot recover earlier visits. It counts page loads, including refreshes and automated requests, rather than unique people. Requests blocked by a browser or a service outage may not count. If the badge fails or times out, it stays hidden without displaying a fabricated total.

The views badge is transparent until hovered or keyboard-focused. Touch visitors can tap its footer area to reveal it and tap elsewhere to hide it.

## Game likes

The small Like button has a pointed pixel bullet icon and uses the documented public [Counter API](https://counterapi.com/) endpoint under the `jiaminghu.com` namespace. A page load reads with `readOnly=true`; only an explicit button click requests an increment. The returned server total is shared across visitors. Refreshing the page and firing the revolver do not add likes. After server confirmation, the button becomes Liked and remembers this in browser local storage to prevent repeated likes from that browser. If storage is unavailable, the confirmed state lasts for the current page session. This is a playful appreciation total, not a verified unique-person count.

No API keys, third-party scripts, cookies, local fabricated totals, or automatic increment retries are used. Previews never call the production counter. A request failure keeps the last confirmed number or displays `—`. These public counts depend on the external service and are not tamper-proof. Its API rejected requests from the development environment during implementation, so live connectivity was not verified here.

Run its read/write and failure checks with `node --test tests/bullet-counter.test.mjs`.

## Local preview

Run `python3 -m http.server 8000` from this directory, then open `http://localhost:8000/`.

## GitHub Pages

GitHub Pages serves this site from `main` and `/ (root)`. The custom domain is not yet bound. Add the domain only after it is verified and DNS setup is ready.

Because the account is `brownight`, this repository is a project site until a custom domain is configured; its name alone does not register `jiaminghu.github.io`. All internal asset and page URLs are relative so the site can work at either a project path or the custom domain.
