/*
 * src/services/trackerSyncService.js
 * Updates the tracker workbook rows for published builds without overwriting the existing sheet structure.
 * Connects to: 286_projects_tracker - with dropdowns.xlsx, reference/286-projects-tracker.xlsx, add-build.js
 * Created: 2026-06-28
 */

const fs = require("node:fs");
const path = require("node:path");
const JSZip = require("jszip");

const {
  findAllRows,
  findRowBlock,
  parseSharedStrings,
  readCellText,
  resolveSheetEntryPath,
  setInlineCellValue,
} = require("../utils/sheetXml");

const TRACKER_PRIMARY_FILE = path.join(
  process.cwd(),
  "reference",
  "286-projects-tracker.xlsx",
);
const TRACKER_MIRROR_FILES = [
  path.join(process.cwd(), "286_projects_tracker - with dropdowns.xlsx"),
];

const TRACKER_SHEET_NAME = "Tracker";
const TRACKER_COMPLETED_STATUS = "Completed";
const TRACKER_COLUMNS = {
  BUILD_NUMBER: "A",
  STATUS: "E",
  DATE_PUSHED: "F",
  GITHUB_LINK: "H",
  NOTES: "I",
};
const SHARED_STRINGS_ENTRY = "xl/sharedStrings.xml";
const WORKBOOK_ENTRY = "xl/workbook.xml";
const WORKBOOK_RELS_ENTRY = "xl/_rels/workbook.xml.rels";

/**
 * Resolves the tracker note text from depth and extra notes.
 *
 * @param {string | undefined} depth - The optional depth label.
 * @param {string | undefined} notes - Optional freeform notes.
 * @returns {string} The tracker note text.
 */
function buildTrackerNote(depth, notes) {
  const noteParts = [];

  if (typeof depth === "string" && depth.trim() !== "") {
    noteParts.push(`Depth: ${depth.trim()}`);
  }

  if (typeof notes === "string" && notes.trim() !== "") {
    noteParts.push(notes.trim());
  }

  return noteParts.join(" | ");
}

/**
 * Returns the tracker workbook paths that currently exist.
 *
 * @returns {string[]} The existing tracker paths.
 */
function getExistingTrackerPaths() {
  return [TRACKER_PRIMARY_FILE, ...TRACKER_MIRROR_FILES].filter((filePath) =>
    fs.existsSync(filePath),
  );
}

/**
 * Returns the canonical tracker workbook path.
 *
 * @returns {string | null} The canonical tracker path if it exists.
 */
function getCanonicalTrackerPath() {
  return fs.existsSync(TRACKER_PRIMARY_FILE) ? TRACKER_PRIMARY_FILE : null;
}

/**
 * Copies the canonical tracker workbook to any mirror locations.
 *
 * @param {string} canonicalPath - The canonical tracker path.
 * @returns {string[]} The mirrored file paths.
 */
function syncTrackerMirrors(canonicalPath) {
  const mirroredPaths = [];

  for (const mirrorPath of TRACKER_MIRROR_FILES) {
    fs.copyFileSync(canonicalPath, mirrorPath);
    mirroredPaths.push(mirrorPath);
  }

  return mirroredPaths;
}

/**
 * Opens the tracker workbook zip and resolves the Tracker sheet's XML entry
 * path. Pure Node (JSZip + regex-based SpreadsheetML edits) so this runs the
 * same way on Windows, macOS, and Linux -- this used to shell out to
 * PowerShell to edit the workbook's raw XML, which only worked on Windows
 * and failed silently everywhere else.
 *
 * @param {string} trackerPath - The tracker workbook path.
 * @returns {Promise<{ zip: JSZip, sheetEntryPath: string }>} The opened zip and the Tracker sheet's entry path.
 */
async function openTrackerZip(trackerPath) {
  const fileBuffer = await fs.promises.readFile(trackerPath);
  const zip = await JSZip.loadAsync(fileBuffer);

  const workbookXml = await zip.file(WORKBOOK_ENTRY).async("string");
  const workbookRelsXml = await zip.file(WORKBOOK_RELS_ENTRY).async("string");
  const sheetEntryPath = resolveSheetEntryPath(
    workbookXml,
    workbookRelsXml,
    TRACKER_SHEET_NAME,
  );

  if (!sheetEntryPath || !zip.file(sheetEntryPath)) {
    throw new Error(`Tracker workbook is missing the "${TRACKER_SHEET_NAME}" sheet.`);
  }

  return { zip, sheetEntryPath };
}

