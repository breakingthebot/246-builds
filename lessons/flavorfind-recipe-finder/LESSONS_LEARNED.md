# Lessons Learned — FlavorFind Recipe Finder
**Build #25 | React | Web Frontend | 2026-07-07**

---

## What Worked Well

- **Ingredient-based search**: The core feature — "what can I make with chicken, garlic, and lemon?" — was immediately useful and differentiated from a simple recipe browser. Matching recipes against user-provided ingredients with a "missing ingredients" count was the right scoring approach.
- **Dietary restriction filters**: Multi-select filters (vegetarian, vegan, gluten-free, dairy-free) that reduced the recipe list in real-time made the app practical for households with mixed dietary needs.
- **Custom recipe CRUD with `localStorage`**: Letting users add their own recipes alongside the built-in catalog, stored in `localStorage`, gave the app personal value. The `localStorage`-backed CRUD used the same interface as the built-in data, keeping the rendering code unified.
- **Cook mode with step timers**: A full-screen cook mode that presented one step at a time, with per-step timer support (regex-parsed from step text: "cook for 10 minutes"), eliminated the constant scrolling that plagues recipe apps.
- **Shopping list aggregator**: Collecting ingredients across multiple selected recipes, normalizing units (`2 cups + 1 cup = 3 cups`), and merging duplicates into a single printable list was the most technically complex feature and the most practically useful.

## Challenges Overcome

- **Unit normalization in the shopping list**: Recipes use inconsistent unit formats (`1 cup`, `250ml`, `1/2 tablespoon`, `a pinch of`). Implemented a unit conversion table (cups → ml, tablespoons → teaspoons, etc.) and fraction parsing. Edge cases (non-metric units, ambiguous quantities) were handled with a "keep as-is" fallback.
- **Regex-based timer extraction from step text**: Parsing "simmer for 15-20 minutes" or "bake for 1 hour 30 minutes" required a multi-pattern regex that extracted value ranges and unit conversions. Used the lower bound of ranges for timer defaults.
- **`localStorage` quota and large recipe images**: Storing custom recipes with base64-encoded images in `localStorage` hit the 5MB quota quickly. Implemented image compression on upload using a `canvas.toDataURL('image/jpeg', 0.7)` pipeline, then switched to URL references for external images.
- **Search performance on client-side data**: Filtering 1000+ recipes on every keystroke with ingredient matching was noticeably slow. Added debouncing and moved the filter computation to a `useMemo` with proper dependencies.

## Key Insights

- `useMemo` is not premature optimization — for expensive computations (filtering large lists) that depend on specific state values, it's the correct tool. Profiling before and after confirmed a ~10× reduction in re-computation.
- Unit normalization is a rabbit hole. Define the scope early (handle the common cases, fallback gracefully) or you'll spend days on edge cases that affect 0.1% of recipes.
- `localStorage` has a 5MB limit. For any feature that stores user-generated content (especially with images), either compress aggressively or use IndexedDB / a backend.

## Next Time

- Use a real recipe API (Spoonacular, Edamam) for the built-in catalog instead of a static JSON file.
- Move user recipe storage to IndexedDB (via `idb`) for larger storage and better query performance.
- Add meal planning (select recipes for each day of the week) as the natural next feature beyond shopping lists.
- Add nutrition information per recipe using macro data from the recipe API.

## Skills Gained

- React: `useMemo`, `useCallback`, component composition, controlled inputs
- Regex for structured text extraction (timer parsing)
- Unit conversion and normalization algorithms
- `localStorage` size management and canvas-based image compression
- Cook mode UX: full-screen single-step presentation

## Integration Points

- The `slugify` utility from **String Utils (Build #13)** was used for recipe URL slugs.
- The ingredient search scoring algorithm (partial match with "missing ingredients" count) is the same concept as search ranking in **GitHub Profile Viewer (Build #12)**.
- Shopping list aggregation with unit normalization is a mini ETL pipeline — the same thinking as **Sales Dashboard (Build #3)**.
