/*
 * tests/services/localAuditService.test.js
 * Verifies README table parsing for the local build audit workflow.
 * Connects to: src/services/localAuditService.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const { parseReadmeBuildRows } = require("../../src/services/localAuditService");

test("parseReadmeBuildRows extracts build rows from the README table", () => {
  const rows = parseReadmeBuildRows(`
# 286 Builds

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | 2026-06-28 | [File Duplicate Finder](builds/016-file-duplicate-finder.md) | Finds duplicate files. | [Repo](https://github.com/breakingthebot/file-duplicate-finder-rust) | Rust | Languages | \`Expanded\` |
`);

  assert.deepEqual(rows, [
    {
      build_number: 16,
      date: "2026-06-28",
      project_name: "File Duplicate Finder",
      description: "Finds duplicate files.",
      repo_url: "https://github.com/breakingthebot/file-duplicate-finder-rust",
      technology: "Rust",
      category: "Languages",
      depth: "Expanded",
    },
  ]);
});
