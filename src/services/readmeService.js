/*
 * src/services/readmeService.js
 * Generates the root README content from builds.json and writes it to disk.
 * Connects to: README.md, src/config/repositoryMetadata.js
 * Created: 2026-06-28
 */

const fs = require("node:fs");
const path = require("node:path");

const { slugifyProjectName } = require("./buildExportService");
const { createBuildStats, groupBy } = require("./buildStatsService");

const {
  ARCHITECTURE_NOTES,
  INTRO_PARAGRAPH,
  NOTES,
  REPOSITORY_TITLE,
  WHATS_IN_EACH_BUILD_REPO,
} = require("../config/repositoryMetadata");

/**
 * Resolves the current README path.
 *
 * @returns {string} The absolute README path.
 */
function getReadmeFilePath() {
  return path.join(process.cwd(), "README.md");
}

const DEPTH_BADGE_COLORS = {
  Standard: "6b7280",
  Expanded: "0284c7",
  Deep: "7c3aed",
};

const TECHNOLOGY_BADGE_COLOR = "334155";
const CATEGORY_BADGE_COLOR = "0f766e";

/**
 * Escapes a badge label for the shields.io static-badge URL scheme
 * (literal dashes must be doubled, spaces become underscores).
 *
 * @param {string} label - The raw label text.
 * @returns {string} The shields.io-safe label.
 */
function encodeBadgeLabel(label) {
  return String(label).replace(/-/g, "--").replace(/ /g, "_");
}

/**
 * Creates a shields.io badge image in markdown.
 *
 * @param {string} label - The badge text.
 * @param {string} color - The hex color, without a leading #.
 * @returns {string} The markdown image badge.
 */
function createBadge(label, color) {
  return `![${label}](https://img.shields.io/badge/${encodeBadgeLabel(label)}-${color})`;
}

/**
 * Creates a shields.io badge image for a build depth label.
 *
 * @param {string} depth - The build depth label.
 * @returns {string} The markdown image badge.
 */
function createDepthBadge(depth) {
  const color = DEPTH_BADGE_COLORS[depth] || DEPTH_BADGE_COLORS.Standard;
  return createBadge(depth, color);
}

/**
 * Creates a single markdown "card" for one build entry: a linked title,
 * technology/category/depth badges, the description, and a repo link.
 * Used instead of table rows throughout the README.
 *
 * @param {{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string}} entry - The build entry to render.
 * @returns {string[]} The markdown lines for this card.
 */
function createBuildCard(entry) {
  const detailPath = `builds/${String(entry.build_number).padStart(3, "0")}-${slugifyProjectName(entry.project_name)}.md`;
  const badges = [
    createBadge(entry.technology, TECHNOLOGY_BADGE_COLOR),
    createBadge(entry.category, CATEGORY_BADGE_COLOR),
    createDepthBadge(entry.depth),
  ].join(" ");

  return [
    `#### [#${entry.build_number} — ${entry.project_name}](${detailPath})`,
    `${badges} · ${entry.date}`,
    "",
    entry.description,
    "",
    `[Repo →](${entry.repo_url})`,
  ];
}

/**
 * Creates a list of build cards separated by horizontal rules.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string}>} entries - The entries to render.
 * @returns {string[]} The markdown lines for the full card list.
 */
function createCardList(entries) {
  return entries
    .map((entry) => createBuildCard(entry))
    .reduce((lines, card, index) => {
      if (index > 0) {
        lines.push("", "---", "");
      }
      return lines.concat(card);
    }, []);
}

/**
 * Builds markdown table rows for simple label/count summaries.
 *
 * @param {Array<{label: string, count: number}>} counts - The grouped counts.
 * @returns {string[]} The markdown lines.
 */
function buildCountTable(counts) {
  if (counts.length === 0) {
    return ["| Label | Count |", "| --- | ---: |", "| None yet | 0 |"];
  }

  return [
    "| Label | Count |",
    "| --- | ---: |",
    ...counts.map((item) => `| ${item.label} | ${item.count} |`),
  ];
}

/**
 * Builds the summary snapshot table for the README top section.
 *
 * @param {{total_builds: number, latest_build: ({build_number: number, date: string, project_name: string}|null), by_depth: Array<{label: string, count: number}>}} stats - The computed build stats.
 * @returns {string[]} The markdown lines.
 */
function buildSnapshotTable(stats) {
  const deepCount =
    stats.by_depth.find((item) => item.label === "Deep")?.count || 0;
  const expandedCount =
    stats.by_depth.find((item) => item.label === "Expanded")?.count || 0;
  const standardCount =
    stats.by_depth.find((item) => item.label === "Standard")?.count || 0;
  const latestBuildLabel = stats.latest_build
    ? `#${stats.latest_build.build_number} ${stats.latest_build.project_name}`
    : "None yet";

  return [
    "| Completed | Latest Build | Deep Builds | Expanded Builds | Standard Builds |",
    "| ---: | --- | ---: | ---: | ---: |",
    `| ${stats.total_builds} | ${latestBuildLabel} | ${deepCount} | ${expandedCount} | ${standardCount} |`,
  ];
}

/**
 * Creates a collapsible <details> accordion wrapping a filtered section's
 * build cards, with a summary line showing the group label and entry count.
 *
 * @param {string} heading - The group label (e.g. a category or technology name).
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string}>} entries - The entries to render inside the accordion.
 * @returns {string[]} The markdown/HTML lines.
 */
