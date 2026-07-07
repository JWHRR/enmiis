# ENMIIS Atelier

A premium real-time 3D configurator for graduation apparel — robes, capes, American
and European stoles, and Miss sashes. Measurements reshape the garment live, embroidery
is stitched onto the fabric as you type, and a formula-driven pricing engine estimates
cost, fabric consumption, machine time and delivery on every change.

## Run it

```bash
npm install
npm run dev
```

- `/` — cinematic landing page (3D hero, parallax, product cards)
- `/configure` — the 5-step configurator with live 3D preview
- `/summary` — quotation sheet with QR code, print → PDF
- `/admin` — Atelier Console: every pricing coefficient editable live

## Highlights

- **Procedural 3D** (React Three Fiber): garments are rebuilt from the customer's
  measurements — no static assets; PBR fabric with sheen + vertex-shader wind
- **Live embroidery**: canvas-rendered thread simulation (satin / outline / 3D raised,
  metallic shimmer, Arabic RTL) applied as a texture in 3D and printed on the quote
- **Pricing engine**: `Base + Fabric + Embroidery(stitches, density, setup) + Thread +
  Labor + Complexity + Rush + Margin + VAT`, all coefficients editable in `/admin`
- **Design intelligence**: one-tap layout composition and contrast-ranked university
  color palettes
- **UX**: undo/redo (⌘Z/⌘Y), debounced autosave, dark/light themes, keyboard + touch

Full production architecture (database schema, API design, payments, roadmap):
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
