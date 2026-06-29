/*
 * audit-builds.js
 * CLI entry point that audits local build sources for consistency.
 * Connects to: src/services/localAuditService.js
 * Created: 2026-06-28
 */

const { auditLocalBuildSources } = require("./src/services/localAuditService");
const { logError, logInfo } = require("./src/utils/logger");

/**
 * Runs the local build audit.
 *
 * @returns {void}
 */
function main() {
  try {
    const auditResult = auditLocalBuildSources();

    if (auditResult.issues.length > 0) {
      logError("build_audit_failed", auditResult);
      process.exitCode = 1;
      return;
    }

    logInfo("build_audit_passed", auditResult.summary);
  } catch (error) {
    logError("build_audit_failed", { message: error.message });
    process.exitCode = 1;
  }
}

main();
