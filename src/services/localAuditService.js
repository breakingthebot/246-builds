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

const README_TABLE_HEADER =
  "| Build # | Date | Project | Description | Repo | Technology | Category | Depth |";

/**
 * Parses README table rows into normalized audit entries.
 *
 * @param {string} readmeContents - The README markdown.
 * @returns {Array<{build_number: number, date: string, project_name: string, description: string, repo_url: string, technology: string, category: string, depth: string}>} The parsed rows.
 */
function parseReadmeBuildRows(readmeContents) {
  const lines = readmeContents.split(/\r?\n/);
  const headerIndex = lines.indexOf(README_TABLE_HEADER);

  if (headerIndex === -1) {
    return [];
  }

  const rows = [];

  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.startsWith("|")) {
      break;
    }

    const columns = line
      .split("|")
      .slice(1, -1)
      .map((value) => value.trim());

    if (columns.length !== 8) {
      continue;
    }

    const projectMatch = columns[2].match(/\[(.+?)\]\(/);
    const repoUrlMatch = columns[4].match(/\((https:\/\/github\.com\/[^)]+)\)/);
    const depthMatch = columns[7].match(/`(.+?)`/);

    rows.push({
      build_number: Number(columns[0]),
      date: columns[1],
      project_name: projectMatch ? projectMatch[1] : columns[2],
      description: columns[3],
      repo_url: repoUrlMatch ? repoUrlMatch[1] : "",
      technology: columns[5],
      category: columns[6],
      depth: depthMatch ? depthMatch[1] : columns[7],
    });
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
  README_TABLE_HEADER,
};
