---
version: "2.0"
name: "Project 2 | Advertising Budget Optimizer — Rounded Bento Dashboard"
description: "Codex UI/UX implementation contract for the standalone advertising analytics, ML and budget-optimization application. Adapted from the supplied light, rounded TaskLab-style dashboard reference and the original Elias Vance design source."
reference_priority:
  - "The user's Task Management Dashboard.jpg screenshot: primary VISUAL reference"
  - "This design.md: source of truth for application UI/UX and interaction behavior"
  - "agent.md: source of truth for features, data integrity, backend and implementation gates"
visual_style: "light-first soft bento dashboard; oversized rounding; lime highlights; charcoal analytics; friendly, professional, uncluttered"
frontend:
  framework: "Next.js + React + TypeScript"
  styling: "Tailwind CSS with CSS design tokens"
  components: "Accessible primitives (for example shadcn/ui + Radix)"
  icons: "Lucide"
  animation: "Motion / Framer Motion or lightweight CSS, respecting reduced motion"
  charts: "Recharts or another accessible React chart library"
  api: "Python FastAPI (backend owns all ML, analytics and data processing)"
colors:
  canvas: "#EEF0EA"
  app-shell: "#F8F9F5"
  surface: "#FFFFFF"
  surface-soft: "#F3F4EF"
  lime: "#D9FA65"
  lime-strong: "#9EFF00"
  charcoal: "#131514"
  charcoal-soft: "#242725"
  text-primary: "#171A17"
  text-secondary: "#626861"
  border: "#E5E8E0"
  error: "#B42318"
  success: "#246B45"
typography:
  heading: "Inter or Geist, 600–700"
  body: "Geist or Inter, 400–500"
  numeric: "Inter/Geist with tabular numerals"
  metadata: "JetBrains Mono sparingly, NOT for paragraphs"
spacing:
  base: "8px"
  card-padding: "20–28px desktop; 16–20px mobile"
  grid-gap: "16–20px"
radius:
  app-shell: "36px"
  major-card: "28px"
  normal-card: "24px"
  nested-card: "16px"
  control: "14–18px"
  pill: "9999px"
---

# DESIGN.md — UI/UX contract for Codex

## 0. Purpose and non-negotiable interpretation

We are developing **Project 2: AI-Powered Digital Advertising Budget Optimizer**, initially as a **standalone** application. It must be pleasant for a shop owner who is not a data scientist, technically truthful for a university demo, and extensible to real advertiser CSVs and future Shopify integration. Do **not** integrate Project 1 now.

**The supplied Task Management Dashboard.jpg image is the visual inspiration, NOT the content/functionality to copy.** Translate its rounded white container, soft off-white/grey background, expressive bento-card sizes, floating/layered feel, oversized rounded corners, black information cards, lime-highlight panels, small friendly sidebar, calm spacing, and compact charts into **advertising analytics**. Do not reproduce task/calendar/chat/team widgets that do not belong in this product.

