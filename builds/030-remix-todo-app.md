# Build 30: Remix Todo App

Full-stack Remix (Vite) todo app with server-side rendering, nested routes, form actions, and optimistic UI.

## Snapshot
- Date Pushed: 2026-07-11
- Technology: Remix
- Category: Web Frontend
- Depth: Deep
- Repo: https://github.com/breakingthebot/remix-todo-build30

## Notes
Nested routes for viewing/editing a single todo, each with its own loader/action and 404 handling. Optimistic UI on toggle/delete via useFetcher on both the list and detail routes. Data layer swapped from a hand-rolled JSON file to SQLite (better-sqlite3) without changing any exported function signatures, so no route or test code needed to change. GitHub Actions CI plus a Playwright smoke test.
