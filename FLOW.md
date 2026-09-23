# How It Works — End-to-End Flow

A walkthrough of what happens between "user picks two files" and "products appear
on screen with their images". Written so you can hand it to someone else and they
can follow along in the code.

---

## 1. The problem this solves

A shop has a product catalogue in an **Excel sheet** (40 rows) and all the product
photos in a **ZIP file** (40 folders). Nothing inside the ZIP says which photo
belongs to which product — the only link is that the folder is *named* after the
row number.

```
Excel row  SR. NO. = 1  ──┐
                          ├──►  Product #1  and its 5 photos
ZIP folder  images/1/  ───┘
```

Doing this by hand for 40 products (190 images) is slow and error-prone. This
system does it in about 1.2 seconds.

---

## 2. Architecture

```
┌──────────────────────┐        ┌──────────────────────────┐        ┌────────────┐
│   Next.js frontend   │  HTTP  │     Express backend      │        │  MongoDB   │
│   localhost:4001     │ ─────► │     localhost:1004       │ ─────► │   Atlas    │
│                      │        │                          │        │            │
│  - Login modal       │        │  multer  → receive files │        │ products   │
│  - Upload page       │        │  exceljs → read sheet    │        │ uploadbat- │
│  - Products list     │        │  adm-zip → unzip images  │        │   ches     │
│  - Product detail    │ ◄───── │  mongoose→ save          │        │ admins     │
└──────────────────────┘        └───────────┬──────────────┘        └────────────┘
                                            │
                                            ▼
                                   backend/storage/
                                   (image files on disk,
                                    served at /static)
```

**Key decision:** images are **not** stored in MongoDB. They are written to disk
and only their URLs go into the database. Storing binaries in MongoDB would bloat
the documents and slow every query down.

---

## 3. The two inputs

### The Excel sheet

One worksheet. Row 1 is the header, rows 2+ are products.

| SR. NO. | PRODUCT SKU | PRODUCT NAME | CATEGORY | ... | MRP | PRICE | WEIGHT | Stock |
|---|---|---|---|---|---|---|---|---|
| 1 | *(blank)* | AASHIRVAAD ATTA | GROCERY | ... | 489 | 445 | 10 KG | 10 |
| 2 | *(blank)* | Aashirvaad Multigrain Atta | GROCERY | ... | 382 | 299 | 5KG | 10 |

26 columns in total. Several are blank in practice (SKU, barcode, description,
the Quantity/Price/Margin tiers) — the system fills in what it can.

### The images ZIP

```
images.zip
└── images/
    ├── 1/
    │   ├── imgi_1_44d1f295.jpg      ← becomes the thumbnail
    │   ├── imgi_1_addbb321.jpg
    │   ├── imgi_1_cde0b4b5.jpg
    │   ├── imgi_1_dbd2d3e5.jpg
    │   └── imgi_25_a1d70bff.png
    ├── 2/  (4 files)
    ├── 3/  (4 files)
    └── ... up to 40/
```

231 entries total = 41 directory entries + **190 image files**.

---

## 4. The libraries, and why each one

| Library | Job | Why this one |
|---|---|---|
| **multer** | Catches the `multipart/form-data` upload and writes both files to `backend/tmp/` | Streams to disk instead of buffering a 200 MB ZIP in RAM |
| **exceljs** | Parses the `.xlsx` | Actively maintained; handles rich text, formulas and dates properly |
| **adm-zip** | Unzips the archive in memory and writes images out | Simple synchronous API; no temp-file juggling |
| **mongoose** | Defines the schema and saves to MongoDB | Schema hooks let us derive fields automatically |
| **jsonwebtoken** | Signs and verifies the admin login token | Standard, stateless — no session store needed |

Everything else (the SR. NO. ↔ folder matching, SKU generation, EAN-13 barcodes,
password hashing) is plain Node with no dependency.

---

## 5. The flow, step by step

### Step 0 — Admin logs in

