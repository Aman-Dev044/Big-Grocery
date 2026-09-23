'use strict';

/**
 * Readable SKU from the brand + serial number, e.g. "AASHIRVAAD" + 1 -> "AAS001".
 * Falls back to the product name, then to a generic "PRD" prefix.
 */
function generateSku(brand, name, srNo) {
  const source = String(brand || name || 'PRD').toUpperCase();
  const letters = source.replace(/[^A-Z0-9]/g, '');
  const prefix = (letters.slice(0, 3) || 'PRD').padEnd(3, 'X');
  return `${prefix}${String(srNo).padStart(3, '0')}`;
}

/** EAN-13 check digit: odd positions weight 1, even positions weight 3. */
function ean13CheckDigit(twelveDigits) {
  const sum = twelveDigits
    .split('')
    .reduce((acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 1 : 3), 0);
  return String((10 - (sum % 10)) % 10);
}

/**
 * Deterministic EAN-13 barcode. 890 is the GS1 India prefix; the next 9 digits
 * encode the batch seed + serial so re-running an upload is reproducible.
 */
function generateBarcode(srNo, seed = 0) {
  const body = String(Math.abs(seed) % 1000000).padStart(6, '0') + String(srNo).padStart(3, '0');
  const twelve = `890${body}`.slice(0, 12);
  return twelve + ean13CheckDigit(twelve);
}

module.exports = { generateSku, generateBarcode, ean13CheckDigit };
