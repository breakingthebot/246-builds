/*
 * src/models/sideProject.js
 * Validates and normalizes side-project entry objects before they are
 * written to disk. Side projects are informal, non-numbered items -- unlike
 * the strict numbered build_number series in buildEntry.js, they don't get
 * a sequence number, tracker workbook sync, or GitHub-sync audit membership.
 * Connects to: src/services/sideProjectRepository.js, add-side-project.js
 * Created: 2026-07-13
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GITHUB_REPO_PATTERN =
  /^https:\/\/github\.com\/breakingthebot\/[A-Za-z0-9._-]+\/?$/;

/**
 * Validates that a value is a non-empty string.
 *
 * @param {string} fieldName - The field being checked.
 * @param {unknown} value - The incoming value.
 * @returns {string} The normalized string value.
 */
function requireString(fieldName, value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${fieldName}.`);
  }

  return value.trim();
}

/**
 * Validates and normalizes the optional notes value.
 *
 * @param {unknown} notes - The incoming notes value.
 * @returns {string} The normalized notes value.
 */
function normalizeNotes(notes) {
  if (notes === undefined || notes === null) {
    return "";
  }

  if (typeof notes !== "string") {
    throw new Error("Notes must be a string.");
  }

  return notes.trim();
}

/**
 * Validates and normalizes a side-project entry object.
 *
 * @param {unknown} entry - The incoming entry object.
 * @returns {{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}} The normalized entry.
 */
function validateSideProject(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Side project entry must be an object.");
  }

  const name = requireString("name", entry.name);
  const date = requireString("date", entry.date);
  const description = requireString("description", entry.description);
  const repoUrl = requireString("repo_url", entry.repo_url);
  const technology = requireString("technology", entry.technology);
  const notes = normalizeNotes(entry.notes);

  if (!ISO_DATE_PATTERN.test(date)) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  if (!GITHUB_REPO_PATTERN.test(repoUrl)) {
    throw new Error(
      "GitHub URL must match https://github.com/breakingthebot/<repo-name>.",
    );
  }

  return {
    name,
    date,
    description,
    repo_url: repoUrl.replace(/\/$/, ""),
    technology,
    notes,
  };
}

module.exports = {
  validateSideProject,
};
