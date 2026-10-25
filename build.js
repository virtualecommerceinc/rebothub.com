#!/usr/bin/env node
/* RebotHub static site builder. Node built-ins only. `node build.js` renders content/ -> docs/.
   `node build.js --check` validates links and content rules after a build. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'docs');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const models = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/models.json'), 'utf8'));
const guides = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/guides.json'), 'utf8'));
const CHECK = process.argv.includes('--check');
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- helpers ---------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const modelBySlug = Object.fromEntries(models.map(m => [m.slug, m]));
const guideBySlug = Object.fromEntries(guides.map(g => [g.slug, g]));
const VERDICT = {
  fix: { label: 'Fix', icon: '🔧', text: 'Fix' },
  sell: { label: 'Sell for parts', icon: '🏷', text: 'Sell' },
  replace: { label: 'Replace', icon: '↻', text: 'Replace' },
  check: { label: 'Get a price first', icon: '?', text: 'Check' }
};
const COST = { low: 'Low (consumable)', moderate: 'Moderate (module)', high: 'High (board or sensor)' };
const PROV = {
  'hands-on': { label: 'Hands-on: done on camera by RebotHub', cls: 'v-fix' },
  documented: { label: 'Documented: manufacturer or published source', cls: 'v-check' },
  'owner-reported': { label: 'Owner-reported', cls: 'v-check' },
  editorial: { label: 'Editorial guidance, not a repair', cls: '' }
};
const amazon = q => site.amazonTag ? `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${encodeURIComponent(site.amazonTag)}` : `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;
const ebaySearch = q => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1`;
const verdictChip = v => `<span class="v v-${v}"><span aria-hidden="true">${VERDICT[v].icon}</span> ${VERDICT[v].label}</span>`;
const url = p => site.domain.replace(/\/$/, '') + p;

function write(rel, html) {
  const file = rel.endsWith('.html') || rel.includes('.') ? path.join(OUT, rel) : path.join(OUT, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  pages.push(rel.endsWith('.html') || rel.includes('.') ? '/' + rel : (rel ? '/' + rel + '/' : '/'));
}
const pages = [];

/* ---------- layout ---------- */
function layout({ title, description, pathName, body, schema, crumbs, noindex }) {
  const canonical = url(pathName);
  const crumbHtml = crumbs ? `<nav class="wrap breadcrumb" aria-label="Breadcrumb">${crumbs.map((c, i) => c.href ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`).join(' <span aria-hidden="true">/</span> ')}</nav>` : '';
  const crumbSchema = crumbs ? { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: url(c.href || pathName) })) } : null;
  const schemas = [].concat(schema || [], crumbSchema || []).filter(Boolean);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:image" content="${url('/og.svg')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="${esc(site.name)} guides" href="/feed.xml">
<link rel="stylesheet" href="/styles.css">
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="header"><nav class="wrap nav" aria-label="Main">
<a class="brand" href="/" aria-label="${esc(site.name)} home"><b aria-hidden="true">↻</b>rebot<span>hub</span></a>
<button class="button small nav-toggle" aria-controls="navigation" aria-expanded="false">Menu</button>
<div class="nav-links" id="navigation">
<a href="/robots/">Robots</a><a href="/guides/">Fix guides</a><a href="/value/">Value index</a><a href="/humanoid/">Humanoids</a><a href="/flips/">Flips</a><a href="/market/">Market</a><a class="button small" href="/alerts/">Get alerts</a>
</div></nav></header>
${crumbHtml}
<main id="main">
${body}
</main>
<footer><div class="wrap">
<div class="footer-grid">
<div><a class="brand" href="/"><b aria-hidden="true">↻</b>rebot<span>hub</span></a><p style="margin-top:12px">${esc(site.tagline)} Guides say who checked them and when. Values say how many sales they rest on. Nothing here replaces the manual for your exact model.</p></div>
<div><h4>Learn</h4><a href="/robots/">Model hubs</a><a href="/guides/">Fix guides</a><a href="/value/">Rebot Value Index</a><a href="/roomba-after-irobot/">Roomba after iRobot</a><a href="/humanoid/">Humanoid track</a></div>
<div><h4>Do</h4><a href="/market/">Sell or find a robot</a><a href="/report/">Report a sale or a fix</a><a href="/flips/">Rebot Flips</a><a href="/alerts/">Owner alerts</a></div>
<div><h4>Trust</h4><a href="/about/">About Dan</a><a href="/value/#methodology">Methodology</a><a href="/disclosure/">Affiliate disclosure</a><a href="/privacy/">Privacy</a></div>
</div>
<div class="fineprint"><span>© ${TODAY.slice(0, 4)} ${esc(site.name)}. Rethink. Reuse. Rebot.</span><span>Repairs involve batteries and tools; you accept the risk of work you do yourself. See each guide's safety block.</span></div>
</div></footer>
<script src="/app.js" defer></script>
</body>
</html>`;
}

