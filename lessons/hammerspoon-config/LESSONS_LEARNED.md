# Lessons Learned — Hammerspoon Config
**Build #23 | Lua | Automation & DevOps | 2026-07-06**

---

## What Worked Well

- **Hammerspoon as a macOS automation platform**: Hammerspoon's Lua scripting with direct access to macOS APIs (window management, application focus, hotkeys, screen geometry) is uniquely powerful. There is no comparable tool for macOS that gives this level of control with this little friction.
- **Window halves/thirds/maximize/center hotkeys**: The core window tiling features (left half, right half, top-left quarter, maximize, center) covered 90% of daily window management needs. Mapping them to a dedicated `Hyper` key (Caps Lock remapped) kept them out of the way of application shortcuts.
- **Multi-monitor-aware window management**: Moving windows to the next/previous screen while preserving their proportional size (a 50% window on a 4K monitor stays 50% on a 1440p monitor) required calculating the size as a fraction of the source screen and applying it to the destination screen frame.
- **App focus/launch/hide toggle**: `hs.application.find(name) or hs.application.open(name)` with a toggle to hide/show gave single-key access to any application — faster than Cmd+Tab for frequently used apps.
- **GitHub Actions CI for the Lua test suite**: Running the Hammerspoon Lua tests in CI caught regressions when refactoring the window geometry functions.

## Challenges Overcome

- **Screen coordinate systems**: macOS has multiple coordinate systems — `NSScreen` uses bottom-left origin (Cocoa), but Hammerspoon's `hs.screen` API uses top-left origin. Getting window placement right near screen edges required understanding which coordinate system each function used.
- **Different-resolution monitor math**: The proportional resize across screens sounds simple but has edge cases: a maximized window on one screen should become maximized on the other, not proportionally-resized (which would be smaller). Added a "maximize" flag check.
- **Hammerspoon reload on config change**: Using `hs.pathwatcher.new(CONFIG_PATH, hs.reload)` to auto-reload the config when the file changes made development much faster — no manual `Console → Reload Config` needed.
- **Lua test infrastructure**: Hammerspoon's built-in testing is minimal. Used `busted` (a Lua test framework) for unit testing the geometry calculations in isolation, with mocked `hs.screen` and `hs.window` objects.

## Key Insights

- Hammerspoon's `hs.hotkey.bind({mods}, key, fn)` with a callback is the foundation of all automation — once you have this pattern, every other feature is just "what does this hotkey do?"
- Window geometry in a multi-monitor setup is a coordinate geometry problem. Draw it out on paper before writing code.
- Lua is a small, clean language with a few surprising conventions (1-based indexing, `~=` for not-equal) that become natural quickly. It's well-suited for configuration scripting.

## Next Time

- Add a "window grid" mode like Moom/Magnet where the user can drag to choose a grid position.
- Add application-specific window placement rules (e.g., "when Spotify opens, move it to the secondary monitor").
- Add a menu bar icon that shows the current window layout preset.
- Explore using Hammerspoon with Karabiner-Elements for even more powerful keyboard remapping.

## Skills Gained

- Lua: tables, closures, metatables, module system
- Hammerspoon API: `hs.window`, `hs.screen`, `hs.hotkey`, `hs.application`, `hs.pathwatcher`
- Multi-monitor coordinate system math
- macOS window management concepts (frames, screens, focus)
- `busted` Lua testing framework with mocking

## Integration Points

- The automation mindset from this build connects to **Server Setup Script (Build #22)** — both are about reducing repetitive manual work through scripting.
- The config auto-reload pattern (watch file, reload on change) is the macOS equivalent of the file watching in **File Organizer (Build #4)**.
- Hotkey binding patterns are directly applicable to any Hammerspoon-based macOS automation workflow.
