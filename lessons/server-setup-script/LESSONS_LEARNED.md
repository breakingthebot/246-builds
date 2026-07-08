# Lessons Learned — Server Setup Script
**Build #22 | Shell (Bash) | Automation & DevOps | 2026-07-05**

---

## What Worked Well

- **Package-manager-agnostic dependency install**: Detecting the OS and package manager (`apt`, `yum`, `brew`, `apk`) at runtime and routing to the correct install command made the script usable on Ubuntu, CentOS, macOS, and Alpine without separate versions.
- **`env.conf` templating**: Generating environment configuration files from templates with variable substitution (`sed`-based `{{VAR}}` replacement) gave infrastructure-as-code properties to the setup process.
- **Dry-run mode (`--dry-run`)**: Printing exactly what would be executed without doing it was essential for reviewing scripts before running them on production servers. This was built first.
- **Systemd service generator**: Templating a `.service` file from script parameters (name, description, user, working directory, exec command) and `systemctl enable/start` it programmatically saved significant manual work.
- **Fail-safe rollback with diagnostic archiving**: On any failure, the script captured the system state (installed packages, running services, environment variables) into a timestamped tarball for post-mortem analysis, then rolled back changes. This turned a potentially destructive script into a recoverable one.
- **Slack/Discord webhook notifications**: Posting setup success/failure to a webhook URL with a curl command (configurable in the env file) made unattended runs observable.

## Challenges Overcome

- **Idempotency**: Running the script twice should produce the same result as running it once. Every install command needed a pre-check (`command -v nginx` before installing nginx). Every file write needed to be idempotent (create if not exists, or overwrite with the same content).
- **Error handling with `set -euo pipefail`**: Enabling strict error mode (`-e` for exit on error, `-u` for undefined variable errors, `-o pipefail` for pipe failure detection) revealed several implicit failures that had been silently ignored. Each one had to be explicitly handled.
- **Quoting in shell**: Word splitting and glob expansion in shell is a constant source of bugs. Learned to always double-quote variables (`"$VAR"`, not `$VAR`) and use `[[ ]]` instead of `[ ]` for conditionals.
- **Rollback scope**: Deciding what to roll back on failure was hard. Adopted a conservative approach: only undo what the current script run started (tracked with a `INSTALLED_PACKAGES` array), not pre-existing state.

## Key Insights

- `set -euo pipefail` at the top of every Bash script is mandatory. Without it, errors are silently swallowed and the script continues in an inconsistent state.
- Idempotency is the most important property of an infrastructure script. Test it by running the script twice on the same machine.
- Shell quoting is non-negotiable. Use `shellcheck` to catch quoting bugs — it found ~15 issues in the first pass.

## Next Time

- Rewrite as an Ansible playbook for more robust idempotency, error handling, and cross-platform support.
- Add a `--verify` mode that checks an already-configured server matches the expected state without making changes.
- Add BATS (Bash Automated Testing System) tests for the core functions.
- Use `envsubst` instead of a custom `sed` template engine for environment variable substitution.

## Skills Gained

- Bash: `set -euo pipefail`, arrays, functions, error trapping, `trap ERR`
- Idempotency patterns for infrastructure scripts
- `shellcheck` for static analysis of shell scripts
- Systemd service file structure and `systemctl` management
- Webhook integration via `curl`

## Integration Points

- Dry-run mode from **File Organizer (Build #4)** was the direct precedent, now formalized as a standard flag.
- The webhook notification pattern is directly reusable in any CI/CD pipeline or monitoring script.
- Rollback + diagnostic archiving is the same concept as the error recovery in the **Chat Server (Build #5)** connection handling — fail gracefully and log state.
