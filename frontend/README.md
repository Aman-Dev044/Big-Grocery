# Grocery Bulk Upload — Frontend

Next.js 16 (App Router) + React 19 + Tailwind v4.

## Setup

```bash
npm install
cp .env.example .env.local     # point it at the backend
npm run dev                    # http://localhost:4001
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:1004/api
```

The backend must be running first, and its `CORS_ORIGIN` must include
`http://localhost:4001`.

## Pages

| Route | Auth | What it does |
|---|---|---|
| `/login` | public | Full-page admin login (split brand panel + form, show/hide password) |
| `/` | admin | Redirects to `/dashboard` |
| `/dashboard` | admin | KPI tiles, stock-health bar, sub-category and brand rankings, restock list, last-import card |
| `/products` | admin | Catalogue listing — stat cards, search, filters, pagination |
| `/products/[id]` | admin | Detail page — image gallery, categories, pricing, slabs |
| `/upload` | admin | Drag-and-drop bulk import with a 3-step progress indicator |

Everything except `/login` is gated in `components/Shell.tsx`: a signed-out
visitor is redirected to `/login`, and the login route renders without the
sidebar or top bar.

## Sidebar behaviour

The three live destinations sit at the top in working order — **Dashboard**,
**Products**, **Upload** — with **Logout** pinned to the bottom of the rail. The
remaining entries from the reference design are rendered under a "More" heading
as inert `<span>`s (`cursor-not-allowed`, `aria-disabled`), as are the Export /
Bulk Update / Add Product buttons, the bulk-action row, the brand filter and the
grid-view toggle.

## Charts

Dashboard charts follow the `dataviz` method:

- The categorical pair `#2a78d6` / `#eb6834` was validated against the white card
  surface — all six checks pass (CVD ΔE 24.7, normal-vision ΔE 33.6, contrast ≥ 3:1).
- Ranked magnitude uses a single sequential hue with the value direct-labelled at
  the bar tip, so no legend is needed.
- Stock health uses the reserved status palette. `warning` sits below 3:1 on a
  light surface by design, so every status mark ships with a text label beside it
  — colour never carries meaning alone.
- Tokens live in `components/charts/viz.ts`.

## Images

Product images are served by the backend from `/static/<batchId>/<srNo>/<file>`
and rendered with plain `<img>` tags, so no `next.config.ts` remote-pattern
setup is needed.
