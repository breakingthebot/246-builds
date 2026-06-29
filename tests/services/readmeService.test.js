/*
 * tests/services/readmeService.test.js
 * Verifies README generation for both populated and empty build indexes.
 * Connects to: src/services/readmeService.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCountTable,
  buildEnhancedTableRows,
  buildSnapshotTable,
  createReadme,
  createDepthBadge,
} = require("../../src/services/readmeService");

test("buildEnhancedTableRows renders one markdown row per build", () => {
  const rows = buildEnhancedTableRows([
    {
      build_number: 16,
      date: "2026-06-28",
      project_name: "Duplicate Finder",
      description: "Finds duplicate files by hash.",
      repo_url: "https://github.com/breakingthebot/file-duplicate-finder",
      technology: "Rust",
      category: "Languages",
      depth: "Deep",
      notes: "",
      stack: ["Rust", "CLI"],
    },
  ]);

  assert.equal(
    rows,
    "| 16 | 2026-06-28 | [Duplicate Finder](builds/016-duplicate-finder.md) | Finds duplicate files by hash. | [Repo](https://github.com/breakingthebot/file-duplicate-finder) | Rust | Languages | `Deep` |",
  );
});

test("createDepthBadge renders a compact markdown badge", () => {
  assert.equal(createDepthBadge("Expanded"), "`Expanded`");
});

test("buildCountTable renders a compact count table", () => {
  assert.deepEqual(buildCountTable([{ label: "Languages", count: 16 }]), [
    "| Label | Count |",
    "| --- | ---: |",
    "| Languages | 16 |",
  ]);
});

test("buildSnapshotTable renders summary metrics", () => {
  assert.deepEqual(
    buildSnapshotTable({
      total_builds: 16,
      latest_build: {
        build_number: 16,
        date: "2026-06-28",
        project_name: "File Duplicate Finder",
      },
      by_depth: [
        { label: "Deep", count: 9 },
        { label: "Expanded", count: 7 },
      ],
    }),
    [
      "| Completed | Latest Build | Deep Builds | Expanded Builds | Standard Builds |",
      "| ---: | --- | ---: | ---: | ---: |",
      "| 16 | #16 File Duplicate Finder | 9 | 7 | 0 |",
    ],
  );
});

test("createReadme includes an empty-state note when there are no published builds", () => {
  const readme = createReadme([]);

  assert.match(readme, /table is intentionally empty/);
  assert.match(readme, /# 286 Builds/);
});

test("createReadme includes build data when entries exist", () => {
  const readme = createReadme([
    {
      build_number: 14,
      date: "2026-06-28",
      project_name: "Contact Form Backend",
      description: "Receives form data, validates, sends email, and stores records.",
      repo_url: "https://github.com/breakingthebot/contact-form-backend",
      technology: "PHP",
      category: "Languages",
      depth: "Deep",
      notes: "",
      stack: ["PHP", "MySQL"],
    },
  ]);

  assert.match(readme, /\| Completed \| Latest Build \| Deep Builds \|/);
  assert.match(readme, /\[CSV Export\]\(exports\/builds\.csv\)/);
  assert.match(readme, /## By Technology/);
  assert.match(readme, /`Deep`/);
});
