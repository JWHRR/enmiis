# ENMIIS

Premium graduation robes and capes — a shop-first ecommerce experience with an
optional real-time 3D atelier for custom measurements and live-embroidered
personalization.

## Run it

```bash
npm install
npm run dev
```

- `/` — cinematic landing page (3D hero robe, parallax, collection cards)
- `/shop` — the marketplace: fixed prices, 5 sizes, color variants, cart & order flow
- `/configure` — the 3D Atelier: custom measurements + live embroidery (secondary flow)
- `/summary` — quotation sheet with QR code, print → PDF
- `/admin` — Console: every pricing coefficient editable live

## Highlights

- **Shop-first**: ready-to-wear robes (189 TND) and capes (149 TND), S–XXL size
  presets, premium dyes, persistent cart, 48h dispatch messaging
- **Procedural 3D** (React Three Fiber): garments are rebuilt from measurements —
  pleated lathe bodies, bell sleeves, mannequin bust, mortarboard with gold cord & tassel
- **Live embroidery**: canvas-rendered thread simulation (satin / outline / 3D raised,
  metallic shimmer, Arabic RTL) applied as a 3D texture and printed on the quote
- **Pricing engine**: `Base + Fabric + Embroidery(stitches, density, setup) + Thread +
  Labor + Complexity + Rush + Margin + VAT` — all coefficients editable in `/admin`
- **UX**: undo/redo (⌘Z/⌘Y), autosave, dark/light themes, keyboard + touch

Full production architecture (database schema, API design, payments, roadmap):
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