/* ---------- shared blocks ---------- */
function disclosure() { return `<p class="disclosure"><strong>Disclosure.</strong> ${esc(site.disclosure)} <a href="/disclosure/">How we earn</a>.</p>`; }
function reviewed(g) {
  return g.reviewedBy ? `<p class="reviewed">Reviewed by ${esc(g.reviewedBy)} on ${esc(g.reviewedOn)}.</p>` : `<p class="reviewed">Drafted with AI assistance from the sources named above. <strong>Not yet reviewed by ${esc(site.owner)}</strong>; it will carry a review date when it has been.</p>`;
}
function valueBlock(m) {
  const v = m.value || { observations: 0 };
  const sold = ebaySearch(`${m.brand} ${m.name.split(' and ')[0]}`);
  if ((v.observations || 0) < 3) {
    return `<div class="value-card"><div><span class="eyebrow">Rebot Value Index</span><div class="big">Collecting</div><p class="muted">${v.observations || 0} verified observation${v.observations === 1 ? '' : 's'} in the last ${esc(v.window || '90 days')}. We publish a used-price band only once we have at least three dated, sourced observations, and we say how many.</p></div>
<div class="collecting"><strong>Help us get there.</strong><p>Sold or bought one? <a href="/report/">Report the sale</a> with the date and condition. Until then, check <a href="${sold}" rel="nofollow noopener" target="_blank">recent sold listings on eBay</a> and <a href="${esc(m.officialSupport)}" rel="noopener" target="_blank">the manufacturer's refurbished store</a>; read our <a href="/value/#methodology">methodology</a> for how to weigh them.</p></div></div>`;
  }
  return `<div class="value-card"><div><span class="eyebrow">Rebot Value Index</span><div class="big">${esc(v.band)}</div><p class="muted">Used, working, with dock. ${v.observations} observations, ${esc(v.window)}, confidence ${esc(v.confidence)}. Updated ${esc(v.updated)}.</p></div><div class="collecting"><p>Sold one recently? <a href="/report/">Add your sale</a>. <a href="/value/#methodology">Methodology</a>.</p></div></div>`;
}
function symptomTable(m) {
  const rows = m.symptoms.map(s => {
    const g = s.guide ? guideBySlug[s.guide] : null;
    const sym = g ? `<a href="/fix/${g.slug}/">${esc(s.symptom)}</a>` : esc(s.symptom);
    return `<tr><td data-label="Symptom">${sym}</td><td data-label="Likely cause">${esc(s.cause)}</td><td data-label="Verdict">${verdictChip(s.verdict)}</td><td data-label="Part cost">${esc(COST[s.cost] || s.cost)}</td><td data-label="Time">${esc(s.time)}</td><td data-label="Difficulty">${esc(s.difficulty)}</td></tr>`;
  }).join('');
  return `<div class="table-wrap"><table><caption>What is wrong with it decides the verdict</caption><thead><tr><th scope="col">Symptom</th><th scope="col">Likely cause</th><th scope="col">Verdict</th><th scope="col">Part cost</th><th scope="col">Time</th><th scope="col">Difficulty</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="small" style="margin-top:10px">Verdict key: <strong>Fix</strong> when the part costs clearly less than the robot's used value and the job is routine. <strong>Sell for parts</strong> when the fault is a board, camera or sensor on a robot whose used value is low. <strong>Replace</strong> when the robot is old enough that even a successful repair leaves you with something not worth much. <strong>Get a price first</strong> when it depends on a quote or the robot's used value. Part cost is a tier, not a quote; prices change and we do not print them.</p>`;
}
function form(kind) {
  const endpoint = kind === 'alerts' ? site.newsletterAction : site.formEndpoint;
  if (!endpoint) {
    return `<div class="pending"><strong>Not switched on yet.</strong> This form goes live once the endpoint is configured. Until then, nothing you type here is sent anywhere.</div>`;
  }
  if (kind === 'alerts') {
    return `<form class="form" action="${esc(endpoint)}" method="post" data-endpoint="${esc(endpoint)}"><label for="email">Email</label><div class="row"><input id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com"><button class="button primary" type="submit">Get alerts</button></div><p class="small">Double opt-in. One email when a value changes or a flip publishes, never more than weekly. Unsubscribe in every email.</p></form>`;
  }
  const isListing = kind === 'listing';
  return `<form class="form" action="${esc(endpoint)}" method="post" data-endpoint="${esc(endpoint)}"><input type="hidden" name="kind" value="${esc(kind)}">
<label for="f-model">Robot (brand and model)</label><input id="f-model" name="model" required placeholder="Roborock S7">
${isListing ? `<label for="f-price">Asking price (USD)</label><input id="f-price" name="price" type="number" min="0" step="1" required>
<label for="f-cond">Condition</label><select id="f-cond" name="condition"><option>Working, with dock</option><option>Working, no dock</option><option>Needs a repair (say which)</option><option>For parts</option></select>
<label for="f-notes">What a buyer should know (faults, runtime, what is included)</label><textarea id="f-notes" name="notes" rows="4" required></textarea>
<label for="f-contact">Email for buyers (shown only after we approve the listing)</label><input id="f-contact" name="contact" type="email" required>` :
`<label for="f-type">What are you reporting?</label><select id="f-type" name="type"><option value="sale">A sale or purchase price</option><option value="fix">A repair that worked (or didn't)</option></select>
<label for="f-price">Price paid or received (USD), if a sale</label><input id="f-price" name="price" type="number" min="0" step="1">
<label for="f-date">Date</label><input id="f-date" name="date" type="date" required>
<label for="f-cond">Condition</label><select id="f-cond" name="condition"><option>Working, with dock</option><option>Working, no dock</option><option>Needed a repair</option><option>For parts</option></select>
<label for="f-notes">Details (where it sold, what broke, what fixed it)</label><textarea id="f-notes" name="notes" rows="4"></textarea>
<label for="f-contact">Email (optional, only if we may ask a follow-up)</label><input id="f-contact" name="contact" type="email">`}
<button class="button primary" type="submit">${isListing ? 'Submit listing for review' : 'Send report'}</button>
<p class="small">We read every submission before anything is published. No full serial numbers, no home layouts. <a href="/privacy/">Privacy</a>.</p></form>`;
}

/* ---------- pages ---------- */
function home() {
  const brands = [...new Set(models.map(m => m.brand))];
  const featured = guides.filter(g => g.model).slice(0, 6);
  const body = `
<section class="wrap hero">
<div><span class="eyebrow">A little more life in every robot</span>
<h1>Everyday robots.<br><em class="accent">Longer lives.</em></h1>
<p class="lead">${esc(site.subtitle)}</p>
<div class="actions"><a class="button primary" href="/robots/">Find your robot →</a><a class="button" href="/guides/">Browse fix guides</a></div>
<small>Fix it. Value it. Rehome it. Every page says who checked it and when.</small></div>
<figure class="hero-art"><img src="/hero.svg" alt="Illustration of a floor-cleaning robot, a wheeled garden robot and a humanoid study" width="900" height="700" fetchpriority="high"><figcaption>Field study 001 / Original illustration</figcaption></figure>
</section>

<section class="wrap section" id="pick">
<span class="eyebrow">Start with the robot you have</span>
<h2>What's wrong with it decides<br>whether to <em class="accent">fix, sell, or replace.</em></h2>
<div class="tiles">
${models.map(m => `<a class="tile" href="/robots/${m.slug}/"><b>${esc(m.name)}</b><span>${esc(m.category)}</span></a>`).join('')}
<a class="tile" href="/robots/"><b>All robots →</b><span>${models.length} hubs and growing</span></a>
</div>
</section>

<section class="wrap section">
<span class="eyebrow">How RebotHub works</span>
<div class="how">
<div><div class="n">01</div><h3>Rebot Flips</h3><p>${esc(site.owner.split(' ')[0])} buys broken robots, fixes them on camera, sells them, and publishes the real numbers: bought for, parts, time, sold for. <a href="/flips/">See the ledger</a>.</p></div>
<div><div class="n">02</div><h3>Fix guides with a verdict</h3><p>Symptom first, then the likely cause, then a straight answer: fix it, sell it for parts, or replace it. Parts are linked; prices are never printed. <a href="/guides/">All guides</a>.</p></div>
<div><div class="n">03</div><h3>The Rebot Value Index</h3><p>What robots actually change hands for, with the number of observations and the date on every figure. Thin data says "collecting", never a made-up number. <a href="/value/">How it works</a>.</p></div>
</div>
</section>

<section class="wrap section" id="guides">
<div class="split"><div><span class="eyebrow">Fix guides</span><h2>Good diagnosis.<br>Cheaper repairs.</h2></div><p>Most robot "failures" are a worn battery, a dirty contact, or hair in the wrong place. These guides start with the symptom your robot is showing.</p></div>
<div class="cards" style="margin-top:28px">
${featured.map((g, i) => `<a class="card num ${['sage', 'sand', 'sky'][i % 3]}" href="/fix/${g.slug}/"><div class="n">0${i + 1}</div><h3>${esc(g.title)}</h3><span class="meta">${esc(modelBySlug[g.model].brand)} · ${VERDICT[g.verdict].label}</span></a>`).join('')}
</div>
</section>

<section class="wrap section">
<div class="feature"><div><span class="eyebrow">The next chapter / Humanoids</span><h2>Curiosity, with<br><em class="accent">both feet on earth.</em></h2><p>The first used humanoids will change hands within a few years. Licence tiers, firmware, actuator wear and battery packs will decide their value, and the Unitree Go2 market is rehearsing it today. We are writing down what matters before the first listing appears.</p><a class="button light" href="/humanoid/">Follow the humanoid track →</a></div><div class="orbit" aria-hidden="true">↻</div></div>
</section>

<section class="wrap section split">
<div><span class="eyebrow">Live topic</span><h2>Roomba after iRobot</h2><p>iRobot filed for Chapter 11 in December 2025 and emerged in January 2026 owned by its contract manufacturer, Picea. The company said the app and support continue. What that means for your Roomba's value, and what to check before buying a used one. <a href="/roomba-after-irobot/">Read the briefing →</a></p></div>
<div><span class="eyebrow">Owner alerts</span><h2>One email when it matters.</h2><p>A value changes, a flip publishes, a firmware or support notice lands for a robot you own. Weekly at most.</p>${form('alerts')}</div>
</section>

<section class="wrap section"><div class="bridge"><div><span class="eyebrow">Sell or find a robot</span><h2>Rehome it well.</h2><p>Selling checklists, a listing template that works on eBay today, and a review-first listings page here.</p></div><a class="button primary" href="/market/">Go to the market →</a></div></section>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.domain, description: site.subtitle }, { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.domain, founder: { '@type': 'Person', name: site.owner } }];
  write('', layout({ title: `${site.name} — ${site.tagline}`, description: site.subtitle, pathName: '/', body, schema }));
}

function robotsIndex() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Model hubs</span><h1>Every robot we cover</h1><p class="lead">Each hub has a symptom-to-verdict table, the Rebot Value Index entry, a buy-used inspection list and a sell-it-right list. Missing yours? <a href="/report/">Tell us which robot</a>.</p>
<div class="search"><div><label for="q">Filter by brand or model</label><input id="q" type="search" data-filter-input placeholder="Roborock, Roomba, Go2…"></div><span class="small" data-filter-count></span></div></section>
<section class="wrap"><div class="cards" data-filter-list>
${models.map(m => `<a class="card" href="/robots/${m.slug}/" data-search="${esc(m.brand + ' ' + m.name + ' ' + m.category)}"><span class="meta">${esc(m.brand)} · ${esc(m.category)}</span><h3>${esc(m.name)}</h3><p>${esc(m.summary)}</p><span class="small">${m.symptoms.length} symptoms · ${m.value.observations} value observations</span></a>`).join('')}
</div><p class="pending" data-filter-empty hidden>No match. <a href="/report/">Ask us to add it</a>.</p></section>`;
  write('robots', layout({ title: `All robots — ${site.name}`, description: 'Model hubs for every robot RebotHub covers: verdict tables, value, buying and selling checklists.', pathName: '/robots/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Robots' }] }));
}

