# Design upgrade v3: critique ledger and score (2026-10-25)

Reviewed snapshot: sha256 `beaf9e7fbcced79be7647fa8237b4d3af15e4b6e89e39c184e36e3044590676c`, re-verified unchanged after all three critics returned.
Critics: 3 independent, fresh-context, read-only, same model family (no provider diversity). Their scores: 78 (visual/UX), 72 (technical/accessibility/performance), 68 (risk/trust/maintainability).

| ID | Critic | Sev | Finding | Decision | Verification |
|---|---|---|---|---|---|
| T-H1 | Tech | High | Search results close on blur before a tap or click lands in Safari | Accepted | mousedown guard plus 150 ms deferred close; real click navigated in Chrome. Safari not tested |
| T-H2 | Tech | High | Escape did nothing on a hover-opened mega menu (WCAG 1.4.13) | Accepted | Document-level Escape; verified hover-only then Escape closes |
| T-M1 | Tech | Med | Hover then click toggled the menu shut | Accepted | 350 ms guard; direct click leaves it open (verified) |
| T-M2 | Tech | Med | Escape in drawer search closed the whole drawer | Accepted | First Escape closes results, second closes drawer (verified in 375 px frame) |
| T-M3 | Tech | Med | Focus ring under 3:1 on dark surfaces; inputs relied on border | Accepted | White ring (18:1) on topbar, footer, mega feature; 2 px outline on inputs; visible in screenshot |
| T-M4 | Tech | Med | "No match" marked as an option; no live count | Accepted | presentational item plus aria-live region ("5 results" read back) |
| T-M5 | Tech | Med | Print loses content below the fold | Accepted | print block added. Not test-printed |
| T-M6 | Tech | Med | backdrop-filter and four large layers cost on low-end phones | Accepted | Blur removed and 2 blobs hidden at 900 px and below or on touch. Not measured on a device |
| T-L1..L3 | Tech | Low | Header height flicker, mega max-height, dvh, labels | Accepted | hysteresis 24/4, max-height with scroll, dvh, distinct landmark labels |
| U-F1 | UX | High | No search on mobile bar | Accepted | Search icon button opens drawer and focuses input (verified) |
| U-F2 | UX | Med | Truncated placeholders | Accepted | Shortened |
| U-F3 | UX | Med | Long mobile drawer | Partly | Panels were already collapsed by default (the screenshot showed my test state); one-open-at-a-time kept |
| U-F4 | UX | Med | No popular searches in the header | Accepted | "Common starting points" on empty focus (verified) |
| U-F5 | UX | Med | Weak right side of category row | Accepted | Now a pill link to the methodology |
| U-F6 | UX | Med | Hero chips overlap art | Accepted | Repositioned to frame edges; caption moved. Visually checked at 1905 px only |
| U-F7 | UX | Low | Elevation roles inconsistent | Partly | Guide cards got a deeper tinted shadow; full role map deferred |
| U-F8/T-contrast | UX, Tech, Risk | Med | Contrast measured on tokens, not on text over glows | Accepted and confirmed | Worst-case stacked glows gave 3.54:1 (a real must-pass miss). Glows lightened, muted text darkened: now 5.17:1 worst case |
| U-F10 | UX | Low | Header too translucent | Accepted | .80 to .93 |
| R-R1 | Risk | High | Trust bar and header overclaimed ("Never guessed", "Reviewer named", sample size promise) | Accepted | Reworded to "Sources named", "Review status shown", "Values appear only after 3 dated sales"; About and footer copy corrected; grep finds no leftover |
| R-R2 | Risk | High | Hero chips read as verified outcomes | Accepted | Labelled "Example: ..." |
| R-R3 | Risk | Med | Search without JS fails silently; crawlable ?q chips | Accepted | noscript notes; chips rel=nofollow |
| R-R4/R5 | Risk | Med | Duplicate landmark labels; h4 before h1 | Accepted | Distinct labels; titles are paragraphs; check fails if any h4 reappears |
| R-R7 | Risk | Med | Reveal could hide content in odd renderers | Accepted | 2.5 s fallback reveals everything |
| R-R8 | Risk | Med | Hidden CSS/JS/build coupling and magic numbers | Accepted | CONFIG object, JS-owned class list, markup-contract check in `--check` |
| R-R9/R10/R11 | Risk | Med/Low | BASE_URL validation, search failure message, escaping and URL scheme | Accepted | Validated with clear error; "Search is unavailable" state; esc covers apostrophe; URLs must start with a single slash |
| R-R12 | Risk | Low | No high-contrast or forced-colors support; 11 px labels | Accepted | prefers-contrast and forced-colors blocks; labels raised to 12 px. Not tested with the OS settings on |
| R-R6 | Risk | Info | Nav links repeated on every page | Noted | Watch item, no change |

Not done: a second critic round on the post-fix snapshot (the skill allows one batch by default); real iOS Safari and touch device tests; throttled mobile performance measurement; OS-level reduced-motion, high-contrast and print tests; eBay capture.

## Score (agent-assessed heuristic, after fixes)
| Criterion | Pts | Credit | Main deductions |
|---|---|---|---|
| 1 Header and menu | 20 | 18 | Safari fix and touch behaviour unverified |
| 2 Depth | 20 | 18 | Elevation role map only partly unified |
| 3 Background | 15 | 13 | Motion smoothness and battery cost unmeasured |
| 4 Benchmark fit | 10 | 8 | eBay not captured; benchmark views were narrow |
| 5 Trust, content, accessibility | 15 | 12 | Print, high-contrast, reduced-motion untested live |
| 6 Performance and maintainability | 10 | 6 | JS 14.2 KB raw (4.6 KB gzip) against an 8 KB raw target; no throttled test |
| 7 Verification | 10 | 8 | Post-fix changes verified by the author, not re-reviewed |
| **Total** | 100 | **83** | |

Must-pass M1 to M7: all hold on the evidence above (M3 and M6 were failing in the first candidate and are fixed).
Result: **provisional artifact score 83/100.** Goal Loop is not complete: below 98 and the post-fix snapshot has not been re-reviewed.
