# Lessons Learned — GitHub Dashboard (TanStack Query)
**Build #28 | TanStack Query / React | Web Frontend | 2026-07-08**

---

## What Worked Well

- **TanStack Query (`useQuery`) for every fetch**: Replacing hand-rolled `useEffect + useState + fetch` patterns with `useQuery` gave real caching, automatic background refetching, distinct `isLoading` vs. `isFetching` states, and structured error handling — essentially for free. The shift in mental model from "when do I fetch?" to "what data do I need?" was significant.
- **Reading GitHub's `Link` response header for real pagination**: Instead of guessing page count or making an extra API call for the total, parsing the `Link: <url>; rel="next", <url>; rel="last"` header extracted the real total page count directly from GitHub's response. More accurate and one fewer API call.
- **Parallel queries for the repo detail view**: The repo detail route fires three independent `useQuery` calls simultaneously — repo details, languages, and recent commits. Because they're parallel, one slow or failed query never blocks the other two from rendering. This was the TanStack Query feature that most changed how I thought about data fetching.
- **React Router deep link handling with Vercel**: The `vercel.json` SPA rewrite rule (`"rewrites": [{"source": "/(.*)", "destination": "/"}]`) ensured that deep-linked detail routes (e.g., `/repo/my-project`) worked after a page refresh — a lesson carried directly from **Portfolio Site (Build #26)**.
- **Distinct loading vs. refetching states**: `isLoading` (first load, no cached data) vs. `isFetching` (background refresh with stale data shown) enabled subtle UX improvements — a spinner overlay during background refresh rather than replacing the entire page with a loading skeleton.

## Challenges Overcome

- **GitHub API rate limiting (60 req/hour unauthenticated)**: Three parallel queries per repo detail view consumed rate limit quickly during development. Added a `staleTime: 5 * 60 * 1000` (5-minute cache) so navigating away and back didn't re-fetch. In production, added a PAT input for authenticated users (5000 req/hour).
- **`Link` header parsing**: The header format (`<url>; rel="next", <url>; rel="last"`) required a regex-based parser. This was the second time building this parser (first in **GitHub Profile Viewer, Build #12**) — extracted it as a utility this time.
- **Error boundary integration**: TanStack Query's `useQuery` error state integrates cleanly with React error boundaries. Setting `throwOnError: true` on queries that should hard-fail (vs. gracefully degrade) let the error boundary catch them.
- **Query key design**: TanStack Query uses query keys for cache identity. Using `['repo', owner, name]` as a key meant navigating between repos correctly invalidated/updated the cache without manual cache management.

## Key Insights

- TanStack Query is not just a data fetching library — it's a server state management solution. The mental model shift ("the UI is a function of server state" vs. "I fetch data and store it in `useState`") is the core insight.
- Query keys are the most important design decision in a TanStack Query app. A well-designed key hierarchy (`['repos', username]`, `['repo', owner, name, 'languages']`) makes cache invalidation and prefetching natural.
- Parallel queries for independent data sources is always the right pattern. Never serialize requests that don't depend on each other.

## Next Time

- Add `useMutation` for any write operations (starring a repo, adding a comment) — the other half of TanStack Query's feature set.
- Add `useInfiniteQuery` for the repo list to replace manual pagination with infinite scroll.
- Add query prefetching (`queryClient.prefetchQuery`) on hover over repo links to make navigation feel instant.
- Add Storybook for UI component development and visual regression testing.

## Skills Gained

- TanStack Query: `useQuery`, `useQueries`, query keys, `staleTime`, `gcTime`, error states
- React Router v6: nested routes, `useParams`, `Outlet`
- GitHub REST API: pagination via `Link` header, parallel endpoint calls
- React error boundary integration with TanStack Query
- Vercel deployment configuration for SPAs

## Integration Points

- The direct evolution of **GitHub Profile Viewer (Build #12)** — same GitHub API, same pages, but fully rewritten with TanStack Query replacing all `useEffect` fetch logic.
- The `Link` header parser utility should be shared between this build and **GitHub Profile Viewer (Build #12)** — both rediscovered it independently.
- The parallel queries pattern is the natural next step after the `asyncio.gather()` parallelism in **Async News Aggregator (Build #2)** — same concept, React context.
- The Vercel SPA rewrite was carried over directly from **Portfolio Site (Build #26)**.
