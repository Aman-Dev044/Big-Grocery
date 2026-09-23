# Big Bannia Di Hatti — Grocery Bulk Upload

Upload one **Excel sheet** and one **ZIP of product images**; the backend
unzips, parses and joins them automatically, then the frontend shows the
catalogue and a detail page per product.

```
Excel row  SR. NO. = 1  ──┐
                          ├──►  Product #1  (every image in that folder)
ZIP folder images/1/   ───┘
```

## Layout

```
backend/     Node.js + Express + MongoDB  (port 5000)
frontend/    Next.js 16 + React 19 + Tailwind v4  (port 3000)
```

## Running it

Two terminals.

**1. Backend**

```bash
cd backend
npm install
npm run dev
```

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Then open <http://localhost:4001> and click **Import** on the Products page.

## Verified run

With the sample `Untitled spreadsheet 1.xlsx` (40 rows) and `images.zip`
(40 folders, 190 images):

```json
{
  "message": "40 products imported, 190 images mapped",
  "totalRows": 40,
  "productsCreated": 40,
  "imagesLinked": 190,
  "zipFolders": 40,
  "unmatchedFolders": [],
  "rowsWithoutImages": [],
  "warnings": []
}
```

## What is filled in automatically

| Field | Rule |
|---|---|
| SKU | `<3 brand letters><3-digit SR. NO.>` when the column is blank, e.g. `AAS001` |
| Barcode | Valid EAN-13 with the GS1 India prefix `890`, when blank |
| Margin | `(MRP − PRICE) / MRP × 100` |
| Status | stock `0` → out of stock, `≤ 10` → low stock, else in stock |
| Thumbnail | First image in the folder after a natural (numeric-aware) filename sort |

## Notes

- `backend/.env` holds the Mongo credentials and is git-ignored;
  `backend/.env.example` is the template.
- If `mongodb+srv://` fails with `querySrv ECONNREFUSED`, Node's resolver is
  pointing at a dead local DNS stub — set `DNS_SERVERS=8.8.8.8,1.1.1.1` in
  `backend/.env`.
- Extracted images live in `backend/storage/<batchId>/<srNo>/` and are served
  at `/static/...`. Re-importing with "Replace the existing catalogue" ticked
  deletes the previous batch's rows and files.

Per-side detail: [`backend/README.md`](backend/README.md) ·
[`frontend/README.md`](frontend/README.md)
