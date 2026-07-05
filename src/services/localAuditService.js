/*
 * src/services/localAuditService.js
 * Audits local build sources for drift across builds.json, README.md, and the tracker workbook.
 * Connects to: builds.json, README.md, src/services/trackerSyncService.js
 * Created: 2026-06-28
 */

const fs = require("node:fs");

const { loadBuildEntries } = require("./buildRepository");
const { getReadmeFilePath } = require("./readmeService");
const { readTrackerRows } = require("./trackerSyncService");

const BUILD_INDEX_SUMMARY_PATTERN = /^<summary>All Builds \(\d+\)<\/summary>$/;
const CARD_TITLE_PATTERN = /^#### \[#(\d+) — (.+?)\]\([^)]+\)$/;
const BADGE_PATTERN = /!\[(.*?)\]\(https:\/\/img\.shields\.io\/badge\/[^)]+\)/g;
const BADGE_DATE_PATTERN = /· (\d{4}-\d{2}-\d{2})/;
const REPO_LINK_PATTERN = /^\[Repo →\]\((https:\/\/github\.com\/[^)]+)\)$/;

/**
 * Parses the Build Index accordion's build cards into normalized audit
 * entries. Only reads the "All Builds" section (identified by its
 * <summary> line) so entries repeated elsewhere in the README (Quick
 * Views, By Category, By Technology) are not double-counted.
 *
 * @param {string} readmeContents - The README markdown.
 * @returns {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string}>} The parsed rows.
 */
function parseReadmeBuildRows(readmeContents) {
  const lines = readmeContents.split(/\r?\n/);
  const summaryIndex = lines.findIndex((line) =>
    BUILD_INDEX_SUMMARY_PATTERN.test(line),
  );

  if (summaryIndex === -1) {
    return [];
  }

  const closingIndex = lines.indexOf("</details>", summaryIndex);
  const sectionLines =
    closingIndex === -1
      ? lines.slice(summaryIndex + 1)
      : lines.slice(summaryIndex + 1, closingIndex);

  const rows = [];
  let current = null;

  for (const line of sectionLines) {
    const titleMatch = line.match(CARD_TITLE_PATTERN);

    if (titleMatch) {
      if (current) {
        rows.push(current);
      }
      current = {
        build_number: Number(titleMatch[1]),
        date: "",
        project_name: titleMatch[2],
        description: "",
        repo_url: "",
        technology: "",
        category: "",
        depth: "",
      };
      continue;
    }

    if (!current) {
      continue;
    }

    const badgeMatches = [...line.matchAll(BADGE_PATTERN)];
    if (badgeMatches.length >= 3) {
      current.technology = badgeMatches[0][1];
      current.category = badgeMatches[1][1];
      current.depth = badgeMatches[2][1];
      const dateMatch = line.match(BADGE_DATE_PATTERN);
      current.date = dateMatch ? dateMatch[1] : "";
      continue;
    }

    const repoMatch = line.match(REPO_LINK_PATTERN);
    if (repoMatch) {
      current.repo_url = repoMatch[1];
      continue;
    }

    if (line !== "" && line !== "---" && !current.description) {
      current.description = line;
    }
  }

  if (current) {
    rows.push(current);
  }

  return rows;
}

/**
 * Audits local build sources and returns any drift findings.
 *
 * @returns {{issues: string[], summary: {builds_count: number, readme_rows_count: number, tracker_rows_count: number}}} The audit result.
 */
function auditLocalBuildSources() {
  const buildEntries = loadBuildEntries();
  const readmeContents = fs.readFileSync(getReadmeFilePath(), "utf8");
  const readmeRows = parseReadmeBuildRows(readmeContents);
  const trackerRows = readTrackerRows().filter((row) => row.status === "Completed");
  const issues = [];

  if (buildEntries.length !== readmeRows.length) {
    issues.push(
      `README row count mismatch: builds.json has ${buildEntries.length}, README has ${readmeRows.length}.`,
    );
  }

  if (buildEntries.length !== trackerRows.length) {
    issues.push(
      `Tracker row count mismatch: builds.json has ${buildEntries.length}, tracker has ${trackerRows.length} completed rows.`,
    );
  }

  const readmeByBuildNumber = new Map(
    readmeRows.map((row) => [row.build_number, row]),
  );
  const trackerByBuildNumber = new Map(
    trackerRows.map((row) => [row.build_number, row]),
  );

  for (const entry of buildEntries) {
    const readmeRow = readmeByBuildNumber.get(entry.build_number);
    const trackerRow = trackerByBuildNumber.get(entry.build_number);
    if (!readmeRow) {
      issues.push(`README is missing build ${entry.build_number}.`);
    } else {
      if (readmeRow.date !== entry.date) {
        issues.push(
          `README date mismatch for build ${entry.build_number}: ${readmeRow.date} vs ${entry.date}.`,
        );
      }

      if (readmeRow.repo_url !== entry.repo_url) {
        issues.push(
          `README repo URL mismatch for build ${entry.build_number}: ${readmeRow.repo_url} vs ${entry.repo_url}.`,
        );
      }

      if (readmeRow.technology !== entry.technology) {
        issues.push(
          `README technology mismatch for build ${entry.build_number}: ${readmeRow.technology} vs ${entry.technology}.`,
        );
      }

      if (readmeRow.category !== entry.category) {
        issues.push(
          `README category mismatch for build ${entry.build_number}: ${readmeRow.category} vs ${entry.category}.`,
        );
      }

      if (readmeRow.depth !== entry.depth) {
        issues.push(
          `README depth mismatch for build ${entry.build_number}: ${readmeRow.depth} vs ${entry.depth}.`,
        );
      }
    }

    if (!trackerRow) {
      issues.push(`Tracker is missing completed row for build ${entry.build_number}.`);
    } else {
      if (trackerRow.date !== entry.date) {
        issues.push(
          `Tracker date mismatch for build ${entry.build_number}: ${trackerRow.date} vs ${entry.date}.`,
        );
      }

      if (trackerRow.repo_url !== entry.repo_url) {
        issues.push(
          `Tracker repo URL mismatch for build ${entry.build_number}: ${trackerRow.repo_url} vs ${entry.repo_url}.`,
        );
      }
    }
  }

  return {
    issues,
    summary: {
      builds_count: buildEntries.length,
      readme_rows_count: readmeRows.length,
      tracker_rows_count: trackerRows.length,
    },
  };
}

module.exports = {
  auditLocalBuildSources,
  parseReadmeBuildRows,
};
