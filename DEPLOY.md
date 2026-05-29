# Deploy guide — Calendar For Life

Step-by-step from "files on my laptop" → "app for sale on four stores".

Prereqs (one-time, on this Windows machine):
- A GitHub account (free).
- The icons generated (open `generate-icons.html` once, *Generate*, *Download All*, unzip into project root).
- The app running locally at `http://localhost:8080` with the manifest valid and the service worker active in Chrome DevTools.

---

## Phase A · Host the PWA on the public web

PWABuilder needs an HTTPS URL pointing at this project. Easiest free option: **GitHub Pages**.

### A1. Create the GitHub repo

```powershell
# from C:\Users\zpull\CalendarForLife
git init
git add -A
git commit -m "Initial PWA build of Calendar For Life"
# create the repo on github.com (call it 'calendar-for-life'), then:
git remote add origin https://github.com/<your-username>/calendar-for-life.git
git branch -M main
git push -u origin main
```

### A2. Enable GitHub Pages

The included workflow at `.github/workflows/pages.yml` deploys on every push to `main`. After your first push:

1. GitHub → repo → **Settings → Pages**.
2. **Source**: *GitHub Actions*.
3. Wait ~60 seconds for the first run (**Actions** tab).
4. Pages URL appears: `https://<your-username>.github.io/calendar-for-life/`.

Open that URL in Chrome. Confirm:
- The cover loads, *Set Sail* opens the almanac.
- DevTools → Application → **Manifest** shows green.
- DevTools → Application → **Service Workers** shows it activated.
- Lighthouse → **PWA** audit scores ≥ 90.

If any of those fail, fix locally, commit + push, and Pages will redeploy.

---

## Phase B · Generate native packages with PWABuilder

1. Go to **https://www.pwabuilder.com/**.
2. Paste your Pages URL. Click **Start**.
3. PWABuilder scores the PWA (Manifest / Service Worker / Security). Aim for green on all three. Apply suggested fixes by editing the manifest and re-pushing.
4. Click **Package For Stores**. Generate one or more of:
   - **Windows (MSIX)** — for the Microsoft Store *and* sideloading.
   - **Android (AAB)** — for Google Play. PWABuilder uses Bubblewrap behind the scenes.
   - **iOS (Xcode project)** — needs a Mac to build/sign/upload.
   - **macOS (PKG)** — needs a Mac.

Each download includes signing & submission instructions in its own README.

---

## Phase C · Ship to each store (in this order)

### 1. itch.io  (fastest revenue — start here)

1. Sign up at https://itch.io (free).
2. Dashboard → **Create new project**.
3. **Kind**: *HTML* (browser-playable).
4. **Pricing**: *Paid* → set to $2.99, or *Name your own price* with $2.99 minimum (some buyers will tip up).
5. **Uploads**: zip the project folder (everything except `.git/` and `generate-icons.html`) and upload as the HTML build. Tick "This file will be played in the browser." Set the entry point to `index.html`.
6. **Embed options**: 1024 × 768 frame, mobile-friendly checked.
7. Cover image (630 × 500 minimum) — use a screenshot of the cover, or rerender `icons/icon-1024.png` on a parchment background.
8. **Genre**: Other  • **Tags**: travel, calendar, fantasy, medieval, nautical, almanac.
9. Publish.

Net per $2.99 sale: ~$2.69 after itch's default cut.

### 2. Microsoft Store

1. Sign up at **Microsoft Partner Center → Apps and games** (free for individual accounts as of 2021).
2. **Create a new app reservation** — name: *Calendar For Life*.
3. Upload the `.msixbundle` produced by PWABuilder under **Packages**.
4. **Pricing & availability**: $2.99 (a standard Store tier).
5. **Properties**:
   - Category: *Books & reference*  (closer match than Travel for an almanac).
   - Subcategory: *Reference*.
6. **Age rating**: complete the IARC questionnaire (no objectionable content — should be 3+).
7. **Privacy policy URL**: required. See `Phase D` below for the one-page version.
8. **Store listing**: title, description, 4+ screenshots (Phase E), feature graphic.
9. Submit. Reviews usually take 24–72 hours.

Net per $2.99 sale: ~$2.54.

### 3. Google Play

