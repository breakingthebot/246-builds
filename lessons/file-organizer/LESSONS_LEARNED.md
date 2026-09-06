# Lessons Learned — File Organizer (Folder Organizer)
**Build #4 | Python (automation) | CLI Tools | 2026-06-09**

---

## What Worked Well

- **Standard-library-only (`os`, `shutil`, `pathlib`, `watchdog`-free polling)**: Keeping external dependencies out meant zero install friction. Any machine with Python 3.8+ could run it immediately.
- **File-type rules as a config dictionary**: Instead of hard-coding extensions, using a JSON/YAML config file meant users could customize the sort rules without touching code. Images, documents, archives, videos, audio all mapped to configurable destination folders.
- **Dry-run mode (`--dry-run`)**: Showing exactly what would move before moving it eliminated the fear of using the tool on real Downloads folders. This was the single feature that made it feel trustworthy.
- **Report generation**: Printing a summary of what was moved (and what was skipped) gave users confidence that the tool did what it said.

## Challenges Overcome

- **Race conditions on active downloads**: Files being downloaded by a browser appeared as partial `.tmp` or `.crdownload` files. Added a "minimum file age" check (default: 5 seconds since last modified) to avoid moving in-progress downloads.
- **Collision handling**: What happens when `photo.jpg` already exists in the destination? Implemented auto-rename with a timestamp suffix rather than silently overwriting or erroring.
- **Symlink handling**: Symlinks in the Downloads folder pointed at files elsewhere. Added explicit `os.path.islink()` checks and a `--follow-symlinks` flag rather than blindly moving them.
- **Config file discovery**: Deciding where to look for the config (`./config.json`, `~/.config/file-organizer/config.json`, or passed via `--config`) required implementing a lookup chain.

## Key Insights

- `pathlib.Path` is strictly better than `os.path` for any new Python code — more readable, chainable, and cross-platform.
- Dry-run mode should be built first, not added later. It forces you to separate "what would I do" from "actually do it," which improves the design of the core logic.
- File automation tools need defensive coding: always handle collisions, symlinks, permissions errors, and in-progress files before calling it done.

## Next Time

- Add real file watching with `watchdog` instead of polling — respond to `inotify`/`FSEvents` for true real-time sorting.
- Make rules support regex patterns, not just exact extensions (e.g., match `Screenshot*.png` separately from other PNGs).
- Add undo functionality — keep a log of moves so the last run can be reversed with `--undo`.
- Consider packaging as a launchd/systemd service so it runs automatically on login.

## Skills Gained

- `pathlib` for modern Python file system operations
- Polling-based file watching without external dependencies
- Config file discovery and override patterns
- Defensive programming for real-world file system edge cases

## Integration Points

- The dry-run pattern became a standard for all subsequent automation builds, including **Server Setup Script (Build #22)** which has a full `--dry-run` mode.
- Config file discovery via lookup chain was reused in **Log File Analyzer (Build #17)** for its YAML config.
- The report/summary output pattern is consistent with **Dev Toolkit (Build #7)**.
