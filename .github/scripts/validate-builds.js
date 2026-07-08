#!/usr/bin/env node

/**
 * Build Validator Script
 * 
 * Validates all builds in builds.json by checking:
 * 1. Repository URL is accessible
 * 2. README.md exists in the repo
 * 3. CHANGELOG.md exists in the repo
 * 
 * Usage: node validate-builds.js
 * Output: validation-report.json (if failures found)
 * Exit code: 0 (success) or 1 (failures)
 */

const fs = require('fs');
const https = require('https');

/**
 * Make an HTTPS HEAD request to check if a URL is accessible
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - true if accessible (2xx status), false otherwise
 */
async function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const request = https.request(
      url,
      { method: 'HEAD', timeout },
      (res) => {
        // Success if status is 2xx (200-299)
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      }
    );

    request.on('error', () => {
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });

    request.end();
  });
}

/**
 * Validate a single build by checking its repository
 * @param {object} build - Build object from builds.json
 * @returns {Promise<object>} - Validation result
 */
async function validateBuild(build) {
  const errors = [];

  console.log(`\nChecking Build #${build.build_number}: ${build.project_name}...`);

  // ✅ Check 1: Repository URL is accessible
  console.log(`  → Checking repository URL...`);
  const repoAccessible = await checkUrl(build.repo_url);
  if (!repoAccessible) {
    errors.push(
      `❌ Repository URL not accessible: ${build.repo_url} (HTTP 404 or timeout)`
    );
  } else {
    console.log(`    ✓ Repository accessible`);
  }

  // ✅ Check 2: README.md exists
  console.log(`  → Checking README.md...`);
  const readmeUrl = `${build.repo_url}/raw/main/README.md`;
  const readmeExists = await checkUrl(readmeUrl);
  if (!readmeExists) {
    errors.push(
      `❌ README.md not found: ${readmeUrl}`
    );
  } else {
    console.log(`    ✓ README.md found`);
  }

  // ✅ Check 3: CHANGELOG.md exists
  console.log(`  → Checking CHANGELOG.md...`);
  const changelogUrl = `${build.repo_url}/raw/main/CHANGELOG.md`;
  const changelogExists = await checkUrl(changelogUrl);
  if (!changelogExists) {
    errors.push(
      `❌ CHANGELOG.md not found: ${changelogUrl}`
    );
  } else {
    console.log(`    ✓ CHANGELOG.md found`);
  }

  return {
    build_number: build.build_number,
    project_name: build.project_name,
    repo_url: build.repo_url,
    errors: errors,
    passed: errors.length === 0
  };
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Starting Build Validation...\n');

  // Read builds.json
  const builds = JSON.parse(fs.readFileSync('builds.json', 'utf8'));
  console.log(`Found ${builds.length} builds to validate.\n`);
  console.log('═'.repeat(60));

  const results = [];
  const failures = [];

  // Validate each build (runs sequentially to avoid overwhelming the network)
  for (const build of builds) {
    const result = await validateBuild(build);
    results.push(result);

    if (!result.passed) {
      failures.push(result);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Validation Summary\n');

  // Print results
  console.log(`Total checked: ${results.length}`);
  console.log(`✅ Passed: ${results.filter(r => r.passed).length}`);
  console.log(`❌ Failed: ${failures.length}`);

  // If there are failures, save a detailed report
  if (failures.length > 0) {
    console.log('\n⚠️  Failures detected! Creating report...\n');

    const report = {
      timestamp: new Date().toISOString(),
      total_checked: results.length,
      failures_count: failures.length,
      failures: failures
    };

    fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
    console.log('Report saved to: validation-report.json');

    // Print details
    console.log('\n' + '═'.repeat(60));
    console.log('FAILED BUILD DETAILS\n');

    failures.forEach((failure) => {
      console.log(`Build #${failure.build_number}: ${failure.project_name}`);
      console.log(`Repo: ${failure.repo_url}`);
      console.log('Errors:');
      failure.errors.forEach(error => {
        console.log(`  ${error}`);
      });
      console.log();
    });

    // Exit with failure code
    process.exit(1);
  } else {
    console.log('\n✨ All builds passed validation!\n');
    process.exit(0);
  }
}

// Run the validator
main().catch((error) => {
  console.error('Fatal error during validation:', error);
  process.exit(1);
});
