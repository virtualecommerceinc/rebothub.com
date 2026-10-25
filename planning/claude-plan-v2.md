# RebotHub.com — Claude's plan v2 (after 10-critic review, before reading ChatGPT's work)

2026-10-25. Supersedes v1. Changes are driven by the ledger in `critique-ledger-v1.md`.

## Thesis (revised)

**RebotHub: where robots get a second life.** Fix it, value it, or rehome it.
The engine is **Rebot Flips**: Dan buys broken robots cheaply, repairs them on camera, sells them, and publishes
the real ledger (bought for, parts cost, time, sold for). Every flip produces, in one pass: original video and
photos (what Google and viewers reward), a verified repair guide, real price observations for the **Rebot Value
Index**, affiliate parts links with proof they worked, and a YouTube episode from the existing pipeline.
The index is the by-product of the flips, not a dataset waiting on APIs we cannot get.

What changed from v1 and why:
- eBay sold-price and Facebook Marketplace data are not legitimately collectable at scale, so the "Blue Book"
  moat as designed could not be built. Own transactions plus owner-submitted reports are the clean sources.
- Search demand is for symptoms and error codes, not "what is my robot worth". Fix guides lead; values convert.
- AI-drafted guides with no hands-on basis are what Google's 2026 updates punish. Flips make every guide first-hand.
- "Rebot Book Value" and Kelley Blue Book references removed (trademark exposure). It is the Rebot Value Index.

## Audience (unchanged order, sharper pages)
1. Owners with a broken or aging robot → symptom page with a per-failure verdict table.
2. Used buyers → model hub with price band, confidence, and inspection checklist.
3. Early legged/humanoid owners → /humanoid/ track and owner registry (the future used-humanoid sellers).

## Product

### Model hub — one URL per robot: /robots/<brand>-<model>/
Sections in order: (1) verdict table: symptom → Fix (part, typical cost range, time, difficulty) / Sell for parts
/ Replace; (2) Rebot Value: new price, refurb price, used band with N and confidence tier and date; (3) buy-used
inspection checklist; (4) sell-it-right checklist (eBay template via Partner Network until /market has 20+
listings); (5) Dan's flips of this model, with ledger; (6) owner reports. Schema: Article + FAQPage.

### Fix guides — /fix/<brand>-<model>/<symptom>/ only for distinct, high-volume symptoms
Each carries: provenance badge (Hands-on / Owner-reported N / OEM bulletin), risk_class (battery, blade, mains,
water → safety block at top, OEM part numbers only), "Reviewed by Dan Herlehy on <date>", lite YouTube embed,
parts table with the affiliate disclosure directly above it and "Check price" buttons (no Amazon prices in HTML).
Nothing AI-inferred-only is ever published.

### Rebot Value Index — /value/ and inside every hub
Methodology published: median of observations in a 90-day window; asks and solds stored and displayed
separately; confidence tiers wide / medium / tight; minimum N=3 to show a band, N=8 for a tight tier; trend only
after 8 weekly snapshots. Sources, each labelled: Dan's flips, owner-submitted sales, manufacturer refurb prices,
manual human-read observations with URL and date, and eBay Marketplace Insights if the application is approved.
Append-only observations tab in the Sheet; values.json computed, never hand-edited.

### Humanoid track — /humanoid/
Unitree G1 / R1 / Go2, 1X NEO, Reachy, LeRobot: new-price watch, "what a used humanoid will be worth" explainer,
preorder-transfer notes, early-owner registry (signup form). KPI: 50 registered legged/humanoid owners by day 180.

### Roomba after iRobot — /roomba-after-irobot/
iRobot's Chapter 11 (Dec 2025) is the biggest live demand spike in the category: app and cloud status, parts
availability, resale impact, alternatives. Roomba values carry a support-status caveat.

### Community as contribution, not conversation
Report-a-sale, report-a-fix, and submit-a-photo forms (all feed the Sheet); a bot-moderated Telegram channel;
owner reports rendered on hubs with first name and date. No forum, no support inbox.

### Market — rebothub.com/market
One domain. RebotMarket.com 301-redirects here until listings justify a split. v1 is lead-gen: eBay Partner
Network and Back Market / Swappa links on every sell section, a simple "list your robot" form that posts to the
Sheet and renders a listings page. No payments, no fees, no disputes.

