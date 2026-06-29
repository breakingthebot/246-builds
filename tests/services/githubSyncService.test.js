/*
 * tests/services/githubSyncService.test.js
 * Verifies GitHub reconciliation logic without making live network calls.
 * Connects to: src/services/githubSyncService.js
 * Created: 2026-06-28
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const { compareBuildsToGitHub } = require("../../src/services/githubSyncService");

test("compareBuildsToGitHub reports missing repos and date mismatches", () => {
  const result = compareBuildsToGitHub(
    [
      {
        build_number: 1,
        repo_url: "https://github.com/breakingthebot/expense-tracker",
        description: "Expense tracker",
        date: "2026-06-05",
      },
    ],
    [
      {
        url: "https://github.com/breakingthebot/expense-tracker",
        description: "Expense tracker",
        pushedAt: "2026-06-06T20:05:42Z",
      },
      {
        url: "https://github.com/breakingthebot/extra-repo",
        description: "Extra repo",
        pushedAt: "2026-06-06T20:05:42Z",
      },
    ],
  );

  assert.equal(result.missing_on_github.length, 0);
  assert.equal(result.missing_in_builds.length, 1);
  assert.equal(result.metadata_mismatches.length, 1);
});
