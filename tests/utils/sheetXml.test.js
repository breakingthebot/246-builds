/*
 * tests/utils/sheetXml.test.js
 * Verifies the SpreadsheetML row/cell helpers used by the tracker sync flow.
 * Connects to: src/utils/sheetXml.js
 * Created: 2026-07-31
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findAllRows,
  findRowBlock,
  parseSharedStrings,
  readCellText,
  resolveSheetEntryPath,
  setInlineCellValue,
} = require("../../src/utils/sheetXml");

const SAMPLE_SHEET_XML = [
  '<sheetData>',
  '<row r="1"><c r="A1" t="s"><v>0</v></c></row>',
  '<row r="2" spans="1:9"><c r="A2" s="3"><v>1</v></c><c r="E2" s="3" t="s"><v>1</v></c><c r="F2" s="3" /></row>',
  '</sheetData>',
].join("");

const SAMPLE_SHARED_STRINGS_XML = [
  '<sst count="2" uniqueCount="2">',
  '<si><t>Build #</t></si>',
  '<si><t>Not Started</t></si>',
  '</sst>',
].join("");

test("findRowBlock extracts the row matching the given row number", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2);
  assert.ok(rowBlock);
  assert.match(rowBlock.match, /r="2"/);
  assert.doesNotMatch(rowBlock.match, /r="1"/);
});

test("findRowBlock returns null for a missing row", () => {
  assert.equal(findRowBlock(SAMPLE_SHEET_XML, 99), null);
});

test("findAllRows returns every row in document order", () => {
  const rows = findAllRows(SAMPLE_SHEET_XML);
  assert.deepEqual(
    rows.map((row) => row.rowNumber),
    [1, 2],
  );
});

test("parseSharedStrings resolves the shared strings table in index order", () => {
  const sharedStrings = parseSharedStrings(SAMPLE_SHARED_STRINGS_XML);
  assert.deepEqual(sharedStrings, ["Build #", "Not Started"]);
});

test("readCellText resolves a shared-string cell against the shared strings table", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2).match;
  const sharedStrings = parseSharedStrings(SAMPLE_SHARED_STRINGS_XML);
  assert.equal(readCellText(rowBlock, "E", 2, sharedStrings), "Not Started");
});

test("readCellText returns an empty string for an empty/self-closing cell", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2).match;
  assert.equal(readCellText(rowBlock, "F", 2, []), "");
});

test("readCellText returns an empty string for a cell that does not exist", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2).match;
  assert.equal(readCellText(rowBlock, "I", 2, []), "");
});

test("setInlineCellValue replaces an existing cell's value with an inline string, preserving its style", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2).match;
  const updatedRow = setInlineCellValue(rowBlock, "F", 2, "2026-07-25");

  assert.match(updatedRow, /<c r="F2" s="3" t="inlineStr"><is><t>2026-07-25<\/t><\/is><\/c>/);
  assert.equal(readCellText(updatedRow, "F", 2, []), "2026-07-25");
});

test("setInlineCellValue creates a new cell when one does not already exist for that column", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2).match;
  const updatedRow = setInlineCellValue(rowBlock, "I", 2, "Depth: Deep");

  assert.equal(readCellText(updatedRow, "I", 2, []), "Depth: Deep");
});

test("setInlineCellValue escapes XML-sensitive characters", () => {
  const rowBlock = findRowBlock(SAMPLE_SHEET_XML, 2).match;
  const updatedRow = setInlineCellValue(rowBlock, "F", 2, "A & B <fine>");

  assert.match(updatedRow, /A &amp; B &lt;fine&gt;/);
  assert.equal(readCellText(updatedRow, "F", 2, []), "A & B <fine>");
});

test("resolveSheetEntryPath maps a sheet name to its zip entry path via workbook.xml + rels", () => {
  const workbookXml =
    '<sheets><sheet name="Tracker" sheetId="1" r:id="rId1"/><sheet name="Summary" sheetId="2" r:id="rId2"/></sheets>';
  const relsXml =
    '<Relationships><Relationship Id="rId2" Target="worksheets/sheet2.xml"/><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>';

  assert.equal(
    resolveSheetEntryPath(workbookXml, relsXml, "Tracker"),
    "xl/worksheets/sheet1.xml",
  );
  assert.equal(
    resolveSheetEntryPath(workbookXml, relsXml, "Summary"),
    "xl/worksheets/sheet2.xml",
  );
});

test("resolveSheetEntryPath returns null for an unknown sheet name", () => {
  const workbookXml = '<sheets><sheet name="Tracker" sheetId="1" r:id="rId1"/></sheets>';
  const relsXml = '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>';

  assert.equal(resolveSheetEntryPath(workbookXml, relsXml, "Nonexistent"), null);
});
