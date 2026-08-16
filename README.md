# Calendar For Life

> An illuminated almanac of festivals worth flying for.

## ▶ Open the app

# **[zpullen98-gif.github.io/calendar-for-life](https://zpullen98-gif.github.io/calendar-for-life/)**

Free, no sign-up, works offline once opened. Click **Set Sail** on the cover to enter the almanac.

Install it as a real app: in Chrome or Edge, look for the **install icon** at the right of the address bar, or menu → *Install Calendar For Life*. On iPhone, Share → *Add to Home Screen*.

---

## What it is

A self-contained Progressive Web App holding **799 entries** across five books:

| Book | Entries | What it holds |
|---|---|---|
| The Twelve Charts | **365** | one voyage for every day of the year |
| Pilgrimages Of Humanity | **290** | 29 long-form trails of 10 stops each |
| The Days of Yore | **60** | pirate, viking, medieval and renaissance gatherings |
| The Other Worlds | **52** | fandom conventions and film-location gatherings |
| The Living Pages | **32** | battle reenactments and living-history encampments |

Every entry carries a port of call, dates, a description, lodging, food, a quote, and two nearby "bearings" worth the detour. **779** of them also carry a curated film.

Two more views cross-list rather than duplicate: **The Proving Grounds** (the sporting entries) and part of **The Other Worlds** (the fandom-flagged calendar voyages).

One HTML file. No backend, no accounts, no tracking, no analytics. Bookmarks, journals and galley notes live in your own browser and never leave it. The only outside request the page makes is to Google Fonts.

**It is free.** The almanac is the front door for **Calendar For Life Voyages**, a full-service festival travel agency — every entry has a *Plan This Voyage* button that sends an enquiry.

---

## Run it locally

The service worker cannot register from `file://`, so the folder has to be served over HTTP.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. If `python` is not on PATH, try `py -m http.server 8080`, or use Node:

```bash
npx --yes http-server -p 8080
```

**If a change does not appear**, the service worker is serving a cached copy. A `?v=2` on the URL will *not* help, because the worker matches with `ignoreSearch: true`. Open DevTools → Application → unregister the service worker, delete the caches, *then* reload.

---

## Project layout

```
CalendarForLife/
├─ index.html              ← the entire app: markup, styles, script, and ten JSON data islands
├─ manifest.webmanifest    ← PWA manifest (name, icons, shortcuts, app id)
├─ sw.js                   ← service worker; bump CACHE_VERSION on every index.html change
├─ offline.html            ← parchment fallback when a request cannot be served
├─ privacy.html            ← what is stored and where (answer: your browser only)
├─ robots.txt, sitemap.xml
├─ icons/                  ← 18 PNG sizes plus the master compass-rose SVG
├─ images/
│  ├─ cover.jpg            ← the cover art
│  └─ social-card.jpg      ← 1200x630 card for link previews
└─ .github/workflows/
   └─ pages.yml            ← builds and publishes on every push to main
```

`index.html` is about 2.1 MB, and roughly 85% of that is the content itself, held in ten
single-line JSON islands. That is not bloat to be optimised away: the payload *is* the product.

---

## How deployment works

Push to `main` and the site updates. That is the whole workflow.

`pages.yml` stages only the app files into `_site` and force-pushes them to the `gh-pages`
branch, which GitHub Pages serves. It deliberately does **not** use the Pages REST API: that
route failed repeatedly with `Resource not accessible by integration`, because this
repository's workflow token may not create a Pages site. Pushing a branch needs only
`contents: write`, so nothing has to be switched on by hand.

The workflow also carries a guard step that **fails the build** if anything private is ever
staged for publication.

---

## Verifying a change

After editing `index.html`:

1. Bump `CACHE_VERSION` in `sw.js`, or returning visitors keep the old app.
2. Unregister the service worker and delete caches before reloading.
3. Check the counts still read 365 / 29 trails / 290 stops / 32 / 52 / 60, with 779 films.

The full ritual, the editorial history, and the traps that have already cost real debugging
time are written up in the project notes kept outside this repository.

---

## Licence and attribution

The content is original work. The typefaces (Cinzel, Cinzel Decorative, IM Fell English,
Pinyon Script, UnifrakturMaguntia) are served by Google Fonts under the SIL Open Font
Licence. Add a `LICENSE` file before promoting the project if you want the terms formalised.
