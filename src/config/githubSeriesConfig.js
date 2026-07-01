/*
 * src/config/githubSeriesConfig.js
 * Stores GitHub reconciliation settings for the 286 build series.
 * Connects to: src/services/githubSyncService.js
 * Created: 2026-06-28
 */

const IGNORED_PUBLIC_REPOSITORIES = ["286-builds", "solar-system"];

module.exports = {
  IGNORED_PUBLIC_REPOSITORIES,
};
