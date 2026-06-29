/*
 * sync-github-builds.js
 * CLI entry point that audits public GitHub repos against the local build index.
 * Connects to: src/services/githubSyncService.js
 * Created: 2026-06-28
 */

const { auditGitHubBuildSync } = require("./src/services/githubSyncService");
const { logError, logInfo } = require("./src/utils/logger");

/**
 * Parses the GitHub owner flag.
 *
 * @param {string[]} argv - Raw CLI arguments.
 * @returns {string} The GitHub owner.
 */
function parseOwner(argv) {
  const ownerFlagIndex = argv.indexOf("--owner");

  if (ownerFlagIndex === -1) {
    return "breakingthebot";
  }

  const owner = argv[ownerFlagIndex + 1];

  if (!owner || owner.startsWith("--")) {
    throw new Error("Missing value for --owner.");
  }

  return owner;
}

/**
 * Runs the GitHub reconciliation audit.
 *
 * @returns {void}
 */
function main() {
  try {
    const owner = parseOwner(process.argv.slice(2));
    const auditResult = auditGitHubBuildSync(owner);
    const issueCount =
      auditResult.missing_on_github.length +
      auditResult.missing_in_builds.length +
      auditResult.metadata_mismatches.length;

    if (issueCount > 0) {
      logError("github_build_sync_failed", auditResult);
      process.exitCode = 1;
      return;
    }

    logInfo("github_build_sync_passed", {
      owner,
      build_count: auditResult.build_count,
      public_repo_count: auditResult.public_repo_count,
    });
  } catch (error) {
    logError("github_build_sync_failed", { message: error.message });
    process.exitCode = 1;
  }
}

main();
