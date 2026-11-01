---
version: "software-house-reference-v2"
name: "Obsidian Signal — One Page Software House"
description: "A minimal, premium, technology-focused one-page website system inspired by the supplied OnRamp, Forma AI, and glass-gradient references. The blue/cyan visual language from the references is intentionally translated into black, warm white, and signal orange."
colors:
  primary: "#0A0A0A"
  secondary: "#F7F4EE"
  accent: "#FF6A00"
  accent-soft: "#FFB06A"
  accent-deep: "#C94700"
  background-dark: "#050505"
  background: "#F7F4EE"
  background-pure: "#FFFFFF"
  surface-dark: "#101010"
  surface-dark-raised: "#171717"
  surface-light: "#F0ECE4"
  text-on-dark: "#F7F4EE"
  text-primary: "#111111"
  text-secondary: "#606060"
  text-muted-dark: "#A7A7A7"
  border-dark: "rgba(255,255,255,0.14)"
  border-light: "rgba(17,17,17,0.12)"
  glow: "rgba(255,106,0,0.35)"
  glow-soft: "rgba(255,176,106,0.20)"
typography:
  display-xl:
    fontFamily: "Inter"
    fontSize: "clamp(56px, 8vw, 126px)"
    fontWeight: 500
    lineHeight: "0.90"
    letterSpacing: "-0.055em"
  display-lg:
    fontFamily: "Inter"
    fontSize: "clamp(44px, 6vw, 86px)"
    fontWeight: 500
    lineHeight: "0.96"
    letterSpacing: "-0.045em"
  heading-md:
    fontFamily: "Inter"
    fontSize: "clamp(30px, 4vw, 52px)"
    fontWeight: 500
    lineHeight: "1.02"
    letterSpacing: "-0.035em"
  body-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "1.55"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6"
  label-md:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.04em"
spacing:
  base: "8px"
  gap-sm: "12px"
  gap: "16px"
  gap-lg: "24px"
  card-padding: "clamp(20px, 3vw, 36px)"
  section-padding-desktop: "clamp(96px, 10vw, 160px)"
  section-padding-mobile: "72px"
  page-gutter-desktop: "clamp(24px, 4vw, 64px)"
  page-gutter-mobile: "18px"
rounded:
  card: "24px"
  card-large: "32px"
  control: "12px"
  nav: "9999px"
  pill: "9999px"
motion:
  fast: "180ms"
  normal: "420ms"
  slow: "900ms"
  ambient: "8s-20s"
  easing: "cubic-bezier(0.22, 1, 0.36, 1)"
---

# Obsidian Signal — Design System

## 1. Direction

The website should feel like a high-end technology studio rather than a generic SaaS template.

The supplied references establish three visual ideas:

1. **OnRamp reference**
   - immersive first viewport
   - a visual field that gradually fades into a clean content section
   - bold centered identity
   - simple typography
   - generous white space after a dramatic hero
   - content that feels editorial rather than card-heavy

2. **Forma AI reference**
   - floating compact navigation
   - deep black environment
   - translucent / glass surfaces with thin borders
   - oversized background typography used as composition
   - rounded, dimensional panels
   - focused glow around important objects rather than everywhere

3. **Glass-gradient reference**
   - atmospheric vertical streaks / soft light lines
   - depth created through blur, opacity, and directional gradients
   - a smooth transition from dense color to light space

These references are for **composition, atmosphere, interaction, hierarchy, and depth**.

Do not copy their branding, text, or blue palette.

---

# 2. Strict Color Rule

## NO BLUE

Do not use:

- blue
- cyan
- teal
- electric blue
- blue-violet
- purple-blue gradients
- generic AI neon blue glows

Even if a reference contains blue, reinterpret it using this system.

## Core palette

The site uses:

- near-black
- charcoal
- warm white
- soft cream
- signal orange
- occasional lighter orange highlights

### Main color roles

**Black / charcoal**
- hero foundation
- navigation
- premium banners
- selected project panels
- footer
- contrast sections

**Warm white / cream**
- editorial content sections
- breathing space
- service explanations
- long-form copy
- accessibility and contrast

**Signal orange**
- focal accents
- active nav indication
- micro-highlights
- glow centers
- selected borders
- tiny technical details
- CTA emphasis

Orange should be controlled.

The page should not become an orange website.