function modelPage(m) {
  const related = guides.filter(g => g.model === m.slug || (g.appliesTo || []).includes(m.slug));
  const faq = [
    { q: `Is a ${m.name.split(' and ')[0]} worth fixing?`, a: `It depends on what is wrong. ${m.symptoms.filter(s => s.verdict === 'fix').length} of the ${m.symptoms.length} common faults in our table are routine, low-cost fixes. Board, camera and sensor faults usually are not.` },
    { q: `What is a used ${m.name.split(' and ')[0]} worth?`, a: m.value.observations >= 3 ? `Our current band is ${m.value.band} from ${m.value.observations} observations.` : `We have not yet collected three dated observations, so we do not publish a figure. The page links to current sold listings and explains how to read them.` },
    { q: `What should I check before buying a used ${m.name.split(' and ')[0]}?`, a: m.buyChecks[0] + ' ' + m.buyChecks[1] }
  ];
  const body = `<section class="wrap page-head"><span class="eyebrow">${esc(m.brand)} · ${esc(m.category)} · since ${esc(m.launched)}</span><h1>${esc(m.name)}</h1><p class="lead">${esc(m.summary)}</p>
<div class="toc"><a href="#verdict">Verdicts</a><a href="#value">Value</a><a href="#buy">Buying used</a><a href="#sell">Selling</a><a href="#guides">Guides</a><a href="#reports">Owner reports</a></div></section>
<section class="wrap section" id="verdict"><h2>Fix, sell, or replace?</h2>${symptomTable(m)}<div class="safety" style="margin-top:18px"><strong>Support note</strong>${esc(m.supportNote)} <a href="${esc(m.officialSupport)}" rel="noopener" target="_blank">Official support</a>.</div></section>
<section class="wrap section" id="value"><h2>What it is worth used</h2>${valueBlock(m)}</section>
<section class="wrap section split" id="buy"><div><span class="eyebrow">Buying used</span><h2>Inspect it in ten minutes</h2><ul class="checks">${m.buyChecks.map(c => `<li>${esc(c)}</li>`).join('')}</ul><p><a href="/fix/evergreen/buying-a-used-robot-inspection/">The general inspection guide</a> · <a href="/fix/evergreen/handover-and-account-transfer/">The clean handover</a></p></div>
<div id="sell"><span class="eyebrow">Selling</span><h2>Get the most for it</h2><ul class="checks">${m.sellChecks.map(c => `<li>${esc(c)}</li>`).join('')}</ul><p><a class="button" href="/market/#template">Listing template →</a></p></div></section>
<section class="wrap section" id="guides"><h2>Guides for this robot</h2>${related.length ? `<div class="cards">${related.map(g => `<a class="card" href="/fix/${g.slug}/"><span class="meta">${esc(PROV[g.provenance].label.split(':')[0])} · ${VERDICT[g.verdict].label}</span><h3>${esc(g.title)}</h3><p>${esc(g.symptom)}</p></a>`).join('')}</div>` : `<p class="pending">No step-by-step guide yet. The verdict table above still applies. <a href="/report/">Tell us what broke</a> and it moves up the list.</p>`}</section>
<section class="wrap section" id="reports"><h2>Owner reports</h2><p class="pending">None published yet. Reports appear here with first name and date once we have checked them. <a href="/report/">Report a sale or a fix</a>.</p></section>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'Article', headline: `${m.name}: fix, sell, or replace?`, author: { '@type': 'Person', name: site.owner }, publisher: { '@type': 'Organization', name: site.name }, dateModified: TODAY, mainEntityOfPage: url(`/robots/${m.slug}/`) }, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }];
  write(`robots/${m.slug}`, layout({ title: `${m.name}: fix, sell, or replace? Used value and common faults — ${site.name}`, description: `${m.name} symptom-to-verdict table, used value with sample size, and buying and selling checklists.`, pathName: `/robots/${m.slug}/`, body, schema, crumbs: [{ label: 'Home', href: '/' }, { label: 'Robots', href: '/robots/' }, { label: m.name }] }));
}

function guidesIndex() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Fix guides</span><h1>Start with the symptom</h1><p class="lead">Each guide names its source, its risk class and who reviewed it. "Documented" means the steps follow the manufacturer's published procedure; "Hands-on" means we did it on camera.</p>
<div class="search"><div><label for="q">Filter by robot, error code or symptom</label><input id="q" type="search" data-filter-input placeholder="error 14, battery, lidar…"></div><span class="small" data-filter-count></span></div></section>
<section class="wrap"><div class="cards" data-filter-list>
${guides.map(g => `<a class="card" href="/fix/${g.slug}/" data-search="${esc(g.title + ' ' + g.symptom + ' ' + (g.model ? modelBySlug[g.model].brand + ' ' + modelBySlug[g.model].name : 'general'))}"><span class="meta">${g.model ? esc(modelBySlug[g.model].brand) : 'Any robot'} · ${VERDICT[g.verdict].label}</span><h3>${esc(g.title)}</h3><p>${esc(g.symptom)}</p></a>`).join('')}
</div><p class="pending" data-filter-empty hidden>No match yet. <a href="/report/">Tell us what broke</a>.</p></section>`;
  write('guides', layout({ title: `Fix guides — ${site.name}`, description: 'Symptom-led repair guides for robot vacuums and legged robots, each with a fix, sell, or replace verdict and a named source.', pathName: '/guides/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Fix guides' }] }));
}

