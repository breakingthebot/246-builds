/*
 * src/config/githubSeriesConfig.js
 * Stores GitHub reconciliation settings for the 286 build series.
 * Connects to: src/services/githubSyncService.js
 * Created: 2026-06-28
 */

const IGNORED_PUBLIC_REPOSITORIES = [
  // Series tooling / personal repos -- not tracked anywhere in this repo.
  "286-builds",
  "286-builds-dashboard",
  "breakingthebot",
  "solar-system",
  // Side projects -- tracked in side-projects.json instead of builds.json,
  // so they're correctly outside this numbered-series sync audit too.
  "shift-closer",
  "web-scraper-bot",
  "discord-webhook-alerter",
  "automated-report-dispatcher",
  "tiktok-auto-poster",
  "api-keymaster",
];

module.exports = {
  IGNORED_PUBLIC_REPOSITORIES,
};
