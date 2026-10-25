# Design upgrade v3 — benchmark notes and frozen rubric (2026-10-25)

User ask: higher-quality top menu; cards with 3D depth and shadowing; whole site gets more depth; richer or animated
background; benchmark against eBay and similar sites.

## Benchmark (what was actually observed)
Captured in the built-in browser: Back Market, iFixit, Swappa, Kelley Blue Book. eBay blocked automated browsing
(error page), so eBay notes below are from its well-known layout, not a capture this session.

| Site | Pattern worth adopting | Adopted as |
|---|---|---|
| iFixit | Dark header bar, thin promo strip, hero with one large pill search ("Find Your Device"), mega-menu entries with a one-line description each | Two-tier header, hero search, described menu panels |
| Back Market | Saturated colour field behind hero with organic shapes, floating product art, black pill CTA, round search in header, category tiles | Animated tonal background, floating hero art, pill search, tiles with icons |
| Swappa | Trust bar under header (shipping, verified, support), category row | Trust strip + trust bar |
| Kelley Blue Book | Navy hero with lookup tabs and one high-contrast CTA, wave divider | Search-first hero, strong primary CTA, tonal section bands |
| eBay (known layout) | Utility strip, logo + wide search, category strip, white elevated cards | Utility strip, wide search with live results, category row |

Cross-site pattern: every one is search-first, uses pill controls, elevates cards on white, and puts trust claims in a strip.

## Must-pass (any failure blocks)
- M1 No horizontal overflow at 375, 768 and 1440 px on home, a model hub, a guide.
- M2 `prefers-reduced-motion: reduce` stops all animation and tilt.
- M3 Header fully keyboard-operable: Tab order, Enter/Space opens menus, Esc closes and returns focus, visible focus, aria-expanded accurate.
- M4 No external fonts, scripts, images or trackers added. Page stays static.
- M5 `node build.js --check` passes with 0 problems; all content rules unchanged (no dollar prices, provenance badges, safety blocks).
- M6 Body text contrast at least 4.5:1 on every background it sits on.
- M7 Nothing deployed before the user approves.

## Scored rubric (100)
| # | Criterion | Pts | Full credit anchor | Zero anchor |
|---|---|---|---|---|
| 1 | Header and menu quality | 20 | Utility strip, brand + live search with results dropdown, category row with described mega panels, sticky with scroll shadow/compact state, mobile drawer; all keyboard-operable | Same flat bar as before |
| 2 | Depth: cards, tables, panels | 20 | One elevation scale of layered shadows; cards lift and tilt on pointer hover; glare; verdict table elevated; consistent across pages | Flat 1px-border cards |
| 3 | Background and atmosphere | 15 | Multi-tone page background, animated slow aurora, dot grid, tonal section bands, footer with weight; text stays readable | Single flat colour |
| 4 | Benchmark fit and conversion | 10 | Search-first hero, trust bar, icon category tiles, high-contrast CTA, floating proof chips; each traceable to the table above | Generic |
| 5 | Preserved trust, content, accessibility | 15 | All M-items hold; honest copy intact ("collecting", disclosure placement) | Any regression |
| 6 | Performance and maintainability | 10 | CSS-only animation on transform/opacity, JS under 8 KB, no new requests besides one small search.json, tokens in :root | Heavy filters, large images, magic numbers |
| 7 | Verification | 10 | Desktop, tablet and mobile screenshots inspected, overflow and console checks, keyboard test, contrast computed, two or more independent critics | Unverified |

Scoring is an agent-assessed heuristic with a deduction ledger. Unknown or unrun checks earn zero.