function createCollapsibleFilteredSection(heading, entries) {
  return [
    "<details>",
    `<summary>${heading} (${entries.length})</summary>`,
    "",
    ...createCardList(entries),
    "",
    "</details>",
    "",
  ];
}

/**
 * Creates the full README markdown document.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} entries - The entries to render.
 * @returns {string} The full README contents.
 */
function createReadme(entries) {
  const stats = createBuildStats(entries);
  const recentEntries = entries.slice(0, 10);
  const deepEntries = entries.filter((entry) => entry.depth === "Deep");
  const categoryGroups = groupBy(entries, "category");
  const technologyGroups = groupBy(entries, "technology");
  const emptyStateMessage =
    entries.length === 0
      ? "Current tracker state: no rows are marked completed or pushed yet, so the list is intentionally empty."
      : "";
  const buildIndexLines =
    entries.length === 0
      ? [emptyStateMessage, ""]
      : createCollapsibleFilteredSection("All Builds", entries);

  return [
    `# ${REPOSITORY_TITLE}`,
    "",
    INTRO_PARAGRAPH,
    "",
    "## What's in each build's repo",
    ...WHATS_IN_EACH_BUILD_REPO.map((item) => `- ${item}`),
    "",
    "## How This Works",
    "- Each build is its own public GitHub repo.",
    "- This repo is the index for the full 286-build series.",
    "- The index is generated from `builds.json` and kept in sync with the tracker workbook.",
    "- Build dates shown here use the public GitHub push date.",
    "",
    "## Summary",
    ...buildSnapshotTable(stats),
    "",
    "### Jump To",
    "- [Build Index](#build-index)",
    "- [Quick Views](#quick-views)",
    "- [By Category](#by-category)",
    "- [By Technology](#by-technology)",
    "- [Build Pages](#build-pages)",
    "- [CSV Export](exports/builds.csv)",
    "- [Stats JSON](exports/stats.json)",
    "",
    "### Distribution",
    "#### By Category",
    ...buildCountTable(stats.by_category),
    "",
    "#### By Depth",
    ...buildCountTable(stats.by_depth),
    "",
    "#### By Technology",
    ...buildCountTable(stats.by_technology),
    "",
    "## Build Index",
    ...buildIndexLines,
    "## Quick Views",
    ...createCollapsibleFilteredSection("Most Recent 10", recentEntries),
    ...createCollapsibleFilteredSection("Deep Builds", deepEntries),
    "## By Category",
    ...categoryGroups.flatMap((group) =>
      createCollapsibleFilteredSection(group.label, group.entries),
    ),
    "## By Technology",
    ...technologyGroups.flatMap((group) =>
      createCollapsibleFilteredSection(group.label, group.entries),
    ),
    "## Build Pages",
    "Every build also gets a generated detail page under `builds/` for cleaner per-build reading.",
    "",
    "## Stack",
    "- Node.js",
    "- Built-in `node:test` for automation coverage",
    "- JSON as the source of truth for published build entries",
    "- Generated CSV, stats JSON, and per-build markdown pages for secondary views",
    "",
    "## Setup",
    "1. Install Node.js 22 or newer.",
    "2. Clone this repo.",
    "3. Run `npm test` to verify the automation.",
    "",
    "## Environment Variables",
    "No environment variables are required. See `.env.example`.",
    "",
    "## Depth Guide",
    "- `Standard`: solid completion close to the original prompt.",
    "- `Expanded`: clear scope expansion beyond the base prompt.",
    "- `Deep`: larger build depth through extra interfaces, stronger QA, broader feature scope, or deployment polish.",
    "",
    "## Running Locally",
    "Run `npm test`.",
    "Run `npm run generate-readme` to rebuild the README from `builds.json`.",
    "Run `node add-build.js --num <number> --name \"...\" --desc \"...\" --url \"https://github.com/breakingthebot/...\" --tech \"Technology\" --category \"Category\" --date YYYY-MM-DD --depth Deep --notes \"Optional tracker note\"` to add a published build, regenerate the README, and update the tracker workbook in one step.",
    "Run `node release-day.js --num <number> --name \"...\" --desc \"...\" --url \"https://github.com/breakingthebot/...\" --tech \"Technology\" --category \"Category\" --date YYYY-MM-DD --depth Deep --notes \"Optional tracker note\"` to run the full release-day sequence: repo check, add build, regenerate README, update tracker, audit locally, and reconcile GitHub.",
    "Run `npm run audit-builds` to compare `builds.json`, the README table, and the tracker workbook.",
    "Run `npm run sync-github-builds` to compare local build entries against the public GitHub repos under `breakingthebot`.",
    "",
    "## Deployed",
    "This repo is an index repo and does not require a live deployment.",
    "",
    "## Architecture Notes",
    ARCHITECTURE_NOTES,
    "",
    "## Notes",
    ...NOTES.map((note) => `- ${note}`),
    "",
  ]
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .join("\n");
}

/**
 * Writes the generated README to disk.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} entries - The entries to render.
 * @returns {string} The generated README contents.
 */
function writeReadme(entries) {
  const readmeContents = createReadme(entries);
  fs.writeFileSync(getReadmeFilePath(), readmeContents);
  return readmeContents;
}

module.exports = {
  buildCountTable,
  buildSnapshotTable,
  createDepthBadge,
  createBadge,
  createBuildCard,
  createCardList,
  createCollapsibleFilteredSection,
  createReadme,
  getReadmeFilePath,
  writeReadme,
};
