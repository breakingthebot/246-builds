/*
 * src/services/readmeService.js
 * Generates the root README content from builds.json (and, for the Side
 * Projects section, side-projects.json) and writes it to disk.
 * Connects to: README.md, src/config/repositoryMetadata.js, src/services/sideProjectRepository.js
 * Created: 2026-06-28
 */

const fs = require("node:fs");
const path = require("node:path");

const { slugifyProjectName } = require("./buildExportService");
const { createBuildStats, findLatestEntry, groupBy } = require("./buildStatsService");
const { loadSideProjectEntries } = require("./sideProjectRepository");

const {
  ARCHITECTURE_NOTES,
  INTRO_PARAGRAPH,
  STATIC_NOTES,
  REPOSITORY_TITLE,
  WHATS_IN_EACH_BUILD_REPO,
} = require("../config/repositoryMetadata");

const {
  CATEGORY_BADGE_COLORS,
  DEFAULT_CATEGORY_BADGE_COLOR,
  DEFAULT_TECHNOLOGY_BADGE_COLOR,
  DEPTH_BADGE_COLORS,
  PYTHON_BADGE_COLOR,
  TECHNOLOGY_BADGE_COLORS,
} = require("../config/badgeColors");

/**
 * Resolves the current README path.
 *
 * @returns {string} The absolute README path.
 */
function getReadmeFilePath() {
  return path.join(process.cwd(), "README.md");
}

/**
 * Resolves the badge color for a category label: an exact match against
 * known categories, or a neutral default for anything not yet mapped.
 *
 * @param {string} category - The category label.
 * @returns {string} The hex color, without a leading #.
 */
function resolveCategoryBadgeColor(category) {
  return CATEGORY_BADGE_COLORS[category] || DEFAULT_CATEGORY_BADGE_COLOR;
}

/**
 * Resolves the badge color for a technology label: an exact match against
 * known languages, a family fallback for "Python (...)" variants, or a
 * neutral default for anything not yet mapped.
 *
 * @param {string} technology - The technology label.
 * @returns {string} The hex color, without a leading #.
 */
function resolveTechnologyBadgeColor(technology) {
  if (TECHNOLOGY_BADGE_COLORS[technology]) {
    return TECHNOLOGY_BADGE_COLORS[technology];
  }

  if (technology.startsWith("Python")) {
    return PYTHON_BADGE_COLOR;
  }

  return DEFAULT_TECHNOLOGY_BADGE_COLOR;
}

/**
 * Escapes a badge label for the shields.io static-badge URL scheme: literal
 * dashes/underscores are doubled, spaces become underscores, and anything
 * else unsafe in a URL path (e.g. "#", parentheses) is percent-encoded so
 * it can't be misread as a URL fragment or break the request.
 *
 * @param {string} label - The raw label text.
 * @returns {string} The shields.io-safe, URL-safe label.
 */