function guidePage(g) {
  const m = g.model ? modelBySlug[g.model] : null;
  const prov = PROV[g.provenance];
  const risky = ['battery', 'blade', 'mains', 'water'].includes(g.riskClass);
  const safety = risky || g.safety ? `<div class="safety"><strong>Safety first${risky ? ` · ${esc(g.riskClass)} work` : ''}</strong>${esc(g.safety || '')} ${risky ? esc(site.safetyGeneral) : ''} You take on the risk of work you do yourself; if anything looks damaged or you are unsure, stop.</div>` : '';
  const parts = g.parts && g.parts.length ? `<h2 id="parts">Parts</h2>${disclosure()}<div class="parts">${g.parts.map(p => `<div class="part"><div><strong>${esc(p.name)}</strong><p>${esc(p.note)}</p></div><a class="button small" href="${amazon(p.search)}" rel="sponsored nofollow noopener" target="_blank">Check price on Amazon ↗</a></div>`).join('')}</div>` : '';
  const applies = (g.appliesTo || []).filter(s => modelBySlug[s]).map(s => `<a href="/robots/${s}/">${esc(modelBySlug[s].name)}</a>`).join(', ');
  const body = `<section class="wrap page-head"><span class="eyebrow">${m ? esc(m.brand) + ' · ' : ''}Fix guide</span><h1>${esc(g.title)}</h1><p class="lead">${esc(g.symptom)}.</p>
<div class="badges"><span class="badge ${prov.cls}">${esc(prov.label)}</span><span class="badge">Risk: ${esc(g.riskClass === 'none' ? 'low' : g.riskClass)}</span>${g.tools && g.tools.length ? `<span class="badge">Tools: ${esc(g.tools.join(', '))}</span>` : ''}</div>
<p class="small">${esc(g.provenanceNote)}</p>${reviewed(g)}</section>
<section class="wrap section"><div class="verdict-box v-${g.verdict}"><strong>${VERDICT[g.verdict].icon} Verdict: ${VERDICT[g.verdict].label}</strong>${esc(g.verdictText)}</div>${safety}
<h2>Steps</h2><ol class="steps">${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
${parts}
${g.faq && g.faq.length ? `<h2 style="margin-top:32px">Questions</h2>${g.faq.map(f => `<details class="q"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}` : ''}
${applies ? `<p style="margin-top:28px"><strong>Applies to:</strong> ${applies}.</p>` : ''}
${m ? `<p><a class="button" href="/robots/${m.slug}/">Back to the ${esc(m.name)} hub →</a></p>` : ''}
<p class="small" style="margin-top:28px">Did this work for you, or not? <a href="/report/">Report it</a>; confirmed reports change the provenance badge on this page.</p></section>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'HowTo', name: g.title, description: g.symptom, step: g.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })), tool: (g.tools || []).map(t => ({ '@type': 'HowToTool', name: t })), author: { '@type': 'Person', name: site.owner }, dateModified: TODAY }];
  if (g.faq && g.faq.length) schema.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: g.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Fix guides', href: '/guides/' }];
  if (m) crumbs.push({ label: m.name, href: `/robots/${m.slug}/` });
  crumbs.push({ label: g.title });
  write(`fix/${g.slug}`, layout({ title: `${g.title} — ${site.name}`, description: `${g.symptom}. Verdict: ${VERDICT[g.verdict].label}. ${g.provenanceNote}`.slice(0, 158), pathName: `/fix/${g.slug}/`, body, schema, crumbs }));
}

