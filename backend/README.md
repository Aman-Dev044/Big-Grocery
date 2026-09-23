# Grocery Bulk Upload — Backend

Node.js + Express + MongoDB. Upload one Excel file and one ZIP of images; the
server unzips, parses, and joins them on **SR. NO. === zip folder number**.

## Mapping rule

```
Excel row  SR. NO. = 1  ──┐
                          ├──►  Product #1  (all images from that folder)
ZIP folder images/1/   ───┘
```

The folder number is read from the nearest all-digit path segment, so
`images/12/a.jpg`, `12/a.jpg` and `foo/images/12/a.jpg` all resolve to 12.
Files are sorted with a natural (numeric-aware) sort; the **first one becomes
the thumbnail** (`isPrimary: true`).

## Setup

```bash
npm install
cp .env.example .env    # fill in MONGODB_URI
npm run dev             # or: npm start
```

### `.env`

| Key | Purpose |
|---|---|
| `PORT` | HTTP port (default 1004) |
| `MONGODB_URI` | Atlas connection string |
| `DB_NAME` | Database name (`big_bannia_grocery`) |
| `STORAGE_DIR` | Where extracted images live (served at `/static`) |
| `TMP_DIR` | Scratch space for incoming uploads; cleaned after each run |
| `PUBLIC_BASE_URL` | Prefix used to build image URLs |
| `MAX_UPLOAD_MB` | Per-file upload cap |
| `CORS_ORIGIN` | Frontend origin(s), comma separated, or `*` |
| `DNS_SERVERS` | Optional. Set only if `mongodb+srv://` fails with `querySrv ECONNREFUSED` — Node's resolver is then pointed at a dead local stub. |
| `JWT_SECRET` | Signing key for admin tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `12h`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | The admin created on first boot (`npm run seed` re-runs it; existing accounts are left alone) |

## API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/health` | Liveness |
| `POST` | `/api/auth/login` | `{ email, password }` -> JWT |
| `GET` | `/api/auth/me` | Bearer — the signed-in admin |
| `POST` | `/api/upload/bulk` | Bearer — `multipart/form-data`: `excel`, `zip`, `replaceExisting` (default `true`) |
| `GET` | `/api/upload/batches` | Last 20 import runs + their warnings |
| `GET` | `/api/products` | `page, limit, search, category, brand, status, sortBy, order` |
| `GET` | `/api/products/stats` | Counts + distinct categories/brands |
| `GET` | `/api/products/:id` | Accepts Mongo `_id`, `sku`, or `srNo` |
| `DELETE` | `/api/products` | Bearer — body `{ ids: [...] }`, deletes those products and their images |
| `DELETE` | `/api/products/all` | Bearer — wipes every product, image and batch |
| `GET` | `/static/<batchId>/<srNo>/<file>` | Extracted product image |

### Example

```bash
curl -X POST http://localhost:1004/api/upload/bulk \
  -F "excel=@products.xlsx" \
  -F "zip=@images.zip"
```

```json
{
  "success": true,
  "message": "40 products imported, 190 images mapped",
  "data": {
    "totalRows": 40,
    "productsCreated": 40,
    "imagesLinked": 190,
    "unmatchedFolders": [],
    "rowsWithoutImages": [],
    "warnings": []
  }
}
```

## Excel columns

Headers are matched case-insensitively with punctuation stripped, so
`SUB CATEORY` (the typo in the sample sheet) still maps correctly.

`SR. NO.`, `PRODUCT SKU`, `PRODUCT BARCODE`, `PRODUCT NAME`, `CATEGORY`,
`SUB CATEORY`, `SUB SUB CATEGORY`, `BRAND`, `MRP`, `PRICE`, `WEIGHT`,
`Quantity 1-4`, `Price 1-4`, `Margin 1-4`, `Delivery Charge 1`, `Stock`,
`Description`.

- **SKU** blank → generated as `<3 brand letters><3-digit SR. NO.>`, e.g. `AAS001`.
- **Barcode** blank → generated as a valid EAN-13 with the GS1 India prefix `890`.
- **Margin** is derived: `(MRP − PRICE) / MRP × 100`.
- **Quantity/Price/Margin 1-4** are stored as bulk pricing slabs; empty tiers are dropped.
- **Status** is derived from stock: `0` → out of stock, `≤10` → low stock, else in stock.