### Alerts — /alerts/
Buttondown plain-HTML form (no JavaScript, double opt-in, postal footer) or an n8n webhook behind Cloudflare
Turnstile. v1 digest is generated only from value changes and new flips.

## Revenue (reset to evidence)
| Phase | Months | Sources | Honest target |
|---|---|---|---|
| 1 | 0-9 | Flip profits (typically $30-150 per robot), YouTube AdSense on repair episodes, Amazon Associates and eBay Partner Network on parts and replacements (~$12-40 per 1,000 visits) | $100-300/mo by month 9 incl. flips |
| 2 | 9-18 | $9 per-brand "Fix or Toss" diagnostic packs via Lemon Squeezy or Gumroad (merchant of record, zero support), higher-rate parts programs via Impact/ShareASale, display ads once sessions pass 10k/mo | $300-800/mo |
| 3 | 18+ | Featured listings on /market once liquidity exists; sponsorships of the digest if subscribers exceed 2,000 | option, not a target |
Dropped: index licensing to insurers/lenders, refurbisher directory, marketplace fees in year one.

## Operating loop (Dan under 5 h/week, build phase included)
- Build phase (days 0-60): Claude writes all code and drafts; Dan is capped at 1 h/week of testing and deploy
  approval plus one flip session of about 2 hours every other week (filmed on a phone, no edit beyond cuts).
- Steady state: weekly Telegram card (one guide draft, one value update, three bullet claims to confirm) ≈ 30-45
  min; one flip session a fortnight ≈ 1 h/week amortised; monthly 60-min ops hour; health-check bot reports
  pipeline, deploy, and broken links red/green. Reserve ≈ 1 h.
- Manual first: a step is automated only after it has been done by hand three times.

## 180-day plan
| Days | Deliverable | Gate |
|---|---|---|
| 0-14 | Static site live: home, 3 model hubs, 5 fix guides from Dan's existing footage or first flip, methodology, about, alerts, humanoid page, Roomba-after-iRobot page | Keyword Planner check on top 20 target queries; Search Console + Bing submitted |
| 15-45 | 3 flips completed and published; Sheet + Actions build + weekly Telegram card working; eBay EPN and Marketplace Insights applications filed; first 3 Amazon sales seeded via YouTube | Dan's logged time under 5 h/week for 3 consecutive weeks |
| 46-90 | 8 hubs, 15 guides, first digest, humanoid registry open, /market lead-gen page | 300-600 organic visits/month; 100 subscribers |
| 91-180 | 15 hubs, 30 guides, 10 flips, first diagnostic pack | 1,500 visits/month; 50 humanoid owners registered; first affiliate payment received |

## Site build (static, hosts on Cloudflare Pages or GitHub Pages identically)
Plain HTML/CSS/JS, content in JSON, `build.js` (Node) renders pages, sitemap.xml, feed.xml, llms.txt, and
OG images (satori + resvg, cached by hash). GitHub Actions runs the build on push; bot commits JSON only via a
fine-grained token. lite-youtube-embed on the nocookie domain. Tables: semantic, scrollable region, stacked cards
under 600px, verdicts shown with icon and text, never colour alone. Cookieless analytics, no session recording.
Affiliate disclosure directly above every parts table and button. FTC-compliant, CAN-SPAM footer, privacy page.

Design: trustworthy workshop, not sci-fi. Warm neutral background, one strong accent, big legible numbers,
real photos from flips, Dan visible. Mobile first.

## Decisions for Dan (consequential, not trivial)
1. **Hosting.** GitHub Pages' terms say it is not for sites "primarily aimed at facilitating commercial
   transactions". Affiliate content is a grey area; a marketplace is not. I recommend Cloudflare Pages with
   GitHub as the repo. The files are identical either way.
2. **Flips on camera.** The plan depends on you buying and fixing a few broken robots on video. Yes or no?
3. **One domain.** Redirect RebotMarket.com to rebothub.com/market for year one?
4. **Entity and name.** An LLC before publishing battery guides, and a USPTO clearance search on "Rebot", are
   recommended. Both are your call and cost money.

## Frozen rubric
Unchanged from v1 (same criteria, weights, must-pass items). Self-score after revision: provisional 84/100.
Points still withheld: criterion 3 (demand for target queries unverified until Keyword Planner check), criterion 1
(humanoid track is a page, not yet a product), M1 (holds on paper, unproven until three weeks of logged time).
