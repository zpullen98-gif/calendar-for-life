# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Calendar For Life** is a single-file Progressive Web App: an illuminated almanac with a parchment-and-gold aesthetic. The product is two "books" stitched into one HTML file:

- **Book the First — The Festivals of the World**: 365 festival "voyages" across 12 month "charts"
- **Book the Second — Pilgrimages of Humanity**: 29 themed pilgrimages × 290 "stops"

Packaged via [PWABuilder](https://www.pwabuilder.com/) for itch.io / Microsoft Store / Google Play / Apple. See `README.md` and `DEPLOY.md` for the shipping path.

**No build step, no bundler, no framework.** `index.html` is the whole app. Three JSON data blocks are embedded inline; the runtime parses them at boot. ~1.5 MB and ~5,000+ lines after the v2 features landed.

## Running locally

The service worker can't register from `file://`. Two options:

- **`serve.ps1`** — bundled PowerShell `System.Net.HttpListener` server. Zero installs, correct MIME types (especially `application/manifest+json` for `.webmanifest`). Run with:
  ```powershell
  powershell -ExecutionPolicy Bypass -File serve.ps1
  ```
- **Claude Code preview tool** — `.claude/launch.json` is wired to invoke `serve.ps1` on port 8080. Call `preview_start` with name `calendar-for-life`.

For email handoff without a server, see "Preview file" below.

## Three data sources

Two source-of-truth JSON files plus the embedded copies inside `index.html`:

| File | Contents |
|---|---|
| `.scripts/voyages-extracted.json` | 365 voyages — `chart, month, flags, n, name, port, date, desc, berth, galley` |
| `.scripts/voyage-bearings.json` | Object keyed `"MONTH-N"` → array of exactly 2 bearings each `{name, location, desc}` (730 bearings total) |
| `.scripts/pilgrimages.json` | 29 pilgrimages — `roman, n, category, name, subtitle, stopCount, desc, quote, author, stops[]` (each stop: `n, name, waypoint, desc, berth, galley, quote, author`). Note: `subtitle` and `category` are currently empty strings across all 29; render code already conditionals them out |

Embedded copies live in `index.html` as three sibling `<script type="application/json">` blocks (currently lines 2837 / 2838 / 2839). **The runtime reads from index.html**, not from `.scripts/*.json`. Any content edit must update **both** — fix scripts in `.scripts/fact-check/` do this.

Plus two JS dicts defined directly in the main `<script>`:
- `MONTH_QUOTES` — `MONTH` → `{text, author}` for the 12 epigraphs on chart cards.
- `VOYAGE_QUOTES` — `"MONTH-N"` → `{text, author}` for 365 voyages. Merged onto each voyage at init.

## localStorage feature modules

Three persistent user-data features, each with its own namespaced localStorage key. All three are gated on the scroll being **bookmarked** (the ribbon icon toggles `scroll-paper.is-bookmarked` and CSS reveals the panels).

| Key | What | Where defined |
|---|---|---|
| `cfl-bookmarks-v1` | Array of `{ type: 'voyage'\|'stop', key, addedAt }`. Powers the **My Voyages** chip in the flag rail | `// ============ BOOKMARKS` block |
| `cfl-journals-v1` | Object keyed `"voyage:JAN-1"` or `"stop:I-1"` → `{ text, updatedAt }`. Full-page overlay, auto-saves with 500ms debounce | `// ============ JOURNAL` block |
| `cfl-fnb-v1` | Object keyed same way → array of `{ id, type: 'recipe'\|'drink'\|'wine', name, notes, addedAt }`. Per-bookmark recipes/drinks/wines | `// ============ FOOD & BEVERAGE` block |

Each module has the same shape: `loadX()` / `saveX()` / get / set / a `renderXSection()` for the scroll modal button + hidden print mirror, a `wireXOpenButton()` to attach handlers, an `openX/closeX` for the full-page overlay, and a `refreshScrollXMirror()` that updates the print-only div after the overlay closes. The print-only mirror is what makes the data show up when the user prints the scroll.

## Render flow

```
<body class="on-cover">
  ├─ <div id="cover">              ← title page, click Set Sail to dismiss
  ├─ <div id="almanac">            ← Book the First. flag-rail + 12-chart grid + chart detail + results view
  ├─ <div id="pilgrimages">        ← Book the Second. parallel structure
  ├─ <div class="scroll-overlay">  ← shared parchment modal for both voyages and pilgrim stops
  ├─ <div class="journal-overlay"> ← full-page journal page, opens above scroll
  └─ <div class="fnb-overlay">     ← full-page F&B page, opens above scroll
```

### Flag rail order (`renderFlagRail()`)

`Today` → `My Voyages` (with count pill) → `Pilgrimages Of Humanity` → flag filter chips

Each chip is bound **inside `renderFlagRail()`**, not at script init, because the chips don't exist at init time. Look for the `$('#goto-*')` lookups in that function.

### Voyage/stop modal render order

`openVoyage()` and `openStop()` emit sections in this order:

1. chart-line · name · flags (voyages only) · meta-block (port/date or waypoint)
2. scroll-body (desc)
3. The Berth
4. The Galley
5. The Bearings (voyages only — pilgrim stops skip this)
6. closing quote
7. **Journal section** — only visible when bookmarked (`.scroll-paper.is-bookmarked` gates it)
8. **F&B section** — only visible when bookmarked
9. `.print-only` traveler-notes block — hidden on screen, revealed by `@media print`

Bearings render via an IIFE in the template literal (NOT a direct `${VOYAGE_BEARINGS[key]}`) to avoid PowerShell substitution traps — see pitfalls below.

## Print stylesheet

`@media print` rules turn the open scroll modal into a single-page parchment printout:
- Hides every chrome layer (top-rail, flag-rail, all back-links, scroll close/bookmark/print buttons, overlay backgrounds, the Journal/F&B overlays themselves)
- Restyles `.scroll-overlay` and `.scroll-paper` as a normal A4 portrait block
- Reveals `.print-only` sections (Traveler's Notes checklist + ruled lines)
- Reveals `.journal-print-content` and `.fnb-print-content` mirrors **if the scroll is bookmarked** — so the printed page includes the user's journal entry and F&B items

## Editing `index.html` — PowerShell pitfalls

### 1. PowerShell ate my JS interpolation

PowerShell double-quoted strings and here-strings interpret `$()` and `${name}` as substitutions. If you emit JS through a `@"..."@` here-string:

| You wrote (intended JS) | PowerShell substituted | Bug at runtime |
|---|---|---|
| `$('#pilgrim-home')` | `#pilgrim-home` | `SyntaxError: Private field '#pilgrim' must be declared in an enclosing class` |
| `` `${v.month}-${v.n}` `` | `` `-` `` | template-literal key collapses; lookups silently return undefined |

**Solutions:**
- Avoid `$()` shortcuts. Use `document.getElementById('foo')` in JS instead.
- Wrap template-literal lookups in an IIFE that resolves the key to a `const` first inside the JS. See `openVoyage()`'s `VOYAGE_BEARINGS[_bk]` pattern.
- Use single-quoted PS strings whenever possible. Inside single quotes the only escape is `''` → `'`.

### 2. Encoding

PowerShell 5.1's default encoding mangles em-dashes, smart quotes, and accented characters. **Always** read/write with explicit UTF-8 (no BOM):

```powershell
$c = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($file, $c, [System.Text.UTF8Encoding]::new($false))
```

### 3. JSON-escape variants

The JSON files use multiple escape and spacing conventions. When string-replacing inside JSON values:

- Apostrophes may be stored as `'` (literal) **or** `'` (escaped). The escape form is common in `pilgrimages.json` and the embedded copies.
- Ampersands similarly may be `&` or `&`.
- Key/value spacing varies: `"key": "value"` (most files) vs `"key":  "value"` (pretty-printed pilgrimages.json) vs `"key":"value"` (compact embedded JSON in index.html).

For non-trivial JSON edits, **parse → modify → re-serialize** rather than fighting all the spacing/escape variants:

```powershell
$pil = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
# mutate
$out = $pil | ConvertTo-Json -Depth 10 -Compress  # -Compress for the embedded copy
```

### 4. Don't `Read` the whole file

`index.html` is too big for one Read. Use `Read` with `offset`/`limit`, or `Grep` with context. The `Grep` tool truncates very long single lines (the data blocks) — when you need to read them, parse via PowerShell.

## Helper scripts (.scripts/fact-check/)

Most surgical content fixes have been captured as auditable PowerShell scripts. Pattern is consistent: read file UTF-8 → string-replace pairs → write back UTF-8 no-BOM → verify with grep.

| Script | Purpose |
|---|---|
| `apply-tier1.ps1` / `apply-tier1-phase2.ps1` / `apply-tier1-phase3.ps1` | The fact-check sweep that applied 60+ confirmed factual corrections |
| `regenerate-preview.ps1` | Rebuild `Calendar-For-Life-preview.html` from `index.html`. Run after every content change |
| `strip-year.ps1` + `strip-year-prose.ps1` + `strip-year-prose-leaks.ps1` | Year-stripping passes (date field, prose mentions, leftover special-character cases) |
| `single-name.ps1` + `single-name-leaks.ps1` | Consolidate dual-name events to one English-friendly name each |
| `wipe-pilgrim-clean.ps1` | Empty `subtitle` and `category` on all 29 pilgrimages via parse-modify-reserialize |

When making a new bulk edit, look for an existing script with the same shape and copy its structure.

## Publisher PDFs

`publishers/build.ps1` generates two parchment-styled A5 PDFs from the current data:

- `Calendar-For-Life-Manuscript.pdf` — the full book (~857 pages): cover, title, table of contents, every voyage, every pilgrim stop
- `Calendar-For-Life-Pitch-Package.pdf` — cover letter (placeholders), synopsis, full TOC, sample chapter

Implementation: builds two HTML files with Cinzel + IM Fell English styling, then calls **Microsoft Edge headless** (`msedge.exe --headless --disable-gpu --print-to-pdf=...`) to render them. No Python or Node required. Edge fetches Google Fonts at render time, so the parchment look is preserved. Cover image is base64-inlined.

Run with:
```powershell
& C:\Users\zpull\CalendarForLife\publishers\build.ps1
# Then render via Edge headless — see Render-Pdf function inside build.ps1
```

If `$ErrorActionPreference = 'Stop'` is set and you call Edge directly, PowerShell treats Edge's benign stderr telemetry as a fatal error. **Use `Start-Process -RedirectStandardError $logfile`** to suppress this without losing the PDF output.

## Bumping the service worker cache

Bump `CACHE_VERSION` in `sw.js` for any user-visible change in `index.html`. Otherwise installed users see the stale cached page until they manually unregister the SW.

```js
const CACHE_VERSION = 'cfl-vN';  // current: cfl-v10
```

Skip-bumping during a long edit session is fine (the user is testing via hard-refresh); bump before any push to GitHub Pages.

The cached `APP_SHELL` includes `images/cover.jpg`, every icon size, the manifest, `index.html`, and `offline.html`. Adding a new asset means updating both the `APP_SHELL` array and bumping the version.

## The standalone preview file

`Calendar-For-Life-preview.html` is a one-file rebuild of `index.html` that runs from `file://` (no server, no SW, no manifest dependencies). It's what gets emailed or hand-shared. **Rebuild it after every meaningful change.**

```powershell
& C:\Users\zpull\CalendarForLife\.scripts\fact-check\regenerate-preview.ps1
```

The script: inlines `images/cover.jpg` as base64, strips the PWA `<link>` tags and SW-registration `<script>`, writes UTF-8 no-BOM. Final size ~2 MB.

## Content conventions

Enforce these on any new or edited content:

- **No em-dashes.** Originally stripped globally. The HTML entity `&mdash;` counts. If you must separate clauses, use a period or comma.
- **No trailing periods on quotes** (both `VOYAGE_QUOTES` and bearings). Trailing `?` and `!` are fine.
- **No year mentions in dates or prose.** All voyage dates and prose references to "2027" were scrubbed; the calendar is year-agnostic. The user updates `REF_YEAR` in the date parser annually (single-line change). Historical years in descriptions (e.g. "founded 1989") are fine.
- **One name per event.** Both voyage names and pilgrim-stop names are single (no slashes, no parentheticals). All 29 pilgrimages also have empty `subtitle` and `category` fields — the render code conditionals out empty values.
- **Voice for new bearings**: 1-2 sentences, ~25-40 words, present tense, sensory + one historical anchor. No marketing language.
- **Attribution conventions**:
  - Author: `"Mark Twain"`
  - Author + work: `"William Shakespeare, Henry V"`
  - Character + show/game/film: `"James Bond, You Only Live Twice"`, `"Mikasa Ackerman, Attack on Titan"`
  - Proverb/saying: `"Georgian Proverb"`, `"Bahamian Saying"`
- **Location format**: `"City, State/Province, Country"` (e.g. `"San Francisco, California, USA"`).

## Don't

- Don't run `git commit` unless the user asks.
- Don't modify `sw.js`'s cache strategy without bumping `CACHE_VERSION`.
- Don't create new docs (`*.md`) unprompted.
- Don't touch `Calendar_For_Life_7.html` in `Downloads/` — that's the original source.
- Don't try to `Read` the entire `index.html`. Use `Read` with `offset`/`limit`, or `Grep`.
- Don't add em-dashes, trailing periods on quotes, year references, or dual names back into content.
- Don't put `&` inside an unquoted PowerShell string — the parser treats it as the call operator.
