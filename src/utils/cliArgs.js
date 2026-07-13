/*
 * src/utils/cliArgs.js
 * Parses and validates CLI flags for adding new build entries.
 * Connects to: add-build.js, src/models/buildEntry.js
 * Created: 2026-06-28
 */

const { validateBuildEntry } = require("../models/buildEntry");
const { validateSideProject } = require("../models/sideProject");

const { DEPTH_VALUES } = require("../models/buildEntry");
const REQUIRED_FLAGS = ["num", "name", "desc", "url"];
const SIDE_PROJECT_REQUIRED_FLAGS = ["name", "desc", "url", "tech"];

/**
 * Returns the current local date in YYYY-MM-DD format.
 *
 * @returns {string} The current local date.
 */
function getCurrentDate() {
  return new Date().toLocaleDateString("en-CA");
}

/**
 * Splits a comma-delimited stack string into an array.
 *
 * @param {string} stackValue - The raw stack string.
 * @returns {string[]} The normalized stack array.
 */
function parseStack(stackValue) {
  return stackValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Resolves the technology/category pair from explicit flags or a legacy --stack flag.
 *
 * @param {Record<string, string>} flags - The parsed CLI flags.
 * @returns {{technology: string, category: string}} The normalized values.
 */
function resolveCliClassification(flags) {
  if (flags.tech && flags.category) {
    return {
      technology: flags.tech.trim(),
      category: flags.category.trim(),
    };
  }

  if (flags.stack) {
    const legacyStack = parseStack(flags.stack);

    if (legacyStack.length < 2) {
      throw new Error(
        "Legacy --stack input must include both technology and category values.",
      );
    }

    return {
      technology: legacyStack[0],
      category: legacyStack[1],
    };
  }

  throw new Error(
    "Provide either --tech and --category, or legacy --stack with both values.",
  );
}

/**
 * Parses argv style flags into a map.
 *
 * @param {string[]} argv - The raw CLI arguments.
 * @returns {Record<string, string>} The parsed flag map.
 */
function parseFlagMap(argv) {
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}. Use --flag value pairs.`);
    }

    const flagName = token.slice(2);
    const nextValue = argv[index + 1];

    if (!flagName) {
      throw new Error("Encountered an empty flag name.");
    }

    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for --${flagName}.`);
    }

    flags[flagName] = nextValue;
    index += 1;
  }

  return flags;
}

/**
 * Parses and validates add-build CLI arguments.
 *
 * @param {string[]} argv - The raw CLI arguments.
 * @returns {{build_number: number, date: string, project_name: string, description: string, repo_url: string, stack: string[]}} The normalized build entry.
 */
function parseAddBuildArgs(argv) {
  const flags = parseFlagMap(argv);

  for (const requiredFlag of REQUIRED_FLAGS) {
    if (!flags[requiredFlag]) {
      throw new Error(`Missing required flag: --${requiredFlag}.`);
    }
  }

  const { technology, category } = resolveCliClassification(flags);

  const buildEntry = validateBuildEntry({
    build_number: Number(flags.num),
    date: flags.date || getCurrentDate(),
    project_name: flags.name,
    description: flags.desc,
    repo_url: flags.url,
    technology,
    category,
    depth: flags.depth || "Standard",
    notes: flags.notes || "",
  });

  if (
    flags.depth &&
    !DEPTH_VALUES.includes(flags.depth.trim())
  ) {
    throw new Error(
      `Depth must be one of: ${DEPTH_VALUES.join(", ")}.`,
    );
  }

  return {
    buildEntry,
    tracker: {
      depth: flags.depth ? flags.depth.trim() : "",
      notes: flags.notes ? flags.notes.trim() : "",
    },
  };
}

/**
 * Parses and validates add-side-project CLI arguments. Unlike
 * parseAddBuildArgs, there's no build_number, depth, or tracker payload --
 * side projects are lighter-weight, non-numbered entries.
 *
 * @param {string[]} argv - The raw CLI arguments.
 * @returns {{name: string, date: string, description: string, repo_url: string, technology: string, notes: string}} The normalized side-project entry.
 */
function parseAddSideProjectArgs(argv) {
  const flags = parseFlagMap(argv);

  for (const requiredFlag of SIDE_PROJECT_REQUIRED_FLAGS) {
    if (!flags[requiredFlag]) {
      throw new Error(`Missing required flag: --${requiredFlag}.`);
    }
  }

  return validateSideProject({
    name: flags.name,
    date: flags.date || getCurrentDate(),
    description: flags.desc,
    repo_url: flags.url,
    technology: flags.tech,
    notes: flags.notes || "",
  });
}

/**
 * Parses the release-day wrapper flags.
 *
 * @param {string[]} argv - The raw CLI arguments.
 * @returns {{ buildPayload: {buildEntry: {build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}, tracker: {depth: string, notes: string}}, owner: string, skipGitHub: boolean }} The parsed release-day options.
 */
function parseReleaseDayArgs(argv) {
  const ownerFlagIndex = argv.indexOf("--owner");
  const skipGitHub = argv.includes("--skip-github");
  const filteredArgs = argv.filter((token, index) => {
    if (token === "--skip-github") {
      return false;
    }

    if (token === "--owner") {
      return false;
    }

    if (ownerFlagIndex !== -1 && index === ownerFlagIndex + 1) {
      return false;
    }

    return true;
  });

  let owner = "breakingthebot";

  if (ownerFlagIndex !== -1) {
    owner = argv[ownerFlagIndex + 1];

    if (!owner || owner.startsWith("--")) {
      throw new Error("Missing value for --owner.");
    }
  }

  return {
    buildPayload: parseAddBuildArgs(filteredArgs),
    owner,
    skipGitHub,
  };
}

module.exports = {
  DEPTH_VALUES,
  REQUIRED_FLAGS,
  SIDE_PROJECT_REQUIRED_FLAGS,
  getCurrentDate,
  parseAddBuildArgs,
  parseAddSideProjectArgs,
  parseFlagMap,
  parseReleaseDayArgs,
  resolveCliClassification,
  parseStack,
};
