/*
 * tests/services/buildStatsService.test.js
 * Verifies grouped build statistics and grouping behavior for generated docs.
 * Connects to: src/services/buildStatsService.js
 * Created: 2026-06-29
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  countBy,
  createBuildStats,
  findLatestEntry,
  groupBy,
} = require("../../src/services/buildStatsService");

test("countBy returns sorted grouped counts", () => {
  const counts = countBy(
    [
      { category: "Languages" },
      { category: "Languages" },
      { category: "Frontend" },
    ],
    "category",
  );

  assert.deepEqual(counts, [
    { label: "Languages", count: 2 },
    { label: "Frontend", count: 1 },
  ]);
});

test("groupBy returns entries grouped by label", () => {
  const groups = groupBy(
    [
      { build_number: 1, technology: "Python" },
      { build_number: 2, technology: "Go" },
      { build_number: 3, technology: "Python" },
    ],
    "technology",
  );

  assert.equal(groups[1].label, "Python");
  assert.deepEqual(
    groups[1].entries.map((entry) => entry.build_number),
    [3, 1],
  );
});

test("createBuildStats summarizes latest build and depth counts", () => {
  const stats = createBuildStats([
    {
      build_number: 4,
      date: "2026-06-09",
      project_name: "Folder Organizer",
      technology: "Python (automation)",
      category: "Languages",
      depth: "Expanded",
    },
    {
      build_number: 5,
      date: "2026-06-10",
      project_name: "Chat Server",
      technology: "Python (networking)",
      category: "Languages",
      depth: "Deep",
    },
  ]);

  assert.equal(stats.total_builds, 2);
  assert.equal(stats.latest_build.build_number, 5);
  assert.deepEqual(stats.by_depth, [
    { label: "Deep", count: 1 },
    { label: "Expanded", count: 1 },
  ]);
});

test("findLatestEntry returns the full entry with the highest build number", () => {
  const entry = findLatestEntry([
    { build_number: 4, project_name: "Folder Organizer" },
    { build_number: 5, project_name: "Chat Server" },
    { build_number: 2, project_name: "Expense Tracker" },
  ]);

  assert.equal(entry.build_number, 5);
  assert.equal(entry.project_name, "Chat Server");
});

test("findLatestEntry returns null for an empty entry list", () => {
  assert.equal(findLatestEntry([]), null);
});
