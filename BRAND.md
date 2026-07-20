# CH24 — Brand Rules & Direction

Working brand reference for the CH24 website (HTML first, then Shopify port).
Distilled from the official Brand Book v1.0. Public-facing content only —
internal strategy, financial targets, and approval workflows are deliberately
excluded.

---

## 1. Who CH24 is

**India's first Gen Z fragrance house.** Not a perfume brand, not a grooming
brand — a fragrance house built from the ground up for how Gen Z lives,
carries, and identifies with scent.

- First product: **Take Me Out** — a 5g solid perfume stick in a
  cigarette-style flip-top box.
- Alcohol-free. Skin-nourishing. Pocket-sized. Unisex.
- **₹499 for a pack of two.**
- The format is the message: pulling the box out is part of the product.
- The stick is the start — the house grows into perfumes, body care, skin,
  and hair under one identity.

**Master brand statement (use verbatim):**
> CH24 — India's fragrance house for the generation that moves.

**Core brand lines (permanent, usable anywhere):**
- Scent is identity. Not occasion.
- Built in India. Built for now.
- Your scent. Your story.
- Carry it. Every day.
- Pocket Perfume. Pick Your Pair. *(Take Me Out line)*

---

## 2. Logo

Files: `assets/logo-black-on-white.png` · `assets/logo-white-on-black.jpg`

Italic **CH24** wordmark with a four-pointed star above the "2".

| Rule | Value |
|---|---|
| Version 1 (black on white) | all light / cream surfaces |
| Version 2 (white on black) | all dark surfaces — primary digital |
| Minimum size | 80px wide (digital) / 18mm (print) |
| Clear space | height of the "H" on all sides |

**Never:** separate the star from the wordmark · recolor (black or white
only, never a product color) · stretch, distort, add shadows/gradients/
effects · place on busy photos without a solid backing.

---

## 3. Color

### Brand anchors — permanent

| Token | Hex | Use |
|---|---|---|
| Brand Black | `#0A0A0A` | Primary canvas. Backgrounds, dark surfaces, digital default. 70–80% of all brand surfaces. |
| Pure White | `#FFFFFF` | Type on dark, Logo V2, contrast anchor. |

### Take Me Out / Pack 01 colors — product-scoped, not brand colors

| Token | Hex | Use |
|---|---|---|
| Burnt Orange | `#E96213` | Pack 01 outer box. High energy accent. |
| Sage Green | `#85AF67` | Fragrance label 01 |
| Aqua Teal | `#61D6C4` | Fragrance label 02 |
| Deep Brown | `#533C2C` | Fragrance label 03 |
| Warm Cream | `#EDE7DD` | Fragrance label 04 |

**Rules:** black + white always available; product colors optional and scoped
to that product's pages/sections only; the logo is never rendered in a
product color.

### Suggested CSS tokens

```css
:root {
  --brand-black: #0A0A0A;
  --brand-white: #FFFFFF;
  /* Pack 01 world — scope to product contexts */
  --p01-orange: #E96213;
  --p01-sage:   #85AF67;
  --p01-teal:   #61D6C4;
  --p01-brown:  #533C2C;
  --p01-cream:  #EDE7DD;
}
```

---

## 4. Typography

Two typefaces. One job each. No third typeface, ever.

| Role | Face | Rules |
|---|---|---|
| Display / headlines | **Montserrat** Bold & ExtraBold | Headlines, product names, campaign lines, big numbers. Never below 24px in display use. Tight tracking at scale (−2 to −3px). |
| Body / secondary | **Helvetica Hebrew** (fallback: Helvetica Neue → Arial) | Body copy, specs, descriptors, legal. 14–16px body. |

```css
--font-display: 'Montserrat', sans-serif;   /* 700 / 800 only */
--font-body: 'Helvetica Hebrew', 'Helvetica Neue', Arial, sans-serif;
```

**Case rules (permanent):**
- Social captions → lowercase always
- Website & packaging → sentence case (first word capitalised only)
- Technical specs / labels → ALL CAPS with letter-spacing
  (e.g. `5 GMS · 0.17OZ · ALCOHOL FREE · UNISEX · LONG LASTING`)
- Headlines → sentence case, never Title Case On Every Word

**Never:** decorative/script fonts · random mid-sentence bolding.

---

## 5. Tone of voice

- Direct. Never wordy. One idea per sentence.
- Confident, never arrogant.
- Speak as people, not as a company with a press release.
- **Golden rule: specifics beat adjectives.** Every time.
  - "5g stick" beats "compact format"
  - "₹499 for two" beats "affordable luxury"
  - "flip it open, pull it out, go" beats "convenient for daily use"

**Banned phrases (all copy, forever):** "luxury fragrance experience",
"exclusive collection", "premium quality", "innovative formula", "elevate
your senses", "crafted with care", "for the discerning individual" — any
phrase a legacy brand would use.

---

## 6. Iconography

- Line-based, single-weight strokes. No filled sets, no gradients, no 3D,
  no clip-art.
- Black on light / white on dark — same rule as the logo. Never a product
  color.
- One icon library across the whole site — never mix sets.
- Never larger than the type they support; always paired with a text label
  where meaning could be ambiguous (specs, ingredients).
- Official icon set not yet designed — use one consistent minimal line
  library (e.g. Lucide) as an interim, styled per rules above.

---

## 7. Site direction (derived)

- Dark-first: Brand Black canvas, white type, Logo V2 — matches "primary
  digital application" rule.
- Pack 01 sections may use the orange/sage/teal/brown/cream world; keep
  those colors out of global chrome (nav, footer, buttons outside product
  context).
- Big Montserrat display headlines vs. small all-caps spec lines = the
  hierarchy engine.
- Flat, confident, uncluttered. No shadows/gradients/effects — mirrors logo
  and icon rules.
- Copy short and specific everywhere; product page leads with format, price,
  and the pull-it-out moment.
