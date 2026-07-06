/*
 * tests/services/buildExportService.test.js
 * Verifies generated CSV exports and per-build detail page content.
 * Connects to: src/services/buildExportService.js
 * Created: 2026-06-29
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  createBuildCsv,
  createBuildDetailPage,
  getSiteDataDirectoryPath,
  slugifyProjectName,
  writeSiteBadgeColors,
  writeSiteData,
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

test("writeSiteData writes the entries as JSON to docs/data/builds.json", () => {
  const entries = [
    {
      build_number: 16,
      date: "2026-06-28",
      project_name: "File Duplicate Finder",
      description: "Finds duplicate files by hash.",
      repo_url: "https://github.com/breakingthebot/file-duplicate-finder-rust",
      technology: "Rust",
      category: "CLI Tools",
      depth: "Expanded",
      notes: "",
    },
  ];

  const dataPath = writeSiteData(entries);

  assert.equal(dataPath, path.join(getSiteDataDirectoryPath(), "builds.json"));
  const written = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  assert.deepEqual(written, entries);
});

test("writeSiteBadgeColors writes technology/category/depth color maps as JSON", () => {
  const badgeColorsPath = writeSiteBadgeColors();

  assert.equal(badgeColorsPath, path.join(getSiteDataDirectoryPath(), "badge-colors.json"));
  const written = JSON.parse(fs.readFileSync(badgeColorsPath, "utf8"));
  assert.equal(written.technology.Rust, "DEA584");
  assert.equal(written.category["CLI Tools"], "0f766e");
  assert.equal(written.depth.Deep, "7c3aed");
});