function valuePage() {
  const rows = models.map(m => `<tr><td data-label="Robot"><a href="/robots/${m.slug}/">${esc(m.name)}</a></td><td data-label="Used band">${m.value.observations >= 3 ? esc(m.value.band) : '<em>Collecting</em>'}</td><td data-label="Observations">${m.value.observations}</td><td data-label="Confidence">${m.value.observations >= 3 ? esc(m.value.confidence) : '—'}</td><td data-label="Updated">${m.value.updated ? esc(m.value.updated) : '—'}</td></tr>`).join('');
  const body = `<section class="wrap page-head"><span class="eyebrow">Rebot Value Index</span><h1>What robots actually<br><em class="accent">change hands for.</em></h1><p class="lead">A used-price band per model, built only from dated, sourced observations. When we do not have enough, the page says "collecting" instead of inventing a number. You can read that as honesty or as a work in progress; it is both.</p></section>
<section class="wrap section"><div class="table-wrap"><table><caption>Index status, ${TODAY}</caption><thead><tr><th scope="col">Robot</th><th scope="col">Used band</th><th scope="col">Observations</th><th scope="col">Confidence</th><th scope="col">Updated</th></tr></thead><tbody>${rows}</tbody></table></div>
<p style="margin-top:16px"><a class="button primary" href="/report/">Report a sale and move a model off "collecting" →</a></p></section>
<section class="wrap section prose" id="methodology"><h2>Methodology</h2>
<p><strong>What counts as an observation.</strong> A completed sale or purchase of a specific model, with a date, a condition (working with dock; working without dock; needed a repair; for parts), a price, and a source we can name: one of our own flips, an owner's report, a manufacturer's refurbished-store price, or a public sold listing read by a person and logged with its URL. Asking prices are logged separately and never averaged into the band.</p>
<p><strong>How the band is computed.</strong> Median of working-with-dock observations in a rolling 90-day window, shown as a range from the 25th to the 75th percentile. Minimum three observations to publish; confidence is <em>wide</em> at 3-7, <em>medium</em> at 8-14, <em>tight</em> at 15 or more. A trend appears only after eight weekly snapshots exist.</p>
<p><strong>What we do not do.</strong> We do not scrape marketplaces, and we do not use data whose terms forbid commercial reuse. We have applied for eBay's Marketplace Insights programme; if it is granted, those observations will be labelled as such. We do not print retailer prices for new robots or parts because they change daily; buttons open the live listing.</p>
<p><strong>Corrections.</strong> If a figure is wrong, <a href="/report/">tell us</a>. Corrections are logged on this page with the date.</p>
<h3>Changelog</h3><ul><li>${TODAY}: methodology v1 published. No bands yet; all models collecting.</li></ul></section>`;
  write('value', layout({ title: `Rebot Value Index: what used robots sell for — ${site.name}`, description: 'Used-price bands for robot vacuums and legged robots, built only from dated, sourced observations, with the sample size shown on every figure.', pathName: '/value/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Value index' }] }));
}

function humanoidPage() {
  const legged = models.filter(m => m.track === 'humanoid');
  const body = `<section class="wrap page-head"><span class="eyebrow">The humanoid track</span><h1>Before the first used humanoid<br><em class="accent">is listed.</em></h1><p class="lead">Humanoids you can actually order today are developer and research machines: Unitree's G1 and R1 lines, and 1X's NEO on preorder for homes. Within a few years the first ones will be resold. The questions that will decide their value are being answered right now in the Unitree Go2 market, so that is where we start.</p></section>
<section class="wrap section prose"><h2>What will decide a used humanoid's value</h2>
<ul><li><strong>The licence, not the body.</strong> Unitree already sells Air, Pro and EDU trims that differ mainly in what software the owner may run. Whether that licence transfers to a second owner is the single biggest question, and today the answer is "ask the manufacturer".</li>
<li><strong>Actuators and cycles.</strong> Legged robots wear their joints the way cars wear engines. Expect the first honest listings to quote walking hours and actuator temperatures.</li>
<li><strong>Battery packs.</strong> Spare packs are a large share of a legged robot's value and ship under strict lithium rules.</li>
<li><strong>Firmware and support.</strong> A robot whose firmware the maker no longer updates, or whose cloud features need an account the seller controls, is worth less than it looks.</li>
<li><strong>Fall history.</strong> The humanoid equivalent of an accident report.</li></ul>
<h2>Models we are watching</h2>
<div class="table-wrap"><table><caption>As of ${TODAY}. Prices are not printed because they change; links go to the maker.</caption><thead><tr><th scope="col">Robot</th><th scope="col">Status for an individual buyer</th><th scope="col">Why it matters for resale</th></tr></thead><tbody>
<tr><td data-label="Robot">Unitree Go2</td><td data-label="Status">Orderable; several trims</td><td data-label="Why">The rehearsal market. <a href="/robots/unitree-go2/">Hub</a>.</td></tr>
<tr><td data-label="Robot">Unitree R1</td><td data-label="Status">Orderable; the lowest-priced humanoid line</td><td data-label="Why">Likely the first humanoid to appear used in volume.</td></tr>
<tr><td data-label="Robot">Unitree G1</td><td data-label="Status">Orderable; developer platform</td><td data-label="Why">Sets the reference for research-grade resale.</td></tr>
<tr><td data-label="Robot">1X NEO</td><td data-label="Status">Preorder with deposit; subscription option</td><td data-label="Why">The first home-positioned humanoid; subscription units may never be resold at all.</td></tr>
<tr><td data-label="Robot">Figure 03, Apptronik Apollo, Tesla Optimus</td><td data-label="Status">Not sold to individuals as of this writing</td><td data-label="Why">Watch for fleet-retirement sales, not consumer resale.</td></tr>
</tbody></table></div>
<h2>Early-owner registry</h2><p>If you own a legged or humanoid robot, we would like to know what you have and what you would want from a resale guide. We will not publish your name or location. When the first used-humanoid checklists are ready you will see them first.</p>${form('registry')}</section>
<section class="wrap section"><h2>Legged robot hubs</h2><div class="cards">${legged.map(m => `<a class="card" href="/robots/${m.slug}/"><span class="meta">${esc(m.brand)}</span><h3>${esc(m.name)}</h3><p>${esc(m.summary)}</p></a>`).join('')}</div></section>`;
  write('humanoid', layout({ title: `The humanoid track: what used humanoids will be worth — ${site.name}`, description: 'What will decide the resale value of humanoid and legged robots, which models individuals can buy today, and an early-owner registry.', pathName: '/humanoid/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Humanoids' }] }));
}

function roombaPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Briefing · updated ${TODAY}</span><h1>Roomba after iRobot</h1><p class="lead">What the Chapter 11 and the sale to Picea mean for the Roomba you own, the one you are thinking of buying used, and what it is worth.</p></section>
<section class="wrap section prose"><h2>What happened</h2><p>iRobot filed for Chapter 11 protection on 14 December 2025 and emerged on 23 January 2026 as a subsidiary of Shenzhen Picea Robotics, its long-time contract manufacturer, which converted its claims into ownership. iRobot said at the time that the process would not disrupt the app, customer programmes or product support. Those assurances covered the bankruptcy period; what happens next is Picea's decision.</p>
<h2>What it means for a Roomba you own</h2><ul><li>Every Roomba we cover still cleans with the CLEAN button if the app or cloud is unavailable. Maps, schedules and room-by-room cleaning depend on the app.</li><li>Parts remain widely available from third parties regardless of the company's status; batteries, filters, brushes, bins and wheel modules are commodity items.</li><li>Keep your app account in good order and note your robot's firmware version; if a change is announced you will want to know where you started.</li></ul>
<h2>What it means if you are buying one used</h2><ul><li>Pay for the hardware, not the app features. A j7 whose value rests on obstacle avoidance and smart maps is more exposed than an i7 or 960 that most people run with one button.</li><li>Do the account handover in person; see <a href="/fix/evergreen/handover-and-account-transfer/">the clean handover</a>.</li><li>Check the current app status in the store reviews the week you buy.</li></ul>
<h2>What it means for value</h2><p>We have not yet collected enough observations to say how the news moved used prices. Every Roomba hub shows "collecting" until we have at least three dated sales. If you sold or bought one since December 2025, <a href="/report/">report it</a>; this is the single most useful thing a reader can do for the index right now.</p>
<h2>Hubs</h2><p><a href="/robots/irobot-roomba-j7/">Roomba j7</a> · <a href="/robots/irobot-roomba-i7/">Roomba i7</a> · <a href="/robots/irobot-roomba-960/">Roomba 960</a></p>
<p class="small">Sources: CBS News, Forbes and company statements, December 2025 to January 2026. We will update this page when Picea makes a statement about app or support changes.</p></section>`;
  write('roomba-after-irobot', layout({ title: `Roomba after iRobot: what the bankruptcy means for your robot — ${site.name}`, description: 'iRobot filed Chapter 11 in December 2025 and is now owned by Picea. What that means for the Roomba you own, one you might buy used, and its value.', pathName: '/roomba-after-irobot/', body, schema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Roomba after iRobot', author: { '@type': 'Person', name: site.owner }, dateModified: TODAY }], crumbs: [{ label: 'Home', href: '/' }, { label: 'Roomba after iRobot' }] }));
}

function flipsPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Rebot Flips</span><h1>Bought broken.<br><em class="accent">Fixed on camera. Sold.</em></h1><p class="lead">Every flip publishes its real ledger: what the robot cost, what the parts cost, how long it took, and what it sold for. The guides that come out of a flip get the "Hands-on" badge, and the sale becomes an observation in the Value Index.</p></section>
<section class="wrap section"><div class="table-wrap"><table class="ledger"><caption>The ledger</caption><thead><tr><th scope="col">Date</th><th scope="col">Robot</th><th scope="col">Bought for</th><th scope="col">Parts</th><th scope="col">Time</th><th scope="col">Sold for</th><th scope="col">Guide</th></tr></thead><tbody><tr><td data-label="Date" colspan="7"><em>No flips published yet. The first three are planned for the first 45 days; see <a href="/alerts/">alerts</a> to hear when they land.</em></td></tr></tbody></table></div>
<h2 style="margin-top:36px">Why flips, and not just guides</h2><div class="prose"><p>A repair guide written from a manual is only as good as the manual. A repair done on camera, on a robot that then sells to a stranger, is a tested claim. Flips also produce the three things this site cannot fake: original footage, real prices, and a reason for you to come back.</p><p>Want a robot flipped? If you have a dead one you would otherwise bin, <a href="/report/">tell us the model and what it does</a>.</p></div></section>`;
  write('flips', layout({ title: `Rebot Flips: broken robots, fixed on camera, sold, with the real numbers — ${site.name}`, description: 'A public ledger of robots bought broken, repaired on camera and resold, with parts cost, time and sale price.', pathName: '/flips/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Flips' }] }));
}

function marketPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Market</span><h1>Sell it well.<br><em class="accent">Buy it checked.</em></h1><p class="lead">Today the buyers are on eBay, so we make your eBay listing better. Our own listings page is review-first and free; when it has real volume we will say so here. ${esc(site.marketDomainNote)}</p></section>
<section class="wrap section split" id="template"><div><h2>The listing template</h2><p>Copy this into any marketplace. It answers the questions that cause returns.</p>
<pre style="white-space:pre-wrap;background:var(--white);border:1px solid var(--line);border-radius:16px;padding:18px;font-size:.9rem">[Brand] [Exact model] robot vacuum, [working / needs repair / parts]

