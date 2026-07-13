/*
 * add-side-project.js
 * CLI entry point that adds one side-project entry to side-projects.json
 * and regenerates README.md. Side projects are lighter-weight than the
 * numbered build series (add-build.js): no build_number, no tracker
 * workbook sync, and they're excluded from the GitHub-sync audit's
 * expectations (see githubSeriesConfig.js precedent for non-numbered repos).
 * Connects to: src/utils/cliArgs.js, src/services/sideProjectRepository.js,
 * src/services/buildRepository.js, src/services/readmeService.js
 * Created: 2026-07-13
 */

const { parseAddSideProjectArgs } = require("./src/utils/cliArgs");
const { addSideProjectEntry } = require("./src/services/sideProjectRepository");
const { loadBuildEntries } = require("./src/services/buildRepository");
const { writeReadme } = require("./src/services/readmeService");
const { logInfo, logError } = require("./src/utils/logger");

/**
 * Runs the add-side-project CLI workflow.
 *
 * @returns {void}
 */
function main() {
  try {
    const entry = parseAddSideProjectArgs(process.argv.slice(2));
    addSideProjectEntry(entry);
    writeReadme(loadBuildEntries());

    logInfo("side_project_added", { name: entry.name, repo_url: entry.repo_url });
  } catch (error) {
    logError("side_project_add_failed", { message: error.message });
    process.exitCode = 1;
  }
}

main();