function encodeBadgeLabel(label) {
  const shieldsEscaped = String(label)
    .replace(/-/g, "--")
    .replace(/_/g, "__")
    .replace(/ /g, "_");
  return encodeURIComponent(shieldsEscaped);
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
 * Creates a two-segment shields.io badge image (a label plus a separate
 * message), e.g. "Builds: 23".
 *
 * @param {string} label - The badge's left-hand label text.
 * @param {string} message - The badge's right-hand message text.
 * @param {string} color - The hex color, without a leading #.
 * @returns {string} The markdown image badge.
 */
function createLabeledBadge(label, message, color) {
  const path = `${encodeBadgeLabel(label)}-${encodeBadgeLabel(message)}-${color}`;
  return `![${label}: ${message}](https://img.shields.io/badge/${path})`;
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
    createBadge(entry.technology, resolveTechnologyBadgeColor(entry.technology)),
    createBadge(entry.category, resolveCategoryBadgeColor(entry.category)),
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

const STAT_BADGE_COLORS = {
  builds: "0ea5e9",
  latest: "16a34a",
  languages: "f59e0b",
  deep: "7c3aed",
};

/**
 * Creates a one-line row of headline stat badges (Builds, Latest,
 * Languages, Deep Builds) for the top of the README, ahead of the
 * more detailed Summary table further down.
 *
 * @param {{total_builds: number, latest_build: ({build_number: number}|null), by_depth: Array<{label: string, count: number}>}} stats - The computed build stats.
 * @param {number} languageCount - The number of distinct technologies used.
 * @returns {string} The markdown line of badges.
 */
function createStatBadges(stats, languageCount) {
  const deepCount =
    stats.by_depth.find((item) => item.label === "Deep")?.count || 0;
  const latestLabel = stats.latest_build
    ? `#${stats.latest_build.build_number}`
    : "None yet";

  return [
    createLabeledBadge("Builds", String(stats.total_builds), STAT_BADGE_COLORS.builds),
    createLabeledBadge("Latest", latestLabel, STAT_BADGE_COLORS.latest),
    createLabeledBadge("Languages", String(languageCount), STAT_BADGE_COLORS.languages),
    createLabeledBadge("Deep Builds", String(deepCount), STAT_BADGE_COLORS.deep),
  ].join(" ");
}

/**
 * Creates the note describing how many public build repos are currently
 * synced, computed from the real entry count so it can't go stale the way
 * a hardcoded number would as builds get added.
 *
 * @param {number} entryCount - The number of published build entries.
 * @returns {string} The sync note text.
 */
function createSyncNote(entryCount) {
  return `The tracker and README are synced to the ${entryCount} public build repos currently published under the \`breakingthebot\` GitHub account.`;
}

/**
 * Creates an always-visible spotlight section for the single most recent
 * build, so it's seen without expanding any accordion. Returns an empty
 * array when there are no entries yet.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string}>} entries - The entries to consider.
 * @returns {string[]} The markdown lines, or an empty array if there are no entries.
 */
function createLatestBuildSpotlight(entries) {
  const latestEntry = findLatestEntry(entries);

  if (!latestEntry) {
    return [];
  }

  return ["## Latest Build", ...createBuildCard(latestEntry), ""];
}

/**
 * Creates a single markdown "card" for one side-project entry: a linked
 * title (straight to the repo -- side projects don't get a generated
 * builds/*.md detail page), a technology badge, the description, and a
 * repo link. No depth badge (side projects aren't rated Standard/Expanded/
 * Deep) and no build_number (they're not part of the numbered series).
 *
 * @param {{name: string, date: string, description: string, repo_url: string, technology: string}} entry - The side-project entry to render.
 * @returns {string[]} The markdown lines for this card.
 */
function createSideProjectCard(entry) {
  const badge = createBadge(entry.technology, resolveTechnologyBadgeColor(entry.technology));

  return [
    `#### [${entry.name}](${entry.repo_url})`,
    `${badge} · ${entry.date}`,
    "",
    entry.description,
    "",
    `[Repo →](${entry.repo_url})`,
  ];
}

/**
 * Creates the "## Side Projects" section: exploratory or practice builds
 * that aren't part of the numbered 286-build series (no build_number, not
 * tracked in the GitHub-sync audit). Returns an empty array when there are
 * none yet, so the section doesn't appear with nothing in it.
 *
 * @param {Array<{name: string, date: string, description: string, repo_url: string, technology: string}>} sideProjectEntries - The side-project entries to render.
 * @returns {string[]} The markdown lines, or an empty array if there are none.
 */
function createSideProjectsSection(sideProjectEntries) {
  if (sideProjectEntries.length === 0) {
    return [];
  }

  const cards = sideProjectEntries
    .map((entry) => createSideProjectCard(entry))
    .reduce((lines, card, index) => {
      if (index > 0) {
        lines.push("", "---", "");
      }
      return lines.concat(card);
    }, []);

  return [
    "## Side Projects",
    "Exploratory or practice builds outside the numbered 246-build series -- not tracked in the build index, tracker workbook, or GitHub-sync audit above.",
    "",
    ...cards,
    "",
  ];
}

/**
 * Creates a one-line "tech cloud" of every distinct technology badge used
 * across all builds, for an instant breadth-of-skills impression before
 * scrolling down to the Build Index. Returns an empty array when there are
 * no technologies yet.
 *
 * @param {string[]} technologyLabels - The distinct technology labels.
 * @returns {string[]} The markdown lines, or an empty array if there are none.
 */
function createTechCloud(technologyLabels) {
  if (technologyLabels.length === 0) {
    return [];
  }

  const badges = technologyLabels
    .map((label) => createBadge(label, resolveTechnologyBadgeColor(label)))
    .join(" ");

  return ["## Tech Stack", badges, ""];
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
 * @param {Array<{name: string, date: string, description: string, repo_url: string, technology: string}>} [sideProjectEntries] - Optional side-project entries to render in their own section.
 * @returns {string} The full README contents.
 */
function createReadme(entries, sideProjectEntries = []) {
  const stats = createBuildStats(entries);
  const recentEntries = entries.slice(0, 10);
  const deepEntries = entries.filter((entry) => entry.depth === "Deep");
  const categoryGroups = groupBy(entries, "category");
  const technologyGroups = groupBy(entries, "technology");
  const statBadges = createStatBadges(stats, technologyGroups.length);
  const emptyStateMessage =
    entries.length === 0
      ? "Current tracker state: no rows are marked completed or pushed yet, so the list is intentionally empty."
      : "";
  const buildIndexLines =
    entries.length === 0
      ? [emptyStateMessage, ""]
      : createCollapsibleFilteredSection("All Builds", entries);
  const latestBuildSpotlight = createLatestBuildSpotlight(entries);
  const techCloud = createTechCloud(technologyGroups.map((group) => group.label));
  const sideProjectsSection = createSideProjectsSection(sideProjectEntries);

  return [
    `# ${REPOSITORY_TITLE}`,
    "",
    "[![Test](https://github.com/breakingthebot/246-builds/actions/workflows/test.yml/badge.svg)](https://github.com/breakingthebot/246-builds/actions/workflows/test.yml)",
    "",
    statBadges,
    "",
    "**[Browse & filter every build on the live site →](https://breakingthebot.github.io/246-builds/)**",
    "",
    INTRO_PARAGRAPH,
    "",
    ...techCloud,
    ...latestBuildSpotlight,
    "## What's in each build's repo",
    ...WHATS_IN_EACH_BUILD_REPO.map((item) => `- ${item}`),
    "",
    "## How This Works",
    "- Each build is its own public GitHub repo.",
    "- This repo is the index for the full 246-build series.",
    "- The index is generated from `builds.json` and kept in sync with the tracker workbook.",
    "- Build dates shown here use the public GitHub push date.",
    "",
    "### Jump To",
    "- [Build Index](#build-index)",
    "- [Quick Views](#quick-views)",
    "- [By Category](#by-category)",
    "- [By Technology](#by-technology)",
    "- [Build Pages](#build-pages)",
    "- [Side Projects](#side-projects)",
    "- [CSV Export](exports/builds.csv)",
    "- [Stats JSON](exports/stats.json)",
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
    ...sideProjectsSection,
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
    `- ${createSyncNote(entries.length)}`,
    ...STATIC_NOTES.map((note) => `- ${note}`),
    "",
  ]
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .join("\n");
}

/**
 * Writes the generated README to disk. Side-project entries are loaded
 * internally (from side-projects.json, if present) so every existing
 * caller -- add-build.js, generate-readme.js, releaseDayService.js --
 * automatically includes the Side Projects section without needing to
 * change their own call sites.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} entries - The entries to render.
 * @returns {string} The generated README contents.
 */
function writeReadme(entries) {
  const sideProjectEntries = loadSideProjectEntries();
  const readmeContents = createReadme(entries, sideProjectEntries);
  fs.writeFileSync(getReadmeFilePath(), readmeContents);
  return readmeContents;
}

module.exports = {
  createDepthBadge,
  createBadge,
  createLabeledBadge,
  createBuildCard,
  createCardList,
  createCollapsibleFilteredSection,
  createLatestBuildSpotlight,
  createSideProjectCard,
  createSideProjectsSection,
  createStatBadges,
  createSyncNote,
  createTechCloud,
  createReadme,
  getReadmeFilePath,
  resolveCategoryBadgeColor,
  resolveTechnologyBadgeColor,
  writeReadme,
};
