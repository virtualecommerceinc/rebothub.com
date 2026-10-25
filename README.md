# RebotHub.com

Everyday robots. Longer lives. A static site: model hubs, symptom-led fix guides with Fix / Sell / Replace
verdicts, the Rebot Value Index, handover and selling checklists, a humanoid track, and a lead-gen market page.

Plan and history: `planning/final-plan.md` (and the v1 → critics → v2 trail beside it). The original ChatGPT
prototype is preserved untouched in `archive/chatgpt-prototype/`. `summary.md` is the original planning record.

## Layout

```
content/   site.json, models.json, guides.json   <- the only files bots or Dan edit
src/       styles.css, app.js, hero.svg, favicon.svg
build.js   renders content -> docs/ (HTML, sitemap.xml, feed.xml, llms.txt, robots.txt, 404.html)
docs/      generated output; the deployable site. Do not hand-edit.
```

## Build and preview

```powershell
node build.js
```

```powershell
python -m http.server 8790 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:8790/ . Live site: https://virtualecommerceinc.com/rebothub.com/ (until the custom domain is set). `node build.js --check` validates internal links and content rules (no value shown
with fewer than 3 observations, every guide has a provenance tag, risky guides have a safety block).

## Deploy

Either host serves `docs/` as-is:

- GitHub Pages (current): Source is "GitHub Actions"; `.github/workflows/pages.yml` builds on every push to main and
  passes `BASE_URL` so the site works under the `/rebothub.com/` subpath. When rebothub.com is set as the custom
  domain in Settings → Pages, remove the `BASE_URL` env line so links go back to root.
- Remote uses the SSH alias `github-vei` (key `~/.ssh/virtualecommerceinc_account`); plain HTTPS on this PC
  authenticates as a different account and is refused.
- Cloudflare Pages (recommended, see `planning/final-plan.md`): build command `node build.js`, output directory `docs`.

## Before the first public deploy

1. Fill `content/site.json`: `newsletterAction` (Buttondown form URL), `formEndpoint` (n8n webhook), `ebayCampaignId`.
2. Add rebothub.com to the Amazon Associates account's site list; confirm the tag in `site.json`.
3. Dan reviews each guide and sets `reviewedBy` / `reviewedOn`; until then pages say "not yet reviewed".
4. Decide hosting and the RebotMarket.com redirect; publish `/privacy/` postal address for CAN-SPAM.

## Content rules

- Values appear only with `observations >= 3`; otherwise the page shows "collecting" with a report link.
- Guides carry `provenance`: `hands-on` (Dan did it on camera), `documented` (manufacturer or published source),
  `owner-reported`, or `editorial`. AI-inferred-only content is never published.
- `riskClass` of `battery`, `blade`, `mains` or `water` forces a safety block at the top of the guide.
- No prices in HTML. Affiliate buttons open the live listing; the disclosure sits directly above them.
