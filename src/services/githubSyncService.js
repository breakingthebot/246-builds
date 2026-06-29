/*
 * src/services/githubSyncService.js
 * Compares the local build index against public GitHub repositories for reconciliation checks.
 * Connects to: builds.json, GitHub CLI
 * Created: 2026-06-28
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const { loadBuildEntries } = require("./buildRepository");
const { IGNORED_PUBLIC_REPOSITORIES } = require("../config/githubSeriesConfig");

const GH_CLI_PATH = path.join(
  "C:\\",
  "Program Files",
  "GitHub CLI",
  "gh.exe",
);

/**
 * Fetches public repositories from GitHub through the GitHub CLI.
 *
 * @param {string} owner - The GitHub owner to query.
 * @returns {Array<{name: string, description: string, url: string, visibility: string, pushedAt: string}>} The public repositories.
 */
function fetchPublicRepositories(owner) {
  const command = fs.existsSync(GH_CLI_PATH) ? GH_CLI_PATH : "gh";
  const result = spawnSync(
    command,
    [
      "repo",
      "list",
      owner,
      "--limit",
      "300",
      "--json",
      "name,description,url,visibility,pushedAt,createdAt,repositoryTopics",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    const stderr = typeof result.stderr === "string" ? result.stderr.trim() : "";
    const stdout = typeof result.stdout === "string" ? result.stdout.trim() : "";
    const processError =
      result.error && result.error.message ? result.error.message : "";

    throw new Error(
      `GitHub repo fetch failed: ${processError || stderr || stdout || "Unknown error."}`,
    );
  }

  const repositories = JSON.parse(result.stdout);
  return repositories.filter(
    (repository) =>
      repository.visibility === "PUBLIC" &&
      !IGNORED_PUBLIC_REPOSITORIES.includes(repository.name),
  );
}

/**
 * Compares local build entries to public GitHub repositories.
 *
 * @param {Array<{build_number: number, repo_url: string, description: string, date: string}>} buildEntries - The local build entries.
 * @param {Array<{url: string, description: string, pushedAt: string}>} repositories - The public repositories.
 * @returns {{missing_on_github: string[], missing_in_builds: string[], metadata_mismatches: string[]}} The reconciliation findings.
 */
function compareBuildsToGitHub(buildEntries, repositories) {
  const buildUrls = new Set(buildEntries.map((entry) => entry.repo_url));
  const repoUrls = new Set(repositories.map((repository) => repository.url));
  const missingOnGitHub = buildEntries
    .filter((entry) => !repoUrls.has(entry.repo_url))
    .map((entry) => `Build ${entry.build_number} repo missing on GitHub: ${entry.repo_url}`);
  const missingInBuilds = repositories
    .filter((repository) => !buildUrls.has(repository.url))
    .map((repository) => `Public GitHub repo missing from builds.json: ${repository.url}`);
  const metadataMismatches = [];

  const repositoryByUrl = new Map(
    repositories.map((repository) => [repository.url, repository]),
  );

  for (const entry of buildEntries) {
    const repository = repositoryByUrl.get(entry.repo_url);

    if (!repository) {
      continue;
    }

    const pushedDate = repository.pushedAt.slice(0, 10);

    if (entry.date !== pushedDate) {
      metadataMismatches.push(
        `Push date mismatch for build ${entry.build_number}: builds.json=${entry.date}, GitHub=${pushedDate}.`,
      );
    }
  }

  return {
    missing_on_github: missingOnGitHub,
    missing_in_builds: missingInBuilds,
    metadata_mismatches: metadataMismatches,
  };
}

/**
 * Audits local build entries against GitHub.
 *
 * @param {string} owner - The GitHub owner to query.
 * @returns {{missing_on_github: string[], missing_in_builds: string[], metadata_mismatches: string[], public_repo_count: number, build_count: number}} The reconciliation findings.
 */
function auditGitHubBuildSync(owner = "breakingthebot") {
  const buildEntries = loadBuildEntries();
  const repositories = fetchPublicRepositories(owner);
  const findings = compareBuildsToGitHub(buildEntries, repositories);

  return {
    ...findings,
    public_repo_count: repositories.length,
    build_count: buildEntries.length,
  };
}

module.exports = {
  auditGitHubBuildSync,
  compareBuildsToGitHub,
  fetchPublicRepositories,
};