`POST /api/auth/login` with `{ email, password }`.

1. `src/services/authService.js` looks the admin up by email.
2. `src/utils/password.js` re-derives the scrypt hash from the submitted password
   and compares it with `crypto.timingSafeEqual` — a constant-time compare, so an
   attacker cannot guess the password one byte at a time by measuring response speed.
3. On success a JWT is signed and returned. The browser keeps it in `localStorage`.
4. Every later upload request sends `Authorization: Bearer <token>`.

The password is never stored in plain text. What is in the database looks like:

```
scrypt:9f3c1a...(salt):4b8e72...(derived key)
```

> **Why the same error message for "no such user" and "wrong password"?**
> If they differed, anyone could use the login form to discover which email
> addresses exist. `src/services/authService.js` throws one shared
> `Invalid email or password` for both.

### Step 1 — Files arrive

`src/middleware/upload.js`

Multer accepts exactly two fields — `excel` and `zip` — checks their extensions,
caps each at `MAX_UPLOAD_MB`, and writes them to `backend/tmp/` under a random
name like `1758625412-a3f9c2.xlsx`.

The random name matters: two admins uploading `products.xlsx` at the same moment
must not overwrite each other.

### Step 2 — Read the Excel

`src/services/excelService.js` → `parseExcel()` (line 73)

**a) Normalise the headers** (line 6). Every header is uppercased and stripped of
anything that is not a letter or digit:

```
"SR. NO."        → "SRNO"
"PRODUCT NAME "  → "PRODUCTNAME"
"SUB CATEORY"    → "SUBCATEORY"     ← the typo in the real sheet
```

Those normalised keys are looked up in `HEADER_MAP` (line 13), which contains the
typo as well as the correct spelling. This is why the sheet works unchanged —
nobody has to fix the header first.

**b) Read each row.** `cellText()` (line 50) flattens whatever ExcelJS hands back
— a plain string, a number, rich text, a hyperlink object, or a formula result —
into a single trimmed string.

**c) Skip junk rows.** A row with no SR. NO. or no product name is a spacer and is
ignored.

**d) Build the slabs.** The `Quantity 1-4` / `Price 1-4` / `Margin 1-4` columns
become an array of bulk-pricing tiers. Tiers where all three are empty are dropped,
so an unused tier does not become a row of nulls.

Output: an array of 40 plain objects.

```js
{ excelRow: 2, srNo: 1, name: 'AASHIRVAAD ATTA', category: 'GROCERY',
  mrp: 489, price: 445, weight: '10 KG', stock: 10, slabs: [] }
```

### Step 3 — Unzip the images

`src/services/zipService.js` → `extractImagesByFolder()` (line 29)

For every entry in the archive:

1. **Skip** directories, dotfiles, and `__MACOSX` junk.
2. **Skip** anything that is not an image extension.
3. **Work out which folder it belongs to** — `folderNumberFromEntry()` (line 13):

   ```js
   "images/12/photo.jpg".split(/[\\/]+/)   →  ["images", "12", "photo.jpg"]
   ```

   Then walk **backwards** from the filename and take the first segment that is
   all digits. Walking backwards (not forwards) is what makes all of these work:

   | Zip path | Result |
   |---|---|
   | `images/12/a.jpg` | 12 |
   | `12/a.jpg` | 12 |
   | `myfolder/images/12/a.jpg` | 12 |
   | `2024/images/12/a.jpg` | 12 — not 2024 |

4. **Write the file** to `backend/storage/<batchId>/12/`, with the filename
   sanitised (`sanitizeName()` in `src/utils/fsx.js`) so a malicious archive
   cannot contain `../../etc/passwd` and escape the folder. This attack is called
   *zip slip*, and stripping the path is the fix.
5. **Record it** in a Map.

Finally each folder's list is sorted with `Intl.Collator({ numeric: true })` — a
natural sort, so `img2.jpg` comes before `img10.jpg` rather than after it.

