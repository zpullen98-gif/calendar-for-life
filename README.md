# Calendar For Life

> An illuminated almanac of festivals worth flying for.

A self-contained Progressive Web App holding **498 destinations** across twelve charts of the year: 365 voyages in the main calendar, 52 living-history reenactments in The Living Pages, 52 fandom and convention gatherings in The Other Worlds, and 29 long-form Pilgrimages Of Humanity. One HTML file, no backend, fully offline once installed. Packaged for sale on the Microsoft Store, Google Play, the Apple App Store, and itch.io via [PWABuilder](https://www.pwabuilder.com/).

---

## Project layout

```
CalendarForLife/
├─ index.html              ← the app itself (cover, twelve charts, 365 voyages)
├─ manifest.webmanifest    ← PWA manifest (name, icons, theme color, shortcuts)
├─ sw.js                   ← service worker (offline cache for app + fonts)
├─ offline.html            ← parchment fallback shown if a request can't be served
├─ generate-icons.html     ← one-click PNG icon generator (run once in a browser)
├─ icons/
│  ├─ icon.svg             ← master compass rose (1024 viewBox)
│  └─ icon-*.png           ← generated PNG sizes (see generate-icons.html)
├─ .github/workflows/
│  └─ pages.yml            ← deploys to GitHub Pages on every push
├─ DEPLOY.md               ← step-by-step shipping guide (read this next)
└─ README.md               ← this file
```

The source `Calendar_For_Life_7.html` in your Downloads folder is untouched. Edit `index.html` here instead going forward.

---

## Run locally

The service worker can't register from `file://`. Serve the folder over HTTP. Two zero-install options on Windows:

**PowerShell, one-liner (no installs):**
```powershell
# from inside C:\Users\zpull\CalendarForLife
python -m http.server 8080
# then open http://localhost:8080
```
Windows usually ships with the Python launcher. If `python` isn't on PATH, try `py -m http.server 8080`.

**No Python? Use Node's npx (one-time prompt to download):**
```powershell
npx --yes http-server -p 8080
```

Open Chrome → `http://localhost:8080` → DevTools → Application tab:
- **Manifest**: should show "Calendar For Life", icons, theme color.
- **Service Workers**: status `activated and is running`.
- **Lighthouse → PWA audit**: should score green.

---

## First-time setup checklist

1. **Generate icons** — open `http://localhost:8080/generate-icons.html` once, click *Generate Icons*, then *Download All (.zip)*. Unzip into the project root so the PNGs land in `icons/`.
2. **Verify install** — Chrome's URL bar shows an install icon; click it; the app opens as a standalone window with its own taskbar entry.
3. **Verify offline** — DevTools → Application → Service Workers → check *Offline* → reload. The Almanac still loads.

Once those three pass, you're ready for [`DEPLOY.md`](./DEPLOY.md).

---

## Selling for $2.99 — the honest economics

Read this before submitting anywhere.

| Channel              | Up-front fee     | Cut per sale | Net per $2.99 sale | Submission friction              |
|----------------------|------------------|--------------|--------------------|----------------------------------|
| **itch.io**          | $0               | ~10% (default, configurable) | ~$2.69 | Live in minutes, no review.      |
| **Microsoft Store**  | $0 (individuals) | 15%          | ~$2.54             | ~3-day review, signing handled.  |
| **Google Play**      | $25 one-time     | 15% (under $1M/yr) | ~$2.54       | ~3-day review, $25 to start.     |
| **Apple App Store**  | $99/year         | 15% (Small Business Program) | ~$2.54 | Mac required to build. 1–2 wk review. |

**Apple's $99/year now breaks even at ~39 paid downloads/year** (down from 117 at $1) — still worth thinking twice about, but a much more achievable target. Skip iOS at launch unless you specifically want an iPhone presence.

**Code-signing Windows packages outside the Microsoft Store** triggers SmartScreen warnings unless you buy an EV certificate ($200–$400/year). The Microsoft Store path avoids this — that's why this guide recommends it for Windows.

**Why $2.99 is a better number than $1.** A $1 price keeps ~$0.85 after platform cuts. A $2.99 price keeps ~$2.54 — three times the net per sale for the same one-time download. $2.99 is also the standard pricing "anchor" for niche utility/reference apps: customers expect to pay it; psychologically it reads as "still under three bucks." If you find sales slow at $2.99, dropping to $1.99 nets ~$1.69 (still 2× the $1 case). On itch.io, you can additionally enable *name-your-own-price* with $2.99 as the minimum so some buyers tip up.

---

## Recommended shipping order

1. **itch.io (web build)** — fastest path to a public URL with a "pay to download" button. No review, no signing, no developer-account fee. Live in 30 minutes.
2. **Microsoft Store** — free for individuals, .msix produced by PWABuilder, ~3-day review.
3. **Google Play** — $25 one-time fee, .aab produced by PWABuilder, ~3-day review.
4. **Apple App Store** — only if you have (or will rent) a Mac and accept the $99/year. Last because of friction.

The detailed walkthrough for each is in [`DEPLOY.md`](./DEPLOY.md).

---

## What you'll need to provide along the way

Things I can't do for you, from the plan:

- **Developer accounts** (your identity + payment): Microsoft Partner Center, Google Play Console, Apple Developer Program, itch.io account.
- **Store listing copy** — title, short description, long description, age rating, content tags. Drafts in `DEPLOY.md`.
- **Screenshots** — captured from the running app on the right device sizes. Instructions in `DEPLOY.md`.
- **Privacy policy URL** — required by Google Play and Apple. Even a one-page "we collect no data" page is enough; this app doesn't have any backend, telemetry, or accounts.
- **Mac access** — for iOS only. You're on Windows; cloud Mac rental (MacInCloud, MacStadium) starts ~$30/month if you go iOS.

---

## License & attribution

This is your project. The HTML content (the 365 voyages, the Yggdrasil cover art, the typography choices) is original work bundled in the source. Google Fonts (Cinzel, Cinzel Decorative, IM Fell English, Pinyon Script, UnifrakturMaguntia) are SIL Open Font License — free to embed, redistribute, and sell apps that load them.

Set up a `LICENSE` file before publishing if you want to formalize this.
