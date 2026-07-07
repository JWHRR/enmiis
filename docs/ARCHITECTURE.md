# ENMIIS Atelier — System Architecture

The "Apple of graduation apparel": a real-time 3D configurator with live embroidery,
formula-driven pricing, and production-grade estimates.

**What runs today (this repo)** — landing page, full 5-step configurator, procedural
measurement-driven 3D garments, live canvas-embroidery, pricing/estimation engine,
AI design & color assistants, quotation with QR + print-to-PDF, admin coefficient console,
undo/redo/autosave, dark/light themes.

**What this document adds** — the production backend design: database schema, API
surface, payments, accounts, and the scale-out plan.

---

## 1. UX architecture

```
Landing (/)                     Configurator (/configure)            Quotation (/summary)
┌─────────────────┐             ┌──────────────┬─────────────┐       ┌──────────────────┐
│ 3D hero robe    │  Start   →  │ Step wizard  │  Live 3D    │  →    │ Paper-style sheet │
│ parallax+spark  │  Designing  │ 1 Silhouette │  preview    │       │ measurements      │
│ product cards   │             │ 2 Measure    │  orbit/zoom │       │ embroidery proof  │
│ craft story     │             │ 3 Fabric     │  wind sim   │       │ price breakdown   │
│ closing CTA     │             │ 4 Embroidery │  live       │       │ QR + order ref    │
└─────────────────┘             │ 5 Review     │  embroidery │       │ print → PDF       │
                                └──────┬───────┴─────────────┘       └──────────────────┘
                                       │ live price bar (always visible)
                                Admin console (/admin) — pricing coefficients, live sample quote
```

Principles: split-screen configurator (control left, garment right), one decision per
screen region, price always visible, every change reflected in 3D within one frame,
mobile = canvas on top + scrollable sheet below.

## 2. Design system

Tokens live in `src/app/globals.css` as CSS custom properties mapped into Tailwind v4
via `@theme inline`:

