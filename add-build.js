/*
 * add-build.js
 * CLI entry point that adds one build entry to builds.json and regenerates README.md.
 * Connects to: src/utils/cliArgs.js, src/services/buildRepository.js, src/services/readmeService.js
 * Created: 2026-06-28
 */

const { parseAddBuildArgs } = require("./src/utils/cliArgs");
const { addBuildEntry } = require("./src/services/buildRepository");
const { writeBuildArtifacts } = require("./src/services/buildExportService");
const { writeReadme } = require("./src/services/readmeService");
const { updateTrackerWorkbooks } = require("./src/services/trackerSyncService");
const { logInfo, logError } = require("./src/utils/logger");

/**
 * Runs the add-build CLI workflow.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const { buildEntry, tracker } = parseAddBuildArgs(process.argv.slice(2));
    const entries = addBuildEntry(buildEntry);
    writeReadme(entries);
    writeBuildArtifacts(entries);
    const trackerPaths = await updateTrackerWorkbooks(buildEntry, tracker);

    logInfo("build_added", {
      build_number: buildEntry.build_number,
      date: buildEntry.date,
      repo_url: buildEntry.repo_url,
      tracker_files_updated: trackerPaths.length,
    });
  } catch (error) {
    logError("build_add_failed", {
      message: error.message,
    });
    process.exitCode = 1;
  }
}

main();