Runtime observed: [NN] minutes on [date], on hard floor.
Included: robot, dock, power supply, [bags/pads/brushes].
Known faults: [none observed / describe plainly].
Account: removed from my account and factory reset on [date].
Cleaning: bin, filter and brushes cleaned; [filter replaced].
Shipping: battery installed, robot off, tanks drained, bumper taped.</pre>
<p><a class="button" href="/fix/evergreen/sell-your-robot-listing-and-shipping/">The full selling and shipping guide →</a></p></div>
<div><h2>List it here (free, reviewed)</h2><p>Listings are read by a person before they appear. No fees, no payments through us; buyers contact you directly after we approve the listing.</p>${form('listing')}</div></section>
<section class="wrap section"><h2>Current listings</h2><p class="pending">None yet. We will not pad this page with sample inventory; when the first reviewed listing is approved it appears here with its date.</p>
<h2 style="margin-top:36px">Buying?</h2><p>Start with the <a href="/robots/">model hub</a> for the robot you are considering, run the ten-minute inspection, and read the handover guide. Then search sold listings: ${models.filter(m => m.track === 'home').slice(0, 4).map(m => `<a href="${ebaySearch(m.brand + ' ' + m.name.split(' and ')[0])}" rel="nofollow noopener" target="_blank">${esc(m.name.split(' and ')[0])}</a>`).join(' · ')}.</p></section>`;
  write('market', layout({ title: `Market: sell or find a used robot — ${site.name}`, description: 'A listing template that prevents returns, a free review-first listings page, and buying guidance for used robots.', pathName: '/market/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Market' }] }));
}

function reportPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Contribute</span><h1>Report a sale<br>or a fix</h1><p class="lead">This is how the Value Index gets its numbers and how guides earn their badges. A person reads every report before anything changes on the site.</p></section>
<section class="wrap section split"><div>${form('report')}</div><div class="prose"><h2>What helps most</h2><ul><li>A sale price with the date, condition and where it sold.</li><li>A repair that worked, with the part you used.</li><li>A repair that did <em>not</em> work; it saves the next person money.</li><li>A robot we do not cover yet.</li></ul><p>We never publish your email, full serial numbers or home layouts. Reports appear as "First name, month" on the relevant hub.</p></div></section>`;
  write('report', layout({ title: `Report a sale or a fix — ${site.name}`, description: 'Add a sale price or a repair outcome to RebotHub. Every report is read by a person before anything changes.', pathName: '/report/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Report' }] }));
}

function alertsPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Owner alerts</span><h1>One email<br><em class="accent">when it matters.</em></h1><p class="lead">A value band changes, a flip publishes, or a support or firmware notice lands for a robot you own. Weekly at most, usually less.</p></section>
<section class="wrap section split"><div>${form('alerts')}</div><div class="prose"><h2>What you get</h2><ul><li>Value Index changes for the robots you care about.</li><li>New flips and hands-on guides.</li><li>Support-status changes, such as the iRobot ownership change.</li></ul><p>Double opt-in, unsubscribe in one click, and we do not sell or share the list. <a href="/privacy/">Privacy</a>.</p></div></section>`;
  write('alerts', layout({ title: `Owner alerts — ${site.name}`, description: 'Get one email when a robot value changes, a flip publishes, or a support notice lands.', pathName: '/alerts/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Alerts' }] }));
}

function aboutPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">About</span><h1>Who checks this</h1><p class="lead">${esc(site.ownerBlurb)}</p></section>
<section class="wrap section prose"><h2>Why RebotHub exists</h2><p>Most robot "failures" are a battery, a contact or a brush. Most robots that get thrown away could have been fixed for a fraction of their price or sold to someone who would fix them. And the first used humanoids are a few years away with nobody writing down what will make one worth buying. RebotHub is the second-life guide for the robots people own now, and the notebook for the ones that are coming.</p>
<h2>How we work</h2><ul><li>Guides carry a provenance badge. "Hands-on" means ${esc(site.owner)} did the repair on camera. "Documented" means the steps follow a manufacturer's published procedure. Nothing is published on AI inference alone.</li><li>Values carry a sample size and a date. Fewer than three observations and the page says "collecting".</li><li>Drafts are prepared with AI assistance and reviewed by a person; every page says whether that review has happened yet.</li><li>We earn commissions on some links and say so directly above them. Verdicts are written before any link is chosen.</li></ul>
<h2>Watch</h2><p>Flips and repairs are filmed for <a href="${esc(site.youtubeChannel)}" rel="noopener" target="_blank">${esc(site.owner)}'s YouTube channel</a>.</p>
<h2>Corrections</h2><p>Found an error? <a href="/report/">Tell us</a>. Corrections are noted on the page they affect.</p></section>`;
  write('about', layout({ title: `About — ${site.name}`, description: `Who runs RebotHub, how guides and values are checked, and how the site earns.`, pathName: '/about/', body, schema: [{ '@context': 'https://schema.org', '@type': 'Person', name: site.owner, url: url('/about/'), sameAs: [site.youtubeChannel] }], crumbs: [{ label: 'Home', href: '/' }, { label: 'About' }] }));
}