The original `elias-vance-digital-architect-DESIGN.md` inspired the lime accent (#9EFF00), bold contrasting dark surfaces, Inter/Geist typography, clear hierarchy, and restrained motion. **This revised file intentionally replaces the original black-first palette and tiny 8px card radii** with the light, rounded reference. Where the two disagree, this file and the screenshot win on presentation. `agent.md` wins on mathematical correctness, user-data handling, ML, Big Data, security and milestones.

**Core UX objective:** A first-time merchant should be able to (1) try a safe demo or upload campaign data, (2) understand performance, (3) see whether the ML model is valid, (4) enter a budget and constraints, and (5) receive an explainable recommendation without guessing what to click. Make the experience welcoming, calm, obvious, and honest—not childish, oversimplified, noisy or filled with technical jargon.

## 1. The visual direction — replicate the *language*, not the screenshot

**Reference features to implement:**

- Large, gently elevated **rounded application shell**, sitting within a pale grey/off-white canvas. A very subtle atmospheric gradient/blur may appear *behind* the shell; never behind numeric text or charts.
- Left **white / warm-white sidebar** with small line icons and a **dark filled pill** to mark the selected route. Sidebar is part of the rounded app shell.
- Main content in an **asymmetric bento grid**: one or two dominant analytics cards, supporting compact metric cards and a standout lime recommendation card. Avoid a repetitive uniform card grid.
- **Large corners** on cards, subtle shadows and minimal borders. White surfaces provide breathing space; charcoal cards provide dramatic but readable focal contrast.
- **Lime (#D9FA65) as a deliberate focal point**, for an actionable recommendation, selected chart data or one main CTA. Use #9EFF00 as a stronger branded variation, not as a continuous full-screen background.
- Neat **pill filters**, clear labels, microvisualizations and understated icons. Charts are uncluttered with useful tooltips.
- Typography with **big financial numbers**, short human-friendly headings, and low-noise metadata. Do not use tiny 10px labels for important financial or decision information.
- Gentle interaction states: soft hover elevation, selected borders/fills, pleasing chart transitions and small animated state changes—never motion that hinders understanding.

**Do not copy:** TaskLab branding, its person avatars/team roster, chat panel, timer, month calendar, task badges, marble image background or text. Do not add decorative faux widgets, fake records, unverified testimonials or filler charts.

### Visual hierarchy, at a glance

1. **What is my situation?** KPIs + data source/mode badge.
2. **What should I do?** A prominent allocation/recommendation preview or a clear next step.
3. **Why?** A simple cross-platform performance view and explanation.
4. **Can I trust it?** Explicit model status, data freshness, attribution caveats and assumptions.
5. **How do I explore?** Advanced drilldowns, benchmark experiments and export tools.

## 2. Design tokens and usage

| Role | Color | Use |
|---|---|---|
| App canvas | `#EEF0EA` | Outer background and atmospheric area |
| Main shell | `#F8F9F5` | Rounded workspace background |
| Standard card | `#FFFFFF` | Most charts, metrics, forms and tables |
| Soft card | `#F3F4EF` | Secondary nested zones, disabled surfaces |
| Lime highlight | `#D9FA65` | Primary recommendation card or main CTA |
| Strong lime | `#9EFF00` | Small branded accents / chart highlight when contrast allows |
| Charcoal | `#131514` | Dark analytics card, active sidebar item, primary text emphasis |
| Charcoal raised | `#242725` | Dark nested tiles and hover states |
| Primary text | `#171A17` | Titles, body on light surfaces |
| Secondary text | `#626861` | Explanatory copy and metadata |
| Light border | `#E5E8E0` | Light structural separation only |
| Error | `#B42318` | Text+icon error communication |
| Success | `#246B45` | Confirmed positive status; don't rely on color alone |

On lime panels use **dark text**. On charcoal panels use high-contrast **white or light grey text**. Never put pale lime text on white or light grey. Reserve brighter chart hues for distinguishable categories, never for decoration only. Target WCAG 2.2 AA contrast; validate actual foreground/background pairs.

**Corner radius system**: app shell 36px; dominant cards 28px; standard cards 24px; nested inset blocks 16px; inputs/buttons 14–18px; chips/toggles/active sidebar highlight fully pill-shaped. Keep shapes consistent rather than inventing different radii per page.

**Elevation:** diffuse light shadows, a fine border or both (e.g. 0 10px 35px rgba(15,20,12,.05)); dark cards can have a slightly stronger shadow. No harsh black outlines on every surface.

**Typography:** Inter/Geist; heading 28–36px desktop and 24–28px mobile; section headings 18–22px; card heading 15–18px; body 14–16px; metadata rarely below 12px; financial KPIs 28–44px with tabular numerals. Mono font only for technical IDs/benchmarks. Proper PKR formatting: `Rs. 1,000,000`, `3.2× ROAS`, `24.5% CTR` according to context; always label units and calculation basis.

**Spacing:** use an 8px base scale; card gaps 16–20px; desktop card padding 20–28px; mobile 16–20px; a comfortable max-width with a sidebar roughly 220–252px; never squeeze charts into illegible cards.

## 3. Frontend and service separation (intentional change to original default)

**Use a real component-based React frontend** to achieve the rounded bento layout and fine interactivity. Preferred: **Next.js + TypeScript + Tailwind CSS + accessible UI primitives + React charting + Lucide icons**. Use a **Python FastAPI backend** for all generated data, imports, metric calculations, Pandas/MapReduce/Spark, XGBoost inference/training and optimization. This explicitly overrides the `agent.md` *fallback* of Streamlit, as permitted by its design contract. Choose compatible maintained versions; no need to pin framework versions in this document.

- Do **not** put prediction formulas, processing engines, secrets or dataset truth inside the browser or mock API endpoints.
- Fetch real backend state via typed, documented API responses. In development, small **clearly labeled** fixture/demo values are permitted only before the corresponding endpoint is available; replace them as that vertical slice becomes functional.
- Reuse visual primitives (AppShell, Sidebar, SectionHeader, MetricCard, BentoCard, PillFilter, InfoTooltip, StatusPill, DatasetModeBadge, AccessibleChart, EmptyState, Stepper, UploadZone, RecommendationCard, ExplanationDrawer, RunProgress, ExportMenu, ConfirmDialog).
- Maintain design tokens in one theme location (CSS variables/Tailwind configuration). All pages must use them.
- Build responsive layout with CSS Grid/flex, not brittle absolute-positioned desktop mockups.
- Use real loading and error states; avoid cosmetic charts that suggest the backend has finished when it has not.

If repository scaffolding already exists, inspect it first and preserve working logic. Document any stack migration rather than overwriting a functioning implementation without cause. When no frontend exists yet, start with this preferred stack.

## 4. App structure and navigation

Desktop: left sidebar + main rounded workspace; main header showing current page, selected business/dataset, **Demo / Real Upload / Shopify CSV (pilot)** mode, date range and account/status controls where implemented.

**Sidebar routes, in this order:**

1. **Overview** — what's happening and what's next
2. **Data Studio** — generate synthetic data, upload/map CSV, inspect quality
3. **Campaigns** — analytics, comparisons, segmentation
4. **ML Studio** — train, validate and inspect model
5. **Budget Optimizer** — recommended distribution, scenarios and explanations
6. **Big Data Lab** — measured Pandas / MapReduce / Spark experiments
7. **Commerce & Attribution** — Phase 6; show only when actually implemented, or label disabled *Coming later*
8. **Connections** — Phase 7; do not imply working live ad/Shopify connections
9. **Help / About** — concise glossary, data assumptions, privacy and current implementation scope

Sidebar should be slim and quiet, with active dark pill treatment, friendly icons and easy-to-read text. It can collapse on desktop. On small screens, use a **simple menu drawer or bottom navigation for 3–5 primary destinations**, with others accessible in the menu. Never rely on hover-only navigation.

**App shell:** keep the key dashboard header and content grid visually cohesive. A faint textured/blurred page backdrop is allowed only if it remains lightweight and doesn't reduce card contrast. No fake operating system chrome.

## 5. Main dashboard — explicit bento composition

Recommended desktop first screen (conceptual grid; adapt dimensions for actual data):

```text
┌──────────── Rounded light workspace shell ─────────────────────────────┐
│ Sidebar │ Advertising Overview    [Demo data] [Date range] [Help]   │
│         │ Hello! Here's how your advertising is doing.               │
│ Overview│ ┌───────┐ ┌───────┐ ┌─────────┐ ┌────────────────────────┐ │
│ Data    │ │ Spend │ │Revenue│ │  ROAS   │ │ Data health / next step│ │
│ Campaign│ └───────┘ └───────┘ └─────────┘ └────────────────────────┘ │
│ ML      │ ┌──────────────────────────────┐ ┌────────────────────────┐ │
│ Budget  │ │ CHARCOAL performance card    │ │ LIME budget insight    │ │
│ Big Data│ │ useful chart + comparison    │ │ recommendation/CTA     │ │
│ ...     │ └──────────────────────────────┘ └────────────────────────┘ │
│         │ ┌──────────────────────────────┐ ┌────────────────────────┐ │
│         │ │ Campaign performance         │ │ Model / data trust     │ │
│         │ │ readable table/chart         │ │ explain status + link  │ │
│         │ └──────────────────────────────┘ └────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- Prefer **3–4 KPIs at a glance**: Total Spend, Revenue, ROAS, Conversions (when present). Other KPIs belong in secondary card or Campaigns.
- Charcoal chart: spending/revenue trend or platform comparison; clear legend, axes, tooltip, empty-state handling and date context.
- Lime recommendation: *if no valid ML recommendation yet*, show **"Ready to build your first budget plan?"** with *Train model* or *Explore demo* CTA, **not a fabricated allocation**.
- Model/data-trust card: **"Synthetic demo · 100,000 rows"**, **"Model not trained"**, or **"Model validated"** with genuine values. Explain confidence/limitations in plain language.
- Avoid oversized marketing copy. First viewport should remain operational, not promotional.

## 6. End-to-end user experience: first-time user → recommendation

### Start / onboarding: zero-confusion entry

Show a compact welcome with three paths:

- **Try a demo** (default; no account/API key): seed a small deterministic synthetic dataset, visibly tagged **Synthetic demo**.
- **Upload advertising CSV**: drag-and-drop + browse; preview; map columns; validate; confirm import.
- **Shopify sales CSV** (only Phase 6): explain that orders supplement **rather than replace** ad-spend data; never promise attribution from orders alone.

Use friendly short copy: **"Start with sample data or bring your own campaign report."** Include a 3–4-step progress indication: **Add data → Review performance → Train model → Plan budget**. Advanced Big Data benchmarking is discoverable, not part of mandatory merchant onboarding.

No dead controls. A coming-soon live integration must be visibly disabled and must not request credentials. If sample generation/training takes time, show genuine background/task progress returned by backend; do not animate a fake completed percentage.

### Import and source selection

- Drag/drop with file type and size guidance; clear upload status; preview first rows **before** permanent import.
- Simple source chips: **Synthetic**, **Ad CSV**, **Commerce CSV (pilot)**. Explain why they differ.
- Column mapping with detection suggestions, editable mapping, invalid-row breakdown, duplicates, date parsing, original currency, missing revenue and segmentation coverage.
- Blocking issues stop only the relevant action (e.g. absence of revenue prevents revenue optimization but not spend analytics); show a specific remedy.
- Never silently merge synthetic and real datasets, and never display a real upload as a Shopify live connection.

### Performance review

- Default to the clearest 2–3 charts plus KPIs, with advanced filters behind an expandable control.
- Every chart has a short **"What this means"** interpretation or accessible explanation.
- Quick platform comparisons: Facebook, Instagram, Google, TikTok, YouTube with readable legend and consistent labels.
- Drill down from a platform to campaign and audience segments. Date range and filters affect all relevant charts/metrics consistently.
- When data is missing, use **Not available** with a reason, never zero.

### Train and validate ML

- Make training an intentional action: dataset selector → short plain-language model explanation → **Train revenue model**.
- Training view: actual queued/running/succeeded/failed state, progress or task steps if available, cancellation only if implemented.
- Results: holdout MAE/RMSE or chosen real evaluation metrics, baseline comparison, sample counts, time-based validation, model version, training date and **whether recommendations are enabled**.
- Explain uncertainty and the synthetic-only limitation in nontechnical language. If acceptance gates fail, disable ML-driven optimization and offer a transparent statistical baseline only when the backend supports it.

### Optimize budget

- Prominent but restrained form: **Total budget (PKR)** default **Rs. 1,000,000**, objective **Maximize expected revenue**, eligible platforms, optional minimum/maximum allocation and step size.
- Validate caps, floors and total in real time before submit (sum of minimums <= total <= sum of maximums). An invalid or incomplete form explains how to fix it.
- **Generate recommendation** invokes actual backend optimization. Show a real loading state and errors.
- Results show **exact PKR allocations, percentages summing to 100%, baseline comparison**, recommended platform ranking and a simple reason per platform, using a dominant lime recommendation card plus supporting charcoal/white panels.
- Include **Assumptions / How we calculated this** drawer: model version, dataset type, historical window, spend-response assumptions, limitations, attribution source and uncertainty.
- Let users adjust constraints and rerun; save/export only if actually implemented. No button should silently update spending on live platforms. Clear text: **"Recommendations only — no ad budgets are changed."**
- If data/model is insufficient, offer an honest, clearly named rule-based fallback if available; never imply it is ML.

### Big Data Lab

- Make benchmarking approachable through a **Run experiment** guided form: dataset size (10K, 100K, 1M, 10M), engine(s), workload, **Start benchmark**.
- Display actual measured runtime, throughput, memory where available, environment/config and correctness checks. Comparison chart and tidy table both available.
- Explain in one sentence that **Big Data Lab is for the university experiment, not required for a small merchant's daily use.**
- For 10M rows, show storage/resource warning and chunked workflow; don't load or visualize millions of rows in-browser.
- Clearly show engine **unsupported/unavailable/failed** states. Never replace missing timings with fabricated numbers.

### Commerce & Attribution (Phase 6 only)

- Show store order counts, net sales, refunds and attribution coverage separately from ad platform claimed conversions/revenue.
- An **Attribution quality** card states matched, unmatched and ambiguous orders/campaigns. Avoid implying Shopify orders are automatically matched to ads.
- Show **Profit insights** only when relevant cost coverage and join quality pass backend checks; otherwise state what the business needs to provide.
- Phase 7 integrations are separate, future work. Live Shopify/Meta/Google/TikTok **Connected** badges only after verified auth and data sync.

## 7. Essential components and how they should behave

| Component | Look | Required interaction / truthfulness |
|---|---|---|
| AppShell | 36px rounded off-white workspace | Responsive sidebar, no clipping important content |
| SidebarNav | Simple icons + dark active pill | Keyboard accessible; active route obvious |
| MetricCard | White, 24px corners, bold number | Units, comparison context, optional tooltip |
| SpotlightBento | Charcoal or lime, 28px corners | Useful chart/decision/action, never decoration alone |
| SourceBadge | Small neutral/source chip | Says Synthetic / Real CSV / Shopify CSV; no fake live state |
| PillFilter | 9999px radius, light selected fill | Clear selected/focus/disabled states; affects results |
| UploadZone | White rounded dashed-border zone | Drag/drop + click; progress, error & file details |
| Stepper | Quiet stages and inline help | Current, completed, blocked steps reflect actual status |
| RecommendationCard | Lime with dark text | Genuine allocation, totals, explanation, disclaimer |
| DataTable | White, rounded containment | Sorting, filtering, pagination/virtualization and export where functional |
| AccessibleChart | White/charcoal surface | Labeled axes, responsive tooltips, keyboard/table alternative |
| ExplanationDrawer | Rounded side panel | Clear provenance, formula/method and uncertainty |
| StatusDisplay | Compact label + icon | Real queued/running/failed/completed/disabled state |
| EmptyState | Small icon, 1 sentence, CTA | Tells user what to do; no empty decoration |
| ErrorNotice | Concise plain-language copy | Explains impact and recovery; no raw stack traces |

**Visual restraint:** At most one visually dominant lime card per primary viewport, plus small lime accents. One or two charcoal cards can balance it. Most of the canvas should stay warm white.

**Icons and motion:** use consistent Lucide line icons (16–20px); avoid emoji as primary UI icons. Buttons should press/hover subtly; cards may lift 2–4px; active-state transitions 150–250ms; chart redraws restrained; honor `prefers-reduced-motion`. No bouncy loading loops, parallax-heavy marketing animations, WebGL or decorative particle systems.

## 8. UX copy and nontechnical language

- Tone: friendly, precise, reassuring, **not** childish or sales-hype. A merchant should never feel tested on financial jargon.
- Prefer **"Your ad spend"** over "Marketing expenditure", **"Expected sales revenue"** over unexplained "predictive outcome", and **"Cost per sale"** with a CPA definition tooltip.
- Expand acronyms on first mention or in inline help: CTR, CPC, CPA, ROAS, ML, Spark.
- Every graph/table must say which **date range**, **dataset source**, **currency**, and **filters** it represents; show fewer repeated labels by placing context at section level.
- All projections must say **Estimated** or **Model-predicted**; synthetic results must say **Demo / synthetic**. Never say "Increase sales by 40%" unless validated appropriately.
- Default technical diagnostics should be collapsed behind **Details**, **How it works**, or **View methodology**.
- Helpful errors: "This file has no revenue column, so we can show spend and clicks but can't recommend a revenue-maximizing budget yet. Map a revenue column to continue."

## 9. Interaction, responsive and accessibility standards

**Interactive behaviors:**

- Every button, switch, chip, tab, date filter and drilldown must have a real state or backend effect, or be explicitly disabled with an explanation.
- Use optimistic updates only for safe local view controls; don't show a model as trained or an import as complete until the API confirms it.
- Filters and allocations survive normal in-app navigation where reasonable; reset is explicit.
- Clear toast/notices for successful imports, model runs and exports; status changes are also conveyed persistently, not only by vanishing notifications.
- Use skeletons for genuinely loading information, not as a substitute for blank data. Use loading progress for long-running jobs when backend supports it.

**Responsive breakpoints (suggested):**

- Desktop >= 1280px: sidebar + asymmetric 12-column bento grid; cards span 3/4/5/7/8 columns according to content.
- Laptop 900–1279px: narrower/collapsible sidebar; fewer columns; keep large cards legible.
- Tablet 640–899px: drawer sidebar; 2-column dashboard; long tables horizontally scroll inside a labeled container.
- Mobile < 640px: one-column vertical order **status → KPIs → recommendation → chart → table**; readable 16px body where practical; sticky primary action only when it won't obstruct content.

**Accessibility target: WCAG 2.2 AA**: sufficient contrast; visible keyboard focus; proper form labels and descriptions; screen-reader live regions for asynchronous statuses; semantic navigation/heading hierarchy; error messages tied to inputs; touch targets approximately 44×44px; reduced motion; tooltip content also accessible by keyboard; charts accompanied by accessible summaries or tabular data. Screen readers must be able to understand figures without relying on color or hover.

## 10. Progressive UI + backend implementation — REQUIRED (NOT a final polish phase)

**The user explicitly wants UX/UI developed continuously, alongside working functionality, not delayed until the last project phase.** Build **vertical slices**. Every backend milestone must end with a fully styled, genuinely interactive, responsive screen and a small UX review. Do not build a plain prototype now with the promise to add design at Phase 5.

| `agent.md` milestone | Deliver both backend work AND UI/UX in the same slice | UX exit condition |
|---|---|---|
| **Phase 0** Plan | Design tokens, global fonts, responsive AppShell, sidebar, route scaffolds, component library; zero-data onboarding | App opens cleanly on desktop/mobile; navigation is obvious |
| **Phase 1** Data + metrics | Styled **Data Studio**, CSV mapping/preview, Overview KPIs, first Campaign charts, source badges & empty states | User can demo/import → understand metrics without instruction |
| **Phase 2** Big Data | Functional **Big Data Lab** experiment form, real status/progress and comparison view | Real benchmark results readable; failures explainable |
| **Phase 3** ML | **ML Studio** training, model validation/readiness and errors | User knows when ML is usable and why/why not |
| **Phase 4** Budget | Full interactive **Budget Optimizer**, constraints, recommended allocation, methodology drawer | User can enter Rs. 1M, inspect allocations and understand caveats |
| **Phase 5** QA | Polish only remaining rough edges, responsive/accessibility/E2E checks, screenshot review | No dead actions, missing states, layout failures or fabricated data |
| **Phase 6** Shopify CSV pilot | Styled Commerce & Attribution with reconciliation, cost coverage and guarded profit mode | Correctly distinguishes ad metrics vs store orders |
| **Phase 7+** Future only | Add verified connection/onboarding patterns when backends actually work | Never show unimplemented integrations as live |

**Every slice: Discover → Implement → Test → Review**

1. Sketch the user journey and screen state for that slice (loading, empty, valid, invalid, failure).
2. Implement service/API, UI, keyboard/small-screen handling, and actual interaction together.
3. Add tests for business logic plus functional UI assertions/E2E for the primary path (e.g. Playwright) and visual snapshot/screenshots at representative sizes if available.
4. Review against the provided TaskLab-style screenshot: softness, radii, proportions, visual hierarchy, whitespace, lime emphasis; then ship the slice.
5. Record what is real, what is demo and what remains incomplete in a brief progress note. Do not claim an interface works solely because it visually resembles a finished screen.

**Quality gates for every route:** active nav state; consistent shell; true data source label; readable metric definitions; empty/loading/error states; mobile layout; keyboard focus; working links/actions; correct backend wiring; and explicit unavailable/future capabilities.

## 11. Performance and data safety constraints in the interface

- Use server-side filtering, aggregation, pagination and sampling for large datasets; never send or render 1M/10M raw records in React or in a giant interactive table.
- Charts should represent aggregated results, with downsampling where appropriate and an accessible summary.
- Train/benchmark jobs can take time; long-running tasks need actual job IDs and honest states, not browser-blocking fetches that silently timeout.
- Never expose tokens, merchant PII, API credentials, model internals or raw tracebacks in client output.
- Never show a "Shopify connected" visual unless a verified and authenticated read-only connection exists; imports alone are simply CSV data.
- If ad revenue attribution is uncertain, display a source/coverage warning adjacent to any budget recommendation.
- Do not add actual ad spend execution controls. The application makes **recommendations only**.

## 12. Visual and functional acceptance checklist

- [ ] First impression matches the **light rounded bento dashboard** inspiration, not the original dark portfolio page.
- [ ] Rounded shell, white slim sidebar, dark active pill, lime/charcoal feature cards, accessible whitespace and attractive compact charts are consistent.
- [ ] No TaskLab task/team/chat/calendar content is copied; everything belongs to ad analytics.
- [ ] Main dashboard shows meaningful data context + recommended next action above the fold.
- [ ] User can start without API keys through a clearly marked synthetic-data demo.
- [ ] CSV import is guided and recoverable; synthetic data never pretends to be real.
- [ ] All analytics, model results and budget figures come from the backend (or explicitly identified demo fixtures during development only).
- [ ] Default Rs. 1,000,000 optimization flow is easy to find and understand; results and assumptions are inspectable.
- [ ] Big Data Lab exposes real comparative measured results and unsupported states honestly.
- [ ] Every visible control works or is visibly disabled with an explanation.
- [ ] Desktop, tablet and mobile screens are tested; tables and charts stay readable.
- [ ] Keyboard navigation, focus, labels, color contrast, reduced motion and non-color status cues are verified.
- [ ] UI/UX was built and reviewed **in each project phase**, not appended at the very end.
- [ ] Project 1 is not modified or imported.

## 13. What Codex should do before coding

1. Read `AGENTS.md`, `agent.md`, this `design.md`, and inspect the repository.
2. If the screenshot is included in the repository, place or reference it as `references/Task Management Dashboard.jpg` and treat it as **moodboard only**. If unavailable, these written tokens/layout directions are sufficient; **do not block implementation**.
3. In `docs/implementation_plan.md`, explicitly commit to the **React/Next.js frontend + FastAPI/Python backend** and record how the phases deliver UI and functionality together.
4. Begin with Phase 0 AppShell and a real first-run empty state; then develop data ingestion and its UI together.
5. At the end of each phase, provide runnable screenshots/paths, tests executed, known gaps, and the next functional slice. Stay honest about missing integrations and untrained models.

**Final direction:** Make a distinctly designed, deeply usable finance/advertising workspace with **friendly guided UX, premium rounded bento UI, real analytics, authentic ML and honest recommendations**. It must be a functional tool, not an attractive static mockup.
