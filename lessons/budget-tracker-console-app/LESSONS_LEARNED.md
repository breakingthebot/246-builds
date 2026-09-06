# Lessons Learned — Budget Tracker Console App
**Build #19 | C# (.NET 8) | Desktop & Console Apps | 2026-07-02**

---

## What Worked Well

- **.NET 8 console app with top-level statements**: Modern C# with `Program.cs` using top-level statements and `global using` directives removed most of the boilerplate from earlier .NET versions. The result felt closer to Python in brevity while keeping C#'s type safety.
- **Category system with budgets**: Assigning monthly budget limits per category and tracking actual spending against them gave the app real value beyond a simple ledger. The "budget remaining" view made overspending visible at a glance.
- **Monthly reports**: Grouping transactions by month and computing totals, category breakdowns, and budget adherence percentages produced genuinely useful output for personal finance tracking.
- **CSV export**: Exporting all transactions to a well-formatted CSV with headers made the data portable to Excel, Google Sheets, and other tools — an important interoperability decision.
- **`System.Text.Json` for persistence**: Using the built-in JSON serializer (no NuGet packages needed) for saving/loading the transaction database kept the project dependency-light.

## Challenges Overcome

- **Decimal arithmetic for money**: Using `double` for currency amounts caused classic floating-point issues (`99.99 + 0.01 != 100.00`). Switched all financial calculations to `decimal` — C#'s `decimal` type is specifically designed for base-10 arithmetic.
- **Recurring transaction templates**: A recurring entry (e.g., monthly rent) needed to be applied once per month automatically. Detecting "has this template been applied this month?" required comparing `DateOnly` values for the current month's year + month.
- **Console menu state management**: A complex nested menu (Main → Categories → Add/Edit/Delete) with back navigation required a proper state machine rather than nested while loops. Modeling each screen as an enum state with a transition function made the code maintainable.
- **CSV quoting edge cases**: Category names with commas (e.g., "Food, Dining") needed proper CSV quoting. Used `CsvHelper` (a NuGet package) rather than hand-rolling CSV escaping.

## Key Insights

- Always use `decimal` (not `double` or `float`) for any financial calculation in any language. Floating-point arithmetic is fundamentally incompatible with accurate money math.
- A state machine for console menu navigation is always better than deeply nested loops. Model screens as states, transitions as inputs.
- .NET 8's `DateOnly` and `TimeOnly` types are cleaner than `DateTime` for date-only or time-only concepts — they make the intent explicit.

## Next Time

- Add a proper data access layer (even a repository pattern over SQLite via `Microsoft.Data.Sqlite`) instead of a JSON flat file.
- Add a web API frontend (ASP.NET Core minimal API) so the budget can be accessed from a browser.
- Implement a proper notification system for when spending approaches budget limits.
- Add xUnit tests with `Moq` for the service layer.

## Skills Gained

- C# (.NET 8): top-level statements, records, pattern matching, LINQ
- `decimal` type for financial arithmetic
- `System.Text.Json` serialization/deserialization
- .NET `DateOnly`/`TimeOnly` types
- Console state machine design

## Integration Points

- The `decimal` money arithmetic lesson was retroactively the right approach for **Expense Tracker (Build #1)** as well — Python's `Decimal` module was used there.
- The monthly reporting structure is directly comparable to **Sales Dashboard (Build #3)**'s time-based grouping.
- CSV export format is compatible with the import format expected by **Expense Tracker (Build #1)** — a planned data pipeline.
