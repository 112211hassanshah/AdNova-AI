# AGENT.md — ONE-PAGE SOFTWARE HOUSE BUILD INSTRUCTIONS

## Mission

Build a **minimal, premium, interactive, one-page software-house website** using the supplied `design.md` as the absolute visual source of truth.

The target is not “a nice SaaS website.”

The target is a **custom art-directed software studio website** that feels modern, technical, controlled, responsive, and memorable.

The supplied visual references are now part of the design brief.

---

# 1. SOURCE PRIORITY

Use this order when making decisions:

1. `design.md`
2. supplied reference images
3. real company/service content supplied by the user
4. existing project architecture/components
5. your own design judgment

If the references contain blue/cyan, **do not copy their colors**.

The new brand language is:

- black / charcoal
- warm white / cream
- controlled signal orange

Never introduce blue, cyan, teal, or purple simply because the references use them.

---

# 2. HOW TO READ THE REFERENCES

## Reference A — OnRamp

Use it for:

- immersive full-screen hero
- centered/strong first-screen typography
- patterned visual atmosphere
- gradual transition from dramatic hero into a clean light section
- editorial white-space-heavy content
- large section headings
- clean information hierarchy

Do **not** copy:

- blue palette
- event branding
- arrow pattern literally unless adapted to our brand

Desired translation:

**dark obsidian top → subtle orange signal field → warm light fade → clean editorial content**

---

## Reference B — Forma AI

Use it for:

- compact floating navigation
- black premium environment
- rounded translucent panels
- thin light borders
- layered glass depth
- oversized typography behind foreground objects
- focused glow around key areas
- modern pricing/card proportion as a general panel reference

Do **not** turn the software-house site into a pricing page.

Do not copy the blue/cyan glow.

Translate the glow to **soft orange + warm white** and use it sparingly.

---

## Reference C — Glass Background

Use it for:

- vertical streaks
- blurred light bands
- atmospheric depth
- directional gradient texture
- smooth fade from dense visual area to light space

Translate:

`blue → orange / warm white / charcoal`

Do not recreate the blue image.

---

# 3. STRICT STYLE RULES

## Absolutely avoid

- blue
- cyan
- teal
- purple AI gradients
- random neon
- generic glowing blobs
- repeated feature-card grids
- generic “AI startup” look
- stock illustration packs
- meaningless 3D spheres
- fake dashboards
- fake metrics
- fake testimonials
- huge generic tech buzzwords
- overuse of glassmorphism
- overuse of orange

If any section looks like something generated from a common “modern SaaS landing page” prompt, redesign it.

---

# 4. ONE-PAGE WEBSITE

This is a **single-page experience**.

No unnecessary page splitting.

Navigation should smoothly move to sections on the same page.

Recommended narrative:

**Hero → Identity → Capabilities/Services → Interactive Feature/Work → Process → Technology → Proof/Principles → CTA → Footer**

The final order should adapt to the real services/content when supplied.

The page should feel continuous, not like unrelated sections stacked vertically.

---

# 5. RESPONSIVE DESIGN IS A PRIMARY REQUIREMENT

Desktop and mobile have equal priority.

Do not finish desktop and “make it responsive later.”

Design each major section with:

- desktop behavior
- tablet behavior
- mobile behavior

from the beginning.

Check approximately:

- 1440px+
- 1280px
- 1024px
- 768px
- 430px
- 390px
- 375px

Also drag through intermediate widths.

## Mobile rules

- no horizontal overflow
- no desktop hover dependency
- 44px+ touch targets
- no cramped side-by-side content
- no tiny navigation
- animation intensity reduced where needed
- strong mobile hero
- mobile menu designed intentionally
- decorative layers must never block readability
- banners should become good mobile compositions, not just stacked leftovers

---

# 6. PHASE-BASED EXECUTION

Do not build the entire website in one uncontrolled pass.

Work in large phases.

At the end of **every phase**, inspect your work yourself before continuing.

For each phase:

1. implement
2. run/build
3. inspect desktop
4. inspect mobile
5. compare with `design.md`
6. compare with reference intent
7. identify generic/weak areas
8. fix them
9. only then continue

Do not mark a phase complete merely because it compiles.

---

# PHASE 1 — STRUCTURE + ART DIRECTION FOUNDATION

## Goal

Build the complete visual architecture before advanced animation and final content.

### Build

- page shell
- global design tokens
- responsive layout/grid system
- navigation
- hero
- all major page sections
- banner containers
- service/capability structure
- selected work/project structure
- process structure
- CTA
- footer
- reusable components
- mobile layouts
- placeholder content where final copy is unavailable

---

## Phase 1A — Design tokens first

Before building sections:

1. read `design.md` fully
2. convert its colors, spacing, typography, radius, shadows, and motion values into reusable tokens/classes
3. remove any existing blue/cyan/purple styling that conflicts
4. avoid random one-off color values

The design system must be consistent before composition work begins.

---

## Phase 1B — Navigation

Build a floating navigation inspired by the Forma AI reference.

