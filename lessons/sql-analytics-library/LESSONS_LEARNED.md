# Lessons Learned — SQL Analytics Query Library
**Build #24 | Python (SQL) | Data & Analytics | 2026-07-06**

---

## What Worked Well

- **20 analytical SQL queries as a structured library**: Organizing queries by category (customer analytics, product performance, cohort analysis, geographic breakdowns) with documentation made the library genuinely useful as a reference — not just runnable code but a learning resource.
- **High-fidelity data generator**: A mock e-commerce database with realistic distributions (VIP customers, bulk discounts, seasonal patterns, inventory restock events) made the analytical queries return interesting, non-trivial results. Fake data that looks real makes analytics education meaningful.
- **Query benchmarking/profiler**: Wrapping each query in a timer and exposing `EXPLAIN QUERY PLAN` output made performance characteristics visible. Seeing that a query with a missing index did a full table scan vs. an indexed scan was immediately educational.
- **Interactive SQL REPL**: An interactive shell where you could type `run cohort_analysis` or `run top_customers --month 2024-01` and see results immediately made the library exploratory and fun.
- **HTML portfolio dashboard**: Generating a static HTML report with all 20 query results and their visualizations in one page was a professional deliverable that demonstrated the work.

## Challenges Overcome

- **Window functions in SQLite**: SQLite supports window functions (`ROW_NUMBER()`, `RANK()`, `LAG()`, `LEAD()`, running totals with `SUM() OVER`) since version 3.25. Confirming the SQLite version before using them was necessary.
- **Cohort retention analysis in SQL**: A cohort retention matrix (% of users from month X who were active in month X+N) required a self-join on the orders table with date arithmetic — the most complex query in the library. Building it incrementally with CTEs made it debuggable.
- **Data generator realism**: Making the generated data return non-trivial query results required domain modeling: VIP customers needed to spend 3× the average, seasonal products needed monthly multipliers, and churn needed to follow a realistic survival curve.
- **REPL state management**: The interactive REPL needed persistent connection state (open DB handle), command history (via `readline`), and graceful `Ctrl+C` handling — each required explicit implementation.

## Key Insights

- CTEs (Common Table Expressions) are the key to readable complex SQL. Any query longer than ~15 lines benefits from being broken into named CTEs.
- `EXPLAIN QUERY PLAN` is the most valuable tool for SQL performance debugging. Run it before and after adding an index to see the impact.
- Window functions (`ROW_NUMBER()`, running totals, LAG/LEAD for period-over-period comparisons) unlock analytical SQL patterns that would otherwise require multiple queries or application-level computation.

## Next Time

- Port to PostgreSQL with `psycopg2` to access more advanced window functions and `LATERAL JOIN`.
- Add query parameter binding as a first-class feature so queries can be parameterized without string formatting.
- Generate the HTML dashboard with actual charts (using `plotly` or `Chart.js`) not just tables.
- Add a query dependency graph so running `full_report` auto-runs all prerequisite queries.

## Skills Gained

- Advanced SQL: window functions, CTEs, cohort analysis, self-joins, subqueries
- SQLite Python integration with `sqlite3` module
- Query performance analysis with `EXPLAIN QUERY PLAN`
- Data generation with statistical distributions
- Python REPL implementation with `readline` history

## Integration Points

- SQL query patterns from this build are directly applicable to the analytics data in the **286-builds dashboard**.
- The data generator's realistic distribution modeling connects to the ML training data considerations in **House Price Predictor (Build #6)**.
- The Click-based CLI REPL design was adapted from **Dev Toolkit (Build #7)**.
