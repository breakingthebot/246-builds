# Lessons Learned — Expense Tracker
**Build #1 | Python (Core) | CLI Tools | 2026-06-06**

---

## What Worked Well

- **Standard-library-only constraint** was the right call for a first build. Relying solely on Python builtins (`csv`, `json`, `datetime`, `os`) forced a deep understanding of the language without the crutch of third-party packages. Every problem had to be solved "the hard way" first.
- **CSV as storage** kept the data human-readable and editable outside the app — useful for debugging and for users who want to open their data in Excel.
- **Recurring templates** were a surprisingly high-value feature for minimal effort. Defining a template once and applying it monthly saved real repetitive data entry.
- **Monthly report generation** gave the project a clear "so what" — it turned raw transaction data into something actually useful.

## Challenges Overcome

- **Date arithmetic without `dateutil`**: Calculating month boundaries and recurring dates using only `datetime` required careful handling of month rollovers (e.g., January 31 → February 28). Solved by normalizing to the first of each month for comparison.
- **Budget enforcement logic**: Deciding when to warn vs. when to block required iterating on the UX. Ended up with soft warnings at 80% and a confirmation prompt at 100% — a pattern worth reusing.
- **CSV escaping edge cases**: Category names with commas required proper `csv.writer` usage; hand-rolling string splits would have broken silently.

## Key Insights

- The MVP for any personal finance tool is: add transaction → see balance → see monthly summary. Everything else is enhancement.
- A well-designed data model (category, amount, date, note, is_recurring) pays off immediately when building reports.
- Python's `csv` module handles quoting and escaping automatically — never manipulate CSV with string splits.

## Next Time

- Add a SQLite backend from the start. CSV is fine for export but painful as a primary store once you need queries (e.g., "all food expenses in Q1").
- Implement a proper config file (`~/.config/expense-tracker/config.json`) instead of hardcoded paths.
- Add budget carryover — unused budget in one month rolling into the next is a common real-world need.
- Consider a `Rich`-based TUI for better readability in the terminal.

## Skills Gained

- Deep familiarity with Python's `csv`, `datetime`, and `os.path` modules
- CLI argument parsing patterns with `argparse`
- Designing a data schema that supports future querying
- Writing a file-based persistence layer from scratch

## Integration Points

- The CSV export format designed here was reused as the input format for **Sales-Dashboard (Build #3)** — a direct data pipeline between two projects.
- Budget category design informed the category system in **Budget Tracker Console App (Build #19)**, though that build moved to a proper .NET data layer.
- The recurring template concept maps directly to subscription tracking, a feature explored in later builds.
