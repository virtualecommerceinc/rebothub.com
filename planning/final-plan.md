# RebotHub — final merged plan (Claude v2 + the best of ChatGPT's work)

2026-10-25. This is the plan the site in `docs/` is built from. History: `claude-plan-v1.md` → 10 critics
(`critique-ledger-v1.md`) → `claude-plan-v2.md` → read ChatGPT's `summary.md`, prototype and build report → this.

## What I kept from ChatGPT's work, and why

| Kept | Why it is better than what I had |
|---|---|
| Visual identity: warm paper, ink, cobalt blue, sage; serif-italic accent headlines; the ↻ mark | Distinct, calm, trustworthy, and nothing like Robohub.org's look. My v1 "KBB/Wirecutter" brief was blander. |
| Tagline **"Everyday robots. Longer lives."** and the "Rethink / Reuse / Rebot" motif | It says the whole thesis in four words and owns the "Re-" meaning of the name. |
| **Handover and account-transfer guidance** (unlink accounts, maps, personal data, what transfers) | A real, under-served owner problem I missed entirely. It is also safe to publish without hands-on testing. |
| Packing and battery-shipping guidance as part of selling | Same: useful, safe, no one else bundles it with a sell checklist. |
| Strict provenance tone: distinguish official instructions, owner contributions, tested procedures, unverified | Matches what my trust critic demanded. Now a per-guide badge. |
| Market direction: free classifieds-style listings, intermediary only, paid placement later, no payments or escrow | Identical conclusion to my monetization critique. Adopted as /market/. |
| "Repair-provider directory" from the idea bank | Reinstated as a future, zero-sales-call version: a self-submitted list, not a paid directory. |
| Accessibility bar: skip link, focus rings, 44px targets, reduced motion, 390px no-overflow | Carried into the new build as acceptance checks. |
| The decision that Hub and Market must not publish duplicate indexable content across domains | Resolved by one canonical domain (below). |

## What I replaced, and why

| ChatGPT's version | Problem | Replacement |
|---|---|---|
| Six generic "ask better questions" checklists, no model names | Nothing a person with a broken robot searches for; no intent, no revenue, no reason to return | Model hubs + symptom-led fix guides with per-failure verdicts |
| Guides open in a modal on one page; site is `noindex` | One URL for the whole site; Google cannot index individual guides | Every hub and guide is its own static HTML page, pre-rendered |
| No business model beyond "consider affiliate later" | Nothing pays for the time | Flips + affiliate + AdSense now; diagnostic packs and display ads later |
| No data, no video, no person | Reads as an AI content farm | Rebot Flips ledger, Dan on camera, Rebot Value Index with N and dates |
| Humanoids as a single "curiosity" essay | Does not position the brand ahead of the used-humanoid market | /humanoid/ track with model watch pages and an early-owner registry, with a KPI |
| Two separate prototypes linked by relative paths | Two domains to feed with one person's time | One site. RebotMarket.com redirects to rebothub.com/market/ for year one |

## The business in one paragraph

RebotHub is where robots get a second life. The engine is **Rebot Flips**: Dan buys broken robots cheaply,
fixes them on camera, sells them, and publishes the real numbers. Each flip yields a verified fix guide, original
footage, a YouTube episode, affiliate parts links that provably worked, and price observations for the **Rebot
Value Index**. Symptom and error-code guides bring search traffic; the per-failure **Fix / Sell / Replace**
verdict converts it; handover and selling checklists send sellers to eBay (Partner Network) today and to
/market/ once it has listings; the alerts list and early-humanoid registry are the audience we own. Under five
hours a week because bots draft and Dan only films, approves, and flips.

## Site map as built
- `/` home: tagline, brand tiles → model picker, how it works (Flips, Index, Guides), featured guides,
  humanoid card, Roomba-after-iRobot card, alerts signup, market bridge
- `/robots/` index; `/robots/<brand>-<model>/` hub: verdict table, value, buy-used checklist, sell checklist,
  flips, owner reports
- `/fix/<brand>-<model>/<symptom>/` guide with provenance badge, risk class and safety block, steps, parts
  (disclosure above, "check price" buttons, no prices), related hub
- `/guides/` all guides incl. handover, selling, shipping (the ChatGPT-origin evergreen guides, rewritten)
- `/value/` index + methodology; `/humanoid/`; `/roomba-after-irobot/`; `/flips/`
- `/market/` lead-gen page + list-your-robot form; `/report/` report a sale or a fix
- `/alerts/`, `/about/`, `/disclosure/`, `/privacy/`, `/404.html`, `sitemap.xml`, `feed.xml`, `llms.txt`, `robots.txt`

## Build
`content/*.json` → `node build.js` → `docs/` (static). Deploys unchanged on GitHub Pages (serve `/docs`) or
Cloudflare Pages (output dir `docs`). A GitHub Actions workflow rebuilds on push so a bot that commits JSON never
touches HTML. No framework, no runtime dependencies; one dev dependency: none (Node built-ins only).

## Numbers (honest)
Day 90: 300-600 organic visits/month, 100 subscribers, 3 flips published. Day 180: 1,500 visits, 50 registered
legged/humanoid owners, first affiliate payment, 10 flips. Revenue $100-300/mo by month 9 including flip profit.

## Decisions still Dan's
1. Hosting: GitHub Pages (chosen) vs Cloudflare Pages (recommended because of GitHub's commercial-use wording).
2. Flips on camera: the plan assumes yes.
3. One domain with RebotMarket.com redirecting: assumed yes for year one.
4. LLC and a "Rebot" trademark clearance before publishing battery guides: recommended, costs money.
5. Email provider (Buttondown recommended; plain HTML form, no JavaScript) and the n8n form endpoint URL.
6. Amazon Associates: add rebothub.com to the account's site list before any link goes live.