Output:

```js
Map {
  1  => [ {filename, path, size}, ... 5 files ],
  2  => [ ... 4 files ],
  ...
  40 => [ ... 4 files ]
}
```

### Step 4 — Join them

`src/services/bulkUploadService.js` → `processBulkUpload()` (line 21)

This is the heart of the whole system, and it is one line (line 52):

```js
const docs = rows.map((row) => {
  const files = byFolder.get(row.srNo) || [];   // ← Excel row meets its images
  ...
});
```

`byFolder` is a `Map`, so each lookup is O(1). 40 rows, 40 lookups, done.

`|| []` is deliberate: a product whose folder is missing still gets created, just
with no images. Its SR. NO. is collected into `rowsWithoutImages` and surfaced as
a warning rather than failing the whole import.

For each row it then builds the image list:

```js
const images = files.map((file, index) => ({
  filename: file.filename,
  url: buildImageUrl(batch._id, row.srNo, file.filename),
  isPrimary: index === 0,        // first file after natural sort = thumbnail
  order: index,
}));
```

### Step 5 — Fill in the blanks

Still inside the same `map`, blank Excel columns are filled in.

**SKU** — `src/utils/codes.js`, `generateSku()` (line 7)

```
brand "AASHIRVAAD" + SR. NO. 1  →  "AAS001"
brand "FORTUNE"    + SR. NO. 3  →  "FOR003"
```

First three letters of the brand, plus the serial padded to three digits. If the
brand is blank it falls back to the product name, then to `PRD`.

**Barcode** — `generateBarcode()` (line 26)

A real EAN-13: prefix `890` (the GS1 code for India), then 9 digits derived from
the batch id and the serial, then a check digit computed by `ean13CheckDigit()`
(line 15) — odd positions weighted 1, even positions weighted 3. A real barcode
scanner will accept it.

### Step 6 — Save to MongoDB

```js
const created = await Product.create(docs);
```

Note it is `create()`, **not** `insertMany()`. `insertMany` bypasses Mongoose
middleware, and we need the `pre('validate')` hook in `src/models/Product.js`
(line 72) to run. That hook derives three things on every save:

```js
// 1. Stock status
if (stock <= 0)       status = 'out_of_stock';
else if (stock <= 10) status = 'low_stock';
else                  status = 'in_stock';

// 2. Margin percentage
margin = ((mrp - price) / mrp) * 100;

// 3. Thumbnail shortcut, so the listing page does not have to dig into the array
primaryImage = images.find(i => i.isPrimary)?.url || images[0]?.url || '';
```

Deriving these in the model rather than the service means they can never drift
out of sync — any future code path that saves a product gets the same rules.

### Step 7 — Record the batch, then clean up

An `UploadBatch` document stores what happened: rows read, products created,
images linked, which folders had no matching row, which rows had no images, and
any warnings. This is the audit trail, and it is what the UI shows you afterwards.

The `finally` block deletes both temp files from `backend/tmp/` — whether the
import succeeded or blew up. If it did blow up, the partially-extracted image
folder is removed too, so a failed import leaves nothing behind.

### Step 8 — Show it

The frontend calls `GET /api/products?page=1&limit=10`, gets the rows plus
pagination, and renders the table. Each row's `primaryImage` points at
`http://localhost:1004/static/<batchId>/<srNo>/<filename>`, which Express serves
straight off disk via `app.use('/static', express.static(STORAGE_DIR))`.

Clicking a row opens `/products/<id>`, which calls `GET /api/products/<id>` and
renders the gallery from the full `images` array.

---

## 6. What ends up where

| Thing | Where it lives |
|---|---|
| Product rows (name, price, category, image **URLs**) | MongoDB → `products` |
| Import history and warnings | MongoDB → `uploadbatches` |
| Admin account (name, email, scrypt hash) | MongoDB → `admins` |
| The actual image **files** | Disk → `backend/storage/<batchId>/<srNo>/` |
| The uploaded `.xlsx` and `.zip` | Nowhere — deleted after processing |

