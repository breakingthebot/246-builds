# Lessons Learned — Music Player (ES Modules)
**Build #11 | ES Modules | Web Frontend | 2026-06-26**

---

## What Worked Well

- **No bundler (native ES modules)**: Using `<script type="module">` and `import`/`export` without Webpack, Vite, or any build tool showed that modern browsers handle module graphs natively. For a project of this scope, the zero-config approach was the right call.
- **Web Audio API for playback control**: Using the Web Audio API (rather than just an `<audio>` element) enabled visualizer functionality and per-track gain normalization — features that aren't possible with a raw `<audio>` tag alone.
- **Queue, shuffle, and repeat modes**: Implementing these as state in a `PlayerState` object with explicit transitions kept the logic centralized and testable. Shuffle used a seeded Fisher-Yates implementation.
- **Local file import via `<input type="file">` + File API**: Letting users load their own audio files without a server or upload step was a key UX win. The File API (including `URL.createObjectURL`) handled this entirely client-side.
- **CI/E2E coverage with Playwright**: Automated tests for play/pause, next/previous, shuffle, and favorites gave confidence during refactors.

## Challenges Overcome

- **ES module loading order**: With native ES modules, the browser parses the full module graph before executing. Circular dependencies that would work in bundled code caused silent failures. Had to audit and break all import cycles.
- **`AudioContext` requires user gesture**: The Web Audio API's `AudioContext` cannot be created until a user interaction (click). The autoplay guard caused confusing failures in tests — solved with a "resume on first interaction" pattern and test helpers that trigger synthetic clicks.
- **Cross-browser `<input type="file" accept="audio/*">` behavior**: Safari's file picker didn't respect the `accept` attribute reliably. Added client-side MIME type validation as a fallback.
- **Favorites persistence across page loads**: `localStorage.setItem('favorites', JSON.stringify(ids))` worked, but the deserialized array needed to be compared against the current queue which might have different `File` objects (since `File` objects are ephemeral). Used filename + size as a fingerprint.

## Key Insights

- Native ES modules are production-viable for single-page apps without build tools — but only if you're disciplined about dependency graph management.
- The Web Audio API is more powerful than most developers realize. Gain nodes, analyser nodes, and audio routing open up features that `<audio>` can never provide.
- File-based state (ephemeral `File` objects from `<input>`) cannot be persisted directly — you need fingerprinting or re-import prompts.

## Next Time

- Add `MediaSession` API integration so the OS/browser media controls (lock screen, keyboard media keys) work with the player.
- Implement a proper audio visualizer using `AnalyserNode` + `requestAnimationFrame`.
- Add crossfade between tracks using the Web Audio API's gain ramp.
- Consider moving to a bundler (Vite) if the module count grows beyond ~20 files — native modules have latency costs at scale.

## Skills Gained

- Native ES module system: `import`/`export`, dynamic `import()`, module loading order
- Web Audio API: `AudioContext`, source nodes, gain nodes
- File API: `FileReader`, `URL.createObjectURL`, MIME type validation
- Fisher-Yates shuffle with seed for reproducible test states
- Playwright testing for media element interactions

## Integration Points

- The no-bundler approach informed the architecture of **Kanban Board (Build #9)** and **GitHub Profile Viewer (Build #12)**.
- `localStorage` favorites fingerprinting approach was a precursor to the persistence strategy in **Typed Task Manager (Build #10)**.
- Web Audio API experience connects to potential visualizer features in future frontend builds.
