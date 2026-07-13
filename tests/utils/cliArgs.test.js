/*
 * tests/utils/cliArgs.test.js
 * Verifies CLI parsing for required flags, stack parsing, and date defaults.
 * Connects to: src/utils/cliArgs.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseAddBuildArgs,
  parseAddSideProjectArgs,
  parseFlagMap,
  parseReleaseDayArgs,
  resolveCliClassification,
  parseStack,
} = require("../../src/utils/cliArgs");

test("parseStack splits comma-delimited stack values", () => {
  assert.deepEqual(parseStack("Python, asyncio, CLI"), [
    "Python",
    "asyncio",
    "CLI",
  ]);
});

test("resolveCliClassification supports explicit technology and category flags", () => {
  assert.deepEqual(
    resolveCliClassification({ tech: "Rust", category: "Languages" }),
    {
      technology: "Rust",
      category: "Languages",
    },
  );
});

test("parseFlagMap fails on missing values", () => {
  assert.throws(() => parseFlagMap(["--num"]), /Missing value/);
});

test("parseAddBuildArgs validates the add-build command", () => {
  const parsedArgs = parseAddBuildArgs([
    "--num",
    "16",
    "--name",
    "File Duplicate Finder",
    "--desc",
    "Find duplicate files by hash.",
    "--url",
    "https://github.com/breakingthebot/file-duplicate-finder",
    "--tech",
    "Rust",
    "--category",
    "Languages",
    "--date",
    "2026-06-28",
    "--depth",
    "Deep",
    "--notes",
    "Live demo included.",
  ]);

  assert.deepEqual(parsedArgs, {
    buildEntry: {
      build_number: 16,
      date: "2026-06-28",
      project_name: "File Duplicate Finder",
      description: "Find duplicate files by hash.",
      repo_url: "https://github.com/breakingthebot/file-duplicate-finder",
      technology: "Rust",
      category: "Languages",
      stack: ["Rust", "Languages"],
      depth: "Deep",
      notes: "Live demo included.",
    },
    tracker: {
      depth: "Deep",
      notes: "Live demo included.",
    },
  });
});

test("parseAddBuildArgs defaults the date when it is omitted", () => {
  const parsedArgs = parseAddBuildArgs([
    "--num",
    "17",
    "--name",
    "Log File Analyzer",
    "--desc",
    "Summarizes request counts from logs.",
    "--url",
    "https://github.com/breakingthebot/log-file-analyzer",
    "--tech",
    "Ruby",
    "--category",
    "Languages",
  ]);

  assert.match(parsedArgs.buildEntry.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("parseAddBuildArgs rejects unsupported depth values", () => {
  assert.throws(
    () =>
      parseAddBuildArgs([
        "--num",
        "18",
        "--name",
        "Library Catalog",
        "--desc",
        "Catalogs books.",
        "--url",
        "https://github.com/breakingthebot/library-catalog",
        "--tech",
        "Java",
        "--category",
        "Languages",
        "--depth",
        "Huge",
      ]),
    /Depth must be one of/,
  );
});

test("parseReleaseDayArgs parses owner and skip-github flags", () => {
  const parsedArgs = parseReleaseDayArgs([
    "--num",
    "17",
    "--name",
    "Log File Analyzer",
    "--desc",
    "Summarizes request counts from logs.",
    "--url",
    "https://github.com/breakingthebot/log-file-analyzer",
    "--tech",
    "Ruby",
    "--category",
    "Languages",
    "--owner",
    "breakingthebot",
    "--skip-github",
  ]);

  assert.equal(parsedArgs.owner, "breakingthebot");
  assert.equal(parsedArgs.skipGitHub, true);
  assert.equal(parsedArgs.buildPayload.buildEntry.build_number, 17);
});

test("parseAddSideProjectArgs validates the add-side-project command", () => {
  const parsedEntry = parseAddSideProjectArgs([
    "--name",
    "Shift Closer",
    "--desc",
    "Logs out of work platforms and emails a shift summary.",
    "--url",
    "https://github.com/breakingthebot/shift-closer",
    "--tech",
    "Python",
    "--date",
    "2026-07-13",
    "--notes",
    "GCP Cloud Run Function.",
  ]);

  assert.deepEqual(parsedEntry, {
    name: "Shift Closer",
    date: "2026-07-13",
    description: "Logs out of work platforms and emails a shift summary.",
    repo_url: "https://github.com/breakingthebot/shift-closer",
    technology: "Python",
    notes: "GCP Cloud Run Function.",
  });
});

test("parseAddSideProjectArgs defaults the date when it is omitted", () => {
  const parsedEntry = parseAddSideProjectArgs([
    "--name",
    "Shift Closer",
    "--desc",
    "Logs out of work platforms and emails a shift summary.",
    "--url",
    "https://github.com/breakingthebot/shift-closer",
    "--tech",
    "Python",
  ]);

  assert.match(parsedEntry.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(parsedEntry.notes, "");
});

test("parseAddSideProjectArgs requires name, desc, url, and tech", () => {
  assert.throws(
    () =>
      parseAddSideProjectArgs([
        "--name",
        "Shift Closer",
        "--desc",
        "Logs out of work platforms and emails a shift summary.",
        "--url",
        "https://github.com/breakingthebot/shift-closer",
      ]),
    /Missing required flag: --tech/,
  );
});
