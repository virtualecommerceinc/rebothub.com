# RebotHub — local prototype

Dependency-free HTML/CSS/JavaScript. No install, build service, account or API key is needed. Nothing has been uploaded or deployed.

## Start locally

Open a terminal in this folder and run:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/index.html . Run the companion project separately on port 8766. The two project folders are independent. On localhost, companion navigation uses those explicit ports; in file mode it uses the adjacent project folder. You can also double-click index.html directly: all interactions and embedded artwork work without a server. Browser storage availability in file mode varies, with an in-memory fallback.

## What works

Guide search/category filtering, substantive article dialogs, hash deep links, browser Back/Forward, mobile navigation and editorial notebook prompts.

## Data, privacy and artwork

All product names, prices, conditions and scenarios are fictional interface samples. All vector artwork was created for this prototype and depicts original concepts, never seller photos or stock. Guides are original general planning checklists prepared 25 October 2026; no device testing or expert review is claimed. Follow the exact model’s official documentation before any repair, reset or transfer. No manufacturer marks, third-party fonts or remote assets are used.

Market favorites use only localStorage key `rebot-demo-saved`; failure falls back to memory. Listing previews exist only in page memory and disappear on refresh. No personal/contact details, uploads, analytics, subscriptions, checkout, authentication, backend or messaging are implemented. No forms submit network requests.

## Files and editing

`index.html` contains page structure; `styles.css` the shared visual system; `responsive.css` isolated integration refinements; `data.js` the original content; `app.js` interactions. `summary.md` is the preserved planning record. `BUILD_REPORT.md`, `documentation/preview/` and `documentation/review/` hold verification and review evidence.

## Future GitHub Pages preparation — do not publish yet

Each folder can later become its own static repository root. Assets are relative and no bundler is needed. Before any publication, decide canonical URLs/names, geography/currency, real inventory provenance, content ownership, moderation, contact/privacy rules and appropriate policy review. Replace the `[data-companion]` destinations and the localhost URL switch at the end of `app.js` with approved companion URLs. Remove the prototype `noindex,nofollow` only after that review. Hash-based detail views do not require server rewrites. No CNAME, remote repository, workflow or deployment is configured.

The score in BUILD_REPORT is a heuristic assessment of this local artifact, not evidence of a running marketplace or a guarantee of design quality.