Desktop:

- compact rounded container
- subtle backdrop blur
- thin neutral border
- lightweight text
- one clear CTA
- visually floats above hero
- does not become a huge bar

Mobile:

- logo + compact menu control
- intentional menu panel/sheet
- large tap targets
- smooth open/close
- no compressed desktop links

If sticky:
- change contrast/surface gracefully when transitioning between dark and light sections

---

## Phase 1C — Hero

The hero is the most important part of the whole site.

Use the **OnRamp spatial idea** + **glass-gradient atmosphere** + **Forma depth**, but in our own palette.

### Desired hero construction

- deep black/charcoal top
- subtle orange atmospheric core
- custom technical pattern
- vertical streak/light-line layer
- fine grain/noise
- soft vignette
- oversized or highly controlled brand headline
- short supporting line
- primary CTA
- optional secondary CTA
- gradual transition into warm white/cream

The hero must not end with a hard rectangle.

It should visually **fade into the next light section** like the OnRamp reference.

### Important

Do not put a generic dashboard mockup in the center.

Do not fill it with cards.

The atmosphere + typography should carry the hero.

---

## Phase 1D — Light editorial section

Immediately after the hero, create a clean editorial section inspired by OnRamp.

Use:

- large heading
- compact explanatory paragraph
- generous negative space
- a few distinct capability markers or visual symbols
- asymmetrical or three-point composition only if it genuinely suits the content

If three items are used, do not make them look like three identical SaaS cards.

Prefer open layout, typography, icons/symbols, and whitespace.

---

## Phase 1E — Interactive banners

Create a small number of **large, meaningful banners** rather than many little cards.

Use rounded corners from `design.md`.

Possible compositions:

- full-width dark service canvas
- split interactive service selector
- selected-work panel with visual preview
- sticky process banner
- horizontal capability track
- technology ribbon
- interactive “what we build” module

Use the Forma reference for panel depth:

- black translucent surface
- thin border
- subtle inner highlight
- small, controlled orange glow
- no glossy chrome

Every banner needs an intentional mobile alternative.

---

## Phase 1F — Structure self-audit

Before Phase 2, check:

- Does the hero feel premium before animation exists?
- Does the hero transition naturally into the next section?
- Is the structure visually related to the references?
- Is the site clearly not a copied SaaS template?
- Is there any accidental blue/cyan/purple?
- Is orange being overused?
- Are there too many cards?
- Are sections visually different but still related?
- Does mobile preserve the design idea?
- Are headings wrapping correctly?
- Is there any horizontal overflow?
- Does every section have a reason to exist?
- Is the page one coherent experience?

Fix all visible weaknesses.

---

# PHASE 2 — MOTION + INTERACTION

Only begin this phase when Phase 1 is visually strong without animation.

## Motion philosophy

Motion should feel:

- smooth
- calm
- reversible
- technical
- intentional

Not:

- bouncy
- game-like
- over-springy
- constantly glowing
- excessive

---

## Required motion categories

Use a considered mix of:

- masked text reveals
- word/line stagger
- scroll-linked hero movement
- reversible text movement
- banner translation
- hover micro-interactions
- button feedback
- background streak movement
- subtle parallax
- marquee/ribbon where appropriate
- image/visual mask reveals
- nav morphing
- section fade/contrast changes
- project panel interaction

Do not apply every effect to every section.

---

## Reverse animation requirement

This is important.

Some major interactions must react in **both directions**.

When scrolling down:
- reveal
- translate
- expand
- sharpen
- increase intensity

When scrolling back up:
- naturally reverse
- reduce intensity
- return toward initial state

Examples:

- hero title shifts/fades based on scroll progress
- background signal field calms as user leaves hero
- banner elements translate one way down and reverse upward
- line-mask reveals re-close partially
- section labels move based on scroll direction

Avoid “play once and stay there” for everything.

---

## Hero background motion

Animate the hero subtly.

Possible layers:

- vertical streak drift
- slow orange light movement
- micro-pattern offset
- grain/noise movement
- very slow gradient breathing
- pointer-reactive field on desktop

Keep pointer reaction extremely subtle.

On mobile:
- remove pointer tracking
- reduce layer count if needed
- prefer CSS transforms/opacity
- maintain smooth 60fps where possible

---

## Text animation

Typography is a primary motion surface.

Use:

- clipping/masks
- line-by-line rise
- word stagger
- blur-to-sharp
- controlled character animation for selected labels
- scroll-linked movement

Do not make paragraph text difficult to read.

---

## Performance

Prefer:

- transform
- opacity
- clip-path when reasonable
- CSS animations
- one primary animation library at most, if necessary

Avoid:

- layout thrashing
- huge canvases on mobile
- multiple competing animation libraries
- constant expensive mouse handlers
- oversized WebGL unless justified
- scroll-jacking

Respect `prefers-reduced-motion`.

---

## Phase 2 self-audit

Check:

