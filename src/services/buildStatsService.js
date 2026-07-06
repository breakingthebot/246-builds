/*
 * src/services/buildStatsService.js
 * Computes grouped build statistics and subsets for generated documentation.
 * Connects to: builds.json, src/services/readmeService.js, src/services/buildExportService.js
 * Created: 2026-06-29
 */

/**
 * Counts entries by a selected string key.
 *
 * @param {Array<Record<string, string | number>>} entries - The build entries.
 * @param {string} key - The key to count by.
 * @returns {Array<{label: string, count: number}>} The sorted counts.
 */
function countBy(entries, key) {
  const counts = new Map();

  for (const entry of entries) {
    const label = String(entry[key] || "Unknown");
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label);
    });
}

/**
 * Groups entries by a selected string key.
 *
 * @param {Array<Record<string, string | number>>} entries - The build entries.
 * @param {string} key - The key to group by.
 * @returns {Array<{label: string, entries: Array<Record<string, string | number>>}>} The grouped entries.
 */
function groupBy(entries, key) {
  const groups = new Map();

  for (const entry of entries) {
    const label = String(entry[key] || "Unknown");
    const existingEntries = groups.get(label) || [];
    existingEntries.push(entry);
    groups.set(label, existingEntries);
  }

  return [...groups.entries()]
    .map(([label, groupedEntries]) => ({
      label,
      entries: groupedEntries.sort(
        (left, right) => right.build_number - left.build_number,
      ),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

/**
 * Finds the entry with the highest build number.
 *
 * @param {Array<{build_number: number}>} entries - The build entries.
 * @returns {Record<string, string | number> | null} The latest entry, or null if empty.
 */
function findLatestEntry(entries) {
  if (entries.length === 0) {
    return null;
  }

  return [...entries].sort((left, right) => right.build_number - left.build_number)[0];
}

/**
 * Computes summary statistics for the build index.
 *
 * @param {Array<{build_number: number, date: string, project_name: string, technology: string, category: string, depth: string}>} entries - The build entries.
 * @returns {{total_builds: number, latest_build: ({build_number: number, date: string, project_name: string}|null), by_category: Array<{label: string, count: number}>, by_technology: Array<{label: string, count: number}>, by_depth: Array<{label: string, count: number}>}} The computed statistics.
 */
function createBuildStats(entries) {
  const latestBuild = findLatestEntry(entries);

  return {
    total_builds: entries.length,
    latest_build: latestBuild
      ? {
          build_number: latestBuild.build_number,
          date: latestBuild.date,
          project_name: latestBuild.project_name,
        }
      : null,
    by_category: countBy(entries, "category"),
    by_technology: countBy(entries, "technology"),
    by_depth: countBy(entries, "depth"),
  };
}

module.exports = {
  countBy,
  createBuildStats,
  findLatestEntry,
  groupBy,
};
