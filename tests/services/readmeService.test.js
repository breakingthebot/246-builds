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
  createLabeledBadge,
  createBuildCard,
  createCardList,
  createCollapsibleFilteredSection,
  createLatestBuildSpotlight,
  createStatBadges,
  createSyncNote,
  createTechCloud,
  resolveTechnologyBadgeColor,
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

test("createLabeledBadge renders a two-segment label:message badge", () => {
  assert.equal(
    createLabeledBadge("Builds", "23", "0ea5e9"),
    "![Builds: 23](https://img.shields.io/badge/Builds-23-0ea5e9)",
  );
});

test("createLabeledBadge percent-encodes '#' so it isn't misread as a URL fragment", () => {
  // A raw "#" in the URL truncates everything after it (including the
  // color) as a fragment, breaking the badge. Regression test for that.
  const badge = createLabeledBadge("Latest", "#23", "16a34a");

  assert.equal(
    badge,
    "![Latest: #23](https://img.shields.io/badge/Latest-%2323-16a34a)",
  );
  assert.doesNotMatch(badge.split("(")[1], /#/, "the URL itself must not contain a raw #");
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

test("resolveTechnologyBadgeColor returns each language's GitHub Linguist color", () => {
  assert.equal(resolveTechnologyBadgeColor("Rust"), "DEA584");
  assert.equal(resolveTechnologyBadgeColor("Kotlin"), "A97BFF");
  assert.equal(resolveTechnologyBadgeColor("TypeScript"), "3178C6");
});

test("resolveTechnologyBadgeColor groups every Python variant under one color", () => {
  assert.equal(resolveTechnologyBadgeColor("Python (ML)"), "3572A5");
  assert.equal(resolveTechnologyBadgeColor("Python (CLI tools)"), "3572A5");
  assert.equal(resolveTechnologyBadgeColor("Python (a brand new category)"), "3572A5");
});

test("resolveTechnologyBadgeColor falls back to a neutral default for unmapped technologies", () => {
  assert.equal(resolveTechnologyBadgeColor("COBOL"), "334155");
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

test("createStatBadges renders Builds/Latest/Languages/Deep Builds as one badge row", () => {
  const badges = createStatBadges(
    {
      total_builds: 23,
      latest_build: { build_number: 23, project_name: "Hammerspoon Config" },
      by_depth: [
        { label: "Deep", count: 14 },
        { label: "Expanded", count: 9 },
      ],
    },
    14,
  );

  assert.match(badges, /!\[Builds: 23\]/);
  assert.match(badges, /!\[Latest: #23\]/);
  assert.match(badges, /!\[Languages: 14\]/);
  assert.match(badges, /!\[Deep Builds: 14\]/);
});

test("createStatBadges shows 'None yet' for Latest when there is no latest build", () => {
  const badges = createStatBadges(
    { total_builds: 0, latest_build: null, by_depth: [] },
    0,
  );

  assert.match(badges, /!\[Latest: None yet\]/);
});

test("createLatestBuildSpotlight renders a heading and card for the highest build number", () => {
  const lines = createLatestBuildSpotlight([
    { ...SAMPLE_ENTRY, build_number: 16 },
    { ...SAMPLE_ENTRY, build_number: 20, project_name: "Newer Build" },
    { ...SAMPLE_ENTRY, build_number: 5 },
  ]);

  assert.equal(lines[0], "## Latest Build");
  assert.equal(
    lines[1],
    "#### [#20 — Newer Build](builds/020-newer-build.md)",
  );
});

test("createLatestBuildSpotlight returns an empty array when there are no entries", () => {
  assert.deepEqual(createLatestBuildSpotlight([]), []);
});

test("createReadme shows the Latest Build spotlight right after the intro, ahead of any accordion", () => {
  const readme = createReadme([SAMPLE_ENTRY]);
  const spotlightIndex = readme.indexOf("## Latest Build");
  const buildIndexIndex = readme.indexOf("## Build Index");

  assert.notEqual(spotlightIndex, -1, "expected a Latest Build section");
  assert.ok(spotlightIndex < buildIndexIndex, "spotlight should appear before the Build Index accordion");
});

test("createTechCloud renders one badge per distinct technology on a single line", () => {
  const lines = createTechCloud(["Rust", "Kotlin"]);

  assert.equal(lines[0], "## Tech Stack");
  assert.match(lines[1], /!\[Rust\]\(https:\/\/img\.shields\.io\/badge\/Rust-DEA584\)/);
  assert.match(lines[1], /!\[Kotlin\]\(https:\/\/img\.shields\.io\/badge\/Kotlin-A97BFF\)/);
});

test("createTechCloud returns an empty array when there are no technologies", () => {
  assert.deepEqual(createTechCloud([]), []);
});

test("createReadme shows the Tech Stack cloud before the Latest Build spotlight", () => {
  const readme = createReadme([SAMPLE_ENTRY]);
  const techCloudIndex = readme.indexOf("## Tech Stack");
  const spotlightIndex = readme.indexOf("## Latest Build");

  assert.notEqual(techCloudIndex, -1, "expected a Tech Stack section");
  assert.ok(techCloudIndex < spotlightIndex, "tech cloud should appear before the Latest Build spotlight");
});

test("createReadme includes the stat badge row near the top", () => {
  const readme = createReadme([
    {
      build_number: 1,
      date: "2026-06-28",
      project_name: "Solo Build",
      description: "A single build entry.",
      repo_url: "https://github.com/breakingthebot/solo-build",
      technology: "Rust",
      category: "Languages",
      depth: "Deep",
      notes: "",
      stack: ["Rust"],
    },
  ]);

  assert.match(readme, /!\[Builds: 1\]/);
  assert.match(readme, /!\[Latest: #1\]/);
  assert.match(readme, /!\[Languages: 1\]/);
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

test("createReadme includes the CI test badge linked to the Actions workflow", () => {
  const readme = createReadme([]);

  assert.match(
    readme,
    /\[!\[Test\]\(https:\/\/github\.com\/breakingthebot\/286-builds\/actions\/workflows\/test\.yml\/badge\.svg\)\]\(https:\/\/github\.com\/breakingthebot\/286-builds\/actions\/workflows\/test\.yml\)/,
  );
});

test("createSyncNote computes the published repo count instead of using a hardcoded number", () => {
  assert.equal(
    createSyncNote(23),
    "The tracker and README are synced to the 23 public build repos currently published under the `breakingthebot` GitHub account.",
  );
});

test("createReadme's Notes section reflects the actual entry count, not a stale hardcoded one", () => {
  const readme = createReadme([
    {
      build_number: 1,
      date: "2026-06-28",
      project_name: "Solo Build",
      description: "A single build entry.",
      repo_url: "https://github.com/breakingthebot/solo-build",
      technology: "Rust",
      category: "Languages",
      depth: "Standard",
      notes: "",
      stack: ["Rust"],
    },
  ]);

  assert.match(readme, /synced to the 1 public build repos/);
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