/**
 * Reads the tracker workbook rows from the canonical tracker file.
 *
 * @returns {Promise<Array<{build_number: number, status: string, date: string, repo_url: string, notes: string}>>} The tracker rows.
 */
async function readTrackerRows() {
  const canonicalPath = getCanonicalTrackerPath();

  if (!canonicalPath) {
    return [];
  }

  const { zip, sheetEntryPath } = await openTrackerZip(canonicalPath);
  const sheetXml = await zip.file(sheetEntryPath).async("string");
  const sharedStringsFile = zip.file(SHARED_STRINGS_ENTRY);
  const sharedStrings = sharedStringsFile
    ? parseSharedStrings(await sharedStringsFile.async("string"))
    : [];

  const rows = [];

  for (const { rowNumber, block } of findAllRows(sheetXml)) {
    if (rowNumber === 1) {
      continue;
    }

    const status = readCellText(block, TRACKER_COLUMNS.STATUS, rowNumber, sharedStrings);

    if (!status) {
      continue;
    }

    rows.push({
      build_number: Number(
        readCellText(block, TRACKER_COLUMNS.BUILD_NUMBER, rowNumber, sharedStrings),
      ),
      status,
      date: readCellText(block, TRACKER_COLUMNS.DATE_PUSHED, rowNumber, sharedStrings),
      repo_url: readCellText(block, TRACKER_COLUMNS.GITHUB_LINK, rowNumber, sharedStrings),
      notes: readCellText(block, TRACKER_COLUMNS.NOTES, rowNumber, sharedStrings),
    });
  }

  return rows;
}

/**
 * Updates any tracker workbook copies present in the repo.
 *
 * @param {{ build_number: number, date: string, repo_url: string }} buildEntry - The build entry to sync.
 * @param {{ depth?: string, notes?: string }} options - Optional tracker note data.
 * @returns {Promise<string[]>} The updated tracker file paths.
 */
async function updateTrackerWorkbooks(buildEntry, options = {}) {
  const canonicalPath = getCanonicalTrackerPath();

  if (!canonicalPath) {
    return [];
  }

  const trackerNote = buildTrackerNote(options.depth, options.notes);
  const rowNumber = buildEntry.build_number + 1;

  const { zip, sheetEntryPath } = await openTrackerZip(canonicalPath);
  const sheetXml = await zip.file(sheetEntryPath).async("string");
  const rowBlock = findRowBlock(sheetXml, rowNumber);

  if (!rowBlock) {
    throw new Error(`Missing row ${rowNumber} in tracker workbook.`);
  }

  let updatedRowXml = rowBlock.match;
  updatedRowXml = setInlineCellValue(
    updatedRowXml,
    TRACKER_COLUMNS.STATUS,
    rowNumber,
    TRACKER_COMPLETED_STATUS,
  );
  updatedRowXml = setInlineCellValue(
    updatedRowXml,
    TRACKER_COLUMNS.DATE_PUSHED,
    rowNumber,
    buildEntry.date,
  );
  updatedRowXml = setInlineCellValue(
    updatedRowXml,
    TRACKER_COLUMNS.GITHUB_LINK,
    rowNumber,
    buildEntry.repo_url,
  );

  if (trackerNote) {
    updatedRowXml = setInlineCellValue(
      updatedRowXml,
      TRACKER_COLUMNS.NOTES,
      rowNumber,
      trackerNote,
    );
  }

  const updatedSheetXml =
    sheetXml.slice(0, rowBlock.start) + updatedRowXml + sheetXml.slice(rowBlock.end);

  zip.file(sheetEntryPath, updatedSheetXml);
  const updatedBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  await fs.promises.writeFile(canonicalPath, updatedBuffer);

  const mirroredPaths = syncTrackerMirrors(canonicalPath);

  return [canonicalPath, ...mirroredPaths];
}

module.exports = {
  buildTrackerNote,
  getCanonicalTrackerPath,
  getExistingTrackerPaths,
  openTrackerZip,
  readTrackerRows,
  syncTrackerMirrors,
  TRACKER_COLUMNS,
  TRACKER_COMPLETED_STATUS,
  TRACKER_MIRROR_FILES,
  TRACKER_PRIMARY_FILE,
  TRACKER_SHEET_NAME,
  updateTrackerWorkbooks,
};