1. Sign up at https://play.google.com/console — $25 one-time.
2. Verify identity (passport / driver's license).
3. **Create app** → name *Calendar For Life*, default language English (US), App, Paid, accept policies.
4. **App content**: privacy policy URL, ads (No), content rating (PEGI 3 / ESRB E), target audience (13+).
5. **Main store listing**: short description (80 chars), full description (4000 chars), feature graphic (1024 × 500), 2+ phone screenshots, 1+ tablet screenshot, icon (512 × 512).
6. **Pricing**: $2.99.
7. **Production** → **Create new release** → upload the `.aab` PWABuilder produced.
8. Submit for review. Usually 1–3 days for a new app.

Net per $2.99 sale: ~$2.54 under the Play 15% tier (everyone is under it for the first $1M/year).

### 4. Apple App Store  (only if iOS matters to you)

Requires a Mac (or rented cloud Mac), Xcode, and a paid Apple Developer account ($99/year).

1. Enroll at https://developer.apple.com/programs/ — $99/year.
2. Open the PWABuilder Xcode project on the Mac.
3. App ID: *com.yourname.calendar-for-life* (unique, reverse-domain).
4. Archive → Distribute → upload to App Store Connect via Xcode Organizer.
5. App Store Connect:
   - Pricing: Tier 3 ($2.99).
   - Privacy policy URL (Phase D).
   - Age rating (4+).
   - Screenshots for at least one iPhone size (6.7" *or* 6.5") and one iPad size if you want iPad shown.
   - Submit for review. Apple's bar is higher — expect 1–2 weeks and possibly one revision round.

Net per $2.99 sale: ~$2.54 under the Small Business Program.

---

## Phase D · Privacy policy (required by Google & Apple)

Even though this app does nothing online, the stores still require a hosted privacy-policy URL. Easiest: a single static page on the same GitHub Pages site.

Create `privacy.html` next to `index.html`:

```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Privacy Policy — Calendar For Life</title>
<style>body{font-family:Georgia,serif;max-width:680px;margin:3rem auto;padding:0 1rem;line-height:1.6;color:#222}</style>
</head><body>
<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> <!-- date -->.</p>
<p>Calendar For Life does not collect, store, transmit, or share any personal data. The app runs entirely on your device and contains no analytics, advertising, telemetry, or account system. No data leaves your device.</p>
<p>Fonts are loaded once from Google Fonts (fonts.googleapis.com / fonts.gstatic.com) and cached by the app's service worker. Google Fonts may log IP addresses per its own policy. No identifying information is sent.</p>
<p>Contact: <em>your-email@example.com</em></p>
</body></html>
```

Push to GitHub → it's live at `https://<user>.github.io/calendar-for-life/privacy.html`. Use that URL in each store form.

---

## Phase E · Screenshots

Each store wants several. Capture from a running app instance.

**Desktop (Microsoft Store, itch.io)**
- 1280 × 800 (and 1920 × 1080 if you want a hero image).
- Capture: (1) cover with compass rose, (2) twelve charts grid, (3) a voyage scroll modal open, (4) chart-detail view with month + voyages.

**Phone (Google Play, Apple App Store)**
- Android: 1080 × 1920 (portrait). Use Chrome DevTools → device toolbar → Pixel 7. F12 → mobile mode → screenshot icon (vertical ⋮ menu in the device bar).
- iOS: 1290 × 2796 (6.7" iPhone) or 1284 × 2778 (6.5"). Same trick with iPhone 14 Pro Max in DevTools.

Save under `screenshots/` and reference them from `manifest.webmanifest` if you want the install-prompt to show them too (already wired).

---

## Phase F · After launch

- **Updates**: push to `main` → GitHub Pages auto-deploys → installed PWAs refresh on next launch (service worker handles versioning via `CACHE_VERSION` in `sw.js` — bump it when you change `index.html` or icons).
- **Store updates**: re-run PWABuilder, download a new `.msixbundle`/`.aab`, submit. Repeat per-store form to bump the version.
- **Crash / bug reports**: there's no telemetry by design. Put a "Contact" email at the bottom of the store listings.

---

## Troubleshooting

- **Lighthouse PWA score < 90** → look at the failing audit; usually missing icon sizes (run the icon generator) or HTTPS issue (Pages URL must be `https://`, not `http://`).
- **"Service worker is not registered"** → make sure you're loading via `http://localhost:8080` or the Pages URL, never `file://`.
- **PWABuilder warns about Service Worker** → ours is fine; the warning is for sites without one. If you see it on the Pages URL, force-reload to bust the SW cache.
- **MSIX won't install on Windows** → enable Developer Mode (Settings → Privacy & security → For developers) or the package needs to be signed for non-dev distribution. The Microsoft-Store-distributed copy is auto-signed; the sideload copy needs your cert.
- **Play rejects the AAB** signing → PWABuilder produces an unsigned AAB by default. Use Android Studio's `apksigner` or let Play handle signing (recommended).