Aim roughly for:
- 55–65% neutral light/dark surfaces
- 25–35% black/charcoal contrast
- 5–10% orange emphasis

---

# 3. Hero / First Viewport

The hero is the strongest visual moment.

Use the OnRamp composition idea but translate it into the new palette.

Recommended direction:

- deep black / charcoal at the top
- subtle orange atmospheric energy in the middle
- pattern / grid / arrow / technical marks used at low opacity
- vertical streaks or micro-lines inspired by the glass reference
- the entire atmosphere gradually fades into warm white or cream near the next section
- central or slightly offset headline composition
- one restrained supporting line
- one strong primary action
- optional secondary action with no visual competition

The hero should feel large and immersive without becoming noisy.

### Suggested background construction

Layer carefully:

1. black base
2. warm radial orange glow, low opacity
3. subtle vertical light streak field
4. technical micro-pattern or directional marks
5. fine noise/grain
6. soft vignette
7. gradient fade into the next light section

The fade should be smooth enough that hero → content feels like one continuous canvas.

### Avoid

- giant blue glow
- neon cyberpunk look
- random 3D blobs
- fake dashboard floating in the middle
- unnecessary glass cards in the hero
- excessive particles
- huge gradients with no texture
- cliché “AI network” graphics

---

# 4. Navigation

Use the Forma AI reference for the navigation language.

The navigation should:

- float above the page
- be compact
- use a rounded/pill silhouette
- feel translucent on dark hero
- use subtle backdrop blur
- use a 1px soft border
- remain visually light
- never dominate the hero

Desktop navigation can sit centered or slightly offset based on the logo composition.

### Desktop

Recommended structure:

`Logo / Brand` + `Work` + `Services` + `Process` + `About` + `Contact/Start Project`

Only the primary CTA should receive stronger treatment.

### Mobile

Use:

- compact logo
- one menu control
- clean full-screen or rounded-sheet menu
- large touch areas
- no tiny desktop links compressed into the header

Navigation must remain usable over both dark and light sections.

If it becomes sticky, adapt surface/contrast automatically as the page changes.

---

# 5. Typography

Typography should carry much of the premium feeling.

Use **Inter** for primary typography and **JetBrains Mono** only for technical labels, metadata, counters, section indexes, or micro-copy.

### Display style

- large
- controlled
- tight tracking
- relatively medium weight rather than heavy bold everywhere
- strong line breaking
- use contrast in scale instead of excessive font weights

Do not fill the page with 700–900 weight type.

### Editorial sections

Follow the OnRamp reference:

- large section title
- smaller supporting paragraph
- significant negative space
- strong alignment
- short copy blocks
- horizontal breathing room

---

# 6. Layout & Page Rhythm

The site is one page.

It should alternate between:

- immersive dark visual areas
- clean editorial light areas
- large interactive banner moments

Avoid the common pattern:

`heading → three identical cards → heading → three identical cards → CTA`.

Instead use composition changes.

Suggested rhythm:

1. immersive hero
2. light editorial introduction
3. service/capability strip
4. dark interactive feature banner
5. selected work / capability storytelling
6. horizontal or sticky process section
7. technology / stack band
8. trust / proof / principles
9. final dark CTA
10. footer

The exact order can change after real content is available.

---

# 7. Cards & Interactive Banners

Cards should be used selectively.

The Forma AI reference shows the preferred card language:

- black translucent surface
- soft backdrop blur
- thin neutral border
- large rounded corners
- subtle interior light
- orange or warm-white edge glow only where necessary
- layered depth without glossy chrome

### Light cards

For light sections:

- cream or warm-white surface
- subtle grey/black border
- almost no shadow
- rely on spacing and hierarchy

### Dark cards

For dark sections:

- `#101010` / `#171717`
- border: `rgba(255,255,255,0.12–0.16)`
- optional inner highlight: `rgba(255,255,255,0.04)`
- optional orange glow near interaction/focus area

### Interactive banner priority

Prefer large banners over many small cards.

Examples:

- full-width service banner
- horizontal project showcase
- sticky side-by-side case-study panel
- service selector that changes the visual on the opposite side
- large rounded technical canvas
- stack ticker inside a contained panel
- scroll-reactive process timeline

---

# 8. Background Treatments

The visual system should include backgrounds that feel custom.

## A. Obsidian Signal Field

For hero or dark banner:
- black base
- warm orange halo
- vertical light streaks
- fine noise
- sparse micro-pattern
- dark edge vignette