- **Surfaces** `--bg #07070a`, `--bg-elevated`, glass surfaces (4–7% white) with 24px backdrop blur
- **Ink** three steps: `--ink` (ivory #f4f1ea), `--ink-secondary`, `--ink-muted`
- **Brand** gold triad `--gold #c9a961`, `--gold-bright`, `--gold-deep`; used only for
  emphasis, price, and active states — never as fill noise
- **Type** Geist (UI), Fraunces (display/serif), Cinzel (roman capitals), Great Vibes
  (script), Amiri (Arabic) — the last four load with stable family names because the
  embroidery canvas draws with them directly
- **Motion** single easing `cubic-bezier(0.22,1,0.36,1)`, 300–900ms, layout-stable;
  micro-interactions on every interactive element (scale, shimmer, tilt)
- Light mode ("gallery white") swaps the same tokens under `[data-theme="light"]`

Component kit (`src/components/ui/Kit.tsx`): GlassCard, SectionLabel, Segmented,
LuxSlider (with validation + tooltip), Swatch, LuxToggle, AnimatedNumber (spring
price ticker), Tilt (pointer-tracking 3D card), ThemeToggle.

## 3. 3D architecture

`src/components/three/`

- **Garment.tsx** — everything is *procedural*; there are no GLTF assets to get stale.
  - Robe/Cape: `LatheGeometry` whose profile curve is computed from the customer's
    measurements (shoulder, chest, bottom sweep, height). Change a slider → new pattern.
  - Sleeves: flared open cylinders sized by sleeve length/opening.
  - Stoles: `ShapeGeometry` panels (pointed = American, square = European) + neck torus.
  - Sash: custom ribbon `BufferGeometry` swept around an implicit torso with
    Frenet-style frames; embroidery UV-maps *along* the band.
  - Fabric: `MeshPhysicalMaterial` with per-fabric roughness/sheen (velvet = full sheen),
    plus a vertex-shader wind injected via `onBeforeCompile` (hem-weighted sine sway).
  - Embroidery: `CanvasTexture` decals — cylinder-segment meshes that hug the garment
    (chest) or overlay panels/band, with polygon offset and thread-metalness.
- **Stage.tsx** — shared cinematic environment: three-point lighting, drei
  `<Environment>` built from `<Lightformer>`s (no network HDRI), `ContactShadows`,
  `Sparkles` (hero), `Float` + pointer-parallax rig (hero), damped `OrbitControls`
  (configurator). Canvas is `dynamic(..., { ssr: false })`.

Upgrade path: swap lathe bodies for simulated cloth (three-mesh-bvh + XPBD or
`@react-three/cannon` softbody), bake HDRI studio, add embroidery normal maps generated
from the same canvas (Sobel height→normal), DracoGLTF export for AR Quick Look.

## 4. Embroidery engine

`src/lib/embroidery.ts` renders the customer's text/logo to an offscreen canvas:

- satin stitch: striped thread pattern fill + under-shadow + highlight pass
- outline: dashed running-stitch stroke
- raised (3D): deeper under-stitch and highlight offsets
- metallic threads get an extra specular gradient pass
- Arabic via `ctx.direction = "rtl"` + Amiri; browser shaping handles ligatures
- band mode for sashes (single line, joined with `•`)

The same renderer produces the 3D texture *and* the printed embroidery proof on the
quotation — one source of truth for placement.

Stitch estimation (`pricing.ts`): `chars × 220 st/cm × letter-height × style-multiplier`
+ `logo area × 180 st/cm²`, feeding both price and machine-time.

## 5. Pricing engine

`src/lib/pricing.ts` — pure functions, coefficient-driven:

```
Price = Base + Fabric(m × price/m) + PremiumDye + Construction
      + Embroidery + Thread + LogoDigitization + Labor + Accessories
      → × ComplexityCoefficient (embroidery × premium construction)
      → × UrgencyMultiplier
      → + Margin% → + VAT%

Embroidery = (stitches × price/1000) + (area × densityCoefficient)
           + setupFee + threadSurcharge (+ metallic)
```

Estimates: fabric consumption from pattern areas (trapezoids per garment) / roll width
× waste%, thread meters, machine minutes (stitches / spm), atelier hours, shipping
weight, delivery days (base days per product compressed by urgency, + transit).

Every coefficient is editable in `/admin` (localStorage today; DB table in production)
— the engine deep-merges overrides over `DEFAULT_COEFFICIENTS`.

## 6. AI architecture

`src/lib/design-ai.ts` — deterministic design-rule engine, deliberately shaped like an
LLM tool contract so a hosted model can replace it 1:1:

- **Layout composer** (`suggestLayout`): typography scale from line length, font pairing
  (script for name-only, roman capitals for institutions, Amiri auto-detected from
  Arabic codepoints), placement by product zone, stitch style by fabric (raised on
  velvet), logo scaled to the text block. Returns `{patch, rationale[]}` — the patch is
  applied to the store, the rationale is shown to the customer.
- **Color intelligence** (`suggestPalettes`): curated university palettes ranked by
  WCAG contrast ratio between dye and thread.

Production: move behind `POST /api/ai/compose` so prompts/models can evolve server-side;
the endpoint receives the design state and returns the same `{patch, rationale}` shape.
Logo vectorization: worker queue (potrace/vtracer) producing SVG + stitch-ready DST.

## 7. Data model (production — Prisma/PostgreSQL via Supabase)

```prisma
model User          { id uid  email  name  role Role  designs Design[]  orders Order[] }
model Design        { id  userId?  shareSlug @unique  product  configJson Json
                      version Int  parentId?          // version history / duplicate
                      previewUrl?  createdAt updatedAt }
model Product       { id slug  name  basePrice Decimal  measurementSpec Json  active }
model Fabric        { id  name  pricePerMeter  weightGsm  materialParams Json  active }
model ColorwayDye   { id  name  hex  premium }
model Thread        { id  name  hex  metallic  surcharge }
model University    { id  name  country  colors Json  logoAssetId? }
model Asset         { id  kind (logo|preview|vector|dst)  url  originalName  userId? }
model Coefficients  { id  scope (global|market)  json Json  updatedBy  updatedAt } // audit-kept
model Quote         { id ref @unique  designId  linesJson  subtotal vat total
                      estimatesJson  validUntil  pdfUrl? }
model Order         { id ref @unique  quoteId  userId  status OrderStatus
                      paymentIntentId?  shippingJson  timeline OrderEvent[] }
model OrderEvent    { id orderId  status  note  at }       // production queue feed
model Coupon        { id code  pct?  amount?  validUntil  maxUses }
enum OrderStatus    { DRAFT QUOTED PAID CUTTING EMBROIDERY QA SHIPPED DELIVERED }
```

## 8. API surface (Next.js route handlers / server actions)

```
POST /api/designs            create/fork design          GET /api/designs/:id
PATCH /api/designs/:id       autosave (debounced)        GET /d/:shareSlug   public share
POST /api/quotes             price server-side (authoritative re-compute) → PDF (react-pdf) → storage
POST /api/orders             quote → Stripe PaymentIntent → webhook /api/stripe/webhook
POST /api/ai/compose         layout/color suggestions
POST /api/assets/vectorize   logo upload → queue → SVG/DST
GET  /api/admin/coefficients PATCH … (role=ADMIN, audited)
```

Rules: the client price is advisory; quotes/orders re-compute on the server with the
coefficient snapshot stored on the quote. Signed URLs for uploads (Cloudinary/Supabase
storage). Edge runtime for reads, node runtime for PDF/Stripe.

## 9. Folder structure

```
src/
  app/            (landing) configure/ summary/ admin/   [+ api/ in production]
  components/
    three/        Garment.tsx  Stage.tsx
    configurator/ Shell + StepProduct/Measurements/Fabric/Embroidery/Review + PriceBar
    landing/      Hero  ProductGrid  Craft
    ui/           Kit.tsx  Nav.tsx
  lib/            types  catalog  pricing  embroidery  design-ai  store
docs/             ARCHITECTURE.md
```

## 10. Order flow

configure → review → quotation (QR ref, 14-day validity) → [production: account/save,
Stripe checkout, order status timeline CUTTING→EMBROIDERY→QA→SHIPPED with email/WhatsApp
hooks, reorder & duplicate from order history].

## 11. Performance & quality

- 3D code split behind `dynamic(ssr:false)`; landing content is server-rendered
- `dpr=[1,2]`, single canvas per page, geometry/material/texture disposal on change
- Canvas textures re-render only when the embroidery fingerprint changes
- Debounced autosave (600ms); undo stack capped at 60
- AA+: keyboard shortcuts (⌘Z/⌘Y), focus-visible inputs, reduced clutter, print styles
- Next: image AVIF, PWA manifest + offline shell, i18n (en/fr/ar with RTL layout),
  Lighthouse budget in CI

## 12. Roadmap to production

1. Supabase (auth + Postgres + storage) with the schema above; RLS per user
2. Server-authoritative quoting + react-pdf quotation, emailed
3. Stripe payments + order timeline dashboard (admin production queue)
4. Logo vectorization worker (vtracer) + DST stitch-file export for the machines
5. Cloth simulation upgrade + AR try-on (WebXR / Quick Look)
6. Live collaboration (Liveblocks/Yjs on the design store) and public share links
```
