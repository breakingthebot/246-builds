/*
 * src/services/buildRepository.js
 * Handles reading, validating, sorting, and writing build entries in builds.json.
 * Connects to: builds.json, src/models/buildEntry.js
 * Created: 2026-06-28
 */

const fs = require("node:fs");
const path = require("node:path");

const { validateBuildEntry } = require("../models/buildEntry");

/**
 * Resolves the current builds.json file path.
 *
 * @returns {string} The absolute builds.json path.
 */
function getBuildsFilePath() {
  return path.join(process.cwd(), "builds.json");
}

/**
 * Sorts entries by build number in descending order.
 *
 * @param {Array<{build_number: number}>} entries - The entries to sort.
 * @returns {Array<{build_number: number}>} The sorted entries.
 */
function sortEntriesDescending(entries) {
  return [...entries].sort((left, right) => right.build_number - left.build_number);
}

/**
 * Loads and validates all build entries from disk.
 *
 * @returns {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} The sorted entries.
 */
function loadBuildEntries() {
  const rawContents = fs.readFileSync(getBuildsFilePath(), "utf8");
  const parsedEntries = JSON.parse(rawContents);

  if (!Array.isArray(parsedEntries)) {
    throw new Error("builds.json must contain a JSON array.");
  }

  const validatedEntries = parsedEntries.map((entry) => validateBuildEntry(entry));

  return sortEntriesDescending(validatedEntries);
}

/**
 * Saves the provided build entries back to builds.json.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} entries - The entries to persist.
 * @returns {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} The saved entries.
 */
function saveBuildEntries(entries) {
  const validatedEntries = entries.map((entry) => validateBuildEntry(entry));
  const sortedEntries = sortEntriesDescending(validatedEntries);

  fs.writeFileSync(getBuildsFilePath(), `${JSON.stringify(sortedEntries, null, 2)}\n`);

  return sortedEntries;
}

/**
 * Adds one build entry to the repository after checking for duplicates.
 *
 * @param {{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}} entry - The build entry to add.
 * @returns {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}>} The saved entries.
 */
function addBuildEntry(entry) {
  const normalizedEntry = validateBuildEntry(entry);
  const existingEntries = loadBuildEntries();

  if (
    existingEntries.some(
      (existingEntry) => existingEntry.build_number === normalizedEntry.build_number,
    )
  ) {
    throw new Error(
      `Build number ${normalizedEntry.build_number} already exists in builds.json.`,
    );
  }

  return saveBuildEntries([...existingEntries, normalizedEntry]);
}

module.exports = {
  addBuildEntry,
  getBuildsFilePath,
  loadBuildEntries,
  saveBuildEntries,
  sortEntriesDescending,
};
