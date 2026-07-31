/*
 * tests/services/trackerSyncService.test.js
 * Verifies tracker note formatting and the cross-platform workbook read/write flow.
 * Connects to: src/services/trackerSyncService.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  buildTrackerNote,
  readTrackerRows,
  TRACKER_PRIMARY_FILE,
  updateTrackerWorkbooks,
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

test("readTrackerRows reads the checked-in tracker workbook without a Windows/PowerShell dependency", async () => {
  const rows = await readTrackerRows();

  assert.ok(rows.length > 0, "expected at least one tracker row");
  const buildOne = rows.find((row) => row.build_number === 1);
  assert.equal(buildOne.status, "Completed");
  assert.equal(buildOne.repo_url, "https://github.com/breakingthebot/expense-tracker");
});

test("updateTrackerWorkbooks writes and round-trips a completed row on a scratch copy of the tracker", async (t) => {
  const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), "tracker-sync-test-"));
  const scratchReferenceDir = path.join(scratchDir, "reference");
  fs.mkdirSync(scratchReferenceDir);
  fs.copyFileSync(
    TRACKER_PRIMARY_FILE,
    path.join(scratchReferenceDir, "286-projects-tracker.xlsx"),
  );

  const originalCwd = process.cwd();
  process.chdir(scratchDir);
  t.after(() => {
    process.chdir(originalCwd);
    fs.rmSync(scratchDir, { recursive: true, force: true });
  });

  // Re-require with the scratch cwd in effect so TRACKER_PRIMARY_FILE resolves inside it.
  delete require.cache[require.resolve("../../src/services/trackerSyncService")];
  const scratchService = require("../../src/services/trackerSyncService");

  const updatedPaths = await scratchService.updateTrackerWorkbooks(
    {
      build_number: 42,
      date: "2026-07-25",
      repo_url: "https://github.com/breakingthebot/word-counter-build42",
    },
    { depth: "Deep", notes: "Vercel: https://word-counter-build42.vercel.app" },
  );

  // The canonical file plus a freshly created mirror copy (the mirror is
  // always (re)written, matching the pre-existing mirror behavior).
  assert.equal(updatedPaths.length, 2);

  const rows = await scratchService.readTrackerRows();
  const updatedRow = rows.find((row) => row.build_number === 42);

  assert.deepEqual(updatedRow, {
    build_number: 42,
    status: "Completed",
    date: "2026-07-25",
    repo_url: "https://github.com/breakingthebot/word-counter-build42",
    notes: "Depth: Deep | Vercel: https://word-counter-build42.vercel.app",
  });

  delete require.cache[require.resolve("../../src/services/trackerSyncService")];
});