---

## 7. Re-importing

The upload form has a **Replace the existing catalogue** checkbox.

- **Ticked** (default): every product from earlier batches is deleted, and their
  image folders are removed from disk. You end up with exactly what is in the
  sheet you just uploaded.
- **Unticked**: the new batch is added alongside the old ones.

A unique index on `{ batchId, srNo }` prevents the same row being imported twice
within one batch.

---

## 8. Edge cases that are handled

| Situation | What happens |
|---|---|
| ZIP folder has no matching Excel row | Listed in `unmatchedFolders`, shown as a warning |
| Excel row has no ZIP folder | Product still created, no images, listed in `rowsWithoutImages` |
| Non-image files inside the ZIP | Skipped and counted |
| Unknown column in the sheet | Ignored, named in a warning |
| Header typo (`SUB CATEORY`) | Mapped correctly via `HEADER_MAP` |
| `images/12/a.jpg` vs `12/a.jpg` | Both resolve to folder 12 |
| Filenames sorting as img1, img10, img2 | Natural sort puts them 1, 2, 10 |
| Malicious path inside the ZIP (zip slip) | Filename stripped to its basename |
| Missing `SR. NO.` column | Import rejected with a clear message |
| Upload with no / expired token | `401`, and the UI asks you to log in again |
| Import fails halfway | Temp files and the partial image folder are deleted |

---

## 9. API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | — | Liveness check |
| `POST` | `/api/auth/login` | — | Returns a JWT |
| `GET` | `/api/auth/me` | Bearer | Who am I |
| `POST` | `/api/upload/bulk` | Bearer | The import described above |
| `GET` | `/api/upload/batches` | Bearer | Last 20 imports |
| `GET` | `/api/products` | — | Paginated list, with search and filters |
| `GET` | `/api/products/stats` | — | Counts and distinct categories/brands |
| `GET` | `/api/products/:id` | — | One product, by `_id`, `sku` or `srNo` |
| `GET` | `/static/<batchId>/<srNo>/<file>` | — | An image file |

---

## 10. The frontend, briefly

| File | Role |
|---|---|
| `lib/auth.tsx` | React context — holds the admin, restores the session from `localStorage` on load |
| `lib/api.ts` | All `fetch` calls in one place; attaches the Bearer token when needed |
| `components/Shell.tsx` | Sidebar + topbar + the single shared login dialog |
| `components/Sidebar.tsx` | The menu. Only **Products** and **Upload** navigate; the rest are deliberately inert |
| `components/LoginModal.tsx` | Email + password, with a show/hide toggle on the password |
| `app/upload/page.tsx` | Drag-and-drop for both files, a 3-step progress indicator, then the result summary |
| `app/products/page.tsx` | The catalogue table, debounced search, filters, pagination |
| `app/products/[id]/page.tsx` | Detail view with the image gallery |

The **Upload** menu entry shows a padlock until an admin logs in; clicking it
opens the login dialog instead of navigating.

---

## 11. The 30-second version

> multer catches the two files. exceljs turns the sheet into 40 row objects.
> adm-zip unzips the images to disk and builds a `Map` of
> `folderNumber → [files]`. Then `map.get(row.srNo)` joins them — that single
> lookup is the whole mapping. Mongoose saves the result, deriving margin, stock
> status and thumbnail automatically. Images stay on disk; only their URLs go in
> the database.

---

## 12. Proven run

Against the real sample files — a 40-row sheet and a ZIP holding 190 images
across 40 folders:

```json
{
  "message": "40 products imported, 190 images mapped",
  "totalRows": 40,
  "productsCreated": 40,
  "imagesLinked": 190,
  "zipFolders": 40,
  "unmatchedFolders": [],
  "rowsWithoutImages": [],
  "warnings": [],
  "durationMs": 1231
}
```
