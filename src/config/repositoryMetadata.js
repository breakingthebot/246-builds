/*
 * src/config/repositoryMetadata.js
 * Stores the static copy used when generating the index README.
 * Connects to: src/services/readmeService.js
 * Created: 2026-06-28
 */

const REPOSITORY_TITLE = "286 Builds";
const INTRO_PARAGRAPH =
  "A public index of daily coding builds, each pulled from the 286-project list and built end-to-end in a single day, then expanded through multiple iterations with a full commit history pushed live. Together, the repos form a broad portfolio spanning multiple languages, problem types, and build depths.";
const WHATS_IN_EACH_BUILD_REPO = [
  "Every repo has a full README.",
  "Every repo has a full changelog.",
  "Every repo keeps a real sequential commit history on one branch.",
  "Every repo includes either a live deployment link or exact local run instructions.",
];
const ARCHITECTURE_NOTES =
  "This repo is the front door for the full build series. The reference files stay in `reference/`, the published build entries live in `builds.json`, and the README is generated from that JSON so the public index stays consistent. I kept the automation small on purpose: one CLI to add a build, one CLI to regenerate the README, and a handful of focused modules so the data, validation, formatting, and file writes stay separate and easy to audit.";
const STATIC_NOTES = [
  "The tracker workbook currently contains 246 build rows even though the PDF is described as a 286-item master list. The automation uses the tracker rows that are actually marked complete.",
  "The remaining unpublished build slots are intentionally left open for future custom build designs and additional portfolio work.",
];

module.exports = {
  ARCHITECTURE_NOTES,
  INTRO_PARAGRAPH,
  STATIC_NOTES,
  REPOSITORY_TITLE,
  WHATS_IN_EACH_BUILD_REPO,
};
