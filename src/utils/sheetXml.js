/*
 * src/utils/sheetXml.js
 * Minimal, dependency-free helpers for reading and patching a single row of a
 * SpreadsheetML worksheet (the raw XML format inside an .xlsx zip). Used
 * instead of a full XML parser so the tracker sync stays a small, low-risk
 * dependency footprint (just JSZip for the zip container).
 * Connects to: src/services/trackerSyncService.js
 * Created: 2026-07-31
 */

/**
 * Escapes text for safe inclusion inside XML element content.
 *
 * @param {string} value - The raw text.
 * @returns {string} The XML-escaped text.
 */
function escapeXmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Unescapes the handful of XML entities used in SpreadsheetML text content.
 *
 * @param {string} value - The raw XML text content.
 * @returns {string} The unescaped text.
 */
function unescapeXmlText(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

/**
 * Extracts one `<row r="N" ...>...</row>` (or self-closing `<row .../>`)
 * block from a worksheet's sheetData.
 *
 * @param {string} sheetXml - The full worksheet XML.
 * @param {number} rowNumber - The 1-indexed row number.
 * @returns {{ match: string, start: number, end: number } | null} The matched row block and its offsets, or null if the row does not exist.
 */
function findRowBlock(sheetXml, rowNumber) {
  const pattern = new RegExp(
    `<row r="${rowNumber}"(?:\\s[^>]*)?(?:/>|>[\\s\\S]*?</row>)`,
  );
  const match = pattern.exec(sheetXml);

  if (!match) {
    return null;
  }

  return { match: match[0], start: match.index, end: match.index + match[0].length };
}

/**
 * Extracts one `<c r="COLROW" ...>...</c>` (or self-closing `<c .../>`) cell
 * from a row block.
 *
 * @param {string} rowXml - The row block XML.
 * @param {string} cellRef - The cell reference, e.g. "F43".
 * @returns {string | null} The matched cell XML, or null if the cell does not exist.
 */
function findCellXml(rowXml, cellRef) {
  const pattern = new RegExp(`<c r="${cellRef}"(?:\\s[^>]*)?(?:/>|>[\\s\\S]*?</c>)`);
  const match = pattern.exec(rowXml);
  return match ? match[0] : null;
}

/**
 * Reads a cell's style index ("s" attribute) from its XML, if present.
 *
 * @param {string} cellXml - The cell's XML.
 * @returns {string | null} The style index attribute value, or null if absent.
 */
function readCellStyleAttribute(cellXml) {
  const match = /\ss="(\d+)"/.exec(cellXml);
  return match ? ` s="${match[1]}"` : "";
}

/**
 * Sets one cell in a row block to an inline string value, creating the cell
 * if it does not already exist. Mirrors the plain-text "inline string" cell
 * shape (`t="inlineStr"`) that this tracker workbook already uses for every
 * previously completed build, so mixed old/new rows stay consistent.
 *
 * @param {string} rowXml - The row block XML to update.
 * @param {string} columnLetter - The target column letter, e.g. "F".
 * @param {number} rowNumber - The 1-indexed row number.
 * @param {string} value - The plain-text value to write.
 * @returns {string} The updated row block XML.
 */
function setInlineCellValue(rowXml, columnLetter, rowNumber, value) {
  const cellRef = `${columnLetter}${rowNumber}`;
  const existingCellXml = findCellXml(rowXml, cellRef);
  const styleAttribute = existingCellXml ? readCellStyleAttribute(existingCellXml) : "";
  const newCellXml = `<c r="${cellRef}"${styleAttribute} t="inlineStr"><is><t>${escapeXmlText(value)}</t></is></c>`;

  if (existingCellXml) {
    return rowXml.replace(existingCellXml, newCellXml);
  }

  return rowXml.replace("</row>", `${newCellXml}</row>`);
}

/**
 * Reads a cell's plain-text value, resolving shared-string references
 * against the provided shared strings table.
 *
 * @param {string} rowXml - The row block XML.
 * @param {string} columnLetter - The target column letter, e.g. "F".
 * @param {number} rowNumber - The 1-indexed row number.
 * @param {string[]} sharedStrings - The workbook's shared strings table.
 * @returns {string} The cell's plain-text value, or an empty string if the cell is empty/missing.
 */
function readCellText(rowXml, columnLetter, rowNumber, sharedStrings) {
  const cellXml = findCellXml(rowXml, `${columnLetter}${rowNumber}`);

  if (!cellXml) {
    return "";
  }

  const isInlineString = /\st="inlineStr"/.test(cellXml);
  const isSharedString = /\st="s"/.test(cellXml);
  const valueMatch = /<v>([\s\S]*?)<\/v>/.exec(cellXml);

  if (isInlineString) {
    const textMatch = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/.exec(cellXml);
    return textMatch ? unescapeXmlText(textMatch[1]) : "";
  }

  if (isSharedString && valueMatch) {
    const sharedIndex = Number(valueMatch[1]);
    return sharedStrings[sharedIndex] !== undefined ? sharedStrings[sharedIndex] : "";
  }

  return valueMatch ? unescapeXmlText(valueMatch[1]) : "";
}

/**
 * Parses a SpreadsheetML `sharedStrings.xml` document into an index-ordered
 * array of plain-text strings.
 *
 * @param {string} sharedStringsXml - The shared strings XML document.
 * @returns {string[]} The shared strings, in table order.
 */
function parseSharedStrings(sharedStringsXml) {
  const entries = [];
  const itemPattern = /<si>([\s\S]*?)<\/si>/g;
  let match = itemPattern.exec(sharedStringsXml);

  while (match) {
    const textParts = [...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(
      (textMatch) => unescapeXmlText(textMatch[1]),
    );
    entries.push(textParts.join(""));
    match = itemPattern.exec(sharedStringsXml);
  }

  return entries;
}

/**
 * Finds every `<row>` block in a worksheet's sheetData, in document order.
 *
 * @param {string} sheetXml - The full worksheet XML.
 * @returns {Array<{ rowNumber: number, block: string }>} The row blocks, keyed by their 1-indexed row number.
 */
function findAllRows(sheetXml) {
  const rows = [];
  const rowPattern = /<row r="(\d+)"(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/row>)/g;
  let match = rowPattern.exec(sheetXml);

  while (match) {
    rows.push({ rowNumber: Number(match[1]), block: match[0] });
    match = rowPattern.exec(sheetXml);
  }

  return rows;
}

/**
 * Resolves a worksheet's zip entry path (e.g. "xl/worksheets/sheet1.xml")
 * from its visible sheet name, via `xl/workbook.xml` (name -> r:id) and
 * `xl/_rels/workbook.xml.rels` (r:id -> target path). Avoids hardcoding
 * which physical sheetN.xml backs a given tab, since sheet order/naming can
 * change independently of the file layout.
 *
 * @param {string} workbookXml - The `xl/workbook.xml` contents.
 * @param {string} workbookRelsXml - The `xl/_rels/workbook.xml.rels` contents.
 * @param {string} sheetName - The visible sheet name, e.g. "Tracker".
 * @returns {string | null} The zip entry path for the sheet, or null if not found.
 */
function resolveSheetEntryPath(workbookXml, workbookRelsXml, sheetName) {
  const sheetPattern = new RegExp(
    `<sheet name="${sheetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*r:id="(rId\\d+)"`,
  );
  const sheetMatch = sheetPattern.exec(workbookXml);

  if (!sheetMatch) {
    return null;
  }

  const relationshipId = sheetMatch[1];
  const relPattern = new RegExp(`<Relationship Id="${relationshipId}"[^>]*Target="([^"]+)"`);
  const relMatch = relPattern.exec(workbookRelsXml);

  if (!relMatch) {
    return null;
  }

  return `xl/${relMatch[1]}`;
}

module.exports = {
  escapeXmlText,
  findAllRows,
  findRowBlock,
  findCellXml,
  parseSharedStrings,
  readCellText,
  resolveSheetEntryPath,
  setInlineCellValue,
  unescapeXmlText,
};
