/*
 * tests/services/localAuditService.test.js
 * Verifies README parsing for the local build audit workflow.
 * Connects to: src/services/localAuditService.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const { parseReadmeBuildRows } = require("../../src/services/localAuditService");
const { createCollapsibleFilteredSection } = require("../../src/services/readmeService");

const SAMPLE_ENTRY = {
  build_number: 16,
  date: "2026-06-28",
  project_name: "File Duplicate Finder",
  description: "Finds duplicate files.",
  repo_url: "https://github.com/breakingthebot/file-duplicate-finder-rust",
  technology: "Rust",
  category: "Languages",
  depth: "Expanded",
};

test("parseReadmeBuildRows extracts build rows from the Build Index accordion", () => {
  const readme = [
    "# 286 Builds",
    "",
    "## Build Index",
    ...createCollapsibleFilteredSection("All Builds", [SAMPLE_ENTRY]),
    "## Quick Views",
  ].join("\n");

  const rows = parseReadmeBuildRows(readme);

  assert.deepEqual(rows, [SAMPLE_ENTRY]);
});

test("parseReadmeBuildRows only reads the Build Index accordion, ignoring the same entries repeated in other sections", () => {
  const readme = [
    "# 286 Builds",
    "",
    "## Build Index",
    ...createCollapsibleFilteredSection("All Builds", [SAMPLE_ENTRY]),
    "## Quick Views",
    ...createCollapsibleFilteredSection("Deep Builds", [SAMPLE_ENTRY]),
    "## By Category",
    ...createCollapsibleFilteredSection("Languages", [SAMPLE_ENTRY]),
  ].join("\n");

  const rows = parseReadmeBuildRows(readme);

  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], SAMPLE_ENTRY);
});

test("parseReadmeBuildRows returns an empty array when there is no Build Index accordion", () => {
  const rows = parseReadmeBuildRows("# 286 Builds\n\nNothing here yet.\n");

  assert.deepEqual(rows, []);
});
