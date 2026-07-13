/*
 * tests/services/sideProjectRepository.test.js
 * Verifies side-projects.json repository behavior: sorting, validation,
 * duplicate checks, and the missing-file default of an empty array.
 * Connects to: src/services/sideProjectRepository.js
 * Created: 2026-07-13
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  addSideProjectEntry,
  loadSideProjectEntries,
  saveSideProjectEntries,
  sortEntriesDescending,
} = require("../../src/services/sideProjectRepository");

/**
 * Creates a temporary workspace (with no side-projects.json by default) and
 * runs the supplied test callback inside it.
 *
 * @param {(workspacePath: string) => void} callback - The test callback.
 * @returns {void}
 */
function withTempWorkspace(callback) {
  const originalCwd = process.cwd();
  const workspacePath = fs.mkdtempSync(path.join(os.tmpdir(), "side-project-repo-test-"));

  process.chdir(workspacePath);

  try {
    callback(workspacePath);
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}

test("sortEntriesDescending orders side projects newest first", () => {
  const sortedEntries = sortEntriesDescending([
    { date: "2026-07-01" },
    { date: "2026-07-13" },
    { date: "2026-06-15" },
  ]);

  assert.deepEqual(
    sortedEntries.map((entry) => entry.date),
    ["2026-07-13", "2026-07-01", "2026-06-15"],
  );
});

test("loadSideProjectEntries returns an empty array when side-projects.json doesn't exist", () => {
  withTempWorkspace(() => {
    assert.deepEqual(loadSideProjectEntries(), []);
  });
});

test("saveSideProjectEntries writes validated sorted entries", () => {
  withTempWorkspace(() => {
    const savedEntries = saveSideProjectEntries([
      {
        name: "Shift Closer",
        date: "2026-07-13",
        description: "Logs out of work platforms and emails a shift summary.",
        repo_url: "https://github.com/breakingthebot/shift-closer",
        technology: "Python",
        notes: "GCP Cloud Run Function.",
      },
      {
        name: "Earlier Project",
        date: "2026-07-01",
        description: "An earlier side project.",
        repo_url: "https://github.com/breakingthebot/earlier-project",
        technology: "Node.js",
      },
    ]);

    assert.equal(savedEntries[0].name, "Shift Closer");

    const fileContents = fs.readFileSync(
      path.join(process.cwd(), "side-projects.json"),
      "utf8",
    );
    assert.match(fileContents, /"name": "Shift Closer"/);
  });
});

test("saveSideProjectEntries defaults notes to an empty string", () => {
  withTempWorkspace(() => {
    const savedEntries = saveSideProjectEntries([
      {
        name: "No Notes Project",
        date: "2026-07-13",
        description: "A project without notes.",
        repo_url: "https://github.com/breakingthebot/no-notes-project",
        technology: "Go",
      },
    ]);

    assert.equal(savedEntries[0].notes, "");
  });
});

test("loadSideProjectEntries returns sorted validated entries", () => {
  withTempWorkspace(() => {
    fs.writeFileSync(
      path.join(process.cwd(), "side-projects.json"),
      `${JSON.stringify(
        [
          {
            name: "Older",
            date: "2026-06-01",
            description: "Older project.",
            repo_url: "https://github.com/breakingthebot/older-project",
            technology: "Rust",
          },
          {
            name: "Newer",
            date: "2026-07-13",
            description: "Newer project.",
            repo_url: "https://github.com/breakingthebot/newer-project",
            technology: "Python",
          },
        ],
        null,
        2,
      )}\n`,
    );

    const entries = loadSideProjectEntries();

    assert.deepEqual(
      entries.map((entry) => entry.name),
      ["Newer", "Older"],
    );
  });
});

test("addSideProjectEntry rejects a duplicate repo_url", () => {
  withTempWorkspace(() => {
    saveSideProjectEntries([
      {
        name: "Shift Closer",
        date: "2026-07-13",
        description: "Logs out of work platforms and emails a shift summary.",
        repo_url: "https://github.com/breakingthebot/shift-closer",
        technology: "Python",
      },
    ]);

    assert.throws(
      () =>
        addSideProjectEntry({
          name: "Shift Closer Again",
          date: "2026-07-14",
          description: "Duplicate repo.",
          repo_url: "https://github.com/breakingthebot/shift-closer",
          technology: "Python",
        }),
      /already exists/,
    );
  });
});

test("addSideProjectEntry rejects invalid entries", () => {
  withTempWorkspace(() => {
    assert.throws(
      () =>
        addSideProjectEntry({
          name: "Missing Fields",
          date: "2026-07-13",
          description: "",
          repo_url: "https://github.com/breakingthebot/missing-fields",
          technology: "Python",
        }),
      /Missing required field: description/,
    );
  });
});
