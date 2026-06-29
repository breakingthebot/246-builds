/*
 * tests/services/trackerSyncService.test.js
 * Verifies tracker note formatting and tracker update script generation for the workbook sync flow.
 * Connects to: src/services/trackerSyncService.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildTrackerNote,
  createTrackerReadScript,
  createTrackerUpdateScript,
  TRACKER_PRIMARY_FILE,
} = require("../../src/services/trackerSyncService");

test("buildTrackerNote combines depth and extra notes", () => {
  assert.equal(
    buildTrackerNote("Deep", "Live demo included."),
    "Depth: Deep | Live demo included.",
  );
});

test("buildTrackerNote returns empty string when nothing is provided", () => {
  assert.equal(buildTrackerNote("", ""), "");
});

test("createTrackerUpdateScript includes the target row and tracker fields", () => {
  const script = createTrackerUpdateScript(
    {
      build_number: 16,
      date: "2026-06-28",
      repo_url: "https://github.com/breakingthebot/file-duplicate-finder-rust",
    },
    "Depth: Expanded",
    "C:\\tracker.xlsx",
  );

  assert.match(script, /"rowNumber":17/);
  assert.match(script, /Completed/);
  assert.match(script, /Depth: Expanded/);
  assert.match(script, /file-duplicate-finder-rust/);
});

test("createTrackerReadScript targets the canonical tracker path", () => {
  const script = createTrackerReadScript(TRACKER_PRIMARY_FILE);
  assert.match(script, /sheet1\.xml/);
  assert.match(script, /ConvertTo-Json/);
});
