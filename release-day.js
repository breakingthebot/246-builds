/*
 * release-day.js
 * CLI entry point that runs the full release-day workflow for one completed build.
 * Connects to: src/services/releaseDayService.js, src/utils/cliArgs.js
 * Created: 2026-06-29
 */

const { runReleaseDayWorkflow } = require("./src/services/releaseDayService");
const { parseReleaseDayArgs } = require("./src/utils/cliArgs");
const { logError, logInfo } = require("./src/utils/logger");

/**
 * Runs the release-day CLI workflow.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const options = parseReleaseDayArgs(process.argv.slice(2));
    const result = await runReleaseDayWorkflow(options);

    logInfo("release_day_completed", {
      build_number: result.build_number,
      tracker_files_updated: result.tracker_files_updated,
      repo_clean_before_run: result.repo_state.available
        ? result.repo_state.is_clean
        : null,
      changed_files_before_run: result.repo_state.changed_files.length,
      github_sync_ran: !options.skipGitHub,
    });
  } catch (error) {
    logError("release_day_failed", {
      message: error.message,
    });
    process.exitCode = 1;
  }
}

main();
