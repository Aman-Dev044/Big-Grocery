'use strict';

const ExcelJS = require('exceljs');

/** "SUB CATEORY" -> "SUBCATEORY" so header typos/spacing don't break the mapping. */
function normalizeHeader(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

// Normalized header -> product field. Known typos from the source sheet included.
const HEADER_MAP = {
  SRNO: 'srNo',
  SERIALNO: 'srNo',
  SNO: 'srNo',
  PRODUCTSKU: 'sku',
  SKU: 'sku',
  PRODUCTBARCODE: 'barcode',
  BARCODE: 'barcode',
  PRODUCTNAME: 'name',
  NAME: 'name',
  CATEGORY: 'category',
  SUBCATEORY: 'subCategory',
  SUBCATEGORY: 'subCategory',
  SUBSUBCATEGORY: 'subSubCategory',
  BRAND: 'brand',
  MRP: 'mrp',
  PRICE: 'price',
  WEIGHT: 'weight',
  QUANTITY1: 'quantity1',
  QUANTITY2: 'quantity2',
  QUANTITY3: 'quantity3',
  QUANTITY4: 'quantity4',
  PRICE1: 'price1',
  PRICE2: 'price2',
  PRICE3: 'price3',
  PRICE4: 'price4',
  MARGIN1: 'margin1',
  MARGIN2: 'margin2',
  MARGIN3: 'margin3',
  MARGIN4: 'margin4',
  DELIVERYCHARGE1: 'deliveryCharge',
  DELIVERYCHARGE: 'deliveryCharge',
  STOCK: 'stock',
  DESCRIPTION: 'description',
};

/** ExcelJS hands back strings, numbers, rich text, hyperlinks or formula results. */
function cellText(cell) {
  const v = cell ? cell.value : null;
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((r) => r.text).join('').trim();
    if (v.text !== undefined) return String(v.text).trim();
    if (v.result !== undefined) return String(v.result).trim();
    if (v instanceof Date) return v.toISOString();
    return '';
  }
  return String(v).trim();
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * Reads the first worksheet and returns one object per product row.
 * Row 1 is the header; rows without a SR. NO. or a name are skipped.
 */
async function parseExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('Excel file has no worksheet');

  const headerRow = sheet.getRow(1);
  const columns = {}; // column index -> field name
  const unknownHeaders = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = normalizeHeader(cellText(cell));
    if (!key) return;
    if (HEADER_MAP[key]) columns[colNumber] = HEADER_MAP[key];
    else unknownHeaders.push(cellText(cell));
  });

  if (!Object.values(columns).includes('srNo')) {
    throw new Error('Excel is missing the "SR. NO." column — cannot map images to products');
  }
  if (!Object.values(columns).includes('name')) {
    throw new Error('Excel is missing the "PRODUCT NAME" column');
  }

  const rows = [];
  for (let r = 2; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    const raw = {};
    Object.entries(columns).forEach(([colNumber, field]) => {
      raw[field] = cellText(row.getCell(Number(colNumber)));
    });

    const srNo = toNumber(raw.srNo);
    if (srNo === null || !raw.name) continue; // blank/spacer row

    rows.push({
      excelRow: r,
      srNo,
      sku: raw.sku || '',
      barcode: raw.barcode || '',
      name: raw.name.trim(),
      description: raw.description || '',
      category: (raw.category || '').trim(),
      subCategory: (raw.subCategory || '').trim(),
      subSubCategory: (raw.subSubCategory || '').trim(),
      brand: (raw.brand || '').trim(),
      mrp: toNumber(raw.mrp) ?? 0,
      price: toNumber(raw.price) ?? 0,
      weight: (raw.weight || '').trim(),
      stock: toNumber(raw.stock) ?? 0,
      deliveryCharge: toNumber(raw.deliveryCharge) ?? 0,
      slabs: [1, 2, 3, 4]
        .map((tier) => ({
          tier,
          quantity: toNumber(raw[`quantity${tier}`]),
          price: toNumber(raw[`price${tier}`]),
          margin: toNumber(raw[`margin${tier}`]),
        }))
        .filter((slab) => slab.quantity !== null || slab.price !== null || slab.margin !== null),
    });
  }

  return { rows, unknownHeaders, sheetName: sheet.name };
}

module.exports = { parseExcel, normalizeHeader };
