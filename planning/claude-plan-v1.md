# RebotHub.com — Claude's independent business + website plan (v1)

Author: Claude (Fable 5.1), 2026-10-25. Written BEFORE reading ChatGPT's plan or site, by Dan's instruction.
Known premise (only line read from the existing summary): RebotHub = knowledge/community home for a robot
ecosystem (repairs, software, videos, guides); RebotMarket.com = sister buy/sell marketplace; aim is to be
established before a used-humanoid market matures, while serving people who own robots today.

Owner constraints (from Dan): under 5 hours/week of his time; GitHub Pages hosting; revenue model is my call.
Owner assets: YouTube channels + video pipeline, Amazon Associates tags, n8n + Cloudflare tunnel, Telegram
bots, Google Sheets as data store, Firebase, existing OpenClaw bot infrastructure in WSL2.

---------------------------------------------------------------------------------------------------------

## 1. The one-sentence thesis

**RebotHub is the Kelley Blue Book + iFixit for robots: the place that tells you what a robot is worth used,
how to keep it alive, and when to buy, sell, or upgrade.**

Why this and not "robot news/reviews":
- Searches on 2026-10-25 show at least six active affiliate blogs already ranking for "humanoid robots for
  sale 2026" (theresarobotforthat.com, whichbot.net, robotreviewdesk.com, hunterhum.com, optimusk.blog,
  blog.robozaps.com). A new generalist site enters late, with no edge, against sites with a year's head start.
- Nobody owns **resale value, repair, and second life** for consumer robots. That is the literal meaning of
  "Re-bot", it is defensible (data, not opinion), it serves owners of robots that exist today (Ecovacs alone
  claims 38M+ homes; plus Roomba, Roborock, lawn mowers, pool robots, Vector/Cozmo, Aibo, Unitree Go2/G1/R1
  hobbyists), and it is the natural on-ramp to RebotMarket when humanoids start changing hands.
- A valuation dataset gets more valuable every month and cannot be copied by someone writing a blog post.

## 2. Who it is for (in priority order)

1. **Owners** of a robot that is aging, broken, or being replaced. Question: "Is it worth fixing? What can I
   get for it? What should I replace it with?" (Largest group, highest intent, best affiliate conversion.)
2. **Bargain buyers** considering a used/refurb robot. Question: "Is this price fair? What breaks on this
   model? What should I check before paying?"
3. **Early humanoid/legged owners and tinkerers** (Unitree G1/R1/Go2, 1X NEO preorders, Reachy, LeRobot
   SO-101). Small today, but these are the people who will sell the first used humanoids. Capture them early.

Non-goals (v1): breaking news, industrial robots, forums we have to moderate, anything requiring Dan to answer
support email.

## 3. The product: four pillars, in build order

### Pillar A — Robot Value Index ("Rebot Book Value") — the moat
- One page per robot model: new price, typical used price (good / fair / parts-only), 90-day trend, how many
  listings appeared, common failure points, and a verdict: Fix / Sell / Replace.
- Data source v1: weekly bot-assisted collection of eBay sold prices, Facebook Marketplace asks, Swappa,
  manufacturer refurb prices, into a Google Sheet. n8n job turns Sheet rows into `data/values.json`, which the
  static site reads. No scraping that violates TOS; where an API/affiliate feed exists (eBay Partner Network),
  use it. Each value shows "based on N sales, updated <date>" so thin data is honest.
- Launch with 25 models that owners actually search for (Roomba j7/j9/Combo, Roborock S7/S8/Qrevo, Ecovacs
  Deebot X-series, Dreame L-series, Eufy, Shark AI, Husqvarna Automower, Worx Landroid, Segway Navimow, Aiper /
  Beatbot / Dolphin pool robots, Aibo ERS-1000, Vector 2.0, Loona, Unitree Go2, Unitree G1, Unitree R1).

### Pillar B — Fix-or-Replace Guides — the traffic
- For each model: the 5 most common failures, cost of parts (Amazon affiliate), difficulty, time, and the
  break-even line where replacing beats fixing (drives new-robot affiliate links).