- desktop smoothness
- mobile smoothness
- reverse animation
- hover and touch parity
- text readability
- reduced-motion behavior
- GPU/CPU load
- whether animation improves composition
- whether the website still feels minimal

Remove effects that feel decorative but unnecessary.

---

# PHASE 3 — REAL CONTENT + DATA

Only after structure and motion are approved, integrate final company content.

The user will supply:

- software-house services
- company context
- positioning
- technology stack
- projects/work
- brand statements
- final CTA information

Do not invent major facts.

Never invent:

- client names
- project numbers
- user counts
- revenue
- awards
- partnerships
- years of experience
- review scores
- testimonials

---

## Content writing rules

Copy should be:

- concise
- specific
- human
- confident
- technically credible
- easy to scan

Avoid phrases such as:

- “Transforming ideas into reality”
- “Innovative solutions for tomorrow”
- “Cutting-edge solutions”
- “Empowering businesses”
- “Revolutionize your digital journey”
- “Unlock your potential”
- “We build the future”
- “Where innovation meets excellence”

Do not write marketing filler just to fill visual space.

---

## Services

When the service list is supplied:

1. understand each service
2. group related services
3. decide hierarchy
4. write concise descriptions
5. map the most important services to large interactive moments
6. keep secondary services lighter
7. do not dump everything into equal cards

The page should explain what the studio can actually build.

---

# PHASE 4 — FINAL POLISH + QA

Perform a full-site quality pass.

## Visual QA

Inspect:

- headline wrapping
- display scale
- paragraph width
- alignment
- section rhythm
- grid
- spacing
- radius
- borders
- dark/light transitions
- orange intensity
- hero fade
- card depth
- button states
- footer
- final CTA

## Reference QA

Ask:

### OnRamp
- Do we have the strong immersive → editorial transition?
- Is there enough clean space after the hero?
- Does typography carry the composition?

### Forma
- Does navigation feel compact and premium?
- Do large panels have refined depth?
- Are oversized typography/background layers used intelligently?

### Glass reference
- Do atmospheric streaks/gradients provide depth?
- Have we translated the blue into our own warm signal system?

If the answer is no, refine.

---

## Responsive QA

Test every major section around:

- 1440
- 1280
- 1024
- 768
- 430
- 390
- 375

Also test in-between widths.

Look for:

- overflow
- bad headline breaks
- awkward dead space
- compressed nav
- banners that become too tall
- hidden CTA
- touch issues
- broken sticky behavior
- animation problems

---

## Technical QA

Check:

- semantic HTML
- keyboard navigation
- focus states
- `prefers-reduced-motion`
- image alt text
- no console errors
- no unused large dependencies
- no duplicate components
- no random inline magic values
- reasonable loading performance
- no CLS from media
- responsive image sizing
- working anchor navigation
- correct mobile menu

---

# 7. COMPONENT DESIGN RULES

Before creating any component, ask:

- Does it use the token system from `design.md`?
- Is it necessary?
- Is it visually different from the section before it?
- Does it have a mobile behavior?
- Is it relying on a generic card pattern?
- Does it accidentally introduce AI-looking blue/neon styling?

If yes to the last two, rethink it.

---

# 8. VISUAL ASSETS

Do not use generic stock visuals.

For now:

- build image/visual containers correctly
- use custom CSS/SVG/Canvas visual systems if they fit
- keep imagery purposeful
- prepare components for future custom/generated assets

Do not generate random imagery merely to fill blank space.

If user supplies an image later, integrate it without changing the established art direction.

---

# 9. UNIQUE INTERACTION OPTIONS

Choose only the options that fit.

Potential interactions:

- service selector controlling a visual panel
- magnetic CTA
- cursor-reactive glow on desktop
- scroll-linked hero fade
- reversible line-masked typography
- horizontal work rail
- sticky process sequence
- background atmosphere changing per section
- technical labels responding to hover
- large rounded showcase panels
- masked project reveal
- minimal stack ticker
- animated border trace on selected focus state

Do not combine all of them.

Use restraint.

---

# 10. NO BLUE ENFORCEMENT

During implementation, search the codebase for:

- blue color classes
- cyan
- teal
- indigo
- violet
- purple
- hex values from old blue references

Replace/remove them unless required by an actual third-party logo asset.

The website's own interface must remain:

**obsidian + warm white + signal orange**

---

# 11. FINAL QUALITY BAR

The final result should feel like:

- a serious software studio
- modern creative engineering
- minimal art direction
- custom interaction work
- deliberate responsive design
- controlled motion
- premium typography

It should **not** feel like:

- a Framer template copied without thought
- an AI-generated SaaS landing page
- a neon AI startup
- a repeated card collection
- a design exercise that only works on desktop

The first viewport must be the strongest visual moment, and the mobile version must remain genuinely polished.

---

# 12. EXECUTION RULE

Do not skip phases.

At the end of each phase, explicitly self-review the implementation against:

- `design.md`
- reference intent
- desktop quality
- mobile quality
- originality
- performance

Fix issues before progressing.

Quality > speed.
