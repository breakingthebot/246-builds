/*
 * tests/services/releaseDayService.test.js
 * Verifies repo-state inspection for the release-day orchestration flow.
 * Connects to: src/services/releaseDayService.js
 * Created: 2026-06-29
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const { getRepoState } = require("../../src/services/releaseDayService");

test("getRepoState returns a structured object", () => {
  const repoState = getRepoState();

  assert.equal(typeof repoState.available, "boolean");
  assert.equal(typeof repoState.is_clean, "boolean");
  assert.equal(Array.isArray(repoState.changed_files), true);
});