- Formats: text guide + an embedded YouTube video from Dan's channel where one exists. Every long-form guide
  feeds a video idea and vice versa, so one piece of effort lands on both properties.
- Content is produced by Dan's AI pipeline (Claude drafting, Dan approving in under 30 minutes a week via
  Telegram approve/reject). Facts about parts and prices are checked against live product pages at publish.

### Pillar C — Buy / Sell Checklists and the RebotMarket bridge — the revenue later
- "Before you buy a used <model>" and "How to sell your <model> for the most money" pages. Each ends with
  "List it on RebotMarket" (sister site) and current eBay/Amazon Renewed affiliate links.
- v1 RebotMarket is a form plus a listings page, not a payment-processing marketplace. Fees come later.

### Pillar D — Robot Owner Alerts — the audience we own
- Email/Telegram list: "Your robot's value changed", "firmware that bricks X", "recall", "parts back in stock".
- Goal: 1,000 subscribers in 6 months. The list is the asset that makes a future marketplace launch work on
  day one, and it is the only channel the algorithms cannot take away.

## 4. Revenue model (my call), in order of when it pays

| Phase | Months | Primary revenue | Target |
|---|---|---|---|
| 1 Traction | 0-6 | Amazon Associates (parts, replacements), eBay Partner Network, Roborock/Ecovacs affiliate (3-5%) | $100-500/mo |
| 2 Audience | 6-12 | Sponsored "Verified Refurbisher" directory listings, YouTube AdSense crossover, email sponsorships | $500-2k/mo |
| 3 Marketplace | 12-24 | RebotMarket listing fees / featured listings / escrow partner referral, paid "RebotHub Certified" seller inspection kit, licensing the Value Index to insurers, lenders, resellers | $2k+/mo |

Rule: no revenue path requires Dan to talk to customers. Everything is self-serve or automated.

## 5. Why under 5 hours a week is enough

Weekly loop, all automated except the approval step:
1. Monday 06:00 — n8n pulls new price observations into the Sheet; a bot flags models whose value moved >10%.
2. Claude drafts 2 guides/updates + 1 Short script from the flagged items; posts to Telegram for Dan.
3. Dan taps Approve/Reject (20-30 min total).
4. Approved items are written to `content/*.json`, committed to GitHub, Pages redeploys, email digest goes out.
5. One video per month from the existing YouTube pipeline, cross-posted.

Dan's remaining time goes to the one thing bots cannot do: appearing on camera and building trust.

## 6. The website (v1, static, GitHub Pages)

Stack: plain HTML/CSS/JS, no framework, no build step at runtime. Content and prices live in JSON files so bots
can update them without touching layout. Pages pre-rendered by a tiny Node script at commit time so Google sees
real HTML (not client-rendered). Target Lighthouse 95+ on mobile.

Sitemap:
- `/` Home: search box "What's your robot worth?", trending values, latest fix guides, email signup.
- `/value/<brand>/<model>/` Value page (Pillar A). Schema.org Product + Offer markup.
- `/fix/<brand>/<model>/<problem>/` Fix guide (Pillar B). HowTo schema, parts table, video embed.
- `/buy-used/<model>/` and `/sell/<model>/` checklists (Pillar C).
- `/robots/` A-Z index of every model covered. `/brands/<brand>/` brand hubs.
- `/alerts/` signup, `/about/` (Dan, on camera, why trust us), `/methodology/` (how values are computed).
- `/market/` → RebotMarket.com bridge with a shared header so the two brands reinforce each other.

Design direction: trustworthy utility, not sci-fi. Think Kelley Blue Book / iFixit / Wirecutter: white space,
a strong data table, one accent colour, big legible numbers, real product photos. Mobile first because most
"is my Roomba worth fixing" searches happen standing in a kitchen.

Technical musts: canonical URLs, XML sitemap, RSS, Open Graph images per model, `llms.txt` so AI assistants
cite us, affiliate disclosure on every monetised page, FTC-compliant "we earn commissions" line, privacy page
(email list is the only data collected), no cookies beyond analytics (PostHog, masked).

## 7. 90-day launch plan

