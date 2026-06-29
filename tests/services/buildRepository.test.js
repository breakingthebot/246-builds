/*
 * tests/services/buildRepository.test.js
 * Verifies builds.json repository behavior including sorting, validation, and duplicate checks.
 * Connects to: src/services/buildRepository.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  addBuildEntry,
  loadBuildEntries,
  saveBuildEntries,
  sortEntriesDescending,
} = require("../../src/services/buildRepository");

/**
 * Creates a temporary workspace and runs the supplied test callback inside it.
 *
 * @param {(workspacePath: string) => void} callback - The test callback.
 * @returns {void}
 */
function withTempWorkspace(callback) {
  const originalCwd = process.cwd();
  const workspacePath = fs.mkdtempSync(path.join(os.tmpdir(), "build-repo-test-"));

  fs.writeFileSync(path.join(workspacePath, "builds.json"), "[]\n");
  process.chdir(workspacePath);

  try {
    callback(workspacePath);
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}

test("sortEntriesDescending orders builds newest first", () => {
  const sortedEntries = sortEntriesDescending([
    { build_number: 2 },
    { build_number: 5 },
    { build_number: 1 },
  ]);

  assert.deepEqual(
    sortedEntries.map((entry) => entry.build_number),
    [5, 2, 1],
  );
});

test("saveBuildEntries writes validated sorted entries", () => {
  withTempWorkspace(() => {
    const savedEntries = saveBuildEntries([
      {
        build_number: 2,
        date: "2026-06-28",
        project_name: "Second Project",
        description: "Second build.",
        repo_url: "https://github.com/breakingthebot/second-project",
        technology: "Node.js",
        category: "Languages",
        stack: ["Node.js"],
      },
      {
        build_number: 4,
        date: "2026-06-29",
        project_name: "Fourth Project",
        description: "Fourth build.",
        repo_url: "https://github.com/breakingthebot/fourth-project",
        technology: "TypeScript",
        category: "Languages",
        stack: ["TypeScript"],
      },
    ]);

    assert.equal(savedEntries[0].build_number, 4);

    const fileContents = fs.readFileSync(path.join(process.cwd(), "builds.json"), "utf8");
    assert.match(fileContents, /"build_number": 4/);
  });
});

test("loadBuildEntries returns sorted validated entries", () => {
  withTempWorkspace(() => {
    fs.writeFileSync(
      path.join(process.cwd(), "builds.json"),
      `${JSON.stringify(
        [
          {
            build_number: 1,
            date: "2026-06-27",
            project_name: "First Project",
            description: "First build.",
            repo_url: "https://github.com/breakingthebot/first-project",
            technology: "Node.js",
            category: "Languages",
            stack: ["Node.js"],
          },
          {
            build_number: 3,
            date: "2026-06-29",
            project_name: "Third Project",
            description: "Third build.",
            repo_url: "https://github.com/breakingthebot/third-project",
            technology: "React",
            category: "Frontend",
            stack: ["React"],
          },
        ],
        null,
        2,
      )}\n`,
    );

    const entries = loadBuildEntries();

    assert.deepEqual(
      entries.map((entry) => entry.build_number),
      [3, 1],
    );
  });
});

test("addBuildEntry rejects duplicate build numbers", () => {
  withTempWorkspace(() => {
    saveBuildEntries([
      {
        build_number: 9,
        date: "2026-06-28",
        project_name: "Kanban Board",
        description: "Board build.",
        repo_url: "https://github.com/breakingthebot/kanban-board",
        technology: "Vanilla JS",
        category: "Languages",
        stack: ["Vanilla JS"],
      },
    ]);

    assert.throws(
      () =>
        addBuildEntry({
          build_number: 9,
          date: "2026-06-29",
          project_name: "Another Build",
          description: "Duplicate build number.",
          repo_url: "https://github.com/breakingthebot/another-build",
          technology: "Node.js",
          category: "Languages",
          stack: ["Node.js"],
        }),
      /already exists/,
    );
  });
});
