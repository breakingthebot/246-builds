# Lessons Learned — Kanban Board (Vanilla JS)
**Build #9 | Vanilla JS | Web Frontend | 2026-06-19**

---

## What Worked Well

- **No dependencies**: Building a fully-featured Kanban board with zero npm packages — drag-and-drop, labels, due dates, undo/redo, localStorage persistence — proved that vanilla JS is more capable than developers give it credit for. The bundle size is effectively zero.
- **HTML5 Drag and Drop API**: The native DnD API (`dragstart`, `dragover`, `drop`, `dragend`) handled card movement between columns without any library. The key insight was using `event.dataTransfer` to pass the card ID and implementing visual feedback with CSS `:is(.dragging)`.
- **Command pattern for undo/redo**: Modeling every state mutation as a `Command` object with `execute()` and `undo()` methods, stored in a history stack, made the undo/redo feature clean and generic. Any future operation just needs to implement the two methods.
- **Accessibility-tested E2E coverage**: Running Playwright tests that also checked ARIA attributes and keyboard navigation found real bugs that manual visual testing missed.

## Challenges Overcome

- **Drag-and-drop insertion order**: Determining where to insert a card when dragging (between existing cards, not just onto a column) required tracking `dragover` events on individual cards and comparing mouse Y position to card midpoint.
- **`localStorage` serialization of complex state**: Cards have labels (arrays), due dates, descriptions, and ordering. Established a canonical serialization format and explicit migration logic for when the schema changed.
- **Undo across async operations**: When the board auto-saves to localStorage on every mutation, an undone action needs to also revert the storage. The Command pattern made this natural — `undo()` reverted both memory state and persisted state.
- **CSS z-index and the dragging ghost**: The browser's drag ghost image didn't look right with modern card shadows. Used `event.dataTransfer.setDragImage()` with a custom cloned element for a better UX.

## Key Insights

- The HTML5 DnD API has many browser inconsistencies but is sufficient for most use cases. The main gotcha: `dragover` must call `event.preventDefault()` or `drop` never fires.
- Vanilla JS forces you to understand the DOM, events, and state management deeply. React/Vue abstract these away — sometimes usefully, sometimes at the cost of understanding.
- The Command pattern is one of the most practical design patterns for UI applications. Any feature that needs undo/redo benefits from it.

## Next Time

- Add board sharing via a URL-encoded state hash or a backend (even a simple JSON storage API).
- Implement swim lanes for a more professional Kanban layout.
- Add keyboard shortcuts for moving cards between columns (for accessibility and power users).
- Consider using the Pointer Events API instead of DnD for better mobile support.

## Skills Gained

- HTML5 Drag and Drop API in depth
- Command pattern for undo/redo
- `localStorage` state management with schema versioning
- Playwright E2E testing for DOM interactions
- CSS custom properties for themeable UI components

## Integration Points

- The command pattern undo/redo was reused in **Typed Task Manager (Build #10)** for task history.
- The `localStorage` serialization strategy carried forward to **Music Player (Build #11)** for favorites persistence.
- The Playwright E2E testing setup became the model for **GitHub Profile Viewer (Build #12)**.