| Week | Deliverable |
|---|---|
| 1-2 | Site skeleton live on GitHub Pages with 10 value pages + 10 fix guides + methodology + alerts signup |
| 3-4 | Sheet + n8n pipeline producing `values.json`; Telegram approval bot; Search Console + Bing submitted |
| 5-8 | Reach 25 models, 40 guides; first YouTube video "What is your robot vacuum actually worth used?" |
| 9-12 | Buy/Sell checklists; RebotMarket v1 form + listing page; first email digest; apply to Roborock/Ecovacs/eBay affiliate programs |

Success at 90 days: 2,000 organic visits/month, 200 subscribers, first affiliate payout, 25 models with
real sales data behind them.

## 8. Risks and how the plan handles them

- **Thin data makes values look fake.** Show sample size and date on every number; never show a value with
  fewer than 3 observations, show "collecting" instead.
- **eBay/marketplace terms.** Use the official Partner Network / APIs or manual observation; no bulk scraping.
- **Google treats it as another AI affiliate site.** Differentiation is the dataset and Dan's on-camera repairs.
  Every guide has at least one original photo or video frame.
- **Humanoid market stays tiny for years.** The plan makes money from robots that exist today; humanoids are
  an option, not the bet.
- **Dan's attention.** Weekly loop is capped at 30 minutes; anything that needs more is cut, not stretched.
- **Two domains dilute focus.** RebotHub is the only site built in the first 9 weeks. RebotMarket is a page.

## 9. Open decisions for Dan

1. Does "Rebot Book Value" as the headline feature match where you want to be, or do you want community first?
2. Are you willing to appear on camera for the trust/about content, or should the brand be faceless?
3. Email provider: Buttondown / Kit / MailerLite (free tiers) — pick one, or let me pick cheapest.
4. Is RebotMarket.com DNS also on Cloudflare so I can put a one-page bridge there now?

---------------------------------------------------------------------------------------------------------

## Frozen rubric (100 points) — for self-review and critics

Must-pass: (M1) plan is executable by one person in under 5 h/week; (M2) a revenue path exists that needs no
customer support from Dan; (M3) nothing in the plan requires violating a platform's terms; (M4) the site plan
is buildable as a static GitHub Pages site.

| # | Criterion | Pts | Full credit | Zero credit |
|---|---|---|---|---|
| 1 | Goal fit: serves owners of today's robots AND positions for used humanoids | 15 | Both audiences have concrete pages and a path to revenue | One audience missing or hand-waved |
| 2 | Differentiation vs. existing robot affiliate blogs | 15 | A moat that compounds (data/audience) and is named | "Better content" only |
| 3 | Evidence: market facts cited and dated, assumptions labelled | 20 | Every market claim sourced; unknowns marked | Unsourced claims |
| 4 | Completeness: product, revenue, ops loop, site map, launch plan, risks | 15 | All six present and consistent | Any missing |
| 5 | Usefulness/UX: a visitor's top question is answered on first screen | 15 | Home + model page designed around the question | Generic brochure |
| 6 | Safety/scope/privacy/legal: affiliate disclosure, data minimisation, TOS | 10 | All addressed | Any ignored |
| 7 | Verification/maintainability: content separated from layout, bot-updatable, measurable success criteria | 10 | JSON-driven, metrics defined | Hard-coded HTML, no metrics |

## Sources consulted (2026-10-25)
- Humanoid pricing/availability: theresarobotforthat.com, whichbot.net, robotreviewdesk.com, hunterhum.com, optimusk.blog, blog.robozaps.com (Unitree G1 ~$13.5-16k; Unitree R1 ~$4.3-5.9k; 1X NEO $20k or $499/mo preorder; Figure 03 not confirmed for consumers).
- Used/refurbished robot market: intelmarketresearch.com (~$2.85B 2026 → $5.9B 2034, industrial-weighted), astuteanalytica.com.
- Household robots: androidheadlines.com (Ecovacs "38M+ homes" company claim, Sept 2026).
- Affiliate terms: flexoffers.com (Ecovacs 4%/45d, Roborock 3.2%/30d), ui.awin.com (Ecovacs UK 5%/30d). No Unitree/DJI/Hugging Face programs found.