function disclosurePage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Disclosure</span><h1>How RebotHub earns</h1></section><section class="wrap section prose"><p>RebotHub is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. We may also earn from eBay Partner Network links and from other affiliate programmes named on the page where they appear.</p><p>A disclosure sits directly above every parts table and affiliate button, not only here. Verdicts are written before any link is chosen, and a "sell" or "replace" verdict earns us nothing extra. We never print prices; buttons open the live listing.</p><p>Flips earn whatever the repaired robot sells for, and those numbers are published in <a href="/flips/">the ledger</a>.</p></section>`;
  write('disclosure', layout({ title: `Affiliate disclosure — ${site.name}`, description: 'How RebotHub earns money and where disclosures appear.', pathName: '/disclosure/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Disclosure' }] }));
}

function privacyPage() {
  const body = `<section class="wrap page-head"><span class="eyebrow">Privacy</span><h1>What we collect</h1></section><section class="wrap section prose"><p><strong>Reading the site:</strong> no cookies, no session recording. If we add analytics it will be cookieless, aggregate page counts only, and this page will say so.</p><p><strong>Alerts:</strong> your email address, with double opt-in, held by our email provider. Every email has an unsubscribe link and our postal address. We do not sell or share the list.</p><p><strong>Reports and listings:</strong> what you type in the form, held in a private spreadsheet, read by a person. We publish first name and month only. Do not send full serial numbers or home layouts; if you do, we remove them.</p><p><strong>Outbound links:</strong> Amazon, eBay and manufacturer sites have their own policies. Affiliate links tell those sites that you came from RebotHub.</p><p><strong>Your rights:</strong> ask us to delete anything you sent and we will. Contact via the <a href="/report/">report form</a>.</p><p class="small">Postal address and contact email will be added here before the alerts list goes live.</p></section>`;
  write('privacy', layout({ title: `Privacy — ${site.name}`, description: 'What RebotHub collects and does not collect.', pathName: '/privacy/', body, crumbs: [{ label: 'Home', href: '/' }, { label: 'Privacy' }] }));
}

function notFound() {
  const body = `<section class="wrap page-head"><h1>That page has been<br><em class="accent">rehomed.</em></h1><p class="lead">Try the <a href="/robots/">model hubs</a> or the <a href="/guides/">fix guides</a>.</p></section>`;
  write('404.html', layout({ title: `Not found — ${site.name}`, description: 'Page not found.', pathName: '/404.html', body, noindex: true }));
}

/* ---------- feeds and meta ---------- */
function extras() {
  const guideUrls = guides.map(g => `/fix/${g.slug}/`);
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(p => !p.endsWith('404.html')).map(p => `  <url><loc>${url(p)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url('/sitemap.xml')}\n`);
  fs.writeFileSync(path.join(OUT, 'feed.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n<title>${esc(site.name)} guides</title><link href="${url('/feed.xml')}" rel="self"/><link href="${site.domain}"/><updated>${TODAY}T00:00:00Z</updated><id>${site.domain}/</id>\n${guides.map(g => `<entry><title>${esc(g.title)}</title><link href="${url('/fix/' + g.slug + '/')}"/><id>${url('/fix/' + g.slug + '/')}</id><updated>${TODAY}T00:00:00Z</updated><summary>${esc(g.symptom)}</summary></entry>`).join('\n')}\n</feed>\n`);
  fs.writeFileSync(path.join(OUT, 'llms.txt'), `# ${site.name}\n\n> ${site.tagline} ${site.subtitle}\n\nRebotHub publishes symptom-led repair guides with a Fix / Sell / Replace verdict, a used-price index (Rebot Value Index) that shows sample size and date on every figure, and buying, selling and handover checklists for consumer and legged robots. Guides carry a provenance badge (hands-on, documented, owner-reported, editorial). Values with fewer than three observations are shown as "collecting".\n\n## Model hubs\n${models.map(m => `- [${m.name}](${url('/robots/' + m.slug + '/')}): ${m.summary}`).join('\n')}\n\n## Fix guides\n${guides.map(g => `- [${g.title}](${url('/fix/' + g.slug + '/')}): ${g.symptom}`).join('\n')}\n\n## Reference\n- [Rebot Value Index and methodology](${url('/value/')})\n- [Humanoid track](${url('/humanoid/')})\n- [Roomba after iRobot](${url('/roomba-after-irobot/')})\n- [Rebot Flips ledger](${url('/flips/')})\n- [About and editorial policy](${url('/about/')})\n`);
  for (const f of ['styles.css', 'app.js', 'hero.svg', 'favicon.svg']) fs.copyFileSync(path.join(ROOT, 'src', f), path.join(OUT, f));
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  /* OG image: simple SVG served as fallback until a PNG generator is added */
  fs.writeFileSync(path.join(OUT, 'og.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f5f3ec"/><circle cx="110" cy="110" r="44" fill="#244cdb"/><text x="110" y="128" text-anchor="middle" font-family="Georgia" font-size="56" fill="#fff">↻</text><text x="80" y="330" font-family="Arial" font-size="88" fill="#172421" letter-spacing="-4">Everyday robots.</text><text x="80" y="430" font-family="Georgia" font-style="italic" font-size="88" fill="#244cdb">Longer lives.</text><text x="80" y="540" font-family="Arial" font-size="30" fill="#4d5d56">rebothub.com · fix it, value it, rehome it</text></svg>`);
}

/* ---------- checks ---------- */
function check() {
  const problems = [];
  const files = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : (p.endsWith('.html') && files.push(p)); } })(OUT);
  const exists = href => {
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) return true;
    const p = path.join(OUT, clean);
    return fs.existsSync(p) || fs.existsSync(path.join(p, 'index.html'));
  };
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const rel = path.relative(OUT, f).replace(/\\/g, '/');
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) if (!exists(m[1])) problems.push(`${rel}: broken internal link ${m[1]}`);
    if (!/<link rel="canonical"/.test(html)) problems.push(`${rel}: missing canonical`);
    if (/\$\s?\d/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) problems.push(`${rel}: a dollar price appears in page text`);
  }
  for (const m of models) { if (m.value.observations < 3 && m.value.band) problems.push(`${m.slug}: band set with <3 observations`); if (!m.symptoms.length) problems.push(`${m.slug}: no symptoms`); for (const s of m.symptoms) if (s.guide && !guideBySlug[s.guide]) problems.push(`${m.slug}: unknown guide ${s.guide}`); }
  for (const g of guides) { if (!PROV[g.provenance]) problems.push(`${g.slug}: bad provenance`); if (['battery', 'blade', 'mains', 'water'].includes(g.riskClass) && !g.safety) problems.push(`${g.slug}: risky guide without safety text`); if (g.model && !modelBySlug[g.model]) problems.push(`${g.slug}: unknown model`); }
  if (problems.length) { console.error('CHECK FAILED\n' + problems.join('\n')); process.exit(1); }
  console.log(`check ok: ${files.length} pages, 0 problems`);
}

/* ---------- run ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
home(); robotsIndex(); models.forEach(modelPage); guidesIndex(); guides.forEach(guidePage);
valuePage(); humanoidPage(); roombaPage(); flipsPage(); marketPage(); reportPage(); alertsPage(); aboutPage(); disclosurePage(); privacyPage(); notFound();
extras();
console.log(`built ${pages.length} pages -> docs/`);
if (CHECK) check();
