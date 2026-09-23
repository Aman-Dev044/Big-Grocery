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

| Route | What it does |
|---|---|
| `/` | Redirects to `/products` |
| `/products` | Catalogue listing — stat cards, search, filters, pagination |
| `/products/[id]` | Detail page — image gallery, categories, pricing, slabs |

## Sidebar behaviour

Every menu entry from the reference design is rendered, but **only "Products"
is a real link**. The rest are inert `<span>`s (`cursor-not-allowed`,
`aria-disabled`), as are the Export / Bulk Update / Add Product buttons, the
bulk-action row, the brand filter and the grid-view toggle.

What *is* wired up:

- **Import** — opens the upload modal (Excel + ZIP), posts to
  `POST /api/upload/bulk`, then shows the import summary and reloads the list
- Search box (debounced), Category filter, Status filter
- Pagination + page size
- Row checkboxes
- Clicking a row or its name opens the detail page

## Images

Product images are served by the backend from `/static/<batchId>/<srNo>/<file>`
and rendered with plain `<img>` tags, so no `next.config.ts` remote-pattern
setup is needed.
