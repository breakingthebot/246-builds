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
  buildSnapshotTable,
  createReadme,
  createDepthBadge,
  createBadge,
  createBuildCard,
  createCardList,
  createCollapsibleFilteredSection,
} = require("../../src/services/readmeService");

const SAMPLE_ENTRY = {
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
};

test("createBadge renders a shields.io badge image with an escaped label", () => {
  assert.equal(
    createBadge("JS testing", "334155"),
    "![JS testing](https://img.shields.io/badge/JS_testing-334155)",
  );
});

test("createDepthBadge renders a colored badge per depth level", () => {
  assert.equal(
    createDepthBadge("Deep"),
    "![Deep](https://img.shields.io/badge/Deep-7c3aed)",
  );
  assert.equal(
    createDepthBadge("Expanded"),
    "![Expanded](https://img.shields.io/badge/Expanded-0284c7)",
  );
  assert.equal(
    createDepthBadge("Standard"),
    "![Standard](https://img.shields.io/badge/Standard-6b7280)",
  );
});

test("createBuildCard renders a linked title, badges, description, and repo link", () => {
  const card = createBuildCard(SAMPLE_ENTRY);

  assert.equal(
    card[0],
    "#### [#16 — Duplicate Finder](builds/016-duplicate-finder.md)",
  );
  assert.match(card[1], /!\[Rust\]/);
  assert.match(card[1], /!\[Languages\]/);
  assert.match(card[1], /!\[Deep\]/);
  assert.match(card[1], /2026-06-28/);
  assert.equal(card[3], "Finds duplicate files by hash.");
  assert.equal(
    card[card.length - 1],
    "[Repo →](https://github.com/breakingthebot/file-duplicate-finder)",
  );
});

test("createCardList separates multiple cards with a horizontal rule and has no trailing separator", () => {
  const lines = createCardList([
    SAMPLE_ENTRY,
    { ...SAMPLE_ENTRY, build_number: 17, project_name: "Second Build" },
  ]);

  assert.ok(lines.includes("---"), "expected a horizontal rule between cards");
  assert.notEqual(lines[lines.length - 1], "---");
  assert.notEqual(lines[0], "---");
});

test("createCardList returns an empty array for an empty entry list", () => {
  assert.deepEqual(createCardList([]), []);
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

  assert.match(readme, /list is intentionally empty/);
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
  assert.match(readme, /!\[Deep\]/);
});

test("createReadme wraps Build Index, Quick Views, By Category, and By Technology in collapsible accordions", () => {
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

  assert.match(readme, /<summary>All Builds \(1\)<\/summary>/);
  assert.match(readme, /<summary>Most Recent 10 \(1\)<\/summary>/);
  assert.match(readme, /<summary>Deep Builds \(1\)<\/summary>/);
  assert.match(readme, /<summary>Languages \(1\)<\/summary>/);
  assert.match(readme, /<summary>PHP \(1\)<\/summary>/);
  assert.equal(readme.includes("| Build # | Date | Project |"), false, "no build-listing tables should remain");
});

test("createCollapsibleFilteredSection wraps a card list in a <details> accordion with a count in the summary", () => {
  const lines = createCollapsibleFilteredSection("Languages", [SAMPLE_ENTRY]);

  assert.equal(lines[0], "<details>");
  assert.equal(lines[1], "<summary>Languages (1)</summary>");
  assert.equal(lines[2], "");
  assert.equal(lines[lines.length - 2], "</details>");
});
