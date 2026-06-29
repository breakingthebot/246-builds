/*
 * generate-readme.js
 * CLI entry point that regenerates README.md from builds.json.
 * Connects to: src/services/buildRepository.js, src/services/readmeService.js
 * Created: 2026-06-28
 */

const { loadBuildEntries } = require("./src/services/buildRepository");
const { writeBuildArtifacts } = require("./src/services/buildExportService");
const { writeReadme } = require("./src/services/readmeService");
const { logInfo, logError } = require("./src/utils/logger");

/**
 * Runs the README generation workflow.
 *
 * @returns {void}
 */
function main() {
  try {
    const entries = loadBuildEntries();
    writeReadme(entries);
    const artifacts = writeBuildArtifacts(entries);

    logInfo("readme_generated", {
      entry_count: entries.length,
      detail_pages_generated: artifacts.detail_pages.length,
    });
  } catch (error) {
    logError("readme_generation_failed", {
      message: error.message,
    });
    process.exitCode = 1;
  }
}

main();
