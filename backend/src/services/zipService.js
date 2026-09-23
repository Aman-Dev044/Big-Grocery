'use strict';

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { isImageFile, ensureDir, sanitizeName } = require('../utils/fsx');

/**
 * Pulls the product folder number out of a zip entry path.
 * Handles `images/12/a.jpg`, `12/a.jpg` and `whatever/images/12/a.jpg`.
 * Returns null for entries that aren't inside a numbered folder.
 */
function folderNumberFromEntry(entryName) {
  const parts = entryName.split(/[\\/]+/).filter(Boolean);
  if (parts.length < 2) return null; // needs at least <folder>/<file>

  // Walk backwards from the filename; the nearest all-digit segment wins.
  for (let i = parts.length - 2; i >= 0; i -= 1) {
    if (/^\d+$/.test(parts[i])) return Number(parts[i]);
  }
  return null;
}

/**
 * Extracts every image in the zip into `destRoot/<folderNumber>/` and returns
 * a Map of folderNumber -> [{ filename, path, size }], each list sorted by
 * filename so the first image is a stable choice for the thumbnail.
 */
function extractImagesByFolder(zipPath, destRoot) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const byFolder = new Map();
  const skipped = [];

  entries.forEach((entry) => {
    if (entry.isDirectory) return;

    const entryName = entry.entryName;
    if (path.basename(entryName).startsWith('.') || entryName.includes('__MACOSX')) return;

    if (!isImageFile(entryName)) {
      skipped.push(entryName);
      return;
    }

    const folderNo = folderNumberFromEntry(entryName);
    if (folderNo === null) {
      skipped.push(entryName);
      return;
    }

    const targetDir = ensureDir(path.join(destRoot, String(folderNo)));
    const filename = sanitizeName(path.basename(entryName));
    const targetPath = path.join(targetDir, filename);

    fs.writeFileSync(targetPath, entry.getData());

    if (!byFolder.has(folderNo)) byFolder.set(folderNo, []);
    byFolder.get(folderNo).push({
      filename,
      path: targetPath,
      size: entry.header.size,
    });
  });

  // Stable, human-friendly order: natural sort so img2 comes before img10.
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  byFolder.forEach((files) => files.sort((a, b) => collator.compare(a.filename, b.filename)));

  return { byFolder, skipped };
}

module.exports = { extractImagesByFolder, folderNumberFromEntry };
