/*
 * tests/services/buildExportService.test.js
 * Verifies generated CSV exports and per-build detail page content.
 * Connects to: src/services/buildExportService.js
 * Created: 2026-06-29
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createBuildCsv,
  createBuildDetailPage,
  slugifyProjectName,
} = require("../../src/services/buildExportService");

test("slugifyProjectName creates a filesystem-safe slug", () => {
  assert.equal(slugifyProjectName("File Duplicate Finder"), "file-duplicate-finder");
});

test("createBuildCsv includes depth and notes columns", () => {
  const csv = createBuildCsv([
    {
      build_number: 16,
      date: "2026-06-28",
      project_name: "File Duplicate Finder",
      description: "Finds duplicate files by hash.",
      repo_url: "https://github.com/breakingthebot/file-duplicate-finder-rust",
      technology: "Rust",
      category: "Languages",
      depth: "Expanded",
      notes: "CLI + tests",
    },
  ]);

  assert.match(csv, /depth,notes/);
  assert.match(csv, /Expanded/);
  assert.match(csv, /CLI \+ tests/);
});

test("createBuildDetailPage renders the build snapshot", () => {
  const page = createBuildDetailPage({
    build_number: 16,
    date: "2026-06-28",
    project_name: "File Duplicate Finder",
    description: "Finds duplicate files by hash.",
    repo_url: "https://github.com/breakingthebot/file-duplicate-finder-rust",
    technology: "Rust",
    category: "Languages",
    depth: "Expanded",
    notes: "CLI + tests",
  });

  assert.match(page, /# Build 16: File Duplicate Finder/);
  assert.match(page, /Depth: Expanded/);
  assert.match(page, /CLI \+ tests/);
});
