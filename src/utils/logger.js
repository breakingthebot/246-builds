/*
 * src/utils/logger.js
 * Emits structured JSON logs for the repo automation scripts.
 * Connects to: add-build.js, generate-readme.js
 * Created: 2026-06-28
 */

/**
 * Writes a structured log line to stdout.
 *
 * @param {string} event - The event name.
 * @param {Record<string, unknown>} context - Extra context for the log line.
 * @returns {void}
 */
function logInfo(event, context) {
  process.stdout.write(
    `${JSON.stringify({ level: "INFO", event, ...context })}\n`,
  );
}

/**
 * Writes a structured log line to stderr.
 *
 * @param {string} event - The event name.
 * @param {Record<string, unknown>} context - Extra context for the log line.
 * @returns {void}
 */
function logError(event, context) {
  process.stderr.write(
    `${JSON.stringify({ level: "ERROR", event, ...context })}\n`,
  );
}

module.exports = {
  logError,
  logInfo,
};