## B. Warm Fade

Use for dark → light transitions:
- black / charcoal
- deep warm brown-black
- orange haze at very low opacity
- cream / white

No visible hard boundary.

## C. Light Editorial Field

Use:
- `#F7F4EE`
- white
- extremely subtle gradient variation
- low-contrast technical linework only if needed

Do not turn every section into a gradient.

---

# 9. Buttons

Primary CTA:

- high contrast
- usually warm white on dark OR black on light
- orange can appear as a small highlight, hover sweep, dot, arrow, or focus ring
- rounded but not cartoonish
- use the control radius or pill shape based on placement

Secondary CTA:

- transparent
- thin border
- lower visual weight

Hover:

- small transform
- arrow shift
- subtle fill transition
- magnetic behavior only on desktop if performant

Do not use heavy orange gradients on buttons.

---

# 10. Motion Language

Motion should feel smooth and reversible.

Use:

- masked text reveals
- word/line stagger
- subtle vertical entrance
- scroll-linked banner translation
- progressive background fade
- tiny nav morph
- hover lift of 2–6px maximum
- project image/visual mask reveal
- slow atmospheric background motion
- directional streak movement
- horizontal text/ribbon movement

## Reverse motion

Whenever useful, animations should respond naturally when the user scrolls back upward.

Examples:

- hero title returns toward its initial state
- banner translation reverses
- masks close/reopen with scroll direction
- background intensity decreases/increases with scroll progress
- technical labels slide back instead of snapping

Avoid entrance-only animation everywhere.

---

# 11. Mobile Behavior

Mobile quality is equal in priority to desktop.

Do not simply scale down desktop.

### Hero on mobile

- keep visual atmosphere
- simplify pattern density
- reduce blur radius
- reduce or disable pointer effects
- maintain large but readable headline
- avoid more than 3–4 hero text lines if possible
- maintain strong CTA placement

### Banners

Desktop:
- layered
- wide
- may use two-column interaction

Mobile:
- vertical stack
- touch states
- content appears before decoration
- avoid cramped cards
- no hidden information that requires hover

### Typography

Prevent oversized desktop display type from creating awkward one-word lines.

Use `clamp()` and controlled max-widths.

---

# 12. Reference Translation Rules

When a reference uses blue:

**Do not reproduce the blue.**

Translate it:

- blue dark → black / charcoal
- bright cyan → warm orange / warm white
- blue glow → orange glow at lower opacity
- blue-to-white gradient → black/orange haze → warm white
- cyan borders → neutral white borders with tiny orange emphasis

Use references for:
- geometry
- proportion
- composition
- depth
- spacing
- transition
- motion

Not for:
- color identity
- brand identity
- copy

---

# 13. Anti-AI-Slop Guardrails

Never default to:

- neon blue
- purple gradients
- random glassmorphism
- glowing blobs behind every section
- three-card feature grids repeated everywhere
- generic “AI” iconography
- floating 3D spheres
- generic dashboard mockups
- fake metrics
- fake testimonials
- excessive pill badges
- enormous generic “WE BUILD THE FUTURE” copy
- every section centered
- every card using the same radius and shadow treatment

The design should look art-directed.

---

# 14. Responsiveness

Use responsive breakpoints as guidance, not rigid composition constraints:

- 1440+
- 1280
- 1024
- 768
- 430
- 390
- 375

Also inspect intermediate widths manually.

### Max width

Main content:
- roughly `1280–1440px` depending on section

Editorial text:
- much narrower, roughly `620–780px`

Hero title:
- controlled by viewport, not a fixed container

---

# 15. Accessibility

Minimum expectations:

- proper contrast
- keyboard-visible focus
- touch targets around 44px or greater
- semantic HTML
- reduced-motion support
- no essential information hidden behind hover
- readable mobile typography
- no scroll-jacking

---

# 16. Design Checklist

Before approving any section:

- Does it look like it belongs to this design system?
- Is any blue/cyan/purple present accidentally?
- Is orange being overused?
- Is the section relying on a generic three-card layout?
- Is the hierarchy obvious?
- Does it have enough breathing room?
- Does mobile retain the same quality?
- Does motion improve the design rather than distract from it?
- Does it resemble the supplied references in **quality and composition**, without copying their color identity?
- Does it feel custom rather than AI-generated?

If not, redesign it.
