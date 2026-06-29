/*
 * src/services/releaseDayService.js
 * Orchestrates the full release-day workflow for adding a build and validating the index state.
 * Connects to: add-build.js, audit-builds.js, sync-github-builds.js
 * Created: 2026-06-29
 */

const { spawnSync } = require("node:child_process");

const { addBuildEntry } = require("./buildRepository");
const { writeBuildArtifacts } = require("./buildExportService");
const { auditGitHubBuildSync } = require("./githubSyncService");
const { auditLocalBuildSources } = require("./localAuditService");
const { writeReadme } = require("./readmeService");
const { updateTrackerWorkbooks } = require("./trackerSyncService");

/**
 * Runs a subprocess and returns trimmed stdout.
 *
 * @param {string} command - The command to run.
 * @param {string[]} args - The command arguments.
 * @returns {string} The trimmed stdout.
 */
function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const stderr = typeof result.stderr === "string" ? result.stderr.trim() : "";
    const stdout = typeof result.stdout === "string" ? result.stdout.trim() : "";
    const processError =
      result.error && result.error.message ? result.error.message : "";

    throw new Error(processError || stderr || stdout || `${command} failed.`);
  }

  return typeof result.stdout === "string" ? result.stdout.trim() : "";
}

/**
 * Checks the local git repo state when available.
 *
 * @returns {{ available: boolean, is_clean: boolean, changed_files: string[] }} The repo state.
 */
function getRepoState() {
  try {
    runCommand("git", ["rev-parse", "--is-inside-work-tree"]);
    const statusOutput = runCommand("git", ["status", "--short"]);
    const changedFiles = statusOutput
      ? statusOutput.split(/\r?\n/).filter(Boolean)
      : [];

    return {
      available: true,
      is_clean: changedFiles.length === 0,
      changed_files: changedFiles,
    };
  } catch (_error) {
    return {
      available: false,
      is_clean: false,
      changed_files: [],
    };
  }
}

/**
 * Runs the release-day workflow.
 *
 * @param {{ buildPayload: {buildEntry: {build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, stack: string[]}, tracker: {depth: string, notes: string}}, owner: string, skipGitHub: boolean }} options - The release-day options.
 * @returns {{ repo_state: {available: boolean, is_clean: boolean, changed_files: string[]}, build_number: number, tracker_files_updated: number, local_audit: {issues: string[], summary: {builds_count: number, readme_rows_count: number, tracker_rows_count: number}}, github_audit: ({missing_on_github: string[], missing_in_builds: string[], metadata_mismatches: string[], public_repo_count: number, build_count: number}|null) }} The workflow result.
 */
function runReleaseDayWorkflow(options) {
  const repoState = getRepoState();
  const entries = addBuildEntry(options.buildPayload.buildEntry);
  writeReadme(entries);
  writeBuildArtifacts(entries);
  const trackerPaths = updateTrackerWorkbooks(
    options.buildPayload.buildEntry,
    options.buildPayload.tracker,
  );
  const localAudit = auditLocalBuildSources();

  if (localAudit.issues.length > 0) {
    throw new Error(localAudit.issues.join(" "));
  }

  let githubAudit = null;

  if (!options.skipGitHub) {
    githubAudit = auditGitHubBuildSync(options.owner);
    const githubIssueCount =
      githubAudit.missing_on_github.length +
      githubAudit.missing_in_builds.length +
      githubAudit.metadata_mismatches.length;

    if (githubIssueCount > 0) {
      throw new Error(
        [
          ...githubAudit.missing_on_github,
          ...githubAudit.missing_in_builds,
          ...githubAudit.metadata_mismatches,
        ].join(" "),
      );
    }
  }

  return {
    repo_state: repoState,
    build_number: options.buildPayload.buildEntry.build_number,
    tracker_files_updated: trackerPaths.length,
    local_audit: localAudit,
    github_audit: githubAudit,
  };
}

module.exports = {
  getRepoState,
  runCommand,
  runReleaseDayWorkflow,
};
