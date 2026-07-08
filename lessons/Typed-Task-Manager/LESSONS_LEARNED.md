# Lessons Learned — Typed Task Manager
**Build #10 | TypeScript | Web Frontend | 2026-06-20**

---

## What Worked Well

- **Strict TypeScript (`"strict": true`)**: Enabling all strict mode checks from day one caught real bugs during development — `null` dereferences, wrong function signatures, and missing properties that would have been silent runtime errors in plain JS. The upfront investment in type annotations paid dividends immediately.
- **Status-grouped views**: Organizing tasks into `Todo`, `In Progress`, `Done`, and `Blocked` columns (rather than a flat list) made the board scan much more naturally. This also drove a clean discriminated union type: `type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked'`.
- **Import/export (JSON)**: Letting users export their full task state as typed JSON and re-import it made the app feel trustworthy. It also served as an accidental backup format.
- **Backup history**: Keeping the last 5 auto-backups in `localStorage` with timestamps gave users a safety net, and it surfaced the need for a storage quota check.
- **Bulk actions**: `selectAll`, `bulkComplete`, `bulkDelete` made the UI practical for power users. These were straightforward to implement once the type system was established.

## Challenges Overcome

- **TypeScript generics for the store**: Building a generic `Store<T>` class that could be typed as `Store<Task>` vs. `Store<Project>` without code duplication required learning TypeScript generics in depth.
- **`localStorage` type safety**: `JSON.parse()` returns `any`. Added a generic `parseJSON<T>(raw: string): T | null` helper with a Zod schema for runtime validation.
- **Browser test isolation**: Each test needed a fresh `localStorage`. Used `beforeEach(() => localStorage.clear())` and abstracted it into a test helper.
- **Type narrowing for discriminated unions**: Writing functions that handled all task statuses required `switch` + `default: assertUnreachable(status)` — a TypeScript exhaustiveness check that catches unhandled cases at compile time.

## Key Insights

- TypeScript's type system is most valuable at the data model layer — getting the types right for `Task`, `Filter`, and `Sort` ripples out to make the entire codebase safer.
- `unknown` is better than `any` for parsed data. Cast to `unknown` first, then validate, never directly to a specific type.
- Strict TypeScript in a solo project feels like overhead until the first time it catches a bug that would have shipped. Then it feels essential.

## Next Time

- Use `zod` for runtime schema validation on all `localStorage` reads and import operations.
- Add a proper state management layer (Zustand or Redux Toolkit) instead of a hand-rolled store — the patterns converge on the same shape anyway.
- Add keyboard shortcuts and a command palette for power-user workflows.
- Consider a backend (even a simple SQLite API) so tasks persist across devices.

## Skills Gained

- TypeScript strict mode and its practical implications
- Discriminated unions and exhaustiveness checking
- Generic TypeScript classes and utility types (`Partial<T>`, `Pick<T>`, `Omit<T>`)
- Runtime type validation patterns
- Browser test automation with DOM manipulation

## Integration Points

- The discriminated union pattern for task status was the conceptual foundation for the Kanban board columns in **Kanban Board (Build #9)**.
- Strict TypeScript lessons directly informed the type system design in the **GitHub Dashboard (Build #28)**.
- The generic `Store<T>` pattern influenced state management thinking going into **React Zustand Shopping Cart (Build #27)**.
