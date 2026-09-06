# Lessons Learned — Sales Dashboard
**Build #3 | Python (data) | Data & Analytics | 2026-06-09**

---

## What Worked Well

- **pandas for data wrangling** made transformations that would have been 50-line loops into one-liners. `groupby`, `pivot_table`, and `resample` covered virtually every aggregation needed.
- **matplotlib for static charts** produced publication-quality visuals with fine-grained control. Bar charts, line charts, and pie charts for regional breakdowns all rendered cleanly.
- **Streamlit for the interactive layer** was a game-changer — turning a static script into a live web dashboard with filters took about 30 minutes of incremental changes. No frontend JavaScript needed.
- **CSV as the primary input format** kept the project accessible: any spreadsheet-literate user can provide data without touching code.

## Challenges Overcome

- **Date parsing inconsistency**: Real-world CSVs came in with `MM/DD/YYYY`, `YYYY-MM-DD`, and `DD-Mon-YY` formats. Fixed with `pd.to_datetime(..., infer_datetime_format=True)` plus an explicit fallback parser.
- **Handling missing/null values**: Sales data had occasional empty `region` or `rep` fields. Established a convention: fill with `"Unknown"` for grouping, but flag them in the report so data quality issues are visible.
- **matplotlib figure memory leaks**: Generating 20+ charts in a loop without `plt.close()` caused memory to balloon. Fixed with `with plt.subplots(...) as (fig, ax):` style and explicit `plt.close(fig)`.
- **Streamlit state vs. compute**: Filtering a large dataset on every widget interaction was slow. Caching the parsed DataFrame with `@st.cache_data` reduced reload time by ~10×.

## Key Insights

- Data cleaning is 80% of the work. Build the cleaning pipeline before writing a single chart.
- pandas' `groupby().agg()` with a dict of named aggregations (`{'sales': 'sum', 'units': 'count'}`) produces much cleaner output than chained calls.
- Streamlit's `st.sidebar` for filters + `st.columns` for layout is a repeatable pattern for any analytics dashboard.

## Next Time

- Use `plotly` instead of `matplotlib` for the Streamlit charts — interactive hover tooltips and zoom are a much better UX in a web context.
- Add a data validation schema (e.g., `pandera`) that runs on CSV load and reports schema violations before they cause mysterious downstream errors.
- Build a proper ETL pipeline: raw CSV → cleaned DataFrame → aggregated metrics → charts. Mixing those concerns in one script made debugging harder.
- Export charts as SVG for crisper rendering in reports.

## Skills Gained

- pandas data manipulation: `groupby`, `pivot_table`, `resample`, `merge`
- matplotlib figure management and subplot layouts
- Streamlit app structure: sidebar controls, columns, caching
- CSV-based ETL patterns and data cleaning best practices

## Integration Points

- Directly consumes CSV exports from **Expense Tracker (Build #1)** — the first deliberate data pipeline between builds.
- The Streamlit dashboard pattern was carried forward into **House Price Predictor (Build #6)**, which also uses Streamlit for its UI.
- The `groupby`-and-aggregate mental model informed the SQL query design in **SQL Analytics Library (Build #24)**.
