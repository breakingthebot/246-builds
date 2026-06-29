/*
 * src/services/buildExportService.js
 * Writes secondary generated artifacts such as CSV exports, stats JSON, and per-build detail pages.
 * Connects to: exports/, builds/, builds.json
 * Created: 2026-06-29
 */

const fs = require("node:fs");
const path = require("node:path");

const { createBuildStats } = require("./buildStatsService");

/**
 * Resolves the generated exports directory.
 *
 * @returns {string} The absolute exports directory path.
 */
function getExportsDirectoryPath() {
  return path.join(process.cwd(), "exports");
}

/**
 * Resolves the per-build detail directory.
 *
 * @returns {string} The absolute build detail directory path.
 */
function getBuildDetailsDirectoryPath() {
  return path.join(process.cwd(), "builds");
}

/**
 * Creates a filesystem-safe slug for a build detail filename.
 *
 * @param {string} projectName - The project name.
 * @returns {string} The generated slug.
 */
function slugifyProjectName(projectName) {
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Escapes CSV values when needed.
 *
 * @param {string | number} value - The incoming value.
 * @returns {string} The escaped CSV field.
 */
function escapeCsvValue(value) {
  const normalizedValue = String(value ?? "");

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
}

/**
 * Creates the CSV export contents for all build entries.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string, notes: string}>} entries - The build entries.
 * @returns {string} The CSV contents.
 */
function createBuildCsv(entries) {
  const header = [
    "build_number",
    "date",
    "project_name",
    "description",
    "repo_url",
    "technology",
    "category",
    "depth",
    "notes",
  ];
  const rows = entries.map((entry) =>
    [
      entry.build_number,
      entry.date,
      entry.project_name,
      entry.description,
      entry.repo_url,
      entry.technology,
      entry.category,
      entry.depth,
      entry.notes,
    ]
      .map((value) => escapeCsvValue(value))
      .join(","),
  );

  return [header.join(","), ...rows, ""].join("\n");
}

/**
 * Creates the markdown content for a per-build detail page.
 *
 * @param {{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string, notes: string}} entry - The build entry.
 * @returns {string} The markdown content.
 */
function createBuildDetailPage(entry) {
  const notesLine =
    entry.notes && entry.notes.trim() !== ""
      ? entry.notes
      : "No extra build notes recorded yet.";

  return [
    `# Build ${entry.build_number}: ${entry.project_name}`,
    "",
    entry.description,
    "",
    "## Snapshot",
    `- Date Pushed: ${entry.date}`,
    `- Technology: ${entry.technology}`,
    `- Category: ${entry.category}`,
    `- Depth: ${entry.depth}`,
    `- Repo: ${entry.repo_url}`,
    "",
    "## Notes",
    notesLine,
    "",
  ].join("\n");
}

/**
 * Writes all generated secondary artifacts.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string, notes: string}>} entries - The build entries.
 * @returns {{csv_path: string, stats_path: string, detail_pages: string[]}} The written artifact paths.
 */
function writeBuildArtifacts(entries) {
  const exportsDirectoryPath = getExportsDirectoryPath();
  const buildDetailsDirectoryPath = getBuildDetailsDirectoryPath();

  fs.mkdirSync(exportsDirectoryPath, { recursive: true });
  fs.mkdirSync(buildDetailsDirectoryPath, { recursive: true });

  const csvPath = path.join(exportsDirectoryPath, "builds.csv");
  const statsPath = path.join(exportsDirectoryPath, "stats.json");

  fs.writeFileSync(csvPath, createBuildCsv(entries));
  fs.writeFileSync(
    statsPath,
    `${JSON.stringify(createBuildStats(entries), null, 2)}\n`,
  );

  const detailPages = entries.map((entry) => {
    const filename = `${String(entry.build_number).padStart(3, "0")}-${slugifyProjectName(entry.project_name)}.md`;
    const filePath = path.join(buildDetailsDirectoryPath, filename);
    fs.writeFileSync(filePath, createBuildDetailPage(entry));
    return filePath;
  });

  return {
    csv_path: csvPath,
    stats_path: statsPath,
    detail_pages: detailPages,
  };
}

module.exports = {
  createBuildCsv,
  createBuildDetailPage,
  getBuildDetailsDirectoryPath,
  getExportsDirectoryPath,
  slugifyProjectName,
  writeBuildArtifacts,
};
