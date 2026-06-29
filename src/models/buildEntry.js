/*
 * src/models/buildEntry.js
 * Validates and normalizes build entry objects before they are written to disk.
 * Connects to: src/services/buildRepository.js, src/utils/cliArgs.js
 * Created: 2026-06-28
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GITHUB_REPO_PATTERN =
  /^https:\/\/github\.com\/breakingthebot\/[A-Za-z0-9._-]+\/?$/;
const DEPTH_VALUES = ["Standard", "Expanded", "Deep"];

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
 * Validates and normalizes the stack array.
 *
 * @param {unknown} stack - The incoming stack value.
 * @returns {string[]} The normalized stack array.
 */
function normalizeStack(stack) {
  if (!Array.isArray(stack) || stack.length === 0) {
    throw new Error("Missing required field: stack.");
  }

  const normalizedStack = stack
    .map((value) => requireString("stack", value))
    .filter(Boolean);

  if (normalizedStack.length === 0) {
    throw new Error("Missing required field: stack.");
  }

  return normalizedStack;
}

/**
 * Resolves the technology/category pair from explicit fields or a legacy stack array.
 *
 * @param {unknown} technology - The incoming technology value.
 * @param {unknown} category - The incoming category value.
 * @param {unknown} stack - The incoming legacy stack value.
 * @returns {{technology: string, category: string, stack: string[]}} The normalized values.
 */
function resolveTechnologyAndCategory(technology, category, stack) {
  const normalizedTechnology =
    typeof technology === "string" && technology.trim() !== ""
      ? technology.trim()
      : "";
  const normalizedCategory =
    typeof category === "string" && category.trim() !== ""
      ? category.trim()
      : "";

  if (normalizedTechnology && normalizedCategory) {
    return {
      technology: normalizedTechnology,
      category: normalizedCategory,
      stack: [normalizedTechnology, normalizedCategory],
    };
  }

  const normalizedStack = normalizeStack(stack);

  if (normalizedStack.length < 2) {
    throw new Error(
      "Build entry must include technology and category, or a stack array with both values.",
    );
  }

  return {
    technology: normalizedTechnology || normalizedStack[0],
    category: normalizedCategory || normalizedStack[1],
    stack: [normalizedTechnology || normalizedStack[0], normalizedCategory || normalizedStack[1]],
  };
}

/**
 * Validates and normalizes the optional depth value.
 *
 * @param {unknown} depth - The incoming depth value.
 * @returns {string} The normalized depth value.
 */
function normalizeDepth(depth) {
  if (depth === undefined || depth === null || depth === "") {
    return "Standard";
  }

  if (typeof depth !== "string" || !DEPTH_VALUES.includes(depth.trim())) {
    throw new Error(`Depth must be one of: ${DEPTH_VALUES.join(", ")}.`);
  }

  return depth.trim();
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
 * Validates and normalizes a build entry object.
 *
 * @param {unknown} entry - The incoming entry object.
 * @returns {{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[], depth: string, notes: string}} The normalized entry.
 */
function validateBuildEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Build entry must be an object.");
  }

  const buildNumber = Number(entry.build_number);

  if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
    throw new Error("Build number must be a positive integer.");
  }

  const date = requireString("date", entry.date);
  const projectName = requireString("project_name", entry.project_name);
  const description = requireString("description", entry.description);
  const repoUrl = requireString("repo_url", entry.repo_url);
  const { technology, category, stack } = resolveTechnologyAndCategory(
    entry.technology,
    entry.category,
    entry.stack,
  );
  const depth = normalizeDepth(entry.depth);
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
    build_number: buildNumber,
    date,
    project_name: projectName,
    description,
    repo_url: repoUrl.replace(/\/$/, ""),
    technology,
    category,
    stack,
    depth,
    notes,
  };
}

module.exports = {
  DEPTH_VALUES,
  normalizeDepth,
  normalizeNotes,
  resolveTechnologyAndCategory,
  validateBuildEntry,
};
