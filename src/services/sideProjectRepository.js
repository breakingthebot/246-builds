/*
 * src/services/sideProjectRepository.js
 * Handles reading, validating, sorting, and writing side-project entries in
 * side-projects.json. Mirrors buildRepository.js's shape, but side projects
 * sort by date (newest first) since there's no build_number to sort by, and
 * the file is optional -- an absent side-projects.json just means no side
 * projects yet, not an error.
 * Connects to: side-projects.json, src/models/sideProject.js
 * Created: 2026-07-13
 */

const fs = require("node:fs");
const path = require("node:path");

const { validateSideProject } = require("../models/sideProject");

/**
 * Resolves the current side-projects.json file path.
 *
 * @returns {string} The absolute side-projects.json path.
 */
function getSideProjectsFilePath() {
  return path.join(process.cwd(), "side-projects.json");
}

/**
 * Sorts entries by date descending, newest first.
 *
 * @param {Array<{date: string}>} entries - The entries to sort.
 * @returns {Array<{date: string}>} The sorted entries.
 */
function sortEntriesDescending(entries) {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}

/**
 * Loads and validates all side-project entries from disk. Returns an empty
 * array if side-projects.json doesn't exist yet.
 *
 * @returns {Array<{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}>} The sorted entries.
 */
function loadSideProjectEntries() {
  const filePath = getSideProjectsFilePath();

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const rawContents = fs.readFileSync(filePath, "utf8");
  const parsedEntries = JSON.parse(rawContents);

  if (!Array.isArray(parsedEntries)) {
    throw new Error("side-projects.json must contain a JSON array.");
  }

  const validatedEntries = parsedEntries.map((entry) => validateSideProject(entry));

  return sortEntriesDescending(validatedEntries);
}

/**
 * Saves the provided side-project entries back to side-projects.json.
 *
 * @param {Array<{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}>} entries - The entries to persist.
 * @returns {Array<{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}>} The saved entries.
 */
function saveSideProjectEntries(entries) {
  const validatedEntries = entries.map((entry) => validateSideProject(entry));
  const sortedEntries = sortEntriesDescending(validatedEntries);

  fs.writeFileSync(
    getSideProjectsFilePath(),
    `${JSON.stringify(sortedEntries, null, 2)}\n`,
  );

  return sortedEntries;
}

/**
 * Adds one side-project entry after checking for a duplicate repo_url.
 *
 * @param {{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}} entry - The entry to add.
 * @returns {Array<{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}>} The saved entries.
 */
function addSideProjectEntry(entry) {
  const normalizedEntry = validateSideProject(entry);
  const existingEntries = loadSideProjectEntries();

  if (
    existingEntries.some(
      (existingEntry) => existingEntry.repo_url === normalizedEntry.repo_url,
    )
  ) {
    throw new Error(
      `Side project with repo_url ${normalizedEntry.repo_url} already exists.`,
    );
  }

  return saveSideProjectEntries([...existingEntries, normalizedEntry]);
}

module.exports = {
  addSideProjectEntry,
  getSideProjectsFilePath,
  loadSideProjectEntries,
  saveSideProjectEntries,
  sortEntriesDescending,
};
